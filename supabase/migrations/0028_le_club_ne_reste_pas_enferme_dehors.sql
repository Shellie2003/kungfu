-- ============================================================
-- 0028 — LE CLUB NE RESTE PAS ENFERMÉ DEHORS.
--
-- « Pourquoi le bouton créer un compte n'est pas affiché ? J'ai
-- supprimé manuellement le profil 001. »
--
-- ------------------------------------------------------------
-- CE QUI S'EST PASSÉ, ET QUI EST ARRIVÉ DEUX FOIS
--
-- La porte d'inscription s'ouvrait à DEUX conditions :
--
--     not exists (select 1 from reglages where cle = 'fondation_faite')
--     and not exists (select 1 from profils where super_admin)
--
-- Le profil supprimé, la seconde était remplie ; la première ne
-- l'était pas. L'application demandait « la fondation est-elle
-- ouverte ? », s'entendait répondre non, et n'affichait aucun bouton.
--
-- Résultat : zéro profil, un compte de connexion sans fiche, et la
-- porte fermée à clé. PLUS PERSONNE NE POUVAIT ENTRER, et rien à
-- l'écran ne disait pourquoi. Il fallait le tableau de bord Supabase.
--
-- ------------------------------------------------------------
-- POURQUOI CE VERROU EXISTAIT, ET POURQUOI ON PEUT LE DESSERRER
--
-- Il empêchait ceci : effacer une ligne de réglage pour se refabriquer
-- un compte super administrateur. La crainte était juste.
--
-- Mais ce chemin n'existe PAS depuis l'application :
--
--   · seul un super administrateur peut supprimer un membre ;
--   · la fonction « comptes » lui interdit de se supprimer lui-même ;
--   · avec deux super administrateurs, A peut retirer B — il reste A.
--
-- Atteindre ZÉRO administrateur exige donc le tableau de bord, ou la
-- clé de service. Quelqu'un qui les a n'a pas besoin de cette porte :
-- il peut déjà tout faire. Le verrou ne protégeait de personne, et
-- enfermait le club.
--
-- LA RÈGLE JUSTE : la porte est ouverte quand le club n'a AUCUN
-- administrateur. « fondation_faite » devient une trace datée — on
-- garde la date, on n'en fait plus une serrure.
--
-- ⚠ ET ON EXIGE « aucun ADMINISTRATEUR », non « aucun super
-- administrateur ». La différence compte : un club qui a perdu son
-- super administrateur mais garde des administrateurs FONCTIONNE
-- encore — il inscrit, publie, pointe. Rouvrir la porte dans ce
-- cas-là laisserait n'importe qui, sans aucun compte, se fabriquer le
-- rôle le plus puissant pendant que le club tourne. On ne rouvre que
-- lorsqu'il n'y a plus personne pour administrer.
--
-- ------------------------------------------------------------
-- ⚠ LE PIÈGE QU'IL FALLAIT VOIR AVANT DE TOUCHER À LA SERRURE
--
-- « fonder_reserver » n'utilise pas cette ligne comme une trace :
-- elle s'en sert comme VERROU D'EXCLUSION. Elle l'INSÈRE, et c'est la
-- clé primaire qui départage deux inscriptions parties en même temps.
--
-- Rouvrir la porte sans y toucher aurait donc affiché le bouton — et
-- fait échouer CHAQUE tentative sur un doublon de clé, la ligne
-- existant déjà. Le pire des deux mondes : une porte qui a l'air
-- ouverte et ne s'ouvre jamais.
--
-- Le verrou est donc réécrit pour rester un verrou tout en étant
-- REPRENABLE :
--
--   · pas de ligne  → on l'insère, la clé primaire arbitre, comme avant ;
--   · ligne FRAÎCHE → une inscription est en cours ailleurs : on refuse ;
--   · ligne VIEILLE → réservation abandonnée, ou fondation d'un club
--                     qui n'a plus d'administrateur : on la reprend
--                     par un « update … where », que PostgreSQL
--                     sérialise. De deux transactions, la seconde
--                     réévalue la condition sur la ligne déjà reprise
--                     et n'écrit rien.
--
-- Quinze minutes : plus court, une inscription lente sur un réseau
-- malgache se ferait doubler ; plus long, une réservation en panne
-- bloquerait le club une demi-heure.
-- ============================================================

