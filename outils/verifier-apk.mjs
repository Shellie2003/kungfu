/* ============================================================
   verifier-apk.mjs — L'application telle qu'elle est DANS L'APK.

       node outils/verifier-apk.mjs

   Tous les autres bancs de ce dossier ouvrent l'application dans un
   navigateur, et l'application le sait : « Capacitor.isNativePlatform »
   rend faux, et tout le code réservé au téléphone n'est jamais
   exécuté. On vérifiait donc consciencieusement la moitié web d'une
   application qui se livre en APK.

   Ce banc pose « window.androidBridge » AVANT le chargement. C'est à
   cela, et à rien d'autre, que Capacitor reconnaît Android — on l'a
   lu dans « getPlatformId » de @capacitor/core. L'application se
   croit donc sur un téléphone, et prend TOUTES les branches
   réservées à l'APK.

   ------------------------------------------------------------
   CE QUE CE BANC PROUVE, ET CE QU'IL NE PROUVE PAS

   Il PROUVE que les branches natives s'exécutent sans casser, que
   les écrans s'affichent, et que ce qui ne marche pas dans une
   WebView n'est pas proposé.

   Il NE PROUVE PAS que les greffons répondent : le vrai pont Java
   n'est pas là, et un appel au système de fichiers reste sans
   réponse. C'est même utile — un écran qui ATTEND indéfiniment une
   réponse du téléphone se voit ici, alors qu'il passerait inaperçu
   dans un navigateur où la branche n'est jamais prise.

   Ce qui ne se vérifie que sur un vrai appareil, et qui est écrit
   noir sur blanc dans le rapport de livraison : la lecture des codes
   QR — « BarcodeDetector » n'est pas garanti dans la WebView — et le
   rendu des polices.
   ============================================================ */
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;

/* ------------------------------------------------------------
   1. LE CONTRÔLE STATIQUE : un greffon employé doit être déclaré.

   Les greffons entrent par « import() », dans un « try » qui rattrape
   l'échec sans rien dire — c'est voulu, parce que sur le web ils
   n'existent pas. Mais dans l'APK, un greffon employé et ABSENT du
   package.json échoue exactement de la même façon : silencieusement.
   La fonctionnalité ne marche simplement pas, et personne ne sait
   pourquoi.
   ------------------------------------------------------------ */
function greffonsDeclares() {
  const src = new URL('../app/src/', import.meta.url).pathname;
  const paquet = JSON.parse(
    readFileSync(new URL('../app/package.json', import.meta.url).pathname, 'utf8')
  );
  const declares = new Set(Object.keys(paquet.dependencies ?? {}));

  const employes = new Set();
  const parcourir = (dossier) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, e.name);
      if (e.isDirectory()) { parcourir(chemin); continue; }
      if (!/\.(ts|tsx)$/.test(e.name)) continue;
      const texte = readFileSync(chemin, 'utf8');
      for (const m of texte.matchAll(/from ['"](@capacitor\/[^'"]+)['"]/g)) employes.add(m[1]);
      for (const m of texte.matchAll(/import\(['"](@capacitor\/[^'"]+)['"]\)/g)) employes.add(m[1]);
    }
  };
  parcourir(src);

  const manquants = [...employes].filter((g) => !declares.has(g));
  /* Un greffon déclaré et jamais employé alourdit l'APK sans rien
     apporter : ce n'est pas une panne, mais c'est du poids que le
     club télécharge pour rien. On le signale sans faire échouer. */
  const inutiles = [...declares].filter(
    (d) => d.startsWith('@capacitor/') &&
      !employes.has(d) &&
      !['@capacitor/android', '@capacitor/core'].includes(d)
  );
  return { employes: [...employes].sort(), manquants, inutiles };
}

/* ------------------------------------------------------------
   2. LES BOÎTES DU SYSTÈME, qu'on ne veut plus voir revenir.

   « window.prompt », « window.confirm », « window.alert » : le
   navigateur les dessine à sa façon, Capacitor les redessine à la
   sienne dans l'APK, et le club voit donc deux allures différentes
   pour la même action. Pire, la boîte MASQUE la page : on tapait le
   motif d'un signalement sans plus voir le message signalé.

   « window.print » est d'un autre ordre : elle ne masque rien, elle
   ne fait simplement RIEN dans la WebView (aucune trace de
   « PrintManager » dans la source Android de Capacitor). Elle reste
   donc permise, mais à UNE condition : que le fichier parle de
   « SAIT_IMPRIMER ». C'est le drapeau qui range l'impression du côté
   web, et le seul garde-fou qui empêche un bouton inerte de
   réapparaître sur le téléphone.

   Le contrôle est STATIQUE, sur la source, parce qu'un appel de ce
   genre se cache derrière un bouton qu'aucun banc n'a de raison de
   presser. Pour les trois boîtes, aucune dérogation : l'application
   a « Feuille », « Confirmer » et « Etat » pour tout cela.
   ------------------------------------------------------------ */
