-- ============================================================
-- « je corrige ma fiche » : évaluer auth.uid() UNE fois
--
-- L'analyseur de Supabase relevait, seul avertissement de
-- performance qui soit un vrai défaut :
--
--   Table public.profils has a row level security policy
--   « je corrige ma fiche » that re-evaluates auth.<function>()
--   for each row.
--
-- Écrit « compte_id = auth.uid() », PostgreSQL considère l'appel
-- comme dépendant de la ligne et le REJOUE pour chacune. Enveloppé
-- dans un sous-select, il devient un InitPlan : évalué une fois,
-- puis comparé. Le résultat est identique — auth.uid() ne dépend
-- d'aucune colonne — mais le travail est divisé par le nombre de
-- lignes examinées.
--
-- Toutes les autres règles passent déjà par prive.mon_role(), qui
-- est STABLE et déjà évaluée une fois ; celle-ci était la seule
-- écrite à la main, et la seule signalée. Vérifié par requête sur
-- pg_policies avant d'écrire ce fichier : aucune autre ne contient
-- auth.uid() nu.
--
-- Ce que cette migration NE fait PAS, et c'est délibéré
-- ----------------------------------------------------
-- L'analyseur signale aussi seize « multiple permissive policies » :
-- une table porte à la fois « les membres voient » et
-- « l'administration gère ». Les fondre en une seule règle avec un
-- OU les ferait disparaître de la liste.
--
-- Je ne le fais pas. Ce qui protège les données des mineurs ici,
-- c'est qu'une règle d'accès se LISE : « vie privée réservée » et
-- « l'administration tient la vie privée » se relisent séparément,
-- et l'on voit du premier coup d'œil qui obtient quoi. Fondues, il
-- faudrait démêler une condition composée pour répondre à la même
-- question. Le coût mesuré est une seconde évaluation sur des
-- tables de quelques dizaines de lignes ; le coût de l'autre choix
-- est une règle qu'on n'audite plus. Ce n'est pas un bon échange.
--
-- Et les neuf « clés étrangères sans index » restent aussi. Le club
-- compte soixante-quatre membres. L'analyseur signale d'ailleurs,
-- dans le même souffle, que CINQ des index déjà posés n'ont jamais
-- servi — la meilleure preuve que ces tables ne sont pas de taille
-- à en réclamer d'autres. On les posera le jour où une requête est
-- lente, sur la mesure, pas sur la crainte.
-- ============================================================

drop policy if exists "je corrige ma fiche" on public.profils;

create policy "je corrige ma fiche"
  on public.profils
  for update
  to authenticated
  using (compte_id = (select auth.uid()))
  with check (compte_id = (select auth.uid()));
