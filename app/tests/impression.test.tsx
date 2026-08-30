/* ============================================================
   La planche d'impression des cartes.

   Écran 15 de la maquette, et une promesse écrite dans
   l'application elle-même : la carte de membre annonçait que
   « l'impression viendra avec l'écran d'administration ».

   Ce que ces tests NE vérifient pas, et qu'il ne faut pas leur
   demander : que la planche s'imprime bien. jsdom ne met pas en
   page, ne connaît pas les millimètres et n'imprime rien. Le format
   se vérifie en imprimant une feuille et en la mesurant à la règle.
   Ce qui se vérifie ici, c'est ce qui ENTRE sur la planche.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminImpression } from '../src/ecrans/admin/Impression';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { rendre } from './rendu';

const GRADES = [
  { id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true },
  { id: 'gj', nom: 'Ceinture jaune', couleur: '#D8A93A', rang: 2, actif: true }
];

/* Douze membres : c'est le nombre qui compte, parce qu'il oblige à
   une seconde page. Une planche de soixante-quatre cartes sur une
   seule page A4 serait coupée par le navigateur en plein milieu
   d'une carte. */
const MEMBRES = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`,
  numero: `F04x${String(i + 1).padStart(3, '0')}`,
  nom: `NOM${i}`,
  prenom: `Prenom${i}`,
  photo: null,
  grades: i % 2 === 0 ? GRADES[0] : GRADES[1]
}));

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser({ profils: MEMBRES, grades: GRADES, reglages: [] });
});

describe('la planche', () => {
  test('découpe en pages de DIX, comme la maquette', async () => {
    rendre(<AdminImpression />, { route: '/admin/impression' });

    expect(await screen.findByText(/12 cartes · 2 pages/)).toBeInTheDocument();
  });

  test('porte les VRAIS membres, avec leur matricule', async () => {
    /* La maquette montrait dix élèves inventés. */
    rendre(<AdminImpression />, { route: '/admin/impression' });

    expect(await screen.findByText('NOM0')).toBeInTheDocument();
    expect(screen.getByText('F04x001')).toBeInTheDocument();
  });

  test('engendre un vrai code QR par carte, pas un motif', async () => {
    /* C'est la différence avec la maquette, et elle compte : le code
       se scanne pour pointer une présence. */
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await screen.findByText('NOM0');
    await waitFor(() => {
      const codes = document.querySelectorAll('.pc__qr svg');
      expect(codes.length).toBe(12);
    });
  });

  test('le filtre par grade réduit la planche', async () => {
    /* On réimprime rarement le club entier, souvent un groupe. */
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await screen.findByText('NOM0');
    /* La puce du filtre, pas l'étiquette de grade d'une carte : le
       même texte figure aux deux endroits. */
    await userEvent.click(screen.getByRole('button', { name: 'Ceinture jaune' }));

    expect(await screen.findByText(/6 cartes · 1 page/)).toBeInTheDocument();
  });

  test('retirer une carte ne touche PAS la base', async () => {
    /* C'est la planche qui change, pas les fiches. */
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await userEvent.click(await screen.findByLabelText('Retirer NOM0 Prenom0 de la planche'));

    expect(await screen.findByText(/11 cartes/)).toBeInTheDocument();
    /* Aucune écriture : ni suppression, ni modification de fiche. */
    const { recues } = await import('./serveur');
    expect(recues.some((r) => r.table === 'profils' && r.methode !== 'GET')).toBe(false);
  });

  test('les cartes retirées se remettent d’un appui', async () => {
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await userEvent.click(await screen.findByLabelText('Retirer NOM0 Prenom0 de la planche'));
    await userEvent.click(await screen.findByText('Remettre les 1 retirées'));

    expect(await screen.findByText(/12 cartes/)).toBeInTheDocument();
  });

  test('le bouton demande l’impression au navigateur', async () => {
    /* jsdom ne l'implémente pas : on vérifie que l'écran l'appelle,
       ce qui est tout ce que l'application contrôle. */
    const imprimer = vi.fn();
    vi.stubGlobal('print', imprimer);
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await userEvent.click(
      await screen.findByRole('button', { name: /Imprimer ou enregistrer en PDF/ })
    );
    expect(imprimer).toHaveBeenCalled();
  });

  test('sans membre, le bouton reste inerte', async () => {
    poser({ profils: [] });
    rendre(<AdminImpression />, { route: '/admin/impression' });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Imprimer ou enregistrer en PDF/ })
      ).toBeDisabled()
    );
  });
});
