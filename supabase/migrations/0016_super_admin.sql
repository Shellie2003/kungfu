-- ============================================================
-- Le SUPER ADMINISTRATEUR.
--
-- « Il y a un compte super admin qui a le contrôle sur tout, puis un
-- admin (maître ou gradé). Le super admin décide quel est le rôle
-- d'une personne dès l'inscription, puis l'application génère
-- automatiquement les infos de connexion de ce membre créé. Seul lui
-- peut suspendre, supprimer définitivement un membre. »
--
-- ------------------------------------------------------------
-- POURQUOI UN DRAPEAU, ET NON UNE QUATRIÈME VALEUR DE « role_membre »
--
-- Le réflexe est d'ajouter 'super_admin' à l'énumération, à côté de
-- 'eleve', 'maitre' et 'admin'. Je ne l'ai pas fait, et la raison
-- est chiffrée : CINQUANTE-QUATRE règles d'accès de ce projet sont
-- écrites « prive.mon_role() = 'admin' » ou « in ('maitre','admin') ».
--
-- Avec une quatrième valeur, un super administrateur n'est PLUS un
-- 'admin' : il perdrait d'un coup les cinquante-quatre autorisations,
-- et il faudrait réécrire chacune. Cinquante-quatre occasions de se
-- tromper dans un sens — le compte le plus puissant du club ne peut
-- plus rien faire — ou dans l'autre, bien pire : ouvrir à tous ce qui
-- devait rester fermé, sans que rien ne le signale.
--
-- Et ce serait faux sur le fond. Un super administrateur n'est pas
-- une AUTRE sorte de membre : c'est un administrateur, PLUS le
-- pouvoir de décider des rôles et de supprimer. Un drapeau posé
-- par-dessus le rôle dit exactement cela.
--
-- Conséquence, et elle est voulue : toutes les règles existantes
-- continuent de s'appliquer sans être touchées. Ce fichier n'AJOUTE
-- que des restrictions, il n'en relâche aucune.
-- ============================================================

alter table profils
  add column if not exists super_admin boolean not null default false;

comment on column profils.super_admin is
  'Administrateur qui décide des rôles, suspend et supprime. Se pose '
  'uniquement par un autre super administrateur, ou en base.';

-- ------------------------------------------------------------
-- La question « suis-je super administrateur ? », posée à la base.
--
-- Dans « prive », comme ses sœurs : hors du schéma exposé par
-- l'API, donc impossible à appeler depuis un téléphone pour
-- fabriquer une réponse.
--
-- « security definer » et search_path figé : la fonction lit la
-- table même si l'appelant n'a pas le droit de la lire, et personne
-- ne peut lui glisser une table « profils » de son cru.
-- ------------------------------------------------------------
create or replace function prive.suis_super()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select super_admin from public.profils where compte_id = auth.uid()),
    false
  )
$$;

revoke all on function prive.suis_super() from public, anon;
grant execute on function prive.suis_super() to authenticated;

-- ------------------------------------------------------------
-- Ce que le drapeau change, et LUI SEUL.
--
-- Le déclencheur « figer_profil » laissait passer TOUT ce qu'un
-- administrateur écrivait : le rôle, le numéro, le grade, le compte,
-- l'activation. C'était cohérent tant qu'il n'y avait qu'un niveau
-- d'administration.
--
-- Deux colonnes sortent maintenant de ce blanc-seing :
--
--   · « role »        — décider qu'un membre devient maître ou
--                       administrateur appartient au super
--                       administrateur. C'est la demande, mot pour
--                       mot.
--
--   · « super_admin » — sans quoi n'importe quel administrateur se
--                       nommerait super administrateur, et la
--                       distinction ne vaudrait rien. C'est le point
--                       qui rend tout le reste vrai.
--
-- Le reste — numéro, grade, compte, activation — continue de relever
-- de l'administration ordinaire : rien n'est retiré à personne.
-- ------------------------------------------------------------
create or replace function prive.figer_profil()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  -- ⚠ CE QUI PASSE AVANT TOUT LE RESTE : le travail du SERVEUR.
  --
  -- « auth.uid() is null » veut dire qu'aucun téléphone n'est
  -- derrière cette écriture : c'est la console SQL, une migration,
  -- ou la fonction déployée « comptes » qui travaille avec la clé de
  -- service.
  --
  -- Deux raisons de l'exempter, et j'ai découvert la première en la
  -- heurtant : la ligne qui nomme le premier super administrateur,
  -- au bas de cette migration, déclenchait sa propre interdiction —
  -- il n'y avait pas encore de super administrateur pour l'autoriser,
  -- et la migration se refusait elle-même.
  --
  -- La seconde compte davantage. La clé de service contourne déjà
  -- toutes les règles d'accès — c'est sa définition — mais PAS les
  -- déclencheurs. Sans cette ligne, la fonction « comptes » ne
  -- pourrait pas poser le rôle choisi au moment de l'inscription,
  -- qui est précisément ce que le club a demandé.
  --
  -- Ce n'est donc pas un trou : c'est reconnaître que la clé de
  -- service est déjà au-dessus de tout, et qu'un déclencheur ne la
  -- retiendra pas. Ce qui la protège, c'est qu'elle ne quitte jamais
  -- le serveur.
  if auth.uid() is null then
    return new;
  end if;

  -- Le rôle et le drapeau : au super administrateur seul.
  if (new.role        is distinct from old.role
   or new.super_admin is distinct from old.super_admin)
   and not prive.suis_super() then
    raise exception
      'le rôle d''un membre et la qualité de super administrateur ne se '
      'modifient que par un super administrateur';
  end if;

  -- ⚠ UN GARDE-FOU QUI N'EST PAS UNE QUESTION DE SÉCURITÉ.
  --
  -- Se retirer à soi-même la qualité de super administrateur, quand
  -- on est le dernier, enferme le club dehors : plus personne ne
  -- peut nommer de rôle, ni suspendre, ni supprimer, et cela ne se
  -- rattrape que par le tableau de bord Supabase — c'est-à-dire par
  -- moi. Ce n'est pas un risque d'attaque, c'est un accident, et
  -- c'est le genre d'accident qu'on ne découvre qu'après.
  if old.super_admin and not new.super_admin
     and (select count(*) from public.profils where super_admin) <= 1 then
    raise exception
      'le club doit garder au moins un super administrateur : nommez le '
      'suivant avant de retirer celui-ci';
  end if;

  -- Le reste comme avant : l'administration ordinaire écrit tout,
  -- un membre ne touche ni au numéro, ni au grade, ni au compte.
  if prive.mon_role() = 'admin' then
    return new;
  end if;
  if new.role      is distinct from old.role
  or new.numero    is distinct from old.numero
  or new.grade_id  is distinct from old.grade_id
  or new.actif     is distinct from old.actif
  or new.compte_id is distinct from old.compte_id then
    raise exception
      'le rôle, le numéro, le grade, le compte et l''activation ne se modifient que par l''administration';
  end if;
  return new;
