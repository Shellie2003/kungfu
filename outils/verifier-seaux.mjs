/* ============================================================
   L'application et le SEAU doivent accepter les mêmes fichiers.

   « Vérifier, car le PDF n'est pas encore supporté. »

   Il ne l'était pas, et rien dans le dépôt ne pouvait le dire.
   L'écran proposait « Joindre une photo ou un document », le
   sélecteur acceptait le PDF, messagerie.ts tenait la liste des
   types autorisés, et les tests vérifiaient que le fichier PARTAIT.
   Ce qu'aucun d'eux ne voyait, c'est que le seau « pieces » — posé
   par la migration 0011 — ne déclarait que les trois types
   d'images. Le serveur refusait donc chaque document, après un envoi
   qui pouvait durer plusieurs secondes.

   C'est un défaut de RACCORD : deux moitiés écrites à deux endroits,
   chacune correcte, qui ne se parlent pas. Le projet en a déjà connu
   trois — la permission d'album écrite dans la table mais pas dans le
   seau, la version injectée dans un paquet et pas dans l'autre, la
   liste des catégories dans le code et pas en base.

   Ce contrôle lit les DEUX listes et refuse qu'elles diffèrent.

   Il ne peut pas interroger le serveur : le réseau de l'intégration
   ne va pas chez Supabase. Il compare donc la liste du code à celle
   de la MIGRATION, qui est ce qui sera appliqué au serveur du club.
   C'est le raccord qui compte, et c'est celui-là qui avait lâché.
   ============================================================ */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---- Ce que l'APPLICATION propose ---- */
const messagerie = readFileSync(
  join(RACINE, 'app', 'src', 'services', 'messagerie.ts'),
  'utf8'
);
const images = readFileSync(join(RACINE, 'app', 'src', 'services', 'images.ts'), 'utf8');

function listeDe(source, nom) {
  const m = new RegExp(`${nom}\\s*=\\s*\\[([^\\]]*)\\]`).exec(source);
  if (!m) return null;
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

const TYPES_IMAGE = listeDe(images, 'TYPES_IMAGE');
const TYPES_DOCUMENT = listeDe(messagerie, 'TYPES_DOCUMENT');

if (!TYPES_IMAGE || !TYPES_DOCUMENT) {
  console.error(
    'Impossible de lire TYPES_IMAGE ou TYPES_DOCUMENT dans les sources.\n' +
      'Si ces listes ont été renommées, corrigez ce contrôle — ne le retirez pas :\n' +
      'c’est lui qui a rattrapé le PDF refusé en silence.'
  );
  process.exit(1);
}

const attendus = [...TYPES_IMAGE, ...TYPES_DOCUMENT];

/* ---- Ce que le SEAU déclare ----

   On lit toutes les migrations dans l'ordre et l'on garde la
   DERNIÈRE déclaration qui concerne « pieces » : c'est celle qui
   fera loi sur le serveur, comme quand elles s'appliquent l'une
   après l'autre. */
const migrations = readdirSync(join(RACINE, 'supabase', 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();

let declare = null;
let ou = null;

for (const fichier of migrations) {
  const sql = readFileSync(join(RACINE, 'supabase', 'migrations', fichier), 'utf8');
  /* Les commentaires SQL d'abord : ils citent des types en toutes
     lettres pour expliquer, et les compter serait s'attraper
     soi-même — le défaut exact qu'un autre contrôle du projet a déjà
     eu. */
  const code = sql.replace(/^\s*--.*$/gm, '');

  for (const bloc of code.split(/;\s*/)) {
    if (!/\bpieces\b/.test(bloc) || !/allowed_mime_types/.test(bloc)) continue;
    const types = [...bloc.matchAll(/'((?:image|application|text)\/[^']+)'/g)].map((x) => x[1]);
    if (types.length) {
      declare = types;
      ou = fichier;
    }
  }
}

if (!declare) {
  console.error(
    'Aucune migration ne déclare « allowed_mime_types » pour le seau « pieces ».\n' +
      'Le seau accepterait alors n’importe quoi, ou rien, selon le serveur.'
  );
  process.exit(1);
}

/* ---- La comparaison ---- */
const manquants = attendus.filter((t) => !declare.includes(t));
const en_trop = declare.filter((t) => !attendus.includes(t));

if (manquants.length || en_trop.length) {
  console.error('\nL’application et le seau « pieces » ne sont pas d’accord.\n');
  if (manquants.length) {
    console.error(
      '  L’application PROPOSE, le seau REFUSERA :\n' +
        manquants.map((t) => `    · ${t}`).join('\n') +
        '\n\n  C’est exactement le défaut du PDF : le fichier part, l’attente dure,\n' +
        '  puis le serveur le rejette. Ajoutez ces types dans une migration.\n'
    );
  }
  if (en_trop.length) {
    console.error(
      '  Le seau ACCEPTE, l’application ne proposera jamais :\n' +
        en_trop.map((t) => `    · ${t}`).join('\n') +
        '\n\n  Ce n’est pas une panne, c’est une porte ouverte pour rien. Le seau\n' +
        '  est privé mais partagé entre les membres d’un salon, dont des mineurs.\n'
    );
  }
  console.error(`  Liste du code : app/src/services/messagerie.ts\n  Liste du seau : supabase/migrations/${ou}\n`);
  process.exit(1);
}

console.log(
  `✓ seau « pieces »   ${declare.length} types, les mêmes des deux côtés ` +
    `(${ou} et messagerie.ts).`
);