-- ------------------------------------------------------------
-- 1. LA PORTE.
-- ------------------------------------------------------------
create or replace function public.fondation_ouverte()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select not exists (select 1 from profils where role = 'admin')
$$;

comment on function public.fondation_ouverte() is
  'Ouverte quand le club n''a aucun administrateur. « fondation_faite » est une trace datée, plus une serrure — voir 0028.';

-- ------------------------------------------------------------
-- 2. LE VERROU, REPRENABLE MAIS TOUJOURS VERROU.
-- ------------------------------------------------------------
create or replace function public.fonder_reserver()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_numero text;
  v_pris   int;
begin
  if exists (select 1 from profils where role = 'admin') then
    raise exception 'le club a déjà un administrateur' using errcode = '42501';
  end if;

  /* Le laissez-passer : la reprise ci-dessous est une MISE À JOUR de
     « fondation_faite », que le déclencheur « figer_fondation »
     interdit sans lui. Il ne vaut que le temps de cette transaction,
     et cette fonction n'est appelable qu'avec la clé de service. */
  perform set_config('prive.fondation', 'ouverte', true);

  update reglages
     set valeur = now()::text
   where cle = 'fondation_faite'
     and now() - valeur::timestamptz > interval '15 minutes';
  get diagnostics v_pris = row_count;

  if v_pris = 0 then
    /* Pas de reprise : soit la ligne n'existe pas — on l'insère, et
       la clé primaire arbitre — soit elle est fraîche, et l'insertion
       échoue, ce qui est exactement le refus qu'on veut. */
    begin
      insert into reglages (cle, valeur, libelle)
      values ('fondation_faite', now()::text,
              'Date de création du compte fondateur');
    exception when unique_violation then
      raise exception 'une inscription est déjà en cours' using errcode = '42501';
    end;
  end if;

  v_numero := coalesce((select valeur from reglages where cle = 'prefixe_matricule'), 'F04x')
           || lpad(nextval('numero_membre')::text, 3, '0');
  return v_numero;
end $$;

-- ------------------------------------------------------------
-- 3. LES DEUX AUTRES, SUR LA MÊME RÈGLE.
--
-- « super_admin » devient « role = 'admin' » partout : sans cela,
-- « fonder_poser » aurait accepté de créer un second super
-- administrateur dans un club qui a des administrateurs ordinaires
-- mais plus de super — précisément le cas qu'on refuse de rouvrir.
-- ------------------------------------------------------------
create or replace function public.fonder_poser(
  p_numero text, p_nom text, p_prenom text, p_compte uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if exists (select 1 from profils where role = 'admin') then
    raise exception 'le club a déjà un administrateur' using errcode = '42501';
  end if;

  insert into profils (compte_id, numero, nom, prenom, role, super_admin)
  values (p_compte, p_numero, upper(trim(p_nom)), trim(p_prenom), 'admin', true)
  returning id into v_id;

  return v_id;
end $$;

create or replace function public.fonder_annuler()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from profils where role = 'admin') then
    raise exception 'la fondation a abouti : elle ne s''annule pas' using errcode = '42501';
  end if;
  perform set_config('prive.fondation', 'ouverte', true);
  delete from reglages where cle = 'fondation_faite';
end $$;

revoke all on function public.fonder_reserver()                     from public, anon, authenticated;
revoke all on function public.fonder_poser(text, text, text, uuid)  from public, anon, authenticated;
revoke all on function public.fonder_annuler()                      from public, anon, authenticated;
grant  execute on function public.fonder_reserver()                     to service_role;
grant  execute on function public.fonder_poser(text, text, text, uuid)  to service_role;
grant  execute on function public.fonder_annuler()                      to service_role;

-- « fondation_ouverte » reste lisible sans être connecté : c'est
-- l'écran d'accueil qui la demande, avant toute connexion.
grant execute on function public.fondation_ouverte() to anon, authenticated, service_role;
