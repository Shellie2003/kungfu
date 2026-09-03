/* ============================================================
   Savoir si l'on a vraiment écrit.

   ------------------------------------------------------------
   LE DÉFAUT QUE CE FICHIER EXISTE POUR ÉTEINDRE

   Une règle d'accès PostgreSQL ne REJETTE pas une mise à jour : elle
   rend la ligne invisible. Un « update » qui ne voit aucune ligne
   n'échoue donc pas — il ne touche rien, et répond que tout va bien.

   Côté application, c'est indiscernable d'un succès : « error » est
   nul. L'écran annonce « Enregistré », et rien ne l'a été. Le club
   le découvre des semaines plus tard, en constatant que le numéro de
   téléphone affiché est toujours l'ancien.

   Ce projet a payé ce défaut CINQ fois — les réglages du club, le
   changement de rôle, les catégories, les réactions, les
   notifications — et chaque fois il a fallu qu'un humain le
   remarque. outils/verifier-ecritures.mjs refuse désormais toute
   nouvelle écriture qui ne se pose pas la question.

   ------------------------------------------------------------
   POURQUOI UN MESSAGE, ET NON UN CODE

   Celui qui lit ce message est le club, pas moi. « 0 rows affected »
   ne lui dit rien ; « le serveur n'a pas enregistré ce grade » lui
   dit quoi vérifier, et « votre rôle ne le permet peut-être pas »
   lui dit où chercher. La cause est presque toujours celle-là.
   ============================================================ */

export function assure<T>(lignes: T[] | null, quoi: string): T[] {
  if (!lignes?.length) {
    throw new Error(
      `Le serveur n’a pas ${quoi}. Votre rôle ne le permet peut-être pas, ` +
        'ou la ligne a été supprimée entre-temps — rien n’a été changé.'
    );
  }
  return lignes;
}
