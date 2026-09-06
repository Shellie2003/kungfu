/* ============================================================
   LA PANNE DU 6 SEPTEMBRE 2026, ET SES DEUX MOITIÉS.

   Le club, en production :

     « Je ne peux pas modifier la date de naissance, il indique
       erreur du serveur. J'ai modifié mon matricule, puis l'app se
       déconnecte, puis je ne peux plus entrer dans mon compte — je
       suis le super admin. »

   ------------------------------------------------------------
   CE QUI S'EST PASSÉ, ET POURQUOI LES DEUX SONT LA MÊME HISTOIRE

   1. « profils_prives » N'A PAS DE COLONNE « id ». L'écriture
      demandait « .select('id') », et le serveur refusait la requête
      ENTIÈRE : « column profils_prives.id does not exist ». Plus
      aucune date de naissance, aucun téléphone, aucune adresse ne
      pouvait être enregistré.

   2. LE RENOMMAGE PARTAIT EN PREMIER. Le super administrateur a
      corrigé son matricule ET sa date de naissance dans le même
      enregistrement. Le renommage a réussi — son adresse de
      connexion est devenue « f04x003@waishi.local » — puis
      l'écriture privée a échoué, et l'écran a dit « erreur du
      serveur ».

      Ce message se lit comme « rien n'a été enregistré ». Le
      matricule, lui, était déjà changé. L'application s'est
      déconnectée — changer l'adresse d'un compte révoque ses
      sessions — et il a retapé son ANCIEN matricule. Dix fois.

   ------------------------------------------------------------
   CE QUE CES ESSAIS TIENNENT

   L'ordre, et les colonnes. Aucun des deux ne se voit à l'exécution
   sur ce banc : le serveur de bouchon accepte n'importe quel
   « .select() », et c'est justement pour cela qu'il fallait le
   vérifier autrement.
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = join(process.cwd(), '..');
const SOURCE = readFileSync(join(RACINE, 'app/src/services/admin.ts'), 'utf8');

/* Les commentaires de ce fichier racontent la panne, et citent donc
   « .select('id') » et « renommer ». Chercher dedans trouverait le
   récit et croirait avoir trouvé le code. */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* Les colonnes réelles, lues dans les migrations — la même source
   que « verifier-ecritures ». */
function colonnesDe(table: string): Set<string> {
  const dossier = join(RACINE, 'supabase/migrations');
  let sql = '';
  for (const nom of readdirSync(dossier).sort()) {
    if (nom.endsWith('.sql')) sql += `\n${readFileSync(join(dossier, nom), 'utf8')}`;
  }
  sql = sql.replace(/^\s*--.*$/gm, '');
  const colonnes = new Set<string>();
  const creation = new RegExp(
    `create table (?:if not exists )?(?:public\\.)?${table}\\s*\\(([\\s\\S]*?)\\n\\);`
  );
  const corps = creation.exec(sql)?.[1];
  if (corps) {
    for (const ligne of corps.split('\n')) {
      const nom = /^\s{2,}([a-z_]+)\s+[a-z]/.exec(ligne)?.[1];
      if (nom && !['primary', 'unique', 'constraint', 'foreign', 'check'].includes(nom)) {
        colonnes.add(nom);
      }
    }
  }
  return colonnes;
}

describe('l’enregistrement d’une fiche', () => {
  test('⚠ le renommage part EN DERNIER, après tout le reste', () => {
    /* LE POINT QUI A ENFERMÉ LE SUPER ADMINISTRATEUR DEHORS.

       Ce qui peut mettre quelqu'un dehors se fait en dernier. Si une
       écriture échoue avant, le matricule n'a pas bougé et le membre
       peut toujours entrer — l'erreur affichée dit alors la vérité.
       En premier, elle ment : le matricule a changé, et l'écran
       laisse croire le contraire. */
    const bloc = CODE.slice(CODE.indexOf('useModifierFiche'));
    const renommage = bloc.indexOf("appelerFonction('renommer'");
    const fiche = bloc.indexOf("from('profils')");
    const prive = bloc.indexOf("from('profils_prives')");

    expect(renommage, 'le renommage a disparu de la modification').toBeGreaterThan(-1);
    expect(
      renommage,
      'le renommage part AVANT l’écriture de la fiche : si celle-ci échoue, ' +
        'le matricule aura changé et l’écran dira « erreur » — le membre ' +
        'retapera l’ancien matricule et restera dehors.'
    ).toBeGreaterThan(fiche);
    expect(
      renommage,
      'le renommage part AVANT les informations privées : même défaut, ' +
        'et c’est exactement celui du 6 septembre 2026.'
    ).toBeGreaterThan(prive);
  });

  test('⚠ chaque « .select » d’écriture porte une colonne QUI EXISTE', () => {
    /* « profils_prives » et « membres_salon » n'ont pas de « id ».
       Demander une colonne absente fait refuser la requête entière,
       et l'écran annonce « erreur du serveur ». */
    const paires = [...CODE.matchAll(/from\('([a-z_]+)'\)([\s\S]{0,400}?);/g)];
    const fautes: string[] = [];

    for (const [, table, suite] of paires) {
      if (!table || !suite) continue;
      if (!/\.(update|delete|upsert)\(/.test(suite)) continue;
      const demandee = /\.select\('([a-z_]+)/.exec(suite)?.[1];
      if (!demandee) continue;
      const connues = colonnesDe(table);
      if (connues.size && !connues.has(demandee)) {
        fautes.push(`${table}.${demandee} (colonnes : ${[...connues].join(', ')})`);
      }
    }

    expect(
      fautes,
      'Une écriture demande une colonne qui n’existe pas : le serveur ' +
        'refusera la requête entière, et rien ne sera enregistré.'
    ).toEqual([]);
  });

  test('la table des informations privées n’a toujours pas de « id »', () => {
    /* Si elle en gagnait un un jour, l'essai ci-dessus cesserait de
       protéger quoi que ce soit sans que personne le remarque. Cet
       essai-ci le dirait. */
    const colonnes = colonnesDe('profils_prives');
    expect(colonnes.has('profil_id')).toBe(true);
    expect(
      colonnes.has('id'),
      'profils_prives a gagné une colonne « id » : relisez l’essai ci-dessus, ' +
        'il ne prouve plus rien.'
    ).toBe(false);
  });
});
