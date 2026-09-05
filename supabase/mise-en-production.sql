-- ============================================================
-- mise-en-production.sql — Vider les données d'essai, garder le
-- référentiel du club.
--
-- ⚠️⚠️  CE SCRIPT EFFACE DES DONNÉES, DÉFINITIVEMENT.  ⚠️⚠️
--
-- Il n'est PAS une migration, et il n'est pas dans « migrations/ » :
-- une migration décrit le SCHÉMA et se rejoue sur chaque projet.
-- Celui-ci touche aux DONNÉES et ne se lance qu'une fois, sur un
-- projet précis, à un moment précis — le jour où l'on passe de
-- l'essai au service réel.
--
-- Le confondre avec une migration effacerait le club.
--
-- ------------------------------------------------------------
-- POURQUOI CE SCRIPT EXISTE
--
-- Le club a choisi de garder son projet Supabase existant plutôt que
-- d'en créer un neuf. C'est son droit, et cela évite d'avoir à
-- reconfigurer les clés partout. Mais ce projet a servi aux essais :
--
--   · il contient cinq membres INVENTÉS, dont un nommé « ESSAI » ;
--   · les mots de passe de ses quatre comptes de connexion ont
--     circulé en clair dans les échanges de développement — ils
--     doivent être considérés comme connus de tiers ;
--   · le compteur de matricules est déjà avancé : le premier vrai
--     membre du club recevrait F04x005 au lieu de F04x001 ;
--   · deux réglages portent la mention « ESSAI — » et s'afficheraient
--     tels quels sur l'accueil, devant les soixante-quatre membres.
--
-- ------------------------------------------------------------
-- CE QUI RESTE, ET POURQUOI
--
-- Tout n'est pas à jeter. Le référentiel saisi pendant les essais
-- est celui du VRAI club, et le retaper ne servirait à rien :
--
--   · les 6 GRADES — blanche, jaune, orange, verte, bleue, noire —
--     dans le bon ordre ;
--   · les 9 CATÉGORIES : cinq pour les actualités, quatre pour les
--     albums. Elles ont l'air de faire double emploi (« Sortie » et
--     « Sorties ») ; elles n'en font pas, une colonne « genre » les
--     sépare ;
--   · les 4 HORAIRES. Ce sont des créneaux, pas des données
--     personnelles, et l'écran « Le club » de l'administration les
--     corrige en deux appuis. Les effacer ferait perdre une saisie
--     peut-être juste ; les garder ne coûte qu'une relecture.
--     ⚠ À FAIRE RELIRE PAR LE CLUB.
--   · les RÉGLAGES qui ne portent pas de marque d'essai : nom du
--     club, lieu, année de fondation, préfixe des matricules, nom et
--     numéro MVola du responsable. ⚠ À FAIRE RELIRE AUSSI — un
--     numéro MVola faux enverrait l'argent des membres ailleurs.
--
-- ------------------------------------------------------------
-- CE QUI PART
--
-- Tout ce qui est une PERSONNE, ou le CONTENU produit par une
-- personne, plus les fichiers qui vont avec.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. AVANT — pour qu'on sache ce qu'on a effacé.
--
-- Gardé en table temporaire : le compte-rendu de fin le compare à
-- l'état d'après. Sans cela, on lit une liste de zéros sans savoir
-- s'il y avait quelque chose.
-- ------------------------------------------------------------
create temporary table avant on commit drop as
select 'profils' as quoi, count(*) from profils
union all select 'comptes de connexion', count(*) from auth.users
union all select 'actualités',           count(*) from actualites
union all select 'participations',       count(*) from participations
union all select 'versements',           count(*) from versements
union all select 'notifications',        count(*) from notifications
union all select 'salons',               count(*) from salons
union all select 'messages',             count(*) from messages
union all select 'albums',               count(*) from albums
union all select 'photos',               count(*) from photos
union all select 'journal d''accès',     count(*) from journal_acces
union all select 'fichiers stockés',     count(*) from storage.objects
                                          where bucket_id in ('portraits','album','pieces');

-- ------------------------------------------------------------
-- 2. LE CONTENU, dans l'ordre des dépendances.
--
-- « messages » avant « salons » : l'auteur d'un message se met à nul
-- quand le profil part, mais le message RESTE — c'est voulu, on ne
-- fait pas disparaître une conversation à laquelle d'autres ont
-- participé. Ici on veut tout effacer, il faut donc le dire.
-- ------------------------------------------------------------
delete from reactions;
delete from signalements;
delete from messages;
delete from membres_salon;
delete from salons;

delete from photos;
delete from albums;

delete from versements;
delete from participations;
delete from actualites;

delete from notifications;
delete from presences;
delete from journal_acces;

-- ------------------------------------------------------------
-- 3. LES PERSONNES.
--
-- « profils » emporte en cascade la vie privée, les tuteurs,
-- l'appartenance aux salons et les présences — les liens ont été
-- posés ainsi au premier jour.
-- ------------------------------------------------------------
delete from profils;

