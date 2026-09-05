/* ============================================================
   mesurer-realisation.mjs — « Où en sommes-nous par rapport à la
   maquette ? », en pourcentage, et MESURÉ.

       node outils/mesurer-realisation.mjs

   ------------------------------------------------------------
   POURQUOI CE BANC PLUTÔT QU'UNE ESTIMATION

   Un pourcentage donné de mémoire est une opinion déguisée en
   chiffre. Celui-ci se calcule sur une liste que je n'ai pas
   écrite : la feuille « 00 · Fonctionnalités » de la maquette, où
   chaque ligne porte un identifiant « data-feat ». C'est le club qui
   a dressé cette liste ; le banc ne fait que la lire et la
   confronter à l'application.

   Trois conséquences, et elles sont voulues :

     1. On ne peut pas se donner une bonne note en oubliant une
        ligne : elles sont comptées à la source.
     2. On ne peut pas s'en donner une en RENOMMANT une ligne : si
        la maquette gagne une fonctionnalité, le banc la voit
        apparaître sans preuve et le pourcentage BAISSE.
     3. Chaque « fait » est adossé à une preuve exécutable — un
        texte réellement rendu sur une route réelle, ou un motif
        dans le code du serveur. Pas à mon avis.

   ------------------------------------------------------------
   LES DEUX SORTES DE PREUVES, ET POURQUOI PAS UNE SEULE

   « écran » : on ouvre la route dans un vrai navigateur, avec le
   serveur en boîte, et l'on cherche le texte. C'est la preuve la
   plus forte — elle traverse le routage, les requêtes, le rendu.

   « code » : un motif dans les sources ou les migrations. Réservé à
   ce qui ne se VOIT pas : une règle d'accès, un déclencheur, une
   notification hors de l'application. Chercher ces choses à l'écran
   ne prouverait rien, et prétendre le contraire serait pire que de
   ne rien mesurer.
   ============================================================ */
import { chromium } from 'playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;
const MAQUETTE = new URL('../js/screens.js', import.meta.url).pathname;
const SRC = new URL('../app/src/', import.meta.url).pathname;
const MIGRATIONS = new URL('../supabase/migrations/', import.meta.url).pathname;
const FONCTIONS = new URL('../supabase/functions/', import.meta.url).pathname;

/* ------------------------------------------------------------
   1. LA LISTE, LUE DANS LA MAQUETTE.
   ------------------------------------------------------------ */
function fonctionnalitesDeLaMaquette() {
  const texte = readFileSync(MAQUETTE, 'utf8');
  const liste = [];
  let section = '';
  const motif =
    /<h2 class="overline">([^<]+)<\/h2>|data-feat="([a-zA-Z0-9-]+)"[^>]*>[\s\S]{0,200}?featrow__t">([^<]+)</g;
  for (const m of texte.matchAll(motif)) {
    if (m[1]) { section = m[1]; continue; }
    if (m[2]) liste.push({ id: m[2], titre: m[3].trim(), section });
  }
  return liste;
}

/* ------------------------------------------------------------
   2. LES PREUVES, une par identifiant.

   Chaque entrée dit COMMENT on saurait que la chose existe. Quand
   je n'ai pas su l'adosser à une preuve, l'entrée est absente et le
   banc compte la fonctionnalité comme NON PROUVÉE — jamais comme
   faite.
   ------------------------------------------------------------ */
const ECRAN = (route, texte) => ({ sorte: 'écran', route, texte });
/* Un CONTRÔLE, pas un texte. « innerText » ne rend ni les invites de
   champ ni les étiquettes d'accessibilité : chercher « Rechercher »
   dans le texte d'un écran qui porte une vraie barre de recherche
   échoue TOUJOURS, et déclarerait absente une chose présente. C'est
   arrivé au premier passage de ce banc. */
const CONTROLE = (route, selecteur) => ({ sorte: 'contrôle', route, selecteur });
const CODE = (motif, ou) => ({ sorte: 'code', motif, ou });

