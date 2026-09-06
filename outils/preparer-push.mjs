/* ============================================================
   PRÉPARER LES NOTIFICATIONS DU TÉLÉPHONE, CÔTÉ ANDROID.

   Deux gestes à poser sur le projet Android engendré :

     1. déclarer POST_NOTIFICATIONS, sans quoi Android 13 et suivants
        refusent d'afficher quoi que ce soit ;
     2. écrire « google-services.json » si le club a un projet
        Firebase, à partir d'un secret.

   ------------------------------------------------------------
   ⚠ POURQUOI UN SCRIPT, ET NON DEUX ÉTAPES RECOPIÉES

   publier.yml porte cet avertissement, écrit après un incident réel :

       « TOUTE ÉTAPE AJOUTÉE À apk.yml ENTRE "Engendrer le projet
         Android" ET "Construire" DOIT ÊTRE AJOUTÉE ICI AUSSI. »

   Il vient d'un écart qui avait déjà mordu : une permission déclarée
   dans l'APK d'essai et pas dans celui du club. Les deux APK portaient
   le même numéro, se ressemblaient en tout, et l'un savait faire ce
   que l'autre ne savait pas — on aurait cherché le défaut dans le
   code, où il n'était pas.

   Un commentaire ne fait pas respecter une règle. Un fichier appelé
   des deux côtés, si : recopier un appel d'une ligne se voit, et
   l'oublier fait échouer la construction plutôt que de la laisser
   produire un APK amputé en silence.

   ------------------------------------------------------------
   SANS FIREBASE, CE SCRIPT RÉUSSIT

   Le club n'a peut-être pas encore de projet Firebase. La permission
   est posée quand même — elle ne coûte rien — et le fichier n'est pas
   écrit. Capacitor n'applique alors pas le greffon Google (son modèle
   le fait déjà dans un « try »), Firebase ne s'initialise pas,
   « register() » échoue, et l'application le rattrape sans rien dire.

   L'APK marche exactement comme avant. C'est un état correct, pas un
   état dégradé, et le journal le dit en toutes lettres pour qu'on ne
   parte pas chercher une panne.
   ============================================================ */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ANDROID = join(process.cwd(), 'app', 'android');
const MANIFESTE = join(ANDROID, 'app', 'src', 'main', 'AndroidManifest.xml');
const SERVICES = join(ANDROID, 'app', 'google-services.json');

const PERMISSION = 'android.permission.POST_NOTIFICATIONS';

function echouer(pourquoi) {
  console.error(`::error::${pourquoi}`);
  process.exit(1);
}

/* ------------------------------------------------------------
   1. LA PERMISSION.
   ------------------------------------------------------------ */
if (!existsSync(MANIFESTE)) {
  echouer(
    `Le manifeste est introuvable : ${MANIFESTE}. Ce script doit tourner APRÈS « npx cap add android », depuis la racine du dépôt.`
  );
}

let manifeste = readFileSync(MANIFESTE, 'utf8');

if (manifeste.includes(PERMISSION)) {
  console.log('POST_NOTIFICATIONS : déjà déclarée.');
} else {
  if (!manifeste.includes('</manifest>')) {
    echouer(
      'Le manifeste engendré n’a pas la forme attendue : les notifications ne pourraient pas s’afficher sur Android 13 et suivants, et rien ne le dirait.'
    );
  }
  manifeste = manifeste.replace(
    '</manifest>',
    `    <uses-permission android:name="${PERMISSION}" />\n</manifest>`
  );
  writeFileSync(MANIFESTE, manifeste);
  if (!readFileSync(MANIFESTE, 'utf8').includes(PERMISSION)) {
    echouer('L’écriture de la permission de notification a échoué.');
  }
  console.log('POST_NOTIFICATIONS : déclarée.');
}

/* ------------------------------------------------------------
   2. LE FICHIER DE FIREBASE.

   Le secret peut arriver de deux façons : le JSON tel quel, ou le
   même encodé en base64. On accepte les deux — un JSON multiligne
   traverse mal certains passages, et quelqu'un qui a encodé par
   prudence ne doit pas se voir refuser.
   ------------------------------------------------------------ */
const secret = (process.env.FIREBASE_GOOGLE_SERVICES ?? '').trim();

if (!secret) {
  console.log(
    'Firebase : aucun « FIREBASE_GOOGLE_SERVICES ». Les notifications du ' +
      'téléphone resteront muettes, et TOUT LE RESTE MARCHE. Ce n’est pas ' +
      'une panne : voir LIVRER.md pour créer le projet Firebase du club.'
  );
} else {
  let json = secret;
  if (!json.startsWith('{')) {
    try {
      json = Buffer.from(secret, 'base64').toString('utf8');
    } catch {
      echouer('« FIREBASE_GOOGLE_SERVICES » n’est ni du JSON ni du base64.');
    }
  }

  /* ⚠ ON VÉRIFIE LE CONTENU AVANT DE L'ÉCRIRE. Un fichier tronqué ou
     collé de travers ferait échouer la construction Gradle avec un
     message qui ne parlerait ni de Firebase ni du secret. */
  let lu;
  try {
    lu = JSON.parse(json);
  } catch {
    echouer(
      '« FIREBASE_GOOGLE_SERVICES » ne se lit pas comme du JSON. Recopiez le fichier « google-services.json » de la console Firebase, en entier.'
    );
  }
  if (!lu?.project_info?.project_number || !Array.isArray(lu?.client)) {
    echouer(
      'Le JSON de Firebase n’a pas la forme d’un « google-services.json » (il lui manque « project_info » ou « client »).'
    );
  }

  writeFileSync(SERVICES, `${JSON.stringify(lu, null, 2)}\n`);
  console.log(
    `Firebase : google-services.json écrit (projet ${lu.project_info.project_id ?? '?'}).`
  );
}
