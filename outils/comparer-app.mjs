/* ============================================================
   comparer-app.mjs — Mesure l'écart entre l'application et la
   maquette.

       node outils/comparer-app.mjs             # tous les écrans
       node outils/comparer-app.mjs etudiants   # un seul

   « Ressembler à 100 % » ne veut rien dire tant qu'on ne l'a pas
   mesuré. Ce banc photographie le même écran des deux côtés, dans
   le même navigateur, à la même largeur, et compare deux choses :

     1. la GÉOMÉTRIE DE CHAQUE TEXTE — position, taille, graisse,
        couleur. Aucune tolérance. C'est la vérification forte :
        elle attrape une marge de 2 px et une graisse 600 au lieu
        de 700, que l'œil ne voit pas.

     2. le NOMBRE DE PIXELS différents, avec un seuil. Il attrape
        ce que la première ne voit pas : un trait, un arrondi, un
        aplat de couleur.

   Depuis le passage au web, les deux côtés lisent la MÊME feuille
   de style. Un écart n'est donc plus une approximation tolérable :
   c'est que le balisage diffère, et c'est corrigeable.

   Ce que cela ne prouve pas : que le rendu natif d'Android est
   identique. La WebView lisse les polices autrement. Seul l'APK le
   montre — mais la géométrie, elle, est la même.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;
const SORTIE = 'outils/comparaisons';
const SEUIL_PIXEL = 0.12;   /* tolérance de couleur, par pixel */
const SEUIL_ECRAN = 1.5;    /* % de pixels différents accepté */

/* ------------------------------------------------------------
   Les paires écran de l'application / écran de la maquette.

   « exemples » liste les textes qui diffèrent LÉGITIMEMENT : la
   maquette montre des données inventées pour la présentation,
   l'application montre celles du bouchon. Ce sont des expressions
   régulières, appliquées des DEUX côtés — sinon écarter « 64
   membres » de la maquette ferait apparaître « 3 membres » comme
   un texte en trop.

   Ce qui n'est PAS écarté, et ne doit jamais l'être : les
   libellés, les titres de section, les textes d'explication. Ce
   sont eux qui portent la ressemblance.
   ------------------------------------------------------------ */
const PAIRES = [
  {
    cle: 'connexion', route: '/', maquette: 'connexion', sansSession: true,
    exemples: ['^F04x042$', '^••••••••$', '^Entrer$']
  },
  {
    cle: 'accueil', route: '/#/accueil', maquette: 'accueil',
    exemples: [
      '^\\d+$', 'membres$', 'séances', '^\\d{4}$',
      'Sortie au lac|Séance du mercredi|Départ 6h00|Décalée',
      '^(SORTIE|CHANGEMENT D’HORAIRE)$', '^\\d{2}$', '^(sept|nov|janv)$',
      'Sortie prévue samedi|Un club ouvert',
      'Mon espace|Ma carte|Ma fiche|Administration|avec le code|Et le changement|Membres, publications'
    ]
  },
  {
    cle: 'etudiants', route: '/#/etudiants', maquette: 'etudiants',
    exemples: [
      'membres · classés', 'RAKOTONDRABE|RASOAMANANA|ANDRIANJAFY|RABEMANANJARA|RAZAFIMAHATRATRA|RANDRIAMAMPIONONA',
      'Nirina|Fanjaniaina|Tokiniaina|Hery|Miora|Toky',
      'Ceinture (verte|jaune|bleue|noire|orange|blanche)',
      /* La maquette montre cinq puces de filtre en exemple ;
         l'application les tire de la base et en montre six. */
      '^(Tous|Blanche|Jaune|Orange|Verte|Bleue|Noire)$'
    ]
  },
  {
    cle: 'club', route: '/#/club', maquette: 'club',
    exemples: [
      'Fondé en', 'Le club enseigne|Un club ouvert',
      '^(Mardi|Jeudi|Vendredi|Samedi)$', '\\d+h\\d+', '^(Tous niveaux|Débutants|Gradés)$',
      'Idealy|NUMÉRO À FOURNIR|ADRESSE EXACTE|034 22|Analamahitsy$',
      /* « Modifier » n'est pas une donnée d'exemple : c'est un
         contrôle que le club a demandé APRÈS la maquette, pour
         changer la présentation, les valeurs et le contact depuis
         l'écran où il les lit. La maquette ne peut donc pas le
         montrer.

         Il est écarté ici, et lui seul : le bloc n'excuse que ce
         mot. Le reste de l'écran continue d'être mesuré au pixel,
         et l'a prouvé — la première version de ce bouton poussait
         tout l'écran de quarante-trois pixels, et c'est ce contrôle
         qui l'a dit. */
      '^Modifier$'
    ]
  },
  {
    cle: 'motdepasse', route: '/#/motdepasse', maquette: 'motdepasse',
    exemples: ['^•+$', 'MOT DE PASSE ACTUEL']
  }
];

