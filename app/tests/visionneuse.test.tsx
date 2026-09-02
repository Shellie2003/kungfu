/* ============================================================
   L'image en grand : réactions et enregistrement.

   « Je veux aussi une visualisation grande si on appuie sur une
   image, avec des boutons de réaction et téléchargement. »

   Avant : une photo de conversation s'affichait à 240 pixels de
   large, et rien ne se passait quand on appuyait dessus. Un visage
   au fond d'une photo de groupe était invisible, et la seule façon
   de la voir en grand était de la redemander à celui qui l'avait
   envoyée.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Salon } from '../src/ecrans/Salon';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

const maintenant = new Date().toISOString();

const SALON = {
  id: 's1', nom: 'Le club', genre: 'club', archive_le: null,
  dernier_message_le: maintenant
};

const AVEC_PHOTO = {
  salons: [SALON],
  messages: [
    {
      id: 'm1', texte: 'La finale', cree_le: maintenant, modifie_le: null,
      piece: 's1/abc--finale.jpg', supprime_le: null, auteur_id: 'p4',
      profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
    }
  ]
};

const ouvrirLaPhoto = async () => {
  rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });
  await userEvent.click(await screen.findByLabelText('Voir en grand : La finale'));
};

describe('appuyer sur une image l’ouvre en grand', () => {
  test('l’image est un BOUTON, pas une image morte', async () => {
    poser(AVEC_PHOTO);
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByLabelText('Voir en grand : La finale')).toBeInTheDocument();
  });

  test('au repos, la visionneuse n’existe pas dans la page', async () => {
    /* Ce n'est pas une optimisation : c'est ce qui laisse le fil
       identique à la maquette tant qu'on ne l'ouvre pas, et donc ce
       qui permet à la comparaison au pixel de rester exigeante. */
    poser(AVEC_PHOTO);
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByLabelText('Voir en grand : La finale');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('ouverte, elle propose d’enregistrer et de réagir', async () => {
    poser(AVEC_PHOTO);
    await ouvrirLaPhoto();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
    expect(screen.getByLabelText('Réagir 👍')).toBeInTheDocument();
  });

  test('elle se referme', async () => {
    poser(AVEC_PHOTO);
    await ouvrirLaPhoto();
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByLabelText('Fermer'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('réagir', () => {
  test('la réaction part avec le genre et le sujet', async () => {
    poser({ ...AVEC_PHOTO, reactions: [] });
    await ouvrirLaPhoto();

    await userEvent.click(await screen.findByLabelText('Réagir 👏'));

    const envoi = (await waitFor(() => {
      const r = derniere('reactions');
      expect(r).toBeDefined();
      return r!;
    })).corps as { genre: string; sujet: string; emoji: string; profil_id: string };

    expect(envoi.genre).toBe('message');
    expect(envoi.sujet).toBe('m1');
    expect(envoi.emoji).toBe('👏');
    /* On ne réagit QUE pour soi : le serveur l'exige aussi — sans
       cela, n'importe qui ferait dire « 👍 » au maître. */
    expect(envoi.profil_id).toBe(PROFIL_ELEVE.id);
  });

  test('le MÊME emoji retire la réaction, il ne l’empile pas', async () => {
    /* C'est ainsi qu'on annule, et il n'y a rien d'autre à
       apprendre. Sans cela, une même personne empilerait six emoji
       sur la même photo. */
    poser({
      ...AVEC_PHOTO,
      reactions: [
        { id: 'r1', emoji: '👍', profil_id: PROFIL_ELEVE.id, profils: null }
      ]
    });
    await ouvrirLaPhoto();

    /* Le bouton le DIT : « Retirer » et non « Réagir ». Sans cette
       marque, on ne sait plus si l'on a déjà réagi. */
    await userEvent.click(await screen.findByLabelText('Retirer 👍'));

    await waitFor(() => expect(derniere('reactions', 'DELETE')).toBeDefined());
    /* Et aucune insertion n'est partie. */
    expect(derniere('reactions', 'POST')).toBeUndefined();
  });

  test('un AUTRE emoji remplace, il n’ajoute pas', async () => {
    poser({
      ...AVEC_PHOTO,
      reactions: [
        { id: 'r1', emoji: '👍', profil_id: PROFIL_ELEVE.id, profils: null }
      ]
    });
    await ouvrirLaPhoto();

    await userEvent.click(await screen.findByLabelText('Réagir 🔥'));

    const envoi = await waitFor(() => {
      const r = derniere('reactions', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toEqual({ emoji: '🔥' });
    expect(derniere('reactions', 'POST')).toBeUndefined();
  });

  test('le compte des réactions s’affiche', async () => {
    poser({
      ...AVEC_PHOTO,
      reactions: [
        { id: 'r1', emoji: '👍', profil_id: 'p1', profils: null },
        { id: 'r2', emoji: '👍', profil_id: 'p2', profils: null },
        { id: 'r3', emoji: '🔥', profil_id: 'p3', profils: null }
      ]
    });
    await ouvrirLaPhoto();

    /* Sans le compte, on ne sait pas si l'on est seul à avoir aimé
       la photo — et c'est justement ce qu'on veut savoir. */
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});

describe('un message pas encore confirmé ne se réagit pas', () => {
  test('l’image s’ouvre, les réactions ne s’affichent pas', async () => {
    /* Un message affiché avant la réponse du serveur porte un
       identifiant provisoire. Une réaction partirait vers un sujet
       qui n'existe pas encore, et le serveur la refuserait — ou
       pire, l'accepterait sur un identifiant qui ne sera jamais
       celui du message. */
    poser({ salons: [SALON], messages: [], 'messages:POST': new Promise(() => {}) });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.upload(
      await screen.findByLabelText('Joindre une photo ou un document'),
      new File(['x'], 'essai.jpg', { type: 'image/jpeg' })
    );
    await waitFor(() => expect(screen.getByText('Pièce jointe.')).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText('Envoyer'));

    const bouton = await screen.findByLabelText(/Voir en grand/);
    await userEvent.click(bouton);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('Réagir 👍')).not.toBeInTheDocument();
    /* Enregistrer, en revanche, reste possible : le fichier est déjà
       sur le serveur, c'est le message qui attend. */
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
  });
});

describe('enregistrer depuis la visionneuse', () => {
  test('le geste a un effet visible', async () => {
    poser(AVEC_PHOTO);
    await ouvrirLaPhoto();

    await userEvent.click(await screen.findByRole('button', { name: 'Enregistrer' }));

    /* Sur le web — et jsdom EST le web — le navigateur ouvre le
       fichier. Ce que le test tient, c'est qu'il se PASSE quelque
       chose : un enregistrement muet est ce qu'on avait déjà. */
    expect(await screen.findByText(/Ouvert|Enregistré|Échec/)).toBeInTheDocument();
    expect(recues.some((r) => r.chemin?.includes('/object/sign/pieces'))).toBe(true);
  });
});
