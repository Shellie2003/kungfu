-- ============================================================
-- Kung-fu Waishi Analamahitsy — 3. Les règles d'accès
--
-- C'est le fichier qui protège l'espace des maîtres. Pas
-- l'interface : la clé publique de l'application se lit dans
-- n'importe quel téléphone, et n'importe qui peut interroger la
-- base directement. Ces règles s'appliquent à toute requête, d'où
-- qu'elle vienne.
--
-- Règle de travail : une table sans « enable row level security »
-- est une table ouverte à tous. On active d'abord, on autorise
-- ensuite.
-- ============================================================

-- ------------------------------------------------------------
-- Deux fonctions de service.
--
-- security definer les fait tourner avec les droits de leur
-- propriétaire, donc sans repasser par les règles d'accès. C'est
-- indispensable : une règle sur membres_salon qui interrogerait
-- membres_salon partirait en récursion infinie. C'est l'erreur la
-- plus courante sur ce type de base.
--
-- set search_path est obligatoire sur une fonction security
-- definer : sans lui, un utilisateur peut faire pointer un nom de
-- table vers une table à lui.
-- ------------------------------------------------------------
-- auth.uid() est l'identifiant du COMPTE. L'identifiant de la FICHE
-- est autre chose, puisqu'un membre peut exister sans compte. Tout ce
-- qui suit compare des identifiants de fiche : d'où mon_profil().
create or replace function public.mon_profil()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select id from public.profils where compte_id = auth.uid() $$;

create or replace function public.mon_role()
returns role_membre
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select role from public.profils where compte_id = auth.uid() $$;

create or replace function public.est_membre(p_salon uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.membres_salon
    where salon_id = p_salon and profil_id = public.mon_profil()
  )
$$;

revoke execute on function public.mon_profil() from public, anon;
grant  execute on function public.mon_profil() to authenticated;
revoke execute on function public.mon_role() from public, anon;
revoke execute on function public.est_membre(uuid) from public, anon;
grant  execute on function public.mon_role() to authenticated;
grant  execute on function public.est_membre(uuid) to authenticated;

-- ------------------------------------------------------------
-- Toutes les tables sont fermées par défaut.
-- ------------------------------------------------------------
alter table profils         enable row level security;
alter table profils_prives  enable row level security;
alter table tuteurs         enable row level security;
alter table actualites      enable row level security;
alter table albums          enable row level security;
alter table photos          enable row level security;
alter table salons          enable row level security;
alter table membres_salon   enable row level security;
alter table messages        enable row level security;
alter table signalements    enable row level security;
alter table journal_acces   enable row level security;
alter table notifications   enable row level security;
alter table grades          enable row level security;
alter table horaires        enable row level security;
alter table reglages        enable row level security;
alter table participations  enable row level security;
alter table versements      enable row level security;

-- ============================================================
-- L'annuaire
-- ============================================================

-- Tout membre connecté voit l'annuaire. C'est le propos de l'écran
-- Étudiants : nom, prénom, grade, photo.
-- mon_role() is not null vaut « je suis un membre du club ». Un jeton
-- valide ne suffit pas : il faut une fiche. Sans cette condition,
-- l'annuaire s'ouvrirait à un compte dont la fiche a été retirée.
create policy "annuaire visible des membres" on profils
  for select to authenticated
  using (mon_role() is not null and (actif or mon_role() = 'admin'));

-- Chacun corrige sa fiche. Mais les règles d'accès travaillent par
-- ligne, pas par colonne : « je modifie ma fiche » autoriserait donc
-- aussi « je me nomme maître ». Le déclencheur ci-dessous ferme
-- cette porte — elle était ouverte, un test l'a montrée.
create policy "je corrige ma fiche" on profils
  for update to authenticated
  using (compte_id = auth.uid())
  with check (compte_id = auth.uid());

