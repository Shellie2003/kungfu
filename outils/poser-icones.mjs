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
async function carre(taille, { rond = false, part = 1, fond = VERT } = {}) {
  const base64 = await page.evaluate(
    async ([src, t, estRond, p, couleur]) => {
      const image = await new Promise((ok, ko) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = ko;
        i.src = src;
      });

      const toile = document.createElement('canvas');
      toile.width = t;
      toile.height = t;
      const c = toile.getContext('2d');

      if (couleur) {
        if (estRond) {
          c.beginPath();
          c.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2);
          c.closePath();
          c.clip();
        }
        c.fillStyle = couleur;
        c.fillRect(0, 0, t, t);
      }

      /* Le logo, centré et à l'échelle. « min » sur les deux côtés :
         un logo qui ne serait pas carré resterait entier plutôt que
         d'être étiré. */
      const cote = t * p;
      const echelle = Math.min(cote / image.width, cote / image.height);
      const l = image.width * echelle;
      const h = image.height * echelle;
      c.imageSmoothingQuality = 'high';
      c.drawImage(image, (t - l) / 2, (t - h) / 2, l, h);

      return toile.toDataURL('image/png').split(',')[1];
    },
    [source, taille, rond, part, fond]
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
    await carre(Math.round(taille * FACTEUR_ADAPTATIF), { part: PART_DU_LOGO, fond: null })
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

await navigateur.close();

console.log('');
console.log(`✓ icône        ${ecrits} fichiers engendrés depuis img/${fichier}`);
console.log(`  ${DENSITES.length} densités × (carrée, ronde, avant-plan adaptatif)`);
console.log(`  fond adaptatif ${VERT}, logo à ${Math.round(PART_DU_LOGO * 100)} % pour survivre au rognage`);
if (!existsSync(join(RES, 'mipmap-xxxhdpi', 'ic_launcher.png'))) {
  console.error('… mais rien n’a été écrit à l’endroit attendu. Le dossier res/ est-il le bon ?');
  process.exit(1);
}