const BOITES = /\bwindow\.(prompt|confirm|alert|print)\s*\(/g;

function boitesDuSysteme() {
  const src = new URL('../app/src/', import.meta.url).pathname;
  const trouvees = [];
  const parcourir = (dossier) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, e.name);
      if (e.isDirectory()) { parcourir(chemin); continue; }
      if (!/\.(ts|tsx)$/.test(e.name)) continue;
      const texte = readFileSync(chemin, 'utf8');
      const garde = texte.includes('SAIT_IMPRIMER');
      texte.split('\n').forEach((l, i) => {
        BOITES.lastIndex = 0;
        const m = BOITES.exec(l);
        if (!m) return;
        if (m[1] === 'print' && garde) return;
        const raison =
          m[1] === 'print'
            ? 'inerte dans la WebView, et rien ne la range du côté web'
            : 'la page en est masquée, et l’APK la redessine';
        trouvees.push(`${chemin.slice(src.length)}:${i + 1} — window.${m[1]}() : ${raison}`);
      });
    }
  };
  parcourir(src);
  return trouvees;
}

/* ------------------------------------------------------------
   3. LE CONTRÔLE À L'EXÉCUTION.
   ------------------------------------------------------------ */
const ECRANS = [
  ['accueil', '/#/accueil'],
  ['etudiants', '/#/etudiants'],
  ['profil', '/#/etudiants/p1'],
  ['casier', '/#/casier'],
  ['actualite', '/#/casier/a1'],
  ['participation', '/#/casier/a1/participer'],
  ['album', '/#/album'],
  ['photo', '/#/album/al1/0'],
  ['club', '/#/club'],
  ['notifications', '/#/notifications'],
  ['messages', '/#/messages'],
  ['salon', '/#/messages/s1'],
  ['maitres', '/#/maitres'],
  ['carte', '/#/carte'],
  ['motdepasse', '/#/motdepasse'],
  ['presences', '/#/presences'],
  ['admin', '/#/admin'],
  ['adm-fiche', '/#/admin/fiche'],
  ['adm-comptes', '/#/admin/comptes'],
  ['adm-publier', '/#/admin/publier'],
  ['adm-club', '/#/admin/club'],
  ['adm-presences', '/#/presences/pointer'],
  ['adm-participations', '/#/admin/participations'],
  ['adm-impression', '/#/admin/impression'],
  ['adm-occupation', '/#/admin/occupation']
];

/* Ce qui ne doit JAMAIS être proposé dans l'APK, avec la raison.
   Chaque entrée est une chose que la WebView d'Android ne sait pas
   faire, et qu'on a vérifiée dans la source plutôt que supposée. */
const INTERDITS = [
  {
    quoi: 'un bouton qui appelle window.print()',
    pourquoi:
      'la WebView n’imprime pas d’elle-même : il faut « PrintManager », ' +
      'et la source Android de Capacitor n’en contient aucune trace',
    /* On regarde le TEXTE plutôt que le code : c'est ce que le club
       voit, et un bouton renommé sans être débranché resterait
       trompeur. */
    chercher: (t) => /Imprimer ou enregistrer en PDF/.test(t)
  }
];

const site = await servir(RACINE);
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 390, height: 780 } });

/* ⚠ AVANT TOUT LE RESTE.

   « androidBridge » doit exister au moment où @capacitor/core
   s'initialise, c'est-à-dire au premier module chargé. Posé après,
   l'application aurait déjà décidé qu'elle est sur le web. */
await page.addInitScript(() => {
  const appels = [];
  Object.defineProperty(window, 'androidBridge', {
    value: { postMessage: (m) => appels.push(m) },
    configurable: true
  });
  window.__appelsNatifs = appels;
});

await poserSession(page);
await brancher(page);

const erreurs = [];

/* ⚠ CE QUI EST DEHORS N'EST PAS UN DÉFAUT — ET ON LE RECONNAÎT À
   L'ADRESSE, PAS AU MESSAGE.

   Première version : on reconnaissait la requête vers GitHub au texte
   de l'erreur de console. Cela marchait ici, où Chromium écrit
   « ERR_CERT_AUTHORITY_INVALID » et l'adresse complète — et cela a
   échoué sur la machine de construction de GitHub, où le même échec
   s'écrit « Failed to load resource: net::ERR_FAILED », sans adresse
   ni code reconnaissable. Le banc a donc déclaré un défaut de
   l'application là où il n'y avait qu'un réseau fermé.

   Le texte d'une erreur de console dépend du navigateur, de sa
   version et de la machine. L'ADRESSE de la requête, elle, ne dépend
   de rien : on la relève à la source.

   Et on ne pardonne que GitHub, nommément. « Tout ce qui est hors de
   localhost » aurait aussi couvert Supabase — dont chaque appel est
   pourtant bouché par outils/bouchon.mjs et DOIT aboutir. Un bouchon
   qui cesserait de répondre passerait alors inaperçu. */
