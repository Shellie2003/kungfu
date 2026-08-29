/* ============================================================
   Mesure l'écart entre un écran de l'application et l'écran
   correspondant de la maquette.

     node outils/comparer.mjs            # tous les écrans portés
     node outils/comparer.mjs etudiants  # un seul

   Comment : les composants React Native sont rendus dans un
   navigateur par react-native-web, avec les mêmes polices
   embarquées que la maquette. Les deux images sont ensuite
   comparées pixel par pixel.

   Ce que cela prouve, et ce que cela ne prouve pas
   ------------------------------------------------
   Cela prouve que l'arbre de composants produit la bonne
   géométrie : marges, tailles, couleurs, retours à la ligne.
   C'est là que se logent 90 % des écarts, et ils sont invisibles
   à l'œil.

   Cela ne prouve PAS que le rendu natif Android est identique au
   pixel près. Trois choses diffèrent par nature, et sont donc
   tolérées : le lissage des polices, les ombres (elevation), et
   l'arrondi des sous-pixels. D'où un seuil, et non zéro.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { assembler } from './assembler.mjs';
import { policesWeb } from './polices-web.mjs';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { ECRANS } from './ecrans.mjs';

/* La taille n'est pas devinée : elle est lue sur .device__screen de la
   maquette. Le cadre de téléphone a 10 px de marge, l'écran fait donc
   370 px et non 390 — une largeur fausse changerait tous les retours
   à la ligne et l'écart mesuré ne voudrait plus rien dire. */
let LARGEUR = 370, HAUTEUR = 780;
const SEUIL_PIXEL = 0.12;                /* tolérance de couleur par pixel */
const SEUIL_ECRAN = 0.3;                 /* % de pixels différents accepté */
const SORTIE = 'outils/comparaisons';

/* La liste des écrans portés est dans outils/ecrans.mjs, partagée
   avec l'aperçu : porter un écran, c'est y ajouter une ligne. */

const demandes = process.argv.slice(2);
const liste = demandes.length ? ECRANS.filter((e) => demandes.includes(e.cle)) : ECRANS;
if (!liste.length) {
  console.error('Aucun écran porté ne correspond. Connus : ' + ECRANS.map((e) => e.cle).join(', '));
  process.exit(1);
}

mkdirSync(SORTIE, { recursive: true });

/* ------------------------------------------------------------
   2. Photographier les deux écrans.
   ------------------------------------------------------------ */
/* La page de l'application reçoit les TTF que l'APK embarquera ;
   la maquette, elle, garde ses propres @font-face. */
const POLICES = policesWeb();

async function photoApplication(page, script, chemin) {
  await page.setViewportSize({ width: LARGEUR, height: HAUTEUR });
  await page.setContent(`<!doctype html><meta charset="utf-8">
    <style>${POLICES}
      /* Le même lissage que la maquette : sans lui, chaque glyphe
         est rendu plus gras et tout le texte compte comme un écart. */
      html,body{margin:0;padding:0;background:#fff;-webkit-font-smoothing:antialiased}
      /* Le cadre a exactement la taille de l'écran de la maquette :
         une largeur différente changerait tous les retours à la ligne.
         display:flex parce qu'un écran React Native s'ouvre sur un
         View en flex:1 — sans conteneur flex, il prend la hauteur de
         son contenu et la barre du bas descend hors de l'écran. */
      #r{width:${LARGEUR}px;height:${HAUTEUR}px;overflow:hidden;display:flex;flex-direction:column}
    </style><div id="r"></div>`);
  await page.addScriptTag({ content: script });
  await page.waitForTimeout(400);
  await page.locator('#r').screenshot({ path: chemin });
  return page.evaluate(`(${RELEVE})(document.getElementById('r'))`);
}

