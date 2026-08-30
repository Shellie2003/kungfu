/* ============================================================
   La modération.

   Le club compte des mineurs, et l'application PROMET une
   modération à leurs parents. Une promesse qui tombe dans un trou
   est pire que pas de promesse : ces tests vérifient qu'elle est
   tenue.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Moderation } from '../src/ecrans/Moderation';
import { Messages } from '../src/ecrans/Messages';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';
import type { Profil } from '../src/services/session';

const PROFIL_MAITRE: Profil = {
  id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery',
  role: 'maitre', grade_id: 'gn', photo: null
};

const SIGNALEMENT = {
  id: 'sg1',
  motif: 'Propos déplacés envers un plus jeune',
  cree_le: new Date().toISOString(),
  traite_le: null,
  suite: null,
  profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' },
  messages: {
    id: 'm9',
    texte: 'Ce message pose problème.',
    supprime_le: null,
    profils: { nom: 'ANDRIANJAFY', prenom: 'Tokiniaina' }
  }
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('l’écran', () => {
  test('montre le motif ET le message en cause', async () => {
    /* Résumer ou tronquer le message obligerait à ouvrir le salon
       pour juger — et l'on jugerait donc rarement. */
    poser({ signalements: [SIGNALEMENT] });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });

    expect(await screen.findByText(/Propos déplacés/)).toBeInTheDocument();
    expect(screen.getByText('Ce message pose problème.')).toBeInTheDocument();
    expect(screen.getByText('ANDRIANJAFY Tokiniaina')).toBeInTheDocument();
    expect(screen.getByText(/Signalé par RAKOTONDRABE Nirina/)).toBeInTheDocument();
  });

  test('« retirer » masque le message ET classe le signalement', async () => {
    poser({ signalements: [SIGNALEMENT] });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });

    await userEvent.click(await screen.findByRole('button', { name: 'Retirer le message' }));

    /* Suppression DOUCE : la ligne reste, seule sa date de retrait
       est posée. Un message effacé ne se défend pas — le club doit
       pouvoir expliquer sa décision à un parent. */
    await waitFor(() => {
      const masque = recues.find((r) => r.table === 'messages' && r.methode === 'PATCH');
      expect(masque?.corps).toHaveProperty('supprime_le');
    });
    expect(recues.find((r) => r.table === 'messages' && r.methode === 'DELETE')).toBeUndefined();

    await waitFor(() => {
      const classe = recues.find((r) => r.table === 'signalements' && r.methode === 'PATCH');
      expect(classe?.corps).toMatchObject({ traite_par: 'p4', suite: 'Message retiré' });
    });
  });

  test('« classer sans suite » ne touche PAS au message', async () => {
    poser({ signalements: [SIGNALEMENT] });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });

    await userEvent.click(await screen.findByRole('button', { name: 'Classer sans suite' }));

    await waitFor(() =>
      expect(derniere('signalements', 'PATCH')?.corps).toMatchObject({
        suite: 'Classé sans suite'
      })
    );
    /* Un signalement abusif ne doit pas faire disparaître un
       message légitime. */
    expect(recues.find((r) => r.table === 'messages' && r.methode === 'PATCH')).toBeUndefined();
  });

  test('un message déjà retiré ne se retire pas deux fois', async () => {
    poser({
      signalements: [{ ...SIGNALEMENT, messages: { ...SIGNALEMENT.messages, supprime_le: new Date().toISOString() } }]
    });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });

    expect(await screen.findByText('Message déjà retiré.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retirer le message' })).toBeDisabled();
  });

  test('un signalement traité montre sa suite, sans boutons', async () => {
    poser({
      signalements: [{
        ...SIGNALEMENT,
        traite_le: new Date().toISOString(),
        suite: 'Message retiré'
      }]
    });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });
    /* L'écran s'ouvre sur « à traiter » ; on bascule. */
    await userEvent.click(await screen.findByRole('button', { name: 'Traités' }));

    /* « Message retiré » paraît aussi dans la carte d'explication du
       bas ; on vise la ligne du signalement, qui commence par
       « Traité ». */
    await waitFor(() => expect(screen.getByText(/^Traité .* · Message retiré$/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Classer sans suite' })).not.toBeInTheDocument();
  });

  test('rien en attente le dit, plutôt que d’afficher le vide', async () => {
    poser({ signalements: [] });
    rendre(<Moderation />, { profil: PROFIL_MAITRE });
    expect(await screen.findByText('Aucun signalement en attente.')).toBeInTheDocument();
  });
});

describe('la porte depuis la messagerie', () => {
  test('un maître voit le décompte et peut entrer', async () => {
    poser({ salons: [], signalements: [SIGNALEMENT] });
    rendre(<Messages />, { profil: PROFIL_MAITRE });
    expect(await screen.findByRole('button', { name: /Signalements/ })).toBeInTheDocument();
  });

  test('un élève ne voit que l’explication, sans porte', async () => {
    /* Il n'y a rien à lui cacher : la base ne lui rendrait que ses
       propres signalements. Mais lui proposer un écran de
       modération n'aurait aucun sens. */
    poser({ salons: [], signalements: [] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    await screen.findByText('Signaler un message');
    expect(screen.queryByRole('button', { name: /Signalements/ })).not.toBeInTheDocument();
  });
});