const DEHORS = /^https?:\/\/([^/]*\.)?github(usercontent)?\.com\//;
const echouees = new Set();
page.on('requestfailed', (r) => {
  if (DEHORS.test(r.url())) echouees.add(r.url());
});

page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (m.text().includes('realtime')) return;

  /* Chromium attache à « Failed to load resource » l'adresse de la
     ressource en question. Quand elle est dehors — GitHub pour la
     mise à jour, et rien d'autre — c'est le réseau du banc, pas
     l'application. */
  const ou = m.location?.()?.url ?? '';
  if (DEHORS.test(ou) || echouees.has(ou)) return;

  /* Et si le navigateur n'a pas donné d'adresse du tout : on
     n'excuse que si la SEULE chose qui a échoué depuis le début est
     dehors. Une ressource du site qui manquerait resterait un
     défaut. */
  if (/Failed to load resource/.test(m.text()) && !ou && echouees.size > 0) return;

  /* ⚠ LA MISE À JOUR DE L'APK DEMANDE GITHUB, ET CE BANC N'A PAS
     INTERNET.

     En mode téléphone — et seulement là — l'application va lire
     « waishi.json » sur les Releases du dépôt pour savoir s'il existe
     une version plus récente. Ni cette machine ni celle de
     construction ne joignent github.com : la requête échoue, et le
     navigateur l'inscrit en console.

     Ce n'est pas un défaut de l'application : le service rattrape
     l'échec et ne dit rien, ce qui est exactement le comportement
     voulu hors ligne — annoncer une mise à jour parce que le réseau
     est tombé serait un mensonge. C'est la même excuse que pour la
     WebSocket du temps réel juste au-dessus, et pour la même raison :
     un service extérieur qu'on ne peut pas joindre d'ici.

     Ce qui se vérifie vraiment, ce sont les numéros et la parcimonie
     du réseau — app/tests/mise-a-jour-apk.test.tsx. */
  erreurs.push(`console : ${m.text()}`);
});
page.on('pageerror', (e) => erreurs.push(`exception : ${e.message}`));

console.log('');
let echecs = 0;

/* Le contrôle statique d'abord : il ne coûte rien et cadre le reste. */
const { employes, manquants, inutiles } = greffonsDeclares();
if (manquants.length) {
  echecs++;
  console.log('✗ greffons        employés mais NON DÉCLARÉS : ' + manquants.join(', '));
  console.log('   Dans l’APK, leur import échoue en silence : la fonctionnalité');
  console.log('   ne marche pas, et rien ne dit pourquoi.');
} else {
  console.log(`✓ greffons        les ${employes.length} employés sont déclarés`);
}
for (const i of inutiles) {
  console.log(`  · ${i} est déclaré et jamais employé — du poids pour rien`);
}

const boites = boitesDuSysteme();
if (boites.length) {
  echecs++;
  console.log('✗ boîtes système  ce que la WebView rend autrement :');
  for (const b of boites) console.log(`   ${b}`);
  console.log('   « Feuille », « Confirmer » et « Etat » font la même chose,');
  console.log('   dans le design du club, sans cacher ce qu’on regarde.');
} else {
  console.log('✓ boîtes système  aucune : tout se dit dans le design du club');
}

/* Puis chaque écran, en mode téléphone. */
for (const [nom, route] of ECRANS) {
  const avant = erreurs.length;
  await page.goto(`${site.adresse}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const texte = await page.evaluate(() => document.body.innerText);
  const vide = texte.trim().length < 20;
  const nouvelles = erreurs.slice(avant);
  const soucis = [...nouvelles];

  if (vide) soucis.push('l’écran est vide en mode téléphone');
  for (const i of INTERDITS) {
    if (i.chercher(texte)) soucis.push(`${i.quoi} — ${i.pourquoi}`);
  }

  /* La plateforme, vue par l'application elle-même. Si elle répond
     « web », le banc ne mesure rien du tout et il vaut mieux le
     savoir bruyamment. */
  const plateforme = await page.evaluate(() => window.Capacitor?.getPlatform?.() ?? 'inconnue');
  if (plateforme !== 'android') {
    soucis.push(`l’application se croit sur « ${plateforme} » et non sur android`);
  }

  if (soucis.length) echecs++;
  console.log(`${soucis.length ? '✗' : '✓'} ${nom.padEnd(20)} ${soucis.length ? '' : 'android'}`);
  for (const s of soucis.slice(0, 4)) console.log(`   ${s}`);
}

await navigateur.close();
site.fermer();

console.log('');
if (echecs) {
  console.error(`${echecs} écart(s) entre l’APK et le web.`);
  process.exit(1);
}
console.log(
  `Les ${ECRANS.length} écrans s’ouvrent en mode téléphone, et ne proposent rien\n` +
    'que la WebView d’Android ne sache faire.'
);
