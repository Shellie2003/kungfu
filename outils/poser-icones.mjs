/* ============================================================
   poser-icones.mjs — L'icône de l'application, depuis le logo du club.

       node outils/poser-icones.mjs [dossier/res]

   ------------------------------------------------------------
   POURQUOI UN SCRIPT PLUTÔT QUE DES FICHIERS COMMITÉS

   Le dossier « android/ » n'est pas dans le dépôt : il se régénère à
   chaque construction à partir de capacitor.config.ts, pour qu'un
   dossier natif ne diverge jamais de la configuration censée le
   décrire. Y déposer des icônes à la main les ferait disparaître à
   la construction suivante.

   Les icônes sont donc ENGENDRÉES, après « cap add android », à
   partir de la seule source qui fasse foi : « img/logo.jpg », le
   fichier que le club a fourni.

   ------------------------------------------------------------
   POURQUOI CHROMIUM ET NON UNE BIBLIOTHÈQUE D'IMAGES

   C'est déjà la façon de faire du projet — « build-logo.mjs » réduit
   le même logo pour la maquette avec le même moyen. Ni « sharp » ni
   ImageMagick ne sont installés, et les ajouter pour redimensionner
   cinq carrés serait payer cher une chose que le navigateur déjà
   présent fait très bien.

   ------------------------------------------------------------
   CE QUE ANDROID ATTEND, ET POURQUOI IL Y A TROIS SÉRIES

   · « ic_launcher »        — l'icône carrée, pour les lanceurs anciens
   · « ic_launcher_round »  — la même, ronde, pour ceux qui la veulent ainsi
   · « ic_launcher_foreground » — l'AVANT-PLAN de l'icône adaptative
     (Android 8 et plus). Le système la pose sur un fond de sa
     couleur, et la RECADRE fortement : un cinquième de chaque bord
     peut disparaître selon la forme choisie par le lanceur. D'où la
     marge de sécurité ci-dessous — sans elle, le logo du club sort
     du cadre sur la moitié des téléphones.
   ============================================================ */
/* ⚠ « playwright », par son NOM et non par un chemin.

   J'avais écrit ici un chemin absolu — /opt/node22/lib/node_modules/… —
   recopié d'un autre outil. Il existe sur la machine où ce script a
   été écrit, et NULLE PART ailleurs : l'exécution nº 74 s'est arrêtée
   dessus en zéro seconde, après avoir tout réussi jusque-là.

   Les dix autres outils du dossier importent « playwright » par son
   nom. Celui-ci le fait maintenant aussi. */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = new URL('..', import.meta.url).pathname;
const RES = process.argv[2] ?? join(RACINE, 'app/android/app/src/main/res');

/* Les cinq densités d'Android, et la taille de l'icône dans chacune.
   « mdpi » est la référence : 48 points. Les autres en sont des
   multiples. */
const DENSITES = [
  ['mdpi', 48],
  ['hdpi', 72],
  ['xhdpi', 96],
  ['xxhdpi', 144],
  ['xxxhdpi', 192]
];

/* L'avant-plan adaptatif mesure 108 points là où l'icône en mesure
   48 — le système garde le carré central et rogne le reste. */
const FACTEUR_ADAPTATIF = 108 / 48;

/* La part de l'avant-plan que le logo occupe. Le système peut rogner
   jusqu'au tiers extérieur ; 0,62 laisse le logo entier dans un
   cercle comme dans un carré arrondi. Mesuré sur la grille
   d'Android, pas choisi au hasard. */
const PART_DU_LOGO = 0.62;

const VERT = '#0F5132'; /* le vert du club, celui de capacitor.config.ts */

const fichier = readdirSync(join(RACINE, 'img'))
  .find((f) => /^logo\.(png|jpe?g|webp)$/i.test(f));
if (!fichier) {
  console.error(
    'Aucun img/logo.(png|jpg|webp) — l’icône ne peut pas être engendrée.\n' +
      'C’est le fichier que le club a fourni ; sans lui, l’application\n' +
      'porterait l’icône par défaut de Capacitor.'
  );
  process.exit(1);
}

const ext = fichier.split('.').pop().toLowerCase();
const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[ext];
const source = `data:${mime};base64,${readFileSync(join(RACINE, 'img', fichier)).toString('base64')}`;

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

