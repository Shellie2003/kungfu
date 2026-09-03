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
import { creneau, dateLongue, depuis, heureFr, jourEtMois } from '../src/services/casier';
import { eclaircir, teinter } from '../src/services/categories';
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
  test('écrit le jour de la semaine, en français, avec sa majuscule', () => {
    /* Le 12 septembre 2026 est un samedi.

       La majuscule est voulue : le navigateur rend « samedi », qui
       est juste au milieu d'une phrase. Mais cette date est un
       INTITULÉ, seul sur sa ligne en tête d'une carte, et un intitulé
       qui commence en minuscule se lit comme la suite de la ligne
       précédente. La maquette l'écrivait ainsi. */
    expect(dateLongue('2026-09-12')).toBe('Samedi 12 septembre');
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

describe('la teinte d’une catégorie vient de la base', () => {
  /* CE QUE CE BLOC DISAIT AVANT, et pourquoi c'était le défaut.

     Il vérifiait un tableau de couleurs écrit dans le code. Ce
     tableau n'avait qu'UNE entrée : « Changement d'horaire » en
     orange. Les quatre autres catégories, et toutes celles que le
     club inventerait, tombaient sur le vert du club — cinq pastilles
     vertes qui ne distinguent rien.

     Les couleurs vivent maintenant dans la table « categories », que
     le club tient lui-même. */
  const CATS = [
    { id: 'c1', genre: 'actualite' as const, nom: 'Changement d’horaire',
      couleur: '#B0530F', rang: 1, actif: true },
    { id: 'c2', genre: 'actualite' as const, nom: 'Sortie',
      couleur: '#1F5C8B', rang: 2, actif: true },
    { id: 'c3', genre: 'album' as const, nom: 'Sortie',
      couleur: '#A33A2A', rang: 1, actif: true }
  ];

  test('chaque catégorie porte SA couleur, pas celle du club', () => {
    expect(teinter(CATS, 'Changement d’horaire')[0]).toBe('#B0530F');
    expect(teinter(CATS, 'Sortie')[0]).toBe('#1F5C8B');
  });

  test('le genre départage deux catégories de même nom', () => {
    /* Le casier et l'album ont chacun une « Sortie », et rien
       n'oblige le club à leur donner la même couleur. */
    expect(teinter(CATS, 'Sortie', 'actualite')[0]).toBe('#1F5C8B');
    expect(teinter(CATS, 'Sortie', 'album')[0]).toBe('#A33A2A');
  });

  test('une catégorie inconnue reste LISIBLE, en vert du club', () => {
    /* Ce n'est pas une anomalie : une actualité publiée sous une
       rubrique ensuite retirée garde son nom, et doit s'afficher. */
    expect(teinter(CATS, 'n’importe quoi')).toEqual(['#12613C', '#E3ECE8']);
    expect(teinter(undefined, 'Sortie')).toEqual(['#12613C', '#E3ECE8']);
  });

  test('le fond se DÉDUIT du trait, on ne le demande pas au club', () => {
    /* Réclamer deux couleurs qui s'accordent, c'est le meilleur
       moyen d'obtenir du rouge vif sur du bleu vif. */
    expect(eclaircir('#B0530F')).toBe('#F6EAE2');
    /* Le noir éclairci à 88 % n'est pas noir : c'est un gris très
       clair, donc un fond sur lequel du noir se lit. */
    expect(eclaircir('#000000')).toBe('#E0E0E0');
    /* Et une couleur illisible ne casse pas l'écran. */
    expect(eclaircir('pas une couleur')).toBe('#E8F1EC');
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

/* ============================================================
   L'HEURE D'UN ÉVÉNEMENT.

   « date_evt » est une DATE sans heure : à quelle heure on part se
   disait dans le texte libre, ce qui marche tant que quelqu'un pense
   à l'écrire et tant que personne ne le cherche dans dix lignes.
   ============================================================ */
describe('heureFr', () => {
  test('« 06:00:00 » s’écrit « 6h00 »', () => {
    /* Sans le zéro de tête : « 06h00 » se lit comme un horaire de
       train, pas comme un rendez-vous au club. */
    expect(heureFr('06:00:00')).toBe('6h00');
    expect(heureFr('18:30:00')).toBe('18h30');
  });

  test('les minutes gardent le leur', () => {
    /* « 17h5 » n'est pas une heure. */
    expect(heureFr('17:05:00')).toBe('17h05');
  });

  test('sans heure, rien — et non « nullh00 »', () => {
    expect(heureFr(null)).toBeNull();
    expect(heureFr(undefined)).toBeNull();
    expect(heureFr('')).toBeNull();
  });
});

describe('creneau', () => {
  test('deux heures donnent un intervalle', () => {
    expect(creneau('06:00:00', '18:00:00')).toBe('De 6h00 à 18h00');
  });

  test('une seule heure donne un début, pas un faux intervalle', () => {
    /* « De 6h00 à » serait pire que rien. */
    expect(creneau('06:00:00', null)).toBe('À 6h00');
  });

  test('aucune heure ne produit aucune ligne', () => {
    /* La ligne est masquée à l'écran plutôt qu'affichée vide : la
       plupart des annonces n'ont pas de rendez-vous. */
    expect(creneau(null, null)).toBeNull();
    expect(creneau(null, '18:00:00')).toBeNull();
  });
});
