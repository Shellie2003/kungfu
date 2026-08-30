-- ============================================================
-- Les pièces jointes des conversations.
--
-- messages.piece existait depuis le premier jour et rien ne l'a
-- jamais écrite. Un maître qui voulait montrer l'affiche d'une
-- compétition la décrivait en toutes lettres.
--
-- ⚠ DÉCISION DE SÉCURITÉ À RELIRE ⚠
-- ----------------------------------
-- Jusqu'ici, SEULE l'administration pouvait déposer un fichier :
-- portraits et album sont alimentés par elle. Cette migration ouvre
-- l'écriture aux MEMBRES — il le faut, puisque n'importe qui peut
-- écrire un message, et qu'une pièce jointe accompagne un message.
--
-- C'est le seul endroit du projet où un élève écrit dans le
-- stockage. Elle est donc tenue au plus serré :
--
--   1. Un seau à part. Rien de ce qui suit ne touche « portraits »
--      ni « album » : leurs règles restent « l'administration seule ».
--
--   2. Le chemin PORTE le salon : « <salon>/<hasard>.jpg ». La règle
--      d'accès lit ce premier dossier et vérifie l'appartenance au
--      salon. On ne dépose donc que dans une conversation dont on
--      est membre, et l'on ne lit que celles-là — l'espace des
--      maîtres reste fermé par la même mécanique que ses messages.
--
--   3. Images seules, 5 Mo. Ni PDF, ni archive, ni exécutable : le
--      club n'en a pas besoin, et chaque type accepté est une
--      surface de plus.
--
--   4. AUCUNE suppression, sauf par l'administration. Un membre qui
--      pourrait effacer effacerait la pièce d'un autre — le chemin
--      d'un fichier se devine dès qu'on l'a vu passer.
--
-- Ce que cela n'empêche pas, et qu'il faut dire : un membre d'un
-- salon peut y déposer ce qu'il veut, dans la limite ci-dessus. La
-- modération existe pour cela — un message se signale, et se retire.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pieces', 'pieces', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- Le salon d'un chemin.
--
-- « storage.foldername(name) » rend les dossiers ; le premier est le
-- salon. Le convertir en uuid directement ferait ÉCHOUER la règle
-- sur un chemin mal formé — une erreur, pas un refus, ce qui est
-- pire : on ne sait plus si l'accès a été refusé ou si la base a
-- trébuché. On vérifie donc la forme avant de convertir, et un
-- chemin qui n'a pas la bonne forme rend « null », donc n'appartient
-- à aucun salon, donc n'est accessible à personne.
-- ------------------------------------------------------------
create or replace function prive.salon_du_chemin(p_nom text)
returns uuid
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when (storage.foldername(p_nom))[1] ~*
         '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then ((storage.foldername(p_nom))[1])::uuid
  end
$$;

revoke all on function prive.salon_du_chemin(text) from public, anon;
grant execute on function prive.salon_du_chemin(text) to authenticated;

drop policy if exists "les membres voient les pièces de leurs salons" on storage.objects;
drop policy if exists "les membres joignent dans leurs salons"        on storage.objects;
drop policy if exists "l'administration retire une pièce"             on storage.objects;

create policy "les membres voient les pièces de leurs salons" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pieces'
    and prive.est_membre(prive.salon_du_chemin(name))
  );

create policy "les membres joignent dans leurs salons" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pieces'
    and prive.est_membre(prive.salon_du_chemin(name))
  );

/* Pas de mise à jour : remplacer le contenu d'un fichier déjà envoyé
   permettrait de changer après coup ce que les autres ont vu. */
create policy "l'administration retire une pièce" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pieces' and prive.mon_role() = 'admin');
