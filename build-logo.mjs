/* ============================================================
   build-logo.mjs — Prépare le logo du club pour la maquette

       node build-logo.mjs      →  écrit js/logo.js

   Le fichier fourni par le club fait 1254 px et 202 Ko, pour un
   affichage qui ne dépasse jamais 72 px. On le réduit et on
   l'incorpore : la maquette reste alors d'un seul tenant, y compris
   dans le fichier unique envoyé par courriel, où un chemin relatif
   vers img/ ne résoudrait pas.
   ============================================================ */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const TAILLE = 320;   /* deux fois la plus grande taille d'affichage */

const fichier = readdirSync('img').find((f) => /^logo\.(png|jpe?g|webp|svg)$/i.test(f));
if (!fichier) {
  console.error('Aucun img/logo.(png|jpg|webp|svg) — rien à faire.');
  process.exit(0);
}

const ext = fichier.split('.').pop().toLowerCase();
const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' }[ext];
const source = `data:${mime};base64,${readFileSync('img/' + fichier).toString('base64')}`;

const nav = await chromium.launch();
const page = await nav.newPage();

const petit = await page.evaluate(async ([src, taille]) => {
  const img = new Image();
  await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = src; });
  const c = document.createElement('canvas');
  c.width = c.height = taille;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  /* Fond blanc : le logo fourni en JPEG n'a pas de transparence, et
     un PNG transparent doit rester lisible sur une surface claire. */
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, taille, taille);
  const cote = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, taille, taille);
  return c.toDataURL('image/webp', 0.86);
}, [source, TAILLE]);

await nav.close();

writeFileSync('js/logo.js', `/* GÉNÉRÉ par build-logo.mjs depuis img/${fichier}. Ne pas modifier. */
const LOGO_INTEGRE = '${petit}';
`);

console.log(`js/logo.js — ${fichier} ${Math.round(readFileSync('img/' + fichier).length / 1024)} Ko → ${Math.round(petit.length / 1024)} Ko en ${TAILLE}px`);
