/* ============================================================
   Le garde-fou du réseau, dans son propre fichier.

   Il y est SEUL, et c'est nécessaire : « brancherServeur » remplace
   le fetch global une fois pour toutes, sans le rendre entre les
   tests. Placé à la suite d'un fichier qui branche le serveur
   simulé, ce test le trouverait encore en place et passerait pour
   une mauvaise raison — je l'ai écrit ainsi d'abord, et il a répondu
   par une réponse 200 au lieu de l'erreur attendue.

   Ce qu'il vérifie : un fichier de test qui oublierait de brancher le
   serveur simulé s'arrête sur une erreur qui NOMME le problème, au
   lieu de partir sur le vrai réseau. Un test qui sort de la machine
   dépend de la connexion de celui qui le lance : vert ici, rouge sur
   le coureur, ou l'inverse la fois suivante.
   ============================================================ */
import { expect, test } from 'vitest';

test('un appel sans serveur simulé échoue en le disant', async () => {
  await expect(fetch('https://essai.supabase.co/rest/v1/profils')).rejects.toThrow(
    /sans serveur simulé/
  );
});
