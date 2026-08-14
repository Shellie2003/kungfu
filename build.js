/* ============================================================
   build.js — Assemble index.html et ses ressources en un seul
   fichier autonome (dist/kung-fu.html), partageable tel quel.

       node build.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let html = read('index.html');

/* Les feuilles de style et les scripts sont inlinés dans l'ordre
   où ils apparaissent, pour préserver les dépendances. */
html = html.replace(/[ \t]*<link rel="stylesheet" href="([^"]+)">\n?/g,
  (_, href) => `  <style>\n${read(href)}\n  </style>\n`);

html = html.replace(/[ \t]*<script src="([^"]+)"><\/script>\n?/g,
  (_, src) => `  <script>\n${read(src)}\n  </script>\n`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'kung-fu.html');
fs.writeFileSync(out, html);

console.log(`dist/kung-fu.html — ${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko`);
