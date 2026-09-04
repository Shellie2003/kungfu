/* ============================================================
   La place occupée, et le rangement.

   « Tôt ou tard la base de données sera saturée et pleine, alors on
   doit anticiper cela — par exemple on crée plusieurs comptes de
   base, et si l'autre sera plein, l'autre s'active automatiquement. »

   La mesure a montré que ce serait résoudre le mauvais problème :
   les vingt tables du club pèsent 1,26 Mo, la croissance est de
   l'ordre de quinze mégaoctets par an, le palier gratuit en offre
   cinq cents. La base est la DERNIÈRE chose qui se remplira.

   Ces tests tiennent donc ce qui a été fait à la place : voir venir,
   et ranger — et surtout, ce que le rangement n'emporte JAMAIS.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminOccupation } from '../src/ecrans/admin/Occupation';
import { poids } from '../src/services/occupation';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, rendre } from './rendu';

const OCCUPATION = [
  { quoi: 'base', octets: 13257875, lignes: null },
  { quoi: 'tables', octets: 1294336, lignes: null },
  { quoi: 'seau:album', octets: 3141606, lignes: 10 },
  { quoi: 'seau:pieces', octets: 4144355, lignes: 7 },
  { quoi: 'lignes:messages', octets: null, lignes: 15 },
  { quoi: 'lignes:journal', octets: null, lignes: 22 }
];

const A_RANGER = [
  { quoi: 'journal', lignes: 8 },
  { quoi: 'notifications', lignes: 3 },
  { quoi: 'messages', lignes: 0 }
];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('lire un poids', () => {
  test('les octets bruts ne se lisent pas', () => {
    /* Personne ne sait dire de tête si 13 257 875 est beaucoup. */
    expect(poids(13257875)).toBe('13 Mo');
    expect(poids(1294336)).toBe('1.2 Mo');
    expect(poids(4096)).toBe('4 ko');
    expect(poids(512)).toBe('512 o');
  });

  test('au-delà du millier de mégaoctets, on passe au gigaoctet', () => {
    expect(poids(1024 * 1024 * 1024)).toBe('1.0 Go');
    expect(poids(2.5 * 1024 * 1024 * 1024)).toBe('2.5 Go');
  });
});

describe('la jauge', () => {
  test('montre ce qu’on occupe ET sur quoi', async () => {
    /* Un chiffre sans dénominateur ne dit rien : « 13 Mo » n'inquiète
       ou ne rassure que rapporté aux cinq cents du palier. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    expect(await screen.findByText('13 Mo sur 500 Mo')).toBeInTheDocument();
    /* Les fichiers : les deux seaux additionnés. */
    expect(screen.getByText('6.9 Mo sur 1.0 Go')).toBeInTheDocument();
  });

  test('le pourcentage est ANNONCÉ, pas seulement colorié', async () => {
    /* Une barre colorée ne dit rien à qui ne la voit pas, et ce
       serait le seul chiffre de l'écran qu'on ne pourrait pas
       entendre. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    const jauge = await screen.findByRole('meter', { name: 'Base de données' });
    expect(jauge).toHaveAttribute('aria-valuetext', '3 %');
  });

  test('elle DIT ce qu’elle ne sait pas mesurer', async () => {
    /* Le trafic sortant est une mesure du service, pas une donnée de
       la base. Un chiffre inventé sur une jauge est pire que pas de
       jauge du tout. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    expect(await screen.findByText(/Le trafic sortant/)).toBeInTheDocument();
  });
});

describe('le rangement', () => {
  test('dit ce qu’il emporterait AVANT de l’emporter', async () => {
    /* Un rangement qui ne l'annonce pas ne se lance qu'une fois — et
       l'on découvre après. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    expect(await screen.findByText('Ranger 11 lignes')).toBeInTheDocument();
  });

  test('les MESSAGES ne sont pas rangés par défaut', async () => {
    /* Une conversation appartient à ceux qui l'ont eue. L'effacer
       sans qu'on l'ait décidé serait le pire de ce que cette
       application peut faire. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    await screen.findByText('Ranger 11 lignes');
    const demande = derniere('rpc:a_ranger');
    expect(demande?.corps).toMatchObject({
      mois_journal: 12,
      mois_notifs: 3,
      mois_messages: null
    });
  });

  test('il faut confirmer : c’est définitif', async () => {
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByText('Ranger 11 lignes'));
    expect(screen.getByText(/C’est définitif/)).toBeInTheDocument();
    /* Rien n'est parti tant qu'on n'a pas dit oui. */
    expect(derniere('rpc:ranger')).toBeUndefined();
  });

  test('confirmé, il part avec les durées choisies', async () => {
    poser({
      'rpc:occupation': OCCUPATION,
      'rpc:a_ranger': A_RANGER,
      'rpc:ranger': [{ quoi: 'journal', lignes: 8, chemins: null }]
    });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByText('Ranger 11 lignes'));
    await userEvent.click(screen.getByRole('button', { name: 'Oui, ranger' }));

    await waitFor(() => expect(derniere('rpc:ranger')).toBeDefined());
    expect(derniere('rpc:ranger')?.corps).toMatchObject({
      mois_journal: 12,
      mois_notifs: 3,
      mois_messages: null
    });
  });

  test('une durée vide ne range PAS cette catégorie', async () => {
    /* Vider le champ, c'est dire « n'y touche pas » — et non « range
       tout », qui serait le contraire et la faute la plus coûteuse
       que cet écran puisse commettre. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    const champ = await screen.findByLabelText('Journal d’accès (mois)');
    await userEvent.clear(champ);

    await waitFor(() =>
      expect(derniere('rpc:a_ranger')?.corps).toMatchObject({ mois_journal: null })
    );
  });

  test('l’écran rappelle ce qui ne s’efface JAMAIS', async () => {
    /* Les présences sont le registre d'assiduité sur lequel se
       décident les passages de grade : les effacer effacerait la
       raison d'une ceinture. */
    poser({ 'rpc:occupation': OCCUPATION, 'rpc:a_ranger': A_RANGER });
    rendre(<AdminOccupation />, { route: '/admin/occupation', profil: PROFIL_ADMIN });

    const garde = await screen.findByText(/ne s’efface/);
    expect(garde.textContent).toMatch(/présences/);
    expect(garde.textContent).toMatch(/fiches/);
  });
});
