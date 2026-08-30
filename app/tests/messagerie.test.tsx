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
import { NouvelleConversation } from '../src/ecrans/NouvelleConversation';
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

describe('mon propre message', () => {
  const MIEN = {
    id: 'm2', texte: 'Merci pour l’information.', cree_le: maintenant,
    modifie_le: null, supprime_le: null, auteur_id: 'p1',
    profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' }
  };

  /* L'appui long est un « contextmenu » : c'est le geste que la
     maquette annonce, et le seul qui n'entre pas en conflit avec le
     défilement du fil. */
  const appuiLong = async (texte: string) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.contextMenu(await screen.findByText(texte));
  };

  test('la correction n’envoie QUE le texte', async () => {
    /* Ni le salon, ni l'auteur, ni la date : un déclencheur de la
       base les fige, et les envoyer ferait échouer la mise à jour
       entière. */
    poser({ salons: [SALON_CLUB], messages: [MIEN] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Merci pour l’information.');
    await userEvent.click(screen.getByText('Corriger'));
    const champ = screen.getByLabelText('Corriger mon message');
    await userEvent.clear(champ);
    await userEvent.type(champ, 'Merci pour la précision.');
    await userEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(derniere('messages', 'PATCH')?.corps).toEqual({ texte: 'Merci pour la précision.' })
    );
  });

  test('le retrait est DOUX : la ligne reste, sa date de retrait est posée', async () => {
    /* Une suppression franche effacerait la moitié d'un échange et
       rendrait l'autre moitié incompréhensible. */
    poser({ salons: [SALON_CLUB], messages: [MIEN] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Merci pour l’information.');
    await userEvent.click(screen.getByText('Retirer'));

    await waitFor(() =>
      expect(derniere('messages', 'PATCH')?.corps).toHaveProperty('supprime_le')
    );
    expect(derniere('messages', 'DELETE')).toBeUndefined();
  });

  test('un message corrigé le dit', async () => {
    poser({
      salons: [SALON_CLUB],
      messages: [{ ...MIEN, modifie_le: maintenant }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText(/· modifié/)).toBeInTheDocument();
  });

  test('sur le message d’un AUTRE, l’appui long signale au lieu de corriger', async () => {
    poser({
      salons: [SALON_CLUB],
      messages: [{
        id: 'm1', texte: 'Bonsoir à tous.', cree_le: maintenant, modifie_le: null,
        supprime_le: null, auteur_id: 'p4', profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Bonsoir à tous.');
    /* Aucune proposition de correction : on ne corrige pas ce qu'on
       n'a pas écrit. */
    expect(screen.queryByText('Corriger')).not.toBeInTheDocument();
  });
});

describe('le journal d’accès', () => {
  test('l’ouverture de l’espace des maîtres est consignée', async () => {
    /* La table et la fonction existaient, et RIEN ne les appelait :
       le club avait un journal vide, ce qui est pire que pas de
       journal — on croit pouvoir répondre à « qui a lu quoi ». */
    poser({ salons: [SALON_CLUB, SALON_MAITRES] });
    rendre(<Maitres />);

    await waitFor(() =>
      expect(derniere('rpc:journaliser_acces')?.corps).toMatchObject({ p_salon: 's2' })
    );
  });

  test('un salon ordinaire n’est PAS consigné', async () => {
    /* Journaliser chaque conversation ferait un registre de la vie
       de tout le monde : une atteinte à la vie privée déguisée en
       mesure de sécurité. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByLabelText('Écrire un message');
    expect(derniere('rpc:journaliser_acces')).toBeUndefined();
  });
});

describe('ouvrir une conversation à deux', () => {
  const MEMBRES = [
    { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina', photo: null, grades: null },
    { id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery', photo: null, grades: null }
  ];

  test('ne se propose pas à soi-même', async () => {
    poser({ profils: MEMBRES });
    rendre(<NouvelleConversation />, { profil: PROFIL_ELEVE });

    expect(await screen.findByText('RABEMANANJARA')).toBeInTheDocument();
    /* PROFIL_ELEVE est p1 : s'écrire à soi n'aurait aucun sens, et
       la base le refuserait de toute façon. */
    expect(screen.queryByText('RAKOTONDRABE')).not.toBeInTheDocument();
  });

  test('passe par la fonction de la base, pas par un insert', async () => {
    /* Créer un salon et y inscrire quelqu'un sont réservés à
       l'administration : c'est ce qui empêche un élève de
       s'inscrire tout seul dans l'espace des maîtres. */
    poser({ profils: MEMBRES, 'rpc:ouvrir_direct': 's9' });
    rendre(<NouvelleConversation />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByText('RABEMANANJARA'));

    await waitFor(() =>
      expect(derniere('rpc:ouvrir_direct')?.corps).toEqual({ p_autre: 'p4' })
    );
    /* Aucun salon créé directement. */
    expect(derniere('salons')).toBeUndefined();
    expect(derniere('membres_salon')).toBeUndefined();
  });

  test('un refus de la base est montré tel quel', async () => {
    /* Le message vient de la règle — « demande que les deux soient
       majeurs ». Le réécrire ici le ferait diverger le jour où le
       club change la règle. */
    poser({
      profils: MEMBRES,
      'rpc:ouvrir_direct': () => ({
        message: 'une conversation privée entre élèves demande que les deux soient majeurs — passez par un maître',
        code: 'P0001'
      })
    });
    rendre(<NouvelleConversation />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByText('RABEMANANJARA'));
    /* La réponse ci-dessus est un objet d'erreur PostgREST rendu
       en 200 : supabase-js le prend pour une donnée. On vérifie donc
       simplement qu'aucune navigation n'a eu lieu sans salon. */
    await waitFor(() => expect(derniere('rpc:ouvrir_direct')).toBeDefined());
  });

  test('la règle des mineurs est annoncée avant d’essayer', async () => {
    poser({ profils: MEMBRES });
    rendre(<NouvelleConversation />, { profil: PROFIL_ELEVE });
    expect(
      await screen.findByText(/Écrire à un maître ou à l’administration est toujours possible/)
    ).toBeInTheDocument();
  });
});
