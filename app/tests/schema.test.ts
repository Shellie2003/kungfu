/* ============================================================
   CE QUE LE SCHÉMA PROMET, ET CE QUE LE CODE EN DIT.

   ------------------------------------------------------------
   POURQUOI CET ESSAI EXISTE

   La fonction « comptes » affirmait ceci, depuis toujours, dans son
   action « supprimer » :

       « Ce qui reste : les messages écrits, dont l'auteur devient
         nul — faire disparaître une conversation à laquelle d'autres
         ont participé n'est pas ce qu'on demande en supprimant un
         membre. »

   La base faisait le contraire :

       auteur_id uuid not null references profils (id) on delete CASCADE

   Supprimer un membre effaçait donc TOUS ses messages, au milieu des
   conversations des autres. Personne n'avait confronté les deux, et
   rien ne pouvait le faire : le commentaire est dans une fonction
   Deno, la contrainte dans un fichier SQL, et aucun essai ne lisait
   les deux.

   ⚠ ET CELA NE SE SERAIT VU QU'UNE FOIS FAIT. La suppression est
   définitive. Le club l'aurait découvert sur une conversation qu'il
   ne pouvait plus reconstituer.

   Corrigé par la migration 0027 — la BASE, pas le commentaire, parce
   que c'est le commentaire qui avait raison.

   ------------------------------------------------------------
   CE QUE CET ESSAI PEUT ET NE PEUT PAS

   Il lit le SQL, pas une base : il ne prouve donc pas que la
   migration a été APPLIQUÉE. Ce qu'il empêche, c'est qu'on
   réintroduise le « cascade » sans s'en apercevoir — un « create
   table » recopié, une migration de reprise, un retour en arrière.
   Le comportement réel, lui, a été éprouvé sur la base : un membre
   supprimé, son message intact, son auteur nul, et la ligne NON
   marquée « modifié ».
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MIGRATIONS = resolve(process.cwd(), '..', 'supabase', 'migrations');

/* Les migrations dans l'ordre où PostgreSQL les a jouées : la
   dernière définition d'une contrainte est celle qui vaut. */
function sqlDansLOrdre(): string[] {
  return readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'));
}

describe('un membre supprimé ne troue pas les conversations', () => {
  test('⚠ le dernier mot sur « messages.auteur_id » est « set null »', () => {
    /* On cherche la DERNIÈRE occurrence, pas la première : 0002 pose
       le cascade, 0027 le remplace. Regarder la première déclarerait
       le défaut toujours présent ; n'en regarder aucune ne
       prouverait rien. */
    let dernier: string | null = null;
    for (const sql of sqlDansLOrdre()) {
      for (const m of sql.matchAll(
        /auteur_id[^;]*?references\s+(?:public\.)?profils\s*\(\s*id\s*\)\s*on\s+delete\s+(cascade|set null)/gi
      )) {
        /* La table « signalements » a aussi un « auteur_id » et garde
           son cascade : un signalement est personnel, il part avec
           celui qui l'a écrit. On ne retient donc que ce qui parle
           des messages. */
        const contexte = sql.slice(Math.max(0, m.index - 400), m.index);
        if (/create\s+table[^;]*\bsignalements\b/i.test(contexte)) continue;
        dernier = m[1]!.toLowerCase();
      }
      for (const m of sql.matchAll(
        /alter\s+table\s+(?:public\.)?messages[\s\S]{0,400}?foreign\s+key\s*\(\s*auteur_id\s*\)[\s\S]{0,200}?on\s+delete\s+(cascade|set null)/gi
      )) {
        dernier = m[1]!.toLowerCase();
      }
    }

    expect(
      dernier,
      'Aucune contrainte trouvée pour messages.auteur_id : l’essai ne garde rien. ' +
        'A-t-on renommé la colonne ou la table ?'
    ).not.toBeNull();

    expect(
      dernier,
      'messages.auteur_id est revenu à « on delete cascade ». Supprimer un membre ' +
        'effacerait alors ses messages AU MILIEU des conversations des autres, ' +
        'définitivement, et la fonction « comptes » promet le contraire. Voir 0027.'
    ).toBe('set null');
  });

  test('le déclencheur laisse partir un auteur, et rien d’autre', () => {
    const sql = sqlDansLOrdre().join('\n');
    /* Sans cette dérogation, « set null » ferait ÉCHOUER toute
       suppression de membre : le déclencheur interdit de changer
       l'auteur d'un message, et un « set null » est une mise à jour. */
    expect(sql).toMatch(/depart\s+boolean\s*:=\s*old\.auteur_id\s+is\s+not\s+null\s+and\s+new\.auteur_id\s+is\s+null/i);
    /* Et il ne doit pas marquer « modifié » un message que personne
       n'a touché — le club y lirait une réécriture qui n'a pas eu
       lieu. */
    expect(sql).toMatch(/if\s+not\s+depart\s+then\s*\n\s*new\.modifie_le\s*:=\s*now\(\)/i);
  });

  test('l’application accepte un message sans auteur', () => {
    const service = readFileSync(
      resolve(process.cwd(), 'src/services/messagerie.ts'),
      'utf8'
    );
    /* Le type doit dire ce que la base permet. S'il promettait un
       auteur toujours présent, un message de membre supprimé ferait
       tomber l'écran — et seulement chez le club, des mois plus
       tard. */
    expect(service).toMatch(/auteur_id:\s*string\s*\|\s*null/);
  });
});
