-- ============================================================
-- L'ENCADREMENT tient l'image du club.
--
-- Décision du club, prise explicitement : les maîtres, et non la
-- seule administration, peuvent poser la photo du club et alimenter
-- les albums. Ils encadrent déjà les élèves et tiennent l'espace
-- confidentiel ; leur confier l'image du club est cohérent, et cela
-- lève un blocage réel — l'administration n'est pas au bord du tapis
-- le samedi matin, les maîtres si.
--
-- CE QUI EST ÉLARGI, ET RIEN D'AUTRE
-- ----------------------------------
-- La photo du club et les albums. PAS le reste des réglages : le
-- numéro MVola qui reçoit les participations, le nom du titulaire,
-- le préfixe des matricules restent à l'administration seule.
-- Élargir « reglages » en bloc aurait donné à un maître la main sur
-- le compte qui reçoit l'argent du club — ce n'est pas ce qui a été
-- demandé, et personne ne s'en serait aperçu avant un litige.
--
-- C'est pourquoi la règle des réglages nomme la CLÉ.
-- ============================================================

-- ---------------------------------------------- Les réglages

-- On ne touche pas à la règle de l'administration : elle garde tout.
-- On en AJOUTE une, étroite, pour l'encadrement.
drop policy if exists "l'encadrement pose la photo du club" on public.reglages;

create policy "l'encadrement pose la photo du club"
  on public.reglages
  for all
  to authenticated
  using (
    cle in ('photo_club', 'logo_club')
    and prive.mon_role() in ('maitre', 'admin')
  )
  with check (
    cle in ('photo_club', 'logo_club')
    and prive.mon_role() in ('maitre', 'admin')
  );

-- ---------------------------------------------- Les albums et les photos

drop policy if exists "l'encadrement gère les albums" on public.albums;
drop policy if exists "l'encadrement gère les photos" on public.photos;

create policy "l'encadrement gère les albums"
  on public.albums
  for all
  to authenticated
  using (prive.mon_role() in ('maitre', 'admin'))
  with check (prive.mon_role() in ('maitre', 'admin'));

create policy "l'encadrement gère les photos"
  on public.photos
  for all
  to authenticated
  using (prive.mon_role() in ('maitre', 'admin'))
  with check (prive.mon_role() in ('maitre', 'admin'));

-- ---------------------------------------------- Le seau des images
--
-- Une règle sur la table ne suffit pas : la photo elle-même vit dans
-- le seau « album », dont le dépôt était réservé à l'administration.
-- Sans cette moitié-là, un maître aurait écrit la ligne et n'aurait
-- pas pu envoyer le fichier — la moitié d'une permission, c'est une
-- panne, pas une protection.
--
-- « portraits » n'est PAS élargi : ce sont les photos d'identité des
-- membres, mineurs compris, et rien dans la demande ne les concerne.

drop policy if exists "l'encadrement dépose dans l'album" on storage.objects;
drop policy if exists "l'encadrement remplace dans l'album" on storage.objects;

create policy "l'encadrement dépose dans l'album"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'album'
    and prive.mon_role() in ('maitre', 'admin')
  );

create policy "l'encadrement remplace dans l'album"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'album'
    and prive.mon_role() in ('maitre', 'admin')
  )
  with check (
    bucket_id = 'album'
    and prive.mon_role() in ('maitre', 'admin')
  );

-- La SUPPRESSION reste à l'administration. Retirer une photo est
-- définitif — il n'y a pas de corbeille — et rien dans la demande ne
-- portait sur l'effacement.
