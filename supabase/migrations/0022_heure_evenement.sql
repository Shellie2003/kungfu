-- ============================================================
-- L'HEURE D'UN ÉVÉNEMENT.
--
-- La maquette écrivait, sous la date d'une sortie :
--
--     Samedi 22 novembre
--     Départ 6h00 · retour vers 18h00
--
-- L'application n'avait que « date_evt », une DATE sans heure. La
-- seconde ligne manquait donc, et avec elle la seule information que
-- l'on vient chercher la veille d'une sortie : à quelle heure on
-- part. Elle se disait dans le texte libre — « Départ 6h00 devant la
-- salle » — ce qui marche tant que quelqu'un pense à l'écrire, et
-- tant que personne ne le cherche dans un paragraphe de dix lignes.
--
-- ------------------------------------------------------------
-- POURQUOI DEUX COLONNES « time » ET NON UN « timestamptz »
--
-- Changer « date_evt » en horodatage aurait été plus élégant sur le
-- papier et faux en pratique :
--
--   · les actualités existantes n'ont pas d'heure, et leur en
--     inventer une (minuit ? midi ?) ferait afficher une heure que
--     personne n'a saisie ;
--   · un horodatage porte un FUSEAU. Madagascar est à UTC+3 sans
--     heure d'été, mais l'application affiche avec le fuseau du
--     téléphone : un membre en voyage lirait « départ 3h00 ». Une
--     heure de mur — « on part à 6h » — n'est pas un instant, c'est
--     une convention locale, et « time » est exactement cela ;
--   · une sortie a une heure de DÉBUT et souvent une de fin, et un
--     seul horodatage n'en porte qu'une.
--
-- Les deux sont facultatives, comme la date elle-même : beaucoup
-- d'annonces n'ont pas d'heure, et l'écran n'affiche que ce qui est
-- renseigné.
-- ------------------------------------------------------------

alter table actualites
  add column if not exists heure_evt time,
  add column if not exists heure_fin time;

comment on column actualites.heure_evt is
  'Heure de début, heure locale du club. Nulle = non précisée.';
comment on column actualites.heure_fin is
  'Heure de fin approximative. Nulle = non précisée.';

-- Une fin AVANT le début est une faute de saisie, pas une donnée. La
-- contrainte la refuse au lieu de laisser l'écran écrire
-- « 18h00 · retour vers 6h00 », que personne ne relit.
--
-- Elle ne dit rien des sorties qui passent minuit : une heure de mur
-- ne sait pas compter les jours, et le club n'en organise pas.
alter table actualites
  drop constraint if exists actualites_heures_coherentes;
alter table actualites
  add constraint actualites_heures_coherentes
  check (heure_fin is null or heure_evt is null or heure_fin > heure_evt);
