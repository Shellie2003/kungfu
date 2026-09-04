/* ============================================================
   verifier-impression.mjs — Ce qui sort SUR LE PAPIER.

       node outils/verifier-impression.mjs

   ------------------------------------------------------------
   POURQUOI CE BANC EXISTE

   Aucun autre contrôle de ce dossier ne regarde le média
   « print ». Ils ouvrent tous les écrans en média « screen », où les
   règles d'impression n'existent pas — et une règle qui n'existe pas
   ne peut pas être fausse.

   Le club l'a signalé autrement : « régler l'impression d'une carte,
   il y a un bug ». Mesuré, le bug était triple, et rien ne l'aurait
   attrapé :

     · la carte s'étirait sur toute la largeur de la page A4, donc
       PAS au format d'une carte bancaire que le bouton promet ;
     · les deux boutons d'action et le paragraphe d'explication
       partaient à l'encre ;
     · le fond gris de l'application couvrait la feuille entière.

   Un défaut d'impression a ceci de particulier qu'on ne le découvre
   qu'après avoir usé du papier. D'où ce banc.

   ------------------------------------------------------------
   CE QU'IL MESURE, ET COMMENT

   Playwright sait basculer le média en « print » : les règles
   « @media print » s'appliquent alors pour de vrai, et l'on peut
   interroger la page comme d'habitude. On ne mesure donc pas une
   intention, on mesure ce que l'imprimante recevrait.

   « visibility », et pas seulement « display » : le décor de l'écran
   est masqué par « visibility: hidden », qui garde la place mais
   n'envoie pas d'encre. Ne regarder que « display » déclarerait
   présent ce qui ne s'imprime pas.
   ============================================================ */
import { chromium } from 'playwright';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;
const SRC = new URL('../app/src/', import.meta.url).pathname;
const SORTIE = new URL('../outils/comparaisons/', import.meta.url).pathname;

const plusRecent = (dossier) => {
  let t = 0;
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const c = join(dossier, e.name);
    t = Math.max(t, e.isDirectory() ? plusRecent(c) : statSync(c).mtimeMs);
  }
  return t;
};
if (plusRecent(RACINE) < plusRecent(SRC)) {
  console.error(
    'app/dist est plus ancien que app/src : ce contrôle porterait sur une\n' +
      'version périmée. Construisez d’abord :\n\n    cd app && npx vite build\n'
  );
  process.exit(1);
}

/* Le format normalisé ID-1, celui d'une carte bancaire, en points
   CSS : 85,6 mm et 54 mm à 96 points par pouce. La tolérance d'un
   point absorbe l'arrondi du moteur, rien de plus. */
const LARGEUR_CARTE = (85.6 / 25.4) * 96;
const HAUTEUR_CARTE = (54 / 25.4) * 96;
const TOLERANCE = 1.5;

const site = await servir(RACINE);
const navigateur = await chromium.launch();
/* Une page au format A4 : 794 × 1123 points. Mesurer sur un écran de
   téléphone dirait des choses justes sur une feuille qui n'existe
   pas. */
const page = await navigateur.newPage({ viewport: { width: 794, height: 1123 } });
await poserSession(page);
await brancher(page);

const releve = async (route) => {
  await page.goto(`${site.adresse}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);
  const vu = await page.evaluate(() => {
    const alEncre = (s) =>
      [...document.querySelectorAll(s)].filter((e) => {
        const c = getComputedStyle(e);
        return c.display !== 'none' && c.visibility !== 'hidden';
      });
    const carte = alEncre('.pc')[0];
    const r = carte?.getBoundingClientRect();
    return {
      boutons: alEncre('button').length,
      cartes: alEncre('.pc').length,
      planches: alEncre('.planche').length,
      /* Le décor de l'écran : il porte tous la même marque. */
      decor: alEncre('.impression-chrome').length,
      largeur: r?.width ?? 0,
      hauteur: r?.height ?? 0,
      /* Le contenu déborde-t-il de la carte ? C'est ce qui coupait
         le code QR et le pied de page. */
      deborde: carte ? carte.scrollHeight > carte.clientHeight + 1 : false,
      fond: getComputedStyle(document.body).backgroundColor
    };
  });
  await page.screenshot({ path: join(SORTIE, `impr-${route.split('/').pop()}.png`) });
  await page.emulateMedia({ media: 'screen' });
  return vu;
};

const BLANC = ['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'];
let echecs = 0;
const dire = (ok, texte, detail) => {
  if (!ok) echecs++;
  console.log(`${ok ? '✓' : '✗'} ${texte}`);
  if (!ok && detail) console.log(`   ${detail}`);
};

console.log('');
console.log('  Ma carte de membre');
const carte = await releve('/#/carte');
dire(carte.cartes === 1, 'une carte, et une seule, part sur le papier', `${carte.cartes} trouvée(s)`);
dire(
  Math.abs(carte.largeur - LARGEUR_CARTE) < TOLERANCE &&
    Math.abs(carte.hauteur - HAUTEUR_CARTE) < TOLERANCE,
  'au format d’une carte bancaire (85,6 × 54 mm)',
  `mesurée ${carte.largeur.toFixed(1)} × ${carte.hauteur.toFixed(1)}, ` +
    `attendue ${LARGEUR_CARTE.toFixed(1)} × ${HAUTEUR_CARTE.toFixed(1)}`
);
dire(
  !carte.deborde,
  'rien n’est coupé : le code QR et le pied tiennent dans la carte',
  'le contenu dépasse la hauteur de la carte — c’est ce qui faisait disparaître le code QR'
);
dire(carte.boutons === 0, 'aucun bouton d’écran ne part à l’encre', `${carte.boutons} bouton(s)`);
dire(carte.decor === 0, 'le décor de l’écran reste à l’écran', `${carte.decor} bloc(s) visible(s)`);
dire(BLANC.includes(carte.fond), 'la feuille est blanche', `fond « ${carte.fond} »`);

console.log('');
console.log('  Planche d’administration');
const planche = await releve('/#/admin/impression');
dire(planche.planches >= 1, 'la planche part sur le papier', 'aucune planche visible');
dire(
  planche.cartes > 1,
  'elle porte plusieurs cartes — c’est son objet',
  `${planche.cartes} carte(s)`
);
dire(
  Math.abs(planche.largeur - LARGEUR_CARTE) < TOLERANCE,
  'ses cartes sont au MÊME format que la carte seule',
  `mesurée ${planche.largeur.toFixed(1)}, attendue ${LARGEUR_CARTE.toFixed(1)}`
);
dire(planche.decor === 0, 'le décor de l’écran reste à l’écran', `${planche.decor} bloc(s)`);
dire(BLANC.includes(planche.fond), 'la feuille est blanche', `fond « ${planche.fond} »`);

await navigateur.close();
site.fermer();

console.log('');
if (echecs) {
  console.error(`${echecs} défaut(s) d’impression. Aperçus dans outils/comparaisons/impr-*.png`);
  process.exit(1);
}
console.log(
  'Les deux chemins d’impression sortent la même carte, au format d’une\n' +
    'carte bancaire, seule sur une feuille blanche.'
);
