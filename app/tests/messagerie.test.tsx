/* ============================================================
   La messagerie, et l'espace des maîtres.

   Le point le plus délicat du projet : ce que le club a demandé
   « très confidentiel ». Les tests ci-dessous vérifient le
   comportement de l'APPLICATION — qu'elle n'invente rien, et
   qu'elle ne montre que ce qu'elle a reçu.

   Ce qu'ils NE vérifient pas, et qu'il ne faut pas leur demander :
   que le serveur refuse bien de rendre l'espace des maîtres à un
   élève. Cela se vérifie sur une vraie base, dans
   supabase/tests/securite.sql, en se faisant passer pour un élève.
   Le simuler ici donnerait l'illusion de le prouver.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Messages } from '../src/ecrans/Messages';
import { Maitres, Salon } from '../src/ecrans/Salon';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

const maintenant = new Date().toISOString();

const SALON_CLUB = {
  id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132',
  dernier_le: maintenant,
  membres_salon: [{ lu_le: null }],
  messages: [{
    texte: 'L’entraînement est maintenu.',
    cree_le: maintenant,
    profils: { nom: 'RAHARISOA', prenom: 'Fanja' }
  }]
};

const SALON_MAITRES = {
  id: 's2', type: 'maitres', titre: 'Espace des maîtres', couleur: '#0B2B1D',
  dernier_le: maintenant, membres_salon: [{ lu_le: null }], messages: []
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('la liste des conversations', () => {
  test('affiche un salon avec son dernier message et son auteur', async () => {
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });

    expect(await screen.findByText('Tout le club')).toBeInTheDocument();
    expect(screen.getByText(/L’entraînement est maintenu\./)).toBeInTheDocument();
    /* Le prénom seul : « RAHARISOA Fanja : » mangerait la ligne. */
    expect(screen.getByText('Fanja :')).toBeInTheDocument();
  });

  test('un salon sans message le dit, plutôt que d’afficher une ligne vide', async () => {
    poser({ salons: [SALON_MAITRES] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    expect(await screen.findByText('Aucun message pour l’instant.')).toBeInTheDocument();
  });

  test('le compteur de non-lus se calcule sur MA ligne d’appartenance', async () => {
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    /* lu_le est nul et un message existe : donc un non-lu. */
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  test('un salon déjà lu n’affiche pas de pastille', async () => {
    poser({
      salons: [{ ...SALON_CLUB, membres_salon: [{ lu_le: new Date(Date.now() + 60_000).toISOString() }] }]
    });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    await screen.findByText('Tout le club');
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  test('sans espace des maîtres reçu, la clé n’apparaît pas', async () => {
    /* L'application ne CACHE pas l'espace : elle ne l'a pas reçu.
       La nuance tient même si quelqu'un modifie l'application. */
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    await screen.findByText('Tout le club');
    expect(screen.queryByLabelText('Espace des maîtres')).not.toBeInTheDocument();
    expect(screen.queryByText('Confidentiel')).not.toBeInTheDocument();
  });

  test('avec l’espace reçu, il est mis en tête sous « Confidentiel »', async () => {
    poser({ salons: [SALON_CLUB, SALON_MAITRES] });
    rendre(<Messages />);
    expect(await screen.findByText('Confidentiel')).toBeInTheDocument();
    expect(screen.getByLabelText('Espace des maîtres')).toBeInTheDocument();
  });

  test('la recherche filtre les conversations', async () => {
    poser({ salons: [SALON_CLUB, { ...SALON_MAITRES, type: 'grade', titre: 'Ceintures vertes' }] });
    rendre(<Messages />);
    await screen.findByText('Tout le club');

    await userEvent.type(screen.getByLabelText(/Rechercher une conversation/i), 'vertes');
    expect(screen.getByText('Ceintures vertes')).toBeInTheDocument();
    expect(screen.queryByText('Tout le club')).not.toBeInTheDocument();
  });

  test('la modération est annoncée, pas laissée implicite', async () => {
    /* Le club compte des mineurs. Que le signalement existe doit se
       lire sans avoir à le découvrir. */
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    expect(await screen.findByText('Signaler un message')).toBeInTheDocument();
  });
});

describe('l’espace des maîtres', () => {
  test('sans le salon, le verrou s’affiche — et il explique pourquoi', async () => {
    poser({ salons: [SALON_CLUB] });
    rendre(<Maitres />, { profil: PROFIL_ELEVE });

    expect(await screen.findByText('Réservé aux maîtres')).toBeInTheDocument();
    expect(screen.getByText(/n’est pas transmis à votre téléphone/)).toBeInTheDocument();
    /* Aucun champ de saisie : on ne peut pas écrire dans un salon
       qu'on n'a pas. */
    expect(screen.queryByLabelText('Écrire un message')).not.toBeInTheDocument();
  });

  test('avec le salon, le fil s’ouvre en sombre et avertit sur les captures', async () => {
    poser({
      salons: [SALON_CLUB, SALON_MAITRES],
      messages: [{
        id: 'm1', texte: 'Passage de grade : je propose de reporter deux candidats.',
        cree_le: maintenant, supprime_le: null, auteur_id: 'p4',
        profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Maitres />);

    expect(await screen.findByText(/reporter deux candidats/)).toBeInTheDocument();
    /* La confidentialité tient aussi aux personnes : le dire est
       plus honnête que de laisser croire à une protection totale. */
    expect(screen.getByText(/captures d’écran, en revanche, restent possibles/)).toBeInTheDocument();
  });
});

describe('une conversation', () => {
  const MESSAGES = [
    {
      id: 'm1', texte: 'Bonsoir à tous.', cree_le: maintenant, supprime_le: null,
      auteur_id: 'p4', profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
    },
    {
      id: 'm2', texte: 'Merci pour l’information.', cree_le: maintenant, supprime_le: null,
      auteur_id: 'p1', profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' }
    }
  ];

  test('nomme l’auteur des messages reçus, pas des siens', async () => {
    poser({ salons: [SALON_CLUB], messages: MESSAGES });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Bonsoir à tous.');
    expect(screen.getByText('RABEMANANJARA Hery')).toBeInTheDocument();
    /* Le sien n'est pas signé : c'est lui qui écrit. */
    expect(screen.queryByText('RAKOTONDRABE Nirina')).not.toBeInTheDocument();
  });

  test('un message retiré laisse sa trace, sans son contenu', async () => {
    /* Suppression douce : le fil garde la trace du retrait plutôt
       que de faire disparaître un échange sans laisser d'indice. */
    poser({
      salons: [SALON_CLUB],
      messages: [{ ...MESSAGES[0], supprime_le: maintenant }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText('Message retiré')).toBeInTheDocument();
    expect(screen.queryByText('Bonsoir à tous.')).not.toBeInTheDocument();
  });

  test('le bouton d’envoi reste inerte tant que rien n’est écrit', async () => {
    poser({ salons: [SALON_CLUB], messages: MESSAGES });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Bonsoir à tous.');
    expect(screen.getByLabelText('Envoyer')).toBeDisabled();
  });

  test('un message d’espaces seuls n’est pas envoyé', async () => {
    poser({ salons: [SALON_CLUB], messages: MESSAGES });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Bonsoir à tous.');
    await userEvent.type(screen.getByLabelText('Écrire un message'), '     ');
    expect(screen.getByLabelText('Envoyer')).toBeDisabled();
  });

  test('l’envoi part avec le salon et l’auteur, et vide le champ', async () => {
    poser({ salons: [SALON_CLUB], messages: MESSAGES });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Bonsoir à tous.');
    const champ = screen.getByLabelText('Écrire un message');
    await userEvent.type(champ, 'Bien reçu, merci.');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    await waitFor(() =>
      expect(derniere('messages')?.corps).toMatchObject({
        salon_id: 's1',
        auteur_id: 'p1',
        texte: 'Bien reçu, merci.'
      })
    );
    expect(champ).toHaveValue('');
  });

  test('ouvrir un salon le marque comme lu', async () => {
    /* Le compteur se remet à zéro quand on a vraiment ouvert, pas
       quand on a survolé la ligne dans la liste. */
    poser({ salons: [SALON_CLUB], messages: MESSAGES });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await waitFor(() => {
      const marque = derniere('membres_salon', 'PATCH');
      expect(marque).toBeDefined();
      expect(marque!.corps).toHaveProperty('lu_le');
    });
  });
});