/* ------------------------------------------------------------
   ⚠ DEUX MOITIÉS, ET IL FAUT LES DEUX.

   « msg-ecrire » — « le message arrive sans rafraîchir » — était
   compté FAIT parce que « .channel( » figurait dans les sources.
   C'était vrai, et la fonctionnalité ne marchait pas : la table
   « messages » n'était dans aucune publication, donc PostgreSQL
   n'émettait rien. L'application s'abonnait à un canal muet.

   Le club a dû le dire lui-même — « l'utilisateur a besoin de sortir
   d'une conversation pour voir un nouveau message » — alors que cet
   instrument affichait un ✓ en face.

   Une preuve qui ne regarde qu'une moitié d'un mécanisme en deux
   moitiés n'est pas une preuve : c'est un faux vert, et c'est pire
   que pas de mesure du tout. « DEUX » exige les deux endroits.
   ------------------------------------------------------------ */
const DEUX = (a, ouA, b, ouB) => ({ sorte: 'deux', a, ouA, b, ouB });

/* ⚠ ET IL FAUT RETIRER LES COMMENTAIRES AVANT DE CHERCHER.

   Premier essai de cette preuve : elle passait au vert alors que
   j'avais mis la publication en commentaire pour la mettre à
   l'épreuve. Une expression régulière ne sait pas lire du SQL — elle
   voyait le texte, commenté ou non.

   C'est le même défaut que celui qu'on cherche à empêcher, à un
   étage au-dessus : une preuve qui ne prouve rien. On dénude donc le
   texte d'abord. */
const sansCommentaires = (texte) =>
  texte
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|\n)\s*--[^\n]*/g, '$1')
    .replace(/(^|\n)\s*\/\/[^\n]*/g, '$1');
/* Fait, mais AUTREMENT que la maquette ne le dessinait. Compté à
   part : ni un mensonge par excès, ni une punition pour un choix
   assumé. */
const PARTIEL = (route, texte, ecart) => ({ sorte: 'partiel', route, texte, ecart });