create or replace function public.figer_profil()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if mon_role() = 'admin' then
    return new;
  end if;
  if new.role      is distinct from old.role
  or new.numero    is distinct from old.numero
  or new.grade_id  is distinct from old.grade_id
  or new.actif     is distinct from old.actif
  -- compte_id gelé aussi : sans cela un membre rattacherait sa fiche
  -- au compte d'un autre, ou la fiche d'un maître au sien.
  or new.compte_id is distinct from old.compte_id then
    raise exception
      'le rôle, le numéro, le grade, le compte et l''activation ne se modifient que par l''administration';
  end if;
  return new;
end $$;

create trigger profils_figer
  before update on profils
  for each row execute function public.figer_profil();

create policy "l'administration gère les fiches" on profils
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- Naissance, téléphone, adresse : moi, les maîtres, l'administration.
-- Un élève ne voit pas la date de naissance d'un autre élève.
create policy "vie privée réservée" on profils_prives
  for select to authenticated
  using (profil_id = mon_profil() or mon_role() in ('maitre', 'admin'));

create policy "l'administration tient la vie privée" on profils_prives
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- Les tuteurs : mêmes règles. Un parent d'élève n'est pas un
-- contact d'annuaire.
create policy "tuteurs réservés" on tuteurs
  for select to authenticated
  using (profil_id = mon_profil() or mon_role() in ('maitre', 'admin'));

create policy "l'administration tient les tuteurs" on tuteurs
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- ============================================================
-- Le casier et l'album
-- ============================================================

create policy "actualités publiées" on actualites
  for select to authenticated
  using (mon_role() is not null and (publiee or mon_role() = 'admin'));

create policy "l'administration publie" on actualites
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

create policy "albums visibles" on albums
  for select to authenticated using (mon_role() is not null);

create policy "l'administration gère les albums" on albums
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

create policy "photos visibles" on photos
  for select to authenticated using (mon_role() is not null);

create policy "l'administration gère les photos" on photos
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- ------------------------------------------------------------
-- Grades, horaires, réglages : lus par tous les membres, écrits par
-- l'administration seule. Ce sont les listes que le club voulait
-- pouvoir modifier sans nouvelle version de l'application.
-- ------------------------------------------------------------
create policy "grades visibles" on grades
  for select to authenticated using (mon_role() is not null);
create policy "l'administration tient les grades" on grades
  for all to authenticated
  using (mon_role() = 'admin') with check (mon_role() = 'admin');

create policy "horaires visibles" on horaires
  for select to authenticated using (mon_role() is not null);
create policy "l'administration tient les horaires" on horaires
  for all to authenticated
  using (mon_role() = 'admin') with check (mon_role() = 'admin');

create policy "réglages visibles" on reglages
  for select to authenticated using (mon_role() is not null);
create policy "l'administration tient les réglages" on reglages
  for all to authenticated
  using (mon_role() = 'admin') with check (mon_role() = 'admin');

-- ------------------------------------------------------------
-- Participations et versements
--
-- Chacun s'inscrit pour lui-même. L'administration voit tout, parce
-- qu'elle organise la sortie et compte les places.
-- ------------------------------------------------------------
create policy "je vois les participations" on participations
  for select to authenticated
  using (mon_role() is not null);

create policy "je m'inscris moi-même" on participations
  for insert to authenticated
  with check (profil_id = mon_profil());

create policy "je corrige mon inscription" on participations
  for update to authenticated
  using (profil_id = mon_profil()) with check (profil_id = mon_profil());

create policy "je me désinscris" on participations
  for delete to authenticated
  using (profil_id = mon_profil());

create policy "l'administration gère les participations" on participations
  for all to authenticated
  using (mon_role() = 'admin') with check (mon_role() = 'admin');

-- Un versement est constaté par l'administration, jamais déclaré par
-- le membre : l'application ne parle pas à l'opérateur et ne peut donc
-- rien constater du tout.
create policy "je vois mes versements" on versements
  for select to authenticated
  using (
    mon_role() = 'admin'
    or exists (select 1 from participations p
               where p.id = participation_id and p.profil_id = mon_profil())
  );

create policy "l'administration pointe les versements" on versements
  for all to authenticated
  using (mon_role() = 'admin') with check (mon_role() = 'admin');

-- ============================================================
-- La messagerie — le cœur du sujet
-- ============================================================

