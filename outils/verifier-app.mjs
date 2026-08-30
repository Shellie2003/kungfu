/* ============================================================
   verifier-app.mjs — Fait tourner l'application pour de vrai.

       node outils/verifier-app.mjs

   Sert app/dist dans un vrai navigateur, remplace le serveur
   Supabase par des réponses en boîte, ouvre CHAQUE écran, et
   rapporte : erreurs de console, requêtes en échec, écrans vides.

   Pourquoi un serveur en boîte plutôt que le vrai : cet
   environnement de travail ne peut pas joindre supabase.co, et
   surtout on veut vérifier les écrans, pas la base — qui a son
   propre test. Les réponses ici sont celles que la base rend
   réellement, forme comprise (jointures en tableau ou en objet,
   c'est là que les écrans se cassent).

   Ce que ce contrôle NE dit pas : que le rendu natif est correct.
   Il tourne dans Chromium ; la WebView d'Android lissera les
   polices autrement. Seul l'APK le montre.
   ============================================================ */
import { chromium } from 'playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { MOI, brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;
const SORTIE = new URL('../outils/comparaisons/app/', import.meta.url).pathname;

mkdirSync(SORTIE, { recursive: true });
const site = await servir(RACINE);

/* ---------------------------------------------- Les écrans à ouvrir */
const ECRANS = [
  ['accueil', '/#/accueil', 'KUNG-FU WAISHI'],
  ['etudiants', '/#/etudiants', 'RAKOTONDRABE'],
  ['profil', '/#/etudiants/p1', 'Informations personnelles'],
  ['casier', '/#/casier', 'Sortie au lac Mantasoa'],
  ['actualite', '/#/casier/a1', 'Sortie au lac Mantasoa'],
  ['participation', '/#/casier/a1/participer', 'Ma participation'],
  ['album', '/#/album', 'Compétitions'],
  ['photo', '/#/album/al1/0', 'sur 1'],
  ['club', '/#/club', 'Entraînements'],
  ['notifications', '/#/notifications', 'Aujourd’hui'],
  ['messages', '/#/messages', 'Tout le club'],
  /* Un message du fil, pas le texte d'invite du champ : une invite
     n'est pas du texte rendu, et l'attendre ne prouverait rien. */
  ['salon', '/#/messages/s1', 'Merci pour l’information.'],
  ['maitres', '/#/maitres', 'Espace des maîtres'],
  ['carte', '/#/carte', 'Carte de membre'],
  ['motdepasse', '/#/motdepasse', 'Nouveau mot de passe'],
  /* L'écran d'administration, et surtout la PORTE qui y mène : la
     route existait sans que rien n'y conduise, et un compte
     d'administration ne montrait alors rien de plus qu'un élève. */
  ['admin', '/#/admin', 'Publication'],
  /* Les sept écrans d'administration. Ils écrivent, donc ils
     comptent double : un formulaire qui ne s'affiche pas se voit,
     un formulaire qui s'affiche mais n'envoie rien ne se voit pas.
     Ce contrôle-ci ne dit que le premier — l'envoi, c'est la base
     qui l'autorise, et elle a son propre test. */
  ['adm-fiche', '/#/admin/fiche', 'État civil'],
  ['adm-fiches', '/#/admin/fiches', 'Modifier une fiche'],
  ['adm-grades', '/#/admin/grades', 'Changer un grade'],
  ['adm-comptes', '/#/admin/comptes', 'Comptes et accès'],
  ['adm-publier', '/#/admin/publier', 'Publier une actualité'],
  ['adm-notifier', '/#/admin/notifier', 'Prévenir tout le club'],
  ['adm-albums', '/#/admin/albums', 'Créer un album'],
  ['adm-club', '/#/admin/club', 'Renseignements'],
  ['signalements', '/#/signalements', 'Propos déplacés'],
  ['adm-participations', '/#/admin/participations', 'De quelle sortie'],
  /* Un texte RENDU, pas une invite de champ : innerText ne contient
     pas les placeholders, et l'attendre échouerait toujours. */
  ['nouvelle-conv', '/#/messages/nouvelle', 'Écrire à un maître'],
  ['presences', '/#/presences', 'Mon assiduité'],
  ['adm-presences', '/#/presences/pointer', 'Pointer les présences']
];