/* ------------------------------------------------------------
   Dessiner un carré : le logo, centré, sur le vert du club.

   « rond » découpe un disque — c'est « ic_launcher_round ».
   « part » dit quelle fraction du carré le logo occupe : pleine pour
   l'icône ordinaire, réduite pour l'avant-plan adaptatif que le
   système va rogner.
   ------------------------------------------------------------ */
async function carre(taille, { rond = false, part = 1, fond = VERT, logoEnDisque = false } = {}) {
  return rectangle(taille, taille, { rond, part, fond, logoEnDisque });
}

/* ------------------------------------------------------------
   Le même dessin, mais sur un rectangle : l'écran de démarrage.

   Il ne peut pas être carré — un téléphone ne l'est pas, et Android
   étire l'image sur tout l'écran. Le logo garde donc ses proportions
   au centre, et le vert remplit le reste.
   ------------------------------------------------------------ */
async function rectangle(
  largeur,
  hauteur,
  { rond = false, part = 1, fond = VERT, logoEnDisque = false } = {}
) {
  const base64 = await page.evaluate(
    async ([src, l0, h0, estRond, p, couleur, disque]) => {
      const image = await new Promise((ok, ko) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = ko;
        i.src = src;
      });

      const toile = document.createElement('canvas');
      toile.width = l0;
      toile.height = h0;
      const c = toile.getContext('2d');

      if (couleur) {
        if (estRond) {
          c.beginPath();
          c.arc(l0 / 2, h0 / 2, Math.min(l0, h0) / 2, 0, Math.PI * 2);
          c.closePath();
          c.clip();
        }
        c.fillStyle = couleur;
        c.fillRect(0, 0, l0, h0);
      }

      /* Le logo, centré et à l'échelle. « min » sur les deux côtés :
         un logo qui ne serait pas carré resterait entier plutôt que
         d'être étiré. */
      const cote = Math.min(l0, h0) * p;
      const echelle = Math.min(cote / image.width, cote / image.height);
      const l = image.width * echelle;
      const h = image.height * echelle;
      c.imageSmoothingQuality = 'high';

      /* ⚠ LE LOGO EST UN EMBLÈME ROND DANS UNE IMAGE CARRÉE.

         Ses quatre coins sont BLANCS. Posé en grand, cela ne se voit
         pas : le carré blanc EST le fond de l'icône. Posé en petit sur
         le vert du club — l'écran de démarrage, l'avant-plan
         adaptatif — il apparaît comme une boîte blanche autour de
         l'aigle. Rendu et regardé : c'est laid, et cela n'a rien du
         logo qu'on croyait poser.

         On découpe donc au disque inscrit, qui suit exactement
         l'anneau doré de l'emblème. */
      if (disque) {
        c.save();
        c.beginPath();
        c.arc(l0 / 2, h0 / 2, Math.min(l, h) / 2, 0, Math.PI * 2);
        c.closePath();
        c.clip();
      }
      c.drawImage(image, (l0 - l) / 2, (h0 - h) / 2, l, h);
      if (disque) c.restore();

      return toile.toDataURL('image/png').split(',')[1];
    },
    [source, largeur, hauteur, rond, part, fond, logoEnDisque]
  );
  return Buffer.from(base64, 'base64');
}

let ecrits = 0;
for (const [densite, taille] of DENSITES) {
  const dossier = join(RES, `mipmap-${densite}`);
  mkdirSync(dossier, { recursive: true });

  writeFileSync(join(dossier, 'ic_launcher.png'), await carre(taille));
  writeFileSync(join(dossier, 'ic_launcher_round.png'), await carre(taille, { rond: true }));
  /* L'avant-plan est TRANSPARENT : le fond vient du système, qui le
     lit dans « ic_launcher_background ». Un fond peint ici
     apparaîtrait comme un carré au milieu du cercle. */
  writeFileSync(
    join(dossier, 'ic_launcher_foreground.png'),
    await carre(Math.round(taille * FACTEUR_ADAPTATIF), {
      part: PART_DU_LOGO,
      fond: null,
      logoEnDisque: true
    })
  );
  ecrits += 3;
}

/* Le fond de l'icône adaptative. Capacitor engendre un
   « ic_launcher_background.xml » ; on pose la couleur du club à la
   place de celle du modèle. */
