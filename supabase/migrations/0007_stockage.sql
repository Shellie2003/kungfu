-- ============================================================
-- Les seaux de stockage : portraits et album.
--
-- Ils n'existaient pas. L'application envoyait les photos dans le
-- vide et l'administration aurait vu « Bucket not found » au premier
-- essai.
--
-- PRIVÉS, et c'est la décision importante
-- ---------------------------------------
-- Un seau public rend chaque fichier lisible par quiconque possède
-- son adresse. Le chemin est un identifiant tiré au hasard, donc
-- indevinable — mais une adresse se copie, se transfère, se retrouve
-- dans l'historique d'un navigateur ou dans une capture d'écran, et
-- elle ne se révoque jamais.
--
-- Ce sont des photos d'enfants. La commodité d'un seau public ne
-- vaut pas ce risque : le club a demandé la confidentialité, et une
-- photo de mineur accessible à toute personne ayant vu passer un
-- lien n'est pas confidentielle.
--
-- Les seaux sont donc privés. L'application demande des adresses
-- SIGNÉES, valables une heure, et le serveur ne les délivre qu'à qui
-- a le droit de voir le fichier. Une adresse qui fuite expire ; un
-- membre exclu cesse d'en obtenir.
--
-- Ce que cela coûte : un appel de plus pour afficher une liste de
-- photos. Elles sont demandées en lot, pas une par une.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- 5 Mo : un portrait d'annuaire, pas une photo d'appareil reflex.
  -- Au-delà, c'est le forfait des membres qu'on dépense à l'affichage.
  ('portraits', 'portraits', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  -- 10 Mo : une photo de compétition mérite un peu plus de latitude.
  ('album', 'album', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- Qui peut faire quoi.
--
-- storage.objects porte déjà ses propres règles d'accès. On y ajoute
-- les nôtres, dans le même esprit que le reste du projet : les
-- membres regardent, l'administration écrit.
--
-- « anon » n'apparaît nulle part : un visiteur non connecté n'obtient
-- pas d'adresse signée, donc pas de photo.
-- ------------------------------------------------------------
drop policy if exists "les membres voient les portraits"  on storage.objects;
drop policy if exists "les membres voient l'album"        on storage.objects;
drop policy if exists "l'administration dépose"           on storage.objects;
drop policy if exists "l'administration remplace"         on storage.objects;
drop policy if exists "l'administration retire"           on storage.objects;

create policy "les membres voient les portraits" on storage.objects
  for select to authenticated
  using (bucket_id = 'portraits' and prive.mon_profil() is not null);

create policy "les membres voient l'album" on storage.objects
  for select to authenticated
  using (bucket_id = 'album' and prive.mon_profil() is not null);

create policy "l'administration dépose" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('portraits', 'album') and prive.mon_role() = 'admin');

create policy "l'administration remplace" on storage.objects
  for update to authenticated
  using (bucket_id in ('portraits', 'album') and prive.mon_role() = 'admin')
  with check (bucket_id in ('portraits', 'album') and prive.mon_role() = 'admin');

create policy "l'administration retire" on storage.objects
  for delete to authenticated
  using (bucket_id in ('portraits', 'album') and prive.mon_role() = 'admin');
