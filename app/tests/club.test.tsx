/* ============================================================
   L'écran du Club, modifiable depuis l'écran du Club.

   Tout ce qu'on lit ici se changeait déjà — mais dans l'écran
   d'administration, derrière dix champs de texte. Le club a demandé
   de pouvoir le faire à l'endroit où il le lit. Sauf les valeurs,
   qui ne se changeaient nulle part : elles étaient écrites dans le
   code.

   Ce que ces tests tiennent :

   — le crayon ne s'affiche qu'à qui peut ÉCRIRE, et cela diffère
     selon la ligne : la photo du club est ouverte à l'encadrement
     (migration 0013), le reste est réservé à l'administration.
     Montrer un crayon qui mène à un refus serait pire que rien ;

   — ce qui est saisi PART, sous la bonne clé ;

   — un refus du serveur se LIT. C'est le point le plus important du
     fichier : l'enregistrement des réglages écrivait sans demander
     ce qui avait été écrit, si bien qu'un refus des règles d'accès
     revenait sans erreur et l'écran annonçait « Enregistré ».
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Club } from '../src/ecrans/Club';
import { ecrireValeurs, lireValeurs, VALEURS_PAR_DEFAUT } from '../src/services/club';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, PROFIL_MAITRE, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

const base = (reglages: { cle: string; valeur: string }[] = []) =>
  poser({ reglages, horaires: [] });

describe('les valeurs du club se lisent et s’écrivent', () => {
  test('vides, ce sont les trois d’origine — jamais une section vide', () => {
    expect(lireValeurs(undefined)).toEqual(VALEURS_PAR_DEFAUT);
    expect(lireValeurs('')).toEqual(VALEURS_PAR_DEFAUT);
    expect(lireValeurs('   \n  \n ')).toEqual(VALEURS_PAR_DEFAUT);
  });

  test('« Titre : description », une par ligne, dans l’ordre', () => {
    expect(lireValeurs('Respect : Du maître.\nConstance : La régularité.')).toEqual([
      ['Respect', 'Du maître.'],
      ['Constance', 'La régularité.']
    ]);
  });

  test('seul le PREMIER deux-points sépare', () => {
    /* « Respect : du maître, du lieu : partout » a une description
       qui contient elle-même un deux-points. Couper sur le dernier,
       ou sur tous, mangerait le texte du club. */
    expect(lireValeurs('Respect : du maître, du lieu : partout')).toEqual([
      ['Respect', 'du maître, du lieu : partout']
    ]);
  });

  test('une ligne sans deux-points reste un titre seul', () => {
    expect(lireValeurs('Respect')).toEqual([['Respect', '']]);
  });

  test('écrire puis relire rend le même contenu', () => {
    const aller = ecrireValeurs(VALEURS_PAR_DEFAUT);
    expect(lireValeurs(aller)).toEqual(VALEURS_PAR_DEFAUT);
  });

  test('l’écran affiche les valeurs de la base, pas celles du code', async () => {
    base([{ cle: 'valeurs', valeur: 'Patience : Elle vient au tapis.' }]);
    rendre(<Club />, { profil: PROFIL_ELEVE });

    expect(await screen.findByText('Patience')).toBeInTheDocument();
    expect(screen.getByText('Elle vient au tapis.')).toBeInTheDocument();
    /* Et celles du code ont bien cédé la place. */
    expect(screen.queryByText('Respect')).not.toBeInTheDocument();
  });
});

describe('le crayon ne s’affiche qu’à qui peut écrire', () => {
  test('l’administration modifie tout', async () => {
    base();
    rendre(<Club />, { profil: PROFIL_ADMIN });

    expect(await screen.findByLabelText('Modifier la présentation')).toBeInTheDocument();
    expect(screen.getByLabelText('Modifier les valeurs')).toBeInTheDocument();
    expect(screen.getByLabelText('Modifier le contact')).toBeInTheDocument();
    expect(screen.getByLabelText('Modifier les entraînements')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /photo du club/i })).toBeInTheDocument();
  });

  test('le maître pose la photo du club, et RIEN d’autre', async () => {
    /* C'est exactement ce que dit la migration 0013 : l'encadrement
       tient l'image du club, pas les renseignements — ni, surtout,
       le numéro MVola qui reçoit l'argent. Un crayon de plus ici
       mènerait à un refus du serveur. */
    base();
    rendre(<Club />, { profil: PROFIL_MAITRE });

    expect(await screen.findByRole('button', { name: /photo du club/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Modifier la présentation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Modifier les valeurs')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Modifier le contact')).not.toBeInTheDocument();
  });

  test('l’élève ne modifie rien, et on lui dit pourquoi', async () => {
    base();
    rendre(<Club />, { profil: PROFIL_ELEVE });

    expect(await screen.findByText('Présentation')).toBeInTheDocument();
    expect(screen.queryByLabelText('Modifier la présentation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /photo du club/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Modifiable par l’administration').length).toBe(2);
  });
});

