/* ============================================================
   Les dates et les durées.

   C'est là que les erreurs sont les plus coûteuses et les moins
   visibles : « Il y a 1 j » au lieu de « Hier » ne saute pas aux
   yeux, et une date de sortie décalée d'un jour fait rater le car.

   Les tests posent une heure FIXE. Sans cela, « il y a 2 h » serait
   vrai le matin et faux le soir, et le test échouerait un jour sur
   deux sans raison compréhensible.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { dateLongue, depuis, jourEtMois, teinte } from '../src/services/casier';
import { heure, nomDuJour } from '../src/services/club';
import { dateFr } from '../src/services/membres';
import { ariary, codeMvola } from '../src/services/participation';

describe('jourEtMois', () => {
  test('rend le jour sur deux chiffres et le mois abrégé', () => {
    expect(jourEtMois('2026-09-12T00:00:00Z')).toEqual({ jour: '12', mois: 'sept' });
  });

  test('complète le jour à deux chiffres', () => {
    /* La pastille de date a une largeur fixe : « 5 » et « 05 » n'y
       tombent pas au même endroit. */
    expect(jourEtMois('2026-11-05T10:00:00Z').jour).toBe('05');
  });

  test('couvre les douze mois', () => {
    const mois = Array.from({ length: 12 }, (_, i) =>
      jourEtMois(new Date(2026, i, 15).toISOString()).mois
    );
    expect(mois).toEqual([
      'janv', 'févr', 'mars', 'avr', 'mai', 'juin',
      'juil', 'août', 'sept', 'oct', 'nov', 'déc'
    ]);
    /* Aucun mois ne doit tomber sur la chaîne vide : le tableau
       MOIS pourrait être trop court sans que rien ne le signale. */
    expect(mois.every(Boolean)).toBe(true);
  });
});

describe('dateLongue', () => {
  test('écrit le jour de la semaine, en français', () => {
    /* Le 12 septembre 2026 est un samedi. */
    expect(dateLongue('2026-09-12')).toBe('samedi 12 septembre');
  });
});

describe('dateFr', () => {
  test('rend une date de Postgres en toutes lettres', () => {
    expect(dateFr('2006-03-14')).toBe('14 mars 2006');
  });

  test('rend null pour une date absente', () => {
    /* L'élève sans date de début est le cas ordinaire : la fiche
       doit sauter la ligne, pas afficher « Invalid Date ». */
    expect(dateFr(null)).toBeNull();
  });
});

describe('depuis', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  const ilya = (ms: number) => new Date(Date.now() - ms).toISOString();

  test('moins d’une heure : en minutes', () => {
    expect(depuis(ilya(20 * 60_000))).toBe('Il y a 20 min');
  });

  test('jamais « il y a 0 min » : au minimum une', () => {
    /* Une notification qui vient d'arriver dirait sinon « il y a
       0 min », ce qui se lit comme un défaut. */
    expect(depuis(ilya(3_000))).toBe('Il y a 1 min');
  });

  test('quelques heures', () => {
    expect(depuis(ilya(5 * 3_600_000))).toBe('Il y a 5 h');
  });

  test('la veille se dit « Hier », pas « il y a 1 j »', () => {
    expect(depuis(ilya(26 * 3_600_000))).toBe('Hier');
  });

  test('dans la semaine : en jours', () => {
    expect(depuis(ilya(3 * 86_400_000))).toBe('Il y a 3 j');
  });

  test('au-delà d’une semaine : la date, plus parlante qu’un compte', () => {
    expect(depuis('2026-08-01T12:00:00Z')).toMatch(/1 août/);
  });
});

describe('nomDuJour et heure', () => {
  test('les jours de Postgres, où 1 est lundi', () => {
    expect(nomDuJour(1)).toBe('Lundi');
    expect(nomDuJour(6)).toBe('Samedi');
    expect(nomDuJour(7)).toBe('Dimanche');
  });

  test('un jour hors bornes ne casse pas l’écran', () => {
    expect(nomDuJour(0)).toBe('');
    expect(nomDuJour(9)).toBe('');
  });

  test('« 17:30:00 » se lit « 17h30 »', () => {
    expect(heure('17:30:00')).toBe('17h30');
    expect(heure('09:00:00')).toBe('09h00');
  });
});

describe('teinte', () => {
  test('un changement d’horaire est orange', () => {
    expect(teinte('Changement d’horaire')).toEqual(['#B0530F', '#FBEEE2']);
  });

  test('une catégorie inventée par le club tombe sur le vert', () => {
    /* Le club invente des catégories — « Cérémonie » n'était pas
       prévue et existe. Elles doivent rester lisibles, pas prendre
       une couleur au hasard. */
    expect(teinte('Cérémonie')).toEqual(['#12613C', '#E8F1EC']);
    expect(teinte('n’importe quoi')).toEqual(['#12613C', '#E8F1EC']);
  });
});

describe('MVola', () => {
  test('le code composé est celui de l’opérateur', () => {
    expect(codeMvola('0388010853', 5000)).toBe('#111*1*2*0388010853*5000#');
  });

  test('les montants s’écrivent avec des espaces insécables', () => {
    /* Écrit en points de code, et non en copiant le résultat : une
       espace ordinaire laisserait « 10 » en fin de ligne et
       « 000 Ar » à la suivante, et les deux se ressemblent trop pour
       qu'on les distingue dans un fichier.

       Deux insécables : celle des milliers, que « fr-FR » rend en
       U+202F, et celle qui retient « Ar » contre son nombre. */
    const nbsp = '\u00A0';
    expect(ariary(10000)).toBe(`10${nbsp}000${nbsp}Ar`);
    expect(ariary(500)).toBe(`500${nbsp}Ar`);
    expect(ariary(1000)).not.toContain(' ');
  });
});
