-- ============================================================
-- Kung-fu Waishi Analamahitsy — 1. Le club
--
-- Les membres, leurs tuteurs, les actualités et les albums.
-- Les règles d'accès sont dans 0003_securite.sql : ce fichier ne
-- décrit que la forme des données.
--
-- Convention : tout est en français, singulier pour une colonne,
-- pluriel pour une table. Les dates sont en timestamptz, jamais en
-- timestamp — Madagascar est à UTC+3 et un serveur est à UTC.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Les rôles. Trois, pas plus : chaque rôle supplémentaire est une
-- règle de sécurité de plus à écrire et à vérifier.
-- ------------------------------------------------------------
create type role_membre as enum ('eleve', 'maitre', 'admin');

-- ------------------------------------------------------------
-- profils — une ligne par membre, en regard d'un compte auth.users.
--
-- Ce que cette table contient est visible par tous les membres
-- connectés. Ce qui ne doit pas l'être vit dans profils_prives :
-- les règles d'accès de PostgreSQL travaillent par ligne, pas par
-- colonne, et séparer les tables est plus sûr que de bricoler des
-- vues.
-- ------------------------------------------------------------
create table profils (
  id           uuid primary key default gen_random_uuid(),
  -- Le compte est SÉPARÉ de la fiche, et facultatif.
  --
  -- « tsy izy rehetra manana android » : tous les élèves n'ont pas de
  -- téléphone Android. Lier la fiche au compte interdirait d'inscrire
  -- un élève sans téléphone — donc de le faire figurer à l'annuaire,
  -- sur la liste de présence et sur une carte de membre. La fiche
  -- existe d'abord ; le compte vient après, s'il vient.
  compte_id    uuid unique references auth.users (id) on delete set null,
  numero       text        not null unique,          -- F04x001
  nom          text        not null,
  prenom       text        not null,
  role         role_membre not null default 'eleve',
  grade_id     uuid,                                  -- vers grades, posé plus bas
  debut        date,                                  -- début d'entraînement
  biographie   text,
  photo        text,                                  -- chemin dans le bucket « portraits »
  actif        boolean     not null default true,     -- on désactive, on ne supprime pas
  cree_le      timestamptz not null default now()
);

create index on profils (nom, prenom);
create index on profils (role) where role <> 'eleve';
create index on profils (compte_id) where compte_id is not null;

-- ------------------------------------------------------------
-- grades — la liste appartient au club, pas au code.
--
-- « Mety modifiena » sur le filtre par grade : le club doit pouvoir
-- ajouter, renommer ou réordonner ses grades sans nouvelle version de
-- l'application. D'où une table, et non une liste figée.
-- ------------------------------------------------------------
create table grades (
  id      uuid primary key default gen_random_uuid(),
  nom     text not null unique,                       -- « Ceinture verte »
  couleur text not null,                              -- #4E9C57, pour la pastille
  rang    int  not null,                              -- ordre d'affichage et de progression
  actif   boolean not null default true
);

create index on grades (rang);

alter table profils
  add constraint profils_grade_fk
  foreign key (grade_id) references grades (id) on delete set null;

-- ------------------------------------------------------------
-- profils_prives — ce qui ne regarde pas les 64 autres membres.
--
-- Le club compte des mineurs : leur date de naissance et leur
-- adresse ne sont pas des informations d'annuaire.
-- ------------------------------------------------------------
create table profils_prives (
  profil_id      uuid primary key references profils (id) on delete cascade,
  date_naissance date,
  telephone      text,
  adresse        text,
  notes          text                                  -- notes d'encadrement
);

-- ------------------------------------------------------------
-- tuteurs — parents ou responsables légaux.
-- Plusieurs par élève : les familles ne tiennent pas toujours en
-- une ligne.
-- ------------------------------------------------------------
create table tuteurs (
  id         uuid primary key default gen_random_uuid(),
  profil_id  uuid not null references profils (id) on delete cascade,
  nom        text not null,
  lien       text not null,                            -- « Mère », « Oncle »…
  telephone  text,
  urgence    boolean not null default false,           -- à appeler en premier
  cree_le    timestamptz not null default now()
);

create index on tuteurs (profil_id);

-- ------------------------------------------------------------
-- actualites — le casier.
-- ------------------------------------------------------------
create table actualites (
  id         uuid primary key default gen_random_uuid(),
  titre      text not null,
  categorie  text not null,                            -- Sortie, Compétition…
  texte      text not null,
  date_evt   date,
  lieu       text,
  image      text,
  publiee    boolean not null default false,           -- brouillon tant que faux
  auteur_id  uuid references profils (id) on delete set null,
  cree_le    timestamptz not null default now()
);

create index on actualites (publiee, cree_le desc);

-- ------------------------------------------------------------
-- albums et photos.
-- ------------------------------------------------------------
create table albums (
  id        uuid primary key default gen_random_uuid(),
  titre     text not null,
  categorie text not null,
  couverture text,
  cree_le   timestamptz not null default now()
);

create table photos (
  id        uuid primary key default gen_random_uuid(),
  album_id  uuid not null references albums (id) on delete cascade,
  chemin    text not null,                             -- bucket « album »
  legende   text,
  rang      int  not null default 0,
  cree_le   timestamptz not null default now()
);

create index on photos (album_id, rang);

-- ------------------------------------------------------------
-- horaires — « Mardi Jeudi Vendredi Samedi. Zany hoe mety modifiena »
--
-- Les jours d'entraînement changent. Ils sont donc en base, modifiables
-- depuis l'administration, et non écrits dans l'application.
-- ------------------------------------------------------------
create table horaires (
  id       uuid primary key default gen_random_uuid(),
  jour     int  not null check (jour between 1 and 7),   -- 1 = lundi
  debut    time not null,
  fin      time not null,
  niveau   text,                                          -- « Tous niveaux », « Gradés »
  lieu     text,
  actif    boolean not null default true,
  check (fin > debut)
);

create index on horaires (jour, debut);

-- ------------------------------------------------------------
-- reglages — les renseignements du club qui bougent.
--
-- « Ny maître responsable koa moa zany mety hiova, dia à modifier
-- daholo » : le responsable change, le téléphone change, l'adresse
-- change. Une table clé/valeur évite une migration à chaque fois.
-- ------------------------------------------------------------
create table reglages (
  cle     text primary key,        -- 'responsable', 'telephone', 'adresse', 'mvola_numero'…
  valeur  text,
  libelle text not null            -- ce que voit l'administration
);

-- ------------------------------------------------------------
-- Le numéro de membre est attribué par la base, pas par
-- l'application : deux inscriptions simultanées produiraient sinon
-- deux fois le même numéro.
--
-- Format donné par le club : F04x001, F04x002, F04x003…
-- Le préfixe est un réglage, pour qu'il puisse changer sans migration.
-- ------------------------------------------------------------
create sequence numero_membre start 1;

create or replace function prochain_numero()
returns text
language sql
as $$
  select coalesce((select valeur from reglages where cle = 'prefixe_matricule'), 'F04x')
      || lpad(nextval('numero_membre')::text, 3, '0')
$$;

insert into reglages (cle, valeur, libelle) values
  ('prefixe_matricule', 'F04x',  'Préfixe du numéro matricule'),
  ('responsable',       null,    'Maître responsable'),
  ('telephone',         null,    'Téléphone du club'),
  ('adresse',           null,    'Adresse du club'),
  ('mvola_numero',      null,    'Numéro MVola pour les participations'),
  ('mvola_nom',         null,    'Nom du compte MVola');