const PREUVES = {
  /* ---- Accueil ---- */
  'acc-logo': ECRAN('/#/accueil', 'KUNG-FU WAISHI'),
  'acc-visuel': CODE(/photo_club/, 'src'),
  'acc-presentation': ECRAN('/#/accueil', 'Le club'),
  /* Le titre était en MALGACHE — « VAOVAO FARANY » — seul de tout
     l'écran, là où la feuille des fonctionnalités l'écrit en
     français. C'est ce banc qui a mis l'écart en évidence, et le
     club a tranché pour le français. */
  'acc-vaovao': ECRAN('/#/accueil', 'Dernières actualités'),
  /* La pastille porte un nombre, pas un mot : on vise l'étiquette
     d'accessibilité, qui est ce qu'un aveugle entend. */
  'acc-notif': CONTROLE('/#/accueil', '[aria-label^="Notifications,"]'),

  /* ---- Étudiants ---- */
  'etu-liste': ECRAN('/#/etudiants', 'RAKOTONDRABE'),
  'etu-recherche': CONTROLE('/#/etudiants', '[aria-label="Rechercher un nom ou un prénom"]'),
  'etu-filtre': ECRAN('/#/etudiants', 'Tous'),
  'etu-verrou': CODE(/profils_prives/, 'migrations'),
  'etu-fiche': ECRAN('/#/etudiants/p1', 'Informations personnelles'),
  /* La fiche d'essai n'a pas de tuteur — c'est le cas de la plupart
     des majeurs — donc la section ne s'affiche pas sur cet écran-là.
     La preuve est là où le tuteur SE SAISIT, et où il s'affiche donc
     toujours. */
  parents: ECRAN('/#/admin/fiche/p1', 'Parents ou tuteur'),
  'etu-bio': ECRAN('/#/etudiants/p1', 'Biographie'),
  carte: ECRAN('/#/carte', 'Carte de membre'),
  motdepasse: ECRAN('/#/motdepasse', 'Nouveau mot de passe'),

  /* ---- Participation et contribution ---- */
  'part-inscription': ECRAN('/#/casier/a1/participer', 'Ma participation'),
  'part-accompagnants': ECRAN('/#/casier/a1/participer', 'J’amène du monde'),
  /* Le code lui-même est dans un CHAMP — il est modifiable depuis
     que le club l'a demandé — et la valeur d'un champ n'est pas du
     texte rendu. On vise le bouton qui l'emploie. */
  'part-mvola': ECRAN('/#/casier/a1/participer', 'Ouvrir le clavier avec ce code'),
  'part-tranches': ECRAN('/#/casier/a1/participer', 'envoyer en plusieurs fois'),

  /* ---- Casier et notifications ---- */
  'cas-liste': ECRAN('/#/casier', 'Sortie au lac Mantasoa'),
  'cas-filtre': ECRAN('/#/casier', 'Compétition'),
  'cas-detail': ECRAN('/#/casier/a1', 'Sortie au lac Mantasoa'),
  'not-centre': ECRAN('/#/notifications', 'Aujourd’hui'),
  /* Hors de l'application : rien à voir à l'écran, et rien dans le
     code non plus tant que Firebase n'est pas branché. Aucune preuve
     n'est donc possible — c'est le sens de l'absence ci-dessous. */

  /* ---- Album photo ---- */
  'alb-cat': ECRAN('/#/album', 'Compétitions'),
  'alb-grille': ECRAN('/#/album', 'photos'),
  'alb-grand': ECRAN('/#/album/al1/0', 'sur 5'),

  /* ---- Messages ---- */
  'msg-club': ECRAN('/#/messages', 'Tout le club'),
  'msg-grade': CODE(/type:\s*'grade'|'grade'/, 'src'),
  'msg-evenement': CODE(/'evenement'/, 'src'),
  /* Le titre de l'écran, et non le texte d'explication : celui-ci a
     changé quand le club a ouvert la messagerie entre tous, et une
     preuve adossée à une phrase que l'on réécrit se périme. */
  'msg-direct': ECRAN('/#/messages/nouvelle', 'Nouvelle conversation'),
  /* Les DEUX moitiés : l'écoute dans l'application, et la diffusion
     dans une migration. L'une sans l'autre ne fait rien du tout. */
  'msg-ecrire': DEUX(
    /postgres_changes|useTempsReel/, 'src',
    /add\s+table\s+public\.messages\b|array\s*\[[^\]]*'messages'/, 'migrations'
  ),
  'msg-signaler': ECRAN('/#/signalements', 'Propos déplacés'),
  /* « À décider : élève vers élève, ou seulement vers un maître. »
     La maquette posait une QUESTION au club. LE CLUB A TRANCHÉ :
     chacun écrit à chacun, et ce que deux membres se disent n'est lu
     que par eux deux. La migration 0025 porte la décision ; l'écran
     l'annonce avant qu'on essaie, ce qui est le seul endroit où elle
     se vérifie du dehors. */
  'msg-qui': ECRAN('/#/messages/nouvelle', 'écrire à n’importe quel membre du club'),

  /* ---- Espace des maîtres ---- */
  'mt-espace': ECRAN('/#/maitres', 'Espace des maîtres'),
  /* ⚠ LES DEUX SEULS ÉCARTS ASSUMÉS AVEC LA MAQUETTE.

     La maquette dessine, sous le fil des maîtres, un panneau « Ce que
     l'espace contient » qui énumère quatre thèmes : délibérations de
     passage de grade, situations individuelles, signalements, notes
     d'encadrement.

     L'application a bien l'ESPACE — un salon réservé, filtré par le
     serveur, où ces choses se discutent — et les signalements ont
     même leur propre écran. Ce qui manque est le panneau
     d'orientation lui-même.

     Ce n'est donc pas « non fait » : la conversation existe et c'est
     elle qui porte la fonctionnalité. Ce n'est pas « fait » non
     plus : le club verrait une différence en comparant. On le compte
     donc à part, et on le dit. */
  'mt-grades': PARTIEL(
    '/#/maitres', 'Espace des maîtres',
    'le salon existe ; le panneau « Ce que l’espace contient » de la maquette, non'
  ),
  'mt-situations': PARTIEL(
    '/#/maitres', 'Espace des maîtres',
    'le salon existe ; le panneau « Ce que l’espace contient » de la maquette, non'
  ),
  'mt-signalements': ECRAN('/#/signalements', 'Propos déplacés'),
  'mt-role': ECRAN('/#/admin/comptes', 'Comptes et accès'),
  'mt-securite': CODE(/mon_role\(\)\s*(=|in)/, 'migrations'),

  /* ---- Le club ---- */
  'clb-presentation': ECRAN('/#/club', 'Le club'),
  'clb-valeurs': ECRAN('/#/club', 'valeurs'),
  'clb-horaires': ECRAN('/#/club', 'Entraînements'),
  'clb-contact': ECRAN('/#/club', 'Contact'),

  /* ---- Administration ---- */
  'adm-ajout': ECRAN('/#/admin/fiche', 'État civil'),
  'adm-modif': ECRAN('/#/admin/fiches', 'Modifier une fiche'),
  'adm-grade': ECRAN('/#/admin/grades', 'Changer un grade'),
  'adm-comptes': ECRAN('/#/admin/comptes', 'Comptes et accès'),
  'adm-publier': ECRAN('/#/admin/publier', 'Publier une actualité'),
  'adm-album': ECRAN('/#/admin/albums', 'Créer un album')
};

