/* ============================================================
   La recherche, les grades abrégés, et l'onglet actif.
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { correspond, courtGrade, enLettres, pliage } from '../src/services/texte';
import { ongletDe } from '../src/ui/Onglets';

describe('pliage', () => {
  test('retire les accents et met en minuscules', () => {
    expect(pliage('RAZAFIMAHATRATRA')).toBe('razafimahatratra');
    expect(pliage('Générosité')).toBe('generosite');
  });

  test('les noms malgaches accentués se cherchent sans accents', () => {
    /* Un clavier de téléphone malgache ne pose pas toujours les
       accents : chercher « Andrianjafy » doit trouver
       « Andrianjafÿ » comme l'inverse. */
    expect(pliage('Tokiniaîna')).toBe(pliage('Tokiniaina'));
  });
});

describe('correspond', () => {
  test('une requête vide accepte tout', () => {
    /* Un filtre de recherche ne doit pas vider la liste avant qu'on
       ait tapé quoi que ce soit. */
    expect(correspond('', 'RAKOTONDRABE', 'Nirina')).toBe(true);
    expect(correspond('   ', 'RAKOTONDRABE', 'Nirina')).toBe(true);
  });

  test('trouve dans le nom comme dans le prénom', () => {
    expect(correspond('nirina', 'RAKOTONDRABE', 'Nirina')).toBe(true);
    expect(correspond('rakoto', 'RAKOTONDRABE', 'Nirina')).toBe(true);
  });

  test('ignore la casse et les accents', () => {
    expect(correspond('MIORA', 'RAZAFIMAHATRATRA', 'Miora')).toBe(true);
    expect(correspond('razafimahatratra', 'RAZAFIMAHATRATRA', 'Miora')).toBe(true);
  });

  test('cherche aussi dans le matricule', () => {
    expect(correspond('f04x042', 'RAKOTONDRABE', 'Nirina', 'F04x042')).toBe(true);
  });

  test('rejette ce qui ne correspond pas', () => {
    expect(correspond('zzz', 'RAKOTONDRABE', 'Nirina')).toBe(false);
  });

  test('les champs absents ne cassent rien', () => {
    /* Un membre sans matricule ne doit pas faire apparaître
       « undefined » dans le texte cherché — et donc être trouvé en
       tapant « undefined ». */
    expect(correspond('undefined', 'RAKOTONDRABE', null, undefined)).toBe(false);
  });
});

describe('courtGrade', () => {
  test('retire « Ceinture » et garde la majuscule', () => {
    /* Sans la majuscule, la puce affiche « verte », qui se lit
       comme une faute. */
    expect(courtGrade('Ceinture verte')).toBe('Verte');
    expect(courtGrade('Ceinture blanche')).toBe('Blanche');
  });

  test('un grade qui ne commence pas par « Ceinture » est gardé tel quel', () => {
    /* Le club peut inventer « Dan 1 » : rien ne doit être tronqué. */
    expect(courtGrade('Dan 1')).toBe('Dan 1');
  });

  test('un nom vide ne fait pas planter la puce', () => {
    expect(courtGrade('')).toBe('');
  });
});

describe('ongletDe', () => {
  test('un onglet s’allume sur lui-même', () => {
    expect(ongletDe('/accueil')).toBe('/accueil');
    expect(ongletDe('/messages')).toBe('/messages');
  });

  test('un écran enfant allume son onglet', () => {
    expect(ongletDe('/etudiants/42')).toBe('/etudiants');
    expect(ongletDe('/casier/7/participer')).toBe('/casier');
    expect(ongletDe('/messages/s1')).toBe('/messages');
  });

  test('les écrans rattachés allument le bon onglet', () => {
    /* La maquette montre « Accueil » en vert sur l'écran du Club :
       sans cette table, aucun onglet ne s'allumait et l'on ne savait
       plus où l'on était. */
    expect(ongletDe('/club')).toBe('/accueil');
    expect(ongletDe('/notifications')).toBe('/accueil');
    expect(ongletDe('/carte')).toBe('/accueil');
    expect(ongletDe('/motdepasse')).toBe('/etudiants');
    expect(ongletDe('/maitres')).toBe('/messages');
  });

  test('un écran hors onglets n’en allume aucun', () => {
    /* L'administration occupe tout l'écran : elle n'a pas de barre
       du bas, et n'a donc aucun onglet à allumer. */
    expect(ongletDe('/admin')).toBe('');
    expect(ongletDe('/admin/comptes')).toBe('');
  });

  test('« /album » n’est pas confondu avec « /albums »', () => {
    /* Un préfixe naïf ferait allumer l'onglet Album sur
       /admin/albums. Le test le prouve. */
    expect(ongletDe('/album')).toBe('/album');
    expect(ongletDe('/admin/albums')).toBe('');
  });
});

describe('enLettres', () => {
  test('sous dix, le nombre s’écrit en toutes lettres', () => {
    /* « Trois places au total avec vous » contre « 3 places » : dans
       une phrase, l'usage français écrit les petits nombres en
       lettres, et la maquette le faisait. */
    expect(enLettres(3)).toBe('trois');
    expect(enLettres(9)).toBe('neuf');
  });

  test('à partir de dix, le chiffre redevient plus lisible', () => {
    expect(enLettres(10)).toBe('10');
    expect(enLettres(43)).toBe('43');
  });

  test('« un » s’accorde, et lui seul', () => {
    /* « Un places au total » serait pire que le chiffre qu'on
       remplaçait. */
    expect(enLettres(1)).toBe('un');
    expect(enLettres(1, { feminin: true })).toBe('une');
    expect(enLettres(2, { feminin: true })).toBe('deux');
  });

  test('la majuscule est demandée, jamais imposée', () => {
    /* Le mot commence parfois une phrase et parfois non : le décider
       ici obligerait l'appelant à défaire. */
    expect(enLettres(3, { majuscule: true })).toBe('Trois');
    expect(enLettres(1, { majuscule: true, feminin: true })).toBe('Une');
  });

  test('un nombre qui n’est pas un entier positif reste tel quel', () => {
    expect(enLettres(-1)).toBe('-1');
    expect(enLettres(2.5)).toBe('2.5');
  });
});