const couleurs = join(RES, 'values');
mkdirSync(couleurs, { recursive: true });
writeFileSync(
  join(couleurs, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<!-- Engendré par outils/poser-icones.mjs — ne pas modifier à la main. -->
<resources>
    <color name="ic_launcher_background">${VERT}</color>
</resources>
`
);
ecrits++;

/* ============================================================
   L'ÉCRAN DE DÉMARRAGE.

   « Je vois aussi que le splash par défaut de Capacitor est encore
   présent. »

   Il l'était : le modèle Android de Capacitor dépose ONZE fichiers
   « splash.png » — son propre logo sur fond blanc — et le thème de
   lancement les affiche. Poser l'icône ne les touchait pas.

   ------------------------------------------------------------
   POURQUOI ONZE, ET NON UN SEUL

   Android choisit selon l'ORIENTATION (port/land) et la DENSITÉ de
   l'écran. Une seule image serait étirée : le logo du club paraîtrait
   ovale sur la moitié des téléphones. Ce sont les onze formats exacts
   du modèle, relevés dedans plutôt que devinés.

   ------------------------------------------------------------
   ⚠ ET ANDROID 12 NE LES REGARDE PAS.

   Depuis Android 12, le système dessine LUI-MÊME l'écran de
   démarrage, à partir de deux attributs de thème :
   « windowSplashScreenBackground » et
   « windowSplashScreenAnimatedIcon ». Le modèle de Capacitor ne pose
   ni l'un ni l'autre — il ne donne qu'un « android:background », que
   les versions récentes ignorent.

   Remplacer les onze images seulement aurait donc corrigé les vieux
   téléphones et laissé les récents — la majorité — sur l'écran blanc
   du système. On écrit les deux : le thème pour Android 12 et au-delà,
   les images pour ce qui précède.
   ============================================================ */
const DEMARRAGE = [
  ['drawable', 480, 320],
  ['drawable-land-mdpi', 480, 320],
  ['drawable-land-hdpi', 800, 480],
  ['drawable-land-xhdpi', 1280, 720],
  ['drawable-land-xxhdpi', 1600, 960],
  ['drawable-land-xxxhdpi', 1920, 1280],
  ['drawable-port-mdpi', 320, 480],
  ['drawable-port-hdpi', 480, 800],
  ['drawable-port-xhdpi', 720, 1280],
  ['drawable-port-xxhdpi', 960, 1600],
  ['drawable-port-xxxhdpi', 1280, 1920]
];

/* Le logo occupe moins de place ici que sur l'icône : un écran de
   démarrage rempli au bord paraît à l'étroit, et l'image est plus
   grande que l'icône. */
const PART_AU_DEMARRAGE = 0.38;

for (const [dossier, largeur, hauteur] of DEMARRAGE) {
  const ou = join(RES, dossier);
  mkdirSync(ou, { recursive: true });
  writeFileSync(join(ou, 'splash.png'), await rectangle(largeur, hauteur, { part: PART_AU_DEMARRAGE, logoEnDisque: true }));
  ecrits++;
}

/* Le thème de lancement, réécrit en entier. Les trois premiers styles
   sont ceux du modèle, repris tels quels : les modifier n'apporterait
   rien et casserait la barre d'état. Seul le dernier change. */
writeFileSync(
  join(couleurs, 'styles.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<!-- Engendré par outils/poser-icones.mjs — ne pas modifier à la main. -->
<resources>

    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
    </style>

    <!--
      L'écran de démarrage du club.

      · android:background          — Android 11 et avant : l'image
      · windowSplashScreenBackground — Android 12 et après : la couleur
      · windowSplashScreenAnimatedIcon — le logo, au centre
      · postSplashScreenTheme       — le thème une fois l'écran passé ;
                                      sans lui, l'application garderait
                                      le thème de lancement.
    -->
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">@color/ic_launcher_background</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`
);
ecrits++;

await navigateur.close();

console.log('');
console.log(`✓ icône        ${ecrits} fichiers engendrés depuis img/${fichier}`);
console.log(`  ${DENSITES.length} densités × (carrée, ronde, avant-plan adaptatif)`);
console.log(`  ${DEMARRAGE.length} écrans de démarrage, et le thème pour Android 12 et au-delà`);
console.log(`  fond adaptatif ${VERT}, logo à ${Math.round(PART_DU_LOGO * 100)} % pour survivre au rognage`);
if (!existsSync(join(RES, 'mipmap-xxxhdpi', 'ic_launcher.png'))) {
  console.error('… mais rien n’a été écrit à l’endroit attendu. Le dossier res/ est-il le bon ?');
  process.exit(1);
}
