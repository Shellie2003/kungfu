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
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
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

  /* Le même, envoyé il y a une heure : la règle d'accès ne le laisse
     plus corriger. */
  const VIEUX = {
    ...MIEN,
    cree_le: new Date(Date.now() - 60 * 60_000).toISOString()
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

  test('passé quinze minutes, l’écran ne PROPOSE plus de corriger', async () => {
    /* La note de sécurité livrée au club le dit : « l'auteur seul, et
       pendant quinze minutes. Passé ce délai, le fil devient une
       trace stable, utile en cas de litige. » La règle d'accès le
       tient ; l'écran doit s'y conformer plutôt que de proposer un
       geste que le serveur refusera. */
    poser({ salons: [SALON_CLUB], messages: [VIEUX] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Merci pour l’information.');
    expect(screen.queryByText('Corriger')).not.toBeInTheDocument();
    expect(screen.getByText(/minutes pendant lesquelles un message se corrige/)).toBeInTheDocument();
  });

  test('un refus du serveur ne s’annonce PLUS comme un succès', async () => {
    /* Le défaut : une mise à jour que la règle d'accès écarte ne
       touche aucune ligne et ne rend pas d'erreur. PostgREST répond
       « rien à signaler », et l'écran annonçait « Message corrigé »
       alors que rien n'avait changé. L'application mentait. */
    poser({
      salons: [SALON_CLUB],
      messages: [MIEN],
      /* Zéro ligne touchée : c'est ce que rend un PATCH refusé par
         la règle d'accès. */
      'messages:PATCH': []
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Merci pour l’information.');
    await userEvent.click(screen.getByText('Corriger'));
    await userEvent.click(screen.getByText('Enregistrer'));

    expect(await screen.findByText(/Le serveur a refusé/)).toBeInTheDocument();
  });

  test('la correction demande les lignes touchées, sans quoi on ne sait rien', async () => {
    poser({ salons: [SALON_CLUB], messages: [MIEN] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await appuiLong('Merci pour l’information.');
    await userEvent.click(screen.getByText('Corriger'));
    await userEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      const r = derniere('messages', 'PATCH');
      expect(r).toBeDefined();
      /* « return=representation » : c'est ce que pose « .select() »,
         et c'est lui qui fait la différence entre « refusé » et
         « accepté ». */
      expect(r!.entetes['prefer'] ?? '').toContain('return=representation');
    });
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

describe('quand l’envoi échoue', () => {
  /* Le club l'a signalé en essayant l'application : « si j'écris un
     message il ne s'affiche pas ». La cause n'était pas le serveur —
     il acceptait — mais l'écran, qui ne rattrapait AUCUNE erreur
     d'envoi. Le champ se vidait comme après un succès, et le message
     n'apparaissait jamais. */
  test('le refus du serveur s’affiche, au lieu d’un silence', async () => {
    poser({
      salons: [SALON_CLUB],
      messages: [],
      'messages:POST': () => {
        throw new Error('sans importance : la réponse ci-dessous fait foi');
      }
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.type(await screen.findByLabelText('Écrire un message'), 'Bonsoir');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    /* La requête est bien partie : c'est ce qu'elle rapporte qui
       doit se voir. */
    await waitFor(() => expect(derniere('messages')).toBeDefined());
  });

  /* Le SECOND silence, et le vrai coupable du « j'écris un message
     et il ne s'affiche pas ». L'écran disait « moi && envoi.mutate(…) » :
     sans fiche chargée — ce que la lecture du profil rendait à tout
     le monde — aucune requête ne partait, aucune erreur n'était levée,
     et le champ se vidait comme après un succès. */
  test('sans fiche chargée, il le DIT au lieu de n’envoyer rien', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: null });

    await userEvent.type(await screen.findByLabelText('Écrire un message'), 'Bonsoir');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fiche n’est pas chargée/);
    /* Et surtout : rien n'est parti. Un avis qui accompagnerait un
       envoi réussi serait une fausse alerte, pas une correction. */
    expect(derniere('messages')).toBeUndefined();
  });

  test('un envoi réussi n’affiche aucun avis', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.type(await screen.findByLabelText('Écrire un message'), 'Bonsoir');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    await waitFor(() => expect(derniere('messages')).toBeDefined());
    expect(screen.queryByText(/n’est pas parti/)).not.toBeInTheDocument();
  });
});

describe('le fil ne montre pas les deux cents PREMIERS messages', () => {
  test('il demande les plus RÉCENTS, puis les remet dans l’ordre', async () => {
    /* Écrit « ascending: true » avec une limite, PostgREST rend les
       plus anciens : passé deux cents messages, un salon n'aurait
       plus jamais montré un nouveau message. Le club n'y est pas
       encore ; il y sera. */
    poser({
      salons: [SALON_CLUB],
      messages: [
        { id: 'm2', texte: 'Le plus récent', cree_le: maintenant, modifie_le: null,
          piece: null, supprime_le: null, auteur_id: 'p4',
          profils: { nom: 'RABEMANANJARA', prenom: 'Hery' } },
        { id: 'm1', texte: 'Le plus ancien',
          cree_le: new Date(Date.now() - 3600_000).toISOString(), modifie_le: null,
          piece: null, supprime_le: null, auteur_id: 'p4',
          profils: { nom: 'RABEMANANJARA', prenom: 'Hery' } }
      ]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Le plus récent');
    const r = derniere('messages', 'GET');
    expect(r?.parametres.get('order')).toContain('desc');

    /* Et le fil se lit dans le bon sens : le serveur les rend du
       plus récent au plus ancien, l'écran les remet à l'endroit. */
    const bulles = [...document.querySelectorAll('.bul__txt')].map((b) => b.textContent);
    expect(bulles).toEqual(['Le plus ancien', 'Le plus récent']);
  });
});

describe('joindre une photo', () => {
  /* messages.piece existait depuis le premier jour et rien ne
     l'écrivait : un maître qui voulait montrer l'affiche d'une
     compétition la décrivait en toutes lettres. */
  const photo = () => new File(['x'], 'affiche.jpg', { type: 'image/jpeg' });

  test('le chemin PORTE le salon — c’est ce que lit la règle d’accès', async () => {
    /* Déposer ailleurs est refusé par le serveur : le premier
       dossier du chemin est le salon, et la règle vérifie qu'on en
       est membre. C'est ce qui ferme l'espace des maîtres. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.upload(await screen.findByLabelText('Joindre une photo ou un document'), photo());

    await waitFor(() => {
      const envoi = recues.find((r) => r.table === 'storage' && r.methode === 'POST');
      expect(envoi).toBeDefined();
      expect(String(envoi!.chemin)).toContain('/pieces/s1/');
    });
  });

  test('la pièce part avec le message, en CHEMIN et non en adresse', async () => {
    /* L'adresse est signée et expire au bout d'une heure :
       l'enregistrer donnerait un message dont la photo disparaît le
       lendemain. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.upload(await screen.findByLabelText('Joindre une photo ou un document'), photo());
    await screen.findByText('Photo jointe.');
    await userEvent.type(screen.getByLabelText('Écrire un message'), 'Voici l’affiche.');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    await waitFor(() => {
      const corps = derniere('messages')?.corps as { piece: string | null; texte: string };
      expect(corps.texte).toBe('Voici l’affiche.');
      expect(corps.piece).toContain('s1/');
      expect(corps.piece).not.toMatch(/^https?:/);
    });
  });

  test('une photo SEULE s’envoie, sans texte', async () => {
    /* « Regarde » n'ajoute rien à une photo, et exiger un texte
       ferait taper « photo » vingt fois. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByLabelText('Envoyer')).toBeDisabled();
    await userEvent.upload(screen.getByLabelText('Joindre une photo ou un document'), photo());
    await screen.findByText('Photo jointe.');

    expect(screen.getByLabelText('Envoyer')).not.toBeDisabled();
  });

  test('une photo trop lourde est refusée AVANT de partir', async () => {
    /* Le serveur refuse déjà au-delà de cinq mégaoctets — c'est lui
       qui protège — mais après avoir reçu le fichier, et après avoir
       dépensé le forfait de celui qui l'envoie. Sur un réseau
       malgache, envoyer huit mégaoctets pour s'entendre dire non est
       une punition. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    const trop = new File([new Uint8Array(6 * 1024 * 1024)], 'grande.jpg', {
      type: 'image/jpeg'
    });
    await userEvent.upload(await screen.findByLabelText('Joindre une photo ou un document'), trop);

    expect(await screen.findByText(/la limite est 5,0 Mo/)).toBeInTheDocument();
    /* Et rien n'est parti sur le réseau. */
    expect(recues.some((r) => r.table === 'storage')).toBe(false);
  });

  test('un DOCUMENT est accepté, et porte son nom', async () => {
    /* Ce test disait l'inverse : « un fichier qui n'est pas une image
       n'est même pas retenu ». Le club a demandé de pouvoir
       télécharger des documents dans les conversations — une
       convocation, un règlement — et la restriction aux seules
       photos n'avait plus lieu d'être.

       Ce qui compte ici est le NOM : le chemin valait
       « <salon>/<hasard>.pdf », si bien qu'un document téléchargé
       s'appelait « 7f3a1c2e-….pdf » dans le dossier des
       téléchargements — introuvable. Il porte maintenant son nom
       d'origine, après un double tiret. */
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    const pdf = new File(['x'], 'reglement interieur.pdf', { type: 'application/pdf' });
    await userEvent.upload(await screen.findByLabelText('Joindre une photo ou un document'), pdf);

    await waitFor(() => expect(screen.getByText(/jointe|joint/i)).toBeInTheDocument());

    const envoi = [...recues].reverse().find((r) => r.chemin?.includes('/object/pieces/'));
    expect(envoi).toBeDefined();
    /* Le salon reste le PREMIER segment : c'est lui que lit la règle
       d'accès. Le nom vient après, et ne la gêne pas. */
    expect(envoi?.chemin).toMatch(/\/object\/pieces\/s1\//);
    expect(envoi?.chemin).toMatch(/--reglement-interieur\.pdf$/);
  });

  test('la pièce d’un message reçu s’affiche par une adresse signée', async () => {
    poser({
      salons: [SALON_CLUB],
      messages: [{
        id: 'm1', texte: 'L’affiche.', cree_le: maintenant, modifie_le: null,
        piece: 's1/affiche.jpg', supprime_le: null, auteur_id: 'p4',
        profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('L’affiche.');
    await waitFor(() =>
      expect(document.querySelector('img')?.getAttribute('src')).toContain(
        '/object/sign/pieces/s1/affiche.jpg'
      )
    );
  });

  test('un message retiré n’affiche plus sa pièce', async () => {
    /* Retirer le texte et laisser la photo ne retirerait rien du
       tout — c'est souvent la photo qui pose problème. */
    poser({
      salons: [SALON_CLUB],
      messages: [{
        id: 'm1', texte: 'L’affiche.', cree_le: maintenant, modifie_le: null,
        piece: 's1/affiche.jpg', supprime_le: maintenant, auteur_id: 'p4',
        profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Message retiré');
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('archiver une conversation', () => {
  /* La colonne « archive » était filtrée à la lecture depuis le
     premier jour et personne ne la posait : elle valait « false »
     pour tous les salons, à jamais. Une sortie de 2024 restait en
     tête de la messagerie du club en 2026. */

  test('la liste ne demande QUE les conversations en cours', async () => {
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    await screen.findByText('Tout le club');

    const r = derniere('salons', 'GET');
    expect(r?.parametres.get('archive')).toBe('eq.false');
  });

  test('l’archive se demande séparément, et non par un tri en mémoire', async () => {
    /* Charger tout pour en cacher la moitié ferait payer l'archive à
       chaque ouverture de l'écran. */
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />);
    await screen.findByText('Tout le club');

    await userEvent.click(screen.getByText('Archivées'));
    await waitFor(() =>
      expect(derniere('salons', 'GET')?.parametres.get('archive')).toBe('eq.true')
    );
  });

  test('un élève ne se voit pas proposer l’archive', async () => {
    /* La règle d'accès ne laisse que l'administration écrire sur un
       salon : lui montrer le filtre ne servirait qu'à encombrer. */
    poser({ salons: [SALON_CLUB] });
    rendre(<Messages />, { profil: PROFIL_ELEVE });
    await screen.findByText('Tout le club');

    expect(screen.queryByText('Archivées')).not.toBeInTheDocument();
  });

  test('archiver POSE la colonne, il ne supprime rien', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id' });

    await userEvent.click(await screen.findByLabelText('Archiver cette conversation'));

    await waitFor(() =>
      expect(derniere('salons', 'PATCH')?.corps).toEqual({ archive: true })
    );
    expect(derniere('salons', 'DELETE')).toBeUndefined();
    /* Et les messages restent : archiver n'est pas supprimer. */
    expect(derniere('messages', 'DELETE')).toBeUndefined();
  });

  test('sur une conversation archivée, le même bouton la ressort', async () => {
    poser({
      salons: [{ ...SALON_CLUB, archive: true }],
      messages: []
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id' });

    await userEvent.click(await screen.findByLabelText('Sortir de l’archive'));
    await waitFor(() =>
      expect(derniere('salons', 'PATCH')?.corps).toEqual({ archive: false })
    );
  });

  test('un élève n’a pas le bouton', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByLabelText('Écrire un message');
    expect(screen.queryByLabelText('Archiver cette conversation')).not.toBeInTheDocument();
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

/* ============================================================
   « L'envoi d'un message est trop lent. »

   Il ne l'était pas au sens où le serveur tarderait : l'écran
   attendait DEUX allers-retours avant de montrer quoi que ce soit —
   l'écriture, puis la relecture complète du fil. Sur un réseau
   malgache cela fait deux à quatre secondes sans rien de visible,
   et l'on retape.
   ============================================================ */
describe('l’envoi instantané', () => {
  test('le message paraît AVANT la réponse du serveur', async () => {
    /* Le serveur ne répondra jamais : c'est tout l'intérêt. Si le
       message s'affiche quand même, c'est qu'on ne l'attend plus. */
    poser({
      salons: [SALON_CLUB],
      messages: [],
      'messages:POST': () => new Promise(() => {})
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.type(await screen.findByLabelText('Écrire un message'), 'Bonsoir');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    expect(await screen.findByText('Bonsoir')).toBeInTheDocument();
    /* Mais il ne PRÉTEND pas être arrivé : « Envoi… » à la place de
       l'heure. Annoncer un succès qui n'a pas eu lieu est le défaut
       que ce projet a déjà payé trois fois. */
    expect(screen.getByText('Envoi…')).toBeInTheDocument();
  });

  test('un refus le RETIRE du fil, au lieu de le laisser croire parti', async () => {
    poser({
      salons: [SALON_CLUB],
      messages: [],
      'messages:POST': () => []
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await userEvent.type(await screen.findByLabelText('Écrire un message'), 'Bonsoir');
    await userEvent.click(screen.getByLabelText('Envoyer'));

    /* Le refus se lit, et le message a disparu du fil : le laisser
       en place serait pire que la lenteur d'origine. */
    expect(await screen.findByRole('alert')).toHaveTextContent(/n’est pas parti/);
    await waitFor(() => expect(screen.queryByText('Envoi…')).not.toBeInTheDocument());
  });
});

describe('les emoji', () => {
  test('le choix s’ouvre et ajoute au message', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    const champ = await screen.findByLabelText('Écrire un message');
    await userEvent.type(champ, 'Bravo');
    await userEvent.click(screen.getByLabelText('Choisir un emoji'));
    await userEvent.click(screen.getByRole('button', { name: '👏' }));

    expect(champ).toHaveValue('Bravo👏');
    /* Le choix se referme : le laisser ouvert cacherait le fil sous
       une grille de vingt-quatre boutons. */
    expect(screen.queryByRole('button', { name: '👏' })).not.toBeInTheDocument();
  });

  test('au repos, la grille n’existe pas dans la page', async () => {
    poser({ salons: [SALON_CLUB], messages: [] });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });
    await screen.findByLabelText('Écrire un message');
    expect(screen.queryByRole('dialog', { name: 'Choisir un emoji' })).not.toBeInTheDocument();
  });
});

describe('un document reçu', () => {
  test('se télécharge sous son nom, au lieu d’un cadre vide', async () => {
    /* La version précédente rendait une balise « img » quel que soit
       le type : un PDF donnait un cadre vide, sans rien à faire. */
    poser({
      salons: [SALON_CLUB],
      messages: [{
        id: 'm1', texte: 'Le règlement.', cree_le: maintenant, modifie_le: null,
        piece: 's1/7f3a1c2e--reglement.pdf', supprime_le: null, auteur_id: 'p4',
        profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    const lien = await screen.findByRole('link', { name: /reglement\.pdf/ });
    /* « download » porte le NOM D'ORIGINE : sans lui, le fichier
       arrive dans les téléchargements sous son identifiant tiré au
       sort, et reste introuvable. */
    expect(lien).toHaveAttribute('download', 'reglement.pdf');
    expect(lien.getAttribute('href')).toMatch(/^http/);
    /* Et surtout : pas d'image. */
    expect(document.querySelector('.bul img')).toBeNull();
  });
});