-- Les comptes de CONNEXION vivent dans « auth », pas ici. Ce sont
-- eux dont les mots de passe ont circulé : les laisser laisserait
-- quatre portes ouvertes sur une base vide, qui se rempliraient de
-- droits le jour où quelqu'un rattacherait une fiche.
delete from auth.users;

-- ------------------------------------------------------------
-- 4. LES FICHIERS — ET POURQUOI ILS NE SONT PAS EFFACÉS ICI.
--
-- Portraits, photos d'album, pièces jointes. La base ne les contient
-- pas : elle contient leurs CHEMINS. Effacer les lignes sans effacer
-- les fichiers laisse de l'espace occupé par des images que plus
-- rien ne désigne — et c'est exactement le mal que la jauge
-- d'occupation sert à éviter.
--
-- ⚠ MAIS CELA NE SE FAIT PAS EN SQL. Essayé, et refusé :
--
--     ERROR: Direct deletion from storage tables is not allowed.
--     Use the Storage API instead.
--     HINT: This prevents accidental data loss from orphaned objects.
--
-- La protection a raison, et dans le bon sens : la ligne est un
-- INDEX, pas le contenu. L'effacer seule rendrait le fichier
-- introuvable ET indestructible — de l'espace perdu pour toujours.
--
-- Les fichiers se vident donc depuis le TABLEAU DE BORD :
--
--     Storage → « portraits », puis « album », puis « pieces »
--             → tout sélectionner → supprimer
--
-- C'est le même détour que fait l'application quand l'administration
-- range les vieux messages : « ranger() » rend la LISTE des chemins,
-- et c'est l'application qui appelle ensuite l'API de stockage.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 5. LE COMPTEUR DE MATRICULES.
--
-- Il est arrivé à quatre pendant les essais. Sans cette remise à
-- zéro, le fondateur du club recevrait F04x005, et les quatre
-- premiers numéros du club n'existeraient jamais. Ce n'est pas
-- grave en soi ; c'est simplement faux, et cela se verrait sur
-- chaque carte de membre imprimée.
-- ------------------------------------------------------------
select setval('numero_membre', 1, false);

-- ------------------------------------------------------------
-- 6. LES RÉGLAGES MARQUÉS « ESSAI ».
--
-- Deux textes de présentation commencent par « ESSAI — » et
-- s'afficheraient tels quels sur l'accueil, devant tout le club. La
-- photo du club pointe vers un fichier qu'on vient d'effacer.
--
-- On les VIDE plutôt que d'inventer un texte : l'application a ses
-- textes par défaut, et un vide se remarque — donc se remplit. Un
-- faux texte plausible, non.
-- ------------------------------------------------------------
update reglages set valeur = null
 where cle in ('presentation', 'presentation_courte', 'photo_club');

-- ------------------------------------------------------------
-- 7. APRÈS — le compte-rendu.
-- ------------------------------------------------------------
select
  a.quoi,
  a.count as avant,
  case a.quoi
    when 'profils'              then (select count(*) from profils)
    when 'comptes de connexion' then (select count(*) from auth.users)
    when 'actualités'           then (select count(*) from actualites)
    when 'participations'       then (select count(*) from participations)
    when 'versements'           then (select count(*) from versements)
    when 'notifications'        then (select count(*) from notifications)
    when 'salons'               then (select count(*) from salons)
    when 'messages'             then (select count(*) from messages)
    when 'albums'               then (select count(*) from albums)
    when 'photos'               then (select count(*) from photos)
    when 'journal d''accès'     then (select count(*) from journal_acces)
    when 'fichiers stockés'     then (select count(*) from storage.objects
                                       where bucket_id in ('portraits','album','pieces'))
  end as apres
from avant a
union all
select '— GARDÉ : grades', null, (select count(*) from grades)
union all
select '— GARDÉ : catégories', null, (select count(*) from categories)
union all
select '— GARDÉ : horaires (à relire)', null, (select count(*) from horaires)
union all
select '— GARDÉ : réglages (à relire)', null, (select count(*) from reglages)
union all
select '— Prochain matricule', null, null;

commit;

-- ============================================================
-- ET MAINTENANT
--
--   0. VIDEZ LES TROIS SEAUX depuis le tableau de bord, Storage :
--      « portraits », « album », « pieces ». Le SQL ne peut pas le
--      faire — voir le point 4 ci-dessus.
--
--   1. Ouvrez l'application. Comme il n'y a plus aucun super
--      administrateur, l'écran de connexion propose de nouveau
--      « Créer le compte du club ». Le responsable s'y inscrit et
--      reçoit F04x001.
--
--   2. Relisez les réglages dans « Administration → Le club » :
--      surtout le NUMÉRO MVOLA, qui décide où part l'argent des
--      membres, et les HORAIRES.
--
--   3. Activez « Leaked password protection » dans
--      Authentication → Policies. C'est le seul avertissement de
--      sécurité qui demande une action.
--
--   4. Relancez « supabase/tests/passation.sql » : les onze contrôles
--      doivent être au vert.
-- ============================================================
