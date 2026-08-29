/* ============================================================
   img/logo.jpg  →  les images de l'application.

     node outils/images-app.mjs

   Produit, dans mobile/assets/ :
     logo.png              256 px — l'emblème dans les écrans
     icone.png            1024 px — l'icône de l'application
     icone-adaptative.png 1024 px — la couche avant Android, avec la
                                    marge de sécurité de 33 %
     demarrage.png         512 px — l'écran de démarrage

   Le redimensionnement passe par le canevas d'un navigateur : ni
   Pillow ni ImageMagick ne sont installés, et ajouter une
   dépendance pour quatre images serait cher payé.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const SOURCE = 'img';
const CIBLE = 'mobile/assets';

/* Le club envoie ce qu'il a : jpg, png, webp… On prend ce qui est là. */
const trouver = () => {
  const f = readdirSync(SOURCE).find((n) => /^logo\.(png|jpg|jpeg|webp)$/i.test(n));
  if (!f) throw new Error(`Aucun img/logo.(png|jpg|jpeg|webp) — déposez le logo du club.`);
  return join(SOURCE, f);
};

const source = trouver();
const type = source.endsWith('.png') ? 'png' : source.endsWith('.webp') ? 'webp' : 'jpeg';
const donnees = `data:image/${type};base64,${readFileSync(source).toString('base64')}`;

mkdirSync(CIBLE, { recursive: true });

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

/* marge : proportion de vide autour du logo.
   fond  : null pour transparent. */
const IMAGES = [
  { fichier: 'logo.png', taille: 256, marge: 0, fond: null },
  { fichier: 'icone.png', taille: 1024, marge: 0.06, fond: '#FFFFFF' },
  /* Android rogne l'icône adaptative en cercle, en carré arrondi ou
     en goutte selon le fabricant. Seuls les 66 % centraux sont sûrs :
     d'où une marge de 17 % de chaque côté, sans quoi le texte du
     pourtour du logo se ferait couper. */
  { fichier: 'icone-adaptative.png', taille: 1024, marge: 0.17, fond: '#FFFFFF' },
  { fichier: 'demarrage.png', taille: 512, marge: 0.18, fond: null }
];

const produites = [];
for (const { fichier, taille, marge, fond } of IMAGES) {
  const b64 = await page.evaluate(
    async ({ donnees, taille, marge, fond }) => {
      const img = new Image();
      img.src = donnees;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = taille;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (fond) { ctx.fillStyle = fond; ctx.fillRect(0, 0, taille, taille); }
      const dedans = taille * (1 - 2 * marge);
      /* On garde les proportions et on centre : un logo étiré est
         pire qu'un logo petit. */
      const echelle = Math.min(dedans / img.width, dedans / img.height);
      const l = img.width * echelle, h = img.height * echelle;
      ctx.drawImage(img, (taille - l) / 2, (taille - h) / 2, l, h);
      return c.toDataURL('image/png').split(',')[1];
    },
    { donnees, taille, marge, fond }
  );
  const chemin = join(CIBLE, fichier);
  writeFileSync(chemin, Buffer.from(b64, 'base64'));
  produites.push({ chemin, taille });
}

await navigateur.close();

/* Vérification : on relit l'en-tête PNG de chaque fichier produit.
   Les octets 16 à 24 portent la largeur et la hauteur. */
console.log(`depuis ${source} :`);
for (const { chemin, taille } of produites) {
  const b = readFileSync(chemin);
  const l = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const ko = (b.length / 1024).toFixed(0);
  if (l !== taille || h !== taille) {
    throw new Error(`${chemin} fait ${l}x${h}, attendu ${taille}x${taille}`);
  }
  console.log(`  ${chemin.padEnd(34)} ${l}x${h}  ${ko} Ko`);
}

if (!existsSync(join(CIBLE, 'logo.png'))) throw new Error('logo.png non produit');
