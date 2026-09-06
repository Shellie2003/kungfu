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

/* ------------------------------------------------------------
   LES COLONNES DE CHAQUE TABLE, LUES DANS LES MIGRATIONS.

   La base est la seule autorité, mais on ne la joint pas : ce
   contrôle doit tourner sur la machine de construction, sans
   secrets et sans réseau. Les migrations disent la même chose, et
   elles sont dans le dépôt.

   On lit les « create table », et aussi les « alter table … add
   column » — sans quoi une colonne ajoutée après coup serait tenue
   pour inexistante, et l'on refuserait une écriture correcte.
   ------------------------------------------------------------ */
const MIGRATIONS = join(RACINE, 'supabase', 'migrations');

function schemaDesMigrations() {
  const tables = new Map();
  let sql = '';
  for (const nom of readdirSync(MIGRATIONS).sort()) {
    if (nom.endsWith('.sql')) sql += `\n${readFileSync(join(MIGRATIONS, nom), 'utf8')}`;
  }
  /* Les commentaires SQL d'abord : ce dépôt en écrit beaucoup, et
     ils citent des noms de tables et de colonnes. Les garder ferait
     inventer des colonnes qui n'existent pas — l'inverse du défaut
     qu'on corrige, mais tout aussi faux. */
  sql = sql.replace(/^\s*--.*$/gm, '');

  const creation = /create table (?:if not exists )?(?:public\.)?([a-z_]+)\s*\(([\s\S]*?)\n\);/g;
  for (const [, table, corps] of sql.matchAll(creation)) {
    const colonnes = tables.get(table) ?? new Set();
    for (const ligne of corps.split('\n')) {
      const m = /^\s{2,}([a-z_]+)\s+[a-z]/.exec(ligne);
      /* « primary key (a, b) », « unique (…) », « constraint … » ne
         sont pas des colonnes. */
      if (m && !['primary', 'unique', 'constraint', 'foreign', 'check'].includes(m[1])) {
        colonnes.add(m[1]);
      }
    }
    tables.set(table, colonnes);
  }

  const ajout = /alter table (?:if exists )?(?:public\.)?([a-z_]+)\s+add column (?:if not exists )?([a-z_]+)/g;
  for (const [, table, colonne] of sql.matchAll(ajout)) {
    if (!tables.has(table)) tables.set(table, new Set());
    tables.get(table).add(colonne);
  }

  return tables;
}

const SCHEMA = schemaDesMigrations();

/* « null » veut dire « je ne sais pas » — une vue, une table créée
   hors migration. On n'accuse jamais sur une ignorance. */
function colonnesDe(table) {
  const c = SCHEMA.get(table);
  return c && c.size ? c : null;
}

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

    /* ------------------------------------------------------------
       ⚠ UN « .select() » NE SUFFIT PAS : LA COLONNE DOIT EXISTER.

       Ce contrôle se contentait de voir un « .select(…) » quelque
       part, et son conseil disait « ajoutez .select('id') ». Le
       conseil est juste — sauf que QUATRE tables du schéma n'ont pas
       de colonne « id » : profils_prives, membres_salon, reglages,
       jetons_push. Leur clé est autre chose.

       Demander une colonne qui n'existe pas fait refuser la requête
       ENTIÈRE par le serveur : « column profils_prives.id does not
       exist ». L'écriture n'a pas lieu, et l'écran annonce « erreur
       du serveur ».

       CE N'EST PAS UNE HYPOTHÈSE. Le 6 septembre 2026, le club n'a
       plus pu modifier aucune date de naissance, aucun téléphone,
       aucune adresse — ni retirer personne d'un salon. Et le super
       administrateur s'est retrouvé enfermé dehors : il corrigeait
       sa date de naissance et son matricule dans le même
       enregistrement, le renommage a réussi, l'écriture privée a
       échoué, l'écran a dit « erreur du serveur » — et il a retapé
       son ancien matricule pendant dix tentatives.

       Cet instrument avait donc approuvé, deux fois, une écriture
       qui ne pouvait pas réussir. Il vérifie maintenant que la
       colonne demandée existe vraiment, en lisant les migrations.
       ------------------------------------------------------------ */
    const demande = /\.select\('([a-z_]+)/.exec(texte);
    if (demande) {
      const colonne = demande[1];
      const connues = colonnesDe(table);
      /* Une table qu'on ne sait pas lire — une vue, une table créée
         hors migration — ne se juge pas : on accepte. Refuser ce
         qu'on ne comprend pas ferait échouer des écritures saines. */
      if (connues && !connues.has(colonne)) {
        ennuis.push({
          fichier: relative(RACINE, fichier),
          ligne: i + 1,
          quoi: ECRITURE.exec(ligne)[1],
          table,
          colonne
        });
      }
      continue;
    }
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
    if (e.colonne) {
      const dispo = [...(colonnesDe(e.table) ?? [])].slice(0, 6).join(', ');
      console.error(
        `  ✗ ${e.fichier}:${e.ligne}  ${e.quoi} sur « ${e.table} » demande ` +
          `« ${e.colonne} », qui n’existe pas.\n` +
          `      Colonnes de cette table : ${dispo}`
      );
    } else {
      console.error(`  ✗ ${e.fichier}:${e.ligne}  ${e.quoi} sur « ${e.table} »`);
    }
  }
  console.error(
    '\n  Une règle d’accès ne REJETTE pas une mise à jour : elle rend la ligne\n' +
      '  invisible. L’écriture ne touche alors rien et répond « tout va bien ».\n' +
      '  L’écran annonce « Enregistré », et rien ne l’a été.\n\n' +
      '  Ajoutez un « .select(\'…\') » portant une colonne QUI EXISTE, et traitez\n' +
      '  le cas zéro ligne comme un refus. Quatre tables n’ont pas de « id » —\n' +
      '  profils_prives, membres_salon, reglages, jetons_push : leur clé est\n' +
      '  ailleurs, et demander « id » fait refuser la requête entière.\n\n' +
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