/* Ce que la maquette POSERAIT COMME QUESTION plutôt que comme
   travail. Vide aujourd'hui : la seule qui y figurait — « qui peut
   écrire à qui » — a été tranchée par le club, et elle est donc
   repassée au dénominateur comme n'importe quelle autre. On garde le
   mécanisme : la maquette peut poser une nouvelle question demain, et
   il vaut mieux la sortir du compte que de se noter mal pour une
   décision qui n'appartient pas au code. */
const A_DECIDER = {};

/* ------------------------------------------------------------
   3. LE CONTRÔLE DU DIST PÉRIMÉ.
   Un rapport vert sur du code périmé ferme la question à tort.
   ------------------------------------------------------------ */
const plusRecent = (dossier) => {
  let t = 0;
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const c = join(dossier, e.name);
    t = Math.max(t, e.isDirectory() ? plusRecent(c) : statSync(c).mtimeMs);
  }
  return t;
};
if (plusRecent(RACINE) < plusRecent(SRC)) {
  console.error(
    'app/dist est plus ancien que app/src : la mesure porterait sur une\n' +
      'version périmée. Construisez d’abord :\n\n    cd app && npx vite build\n'
  );
  process.exit(1);
}

/* ------------------------------------------------------------
   4. LA RECHERCHE DANS LE CODE.
   ------------------------------------------------------------ */
function toutLeTexte(dossier, extensions) {
  let t = '';
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const c = join(dossier, e.name);
    if (e.isDirectory()) { t += toutLeTexte(c, extensions); continue; }
    if (extensions.some((x) => e.name.endsWith(x))) t += readFileSync(c, 'utf8');
  }
  return t;
}
const SOURCES = {
  src: toutLeTexte(SRC, ['.ts', '.tsx']),
  migrations: toutLeTexte(MIGRATIONS, ['.sql']),
  fonctions: toutLeTexte(FONCTIONS, ['.ts'])
};

/* ------------------------------------------------------------
   5. LA MESURE.
   ------------------------------------------------------------ */
const liste = fonctionnalitesDeLaMaquette();
const site = await servir(RACINE);
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 390, height: 780 } });
await poserSession(page);
await brancher(page);

/* Les écrans sont ouverts UNE FOIS chacun, et leur texte gardé :
   ouvrir la même route quatre fois pour quatre fonctionnalités
   quadruplerait la durée sans rien prouver de plus. */
