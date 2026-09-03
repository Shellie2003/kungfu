-- ============================================================
-- Les liens entre tables, indexés.
--
-- PostgreSQL n'indexe PAS automatiquement le côté « enfant » d'une
-- clé étrangère. Douze de nos liens n'avaient donc aucun index, et le
-- vérificateur de Supabase les signalait tous.
--
-- ------------------------------------------------------------
-- POURQUOI MAINTENANT, ET PAS AVANT
--
-- Sur soixante-quatre membres, un balayage complet de table coûte
-- quelques millisecondes : l'absence d'index ne se voyait pas, et
-- l'ajouter « au cas où » aurait été de l'optimisation à l'aveugle.
--
-- Ce qui a changé : la SUPPRESSION DÉFINITIVE d'un membre, ajoutée
-- par la migration 0016. Effacer une fiche déclenche maintenant les
-- cascades — vie privée, tuteurs, appartenance aux salons, présences,
-- réactions — et chaque cascade cherche les lignes filles. Sans
-- index, PostgreSQL parcourt la table entière pour chacune. Sur les
-- messages, qui est la table qui grossit, cela deviendra le geste le
-- plus lent de l'application, et il sera lent au pire moment : quand
-- quelqu'un attend devant l'écran.
--
-- Les index sont donc posés là où ils servent : le côté enfant de
-- chaque lien qui n'en avait pas.
--
-- « if not exists » : cette migration doit pouvoir repasser sur une
-- base où certains ont déjà été créés à la main.
-- ============================================================

-- Les auteurs. « qui a écrit ceci » se lit rarement, mais « effacer
-- cette personne » cherche TOUT ce qu'elle a écrit — et c'est ce
-- chemin-là qui compte.
create index if not exists messages_auteur_idx      on messages (auteur_id);
create index if not exists actualites_auteur_idx    on actualites (auteur_id);
create index if not exists signalements_auteur_idx  on signalements (auteur_id);
create index if not exists signalements_traite_idx  on signalements (traite_par);

-- Les participations et les versements : lus par membre à chaque
-- ouverture de l'écran de participation.
create index if not exists participations_profil_idx on participations (profil_id);
create index if not exists versements_pointe_idx     on versements (pointe_par);

-- Les présences. « presences (profil_id, seance_le) » existe déjà ;
-- ce qui manque, c'est le créneau et le pointeur.
create index if not exists presences_horaire_idx on presences (horaire_id);
create index if not exists presences_pointe_idx  on presences (pointe_par);

-- Le grade d'un membre. Lu à chaque affichage de l'annuaire, et
-- parcouru en entier quand le club renomme une ceinture.
create index if not exists profils_grade_idx on profils (grade_id);

-- Le journal d'accès à l'espace des maîtres.
create index if not exists journal_profil_idx on journal_acces (profil_id);
create index if not exists journal_salon_idx  on journal_acces (salon_id);

-- Les réactions, créées par la migration 0017. Elles se lisent par
-- (genre, sujet) — cet index existe — mais la suppression d'un membre
-- les cherche par profil.
create index if not exists reactions_profil_idx on reactions (profil_id);

-- ------------------------------------------------------------
-- CE QUI N'EST PAS FAIT, ET POURQUOI
--
-- Le même vérificateur signale une trentaine de « politiques
-- permissives multiples » : deux règles d'accès pour le même rôle et
-- la même action, PostgreSQL devant évaluer les deux.
--
-- Elles ne sont PAS fusionnées, et c'est délibéré. Ce motif est
-- volontaire dans tout ce projet : une règle dit ce que fait un
-- membre — « je corrige ma fiche », « je vois mes présences » — et
-- une autre, à côté, ce que fait l'administration. Les fusionner
-- donnerait une trentaine de conditions composées, chacune à relire
-- entièrement pour comprendre qui peut quoi.
--
-- Le gain se compterait en microsecondes sur des tables de
-- soixante-quatre lignes. Le coût serait une trentaine d'occasions de
-- se tromper dans la seule partie du projet où une erreur ne se voit
-- pas : celle qui décide qui lit la date de naissance d'un mineur.
--
-- C'est un avertissement de performance auquel on répond non, en
-- connaissance de cause.
-- ============================================================
