/* ============================================================
   Vérifier la configuration de la version WEB, avant Vercel.

   Deux pannes silencieuses, coup sur coup, sur le même chemin :

   1. « buildCommand » avait dépassé 256 caractères. Vercel refuse
      alors le déploiement AVANT de construire : pas de journal, pas
      de ligne rouge dans le dépôt, rien qu'un état « ERROR » sur un
      tableau de bord que personne n'ouvre.

   2. .vercelignore retirait app/package-lock.json, outils/ et
      icones.mjs — c'est-à-dire de quoi installer, de quoi
      construire, et le trait des icônes. Les motifs avaient été
      écrits du temps où l'hébergement ne SERVAIT qu'une maquette ;
      ils ont commencé à mordre le jour où il s'est mis à
      CONSTRUIRE.

   Les deux fois, l'APK continuait de sortir : rien ne laissait
   deviner que le site était figé. Ce contrôle échoue donc là où on
   regarde — dans l'intégration continue — plutôt que là où on ne
   regarde pas.
   ============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = new URL('..', import.meta.url).pathname;
const lire = (f) => readFileSync(join(RACINE, f), 'utf8');

const ennuis = [];

/* ---------------------------------------------- Les longueurs */
const config = JSON.parse(lire('vercel.json'));
for (const champ of ['buildCommand', 'installCommand', 'devCommand', 'outputDirectory']) {
  const n = (config[champ] ?? '').length;
  if (n > 256) {
    ennuis.push(
      `vercel.json : « ${champ} » fait ${n} caractères, le maximum est 256.\n` +
      '  Vercel refusera le déploiement sans construire. Déplacez la commande\n' +
      '  dans un script, comme outils/vercel-build.sh.'
    );
  }
}

/* ---------------------------------------------- Ce que .vercelignore emporte

   On reproduit la règle de Vercel : un motif SANS barre oblique
   initiale s'applique à n'importe quelle profondeur — c'est
   exactement ce qui a fait disparaître app/package-lock.json. */
const motifs = lire('.vercelignore')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const enExpression = (motif) =>
  new RegExp('^' + motif.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');

function retire(chemin) {
  for (const motif of motifs) {
    if (motif.startsWith('/')) {
      const p = motif.slice(1);
      if (chemin === p || chemin.startsWith(p + '/')) return motif;
    } else {
      const re = enExpression(motif);
      if (chemin.split('/').some((seg) => re.test(seg))) return motif;
    }
  }
  return null;
}

/* Ce sans quoi la construction ne peut pas aboutir. La liste est
   courte et explicite : c'est elle qu'on relit le jour où l'on
   ajoute un motif d'exclusion. */
const INDISPENSABLES = [
  ['app/package.json', 'npm ci n’a rien à installer'],
  ['app/package-lock.json', 'npm ci exige un verrou, et le dit mal'],
  ['app/tsconfig.json', 'le contrôle de typage ne tourne pas'],
  ['app/.env.essai', 'plus de serveur par défaut'],
  ['outils/vercel-build.sh', 'la commande de construction elle-même'],
  ['icones.mjs', 'le trait des icônes, partagé avec la maquette'],
  ['css/app.css', 'la feuille de style de la maquette'],
  ['css/fonts.css', 'les polices']
];

for (const [chemin, consequence] of INDISPENSABLES) {
  if (!existsSync(join(RACINE, chemin))) {
    ennuis.push(`${chemin} n’existe pas — la liste des indispensables est à corriger.`);
    continue;
  }
  const motif = retire(chemin);
  if (motif) {
    ennuis.push(
      `.vercelignore retire ${chemin} (motif « ${motif} ») : ${consequence}.\n` +
      '  Un motif sans barre oblique initiale s’applique à TOUTE profondeur.\n' +
      `  Ancrez-le à la racine : « /${motif} ».`
    );
  }
}

if (ennuis.length) {
  console.error('\nLa version web ne se déploierait pas :\n');
  for (const e of ennuis) console.error('  ✗ ' + e + '\n');
  process.exit(1);
}

console.log(
  `vercel.json et .vercelignore : rien à signaler ` +
  `(${INDISPENSABLES.length} fichiers indispensables conservés).`
);
