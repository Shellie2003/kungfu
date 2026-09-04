-- ============================================================
-- Kung-fu Waishi Analamahitsy — 24. La fondation du club,
-- et le droit d'attribuer un numéro de membre.
--
-- Deux choses dans ce fichier, et elles se tiennent : le club ne
-- peut pas commencer sans un premier compte, et ce premier compte ne
-- peut pas inscrire qui que ce soit tant que « prochain_numero » lui
-- est refusée.
-- ============================================================


-- ============================================================
-- 1. « Refusé par le serveur : permission denied for function
--    prochain_numero. »
--
-- CE QUI S'EST PASSÉ, EXACTEMENT
--
-- La migration 0004 corrigeait un défaut signalé par le contrôle de
-- sécurité de Supabase : trois fonctions n'avaient pas de
-- « search_path » fixe. Sans lui, un appelant peut faire pointer un
-- nom de table vers une table à lui, et la fonction s'exécute sur
-- ses données. Les trois ont été réécrites, et les trois ont reçu
-- le même traitement :
--
--     revoke all on function ... from public, anon, authenticated;
--
-- Pour DEUX d'entre elles, c'était juste. « figer_message » et
-- « toucher_salon » sont des déclencheurs : c'est la base qui les
-- appelle, jamais un téléphone. Leur retirer le droit d'exécution
-- ferme une porte que personne n'avait à franchir.
--
-- Pour la TROISIÈME, c'était une erreur, et elle a coûté
-- l'inscription. « prochain_numero » n'est pas un déclencheur : elle
-- est appelée par l'application, depuis l'écran d'inscription, avec
-- le jeton d'un administrateur — donc en tant que « authenticated ».
-- On lui a retiré le seul droit dont elle avait besoin.
--
-- Rien ne l'a signalé, parce que rien ne pouvait le signaler : le
-- banc des écritures vérifie que les écritures savent si elles ont
-- écrit, pas que les fonctions sont appelables. Et les tests posent
-- une réponse toute faite pour « rpc:prochain_numero » — ils ne
-- traversent jamais PostgREST.
--
-- LA CORRECTION, ET POURQUOI ELLE NE SE CONTENTE PAS D'UN « GRANT »
--
-- Rendre le droit à « authenticated » le rendrait à TOUT LE MONDE :
-- un élève connecté pourrait appeler la fonction en boucle depuis
-- n'importe quel outil. Elle ne lit rien de confidentiel, mais elle
-- CONSOMME une séquence : chaque appel brûle un numéro. L'annuaire
-- du club sauterait de F04x065 à F04x900, et ces trous ne se
-- rebouchent pas.
--
-- La fonction se garde donc elle-même. C'est nécessaire parce
-- qu'elle est « security definer » : elle s'exécute avec les droits
-- de son propriétaire, et aucune règle d'accès ne s'applique à
-- l'intérieur. Le seul endroit où l'on peut vérifier qui appelle,
-- c'est son premier ordre.
-- ============================================================
create or replace function public.prochain_numero()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- « mon_role() » vit dans « prive », hors du schéma publié par
  -- l'API : un téléphone ne peut pas l'appeler pour fabriquer une
  -- réponse complaisante. Le super administrateur porte le rôle
  -- « admin » comme les autres — c'est le choix de la migration
  -- 0016 — il passe donc ici sans cas particulier.
  if prive.mon_role() is distinct from 'admin' then
    -- 42501 est le code « privilège insuffisant » de PostgreSQL :
    -- PostgREST le traduit en 403, et non en 500. L'écran dit alors
    -- « réservé à l'administration » au lieu de « erreur serveur ».
    raise exception 'seule l''administration attribue un numéro de membre'
      using errcode = '42501';
  end if;

  return coalesce((select valeur from reglages where cle = 'prefixe_matricule'), 'F04x')
      || lpad(nextval('numero_membre')::text, 3, '0');
end $$;

revoke all on function public.prochain_numero() from public, anon;
grant execute on function public.prochain_numero() to authenticated;