const plat = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const navigateur = await chromium.launch();
const page = await navigateur.newPage({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2
});

const erreurs = [];
let tempsReel = false;
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  /* Le temps réel passe par une WebSocket, que l'interception de
     requêtes ne couvre pas et que le réseau d'ici bloque. Son échec
     est attendu ; il est signalé une fois en fin de rapport plutôt
     que compté comme un défaut d'écran. */
  if (m.text().includes('realtime')) { tempsReel = true; return; }
  erreurs.push(`console : ${m.text()}`);
});
page.on('pageerror', (e) => erreurs.push(`exception : ${e.message}`));

const inconnues = [];
await brancher(page, inconnues);

await poserSession(page);

let echecs = 0;
console.log('');

for (const [nom, adresse, attendu] of ECRANS) {
  const avant = erreurs.length;
  await page.goto(`${site.adresse}${adresse}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);

  const texte = await page.evaluate(
    /* innerText, pas textContent : c'est le texte RENDU, celui que
       l'œil voit. Conséquence à ne pas oublier — les surtitres
       passent en capitales par la feuille de style, donc on compare
       à plat, sans casse ni accents. */
    () => document.body.innerText
  );
  const trouve = plat(texte).includes(plat(attendu));
  const nouvelles = erreurs.slice(avant);

  await page.screenshot({ path: join(SORTIE, `${nom}.png`), fullPage: true });

  if (trouve && nouvelles.length === 0) {
    console.log(`✓ ${nom.padEnd(14)} ${texte.split('\n').filter(Boolean).length} lignes de texte`);
  } else {
    echecs++;
    console.log(`✗ ${nom.padEnd(14)} ${trouve ? '' : `« ${attendu} » absent de l’écran`}`);
    for (const e of nouvelles) console.log(`  ${e}`);
  }
}

/* ---------------------------------------------- Le code QR

   Un QR qu'on n'a pas décodé est une image, pas un code. Celui de
   la carte de membre est donc relu depuis la capture, comme le
   ferait le téléphone du maître qui pointe la présence. */
{
  const brut = PNG.sync.read(readFileSync(join(SORTIE, 'carte.png')));
  const lu = jsQR(new Uint8ClampedArray(brut.data), brut.width, brut.height);
  if (lu?.data === MOI.numero) {
    console.log(`✓ code QR        se décode, et rend « ${MOI.numero} » — le matricule de la fiche`);
  } else {
    echecs++;
    console.log(`✗ code QR        ${lu ? `rend « ${lu.data} »` : 'illisible'}, au lieu de « ${MOI.numero} »`);
  }
}

/* L'écran de connexion se regarde sans session : c'est le seul cas
   où l'absence de jeton est le sujet. */
await page.context().clearCookies();
const page2 = await navigateur.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
page2.on('pageerror', (e) => erreurs.push(`connexion : ${e.message}`));
await page2.goto(`${site.adresse}/`, { waitUntil: 'networkidle' });
const txt = await page2.evaluate(() => document.body.innerText);
await page2.screenshot({ path: join(SORTIE, 'connexion.png'), fullPage: true });
if (txt.includes('Connexion membre')) {
  console.log('✓ connexion      sans session, l’écran de connexion s’affiche seul');
} else {
  echecs++;
  console.log('✗ connexion      l’écran de connexion ne s’affiche pas sans session');
}

await navigateur.close();
site.fermer();

console.log('');
if (inconnues.length) {
  const liste = [...new Set(inconnues)].join(', ');
  console.log(`Note : table(s) absente(s) du bouchon, répondues vides — ${liste}.`);
  console.log('');
}
if (tempsReel) {
  console.log(
    'Note : la WebSocket du temps réel ne s’ouvre pas ici — le réseau de cet\n' +
    'environnement la bloque. Elle se vérifie sur un téléphone, pas ici.'
  );
  console.log('');
}
console.log(
  echecs === 0
    ? `Les ${ECRANS.length + 1} écrans s’ouvrent, sans erreur de console. Captures dans outils/comparaisons/app/.`
    : `${echecs} écran(s) en échec.`
);
process.exit(echecs === 0 ? 0 : 1);
