/* ============================================================
   LE TEMPS RÉEL — ET LE DÉFAUT QUI NE DISAIT RIEN.

   « Le message n'est pas en temps réel : l'utilisateur a besoin de
   sortir de la conversation pour voir un nouveau message. »

   ------------------------------------------------------------
   CE QUI S'ÉTAIT PASSÉ

   Le code d'écoute était là depuis le premier jour, et correct. Mais
   PostgreSQL n'envoie les changements d'une table que si elle
   appartient à la publication « supabase_realtime », et aucune
   migration ne l'avait déclarée. L'application s'abonnait donc à un
   canal parfaitement valide, qui répondait « SUBSCRIBED » et se
   taisait pour toujours.

   AUCUNE ERREUR NULLE PART : ni console, ni journal, ni essai. C'est
   la marque des trois défauts les plus coûteux de ce projet — la
   mise à jour bloquée par le CORS, le 204 avec un corps, et
   celui-ci.

   ------------------------------------------------------------
   POURQUOI CET ESSAI EST STATIQUE

   Le banc coupe le temps réel à la source (tests/mise-en-place.ts) :
   sans cela, chaque essai ouvrirait une WebSocket vers un serveur
   qui n'est pas là. On ne peut donc pas vérifier ICI qu'un message
   arrive — cela ne se voit que sur deux téléphones.

   Ce qui se vérifie, et qui est exactement ce qui manquait : que
   toute table ÉCOUTÉE par l'application soit bien DIFFUSÉE par une
   migration. C'est le lien entre les deux moitiés qui était rompu,
   et rien ne le regardait.
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

/* Depuis le dossier de travail de Vitest — « app/ » — et non depuis
   « import.meta.url » : transformé par Vite, celui-ci ne porte pas le
   chemin réel du fichier et rendait « /src ». */
const SRC = resolve(process.cwd(), 'src');
const MIGRATIONS = resolve(process.cwd(), '..', 'supabase', 'migrations');

/* Les tables que l'application écoute, relevées dans le code plutôt
   que recopiées à la main — une liste recopiée se désynchronise au
   premier ajout, et l'essai passerait au vert en ne gardant rien. */
function tablesEcoutees(): string[] {
  const trouvees = new Set<string>();
  const parcourir = (dossier: string) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, e.name);
      if (e.isDirectory()) { parcourir(chemin); continue; }
      if (!/\.tsx?$/.test(e.name)) continue;
      const texte = readFileSync(chemin, 'utf8');
      /* On ne regarde que les appels, pas la définition du type dans
         tempsReel.ts — celle-ci énumère les tables possibles, pas
         celles qu'on écoute réellement. */
      if (chemin.endsWith('tempsReel.ts')) continue;
      for (const m of texte.matchAll(/\{\s*table:\s*'([a-z_]+)'/g)) trouvees.add(m[1]!);
    }
  };
  parcourir(SRC);
  return [...trouvees].sort();
}

/* Ce que les migrations DIFFUSENT réellement. On lit le SQL, pas une
   note : c'est le SQL qui décide. */
function tablesDiffusees(): string[] {
  const trouvees = new Set<string>();
  for (const f of readdirSync(MIGRATIONS)) {
    if (!f.endsWith('.sql')) continue;
    const sql = readFileSync(join(MIGRATIONS, f), 'utf8');
    /* Deux écritures possibles : la commande directe, et la liste
       passée à la boucle qui rend la migration rejouable. */
    for (const m of sql.matchAll(/alter\s+publication\s+supabase_realtime\s+add\s+table\s+public\.(\w+)/gi)) {
      trouvees.add(m[1]!);
    }
    for (const m of sql.matchAll(/array\s*\[([^\]]+)\]/gi)) {
      for (const t of (m[1] ?? '').matchAll(/'([a-z_]+)'/g)) trouvees.add(t[1]!);
    }
  }
  return [...trouvees].sort();
}

describe('ce que l’application écoute doit être diffusé', () => {
  test('l’application écoute bien quelque chose', () => {
    /* Garde-fou du garde-fou : si le relevé rendait une liste vide,
       l'essai suivant passerait sans rien vérifier du tout. */
    expect(tablesEcoutees().length).toBeGreaterThan(0);
  });

  test('⚠ chaque table écoutée est dans la publication', () => {
    const ecoutees = tablesEcoutees();
    const diffusees = tablesDiffusees();
    const muettes = ecoutees.filter((t) => !diffusees.includes(t));

    /* C'est CE contrôle qui manquait. Sans lui, « messages » était
       écoutée sans être diffusée depuis le premier jour, et rien —
       ni les 480 essais, ni les douze bancs — ne le disait. */
    expect(
      muettes,
      `Ces tables sont écoutées par l’application mais ne sont dans AUCUNE ` +
        `publication : l’abonnement réussira et ne recevra jamais rien, ` +
        `sans le moindre message d’erreur. Ajoutez-les dans une migration ` +
        `(voir 0026_temps_reel.sql).`
    ).toEqual([]);
  });

  test('on ne diffuse pas une table que personne n’écoute', () => {
    /* L'inverse coûte aussi : chaque table diffusée grossit le
       journal d'écriture et le trafic de tous les téléphones
       connectés. Ce n'est pas une panne, donc on ne fait pas échouer
       — mais on veut le voir. */
    const inutiles = tablesDiffusees().filter((t) => !tablesEcoutees().includes(t));
    if (inutiles.length) {
      console.warn(
        `Diffusées sans être écoutées : ${inutiles.join(', ')} — ` +
          `du trafic pour tous les téléphones, sans usage.`
      );
    }
    expect(Array.isArray(inutiles)).toBe(true);
  });
});
