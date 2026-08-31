/* ============================================================
   Ouvrir la version WEB comme le club l'ouvre.

   Pourquoi cet outil existe
   -------------------------
   verifier-app.mjs sert app/dist à la RACINE d'un serveur d'essai.
   La version publiée, elle, vit sous /essai. Cette différence-là
   n'était vérifiée nulle part, et elle suffisait à rendre la page
   entièrement blanche :

     — vite.config.ts pose « base: '' », donc « ./assets/index.js ».
       C'est ce qu'il faut à l'APK, où Capacitor sert les fichiers
       depuis le disque.
     — Vercel sert la page à /essai SANS barre oblique finale
       (« trailingSlash: false »). Le navigateur résout alors
       « ./assets/… » par rapport à la RACINE : il demande
       /assets/…, qui n'existe pas.

   Le script ne chargeait donc jamais. Et un module absent ne dit
   RIEN à l'écran : ni message, ni page d'erreur, juste le vide. La
   construction « réussissait », le déploiement était « READY »,
   l'adresse répondait 200 — et il n'y avait rien à voir.

   Tout ce qui pouvait être vert l'était. Seul un navigateur pouvait
   le dire, et aucun n'ouvrait cette page. C'est ce que cet outil
   corrige : il l'ouvre, au bon chemin, et regarde.
   ============================================================ */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { brancher, poserSession } from './bouchon.mjs';

const RACINE = new URL('..', import.meta.url).pathname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

/* Un serveur qui se comporte comme Vercel sur ce projet :
   « outputDirectory: "." » — la racine du dépôt est servie telle
   quelle — et « cleanUrls: true », qui fait répondre /essai avec
   essai/index.html. C'est cette combinaison, et elle seule, qui
   produit la page blanche : la reproduire est tout l'intérêt. */
const site = createServer(async (req, rep) => {
  const chemin = decodeURIComponent((req.url ?? '/').split('?')[0]);
  for (const candidat of [chemin, `${chemin}/index.html`, `${chemin}.html`]) {
    const fichier = join(RACINE, candidat);
    try {
      if (!(await stat(fichier)).isFile()) continue;
      rep.writeHead(200, { 'content-type': TYPES[extname(fichier)] ?? 'application/octet-stream' });
      rep.end(await readFile(fichier));
      return;
    } catch { /* on essaie le candidat suivant */ }
  }
  rep.writeHead(404, { 'content-type': 'text/plain' });
  rep.end('introuvable');
});

await new Promise((ok) => site.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${site.address().port}`;

const navigateur = await chromium.launch();
const ennuis = [];

/* Les DEUX adresses. « /essai » est celle que Vercel sert et celle
   que le club ouvre ; « /essai/ » marchait déjà, et c'est justement
   ce qui rendait la panne difficile à croire. */
for (const [nom, url] of [
  ['sans barre oblique', `${base}/essai`],
  ['avec barre oblique', `${base}/essai/`]
]) {
  const page = await navigateur.newPage({ viewport: { width: 390, height: 780 } });
  /* Ce que le navigateur n'a PAS pu charger. C'est le signal le plus
     direct : la page blanche vient d'un 404 sur le script. */
  const manquants = [];
  page.on('requestfailed', (r) => manquants.push(r.url()));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('supabase')) manquants.push(`${r.status()} ${r.url()}`);
  });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));

  await brancher(page);
  await poserSession(page);
  await page.goto(url, { waitUntil: 'networkidle' });

  const texte = (await page.locator('body').innerText()).trim();
  if (!texte) {
    ennuis.push(
      `${nom} : la page est VIDE.\n` +
      (manquants.length
        ? `    Non chargé : ${[...new Set(manquants)].slice(0, 4).join(', ')}`
        : '    Rien n’a échoué au réseau — chercher ailleurs.')
    );
  } else if (erreurs.length) {
    ennuis.push(`${nom} : erreur de script — ${erreurs[0]}`);
  } else {
    console.log(`✓ ${nom.padEnd(20)} ${texte.split('\n')[0].slice(0, 46)}`);
  }
  await page.close();
}

await navigateur.close();
site.close();

if (ennuis.length) {
  console.error('\nLa version web ne s’afficherait pas :\n');
  for (const e of ennuis) console.error('  ✗ ' + e + '\n');
  console.error(
    '  La cause la plus probable est la BASE des chemins : outils/vercel-build.sh\n' +
    '  doit construire avec « --base=/essai/ ». Les chemins relatifs de\n' +
    '  vite.config.ts sont pour l’APK, pas pour le web.\n'
  );
  process.exit(1);
}

console.log('\nLa version web s’ouvre aux deux adresses.');
