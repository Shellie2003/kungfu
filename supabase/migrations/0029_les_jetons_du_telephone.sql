-- ============================================================
-- 0029 — LES JETONS DU TÉLÉPHONE.
--
-- « not-push — Notification sur le téléphone » : la dernière ligne
-- du cahier des charges restée sans preuve. Aujourd'hui le club ne
-- reçoit RIEN quand l'application est fermée ; il faut l'ouvrir pour
-- découvrir qu'un cours a changé d'heure.
--
-- ------------------------------------------------------------
-- CE QUE CETTE MIGRATION FAIT, ET CE QU'ELLE NE FAIT PAS
--
-- Elle AJOUTE une table. Elle ne modifie, ne supprime et ne déplace
-- AUCUNE donnée existante : le club a maintenant ses vraies fiches
-- dedans, et rien ici ne les regarde.
--
-- ------------------------------------------------------------
-- POURQUOI UNE TABLE, ET NON UNE COLONNE SUR « profils »
--
-- Une personne a plusieurs téléphones — le sien, celui du club, un
-- ancien qu'elle prête à son enfant. Une colonne n'en garderait
-- qu'un, et le membre cesserait d'être prévenu sur les autres sans
-- que rien ne le dise.
--
-- La clé primaire est le JETON, pas le profil : c'est le jeton qui
-- est unique au monde, et c'est lui que Firebase renvoie. Un même
-- téléphone qui change de main doit d'ailleurs changer de profil
-- sans se dédoubler — d'où « on conflict (jeton) do update ».
--
-- ------------------------------------------------------------
-- ⚠ POURQUOI « on delete cascade » EST ICI LE BON CHOIX
--
-- Ailleurs dans ce schéma on a retenu « set null » pour qu'un membre
-- parti ne troue pas les conversations. Ici c'est l'inverse : un
-- jeton sans profil ne sert à rien, et le garder reviendrait à
-- continuer d'envoyer des notifications du club au téléphone de
-- quelqu'un qui n'en fait plus partie. On l'efface.
--
-- ------------------------------------------------------------
-- CE QUE LE JETON EST, ET CE QU'IL N'EST PAS
--
-- Ce n'est pas un secret de connexion : il ne donne accès à aucune
-- donnée du club. Il permet UNIQUEMENT de faire sonner un téléphone.
-- Mais il désigne un appareil, donc une personne — on ne le laisse
-- lire à personne d'autre qu'elle, et au serveur qui envoie.
-- ============================================================

create table if not exists public.jetons_push (
  jeton       text primary key,
  profil_id   uuid not null references public.profils (id) on delete cascade,
  plateforme  text not null default 'android',
  cree_le     timestamptz not null default now(),
  vu_le       timestamptz not null default now()
);

create index if not exists jetons_push_profil on public.jetons_push (profil_id);

comment on table public.jetons_push is
  'Un jeton Firebase par téléphone. Sert seulement à faire sonner l''appareil — voir 0029.';

-- ------------------------------------------------------------
-- LES RÈGLES D'ACCÈS.
--
-- Chacun pose et retire les siens ; personne ne lit ceux des autres.
-- L'envoi, lui, se fait depuis la fonction « pousser » avec la clé de
-- service, qui passe outre — c'est le seul endroit qui a besoin de
-- lire toute la table, et il ne tourne pas sur un téléphone.
-- ------------------------------------------------------------
alter table public.jetons_push enable row level security;

drop policy if exists jetons_push_lire on public.jetons_push;
create policy jetons_push_lire on public.jetons_push
  for select to authenticated
  using (profil_id = prive.mon_profil());

drop policy if exists jetons_push_poser on public.jetons_push;
create policy jetons_push_poser on public.jetons_push
  for insert to authenticated
  with check (profil_id = prive.mon_profil());

drop policy if exists jetons_push_rafraichir on public.jetons_push;
create policy jetons_push_rafraichir on public.jetons_push
  for update to authenticated
  using (profil_id = prive.mon_profil())
  with check (profil_id = prive.mon_profil());

drop policy if exists jetons_push_retirer on public.jetons_push;
create policy jetons_push_retirer on public.jetons_push
  for delete to authenticated
  using (profil_id = prive.mon_profil());

-- ------------------------------------------------------------
-- ⚠ LE MÉNAGE, ET POURQUOI IL EST NÉCESSAIRE.
--
-- Un jeton meurt sans prévenir : l'application désinstallée, les
-- données effacées, le téléphone perdu. Firebase répond alors
-- « UNREGISTERED » — et la fonction « pousser » efface le jeton en
-- retour.
--
-- Mais elle ne peut effacer que ceux à qui elle écrit. Un téléphone
-- qui ne se reconnecte jamais garderait son jeton pour toujours, et
-- la table grossirait de lignes mortes qu'on paierait à chaque envoi.
-- Six mois sans reparaître : le membre a changé d'appareil.
-- ------------------------------------------------------------
create or replace function public.jetons_push_oublier_les_morts()
returns integer
language sql
security definer
set search_path = public, pg_temp
as $$
  with morts as (
    delete from jetons_push where vu_le < now() - interval '6 months'
    returning 1
  )
  select count(*)::integer from morts
$$;

revoke all on function public.jetons_push_oublier_les_morts() from public, anon, authenticated;
grant execute on function public.jetons_push_oublier_les_morts() to service_role;
