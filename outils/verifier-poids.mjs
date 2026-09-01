/* ============================================================
   Ce que le téléphone télécharge AVANT d'afficher quoi que ce soit.

   « La performance n'est pas encore de notre côté. » Elle ne le sera
   jamais durablement si personne ne la mesure : un paquet grossit
   d'un import à la fois, chacun raisonnable, et l'on découvre le
   total un an plus tard sur une connexion lente.

   Ce contrôle mesure le poids EAGER — les fichiers que le navigateur
   demande pour afficher le premier écran, avant tout clic. Les
   morceaux chargés à la demande (les douze écrans d'encadrement) n'y
   figurent pas : c'est justement l'intérêt de les avoir séparés.

   Le budget est posé un peu au-dessus du poids constaté le jour où
   il a été écrit. Il n'est pas là pour interdire de grandir : il est
   là pour que grandir soit une DÉCISION, prise en changeant ce
   chiffre, et non un accident découvert par le club.

   Ce qui compte est le poids COMPRESSÉ : c'est celui qui passe sur
   la ligne. Le poids brut est affiché à côté, parce que c'est lui
   que le téléphone doit ensuite déballer et exécuter.
   ============================================================ */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RACINE, 'app', 'dist');

/* Le budget, en kilooctets compressés.

   Constaté à 234 ko le jour où les écrans d'encadrement sont sortis
   du premier paquet. Ils y pesaient 26 ko de plus, pour douze écrans
   que soixante et un des soixante-quatre membres n'ouvriront jamais.

   J'avais d'abord posé 185, en ne comptant que le JavaScript. Le
   contrôle a refusé son propre projet, et il avait raison : la
   feuille de style pèse 69 ko compressés à elle seule — presque
   autant que tout le code de l'application. Un budget qu'on ajuste
   après coup ne vaut que s'il dit la vérité ; celui-ci dit ce que le
   téléphone télécharge réellement.

   LE PROCHAIN GAIN EST LÀ, et il est noté pour qui reprendra :
   122 ko de CSS brut viennent de css/app.css lu en entier, la
   feuille de la maquette — écrans d'impression compris. La tailler
   demande de vérifier écran par écran que la ressemblance tient, ce
   que la comparaison au pixel sait faire. Ce n'est pas fait ici
   parce que ce n'est pas ce qui a été demandé aujourd'hui. */
const BUDGET_GZIP = 245;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(
    'app/dist est absent : rien à peser.\n' +
      'Construisez d’abord la partie web (npx vite build dans app/).'
  );
  process.exit(1);
}

const page = readFileSync(join(DIST, 'index.html'), 'utf8');

/* Ce que la PAGE demande elle-même. Un morceau chargé par
   « import() » n'apparaît pas ici — il n'est demandé qu'au moment
   d'ouvrir l'écran — et c'est exactement la distinction qu'on
   veut mesurer. */
const demandes = [...page.matchAll(/(?:src|href)="\/?([^"]+\.(?:js|css))"/g)].map((m) =>
  m[1].replace(/^essai\//, '')
);

if (!demandes.length) {
  console.error('Aucun script ni feuille de style dans index.html — la page serait vide.');
  process.exit(1);
}

let brut = 0;
let comprime = 0;
const lignes = [];

for (const nom of demandes) {
  const chemin = join(DIST, nom);
  if (!existsSync(chemin)) {
    console.error(`index.html demande ${nom}, qui n’existe pas dans app/dist.`);
    process.exit(1);
  }
  const contenu = readFileSync(chemin);
  const g = gzipSync(contenu).length;
  brut += contenu.length;
  comprime += g;
  lignes.push([nom, contenu.length, g]);
}

/* Les morceaux à la demande, pour information : ce sont eux qu'on a
   sortis du chemin critique, et les voir listés est la preuve que la
   séparation a bien eu lieu. */
const tous = readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.js'));
const differes = tous.filter((f) => !demandes.some((d) => d.endsWith(f)));

for (const [nom, b, g] of lignes.sort((x, y) => y[2] - x[2])) {
  console.log(`  ${String(Math.round(g / 1024)).padStart(4)} ko  ${nom}  (${Math.round(b / 1024)} ko brut)`);
}

const ko = Math.round(comprime / 1024);
console.log(
  `\n  ${differes.length} morceau(x) chargé(s) seulement à l’ouverture de l’écran concerné.`
);

if (ko > BUDGET_GZIP) {
  console.error(
    `\n✗ Le premier chargement pèse ${ko} ko compressés (${Math.round(brut / 1024)} ko bruts),\n` +
      `  au-dessus du budget de ${BUDGET_GZIP} ko.\n\n` +
      '  Ce n’est pas une interdiction de grandir : c’est une demande de le\n' +
      '  décider. Ou bien ce qui vient d’être ajouté n’a pas à être chargé\n' +
      '  avant le premier écran — mettez-le derrière un « import() », comme\n' +
      '  les écrans d’encadrement — ou bien il le doit vraiment, et le\n' +
      '  budget se relève ici, en connaissance de cause.\n'
  );
  process.exit(1);
}

console.log(
  `\n✓ Premier chargement : ${ko} ko compressés (${Math.round(brut / 1024)} ko bruts), ` +
    `budget ${BUDGET_GZIP} ko.`
);
