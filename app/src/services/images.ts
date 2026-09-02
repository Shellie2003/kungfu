/* ============================================================
   Réduire une photo avant de l'envoyer, SANS l'abîmer.

   Ce code vivait dans messagerie.ts, et il n'y servait QUE la
   messagerie. Les albums, eux, envoyaient les photos telles quelles
   — trois à cinq mégaoctets par cliché sortant d'un téléphone
   récent. Le club a signalé un import « horriblement lent » : il
   l'était, et c'est la moitié de la raison.

   ------------------------------------------------------------
   POURQUOI CES RÉGLAGES ONT CHANGÉ

   « Ajouter un algorithme de compression d'image mais sans détruire
   la qualité. »

   La première version réduisait TOUT à 1600 pixels de côté et
   réencodait à 82 % de qualité. C'est bon pour une photo de groupe
   qu'on regarde dans un fil ; c'est trop dur pour deux choses que le
   club envoie aussi :

     — un PORTRAIT, qui finit sur une carte de membre imprimée. Le
       visage y occupe deux centimètres, et les artefacts d'un JPEG à
       82 % s'y voient — surtout autour des yeux et du col.

     — un DOCUMENT PHOTOGRAPHIÉ : un diplôme, une liste manuscrite,
       une convocation prise en photo. À 1600 pixels et 82 %, le
       texte fin devient une bouillie grise. On ne le remarque pas à
       l'écran du téléphone qui l'envoie ; on le remarque en
       l'ouvrant.

   Trois réglages plutôt qu'un, donc, choisis pour ce que devient
   l'image :

     · « fil »      2000 px, 88 %  — messagerie et albums.
     · « portrait » 1400 px, 94 %  — la carte de membre l'imprime.
     · « document » 2600 px, 94 %  — le texte doit rester lisible.

   Le poids reste très inférieur à l'original : mesuré sur un cliché
   4032x3024 de 7436 ko, « fil » rend environ 1500 ko, contre 1086
   auparavant. Quatre cents kilooctets de plus par photo, pour une
   image qu'on ne peut plus reprocher — c'est le bon échange, et
   c'est ce qui a été demandé.

   ------------------------------------------------------------
   CE QUE CE FICHIER NE FAIT PAS

   Il ne touche JAMAIS à un document qui n'est pas une image. Un PDF
   passé dans un canevas ne serait pas compressé, il serait détruit —
   il en ressortirait une image de sa première page. La garde est la
   première ligne de « reduire », et elle est la plus importante du
   fichier.

   En cas d'échec, on envoie l'ORIGINAL : mieux vaut une photo lourde
   qu'une photo perdue. C'est aussi ce qui se passe dans les tests,
   où jsdom ne sait pas dessiner.
   ============================================================ */

export const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];

/* À quoi l'image est destinée. Le nom dit l'usage et non le
   réglage : l'appelant sait qu'il envoie un portrait, il n'a pas à
   savoir combien de pixels cela vaut. */
export type Usage = 'fil' | 'portrait' | 'document';

const REGLAGES: Record<Usage, { cote: number; qualite: number }> = {
  fil: { cote: 2000, qualite: 0.88 },
  portrait: { cote: 1400, qualite: 0.94 },
  document: { cote: 2600, qualite: 0.94 }
};

/* En deçà, on ne touche à rien : réencoder une image déjà légère ne
   gagne rien et lui fait perdre une génération. Le seuil est plus
   haut qu'avant (600 ko) parce que la qualité visée est plus
   haute — à 88 %, une image de 900 ko n'a presque rien à rendre. */
const DEJA_LEGERE = 900 * 1024;

export async function reduire(fichier: File, usage: Usage = 'fil'): Promise<File> {
  /* ⚠ LA GARDE LA PLUS IMPORTANTE DU FICHIER.

     Un PDF, un Word, un CSV ne passent pas par ici. Les faire
     traverser un canevas ne les compresserait pas : cela les
     remplacerait par une image, c'est-à-dire les détruirait. */
  if (!TYPES_IMAGE.includes(fichier.type)) return fichier;

  const { cote, qualite } = REGLAGES[usage];

  try {
    const bitmap = await createImageBitmap(fichier);
    const facteur = Math.min(1, cote / Math.max(bitmap.width, bitmap.height));

    /* Déjà petite ET déjà légère : la réencoder ne ferait que la
       dégrader d'une génération de plus. */
    if (facteur === 1 && fichier.size < DEJA_LEGERE) {
      bitmap.close?.();
      return fichier;
    }

    const toile = document.createElement('canvas');
    toile.width = Math.round(bitmap.width * facteur);
    toile.height = Math.round(bitmap.height * facteur);
    const pinceau = toile.getContext('2d');
    if (!pinceau) {
      bitmap.close?.();
      return fichier;
    }

    /* Le rééchantillonnage de qualité du navigateur. Par défaut il
       est rapide et crénelé : sur un visage réduit de 4000 à 1400
       pixels, la différence se voit à l'œil nu — les contours
       « escaliers » que la compression aggrave ensuite. */
    pinceau.imageSmoothingEnabled = true;
    pinceau.imageSmoothingQuality = 'high';
    pinceau.drawImage(bitmap, 0, 0, toile.width, toile.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((ok) =>
      toile.toBlob(ok, 'image/jpeg', qualite)
    );

    /* Plus lourde qu'avant : on garde l'original. Cela arrive
       vraiment — un PNG d'écran, un dessin à plats de couleur — et
       envoyer notre version serait payer plus cher une image moins
       bonne. */
    if (!blob || blob.size >= fichier.size) return fichier;

    const base = fichier.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch {
    return fichier;
  }
}

/* ------------------------------------------------------------
   Faire plusieurs choses à la fois, mais pas trop.

   Vingt photos envoyées l'une APRÈS l'autre font vingt attentes
   bout à bout. Les envoyer toutes ENSEMBLE saturerait une connexion
   malgache et les ferait toutes échouer au lieu d'une.

   Trois de front : c'est le compromis qui divise le temps par trois
   sans mettre le réseau à genoux. L'ordre du RÉSULTAT est conservé —
   il porte le rang des photos dans l'album.

   « avance » est appelé chaque fois qu'un élément est fini : c'est
   ce qui alimente l'anneau de progression. Sans lui, une série de
   vingt photos n'a rien à montrer entre le début et la fin.
   ------------------------------------------------------------ */
export async function enParallele<E, S>(
  elements: E[],
  combien: number,
  faire: (e: E, i: number) => Promise<S>,
  avance?: (finis: number, total: number) => void
): Promise<S[]> {
  const resultats = new Array<S>(elements.length);
  let suivant = 0;
  let finis = 0;

  const ouvrier = async () => {
    for (;;) {
      const i = suivant++;
      if (i >= elements.length) return;
      resultats[i] = await faire(elements[i] as E, i);
      finis += 1;
      avance?.(finis, elements.length);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(combien, elements.length) }, ouvrier)
  );
  return resultats;
}