async function photoMaquette(page, cle, chemin) {
  /* Sous 900 px, la maquette bascule sur SA barre de présentation
     verte — menu et export — qui remplace l'en-tête de l'écran. On la
     regarde donc depuis un écran large, où le cadre téléphone fait
     exactement 390 x 780, la taille du rendu de l'application. */
  await page.setViewportSize({ width: 1300, height: 900 });
  await page.goto('file://' + join(process.cwd(), 'dist/maquette-waishi.html'));
  await page.waitForTimeout(700);
  await page.evaluate((k) => afficher(k), cle);
  await page.waitForTimeout(400);
  /* On retire l'arrondi et la bulle de commentaire : ils
     appartiennent à la présentation de la maquette, pas à
     l'application. Les comparer serait compter un faux écart. */
  await page.evaluate(() => {
    const e = document.querySelector('.device__screen');
    e.style.borderRadius = '0';
    document.querySelectorAll('.bulle').forEach((b) => b.remove());
    /* Le cadre est centré dans la scène : il tombe sur une position
       fractionnaire, la capture s'arrondit vers le haut et tout le
       texte se décale d'un demi-pixel. On le colle en haut à gauche
       le temps de la mesure — position entière, capture exacte. */
    const st = document.querySelector('.stage');
    st.style.cssText += ';padding:0;display:block;overflow:visible';
    document.querySelector('.device').style.cssText += ';margin:0;padding:0;border-radius:0';
  });
  await page.locator('.device__screen').screenshot({ path: chemin });
  /* La taille retenue est celle de l'image effectivement produite :
     une hauteur fractionnaire arrondie autrement des deux côtés
     ferait échouer la comparaison pour un pixel. */
  const img = PNG.sync.read(readFileSync(chemin));
  LARGEUR = img.width;
  HAUTEUR = img.height;
  return page.evaluate(`(${RELEVE})(document.querySelector('.device__screen'))`);
}

/* ------------------------------------------------------------
   2 bis. Relever la géométrie de chaque texte.

   C'est la vérification forte. Le pourcentage de pixels tolère un
   écart ; celle-ci n'en tolère aucun. Tout texte visible doit se
   trouver au même endroit, à la même taille, dans la même couleur
   et la même graisse des deux côtés.

   Elle attrape ce que l'œil ne voit pas : une marge de 2 px, une
   graisse 600 au lieu de 700, un gris légèrement différent.
   ------------------------------------------------------------ */
const RELEVE = `(racine) => {
  const o = racine.getBoundingClientRect();
  const out = {};
  const tous = [racine, ...racine.querySelectorAll('*')];
  for (const e of tous) {
    /* Les noeuds de texte portés DIRECTEMENT par cet élément. On
       mesure le texte lui-même, par un Range, et non la boîte qui le
       contient : la maquette pose souvent le texte sur l'élément
       rembourré, React Native impose un <Text> à l'intérieur. Comparer
       les boîtes comparerait deux choses différentes ; comparer l'encre
       compare la même. */
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
    if (b.bottom < o.top || b.top > o.bottom) continue;   /* hors écran */
    const c = getComputedStyle(e);
    /* Les deux côtés expriment la graisse autrement : la maquette
       par font-weight sur une police variable, l'application par le
       NOM de la police, faute de quoi Android ne la trouverait pas.
       On compare donc la graisse EFFECTIVE — celle que le lecteur
       voit — et non la propriété CSS. */
    const fam = c.fontFamily || '';
    const parNom = /-Bold/.test(fam) ? '700'
                 : /-SemiBold/.test(fam) ? '600'
                 : /-Medium/.test(fam) ? '500'
                 : null;
    out[texte] = {
      x: Math.round((b.left - o.left) * 2) / 2,
      y: Math.round((b.top - o.top) * 2) / 2,
      w: Math.round(b.width * 2) / 2,
      h: Math.round(b.height * 2) / 2,
      taille: c.fontSize, graisse: parNom || c.fontWeight, couleur: c.color
    };
  }
  return out;
}`;

