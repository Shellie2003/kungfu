/* ============================================================
   Une écriture doit savoir si elle a écrit.

   ------------------------------------------------------------
   LE DÉFAUT, ET POURQUOI IL EST REVENU CINQ FOIS

   Une règle d'accès PostgreSQL ne rejette pas une mise à jour : elle
   rend la ligne INVISIBLE. Un « update » qui ne voit aucune ligne
   n'échoue pas — il ne touche rien, et répond « tout va bien ».

   Côté application, cela donne exactement le même résultat qu'un
   succès : « error » est nul. L'écran annonce « Enregistré », et rien
   ne l'a été. Le club le découvre des semaines plus tard, en
   constatant que le numéro de téléphone affiché est toujours
   l'ancien.

   Ce projet a payé ce défaut CINQ fois — sur les réglages du club,
   sur le changement de rôle, sur les catégories, sur les réactions,
   sur les notifications — et chaque fois il a fallu qu'un humain le
   remarque. « .select() » demande au serveur de RENDRE les lignes
   touchées : zéro ligne devient alors distinguable d'un succès.

   ------------------------------------------------------------
   CE QUE CE CONTRÔLE N'EXIGE PAS

   Il ne concerne que « update », « delete » et « upsert ».

   Les INSERT sont hors sujet : une insertion que la règle refuse
   lève une vraie erreur — « new row violates row-level security
   policy » — parce que la contrainte porte sur la ligne qu'on écrit,
   pas sur une ligne qu'il faut d'abord retrouver. Rien à distinguer.

   Et certaines écritures touchent LÉGITIMEMENT zéro ligne : « tout
   marquer lu » quand tout est déjà lu, « effacer les lues » quand il
   n'y en a aucune. Elles se déclarent avec un marqueur, sur la ligne
   qui précède :

       zéro-ligne-normal: rien n'était à marquer

   — écrit dans un commentaire ordinaire au-dessus de la requête.
   (L'exemple ne peut pas être montré en vrai commentaire ici : sa
   fermeture terminerait celui-ci, ce que ce fichier a appris à ses
   dépens en refusant de démarrer.)

   Le marqueur n'est pas une échappatoire : il oblige à écrire
   POURQUOI, et cette phrase se relit en revue.
   ============================================================ */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(RACINE, 'app', 'src');

const ECRITURE = /\.(update|delete|upsert)\(/;
const MARQUEUR = /zéro-ligne-normal:/;

function fichiers(dossier) {
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) out.push(...fichiers(chemin));
    else if (/\.tsx?$/.test(nom)) out.push(chemin);
  }
  return out;
}

const ennuis = [];
let examinees = 0;

for (const fichier of fichiers(SOURCE)) {
  const lignes = readFileSync(fichier, 'utf8').split('\n');

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    if (!ECRITURE.test(ligne)) continue;
    /* Le stockage de fichiers n'a pas de règles par ligne : ses
       refus sont de vraies erreurs. */
    if (/storage/.test(ligne)) continue;
    /* La table doit être une table de la base, pas un tableau
       JavaScript qui aurait une méthode du même nom. */
    let table = null;
    for (let j = Math.max(0, i - 8); j <= i; j++) {
      const t = /\.from\('([a-z_]+)'\)/.exec(lignes[j]);
      if (t) table = t[1];
    }
    if (!table) continue;

    examinees++;

    /* La requête va jusqu'au premier point-virgule. */
    const bloc = [];
    for (let j = i; j < Math.min(i + 16, lignes.length); j++) {
      bloc.push(lignes[j]);
      if (lignes[j].includes(';')) break;
    }
    const texte = bloc.join('\n');
    if (texte.includes('.select(')) continue;

    /* Le marqueur se cherche dans les QUATORZE lignes qui précèdent.

       Six d'abord, ce qui semblait large — jusqu'à ce que deux
       marqueurs légitimes passent inaperçus : leur commentaire
       explique POURQUOI zéro ligne est normal, et une explication
       qui vaut la peine d'être écrite fait plus de six lignes.
       Exiger la concision là où l'on demande une justification était
       contradictoire. */
    const avant = lignes.slice(Math.max(0, i - 14), i).join('\n');
    if (MARQUEUR.test(avant) || MARQUEUR.test(texte)) continue;

    const quoi = ECRITURE.exec(ligne)[1];
    ennuis.push({ fichier: relative(RACINE, fichier), ligne: i + 1, quoi, table });
  }
}

if (ennuis.length) {
  console.error(
    `\n${ennuis.length} écriture(s) ne sauront pas si elles ont écrit :\n`
  );
  for (const e of ennuis) {
    console.error(`  ✗ ${e.fichier}:${e.ligne}  ${e.quoi} sur « ${e.table} »`);
  }
  console.error(
    '\n  Une règle d’accès ne REJETTE pas une mise à jour : elle rend la ligne\n' +
      '  invisible. L’écriture ne touche alors rien et répond « tout va bien ».\n' +
      '  L’écran annonce « Enregistré », et rien ne l’a été.\n\n' +
      '  Ajoutez « .select(\'id\') » et traitez le cas zéro ligne comme un refus.\n\n' +
      '  Si zéro ligne est NORMAL ici — « tout marquer lu » quand tout est déjà\n' +
      '  lu — dites-le dans le commentaire au-dessus :\n\n' +
      '      /* zéro-ligne-normal: rien n’était à marquer */\n'
  );
  process.exit(1);
}

console.log(
  `✓ écritures       les ${examinees} mises à jour, suppressions et fusions savent ` +
    'si elles ont écrit.'
);
