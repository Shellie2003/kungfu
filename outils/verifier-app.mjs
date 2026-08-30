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
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;
const SORTIE = new URL('../outils/comparaisons/app/', import.meta.url).pathname;
const PROJET = 'znotzkfwukvvtaqfrozn';

if (!existsSync(join(RACINE, 'index.html'))) {
  console.error('app/dist est vide. Lancez d’abord : cd app && npx vite build');
  process.exit(1);
}
mkdirSync(SORTIE, { recursive: true });

/* ---------------------------------------------- Le petit serveur */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

const serveur = createServer((req, res) => {
  const chemin = normalize(decodeURI((req.url ?? '/').split('?')[0]));
  const fichier = join(RACINE, chemin === '/' ? 'index.html' : chemin);
  if (!fichier.startsWith(RACINE) || !existsSync(fichier)) {
    res.writeHead(404).end('non trouvé');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(fichier)] ?? 'application/octet-stream' });
  res.end(readFileSync(fichier));
});
await new Promise((ok) => serveur.listen(4173, ok));

/* ---------------------------------------------- Le serveur en boîte

   Les identifiants sont inventés ; rien ici ne touche un vrai
   projet. Les formes en revanche sont celles de PostgREST. */
const GRADES = [
  { id: 'g1', nom: 'Ceinture noire', couleur: '#1E2320', rang: 6, actif: true },
  { id: 'g2', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true },
  { id: 'g3', nom: 'Ceinture blanche', couleur: '#E7EDE9', rang: 1, actif: true }
];

