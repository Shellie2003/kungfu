/* ============================================================
   LES IDENTIFIANTS ENGENDRÉS À L'INSCRIPTION : ce qu'on en fait
   ensuite.

   « Puis l'application génère automatiquement les infos de connexion
   de ce membre créé. »

   L'engendrement lui-même est déjà tenu par super-admin.test.tsx :
   le matricule vient de la base, le mot de passe du serveur, et si le
   compte échoue la fiche reste. Ce fichier-ci tient ce qui manquait :
   la TRANSMISSION.

   ------------------------------------------------------------
   POURQUOI C'EST UN SUJET À PART ENTIÈRE

   Le mot de passe est montré UNE FOIS. Il n'est stocké en clair nulle
   part — ni dans l'écran, ni en base, ni dans un journal. Il fallait
   donc lire douze caractères tirés au sort sur l'écran d'un
   téléphone et les retaper dans un message.

   C'est le seul geste de l'application où une faute de frappe ne se
   rattrape pas en réessayant : le mot de passe ne repasse plus, il
   faut le réinitialiser et rappeler le membre. Un samedi matin, avant
   l'entraînement, cela veut dire que quelqu'un n'entre pas.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminFiche } from '../src/ecrans/admin/Fiche';
import { AdminComptes } from '../src/ecrans/admin/Comptes';
import { brancherServeur, poser, reinitialiser } from './serveur';
/* Le profil du super administrateur est celui que tous les autres
   essais emploient : le redéclarer ici le ferait diverger en
   silence le jour où « Profil » gagne un champ. */
import { PROFIL_SUPER, rendre } from './rendu';

const AVEC_COMPTE = {
  'fonction:comptes': { motDePasse: 'Kf7mQ2pXwR4t' },
  'rpc:prochain_numero': 'F04x065',
  profils: [{ id: 'neuf', numero: 'F04x065' }],
  grades: []
};

/* Le presse-papier n'existe pas dans jsdom : on le pose, et l'on
   regarde ce qu'on lui a donné. C'est justement ce qui compte —
   le contenu exact du message qu'on enverra. */
let copie: string[] = [];
function brancherPressePapier() {
  copie = [];
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(async (t: string) => { copie.push(t); }) },
    configurable: true
  });
}

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  brancherPressePapier();
});

describe('à l’inscription', () => {
  async function inscrire() {
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });
    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));
  }

  test('le panneau des identifiants s’ANNONCE', async () => {
    /* Il apparaît au bas d'un long formulaire qui vient de se vider
       sous les doigts. Sans annonce, quelqu'un qui n'a pas les yeux
       dessus ne sait pas que le mot de passe est là — et il ne
       repassera pas. */
    await inscrire();
    const panneau = await screen.findByRole('status');
    expect(panneau).toHaveTextContent('F04x065');
    expect(panneau).toHaveTextContent('Kf7mQ2pXwR4t');
  });

  test('copie le MATRICULE et le mot de passe ensemble, prêts à envoyer', async () => {
    /* Les deux, parce que c'est ce couple qu'on transmet : un mot de
       passe seul ne dit pas à qui il appartient, et le membre se
       connecte par matricule, jamais par son nom. */
    await inscrire();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Copier les identifiants de F04x065' })
    );

    await waitFor(() => expect(copie).toHaveLength(1));
    expect(copie[0]).toContain('F04x065');
    expect(copie[0]).toContain('Kf7mQ2pXwR4t');
    /* Nommé, pour que celui qui le reçoit sache d'où cela vient. */
    expect(copie[0]).toContain('Kung-fu Waishi');
  });

  test('le bouton dit que c’est copié, puis se retait', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      await inscrire();
      const bouton = await screen.findByRole('button', {
        name: 'Copier les identifiants de F04x065'
      });
      await userEvent.click(bouton);
      expect(await screen.findByText('Copié')).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(2100);
      await waitFor(() => expect(screen.queryByText('Copié')).toBeNull());
    } finally {
      vi.useRealTimers();
    }
  });

  test('si le presse-papier refuse, le bouton ne MENT pas', async () => {
    /* Un bouton qui dit « Copié » sans avoir copié est pire que pas
       de bouton du tout : on colle un message vide au membre et l'on
       s'en aperçoit quand il ne peut pas entrer. Certaines WebView
       anciennes n'ont pas « navigator.clipboard » ; le repli existe,
       et quand il échoue aussi, on le dit. */
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = vi.fn(() => false);

    await inscrire();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Copier les identifiants de F04x065' })
    );
    expect(await screen.findByText('Copie impossible')).toBeInTheDocument();
  });

  test('sans compte créé, il n’y a RIEN à copier', async () => {
    /* La fiche est là, le compte non : proposer de copier des
       identifiants qui n'existent pas enverrait un message vide. */
    poser({
      ...AVEC_COMPTE,
      'fonction:comptes': { statut: 409, message: 'Cette fiche a déjà un compte.' }
    });
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });
    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    expect(await screen.findByText(/n’a pas pu l’être/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Copier les identifiants/ })).toBeNull();
  });
});

describe('depuis « Comptes et accès »', () => {
  const MEMBRES = [
    {
      id: 'p1',
      numero: 'F04x042',
      nom: 'RANDRIA',
      prenom: 'Koto',
      role: 'eleve',
      actif: true,
      compte_id: null,
      grades: null
    }
  ];

  test('le mot de passe réinitialisé se copie aussi, avec son matricule', async () => {
    /* Il était noyé dans une phrase — « Mot de passe : Kf7mQ2pXwR4t —
       notez-le maintenant » — donc à recopier à la main. C'est le
       chemin de rattrapage du samedi matin : celui où l'on est
       pressé, et où l'on se trompe. */
    poser({
      profils: MEMBRES,
      'fonction:comptes': { motDePasse: 'Kf7mQ2pXwR4t' }
    });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    await userEvent.click(await screen.findByRole('button', { name: 'Créer le compte' }));

    const panneau = await screen.findByRole('status');
    expect(panneau).toHaveTextContent('Kf7mQ2pXwR4t');

    await userEvent.click(
      screen.getByRole('button', { name: 'Copier les identifiants de F04x042' })
    );
    await waitFor(() => expect(copie).toHaveLength(1));
    expect(copie[0]).toContain('F04x042');
    expect(copie[0]).toContain('Kf7mQ2pXwR4t');
  });
});
