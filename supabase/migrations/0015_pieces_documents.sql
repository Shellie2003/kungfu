-- ============================================================
-- Le seau « pieces » refusait tous les documents.
--
-- « Vérifier, car le PDF n'est pas encore supporté. » — Constaté, et
-- la cause est ici, pas dans l'application.
--
-- LES DEUX MOITIÉS D'UNE FONCTIONNALITÉ
-- -------------------------------------
-- La messagerie a reçu les documents il y a plusieurs versions :
-- l'écran propose « Joindre une photo ou un document », le sélecteur
-- accepte le PDF, le Word, l'Excel et le texte, et messagerie.ts
-- tient la liste de ce qui est autorisé. Tout cela a été écrit, relu
-- et testé.
--
-- Mais « allowed_mime_types » du seau, posé dans la migration 0011,
-- n'a jamais listé que les trois types d'images. Le serveur refusait
-- donc chaque document, après un envoi qui pouvait durer plusieurs
-- secondes sur la ligne d'Antananarivo.
--
-- C'est le même défaut que la migration 0013 avait dû corriger pour
-- les albums, et je le note parce qu'il revient : LA MOITIÉ D'UNE
-- PERMISSION EST UNE PANNE, PAS UNE PROTECTION. Écrire la règle dans
-- l'application sans l'écrire dans le seau donne une fonctionnalité
-- qui a l'air complète et qui échoue à la dernière étape.
--
-- POURQUOI PAS « TOUT ACCEPTER »
-- ------------------------------
-- Le seau n'est pas un disque partagé. Un exécutable ou une archive
-- n'ont rien à faire dans une conversation d'élèves — dont des
-- mineurs — et le seau est privé mais partagé entre tous les membres
-- d'un salon. La liste ci-dessous est EXACTEMENT celle de
-- TYPES_ACCEPTES dans app/src/services/messagerie.ts.
--
-- Elles doivent le rester : outils/verifier-seaux.mjs compare les
-- deux et refuse la construction si elles divergent. Sans ce
-- contrôle, la prochaine divergence se découvrirait comme celle-ci —
-- par le club, sur un envoi qui échoue.
-- ============================================================

update storage.buckets
set allowed_mime_types = array[
      -- Les images, inchangées.
      'image/jpeg',
      'image/png',
      'image/webp',
      -- Ce que le club échange réellement : une convocation, une
      -- liste d'inscrits, un règlement intérieur.
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
where id = 'pieces';

-- La limite de taille reste à 5 Mo, et c'est la même valeur que
-- TAILLE_MAX dans messagerie.ts : l'écran refuse avant l'envoi, ce
-- qui évite d'attendre pour rien, et le serveur refuse aussi, parce
-- qu'un écran ne protège rien.
