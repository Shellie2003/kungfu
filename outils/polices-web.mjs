/* ============================================================
   Déclare pour le navigateur les polices que l'application
   embarque : les fichiers TTF de mobile/assets/polices.

   Pourquoi pas css/fonts.css ? Parce que la maquette y déclare
   deux familles variables — Archivo et Karla — dont le navigateur
   tire les graisses par font-weight. L'application, elle, ne peut
   pas : sur Android, une police embarquée se choisit par son NOM.
   Elle déclare donc huit familles, Archivo-Bold, Karla-SemiBold…

   Si la comparaison chargeait css/fonts.css, ces huit noms
   n'existeraient pas, le navigateur retomberait sur une police de
   secours en graisse 400, et l'écart mesuré n'aurait aucun sens.

   On sert donc au navigateur exactement les fichiers qui partiront
   dans l'APK. La comparaison teste alors les mêmes polices que
   l'appareil, ce qui la rend plus fidèle et non moins.
   ============================================================ */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER = 'mobile/assets/polices';

export function policesWeb() {
  if (!existsSync(DOSSIER)) {
    throw new Error(
      `${DOSSIER} absent — produisez les polices : python3 outils/extraire-polices.py`
    );
  }
  const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith('.ttf'));
  if (!fichiers.length) throw new Error(`Aucun .ttf dans ${DOSSIER}`);

  return fichiers
    .map((f) => {
      const nom = f.replace(/\.ttf$/, '');
      const b64 = readFileSync(join(DOSSIER, f)).toString('base64');
      /* font-weight: 400 sur toutes : la graisse est déjà figée dans
         le fichier. La déclarer à 700 ferait épaissir une police
         déjà grasse par synthèse du navigateur. */
      return `@font-face{font-family:'${nom}';font-style:normal;font-weight:400;` +
             `src:url(data:font/ttf;base64,${b64}) format('truetype')}`;
    })
    .join('\n');
}
