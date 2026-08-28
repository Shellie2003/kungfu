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
  id           uuid primary key references auth.users (id) on delete cascade,
  numero       text        not null unique,          -- WA-0042
  nom          text        not null,
  prenom       text        not null,
  role         role_membre not null default 'eleve',
  grade        text,                                  -- « Ceinture verte »
  grade_couleur text,                                 -- #4E9C57, pour la pastille
  debut        date,                                  -- début d'entraînement
  biographie   text,
  photo        text,                                  -- chemin dans le bucket « portraits »
  actif        boolean     not null default true,     -- on désactive, on ne supprime pas
  cree_le      timestamptz not null default now()
);

create index on profils (nom, prenom);
create index on profils (role) where role <> 'eleve';

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
-- Le numéro de membre est attribué par la base, pas par
-- l'application : deux inscriptions simultanées produiraient sinon
-- deux fois le même numéro.
-- ------------------------------------------------------------
create sequence numero_membre start 1;

create or replace function prochain_numero()
returns text
language sql
as $$ select 'WA-' || lpad(nextval('numero_membre')::text, 4, '0') $$;
