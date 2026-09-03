-- ============================================================
-- La participation FIXÉE, et l'argent qui arrive en plusieurs fois.
--
-- « Dans la création d'un événement ou sortie, ajouter une
-- fonctionnalité pour fixer la participation. Et parfois un membre le
-- paie en espèces, alors on peut valider directement la participation
-- dans l'app sans que le membre envoie une invitation. Et parfois un
-- membre paie petit à petit, alors ajouter aussi une fonctionnalité
-- pour cela. »
--
-- ------------------------------------------------------------
-- CE QUI EXISTAIT DÉJÀ, ET QUE JE NE REFAIS PAS
--
-- Le paiement en plusieurs fois est DÉJÀ possible : la table
-- « versements » enregistre un versement par envoi, avec sa date, son
-- montant et sa référence. Trois versements de dix mille ariary sont
-- donc trois lignes, et cela marche depuis le premier jour.
--
-- Ce qui manquait n'était pas la table, c'était le REPÈRE : rien ne
-- disait combien il fallait payer. Sans montant attendu, « il a versé
-- 30 000 » ne se compare à rien, et l'application ne peut pas dire
-- « il reste 20 000 » — ce qui est la seule chose que le club veut
-- savoir en regardant la liste.
--
-- Une colonne suffit donc, et c'est celle-ci.
-- ------------------------------------------------------------

alter table actualites
  -- Le montant demandé à chaque participant, en ariary. Nul = sortie
  -- gratuite, ou montant pas encore décidé : les deux existent, et
  -- l'écran les traite pareil — il ne réclame rien.
  add column if not exists participation_ar int check (participation_ar >= 0);

comment on column actualites.participation_ar is
  'Participation demandée par personne, en ariary. Nulle = gratuit ou non fixé.';

-- ------------------------------------------------------------
-- ⚠ LE TROU QUE LA MIGRATION 0020 AVAIT LAISSÉ OUVERT.
--
-- Elle a posé « figer_validation », un déclencheur BEFORE UPDATE :
-- personne d'autre que l'auteur de la sortie ne peut valider une
-- inscription EXISTANTE.
--
-- Mais rien ne gardait la CRÉATION. Or le club demande maintenant
-- d'inscrire directement un membre qui paie en espèces — c'est-à-dire
-- de créer une inscription DÉJÀ VALIDÉE. La règle
-- « l'administration gère les participations » l'autorise à tout
-- administrateur : n'importe lequel pouvait donc valider une
-- inscription sur la sortie d'un autre, en la créant plutôt qu'en la
-- modifiant.
--
-- C'est exactement le même défaut que la migration 0016 avait dû
-- corriger pour les rôles : le déclencheur gardait la mise à jour, et
-- l'insertion passait à côté. Deuxième fois ; je le note pour que la
-- troisième soit cherchée avant d'être trouvée.
-- ------------------------------------------------------------
create or replace function prive.figer_validation_creation()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  -- Le serveur travaille sans session : migrations et console.
  if auth.uid() is null then
    return new;
  end if;

  -- Une inscription ORDINAIRE — celle qu'un membre dépose pour
  -- lui-même — n'est ni validée ni refusée à la création. Elle ne
  -- concerne pas cette garde.
  if new.valide_le is null and new.refuse_le is null then
    return new;
  end if;

  if not exists (
    select 1 from public.actualites a
    where a.id = new.actualite_id
      and a.auteur_id = prive.mon_profil()
  ) then
    raise exception
      'seul l''administrateur qui a créé cette sortie inscrit un membre déjà validé';
  end if;

  return new;
end $$;

revoke all on function prive.figer_validation_creation() from public, anon;

drop trigger if exists participations_figer_creation on public.participations;
create trigger participations_figer_creation
  before insert on public.participations
  for each row execute function prive.figer_validation_creation();

-- ------------------------------------------------------------
-- QUI POINTE UN VERSEMENT.
--
-- La règle d'origine réservait cela à l'administration, ce qui était
-- juste tant que l'administration était un bloc. Depuis la 0020,
-- c'est l'AUTEUR de la sortie qui décide : c'est lui qui encaisse les
-- espèces au bord du tapis, et lui qui sait ce qui reste dû.
--
-- On lui ouvre donc la porte SANS la fermer à l'administration : elle
-- tient la comptabilité du club, et lui retirer l'accès aux
-- versements ferait perdre la vue d'ensemble. C'est un élargissement
-- étroit, à ceux qui organisent, et il est délibéré.
-- ------------------------------------------------------------
drop policy if exists "l'auteur de la sortie pointe les versements" on versements;

create policy "l'auteur de la sortie pointe les versements"
  on versements
  for all
  to authenticated
  using (
    exists (
      select 1
      from participations p
      join actualites a on a.id = p.actualite_id
      where p.id = versements.participation_id
        and a.auteur_id = prive.mon_profil()
    )
  )
  with check (
    exists (
      select 1
      from participations p
      join actualites a on a.id = p.actualite_id
      where p.id = versements.participation_id
        and a.auteur_id = prive.mon_profil()
    )
  );