const textes = new Map();
async function texteDe(route) {
  if (textes.has(route)) return textes.get(route);
  await page.goto(`${site.adresse}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  const t = await page.evaluate(() => document.body.innerText);
  textes.set(route, t);
  return t;
}

/* ⚠ À PLAT, sans casse ni accents.

   La feuille de style met les surtitres en CAPITALES : « Entraînements »
   est rendu « ENTRAÎNEMENTS », et une comparaison brute déclarait
   absente une chose parfaitement présente. C'est le même piège que
   verifier-app.mjs documente, et je viens d'y tomber : le premier
   passage de ce banc annonçait 54 % en comptant vingt et une
   fonctionnalités faites comme manquantes. */
const plat = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const faites = [];
const partielles = [];
const manquantes = [];
const sansPreuve = [];

for (const f of liste) {
  if (A_DECIDER[f.id]) continue;
  const p = PREUVES[f.id];
  if (!p) {
    manquantes.push({ ...f, pourquoi: 'aucune preuve : non réalisé, ou non vérifiable ici' });
    continue;
  }
  let ok = false;
  let detail = '';
  if (p.sorte === 'écran' || p.sorte === 'partiel') {
    const t = await texteDe(p.route);
    ok = plat(t).includes(plat(p.texte));
    detail = `${p.route} → « ${p.texte} »`;
  } else if (p.sorte === 'contrôle') {
    await texteDe(p.route);
    ok = (await page.locator(p.selecteur).count()) > 0;
    detail = `${p.route} → ${p.selecteur}`;
  } else if (p.sorte === 'deux') {
    const a = p.a.test(sansCommentaires(SOURCES[p.ouA]));
    const b = p.b.test(sansCommentaires(SOURCES[p.ouB]));
    ok = a && b;
    /* Le détail DIT laquelle des deux manque : « à moitié fait » est
       l'état le plus trompeur, et celui qu'il faut nommer. */
    detail = a && !b
      ? `${p.ouA} écoute, mais ${p.ouB} ne diffuse pas → le canal reste muet`
      : !a && b
        ? `${p.ouB} diffuse, mais ${p.ouA} n'écoute pas`
        : `${p.ouA} → ${p.a} ET ${p.ouB} → ${p.b}`;
  } else {
    ok = p.motif.test(SOURCES[p.ou]);
    detail = `${p.ou} → ${p.motif}`;
  }
  if (!ok) { sansPreuve.push({ ...f, detail }); continue; }
  (p.sorte === 'partiel' ? partielles : faites).push({ ...f, detail, ecart: p.ecart });
}

await navigateur.close();
site.fermer();

/* ------------------------------------------------------------
   6. LE RAPPORT.
   ------------------------------------------------------------ */
const denominateur = liste.length - Object.keys(A_DECIDER).length;
const pct = (n) => ((n / denominateur) * 100).toFixed(1);

console.log('');
console.log(`La maquette énumère ${liste.length} fonctionnalités.`);
console.log(
  `${Object.keys(A_DECIDER).length} est une QUESTION posée au club, pas un travail : ` +
    `hors du compte.`
);
console.log(`Dénominateur : ${denominateur}.`);
console.log('');

let section = '';
for (const f of [...faites, ...partielles, ...sansPreuve, ...manquantes].sort(
  (a, b) => liste.indexOf(liste.find((x) => x.id === a.id)) - liste.indexOf(liste.find((x) => x.id === b.id))
)) {
  if (f.section !== section) { section = f.section; console.log(`  ${section}`); }
  const etat = faites.includes(f) ? '✓'
    : partielles.includes(f) ? '~'
    : sansPreuve.includes(f) ? '✗' : '·';
  console.log(`    ${etat} ${f.id.padEnd(18)} ${f.titre}`);
  if (etat === '~') console.log(`        ${f.ecart}`);
  else if (etat !== '✓') console.log(`        ${f.pourquoi ?? 'preuve non trouvée : ' + f.detail}`);
}

console.log('');
console.log(`✓ prouvées faites      ${faites.length} sur ${denominateur}  —  ${pct(faites.length)} %`);
if (partielles.length) {
  console.log(
    `~ faites AUTREMENT     ${partielles.length}  —  ${pct(partielles.length)} % ` +
      `(la fonctionnalité est là, la mise en page de la maquette non)`
  );
  console.log(
    `  soit, en comptant les partielles          ` +
      `${pct(faites.length + partielles.length)} %`
  );
}
if (sansPreuve.length) {
  console.log(`✗ preuve NON trouvée   ${sansPreuve.length}  (la preuve est fausse, ou la chose manque)`);
}
if (manquantes.length) {
  console.log(`· sans preuve définie  ${manquantes.length}`);
  for (const m of manquantes) console.log(`    ${m.id} — ${m.titre}`);
}
console.log('');
for (const [id, quoi] of Object.entries(A_DECIDER)) {
  console.log(`À DÉCIDER PAR LE CLUB · ${id} : ${quoi}`);
}
console.log('');