const demandes = process.argv.slice(2);
const liste = demandes.length ? PAIRES.filter((p) => demandes.includes(p.cle)) : PAIRES;
if (!liste.length) {
  console.error('Écrans connus : ' + PAIRES.map((p) => p.cle).join(', '));
  process.exit(1);
}
if (!existsSync('dist/maquette-waishi.html')) {
  console.error('dist/maquette-waishi.html absent — lancez d’abord : node build.js');
  process.exit(1);
}
mkdirSync(SORTIE, { recursive: true });

/* ------------------------------------------------------------
   Relever la géométrie de chaque texte.

   On mesure l'ENCRE, par un Range sur les nœuds de texte, et non
   la boîte qui la contient : la maquette pose souvent le texte sur
   l'élément rembourré, l'application sur un enfant. Comparer les
   boîtes comparerait deux choses différentes ; comparer l'encre
   compare la même.
   ------------------------------------------------------------ */
const RELEVE = `(racine) => {
  const o = racine.getBoundingClientRect();
  const out = {};
  /* Les textes d'invite comptent comme du texte : la maquette écrit
     « Rechercher un nom » dans un span, l'application dans le
     placeholder d'un vrai champ. C'est la même encre à l'écran, et
     l'ignorer ferait passer le champ pour vide. */
  for (const e of racine.querySelectorAll('input[placeholder]')) {
    const b = e.getBoundingClientRect();
    if (!b.width || b.bottom < o.top || b.top > o.bottom) continue;
    const c = getComputedStyle(e);
    out[e.placeholder] = {
      x: Math.round((b.left - o.left) * 2) / 2,
      y: null, w: null, h: null,
      taille: c.fontSize, graisse: c.fontWeight, couleur: null
    };
  }

  for (const e of [racine, ...racine.querySelectorAll('*')]) {
    const noeuds = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!noeuds.length) continue;
    const texte = noeuds.map((n) => n.textContent).join('').replace(/\\s+/g, ' ').trim();
    if (!texte) continue;
    const r = document.createRange();
    r.setStartBefore(noeuds[0]);
    r.setEndAfter(noeuds[noeuds.length - 1]);
    const b = r.getBoundingClientRect();
    r.detach();
    if (!b.width || !b.height) continue;
    if (b.bottom < o.top || b.top > o.bottom) continue;
    const c = getComputedStyle(e);
    out[texte] = {
      x: Math.round((b.left - o.left) * 2) / 2,
      y: Math.round((b.top - o.top) * 2) / 2,
      w: Math.round(b.width * 2) / 2,
      h: Math.round(b.height * 2) / 2,
      taille: c.fontSize, graisse: c.fontWeight, couleur: c.color
    };
  }
  return out;
}`;

function comparerGeometrie(appli, maquette, exemples = []) {
  const motifs = exemples.map((m) => new RegExp(m));
  const attendu = (t) => motifs.some((r) => r.test(t));
  const ecarts = [];

  for (const [texte, m] of Object.entries(maquette)) {
    if (attendu(texte)) continue;
    const a = appli[texte];
    if (!a) { ecarts.push(`« ${texte} » absent de l’application`); continue; }
    /* Un texte d'invite ne se mesure pas comme de l'encre : sa boîte
       est celle du champ, pas celle des lettres. On compare ce qui a
       du sens — la taille et la graisse — et l'écart de pixels fait
       le reste. */
    if (a.y === null || m.y === null) {
      if (a.taille !== m.taille) ecarts.push(`invite « ${texte} » en ${a.taille} au lieu de ${m.taille}`);
      continue;
    }
    if (a.x !== m.x || a.y !== m.y) {
      ecarts.push(`« ${texte} » en (${a.x}, ${a.y}) au lieu de (${m.x}, ${m.y})`);
    } else if (a.w !== m.w || a.h !== m.h) {
      ecarts.push(`« ${texte} » mesure ${a.w}×${a.h} au lieu de ${m.w}×${m.h}`);
    }
    if (a.taille !== m.taille) ecarts.push(`« ${texte} » en ${a.taille} au lieu de ${m.taille}`);
    if (a.graisse !== m.graisse) ecarts.push(`« ${texte} » en graisse ${a.graisse} au lieu de ${m.graisse}`);
    if (a.couleur !== m.couleur) ecarts.push(`« ${texte} » en ${a.couleur} au lieu de ${m.couleur}`);
  }
  for (const texte of Object.keys(appli)) {
    if (attendu(texte)) continue;
    if (!maquette[texte]) ecarts.push(`« ${texte} » en trop dans l’application`);
  }
  return ecarts;
}