const PROFILS = [
  { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina', role: 'eleve', grade_id: 'g2', photo: null, debut: '2019-09-09', biographie: 'Entrée au club à treize ans.' },
  { id: 'p2', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery', role: 'maitre', grade_id: 'g1', photo: null, debut: '2014-02-01', biographie: null },
  /* L'élève SANS compte : c'est le cas que l'architecture doit
     tenir, et le seul qui se vérifie en le regardant. */
  { id: 'p3', numero: 'F04x061', nom: 'RANDRIAMAMPIONONA', prenom: 'Toky', role: 'eleve', grade_id: 'g3', photo: null, debut: null, biographie: null }
];

const avecGrade = (p) => ({ ...p, grades: GRADES.find((g) => g.id === p.grade_id) ?? null });

const ACTUALITES = [
  { id: 'a1', titre: 'Sortie au lac Mantasoa', categorie: 'Sortie', texte: 'Départ 6h00 devant la salle.\n\nPrévoir le repas de midi.', date_evt: '2026-09-12', lieu: 'Devant la salle', image: null, cree_le: new Date().toISOString() },
  { id: 'a2', titre: 'Séance du mercredi à 17h30', categorie: 'Changement d’horaire', texte: 'Décalée d’une heure jusqu’à la fin décembre.', date_evt: null, lieu: null, image: null, cree_le: '2026-01-18T09:00:00Z' }
];

const REPONSES = {
  grades: GRADES,
  profils: PROFILS.map(avecGrade),
  actualites: ACTUALITES,
  notifications: [
    { id: 'n1', titre: 'Sortie', texte: 'Nouvelle sortie prévue ce samedi.', vers: '/casier/a1', lue_le: null, cree_le: new Date().toISOString() },
    { id: 'n2', titre: 'Compétition', texte: 'Huit membres sélectionnés.', vers: null, lue_le: '2026-01-01T00:00:00Z', cree_le: '2026-01-01T00:00:00Z' }
  ],
  horaires: [
    { id: 'h1', jour: 2, debut: '17:30:00', fin: '19:00:00', niveau: 'Tous niveaux', lieu: null },
    { id: 'h2', jour: 6, debut: '09:00:00', fin: '11:00:00', niveau: 'Gradés', lieu: null }
  ],
  reglages: [
    { cle: 'responsable', valeur: 'Idealy Itoerantsoa Santatra' },
    { cle: 'telephone', valeur: '034 22 118 40' },
    { cle: 'adresse', valeur: 'Analamahitsy' },
    { cle: 'fondation', valeur: '2014' },
    { cle: 'mvola_numero', valeur: '0388010853' },
    { cle: 'mvola_nom', valeur: 'Santatra Nirina Antonio' }
  ],
  albums: [
    { id: 'al1', titre: 'Compétitions', categorie: 'Compétitions', cree_le: '2026-01-01T00:00:00Z', photos: [{ id: 'ph1', chemin: null, legende: 'Tournoi', rang: 0 }] }
  ],
  salons: [
    { id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132', dernier_le: new Date().toISOString(), membres_salon: [{ lu_le: null }], messages: [{ texte: 'L’entraînement est maintenu.', cree_le: new Date().toISOString(), profils: { nom: 'RAHARISOA', prenom: 'Fanja' } }] },
    { id: 's2', type: 'maitres', titre: 'Espace des maîtres', couleur: '#0B2B1D', dernier_le: new Date().toISOString(), membres_salon: [{ lu_le: null }], messages: [] }
  ],
  messages: [
    { id: 'm1', texte: 'Bonsoir à tous.', cree_le: new Date().toISOString(), supprime_le: null, auteur_id: 'p2', profils: { nom: 'RABEMANANJARA', prenom: 'Hery' } },
    { id: 'm2', texte: 'Merci pour l’information.', cree_le: new Date().toISOString(), supprime_le: null, auteur_id: 'p1', profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' } }
  ],
  participations: [],
  membres_salon: []
};

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
  ['motdepasse', '/#/motdepasse', 'Nouveau mot de passe']
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

/* Toute requête vers Supabase est interceptée : rien ne sort. */
await page.route(`https://${PROJET}.supabase.co/**`, async (route) => {
  const url = new URL(route.request().url());
  if (url.pathname.startsWith('/auth/v1')) {
    return route.fulfill({ json: { user: { id: 'u1' } } });
  }
  const table = url.pathname.replace('/rest/v1/', '');
  const corps = REPONSES[table];
  if (corps === undefined) {
    erreurs.push(`table non prévue par le bouchon : ${table}`);
    return route.fulfill({ json: [] });
  }
  /* PostgREST rend un objet, pas un tableau, quand la requête
     demande une ligne unique — c'est ce que fait .single(). */
  const seul = (route.request().headers()['accept'] ?? '').includes('vnd.pgrst.object');
  let donnees = corps;
  const id = url.searchParams.get('id')?.replace('eq.', '');
  if (id) donnees = corps.filter((l) => l.id === id);
  return route.fulfill({ json: seul ? (donnees[0] ?? null) : donnees });
});

/* La session est posée AVANT le chargement : c'est ce que fait un
   téléphone qui a déjà servi. */
await page.addInitScript(
  ({ projet }) => {
    const dans1h = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(
      `sb-${projet}-auth-token`,
      JSON.stringify({
        access_token: 'jeton-de-controle',
        refresh_token: 'renouvellement-de-controle',
        expires_at: dans1h,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: 'u1', aud: 'authenticated', role: 'authenticated' }
      })
    );
  },
  { projet: PROJET }
);

let echecs = 0;
console.log('');

for (const [nom, adresse, attendu] of ECRANS) {
  const avant = erreurs.length;
  await page.goto(`http://localhost:4173${adresse}`, { waitUntil: 'networkidle' });
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
  if (lu?.data === 'F04x042') {
    console.log('✓ code QR        se décode, et rend « F04x042 » — le matricule de la fiche');
  } else {
    echecs++;
    console.log(`✗ code QR        ${lu ? `rend « ${lu.data} »` : 'illisible'}, au lieu de « F04x042 »`);
  }
}

/* L'écran de connexion se regarde sans session : c'est le seul cas
   où l'absence de jeton est le sujet. */
await page.context().clearCookies();
const page2 = await navigateur.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
page2.on('pageerror', (e) => erreurs.push(`connexion : ${e.message}`));
await page2.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
const txt = await page2.evaluate(() => document.body.innerText);
await page2.screenshot({ path: join(SORTIE, 'connexion.png'), fullPage: true });
if (txt.includes('Connexion membre')) {
  console.log('✓ connexion      sans session, l’écran de connexion s’affiche seul');
} else {
  echecs++;
  console.log('✗ connexion      l’écran de connexion ne s’affiche pas sans session');
}

await navigateur.close();
serveur.close();

console.log('');
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
