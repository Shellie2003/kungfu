/* ============================================================
   Réduire une photo avant de l'envoyer.

   Ce code vivait dans messagerie.ts, et il n'y servait QUE la
   messagerie. Les albums, eux, envoyaient les photos telles quelles
   — trois à cinq mégaoctets par cliché sortant d'un téléphone
   récent. Le club a signalé un import « horriblement lent » : il
   l'était, et c'est la moitié de la raison.

   Mille six cents pixels de côté suffisent très largement à un
   écran de téléphone, et ramènent une photo de quatre mégaoctets
   sous les trois cents kilooctets. Mesuré dans un vrai navigateur
   sur un cliché 4032x3024 : 7436 ko → 1086 ko, presque sept fois
   moins à transporter — pour celui qui envoie comme pour chacun des
   soixante-quatre qui regardent.

   En cas d'échec, on envoie l'ORIGINAL : mieux vaut une photo lourde
   qu'une photo perdue. C'est aussi ce qui se passe dans les tests,
   où jsdom ne sait pas dessiner.
   ============================================================ */

export const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];

const COTE_MAX = 1600;
const QUALITE = 0.82;

export async function reduire(fichier: File): Promise<File> {
  if (!TYPES_IMAGE.includes(fichier.type)) return fichier;
  try {
    const bitmap = await createImageBitmap(fichier);
    const facteur = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
    /* Déjà petite : la réencoder ne ferait que la dégrader. */
    if (facteur === 1 && fichier.size < 600 * 1024) return fichier;

    const toile = document.createElement('canvas');
    toile.width = Math.round(bitmap.width * facteur);
    toile.height = Math.round(bitmap.height * facteur);
    const pinceau = toile.getContext('2d');
    if (!pinceau) return fichier;
    pinceau.drawImage(bitmap, 0, 0, toile.width, toile.height);

    const blob = await new Promise<Blob | null>((ok) =>
      toile.toBlob(ok, 'image/jpeg', QUALITE)
    );
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
   ------------------------------------------------------------ */
export async function enParallele<E, S>(
  elements: E[],
  combien: number,
  faire: (e: E, i: number) => Promise<S>
): Promise<S[]> {
  const resultats = new Array<S>(elements.length);
  let suivant = 0;

  const ouvrier = async () => {
    for (;;) {
      const i = suivant++;
      if (i >= elements.length) return;
      resultats[i] = await faire(elements[i] as E, i);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(combien, elements.length) }, ouvrier)
  );
  return resultats;
}