-- ============================================================
-- 2. LA FONDATION : le premier compte du club se crée lui-même,
--    puis la porte se referme.
--
-- « Je veux que le super admin crée son compte via inscription ; une
-- fois créé, la création du compte par inscription sera coupée. »
--
-- ------------------------------------------------------------
-- LE PROBLÈME QUE CELA RÉSOUT
--
-- Tout compte du club est créé par l'administration, depuis
-- l'application. C'est vrai des soixante-quatre membres — et c'est
-- circulaire pour le premier : personne ne peut créer le compte de
-- celui qui crée les comptes. Jusqu'ici, il fallait ouvrir le
-- tableau de bord Supabase et écrire trois ordres SQL à la main. Un
-- club qui installe l'application n'a pas à faire cela.
--
-- ------------------------------------------------------------
-- POURQUOI LA PORTE DOIT ÊTRE VERROUILLÉE PAR LA BASE, ET NON PAR
-- L'ÉCRAN
--
-- Un écran qui cache un bouton ne protège rien : l'inscription est
-- un appel HTTP, et il s'envoie depuis n'importe quel outil. Si le
-- verrou vivait dans l'application, n'importe qui pourrait se
-- fabriquer un compte super administrateur le lendemain de
-- l'installation — c'est-à-dire prendre le club.
--
-- Le verrou est donc DOUBLE, et les deux moitiés sont dans la base :
--
--   · une ligne « fondation_faite » dans « reglages », dont la clé
--     est une clé PRIMAIRE. Deux inscriptions simultanées ne peuvent
--     pas passer : la seconde lève une violation d'unicité. C'est
--     PostgreSQL qui arbitre, pas un « if » qu'on aurait pu perdre
--     entre deux requêtes.
--
--   · l'existence d'un super administrateur. Même si quelqu'un
--     effaçait la ligne de réglage, la porte reste fermée tant qu'un
--     super administrateur existe.
--
-- Il faut donc que les DEUX conditions soient réunies pour que
-- l'inscription rouvre — c'est-à-dire un club vraiment vide.
-- ============================================================

-- ------------------------------------------------------------
-- « La porte est-elle encore ouverte ? »
--
-- Lisible SANS ÊTRE CONNECTÉ : c'est tout l'objet — l'écran de
-- connexion doit savoir s'il propose « créer le compte du club » à
-- quelqu'un qui n'a pas encore de compte.
--
-- Ce qu'elle divulgue, et c'est tout : un booléen disant si le club
-- est configuré. Pas un nom, pas un numéro, pas un effectif. Le
-- savoir n'aide personne à entrer.
-- ------------------------------------------------------------
create or replace function public.fondation_ouverte()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select not exists (select 1 from reglages where cle = 'fondation_faite')
     and not exists (select 1 from profils  where super_admin)
$$;

revoke all on function public.fondation_ouverte() from public;
grant execute on function public.fondation_ouverte() to anon, authenticated;


-- ------------------------------------------------------------
-- RÉSERVER la fondation.
--
-- Pourquoi en deux temps, et non en un seul ordre : le compte de
-- CONNEXION ne vit pas dans cette base — il vit dans « auth.users »,
-- et seule la clé de service peut l'y créer, par un appel HTTP.
-- Cet appel ne peut pas tenir dans une transaction SQL. Or il faut
-- connaître le numéro de membre AVANT de créer le compte, puisque
-- l'adresse de connexion en est tirée : F04x001 devient
-- f04x001@waishi.local.
--
-- On réserve donc d'abord — c'est ici que la course est tranchée —
-- puis on crée le compte, puis on pose la fiche. Si la création du
-- compte échoue, « fonder_annuler » rend la place : sans quoi une
-- panne de réseau fermerait le club définitivement dehors.
-- ------------------------------------------------------------
create or replace function public.fonder_reserver()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_numero text;
begin
  if exists (select 1 from profils where super_admin) then
    raise exception 'le club a déjà un super administrateur' using errcode = '42501';
  end if;

  -- LE VERROU. La clé primaire de « reglages » fait l'arbitrage :
  -- de deux inscriptions parties en même temps, une seule insère,
  -- l'autre échoue ici. Aucune fenêtre entre le contrôle et l'acte.
  insert into reglages (cle, valeur, libelle)
  values ('fondation_faite', now()::text,
          'Date de création du compte fondateur — l''inscription est fermée');

  v_numero := coalesce((select valeur from reglages where cle = 'prefixe_matricule'), 'F04x')
           || lpad(nextval('numero_membre')::text, 3, '0');
  return v_numero;
end $$;

