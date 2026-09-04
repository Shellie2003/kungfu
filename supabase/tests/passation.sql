-- ============================================================
-- passation.sql — « La base du club est-elle correctement montée ? »
--
-- À COLLER DANS L'ÉDITEUR SQL DU TABLEAU DE BORD SUPABASE, sur le
-- projet du club, APRÈS avoir appliqué les migrations et déployé les
-- deux fonctions.
--
-- ------------------------------------------------------------
-- POURQUOI CE SCRIPT PLUTÔT QU'UNE LISTE À COCHER
--
-- Une liste à cocher se coche de mémoire. Celui qui monte le projet
-- est le même que celui qui vérifie, un vendredi soir, et « oui oui,
-- les règles d'accès sont là » se dit très facilement.
--
-- Ce script ne demande rien à personne : il interroge la base et
-- rend une ligne par contrôle, avec « OK » ou « ✗ ». Il ne MODIFIE
-- rien — on peut le lancer autant de fois qu'on veut, y compris sur
-- une base en service.
--
-- Ce qu'il ne peut pas voir, et qui reste à faire à la main, est
-- listé à la fin par le contrôle « à faire dans le tableau de bord ».
-- ============================================================
with controles as (

  -- ---- 1. Le schéma est-il là en entier ? ----
  select 1 as n, 'Les tables' as quoi,
         (select count(*) from pg_tables where schemaname = 'public')::text || ' tables' as mesure,
         (select count(*) from pg_tables where schemaname = 'public') >= 20 as ok,
         'Les 25 migrations doivent avoir été appliquées, dans l''ordre.' as sinon

  -- ---- 2. LE POINT LE PLUS IMPORTANT DE TOUTE LA BASE ----
  --
  -- La clé publiable voyage dans l'APK de chaque membre : elle est
  -- PUBLIQUE par construction. Ce qui protège les données du club,
  -- ce n'est donc pas le secret de cette clé, c'est la sécurité au
  -- niveau des lignes. Une seule table sans elle, et tout son contenu
  -- est lisible par n'importe qui possède l'application.
  union all
  select 2, 'Sécurité au niveau des lignes',
         case when (select count(*) from pg_tables
                     where schemaname = 'public' and not rowsecurity) = 0
              then 'active sur toutes les tables'
              else (select string_agg(tablename, ', ') from pg_tables
                     where schemaname = 'public' and not rowsecurity) || ' SANS protection' end,
         (select count(*) from pg_tables where schemaname = 'public' and not rowsecurity) = 0,
         'DANGER : le contenu de ces tables est lisible par tout porteur de l''application.'

  union all
  select 3, 'Les règles d''accès',
         (select count(*) from pg_policies where schemaname = 'public')::text || ' règles',
         (select count(*) from pg_policies where schemaname = 'public') >= 55,
         'Trop peu : une migration a probablement échoué en silence.'

  -- ---- 4. Les fonctions de service ne doivent pas être publiées ----
  --
  -- « mon_role », « mon_profil », « est_membre » décident des droits.
  -- Publiées par l'API, elles seraient appelables depuis un
  -- téléphone. Elles vivent dans un schéma que PostgREST n'expose
  -- pas (migration 0004).
  union all
  select 4, 'Les fonctions de décision sont hors de l''API',
         (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'prive')::text || ' dans le schéma « prive »',
         (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'prive') >= 10,
         'La migration 0004 n''a pas été appliquée.'

  -- ---- 5. Chaque fonction « security definer » se garde elle-même ----
  --
  -- Une fonction « security definer » s'exécute avec les droits de
  -- son propriétaire : AUCUNE règle d'accès ne s'applique à
  -- l'intérieur. Elle doit donc soit vérifier elle-même qui appelle,
  -- soit ne pas être appelable depuis l'extérieur.
  --
  -- Le contrôle de sécurité de Supabase les signalera toutes en
  -- avertissement : c'est normal et c'est assumé. Ce contrôle-ci dit
  -- s'il y a une vraie raison de s'inquiéter.
  union all
  select 5, 'Les fonctions privilégiées se gardent',
         /* La concaténation AVANT le « coalesce », et non après : si
            la liste est vide, tout le calcul vaut nul et l'on tombe
            sur le message rassurant. L'écrire dans l'autre sens
            affichait « toutes — sans garde interne », qui dit
            exactement le contraire de la vérité. */
         coalesce(
           (select string_agg(p.proname, ', ') from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.prosecdef
              and (p.proacl::text like '%anon=X%' or p.proacl::text like '%authenticated=X%')
              and pg_get_functiondef(p.oid) !~ '(mon_role|suis_super|mon_profil)\(\)'
              and p.proname <> 'fondation_ouverte') || ' — SANS garde interne',
           'toutes gardées, ou hors de portée de l''API'),
         not exists (select 1 from pg_proc p
                      join pg_namespace n on n.oid = p.pronamespace
                     where n.nspname = 'public' and p.prosecdef
                       and (p.proacl::text like '%anon=X%' or p.proacl::text like '%authenticated=X%')
                       and pg_get_functiondef(p.oid) !~ '(mon_role|suis_super|mon_profil)\(\)'
                       and p.proname <> 'fondation_ouverte'),
         'Une fonction privilégiée est appelable sans vérifier qui appelle.'

  -- ---- 6. Le « search_path » figé ----
  --
  -- Sans lui, un appelant peut faire pointer un nom de table vers une
  -- table à lui, et la fonction s'exécute sur SES données.
  union all
  select 6, 'Le « search_path » est figé partout',
         coalesce((select string_agg(p.proname, ', ') from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname in ('public', 'prive') and p.prosecdef
                     and pg_get_functiondef(p.oid) !~ 'search_path'),
                  'oui') ,
         not exists (select 1 from pg_proc p
                      join pg_namespace n on n.oid = p.pronamespace
                     where n.nspname in ('public', 'prive') and p.prosecdef
                       and pg_get_functiondef(p.oid) !~ 'search_path'),
         'Ces fonctions peuvent être détournées vers les tables de l''appelant.'

  -- ---- 7. Les seaux de fichiers ----
  union all
  select 7, 'Les seaux de fichiers',
         coalesce((select string_agg(id, ', ' order by id) from storage.buckets), 'aucun'),
         (select count(*) from storage.buckets where id in ('portraits', 'album', 'pieces')) = 3,
         'La migration 0007 (et 0015 pour les documents) n''a pas été appliquée.'

  union all
  select 8, 'Aucun seau n''est public',
         case when (select count(*) from storage.buckets where public) = 0
              then 'aucun'
              else (select string_agg(id, ', ') from storage.buckets where public) || ' EST PUBLIC' end,
         (select count(*) from storage.buckets where public) = 0,
         'DANGER : un seau public rend les portraits des mineurs lisibles sans connexion.'

  -- ---- 9. La fondation du club ----
  union all
  select 9, 'Le club a son super administrateur',
         case when (select count(*) from profils where super_admin) = 0
              then 'PAS ENCORE — l''inscription est ouverte'
              else (select string_agg(numero, ', ') from profils where super_admin) end,
         (select count(*) from profils where super_admin) >= 1,
         'Normal AVANT la première ouverture : créez-le depuis l''écran de connexion.'

  union all
  select 10, 'L''inscription est refermée',
         case when public.fondation_ouverte() then 'NON — encore ouverte' else 'oui' end,
         not public.fondation_ouverte(),
         'Normal tant que le compte fondateur n''est pas créé.'

  -- ---- 11. Ce que la base contient, pour information ----
  --
  -- Les migrations ne créent AUCUN membre. Sur un projet neuf, ce
  -- compte vaut 0 avant la fondation, puis 1. S'il en affiche
  -- davantage avant que le club n'ait rien saisi, c'est qu'on a monté
  -- le projet à partir d'une copie du projet d'ESSAI — dont les
  -- membres sont inventés, et n'ont rien à faire là.
  union all
  select 11, 'Membres inscrits',
         (select count(*) from profils)::text
           || ' fiche(s), dont ' || (select count(*) from profils where compte_id is not null)::text
           || ' avec un compte de connexion',
         true,
         ''
)
select
  case when ok then '  OK  ' else ' ✗✗✗  ' end as etat,
  quoi,
  mesure,
  case when ok then '' else sinon end as remarque
from controles
order by n;

-- ============================================================
-- CE QUE CE SCRIPT NE PEUT PAS VOIR
--
-- Trois choses se règlent dans le TABLEAU DE BORD, pas en SQL, et
-- aucune requête ne peut les vérifier d'ici :
--
--   1. Authentication → Policies → « Leaked password protection ».
--      À ACTIVER. Supabase compare alors le mot de passe choisi à la
--      liste des mots de passe déjà divulgués. C'est le seul
--      avertissement du contrôle de sécurité qui demande une action.
--
--   2. Les deux fonctions déployées :
--        · « comptes »   avec verify_jwt ACTIVÉ
--        · « fondation » avec verify_jwt DÉSACTIVÉ (--no-verify-jwt)
--      Sans le second, l'inscription du fondateur répond 401 sans
--      explication. Voir supabase/functions/*/LISEZ-MOI.md.
--
--   3. La sauvegarde. Vérifiez ce que votre palier inclut, et prenez
--      de toute façon une copie à vous — voir PASSATION.md.
-- ============================================================