end $$;

-- ------------------------------------------------------------
-- La SUPPRESSION DÉFINITIVE d'un membre.
--
-- Elle n'existait nulle part, et c'était un choix : le projet
-- désactive au lieu de supprimer, partout — un grade retiré, une
-- fiche d'élève, un créneau d'horaire. Effacer casse un historique
-- que personne ne peut reconstituer.
--
-- Le club la demande explicitement, et pour le seul compte qui doit
-- l'avoir. On l'ajoute donc, avec sa règle propre : la table n'avait
-- AUCUNE politique de suppression, donc personne ne pouvait
-- supprimer — pas même l'administration.
--
-- Ce qui part avec la fiche : les liens en cascade posés au premier
-- jour (profils_prives, tuteurs, membres_salon, présences). Ce qui
-- reste : les messages écrits, dont l'auteur devient nul plutôt que
-- de faire disparaître une conversation à laquelle d'autres ont
-- participé.
--
-- Le COMPTE de connexion, lui, ne vit pas dans cette table : il est
-- dans auth.users, que seule la clé de service atteint. La fonction
-- déployée « comptes » le supprime dans le même geste — voir
-- supabase/functions/comptes/index.ts.
-- ------------------------------------------------------------
drop policy if exists "le super administrateur supprime un membre" on public.profils;

create policy "le super administrateur supprime un membre"
  on public.profils
  for delete
  to authenticated
  using (
    prive.suis_super()
    -- Et jamais soi-même : supprimer sa propre fiche déconnecte
    -- définitivement, et si c'est le dernier super administrateur,
    -- personne ne peut plus en nommer un autre.
    and id <> prive.mon_profil()
  );

-- ------------------------------------------------------------
-- Le premier super administrateur.
--
-- Sans lui, la fonctionnalité existe et personne ne peut s'en
-- servir : il n'y a pas de super administrateur, donc personne ne
-- peut en nommer un, et le club est enfermé dehors dès la première
-- migration.
--
-- On promeut la fiche du responsable, celle qui porte déjà le rôle
-- 'admin' et le plus petit numéro — c'est-à-dire le compte fondateur
-- du club. S'il n'y en a aucune, la migration passe sans rien faire
-- plutôt que d'échouer : une base neuve n'a pas encore de membres,
-- et c'est un cas normal.
-- ------------------------------------------------------------
update profils
set super_admin = true
where id = (
  select id from profils
  where role = 'admin'
  order by numero
  limit 1
)
and not exists (select 1 from profils where super_admin);

-- ------------------------------------------------------------
-- ⚠ LE TROU QUE LE DÉCLENCHEUR NE VOYAIT PAS : la CRÉATION.
--
-- « figer_profil » est un déclencheur BEFORE UPDATE. Il garde le
-- rôle d'un membre existant, et il le fait bien.
--
-- Mais rien ne gardait le rôle d'un membre NEUF. La règle d'insertion
-- de « profils » autorise l'administration, et une insertion ne passe
-- par aucun déclencheur : n'importe quel administrateur pouvait donc
-- créer une fiche en écrivant role = 'admin', ou super_admin = true,
-- et se donner en une requête ce que la mise à jour lui refuse.
--
-- La demande du club dit exactement l'inverse : « le super admin
-- décide quel est le rôle d'une personne DÈS L'INSCRIPTION ». Sans
-- ce déclencheur, la moitié de la phrase n'était pas tenue — et,
-- comme toujours, c'est la moitié qu'on ne voit pas.
--
-- Un administrateur ordinaire continue d'inscrire des membres :
-- simplement, ils sont élèves. C'est le cas ordinaire — soixante et
-- un des soixante-quatre.
-- ------------------------------------------------------------
create or replace function prive.figer_creation()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  -- Le serveur travaille sans session : migrations, console, et la
  -- fonction déployée « comptes » qui pose le rôle choisi. Même
  -- raisonnement que dans figer_profil, et même conclusion.
  if auth.uid() is null then
    return new;
  end if;

  if (new.role is distinct from 'eleve'::role_membre or new.super_admin)
     and not prive.suis_super() then
    raise exception
      'seul un super administrateur inscrit un membre avec un rôle autre qu''élève';
  end if;

  return new;
end $$;

revoke all on function prive.figer_creation() from public, anon;

drop trigger if exists profils_figer_creation on public.profils;
create trigger profils_figer_creation
  before insert on public.profils
  for each row execute function prive.figer_creation();