describe('ce qui est saisi part sous la bonne clé', () => {
  test('la présentation', async () => {
    base([{ cle: 'presentation', valeur: 'Ancien texte.' }]);
    rendre(<Club />, { profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByLabelText('Modifier la présentation'));

    /* La feuille s'ouvre REMPLIE : sinon « Enregistrer » effacerait
       ce qui était écrit, sans que personne l'ait demandé. */
    const zone = await screen.findByLabelText('Présentation du club');
    expect(zone).toHaveValue('Ancien texte.');

    await userEvent.clear(zone);
    await userEvent.type(zone, 'Le club enseigne le Waishi.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    const lignes = (await waitFor(() => {
      const r = derniere('reglages');
      expect(r).toBeDefined();
      return r!;
    })).corps as { cle: string; libelle: string; valeur: string }[];

    expect(lignes).toHaveLength(1);
    expect(lignes[0]!.cle).toBe('presentation');
    expect(lignes[0]!.valeur).toBe('Le club enseigne le Waishi.');
    /* Le libellé lisible, jamais la clé technique : c'est ce que
       l'administration voit dans le tableau de bord. */
    expect(lignes[0]!.libelle).toBe('Présentation longue');
  });

  test('les valeurs, une par ligne', async () => {
    base();
    rendre(<Club />, { profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByLabelText('Modifier les valeurs'));

    const zone = await screen.findByLabelText('Une valeur par ligne');
    /* Elle s'ouvre sur les valeurs affichées — celles d'origine tant
       que le club n'a rien écrit. */
    expect(zone).toHaveValue(ecrireValeurs(VALEURS_PAR_DEFAUT));

    await userEvent.clear(zone);
    await userEvent.type(zone, 'Patience : Elle vient au tapis.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    const lignes = (await waitFor(() => {
      const r = derniere('reglages');
      expect(r).toBeDefined();
      return r!;
    })).corps as { cle: string; valeur: string }[];

    expect(lignes[0]!.cle).toBe('valeurs');
    expect(lignes[0]!.valeur).toBe('Patience : Elle vient au tapis.');
  });

  test('le contact part en trois réglages d’un coup', async () => {
    base([
      { cle: 'responsable', valeur: 'Ancien' },
      { cle: 'telephone', valeur: '0340000000' },
      { cle: 'adresse', valeur: 'Analamahitsy' }
    ]);
    rendre(<Club />, { profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByLabelText('Modifier le contact'));

    const tel = await screen.findByLabelText('Téléphone');
    expect(tel).toHaveValue('0340000000');
    await userEvent.clear(tel);
    await userEvent.type(tel, '0388010853');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    const lignes = (await waitFor(() => {
      const r = derniere('reglages');
      expect(r).toBeDefined();
      return r!;
    })).corps as { cle: string; valeur: string }[];

    expect(lignes.map((l) => l.cle).sort()).toEqual(['adresse', 'responsable', 'telephone']);
    expect(lignes.find((l) => l.cle === 'telephone')?.valeur).toBe('0388010853');
    /* Les deux autres repartent INCHANGÉS, et non vidés : la feuille
       les avait recopiés à l'ouverture. */
    expect(lignes.find((l) => l.cle === 'responsable')?.valeur).toBe('Ancien');
  });
});

describe('un refus du serveur se lit', () => {
  test('l’écran ne dit pas « Enregistré » quand rien n’a été écrit', async () => {
    /* LE DÉFAUT QUE CE TEST TIENT.

       Une écriture que les règles d'accès écartent ne touche aucune
       ligne et revient SANS erreur. L'enregistrement des réglages
       n'appelait pas « .select() » : il ne pouvait donc pas
       distinguer « accepté » de « refusé », et annonçait un succès
       dans les deux cas.

       Le club aurait corrigé le numéro de téléphone, lu
       « Enregistré », et l'ancien numéro serait resté affiché aux
       soixante-quatre membres.

       Le simulateur rend ici un tableau vide pour l'écriture — ce
       que rend le vrai serveur quand la règle écarte la ligne. */
    poser({ reglages: [], horaires: [], 'reglages:POST': [] });
    rendre(<Club />, { profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByLabelText('Modifier la présentation'));
    const zone = await screen.findByLabelText('Présentation du club');
    await userEvent.type(zone, 'Un texte.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText(/n’a pas accepté/)).toBeInTheDocument();
    expect(screen.queryByText('Enregistré.')).not.toBeInTheDocument();
    /* Et la feuille RESTE ouverte : la refermer emporterait le texte
       que la personne vient d'écrire. */
    expect(screen.getByLabelText('Présentation du club')).toHaveValue('Un texte.');
  });

  test('accepté, l’écran le dit et referme la feuille', async () => {
    base();
    rendre(<Club />, { profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByLabelText('Modifier la présentation'));
    await userEvent.type(await screen.findByLabelText('Présentation du club'), 'Un texte.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Enregistré.')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByLabelText('Présentation du club')).not.toBeInTheDocument()
    );
  });
});