function comparerGeometrie(appli, maquette, exemples = []) {
  const ecarts = [];
  /* « exemples » : des motifs de contenu qui diffèrent LÉGITIMEMENT
     entre la maquette et l'application — une valeur montrée en
     exemple dans un champ que l'application laisse vide, un
     décompte qui dépend du jeu de données. Ils s'appliquent aux
     DEUX côtés : sans cela, écarter « 64 membres » de la maquette
     ferait apparaître « 6 membres » comme un texte en trop.
     Ce sont des expressions régulières, déclarées écran par écran
     dans outils/ecrans.mjs. */
  const motifs = exemples.map((m) => new RegExp(m));
  const attendu = (t) => motifs.some((r) => r.test(t));

  for (const [texte, m] of Object.entries(maquette)) {
    if (attendu(texte)) continue;
    const a = appli[texte];
    if (!a) { ecarts.push(`« ${texte} » absent de l’application`); continue; }
    if (a.x !== m.x || a.y !== m.y) {
      ecarts.push(`« ${texte} » en (${a.x}, ${a.y}) au lieu de (${m.x}, ${m.y})`);
    } else if (a.w !== m.w || a.h !== m.h) {
      ecarts.push(`« ${texte} » mesure ${a.w}x${a.h} au lieu de ${m.w}x${m.h}`);
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

/* ------------------------------------------------------------
   3. Comparer les images.
   ------------------------------------------------------------ */
function comparer(a, b, sortie) {
  const A = PNG.sync.read(readFileSync(a));
  const B = PNG.sync.read(readFileSync(b));
  if (A.width !== B.width || A.height !== B.height) {
    throw new Error(`Tailles différentes : ${A.width}x${A.height} contre ${B.width}x${B.height}`);
  }
  const diff = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: SEUIL_PIXEL });
  writeFileSync(sortie, PNG.sync.write(diff));
  return { n, total: A.width * A.height, pourcent: (n / (A.width * A.height)) * 100 };
}

/* ------------------------------------------------------------ */
if (!existsSync('dist/maquette-waishi.html')) {
  console.error('dist/maquette-waishi.html absent — lancez d’abord : node build.js');
  process.exit(1);
}

const navigateur = await chromium.launch({
  /* Chromium n'applique pas le lissage sous-pixel aux couches
     composées : la maquette et l'application ne seraient pas
     rasterisées de la même façon, et chaque contour de glyphe
     compterait comme un écart. On désactive donc le sous-pixel des
     deux côtés. Sans effet sur l'application réelle : Android a son
     propre moteur de rendu, et c'est l'une des différences que le
     seuil couvre. */
  args: ['--disable-lcd-text']
});
const page = await navigateur.newPage({
  viewport: { width: 1300, height: 900 },
  deviceScaleFactor: 1,
  /* Sans cela, la maquette est photographiée au milieu de son
     animation d'entrée et l'écart mesuré n'a aucun sens. */
  reducedMotion: 'reduce'
});

let echecs = 0;
for (const { cle, module, props, exemples } of liste) {
  const appli = `${SORTIE}/${cle}-application.png`;
  const maq = `${SORTIE}/${cle}-maquette.png`;
  const dif = `${SORTIE}/${cle}-ecart.png`;

  const script = await assembler(module, { props });
  const geoMaq = await photoMaquette(page, cle, maq);   /* d'abord : elle donne la taille */
  const geoApp = await photoApplication(page, script, appli);

  const ecarts = comparerGeometrie(geoApp, geoMaq, exemples);
  const { n, total, pourcent } = comparer(appli, maq, dif);
  const bon = ecarts.length === 0 && pourcent <= SEUIL_ECRAN;
  if (!bon) echecs++;

  console.log(`${bon ? '✓' : '✗'} ${cle}`);
  console.log(
    `    géométrie : ${ecarts.length ? ecarts.length + ' écart(s)' : Object.keys(geoMaq).length + ' textes au même endroit, à la même taille, dans la même couleur'}`
  );
  for (const e of ecarts.slice(0, 12)) console.log(`      · ${e}`);
  if (ecarts.length > 12) console.log(`      · … et ${ecarts.length - 12} autres`);
  console.log(
    `    pixels    : ${pourcent.toFixed(2)} % (${n.toLocaleString('fr-FR')} sur ` +
    `${total.toLocaleString('fr-FR')}, seuil ${SEUIL_ECRAN} %) — le reste est du rendu de glyphes`
  );
  if (!bon) console.log(`    → ${dif}`);
}

await navigateur.close();
process.exit(echecs ? 1 : 0);
