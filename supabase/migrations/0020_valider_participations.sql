-- ============================================================
-- Valider les inscriptions à une sortie.
--
-- « Pour la participation d'une sortie, ajouter un écran pour
-- visualiser les participations en attente d'une validation, et
-- seul l'admin qui a créé la sortie qui peut le voir et valider. »
--
-- ------------------------------------------------------------
-- CE QUI ANCRE LA RÈGLE : actualites.auteur_id
--
-- Tout repose sur « qui a créé la sortie », et j'ai vérifié avant
-- d'écrire une ligne que cette colonne est digne de confiance :
--
--   · un déclencheur BEFORE INSERT — « actualites_auteur » — la force
--     à prive.mon_profil(). Le téléphone ne l'envoie pas et ne peut
--     pas la falsifier ;
--   · il ne se déclenche PAS à la mise à jour. Corriger une actualité
--     n'en transfère donc pas la paternité, et le droit de valider ne
--     change pas de main parce qu'un autre administrateur a corrigé
--     une virgule.
--
-- Sans ces deux propriétés, la règle demandée n'aurait rien voulu
-- dire.
--
-- ------------------------------------------------------------
-- ⚠ UNE FUITE TROUVÉE EN CHEMIN, ET CORRIGÉE ICI
--
-- La règle de lecture des participations était :
--
--     using (mon_role() is not null)
--
-- C'est-à-dire : TOUT membre du club lit TOUTES les participations —
-- le montant promis de chacun, et la note laissée au club. Un élève
-- pouvait donc savoir ce que chaque autre élève a promis de verser
-- pour la sortie, et lire « je viens avec ma sœur, elle n'a pas
-- d'argent ».
--
-- Ce n'était voulu nulle part : le commentaire d'origine disait
-- « l'administration voit tout, parce qu'elle organise la sortie et
-- compte les places » — l'intention était bonne, la règle écrite
-- disait autre chose.
--
-- Elle est resserrée : chacun voit LA SIENNE, l'administration voit
-- tout. Rien de ce que l'application affiche aujourd'hui n'en
-- dépend — l'écran d'un membre ne demande que sa propre inscription,
-- et l'écran d'administration est réservé à l'administration.
-- ============================================================

alter table participations
  -- Quand elle a été validée. Nulle = EN ATTENTE, ce qui est l'état
  -- de départ de toute inscription et le contenu du nouvel écran.
  add column if not exists valide_le  timestamptz,
  add column if not exists valide_par uuid references profils (id) on delete set null,
  -- Refusée, avec son motif. Le club n'a demandé que la validation,
  -- mais une file d'attente d'où l'on ne peut QUE valider ne se vide
  -- jamais de ce qui ne doit pas l'être : l'inscription resterait
  -- « en attente » pour toujours, et l'écran finirait par ne plus
  -- rien vouloir dire. Le motif est facultatif et s'affiche au
  -- membre — un refus sans raison ne s'explique pas au bord du tapis.
  add column if not exists refuse_le  timestamptz,
  add column if not exists motif      text;

-- Les inscriptions EN ATTENTE, qui sont ce que l'écran demande. Un
-- index partiel : il ne porte que sur les lignes non traitées, donc
-- il reste petit même quand des années de sorties s'accumulent.
create index if not exists participations_en_attente_idx
  on participations (actualite_id)
  where valide_le is null and refuse_le is null;

-- ------------------------------------------------------------
-- QUI VALIDE : l'auteur de la sortie, et personne d'autre.
--
-- Pas « l'administration » : la demande est explicite, et elle a du
-- sens. Celui qui organise la sortie sait combien de places il reste
-- dans le taxi-brousse, qui a déjà versé, et qui il attend. Un autre
-- administrateur validerait sans savoir.
--
-- « with check » répète la condition sur la ligne APRÈS écriture :
-- sans lui, on pourrait valider une inscription puis, dans la même
-- mise à jour, la rattacher à une autre sortie.
-- ------------------------------------------------------------
drop policy if exists "l'auteur de la sortie valide les inscriptions" on participations;

create policy "l'auteur de la sortie valide les inscriptions"
  on participations
  for update
  to authenticated
  using (
    exists (
      select 1 from actualites a
      where a.id = participations.actualite_id
        and a.auteur_id = prive.mon_profil()
    )
  )
  with check (
    exists (
      select 1 from actualites a
      where a.id = participations.actualite_id
        and a.auteur_id = prive.mon_profil()
    )
  );

-- ------------------------------------------------------------
-- La LECTURE, resserrée.
--
-- Voir l'avertissement en tête de fichier : la règle laissait chaque
-- membre lire le montant promis et la note de tous les autres.
-- ------------------------------------------------------------
drop policy if exists "je vois les participations" on participations;

create policy "je vois les participations"
  on participations
  for select
  to authenticated
  using (
    -- La mienne.
    profil_id = prive.mon_profil()
    -- Ou celles des sorties que j'ai créées : c'est ce que le nouvel
    -- écran affiche, et cela vaut aussi pour un administrateur qui
    -- aurait perdu son rôle entre-temps — sa sortie reste la sienne.
    or exists (
      select 1 from actualites a
      where a.id = participations.actualite_id
        and a.auteur_id = prive.mon_profil()
    )
    -- Ou l'administration, qui pointe les versements et compte les
    -- places. C'est ce que le commentaire d'origine disait vouloir.
    or prive.mon_role() = 'admin'
  );

-- ------------------------------------------------------------
-- ⚠ CE QUE LE MEMBRE NE DOIT PAS POUVOIR ÉCRIRE.
--
-- « je corrige mon inscription » l'autorise à mettre à jour SA ligne.
-- Sans garde, il y écrirait « valide_le = now() » et se validerait
-- lui-même — ce qui viderait la fonctionnalité de tout son sens, en
-- une requête, depuis n'importe quel outil.
--
-- Une règle d'accès ne sait pas distinguer les colonnes : elle porte
-- sur la ligne entière. C'est donc un déclencheur qui le fait.
--
-- Il laisse passer le travail du serveur (auth.uid() nul) et l'auteur
-- de la sortie ; il refuse à tout autre de toucher aux quatre
-- colonnes de décision, y compris au propriétaire de l'inscription.
-- ------------------------------------------------------------
create or replace function prive.figer_validation()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if (new.valide_le  is distinct from old.valide_le
   or new.valide_par is distinct from old.valide_par
   or new.refuse_le  is distinct from old.refuse_le
   or new.motif      is distinct from old.motif)
   and not exists (
     select 1 from public.actualites a
     where a.id = new.actualite_id
       and a.auteur_id = prive.mon_profil()
   ) then
    raise exception
      'seul l''administrateur qui a créé cette sortie valide les inscriptions';
  end if;

  return new;
end $$;

revoke all on function prive.figer_validation() from public, anon;

drop trigger if exists participations_figer_validation on public.participations;
create trigger participations_figer_validation
  before update on public.participations
  for each row execute function prive.figer_validation();
