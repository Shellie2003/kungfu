/* ============================================================
   La connexion, de bout en bout.

   C'est le premier écran, et le seul que tout le club verra. Une
   erreur ici bloque tout le monde.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Connexion } from '../src/ecrans/Connexion';
import { seConnecter } from '../src/services/supabase';
import { brancherServeur, derniere, poserAuth, reinitialiser, sessionFactice } from './serveur';
import { rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('l’écran', () => {
  test('refuse d’envoyer sans numéro', async () => {
    const connecter = vi.fn(async () => ({ ok: false as const, message: 'Entrez votre numéro de membre.' }));
    rendre(<Connexion connecter={connecter} />, { profil: null });

    await userEvent.click(screen.getByRole('button', { name: 'Entrer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Entrez votre numéro de membre.');
  });

  test('transmet ce qui a été tapé, sans y toucher', async () => {
    /* La normalisation est le travail du service, pas de l'écran :
       le vérifier ici garantit que l'écran ne « corrige » pas la
       saisie en douce, ce qui masquerait un défaut du service. */
    const connecter = vi.fn(async () => ({ ok: true as const }));
    rendre(<Connexion connecter={connecter} />, { profil: null });

    await userEvent.type(screen.getByLabelText(/Numéro de membre/i), ' f04x 042 ');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrer' }));

    expect(connecter).toHaveBeenCalledWith(' f04x 042 ', 'secret123');
  });

  test('affiche le message d’échec, et rend la main', async () => {
    const connecter = vi.fn(async () => ({
      ok: false as const,
      message: 'Numéro de membre ou mot de passe incorrect.'
    }));
    rendre(<Connexion connecter={connecter} />, { profil: null });

    await userEvent.type(screen.getByLabelText(/Numéro de membre/i), 'F04x042');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'faux');
    await userEvent.click(screen.getByRole('button', { name: 'Entrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('incorrect');
    /* Le bouton doit redevenir cliquable : on retente forcément. */
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Entrer' })).toBeEnabled()
    );
  });

  test('en cas de succès, le bouton ne redevient pas cliquable', async () => {
    /* Volontaire : l'écoute de session remplace l'écran. Relâcher le
       bouton le ferait clignoter juste avant qu'il disparaisse. */
    const connecter = vi.fn(async () => ({ ok: true as const }));
    rendre(<Connexion connecter={connecter} />, { profil: null });

    await userEvent.type(screen.getByLabelText(/Numéro de membre/i), 'F04x042');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'bon');
    await userEvent.click(screen.getByRole('button', { name: /Entrer|Connexion/ }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Connexion…' })).toBeDisabled()
    );
  });

  test('le mot de passe n’est jamais en clair à l’écran', async () => {
    rendre(<Connexion connecter={vi.fn(async () => ({ ok: true as const }))} />, { profil: null });
    expect(screen.getByLabelText(/Mot de passe/i)).toHaveAttribute('type', 'password');
  });
});

describe('le service', () => {
  test('compose l’adresse à partir du matricule normalisé', async () => {
    poserAuth({ token: sessionFactice() });

    const r = await seConnecter(' f04x 042 ', 'secret123');
    expect(r.ok).toBe(true);

    const appel = derniere('auth:token');
    expect(appel?.corps).toMatchObject({
      email: 'f04x042@waishi.local',
      password: 'secret123'
    });
  });

  test('traduit « Invalid login credentials » sans dire lequel est faux', async () => {
    /* Dire « ce numéro n'existe pas » aiderait à deviner les
       matricules du club. Le message reste volontairement ambigu. */
    poserAuth({ token: { erreur: 'Invalid login credentials' } });

    const r = await seConnecter('F04x042', 'faux');
    expect(r).toEqual({
      ok: false,
      message: 'Numéro de membre ou mot de passe incorrect.'
    });
  });

  test('un numéro vide n’atteint jamais le serveur', async () => {
    const r = await seConnecter('   ', 'quelquechose');
    expect(r).toEqual({ ok: false, message: 'Entrez votre numéro de membre.' });
    expect(derniere('auth:token')).toBeUndefined();
  });

  test('un mot de passe vide n’atteint jamais le serveur', async () => {
    const r = await seConnecter('F04x042', '');
    expect(r).toEqual({ ok: false, message: 'Entrez votre mot de passe.' });
    expect(derniere('auth:token')).toBeUndefined();
  });
});