-- ------------------------------------------------------------
-- POSER la fiche, une fois le compte de connexion créé.
--
-- Le fondateur reçoit le rôle « admin » ET le drapeau
-- « super_admin ». Les deux, et non l'un des deux : la migration
-- 0016 explique pourquoi le drapeau se pose PAR-DESSUS le rôle
-- plutôt qu'à sa place — cinquante-quatre règles d'accès disent
-- « role = 'admin' », et un super administrateur qui n'aurait pas ce
-- rôle ne pourrait plus rien faire.
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
  -- On revérifie ici, et non par confiance dans l'appelant : cette
  -- fonction pose le compte le plus puissant du club, et rien ne
  -- garantit que « fonder_reserver » a bien précédé.
  if exists (select 1 from profils where super_admin) then
    raise exception 'le club a déjà un super administrateur' using errcode = '42501';
  end if;

  -- Le nom en capitales, comme sur la carte de membre et comme le
  -- fait l'écran d'inscription ordinaire : deux chemins vers la même
  -- table doivent écrire de la même façon, sinon l'annuaire se trie
  -- en deux blocs.
  insert into profils (compte_id, numero, nom, prenom, role, super_admin)
  values (p_compte, p_numero, upper(trim(p_nom)), trim(p_prenom), 'admin', true)
  returning id into v_id;

  return v_id;
end $$;

-- ------------------------------------------------------------
-- ANNULER une réservation qui n'a pas abouti.
--
-- Elle n'existe que pour un cas : le compte de connexion n'a pas pu
-- être créé après la réservation. Sans elle, le club resterait
-- enfermé dehors — la porte fermée, et personne dedans.
--
-- Elle refuse de s'exécuter dès qu'un super administrateur existe :
-- ce n'est alors plus une réservation en panne, c'est une fondation
-- réussie, et la rouvrir serait exactement le trou qu'on ferme.
-- ------------------------------------------------------------
create or replace function public.fonder_annuler()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from profils where super_admin) then
    raise exception 'la fondation a abouti : elle ne s''annule pas' using errcode = '42501';
  end if;
  -- Le laissez-passer que le déclencheur ci-dessous exige. Il ne
  -- vaut QUE pour cette transaction (« true » en troisième argument),
  -- et seule cette fonction peut le poser.
  perform set_config('prive.fondation', 'ouverte', true);
  delete from reglages where cle = 'fondation_faite';
end $$;

-- Ces trois-là ne s'appellent que depuis la fonction serveur, avec
-- la clé de service. Aucun téléphone ne doit pouvoir les atteindre :
-- « fonder_poser » créerait un super administrateur, et
-- « fonder_annuler » rouvrirait la porte.
revoke all on function public.fonder_reserver()                     from public, anon, authenticated;
revoke all on function public.fonder_poser(text, text, text, uuid)  from public, anon, authenticated;
revoke all on function public.fonder_annuler()                      from public, anon, authenticated;
grant  execute on function public.fonder_reserver()                     to service_role;
grant  execute on function public.fonder_poser(text, text, text, uuid)  to service_role;
grant  execute on function public.fonder_annuler()                      to service_role;


-- ------------------------------------------------------------
-- LA LIGNE DE FONDATION NE S'EFFACE PAS DEPUIS L'APPLICATION.
--
-- La règle « l'administration tient les réglages » est un « for
-- all » : un administrateur peut donc modifier et SUPPRIMER
-- n'importe quelle ligne de « reglages », y compris celle-ci. Ce
-- n'était pas gênant tant qu'elles ne portaient qu'un numéro de
-- téléphone et une adresse ; celle-ci est un verrou.
--
-- Le déclencheur ne dit pas « personne » : « fonder_annuler » doit
-- pouvoir effacer la ligne quand la fondation a échoué en cours de
-- route. Il exige un laissez-passer que SEULE cette fonction pose, et
-- qui ne vaut que le temps de sa transaction.
--
-- Pourquoi un laissez-passer plutôt que « le rôle de connexion est
-- service_role » : le rôle dépend de la FAÇON dont on s'est branché
-- à la base, pas de ce qu'on fait. Il change selon qu'on passe par
-- l'API, par le tableau de bord ou par une migration, et un verrou
-- qui dépend du chemin d'accès finit toujours par s'ouvrir sur un
-- chemin qu'on n'avait pas prévu. Le laissez-passer, lui, ne peut
-- être posé que par un ordre écrit dans « fonder_annuler ».
-- ------------------------------------------------------------
create or replace function prive.figer_fondation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(old.cle, new.cle) = 'fondation_faite'
     and coalesce(current_setting('prive.fondation', true), '') <> 'ouverte' then
    raise exception 'la fondation du club ne se modifie pas depuis l''application'
      using errcode = '42501';
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists reglages_figer_fondation on public.reglages;
create trigger reglages_figer_fondation
  before update or delete on public.reglages
  for each row execute function prive.figer_fondation();

revoke all on function prive.figer_fondation() from public, anon, authenticated;
