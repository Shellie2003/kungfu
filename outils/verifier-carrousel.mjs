/* ============================================================
   Le carrousel de l'accueil, dans un vrai navigateur.

   Pourquoi un banc à part
   -----------------------
   jsdom ne défile pas. Les tests d'intégration savent compter les
   vues et les points ; ils ne peuvent pas dire si l'animation part,
   si elle s'arrête sous le doigt, ni si la préférence « moins
   d'animation » est respectée. Ce sont pourtant les trois seules
   choses qui distinguent un carrousel d'une pile d'images.

   Et verifier-app.mjs ne peut pas s'en charger : il tourne SANS
   photos, parce que la maquette n'en a aucune et que la comparaison
   d'images doit rester juste. Le carrousel y est donc toujours vide.

   D'où ce banc : le même bouchon, mais AVEC_PHOTOS=1, qui rend de
   vraies adresses signées et sert des images.
   ============================================================ */
process.env.AVEC_PHOTOS = '1';

import { chromium } from 'playwright';
import { brancher, poserSession, servir, REPONSES } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;

/* Un album de quatre photos, et une photo de club : cinq vues, de
   quoi voir tourner le carrousel plusieurs fois. */
REPONSES.albums = [
  {
    id: 'al1',
    titre: 'Compétitions',
    categorie: 'Compétitions',
    cree_le: '2026-01-01T00:00:00Z',
    photos: [1, 2, 3, 4].map((n) => ({
      id: `ph${n}`,
      chemin: `photo-${n}.jpg`,
      legende: `Cliché ${n}`,
      rang: n
    }))
  }
];
REPONSES.reglages = [
  ...REPONSES.reglages.filter((r) => r.cle !== 'photo_club'),
  { cle: 'photo_club', valeur: 'club.jpg' }
];

const site = await servir(RACINE);
const navigateur = await chromium.launch();
const ennuis = [];

async function ouvrir(options = {}) {
  const page = await navigateur.newPage({ viewport: { width: 390, height: 780 }, ...options });
  await brancher(page);
  await poserSession(page);
  await page.goto(`${site.adresse}/#/accueil`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.carrousel__vue', { timeout: 5000 });
  return page;
}

const position = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.carrousel');
    return el ? Math.round(el.scrollLeft / (el.clientWidth || 1)) : -1;
  });

/* ---------------------------------------------- 1. Les vues */
{
  const page = await ouvrir();
  const vues = await page.locator('.carrousel__vue').count();
  const points = await page.locator('.carrousel__point').count();
  if (vues === 5 && points === 5) {
    console.log('✓ vues           la photo du club, puis les quatre de l’album');
  } else {
    ennuis.push(`vues : ${vues} vue(s) et ${points} point(s), au lieu de 5 et 5`);
  }

  /* Les images doivent VRAIMENT charger. Le bouchon rendait jusqu'ici
     « signedUrl » là où le serveur rend « signedURL » : la
     bibliothèque écrasait la valeur par null, et l'on aurait vérifié
     un carrousel de cadres vides. */
  const chargees = await page.evaluate(() =>
    [...document.querySelectorAll('.carrousel__vue img')].filter((i) => i.naturalWidth > 0).length
  );
  if (chargees === 5) {
    console.log('✓ images         les cinq se chargent réellement');
  } else {
    ennuis.push(`images : ${chargees} chargée(s) sur 5 — adresses signées non résolues ?`);
  }
  await page.close();
}

/* ---------------------------------------------- 2. L'animation part, au bon rythme

   On attendait ici cinq secondes, puis on constatait « ça a bougé ».
   C'était suffisant tant que la durée n'était l'affaire de personne ;
   le club a maintenant demandé TROIS secondes, et une attente unique
   de cinq secondes aurait dit « vert » pour n'importe quelle durée
   entre une et cinq. La demande ne serait plus tenue par rien.

   On encadre donc : à deux secondes, la première vue est encore là ;
   à quatre, la deuxième. Seule une durée située entre les deux passe.
   La marge est large des deux côtés — un ordinateur d'intégration
   chargé décale les minuteries de quelques dizaines de millisecondes,
   pas d'une seconde. */
const DELAI_ATTENDU = 3000;
{
  const page = await ouvrir();
  const depart = await position(page);
  await page.waitForTimeout(DELAI_ATTENDU - 1000);
  const avantLHeure = await position(page);
  await page.waitForTimeout(2000);
  const apres = await position(page);

  if (depart === 0 && avantLHeure === 0 && apres === 1) {
    console.log(`✓ animation      elle avance toute seule, toutes les ${DELAI_ATTENDU / 1000} s`);
  } else if (avantLHeure !== 0) {
    ennuis.push(
      `animation : déjà à la vue ${avantLHeure} après ${(DELAI_ATTENDU - 1000) / 1000} s — ` +
      `elle défile plus vite que les ${DELAI_ATTENDU / 1000} s demandées`
    );
  } else {
    ennuis.push(
      `animation : encore à la vue ${apres} après ${(DELAI_ATTENDU + 1000) / 1000} s — ` +
      `attendu la vue 1, le club a demandé ${DELAI_ATTENDU / 1000} s par vue`
    );
  }
  await page.close();
}

/* ---------------------------------------------- 3. Le doigt reprend la main */
{
  const page = await ouvrir();
  /* Un vrai geste de pointeur, pas un appel de fonction : c'est
     « pointerdown » que le composant écoute, et c'est ce que fait un
     doigt sur un téléphone. */
  await page.locator('.carrousel').first().dispatchEvent('pointerdown');
  const avant = await position(page);
  await page.waitForTimeout(5200);
  const apres = await position(page);
  if (avant === apres) {
    console.log('✓ au doigt       l’animation s’arrête, et ne reprend pas');
  } else {
    ennuis.push(
      `au doigt : le carrousel a bougé de ${avant} à ${apres} après un geste — ` +
      'il devait rendre la main définitivement'
    );
  }
  await page.close();
}

/* ---------------------------------------------- 4. « Moins d'animation » */
{
  const page = await ouvrir({ reducedMotion: 'reduce' });
  const avant = await position(page);
  await page.waitForTimeout(5200);
  const apres = await position(page);
  if (avant === apres) {
    console.log('✓ sobriété       rien ne bouge si la personne l’a demandé');
  } else {
    ennuis.push(
      `sobriété : le carrousel a défilé de ${avant} à ${apres} malgré ` +
      '« prefers-reduced-motion: reduce »'
    );
  }
  await page.close();
}

await navigateur.close();
site.fermer();

if (ennuis.length) {
  console.error('\nLe carrousel ne se comporte pas comme annoncé :\n');
  for (const e of ennuis) console.error('  ✗ ' + e);
  console.error('');
  process.exit(1);
}

console.log('\nLe carrousel tourne, s’arrête au doigt, et se tait quand on le lui demande.');
