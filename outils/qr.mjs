/* ============================================================
   Produit le code QR qui ouvre l'aperçu sur un téléphone.

     node outils/qr.mjs                     # l'aperçu de la maquette
     node outils/qr.mjs https://…/essai app # l'application, sous un autre nom

   Écrit apercu/qr*.png et apercu/qr*.svg, puis RELIT le code produit
   pour vérifier qu'il encode bien l'adresse voulue. Un QR qu'on
   n'a pas décodé est une image, pas un lien : le club le
   scannerait devant tout le monde pour tomber sur une erreur.

   Ce n'est pas le code d'Expo Go. Celui-là ouvre l'aperçu web —
   les composants de l'application rendus dans le navigateur. Le
   code Expo viendra quand le projet Expo existera.
   ============================================================ */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

/* L'alias de branche : il survit aux déploiements suivants, alors
   qu'une URL de déploiement est figée sur une version. */
const DEFAUT =
  'https://kungfuidealy-git-claude-kung-fu-monas-e81e44-shellinos-projects.vercel.app/apercu';

const adresse = process.argv[2] || DEFAUT;

/* Un suffixe pour ne pas écraser le code de l'aperçu quand on
   engendre celui de l'application. */
const nom = process.argv[3] ? `qr-${process.argv[3]}` : 'qr';

mkdirSync('apercu', { recursive: true });

/* Correction d'erreur au niveau M : un QR imprimé, photocopié ou
   affiché sur un écran sale reste lisible. Marge de 2 modules —
   en dessous, beaucoup de lecteurs de téléphone échouent. */
const options = {
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0F5132', light: '#FFFFFF' }   /* le vert du club */
};

await QRCode.toFile(`apercu/${nom}.png`, adresse, { ...options, width: 720 });
const svg = await QRCode.toString(adresse, { ...options, type: 'svg', width: 320 });
writeFileSync(`apercu/${nom}.svg`, svg);

/* ---------- La vérification : on relit ce qu'on vient d'écrire ---------- */
const img = PNG.sync.read(readFileSync(`apercu/${nom}.png`));
const lu = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);

if (!lu) {
  console.error('ÉCHEC : le code produit ne se décode pas.');
  process.exit(1);
}
if (lu.data !== adresse) {
  console.error(`ÉCHEC : le code encode « ${lu.data} » et non « ${adresse} ».`);
  process.exit(1);
}

console.log(`apercu/${nom}.png + ${nom}.svg`);
console.log('vérifié par décodage :', lu.data);
