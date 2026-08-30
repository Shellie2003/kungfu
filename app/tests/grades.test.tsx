/* ============================================================
   Les grades du club.

   Ils vivaient en base et ne se modifiaient que par le tableau de
   bord Supabase — c'est-à-dire par le développeur. Un club qui
   renomme une ceinture devait écrire à quelqu'un et attendre :
   autant dire que cela ne se serait pas fait.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminGrades } from '../src/ecrans/admin/Grades';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { rendre } from './rendu';

const GRADES = [
  { id: 'gb', nom: 'Ceinture blanche', couleur: '#D8DEDA', rang: 1, actif: true },
  { id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true },
  { id: 'go', nom: 'Ceinture orange', couleur: '#D08A2A', rang: 3, actif: false }
];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('la liste', () => {
  test('montre AUSSI les grades retirés', async () => {
    /* Sans eux, un grade retiré par erreur deviendrait
       irrécupérable depuis l'application. */
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    expect(await screen.findByText('Ceinture orange')).toBeInTheDocument();
    expect(screen.getByText(/retiré des listes/)).toBeInTheDocument();
  });

  test('demande donc la table SANS filtrer sur « actif »', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });
    await screen.findByText('Ceinture verte');

    expect(derniere('grades', 'GET')?.parametres.get('actif')).toBeNull();
  });
});

describe('créer un grade', () => {
  test('refuse un nom vide, sans rien écrire', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await userEvent.click(await screen.findByRole('button', { name: 'Créer ce grade' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('obligatoire');
    expect(derniere('grades')).toBeUndefined();
  });

  test('le rang proposé se place APRÈS le dernier', async () => {
    /* On ajoute presque toujours une ceinture plus haute ; proposer
       0 obligerait à renuméroter toute la liste. */
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await waitFor(() => expect(screen.getByLabelText('Rang')).toHaveValue(5));
  });

  test('crée avec son nom, sa couleur et son rang', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), '  Ceinture bleue  ');
    await userEvent.click(screen.getByRole('button', { name: 'Créer ce grade' }));

    await waitFor(() =>
      expect(derniere('grades')?.corps).toMatchObject({ nom: 'Ceinture bleue', rang: 5 })
    );
  });
});

describe('modifier un grade', () => {
  test('un appui charge le grade dans le formulaire', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await userEvent.click(await screen.findByLabelText('Modifier Ceinture verte'));

    expect(screen.getByLabelText(/^Nom/)).toHaveValue('Ceinture verte');
    expect(screen.getByLabelText('Rang')).toHaveValue(4);
  });

  test('l’enregistrement REMPLACE, il ne crée pas un doublon', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await userEvent.click(await screen.findByLabelText('Modifier Ceinture verte'));
    await userEvent.clear(screen.getByLabelText(/^Nom/));
    await userEvent.type(screen.getByLabelText(/^Nom/), 'Ceinture verte 1re série');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() =>
      expect(derniere('grades', 'PATCH')?.corps).toMatchObject({
        nom: 'Ceinture verte 1re série'
      })
    );
    expect(derniere('grades', 'POST')).toBeUndefined();
  });
});

describe('retirer un grade', () => {
  test('DÉSACTIVE plutôt que de supprimer', async () => {
    /* Des fiches y sont rattachées : une suppression casserait leur
       historique. */
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await screen.findByText('Ceinture verte');
    await userEvent.click(screen.getAllByText('Retirer')[0]!);

    await waitFor(() =>
      expect(derniere('grades', 'PATCH')?.corps).toEqual({ actif: false })
    );
    expect(derniere('grades', 'DELETE')).toBeUndefined();
  });

  test('un grade retiré se remet en place', async () => {
    poser({ grades: GRADES });
    rendre(<AdminGrades />, { route: '/admin/grades/liste' });

    await userEvent.click(await screen.findByText('Remettre'));
    await waitFor(() =>
      expect(derniere('grades', 'PATCH')?.corps).toEqual({ actif: true })
    );
  });
});