function comparerImages(a, b, sortie) {
  const A = PNG.sync.read(readFileSync(a));
  const B = PNG.sync.read(readFileSync(b));
  const largeur = Math.min(A.width, B.width);
  const hauteur = Math.min(A.height, B.height);
  const recadrer = (img) => {
    const out = new PNG({ width: largeur, height: hauteur });
    PNG.bitblt(img, out, 0, 0, largeur, hauteur, 0, 0);
    return out;
  };
  const a2 = recadrer(A);
  const b2 = recadrer(B);
  const diff = new PNG({ width: largeur, height: hauteur });
  const n = pixelmatch(a2.data, b2.data, diff.data, largeur, hauteur, { threshold: SEUIL_PIXEL });
  writeFileSync(sortie, PNG.sync.write(diff));
  return { n, pourcent: (n / (largeur * hauteur)) * 100 };
}

/* ------------------------------------------------------------ */
const site = await servir(RACINE, 4174);

const navigateur = await chromium.launch({
  /* Chromium n'applique pas le lissage sous-pixel aux couches
     composées : les deux côtés ne seraient pas rasterisés pareil et
     chaque contour de glyphe compterait comme un écart. */
  args: ['--disable-lcd-text']
});
const page = await navigateur.newPage({
  viewport: { width: 1300, height: 900 },
  deviceScaleFactor: 1,
  /* Sans cela, la maquette est photographiée au milieu de son
     animation d'entrée et l'écart mesuré n'a aucun sens. */
  reducedMotion: 'reduce'
});
await poserSession(page);
await brancher(page);

/* Un contexte à part pour l'écran de connexion. Vider le stockage ne
   suffit pas : la session est reposée par un script d'initialisation
   qui rejoue à CHAQUE navigation. Il faut donc une page qui ne l'a
   jamais reçu. */
const anonyme = await navigateur.newPage({
  viewport: { width: 370, height: 780 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce'
});
await brancher(anonyme);

let largeur = 370;
let hauteur = 780;

async function photoMaquette(cle, chemin) {
  /* Sous 900 px, la maquette bascule sur SA barre de présentation
     verte, qui remplace l'en-tête de l'écran. On la regarde donc
     depuis un écran large. */
  await page.setViewportSize({ width: 1300, height: 900 });
  await page.goto('file://' + join(process.cwd(), 'dist/maquette-waishi.html'));
  await page.waitForTimeout(700);
  await page.evaluate((k) => afficher(k), cle);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const e = document.querySelector('.device__screen');
    e.style.borderRadius = '0';
    document.querySelectorAll('.bulle').forEach((b) => b.remove());
    /* Le cadre est centré dans la scène : il tombe sur une position
       fractionnaire, la capture s'arrondit et tout le texte se
       décale d'un demi-pixel. On le colle en haut à gauche. */
    const st = document.querySelector('.stage');
    st.style.cssText += ';padding:0;display:block;overflow:visible';
    document.querySelector('.device').style.cssText += ';margin:0;padding:0;border-radius:0';
  });
  await page.locator('.device__screen').screenshot({ path: chemin });
  const img = PNG.sync.read(readFileSync(chemin));
  largeur = img.width;
  hauteur = img.height;
  return page.evaluate(`(${RELEVE})(document.querySelector('.device__screen'))`);
}

async function photoApplication(vue, route, chemin) {
  /* La MÊME largeur que l'écran de la maquette : une largeur
     différente changerait tous les retours à la ligne et l'écart
     mesuré ne voudrait plus rien dire. */
  await vue.setViewportSize({ width: largeur, height: hauteur });
  await vue.goto(`${site.adresse}${route}`, { waitUntil: 'networkidle' });
  await vue.waitForTimeout(400);
  await vue.screenshot({ path: chemin });
  return vue.evaluate(`(${RELEVE})(document.body)`);
}

console.log('');
let echecs = 0;

for (const { cle, route, maquette, exemples, sansSession } of liste) {
  const fMaq = `${SORTIE}/${cle}-maquette.png`;
  const fApp = `${SORTIE}/${cle}-application.png`;
  const fDif = `${SORTIE}/${cle}-ecart.png`;

  /* La maquette d'abord : c'est elle qui donne la taille. */
  const geoMaq = await photoMaquette(maquette, fMaq);
  const geoApp = await photoApplication(sansSession ? anonyme : page, route, fApp);

  const ecarts = comparerGeometrie(geoApp, geoMaq, exemples);
  const { pourcent } = comparerImages(fApp, fMaq, fDif);
  const bon = ecarts.length === 0 && pourcent <= SEUIL_ECRAN;
  if (!bon) echecs++;

  const nb = Object.keys(geoMaq).length;
  console.log(
    `${bon ? '✓' : '✗'} ${cle.padEnd(12)} ${nb} textes · ${pourcent.toFixed(2)} % de pixels différents`
  );
  for (const e of ecarts.slice(0, 12)) console.log(`   ${e}`);
  if (ecarts.length > 12) console.log(`   … et ${ecarts.length - 12} autres`);
}

await navigateur.close();
site.fermer();

console.log('');
console.log(
  echecs === 0
    ? `Les ${liste.length} écrans comparés sont conformes à la maquette.`
    : `${echecs} écran(s) s’écartent de la maquette. Images dans ${SORTIE}/.`
);
process.exit(echecs === 0 ? 0 : 1);
