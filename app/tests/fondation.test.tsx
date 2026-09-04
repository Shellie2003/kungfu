/* ============================================================
   La fondation du club : le premier compte se crée lui-même, puis
   l'inscription se ferme.

   « Je veux que le super admin crée son compte via inscription ; une
   fois créé, la création du compte par inscription sera coupée. »

   ------------------------------------------------------------
   CE QUE CES TESTS TIENNENT, ET CE QU'ILS NE TIENNENT PAS

   Ils tiennent l'ÉCRAN : ce qui est proposé, ce qui est envoyé, ce
   qui est affiché ensuite.

   Ils ne tiennent PAS le verrou. Le verrou est dans la base — une
   ligne dont la clé est primaire, plus l'existence d'un super
   administrateur — et il se vérifie sur un vrai PostgreSQL, pas
   contre un serveur simulé qui n'applique aucune règle. Écrire ici
   un test « l'inscription est fermée » donnerait l'illusion de
   vérifier ce que seul le serveur décide : le pire des deux mondes.

   Ce que ces tests garantissent en revanche, et qui compte : l'écran
   OBÉIT au serveur. Il ne propose l'inscription que si la base dit
   qu'elle est ouverte, et il rend le refus tel quel.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Connexion } from '../src/ecrans/Connexion';
import { Fondation } from '../src/ecrans/Fondation';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

const CONNECTER = () => Promise.resolve({ ok: true as const });

describe('l’écran de connexion', () => {
  test('ne propose RIEN quand le club a déjà son administrateur', async () => {
    /* C'est l'état de toute la vie du club sauf un jour. Le lien
       visible en permanence serait une invitation permanente à
       essayer. */
    rendre(<Connexion connecter={CONNECTER} />, { profil: null });

    expect(screen.queryByRole('button', { name: 'Créer le compte du club' })).toBeNull();
    expect(screen.getByText(/Demandez au responsable du club/)).toBeInTheDocument();
  });

  test('propose la fondation quand la base dit que la porte est ouverte', async () => {
    /* Et « demandez au responsable » DISPARAÎT : ce conseil n'a
       aucun sens tant qu'il n'y a pas de responsable. */
    rendre(<Connexion connecter={CONNECTER} fonder={vi.fn()} />, { profil: null });

    expect(
      await screen.findByRole('button', { name: 'Créer le compte du club' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Demandez au responsable du club/)).toBeNull();
  });
});

describe('fonder', () => {
  test('envoie le nom, le prénom et le mot de passe — jamais un numéro', async () => {
    /* Le numéro est attribué par la BASE, comme pour les soixante-
       quatre autres membres. Le laisser choisir ici ouvrirait
       « F04x999 » à quelqu'un qui n'a pas de raison de savoir ce que
       le club met derrière ce numéro. */
    poser({ 'fonction:fondation': { numero: 'F04x001' } });
    rendre(<Fondation connecter={CONNECTER} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'MonMotDePasse1');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'MonMotDePasse1');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    const envoi = await waitFor(() => {
      const r = derniere('fonction:fondation');
      expect(r).toBeDefined();
      return r!.corps as Record<string, unknown>;
    });
    expect(envoi).toEqual({
      nom: 'RAKOTO',
      prenom: 'Herizo',
      motDePasse: 'MonMotDePasse1'
    });
    expect(envoi).not.toHaveProperty('numero');
  });

  test('montre le numéro attribué, en grand, avant d’entrer', async () => {
    /* C'est la seule chose de cet écran qu'il faut retenir, et elle
       ne sera plus jamais affichée ainsi : on se connecte par numéro,
       pas par nom. */
    poser({ 'fonction:fondation': { numero: 'F04x001' } });
    rendre(<Fondation connecter={CONNECTER} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'MonMotDePasse1');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'MonMotDePasse1');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByText('F04x001')).toBeInTheDocument();
    expect(screen.getByText(/Le club est créé/)).toBeInTheDocument();
  });

  test('connecte avec le numéro rendu par la base, pas avec le nom', async () => {
    poser({ 'fonction:fondation': { numero: 'F04x001' } });
    const connecter = vi.fn(async () => ({ ok: true as const }));
    rendre(<Fondation connecter={connecter} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'MonMotDePasse1');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'MonMotDePasse1');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    await userEvent.click(
      await screen.findByRole('button', { name: 'Entrer dans l’application' })
    );
    expect(connecter).toHaveBeenCalledWith('F04x001', 'MonMotDePasse1');
  });

  test('refuse deux mots de passe différents SANS appeler le serveur', async () => {
    /* Ce mot de passe ne se réinitialise par personne : il n'y a pas
       encore d'administration pour le faire, c'est justement celle
       qu'on est en train de créer. Une faute de frappe enfermerait le
       club dehors. */
    rendre(<Fondation connecter={CONNECTER} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'MonMotDePasse1');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'MonMotDePasse2');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/pas identiques/);
    expect(derniere('fonction:fondation')).toBeUndefined();
  });

  test('refuse un mot de passe trop court SANS appeler le serveur', async () => {
    rendre(<Fondation connecter={CONNECTER} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'court');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'court');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/8 caractères/);
    expect(derniere('fonction:fondation')).toBeUndefined();
  });

  test('rend le refus du serveur tel quel, et ne prétend rien', async () => {
    /* Deux personnes installent l'application le même jour : la
       seconde doit LIRE que la porte s'est refermée, pas voir un
       écran qui annonce un succès qui n'a pas eu lieu. */
    poser({
      'fonction:fondation': {
        statut: 403,
        message: 'L’inscription est fermée : le club a déjà son administrateur.'
      }
    });
    rendre(<Fondation connecter={CONNECTER} revenir={vi.fn()} />, { profil: null });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RAKOTO');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Herizo');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'MonMotDePasse1');
    await userEvent.type(screen.getByLabelText('Confirmer le mot de passe'), 'MonMotDePasse1');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/inscription est fermée/);
    expect(screen.queryByText(/Le club est créé/)).toBeNull();
  });
});
