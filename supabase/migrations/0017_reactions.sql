-- ============================================================
-- Les RÉACTIONS.
--
-- « Je veux aussi une visualisation grande si on appuie sur une
-- image, avec des boutons de réaction et téléchargement. »
--
-- ------------------------------------------------------------
-- UNE TABLE POUR DEUX SORTES D'IMAGES
--
-- On regarde des images à deux endroits : dans une CONVERSATION
-- (une pièce jointe) et dans un ALBUM (une photo du club). Ce sont
-- deux tables différentes, et une réaction ne veut pas dire la même
-- chose dans l'une et dans l'autre.
--
-- Deux tables de réactions auraient été plus « propres » et auraient
-- doublé tout le reste : deux jeux de règles d'accès, deux requêtes,
-- deux composants. Une seule table, avec ce sur quoi on réagit —
-- « sujet » — dit la même chose en une fois.
--
-- « sujet » n'est PAS une clé étrangère, pour la même raison que la
-- catégorie d'une actualité n'en est pas une (migration 0014) : il
-- désigne tantôt un message, tantôt une photo, et une colonne ne
-- peut pas pointer vers deux tables. Le ménage se fait donc à la
-- main quand une photo disparaît — voir plus bas.
--
-- ------------------------------------------------------------
-- UNE SEULE RÉACTION PAR PERSONNE ET PAR IMAGE
--
-- La contrainte d'unicité porte sur (genre, sujet, profil), et non
-- sur l'emoji : appuyer sur « 👏 » quand on avait mis « 👍 »
-- REMPLACE, cela n'ajoute pas. C'est ce que font les messageries que
-- le club connaît, et c'est ce qui évite qu'une même personne empile
-- six réactions sur la même photo.
-- ============================================================

create table reactions (
  id        uuid primary key default gen_random_uuid(),
  -- « message » ou « photo » : ce qui distingue une pièce jointe
  -- d'une conversation d'une photo d'album.
  genre     text not null check (genre in ('message', 'photo')),
  sujet     uuid not null,
  profil_id uuid not null references profils (id) on delete cascade,
  -- L'emoji lui-même, tel quel. Pas un code, pas un identifiant :
  -- c'est un caractère, et le stocker autrement demanderait une
  -- table de correspondance à tenir à jour des deux côtés.
  emoji     text not null,
  cree_le   timestamptz not null default now(),

  unique (genre, sujet, profil_id)
);

create index on reactions (genre, sujet);

alter table reactions enable row level security;

-- ------------------------------------------------------------
-- QUI VOIT QUOI.
--
-- La lecture est ouverte à tous les membres, et c'est un choix qu'il
-- faut regarder en face : la table ne sait pas si le message
-- réagi appartient à un salon dont on est membre. Une règle qui
-- vérifierait cela devrait interroger « messages » puis
-- « membres_salon » à chaque ligne lue.
--
-- Ce que cela révélerait dans le pire des cas : qu'une personne a mis
-- un emoji sur un objet dont on ne connaît ni le contenu, ni
-- l'auteur, ni le fil — un identifiant tiré au sort et un « 👍 ».
-- Le CONTENU des messages, lui, reste protégé par ses propres règles,
-- qui n'ont pas changé.
--
-- Le compromis est assumé et écrit ici pour qu'il puisse être
-- rediscuté. S'il devait être resserré, la règle est à écrire là,
-- pas dans l'application.
-- ------------------------------------------------------------
create policy "chacun lit les réactions"
  on reactions
  for select
  to authenticated
  using (true);

-- On ne réagit QUE pour soi. « profil_id = prive.mon_profil() » dans
-- le « with check » est ce qui empêche de poser une réaction au nom
-- de quelqu'un d'autre — sans quoi n'importe qui pourrait faire dire
-- « 👍 » au maître.
create policy "chacun réagit pour lui-même"
  on reactions
  for insert
  to authenticated
  with check (profil_id = prive.mon_profil());

create policy "chacun change sa propre réaction"
  on reactions
  for update
  to authenticated
  using (profil_id = prive.mon_profil())
  with check (profil_id = prive.mon_profil());

-- Retirer sa réaction : la sienne, et celle-là seule. L'encadrement
-- n'est pas mentionné ici à dessein — une réaction n'est pas un
-- message, il n'y a rien à modérer dans un « 👍 », et les
-- signalements existent pour ce qui doit l'être.
create policy "chacun retire sa propre réaction"
  on reactions
  for delete
  to authenticated
  using (profil_id = prive.mon_profil());

-- ------------------------------------------------------------
-- LE MÉNAGE.
--
-- « sujet » ne pouvant pas être une clé étrangère, rien n'efface les
-- réactions d'une photo supprimée : elles resteraient à compter des
-- « 👏 » pour une image qui n'existe plus, et la table grossirait
-- sans que personne le voie.
--
-- Deux déclencheurs, un par table concernée. C'est ce que la clé
-- étrangère aurait fait toute seule, écrit à la main parce qu'elle
-- n'est pas possible ici.
-- ------------------------------------------------------------
create or replace function prive.nettoyer_reactions()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  delete from public.reactions
  where sujet = old.id
    and genre = tg_argv[0];
  return old;
end $$;

revoke all on function prive.nettoyer_reactions() from public, anon;

drop trigger if exists photos_nettoyer_reactions on public.photos;
create trigger photos_nettoyer_reactions
  after delete on public.photos
  for each row execute function prive.nettoyer_reactions('photo');

drop trigger if exists messages_nettoyer_reactions on public.messages;
create trigger messages_nettoyer_reactions
  after delete on public.messages
  for each row execute function prive.nettoyer_reactions('message');
