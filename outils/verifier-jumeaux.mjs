/* ============================================================
   Les deux versions doivent être JUMELLES.

   Exigence du club, mot pour mot : « tout ce qui est présent dans la
   version web doit être strictement identique à celle de
   l'application ».

   Elles sont bâties à partir des mêmes sources, mais pas par la même
   commande : l'APK veut des chemins RELATIFS — Capacitor sert les
   fichiers depuis le disque — et le web des chemins absolus sous
   /essai. Deux commandes, c'est deux occasions de diverger, et
   personne ne s'en apercevrait avant le club.

   Comparer les paquets ne prouverait rien : le chemin de base change
   l'ordre des modules, donc les noms de variables que le minificateur
   invente. Deux fichiers différents peuvent afficher exactement la
   même chose.

   On compare donc CE QUI EST AFFICHÉ. Le même bouchon, les mêmes
   données, les mêmes écrans, dans le même navigateur — et l'image
   doit être la même, au pixel près.

   Ce que la mesure autorise, et rien d'autre :
     — le chemin de base, invisible à l'écran ;
     — version.txt, qui n'existe que sur le web et ne s'affiche
       nulle part sur cet écran.
   ============================================================ */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brancher, poserSession, servir } from './bouchon.mjs';

const SORTIE = new URL('../outils/comparaisons/jumeaux/', import.meta.url).pathname;
mkdirSync(SORTIE, { recursive: true });

/* Les écrans où une divergence se verrait. Pas tous les trente-quatre :
   ce banc dure déjà deux fois plus longtemps que les autres, et une
   divergence de construction touche l'application entière, pas un
   écran isolé. */
const ECRANS = [
  ['accueil', '/#/accueil'],
  ['etudiants', '/#/etudiants'],
  ['casier', '/#/casier'],
  ['club', '/#/club'],
  ['messages', '/#/messages']
];

const navigateur = await chromium.launch();

async function capturer(racine, prefixe, port) {
  const site = await servir(racine, port, prefixe === '');
  const images = {};
  for (const [nom, route] of ECRANS) {
    const page = await navigateur.newPage({ viewport: { width: 390, height: 780 } });
    await brancher(page);
    await poserSession(page);
    await page.goto(`${site.adresse}${prefixe}${route}`, { waitUntil: 'networkidle' });
    /* Le temps que les adresses signées reviennent et que les images
       se posent : sans cette pause, on compare deux instants
       différents du chargement et l'on croit à une divergence. */
    await page.waitForTimeout(600);
    images[nom] = await page.screenshot({ fullPage: true });
    await page.close();
  }
  site.fermer();
  return images;
}

const RACINE = new URL('..', import.meta.url).pathname;

/* ⚠ Les DEUX constructions doivent exister avant de comparer.

   Sans ce garde-fou, l'absence de essai/ ne se voyait pas comme une
   absence : le serveur rendait 404 partout, les pages étaient vides,
   et l'outil annonçait « dimensions différentes » et « 3,67 % de
   pixels différents ». Il accusait donc le CODE d'avoir divergé
   alors que la construction web n'avait simplement pas eu lieu.

   C'est exactement ce qui a fait échouer l'exécution 37 : dans
   l'intégration continue, cette étape passait AVANT celle qui
   construit essai/. Un contrôle qui se trompe de coupable est pire
   qu'un contrôle absent — on cherche le défaut là où il n'est pas. */
for (const [quoi, ou, comment] of [
  ['l’application', join(RACINE, 'app/dist/index.html'), 'cd app && npx vite build'],
  ['la version web', join(RACINE, 'essai/index.html'), 'bash outils/vercel-build.sh']
]) {
  if (!existsSync(ou)) {
    console.error(
      `\n${quoi} n’est pas construite : ${ou} n’existe pas.\n\n` +
      `Rien à comparer. Construisez-la d’abord :\n\n    ${comment}\n`
    );
    process.exit(1);
  }
}

/* L'APK sert app/dist à la racine ; le web sert le dépôt entier, et
   la page vit sous /essai. On reproduit exactement les deux. */
const apk = await capturer(join(RACINE, 'app/dist/'), '', 4183);
const web = await capturer(RACINE, '/essai', 4184);

await navigateur.close();

const ennuis = [];

for (const [nom] of ECRANS) {
  const a = PNG.sync.read(apk[nom]);
  const w = PNG.sync.read(web[nom]);

  if (a.width !== w.width || a.height !== w.height) {
    ennuis.push(
      `${nom} : dimensions différentes — ` +
      `APK ${a.width}×${a.height}, web ${w.width}×${w.height}`
    );
    continue;
  }

  const ecart = new PNG({ width: a.width, height: a.height });
  const differents = pixelmatch(a.data, w.data, ecart.data, a.width, a.height, {
    threshold: 0.1
  });
  const part = (differents / (a.width * a.height)) * 100;

  /* Zéro tolérance de PRINCIPE, un cheveu de tolérance en pratique :
     le rendu des polices peut varier d'un sous-pixel entre deux
     lancements du même navigateur. Au-delà, c'est une vraie
     différence. */
  if (part > 0.05) {
    const fichier = join(SORTIE, `${nom}-ecart.png`);
    writeFileSync(fichier, PNG.sync.write(ecart));
    ennuis.push(`${nom} : ${part.toFixed(2)} % de pixels différents — voir ${fichier}`);
  } else {
    console.log(`✓ ${nom.padEnd(12)} identique (${part.toFixed(3)} %)`);
  }
}

if (ennuis.length) {
  console.error('\nLa version web et l’application ont divergé :\n');
  for (const e of ennuis) console.error('  ✗ ' + e);
  console.error(
    '\n  Les deux se construisent depuis app/src. Si elles diffèrent, la cause\n' +
    '  est dans les DEUX commandes de construction : vite.config.ts pour l’APK,\n' +
    '  outils/vercel-build.sh pour le web. Toute option qui change le rendu doit\n' +
    '  être posée dans vite.config.ts, que les deux emploient.\n' +
    '\n  Si SEUL « club » diffère, et de très peu : regardez d’abord la VERSION.\n' +
    '  Cet écran l’affiche en toutes lettres, et c’est la seule chose que les\n' +
    '  deux constructions reçoivent du DEHORS. Les deux doivent donc être\n' +
    '  lancées avec la même VERSION_CONSTRUITE — sinon elles écrivent deux\n' +
    '  textes différents au même endroit, et ce contrôle le signale à juste\n' +
    '  titre, pour une divergence que la chaîne a elle-même fabriquée.\n'
  );
  process.exit(1);
}

console.log('\nLa version web et l’application affichent exactement la même chose.');
