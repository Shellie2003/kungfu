-- ============================================================
-- Kung-fu Waishi Analamahitsy — 2. Messagerie
--
-- L'espace des maîtres n'est pas un cas particulier : c'est un
-- salon comme les autres, dont seuls les maîtres sont membres.
-- Un cas particulier serait une exception à maintenir, donc une
-- exception à oublier un jour.
-- ============================================================

create type type_salon as enum ('club', 'grade', 'evenement', 'direct', 'maitres');

create table salons (
  id          uuid primary key default gen_random_uuid(),
  type        type_salon not null,
  titre       text,                                    -- nul pour un salon direct
  couleur     text,
  archive     boolean not null default false,          -- un salon d'événement se range
  cree_le     timestamptz not null default now(),
  dernier_le  timestamptz not null default now()       -- pour trier la liste
);

create index on salons (archive, dernier_le desc);

-- ------------------------------------------------------------
-- membres_salon — la table qui décide de tout.
--
-- Lire un message revient à demander : suis-je inscrit ici ? Une
-- inscription n'est jamais écrite par l'application, seulement par
-- l'administration. C'est la charnière de la confidentialité.
-- ------------------------------------------------------------
create table membres_salon (
  salon_id  uuid not null references salons (id) on delete cascade,
  profil_id uuid not null references profils (id) on delete cascade,
  lu_le     timestamptz,                               -- pour le compteur de non-lus
  ajoute_le timestamptz not null default now(),
  primary key (salon_id, profil_id)
);

create index on membres_salon (profil_id);

-- ------------------------------------------------------------
-- messages
--
-- Un message n'est jamais effacé : il est marqué supprimé. Effacer
-- la ligne ferait disparaître la preuve d'un signalement, ce qui
-- est exactement ce que cherche l'auteur d'un message à signaler.
-- ------------------------------------------------------------
create table messages (
  id          uuid primary key default gen_random_uuid(),
  salon_id    uuid not null references salons (id) on delete cascade,
  auteur_id   uuid not null references profils (id) on delete cascade,
  texte       text not null check (length(texte) between 1 and 4000),
  piece       text,                                    -- image jointe, bucket « messages »
  cree_le     timestamptz not null default now(),
  modifie_le  timestamptz,
  supprime_le timestamptz
);

-- L'index qui porte l'écran : les derniers messages d'un salon.
create index on messages (salon_id, cree_le desc);

-- ------------------------------------------------------------
-- Le salon et l'auteur d'un message ne changent jamais. Sans ce
-- garde-fou, la règle « je modifie mon message » laisserait
-- déplacer ce message vers un autre salon — y compris celui des
-- maîtres.
-- ------------------------------------------------------------
create or replace function figer_message()
returns trigger
language plpgsql
as $$
begin
  if new.salon_id is distinct from old.salon_id
     or new.auteur_id is distinct from old.auteur_id
     or new.cree_le is distinct from old.cree_le then
    raise exception 'le salon, l''auteur et la date d''un message ne se modifient pas';
  end if;
  new.modifie_le := now();
  return new;
end $$;

create trigger messages_figer
  before update on messages
  for each row execute function figer_message();

-- Remonter le salon en tête de liste à chaque message.
create or replace function toucher_salon()
returns trigger
language plpgsql
as $$
begin
  update salons set dernier_le = new.cree_le where id = new.salon_id;
  return new;
end $$;

create trigger messages_toucher_salon
  after insert on messages
  for each row execute function toucher_salon();

-- ------------------------------------------------------------
-- signalements — le club compte des mineurs, la modération n'est
-- pas une option.
-- ------------------------------------------------------------
create table signalements (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references messages (id) on delete cascade,
  auteur_id   uuid not null references profils (id) on delete cascade,
  motif       text not null,
  traite_le   timestamptz,
  traite_par  uuid references profils (id) on delete set null,
  suite       text,
  cree_le     timestamptz not null default now(),
  unique (message_id, auteur_id)                       -- on ne signale qu'une fois
);

-- ------------------------------------------------------------
-- journal_acces — qui a ouvert l'espace des maîtres, et quand.
--
-- PostgreSQL ne journalise pas les lectures : c'est l'application
-- qui appelle journaliser_acces() en entrant. Un journal
-- déclaratif, donc — il dissuade et il documente, il ne prouve pas.
-- Autant le dire ici plutôt que de le laisser croire.
-- ------------------------------------------------------------
create table journal_acces (
  id        bigint generated always as identity primary key,
  profil_id uuid not null references profils (id) on delete cascade,
  salon_id  uuid references salons (id) on delete set null,
  quoi      text not null,
  quand     timestamptz not null default now()
);

create index on journal_acces (quand desc);

-- ------------------------------------------------------------
-- Les notifications à l'intérieur de l'application. Celles qui
-- sortent sur le téléphone supposent un service tiers : elles ne
-- sont pas de ce fichier.
-- ------------------------------------------------------------
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  profil_id  uuid not null references profils (id) on delete cascade,
  titre      text not null,
  texte      text,
  vers       text,                                     -- écran à ouvrir
  lue_le     timestamptz,
  cree_le    timestamptz not null default now()
);

create index on notifications (profil_id, cree_le desc);