-- Un salon n'existe que pour ceux qui y sont inscrits. L'espace
-- des maîtres n'apparaît donc pas dans la liste d'un élève : pas
-- caché par l'interface, absent de la réponse.
create policy "mes salons" on salons
  for select to authenticated
  using (est_membre(id));

create policy "l'administration ouvre les salons" on salons
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- Je vois qui est avec moi, et seulement là où je suis.
create policy "les membres de mes salons" on membres_salon
  for select to authenticated
  using (profil_id = mon_profil() or est_membre(salon_id));

-- Je peux marquer un salon comme lu — mon inscription, pas celle
-- d'un autre.
create policy "je marque mes salons comme lus" on membres_salon
  for update to authenticated
  using (profil_id = mon_profil())
  with check (profil_id = mon_profil());

-- Inscrire quelqu'un dans un salon est un acte d'administration.
-- Se déclarer maître depuis son téléphone ne produit rien.
create policy "l'administration inscrit" on membres_salon
  for all to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- Lire un message : si et seulement si je suis inscrit au salon.
-- Un élève qui interroge la base sur les messages des maîtres
-- reçoit une liste vide. Pas une erreur : rien.
create policy "lire les messages de mes salons" on messages
  for select to authenticated
  using (est_membre(salon_id));

-- Écrire : dans mes salons, et sous mon nom. auteur_id est forcé à
-- mon identité par la règle, pas par l'application — on ne peut pas
-- écrire sous le nom d'un autre en trafiquant la requête.
create policy "écrire dans mes salons" on messages
  for insert to authenticated
  with check (est_membre(salon_id) and auteur_id = mon_profil());

-- Corriger : l'auteur, pendant quinze minutes. Passé ce délai le
-- fil devient une trace stable, ce qui compte en cas de litige.
create policy "corriger mon message" on messages
  for update to authenticated
  using (auteur_id = mon_profil() and cree_le > now() - interval '15 minutes')
  with check (auteur_id = mon_profil());

create policy "l'administration masque un message" on messages
  for update to authenticated
  using (mon_role() = 'admin')
  with check (mon_role() = 'admin');

-- Aucune règle « for delete » : personne ne supprime une ligne de
-- messages, pas même l'administration. On marque supprime_le.

-- Signaler : n'importe quel membre, sur un message qu'il peut lire.
create policy "signaler un message que je vois" on signalements
  for insert to authenticated
  with check (
    auteur_id = mon_profil()
    and exists (select 1 from messages m where m.id = message_id and est_membre(m.salon_id))
  );

create policy "je vois mes signalements" on signalements
  for select to authenticated
  using (auteur_id = mon_profil() or mon_role() in ('maitre', 'admin'));

create policy "les maîtres traitent les signalements" on signalements
  for update to authenticated
  using (mon_role() in ('maitre', 'admin'))
  with check (mon_role() in ('maitre', 'admin'));

-- Le journal s'écrit, ne se relit que par l'administration, et ne
-- se modifie jamais.
create policy "j'écris mon passage" on journal_acces
  for insert to authenticated
  with check (profil_id = mon_profil());

create policy "l'administration lit le journal" on journal_acces
  for select to authenticated
  using (mon_role() = 'admin');

-- Mes notifications, et rien que les miennes.
create policy "mes notifications" on notifications
  for select to authenticated
  using (profil_id = mon_profil());

create policy "je marque mes notifications lues" on notifications
  for update to authenticated
  using (profil_id = mon_profil())
  with check (profil_id = mon_profil());

create policy "l'administration notifie" on notifications
  for insert to authenticated
  with check (mon_role() = 'admin');

-- ------------------------------------------------------------
-- L'appel que fait l'application en ouvrant l'espace des maîtres.
-- ------------------------------------------------------------
create or replace function public.journaliser_acces(p_salon uuid, p_quoi text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.journal_acces (profil_id, salon_id, quoi)
  values (public.mon_profil(), p_salon, p_quoi)
$$;

revoke execute on function public.journaliser_acces(uuid, text) from public, anon;
grant  execute on function public.journaliser_acces(uuid, text) to authenticated;
