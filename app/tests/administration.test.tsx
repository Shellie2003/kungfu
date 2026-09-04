/* ============================================================
   Les écrans qui ÉCRIVENT.

   Un formulaire qui s'affiche mais n'envoie rien ne se voit pas :
   l'écran a l'air de marcher, et l'on découvre trois semaines plus
   tard que la moitié des fiches sont incomplètes. Ces tests
   regardent donc ce qui PART vers le serveur, pas ce qui s'affiche.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminFiche } from '../src/ecrans/admin/Fiche';
import { AdminPublier, AdminNotifier } from '../src/ecrans/admin/Publication';
import { AdminComptes } from '../src/ecrans/admin/Comptes';
import { AdminClub } from '../src/ecrans/admin/Club';
import { AdminParticipations } from '../src/ecrans/admin/Participations';
import { MotDePasse } from '../src/ecrans/MotDePasse';
import {
  brancherServeur, derniere, poser, poserAuth, recues, reinitialiser, sessionFactice
} from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, rendre } from './rendu';

const GRADES = [{ id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true }];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser({ grades: GRADES });
});

describe('ajouter un étudiant', () => {
  test('refuse d’envoyer sans nom ni prénom', async () => {
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.click(await screen.findByRole('button', { name: 'Inscrire ce membre' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('obligatoires');
    /* Et rien n'est parti : une validation qui prévient APRÈS avoir
       écrit une ligne incomplète ne sert à rien. */
    expect(derniere('profils')).toBeUndefined();
  });

  test('demande le numéro à la BASE, jamais à l’application', async () => {
    /* Deux inscriptions simultanées produiraient sinon deux fois le
       même matricule. C'est prochain_numero() qui tranche. */
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), 'razafy');
    await userEvent.type(screen.getByLabelText(/^Prénom/), 'Lalaina');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() => expect(derniere('rpc:prochain_numero')).toBeDefined());
    const envoi = await waitFor(() => {
      const r = derniere('profils');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toMatchObject({ numero: 'F04x077', nom: 'RAZAFY', prenom: 'Lalaina' });
  });

  test('le nom part en capitales, comme sur la carte de membre', async () => {
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), '  rakotondrabe  ');
    await userEvent.type(screen.getByLabelText(/^Prénom/), '  Nirina  ');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() =>
      expect(derniere('profils')?.corps).toMatchObject({
        nom: 'RAKOTONDRABE',
        prenom: 'Nirina'
      })
    );
  });

  test('les informations privées partent dans leur PROPRE table', async () => {
    /* C'est le cœur de la protection des mineurs : une règle
       d'accès porte sur une ligne, jamais sur une colonne. Si la
       date de naissance partait dans « profils », elle serait
       visible de tout l'annuaire. */
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), 'Razafy');
    await userEvent.type(screen.getByLabelText(/^Prénom/), 'Lalaina');
    await userEvent.type(screen.getByLabelText('Date de naissance'), '2010-05-04');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() => expect(derniere('profils_prives')).toBeDefined());
    expect(derniere('profils_prives')?.corps).toMatchObject({
      profil_id: 'nouveau',
      date_naissance: '2010-05-04'
    });
    /* Et surtout : elle n'est PAS dans profils. */
    expect(derniere('profils')?.corps).not.toHaveProperty('date_naissance');
  });

  test('sans information privée, aucune ligne inutile n’est créée', async () => {
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), 'Razafy');
    await userEvent.type(screen.getByLabelText(/^Prénom/), 'Lalaina');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() => expect(derniere('profils')).toBeDefined());
    expect(derniere('profils_prives')).toBeUndefined();
  });

  test('la note de l’encadrement part dans la table PRIVÉE', async () => {
    /* Elle n'a rien à faire dans « profils » : l'annuaire est
       visible de tous les membres. */
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), 'Razafy');
    await userEvent.type(screen.getByLabelText(/^Prénom/), 'Lalaina');
    await userEvent.type(screen.getByLabelText('Note de l’encadrement'), 'Rentre à pied.');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() =>
      expect(derniere('profils_prives')?.corps).toMatchObject({ notes: 'Rentre à pied.' })
    );
    expect(derniere('profils')?.corps).not.toHaveProperty('notes');
  });

  test('une note seule suffit à créer la ligne privée', async () => {
    /* Sans quoi la note serait silencieusement perdue sur une fiche
       sans date de naissance ni téléphone — le cas ordinaire. */
    poser({ 'rpc:prochain_numero': 'F04x077', profils: [{ id: 'nouveau' }] });
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.type(await screen.findByLabelText(/^Nom/), 'Razafy');
    await userEvent.type(screen.getByLabelText(/^Prénom/), 'Lalaina');
    await userEvent.type(screen.getByLabelText('Note de l’encadrement'), 'Genou fragile.');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    await waitFor(() => expect(derniere('profils_prives')).toBeDefined());
  });

  test('modifier une fiche n’envoie NI le numéro NI le rôle', async () => {
    /* Un déclencheur de la base les fige : les envoyer ferait
       échouer toute la mise à jour, y compris les champs légitimes. */
    poser({
      profils: [{
        id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        photo: null, grades: GRADES[0], debut: '2019-09-09', biographie: null,
        profils_prives: null, tuteurs: []
      }]
    });
    rendre(<AdminFiche />, { route: '/admin/fiche/p1', chemin: '/admin/fiche/:id' });

    await userEvent.click(await screen.findByRole('button', { name: 'Enregistrer' }));

    const envoi = await waitFor(() => {
      const r = recues.find((x) => x.table === 'profils' && x.methode === 'PATCH');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).not.toHaveProperty('numero');
    expect(envoi.corps).not.toHaveProperty('role');
    expect(envoi.corps).not.toHaveProperty('grade_id');
    expect(envoi.corps).toMatchObject({ nom: 'RAKOTONDRABE' });
  });
});

describe('publier une actualité', () => {
  test('refuse un envoi incomplet, sans rien écrire', async () => {
    rendre(<AdminPublier />, { route: '/admin/publier' });
    await userEvent.click(await screen.findByRole('button', { name: 'Publier' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('obligatoires');
    expect(derniere('actualites')).toBeUndefined();
  });

  test('« Publier » marque publiee, « brouillon » ne le fait pas', async () => {
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Sortie au lac');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Sortie');
    await userEvent.type(screen.getByLabelText('Texte'), 'Départ 6h00.');
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() => expect(derniere('actualites')?.corps).toMatchObject({ publiee: true }));

    await userEvent.type(screen.getByLabelText(/^Titre/), 'Autre');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Réunion');
    await userEvent.type(screen.getByLabelText('Texte'), 'Samedi.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer en brouillon' }));

    /* Un brouillon n'est visible que de l'administration : c'est ce
       qui permet de préparer sans annoncer. */
    await waitFor(() => expect(derniere('actualites')?.corps).toMatchObject({ publiee: false }));
  });

  test('les champs facultatifs vides partent en null, pas en chaîne vide', async () => {
    /* Une chaîne vide en base se lit comme une valeur : l'écran
       afficherait un lieu nommé « rien ». */
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Sortie');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Sortie');
    await userEvent.type(screen.getByLabelText('Texte'), 'Départ.');
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() =>
      expect(derniere('actualites')?.corps).toMatchObject({ date_evt: null, lieu: null })
    );
  });

  test('l’image part en CHEMIN, jamais en adresse', async () => {
    /* Les seaux sont privés : l'adresse est signée et expire au bout
       d'une heure. L'enregistrer donnerait une actualité dont
       l'image cesse de s'afficher le lendemain. */
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Cérémonie');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Cérémonie');
    await userEvent.type(screen.getByLabelText('Texte'), 'Samedi.');
    await userEvent.upload(
      screen.getByLabelText(/Choisir/i),
      new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    );
    await screen.findByText('Jointe à cette actualité.');
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    const envoi = await waitFor(() => {
      const r = derniere('actualites');
      expect(r).toBeDefined();
      return r!;
    });
    const image = (envoi.corps as { image: string | null }).image;
    expect(image).toBeTruthy();
    expect(image).not.toMatch(/^https?:/);
  });

  test('sans image choisie, la colonne part en null', async () => {
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Réunion');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Réunion');
    await userEvent.type(screen.getByLabelText('Texte'), 'Mardi.');
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() => expect(derniere('actualites')?.corps).toMatchObject({ image: null }));
  });

  test('l’auteur n’est PAS envoyé par le téléphone', async () => {
    /* C'est un déclencheur de la base qui le pose, et qui écrase ce
       que l'appelant proposerait. Une valeur envoyée par le
       téléphone est une valeur qu'on peut choisir. */
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Sortie');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Sortie');
    await userEvent.type(screen.getByLabelText('Texte'), 'Départ.');
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() => expect(derniere('actualites')).toBeDefined());
    expect(derniere('actualites')?.corps).not.toHaveProperty('auteur_id');
  });
});

describe('prévenir les membres en publiant', () => {
  /* La liste validée à la livraison ne fait qu'un seul geste des
     deux : « publier une actualité, et envoyer la notification ».
     C'étaient deux écrans sans lien — on publiait, on oubliait de
     prévenir, et l'annonce dormait au casier. */
  const remplir = async () => {
    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Sortie au lac');
    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), 'Sortie');
    await userEvent.type(screen.getByLabelText('Texte'), 'Départ 6h00.');
  };

  test('publier envoie une notification par membre ACTIF', async () => {
    poser({ profils: [{ id: 'p1' }, { id: 'p2' }] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await remplir();
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() => {
      const envoi = derniere('notifications');
      expect(envoi).toBeDefined();
      const lignes = envoi!.corps as { profil_id: string; vers: string }[];
      expect(lignes).toHaveLength(2);
      expect(lignes[0]).toMatchObject({ vers: '/casier' });
    });
    /* Les membres désactivés ne sont pas prévenus : la requête le
       demande au serveur plutôt que de trier après coup. */
    const lecture = recues.find((r) => r.table === 'profils' && r.methode === 'GET');
    expect(lecture?.parametres.get('actif')).toBe('eq.true');
  });

  test('un BROUILLON ne prévient personne', async () => {
    /* Prévenir de quelque chose que personne ne peut lire serait le
       comble. */
    poser({ profils: [{ id: 'p1' }] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await remplir();
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer en brouillon' }));

    await waitFor(() => expect(derniere('actualites')).toBeDefined());
    expect(derniere('notifications')).toBeUndefined();
  });

  test('la case décochée ne prévient personne non plus', async () => {
    poser({ profils: [{ id: 'p1' }] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await remplir();
    await userEvent.click(screen.getByLabelText(/Prévenir les membres/));
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }));

    await waitFor(() => expect(derniere('actualites')).toBeDefined());
    expect(derniere('notifications')).toBeUndefined();
  });

  test('la notification ne part QU’APRÈS un enregistrement réussi', async () => {
    /* Prévenir d'une actualité que le serveur a refusée enverrait
       soixante-quatre membres au casier pour n'y rien trouver. */
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByRole('button', { name: 'Publier' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('obligatoires');
    expect(derniere('notifications')).toBeUndefined();
  });
});

describe('modifier une actualité déjà publiée', () => {
  const AU_CASIER = {
    id: 'a1', titre: 'Sortie au lac', categorie: 'Sortie', texte: 'Départ 6h00.',
    date_evt: '2026-09-12', lieu: 'Devant la salle', image: null,
    cree_le: new Date().toISOString(), profils: null
  };

  test('un appui charge l’actualité dans le formulaire', async () => {
    poser({ actualites: [AU_CASIER] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByLabelText('Modifier Sortie au lac'));

    expect(screen.getByLabelText(/^Titre/)).toHaveValue('Sortie au lac');
    expect(screen.getByLabelText('Texte')).toHaveValue('Départ 6h00.');
    expect(screen.getByLabelText('Lieu')).toHaveValue('Devant la salle');
  });

  test('l’enregistrement REMPLACE, il ne crée pas un doublon', async () => {
    poser({ actualites: [AU_CASIER] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByLabelText('Modifier Sortie au lac'));
    await userEvent.clear(screen.getByLabelText(/^Titre/));
    await userEvent.type(screen.getByLabelText(/^Titre/), 'Sortie au lac Mantasoa');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer et publier' }));

    await waitFor(() =>
      expect(derniere('actualites', 'PATCH')?.corps).toMatchObject({
        titre: 'Sortie au lac Mantasoa'
      })
    );
    /* Et surtout : aucune création. C'était le défaut de l'album —
       un identifiant capturé au rendu écrivait au mauvais endroit. */
    expect(derniere('actualites', 'POST')).toBeUndefined();
  });

  test('l’identifiant ne part PAS dans le corps de la mise à jour', async () => {
    /* Il sert à viser la ligne, pas à être réécrit. */
    poser({ actualites: [AU_CASIER] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByLabelText('Modifier Sortie au lac'));
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer et publier' }));

    await waitFor(() => expect(derniere('actualites', 'PATCH')).toBeDefined());
    expect(derniere('actualites', 'PATCH')?.corps).not.toHaveProperty('id');
  });

  test('annuler la modification rend le formulaire à une création', async () => {
    poser({ actualites: [AU_CASIER] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByLabelText('Modifier Sortie au lac'));
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.getByLabelText(/^Titre/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Publier' })).toBeInTheDocument();
  });

  test('la suppression demande confirmation, et dit ce qu’elle emporte', async () => {
    /* Les inscriptions à la sortie sont rattachées à cette ligne. */
    poser({ actualites: [AU_CASIER] });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await userEvent.click(await screen.findByLabelText('Supprimer Sortie au lac'));
    expect(screen.getByText(/versements rattachés partent avec elle/)).toBeInTheDocument();
    expect(derniere('actualites', 'DELETE')).toBeUndefined();

    await userEvent.click(screen.getByText('Oui, supprimer'));
    await waitFor(() => expect(derniere('actualites', 'DELETE')).toBeDefined());
  });
});

describe('envoyer une notification', () => {
  test('écrit une ligne PAR membre actif', async () => {
    /* La table porte profil_id : chacun marque la sienne comme lue
       sans toucher à celle des autres. Une seule ligne partagée
       rendrait « tout lire » global. */
    poser({ profils: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] });
    rendre(<AdminNotifier />, { route: '/admin/notifier' });

    await userEvent.type(await screen.findByLabelText(/^Titre/), 'Sortie samedi');
    await userEvent.click(screen.getByRole('button', { name: 'Prévenir tout le club' }));

    const envoi = await waitFor(() => {
      const r = derniere('notifications');
      expect(r).toBeDefined();
      return r!;
    });
    const lignes = envoi.corps as { profil_id: string; titre: string }[];
    expect(lignes).toHaveLength(3);
    expect(lignes.map((l) => l.profil_id)).toEqual(['p1', 'p2', 'p3']);
    expect(lignes.every((l) => l.titre === 'Sortie samedi')).toBe(true);
  });

  test('sans titre, le bouton reste inerte', async () => {
    poser({ profils: [{ id: 'p1' }] });
    rendre(<AdminNotifier />, { route: '/admin/notifier' });
    expect(await screen.findByRole('button', { name: 'Prévenir tout le club' })).toBeDisabled();
  });
});

describe('comptes et accès', () => {
  test('dit franchement que la fonction n’est pas déployée', async () => {
    /* Le pire serait de laisser croire qu'un compte a été créé :
       le club transmettrait un mot de passe qui n'ouvre rien. */
    poser({
      profils: [{
        id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        role: 'eleve', actif: true, compte_id: null
      }]
    });
    rendre(<AdminComptes />, { route: '/admin/comptes' });

    await userEvent.click(await screen.findByRole('button', { name: 'Créer le compte' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('n’est pas déployée');
  });

  test('affiche le mot de passe une fois, en prévenant qu’il ne reviendra pas', async () => {
    poser({
      profils: [{
        id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        role: 'eleve', actif: true, compte_id: null
      }],
      'fonction:comptes': { motDePasse: 'Xk7mNp2qRs4T' }
    });
    rendre(<AdminComptes />, { route: '/admin/comptes' });

    await userEvent.click(await screen.findByRole('button', { name: 'Créer le compte' }));
    const avis = await screen.findByRole('status');
    expect(avis).toHaveTextContent('Xk7mNp2qRs4T');
    /* La MÊME phrase que sur l'écran d'inscription : le mot de passe
       y était noyé dans un avis d'une ligne, il a maintenant son
       panneau, et les deux écrans qui montrent un mot de passe engendré
       disent désormais la même chose de la même façon. */
    expect(avis).toHaveTextContent('il ne s’affichera plus');
    /* Et le matricule AVEC, puisque c'est ce couple qu'on transmet. */
    expect(avis).toHaveTextContent('F04x042');
  });

  test('une fiche avec compte propose de réinitialiser, pas de créer', async () => {
    poser({
      profils: [{
        id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        role: 'eleve', actif: true, compte_id: 'u1'
      }]
    });
    rendre(<AdminComptes />, { route: '/admin/comptes' });
    expect(await screen.findByRole('button', { name: 'Réinitialiser' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Créer le compte' })).not.toBeInTheDocument();
  });

  test('compte les fiches sans compte, sans en faire une anomalie', async () => {
    poser({
      profils: [
        { id: 'p1', numero: 'F04x042', nom: 'A', prenom: 'a', role: 'eleve', actif: true, compte_id: 'u1' },
        { id: 'p2', numero: 'F04x043', nom: 'B', prenom: 'b', role: 'eleve', actif: true, compte_id: null },
        { id: 'p3', numero: 'F04x044', nom: 'C', prenom: 'c', role: 'eleve', actif: true, compte_id: null }
      ]
    });
    rendre(<AdminComptes />, { route: '/admin/comptes' });
    expect(await screen.findByText(/2 fiches sans compte/)).toBeInTheDocument();
  });
});

describe('attribuer le rôle de maître', () => {
  /* Fonctionnalité validée à la livraison de la maquette —
     « attribution du rôle de maître, par l'administration seule » —
     et qu'aucun écran ne tenait. L'espace des maîtres, construit et
     protégé, n'aurait servi qu'aux comptes posés à la main en base. */
  const MEMBRES = [
    { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
      role: 'eleve', actif: true, compte_id: 'u1' },
    { id: 'p0', numero: 'F04x001', nom: 'IDEALY', prenom: 'Santatra',
      role: 'admin', actif: true, compte_id: 'u0' }
  ];

  test('promeut un élève, et n’envoie QUE le rôle', async () => {
    /* Ni le numéro, ni le grade : un déclencheur de la base les fige,
       et les envoyer ferait échouer la mise à jour entière. */
    poser({ profils: MEMBRES });
    rendre(<AdminComptes />, { route: '/admin/comptes' });

    await userEvent.selectOptions(
      await screen.findByLabelText('Rôle de RAKOTONDRABE Nirina'),
      'maitre'
    );

    await waitFor(() =>
      expect(derniere('profils', 'PATCH')?.corps).toEqual({ role: 'maitre' })
    );
  });

  test('l’administration ne peut pas se retirer son PROPRE rôle', async () => {
    /* Ce n'est pas une sécurité — le tableau de bord le permettrait —
       c'est un garde-fou : sans administrateur, plus personne ne peut
       en nommer un depuis l'application. */
    poser({ profils: MEMBRES });
    rendre(<AdminComptes />, { route: '/admin/comptes' });

    expect(await screen.findByLabelText('Rôle de IDEALY Santatra')).toBeDisabled();
    expect(screen.getByLabelText('Rôle de RAKOTONDRABE Nirina')).not.toBeDisabled();
  });

  test('un refus du serveur ne s’annonce pas comme un succès', async () => {
    /* Même piège que la correction d'un message : un PATCH que la
       règle d'accès écarte ne touche aucune ligne et ne rend pas
       d'erreur. */
    poser({ profils: MEMBRES, 'profils:PATCH': [] });
    rendre(<AdminComptes />, { route: '/admin/comptes' });

    await userEvent.selectOptions(
      await screen.findByLabelText('Rôle de RAKOTONDRABE Nirina'),
      'maitre'
    );

    expect(await screen.findByText(/refusé ce changement de rôle/)).toBeInTheDocument();
  });
});

describe('changer son mot de passe', () => {
  test('l’ancien mot de passe est VÉRIFIÉ, pas seulement demandé', async () => {
    /* Supabase ne le contrôle pas : updateUser accepte n'importe
       quel nouveau mot de passe dès qu'une session est ouverte. Un
       téléphone laissé déverrouillé suffirait à s'emparer du compte.
       On se reconnecte donc avec ce qui a été saisi. */
    poserAuth({ token: { erreur: 'Invalid login credentials' } });
    rendre(<MotDePasse />, { route: '/motdepasse', profil: PROFIL_ELEVE });

    await userEvent.type(screen.getByLabelText('Mot de passe actuel'), 'faux');
    await userEvent.type(screen.getByLabelText('Nouveau mot de passe'), 'nouveaumdp1');
    await userEvent.type(screen.getByLabelText('Répéter le nouveau'), 'nouveaumdp1');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('actuel est incorrect');
    /* Et le changement n'a PAS été tenté. */
    expect(recues.find((r) => r.table === 'auth:user')).toBeUndefined();
  });

  test('refuse deux saisies différentes', async () => {
    rendre(<MotDePasse />, { route: '/motdepasse', profil: PROFIL_ELEVE });
    await userEvent.type(screen.getByLabelText('Mot de passe actuel'), 'ancien');
    await userEvent.type(screen.getByLabelText('Nouveau mot de passe'), 'nouveaumdp1');
    await userEvent.type(screen.getByLabelText('Répéter le nouveau'), 'nouveaumdp2');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ne sont pas identiques');
  });

  test('refuse un mot de passe trop court', async () => {
    rendre(<MotDePasse />, { route: '/motdepasse', profil: PROFIL_ELEVE });
    await userEvent.type(screen.getByLabelText('Mot de passe actuel'), 'ancien');
    await userEvent.type(screen.getByLabelText('Nouveau mot de passe'), 'court');
    await userEvent.type(screen.getByLabelText('Répéter le nouveau'), 'court');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('au moins 8 caractères');
  });

  test('avec le bon ancien mot de passe, le changement part', async () => {
    poserAuth({ token: sessionFactice(), user: { id: 'u1' } });
    rendre(<MotDePasse />, { route: '/motdepasse', profil: PROFIL_ELEVE });

    await userEvent.type(screen.getByLabelText('Mot de passe actuel'), 'bonancien');
    await userEvent.type(screen.getByLabelText('Nouveau mot de passe'), 'nouveaumdp1');
    await userEvent.type(screen.getByLabelText('Répéter le nouveau'), 'nouveaumdp1');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() =>
      expect(recues.find((r) => r.table === 'auth:user')?.corps).toMatchObject({
        password: 'nouveaumdp1'
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Mot de passe changé.');
  });
});

describe('les réglages du club', () => {
  test('l’upsert porte le libellé lisible, jamais la clé technique', async () => {
    /* Sans libellé, l'insertion d'un réglage neuf échouerait — la
       colonne est obligatoire. Avec la clé technique, chaque
       enregistrement écraserait « Numéro MVola » par
       « mvola_numero » dans le tableau de bord. */
    poser({
      reglages: [
        { cle: 'responsable', valeur: 'Idealy Itoerantsoa Santatra' },
        { cle: 'mvola_numero', valeur: '0388010853' }
      ],
      horaires: []
    });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Enregistrer les renseignements' })
    );

    const envoi = await waitFor(() => {
      const r = derniere('reglages');
      expect(r).toBeDefined();
      return r!;
    });
    const lignes = envoi.corps as { cle: string; libelle: string; valeur: string | null }[];
    const mvola = lignes.find((l) => l.cle === 'mvola_numero');
    expect(mvola?.libelle).toBe('Numéro MVola');
    expect(mvola?.valeur).toBe('0388010853');
  });

  test('un réglage laissé vide part en null, pas en chaîne vide', async () => {
    poser({ reglages: [], horaires: [] });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Enregistrer les renseignements' })
    );

    const lignes = (await waitFor(() => {
      const r = derniere('reglages');
      expect(r).toBeDefined();
      return r!;
    })).corps as { valeur: string | null }[];
    expect(lignes.every((l) => l.valeur === null)).toBe(true);
  });

  test('retirer une séance la DÉSACTIVE, sans la supprimer', async () => {
    /* Un créneau retiré pour les travaux revient souvent : le
       retrouver vaut mieux que de le ressaisir. */
    poser({
      reglages: [],
      horaires: [{ id: 'h1', jour: 2, debut: '17:30:00', fin: '19:00:00', niveau: 'Tous niveaux', lieu: null }]
    });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.click(await screen.findByLabelText('Retirer la séance du Mardi'));

    await waitFor(() => {
      const r = recues.find((x) => x.table === 'horaires' && x.methode === 'PATCH');
      expect(r?.corps).toMatchObject({ actif: false });
    });
    expect(recues.find((x) => x.table === 'horaires' && x.methode === 'DELETE')).toBeUndefined();
  });

  test('une séance s’ajoute avec ses secondes, comme l’attend Postgres', async () => {
    poser({ reglages: [], horaires: [] });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.selectOptions(await screen.findByLabelText('Jour'), '6');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter cette séance' }));

    await waitFor(() =>
      expect(derniere('horaires')?.corps).toMatchObject({
        jour: 6,
        debut: '17:30:00',
        fin: '19:00:00'
      })
    );
  });

  test('le LIEU part avec la séance', async () => {
    /* Il était affiché par l'écran du club et envoyé par personne :
       il restait donc éternellement vide, et un créneau au dojo ne
       se distinguait pas d'un créneau au gymnase. */
    poser({ reglages: [], horaires: [] });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.selectOptions(await screen.findByLabelText('Jour'), '3');
    await userEvent.type(screen.getByLabelText('Lieu'), 'Gymnase municipal');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter cette séance' }));

    await waitFor(() =>
      expect(derniere('horaires')?.corps).toMatchObject({ jour: 3, lieu: 'Gymnase municipal' })
    );
  });

  test('un lieu laissé vide part en null', async () => {
    poser({ reglages: [], horaires: [] });
    rendre(<AdminClub />, { route: '/admin/club' });

    await userEvent.selectOptions(await screen.findByLabelText('Jour'), '4');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter cette séance' }));

    await waitFor(() => expect(derniere('horaires')?.corps).toMatchObject({ lieu: null }));
  });
});

describe('pointer les versements', () => {
  const SORTIE = {
    id: 'a1', titre: 'Sortie au lac Mantasoa', categorie: 'Sortie',
    texte: 'Départ 6h00.', date_evt: '2026-09-12', lieu: null, image: null,
    cree_le: new Date().toISOString()
  };

  const PARTICIPATION = {
    id: 'pa1', accompagnants: 2, montant_promis: 5000,
    profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' },
    versements: [{ id: 'v1', montant: 5000, recu_le: '2026-09-01' }]
  };

  test('compte les places, l’inscrit compris', async () => {
    /* Trois places pour une inscription avec deux accompagnants :
       oublier l'inscrit lui-même ferait manquer un siège dans le
       car. */
    poser({ actualites: [SORTIE], participations: [PARTICIPATION] });
    rendre(<AdminParticipations />, { route: '/admin/participations' });

    await userEvent.click(await screen.findByText('Sortie au lac Mantasoa'));
    expect(await screen.findByText('places')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('le versement pointé part avec la participation', async () => {
    poser({ actualites: [SORTIE], participations: [PARTICIPATION] });
    rendre(<AdminParticipations />, { route: '/admin/participations' });

    await userEvent.click(await screen.findByText('Sortie au lac Mantasoa'));
    await userEvent.type(await screen.findByLabelText(/Montant reçu de Nirina/), '2000');
    await userEvent.click(screen.getByRole('button', { name: 'Pointer' }));

    await waitFor(() =>
      expect(derniere('versements')?.corps).toMatchObject({
        participation_id: 'pa1',
        montant: 2000
      })
    );
  });

  test('un montant vide ou nul laisse le bouton inerte', async () => {
    poser({ actualites: [SORTIE], participations: [PARTICIPATION] });
    rendre(<AdminParticipations />, { route: '/admin/participations' });

    await userEvent.click(await screen.findByText('Sortie au lac Mantasoa'));
    await screen.findByLabelText(/Montant reçu de Nirina/);
    expect(screen.getByRole('button', { name: 'Pointer' })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Montant reçu de Nirina/), '0');
    expect(screen.getByRole('button', { name: 'Pointer' })).toBeDisabled();
  });

  test('personne d’inscrit le dit, plutôt que d’afficher le vide', async () => {
    poser({ actualites: [SORTIE], participations: [] });
    rendre(<AdminParticipations />, { route: '/admin/participations' });
    await userEvent.click(await screen.findByText('Sortie au lac Mantasoa'));
    expect(await screen.findByText('Personne ne s’est encore inscrit.')).toBeInTheDocument();
  });
});

/* ============================================================
   Fixer la participation, encaisser en espèces, payer petit à petit.

   « Parfois un membre le paie en espèces, alors on peut valider
   directement la participation dans l'app sans que le membre envoie
   une invitation. Et parfois un membre paie petit à petit. »

   Le paiement fractionné existait DÉJÀ : la table « versements »
   enregistre une ligne par envoi depuis le premier jour. Ce qui
   manquait n'était pas la table, c'était le REPÈRE — combien il faut
   payer. Sans lui, « il a versé 30 000 » ne se compare à rien, et
   l'écran ne peut pas dire ce que le club veut savoir en regardant sa
   liste : « il reste 20 000 ».
   ============================================================ */
describe('la participation fixée et l’encaissement en espèces', () => {
  /* L'auteur de la sortie est celui qui rend le bouton visible : le
     serveur ne laisse que lui inscrire quelqu'un DÉJÀ validé
     (migration 0021). L'écran ne propose donc pas ce qui serait
     refusé. */
  const SORTIE_PAYANTE = {
    id: 'a1', titre: 'Sortie au lac Mantasoa', categorie: 'Sortie',
    texte: 'Départ 6h00.', date_evt: '2026-09-12', lieu: null, image: null,
    participation_ar: 15000, auteur_id: PROFIL_ADMIN.id,
    cree_le: new Date().toISOString()
  };

  const ANNUAIRE = [
    {
      id: 'p42', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
      photo: null, actif: true, grades: GRADES[0]
    },
    {
      id: 'p43', numero: 'F04x043', nom: 'RANDRIA', prenom: 'Soa',
      photo: null, actif: true, grades: GRADES[0]
    }
  ];

  const INSCRIT = {
    id: 'pa1', accompagnants: 2, montant_promis: 5000, note: null,
    profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' },
    versements: [{ id: 'v1', montant: 20000, recu_le: '2026-09-01' }]
  };

  const ouvrir = async () => {
    rendre(<AdminParticipations />, { route: '/admin/participations' });
    await userEvent.click(await screen.findByText('Sortie au lac Mantasoa'));
  };

  test('le reliquat se lit par membre : 45 000 attendus, 20 000 versés', async () => {
    poser({ actualites: [SORTIE_PAYANTE], participations: [INSCRIT], profils: ANNUAIRE });
    await ouvrir();

    expect(await screen.findByText('RAKOTONDRABE Nirina')).toBeInTheDocument();
    /* Trois places à quinze mille : l'accompagnant paie sa place. */
    expect(screen.getByText('reste 25 000 Ar')).toBeInTheDocument();
  });

  test('sur une sortie GRATUITE, aucun reliquat n’est affiché', async () => {
    /* Sans montant fixé, « reste −20 000 Ar » s'afficherait pour
       quelqu'un qui a donné sans qu'on demande rien. */
    poser({
      actualites: [{ ...SORTIE_PAYANTE, participation_ar: null }],
      participations: [INSCRIT],
      profils: ANNUAIRE
    });
    await ouvrir();

    await screen.findByText('RAKOTONDRABE Nirina');
    expect(screen.queryByText(/^reste /)).not.toBeInTheDocument();
  });

  test('inscrire en espèces crée une participation DÉJÀ validée', async () => {
    /* Le geste du samedi matin : on tend un billet, on dit
       « inscris-moi ». Jusqu'ici il fallait que le membre sorte son
       téléphone, s'inscrive, et que l'organisateur valide ensuite —
       trois gestes pour une phrase. */
    poser({
      actualites: [SORTIE_PAYANTE], participations: [INSCRIT], profils: ANNUAIRE,
      'participations:POST': [{ id: 'pa2' }]
    });
    await ouvrir();

    await userEvent.click(
      await screen.findByRole('button', { name: /Inscrire un membre payé en espèces/ })
    );
    await userEvent.selectOptions(await screen.findByLabelText('Le membre'), 'p43');
    await userEvent.clear(screen.getByLabelText('Montant reçu en espèces'));
    await userEvent.type(screen.getByLabelText('Montant reçu en espèces'), '15000');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire et pointer' }));

    const envoi = await waitFor(() => {
      const r = derniere('participations', 'POST');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toMatchObject({ actualite_id: 'a1', profil_id: 'p43' });
    /* DÉJÀ validée : c'est tout l'intérêt. Une inscription en attente
       obligerait l'organisateur à revenir la valider alors qu'il tient
       l'argent dans la main. */
    expect((envoi.corps as { valide_le: string | null }).valide_le).toBeTruthy();

    /* Et le versement suit, rattaché à l'inscription qui vient d'être
       créée — jamais avant, il n'aurait rien à quoi se rattacher. */
    await waitFor(() =>
      expect(derniere('versements')?.corps).toMatchObject({
        participation_id: 'pa2',
        montant: 15000
      })
    );
  });

  test('sans versement, on inscrit quand même : c’est « il paiera plus tard »', async () => {
    /* Le cas « petit à petit » commence souvent à zéro : on note la
       place, on encaisse ensuite. Exiger un montant obligerait à
       taper un chiffre faux. */
    poser({
      actualites: [SORTIE_PAYANTE], participations: [], profils: ANNUAIRE,
      'participations:POST': [{ id: 'pa2' }]
    });
    await ouvrir();

    await userEvent.click(
      await screen.findByRole('button', { name: /Inscrire un membre payé en espèces/ })
    );
    await userEvent.selectOptions(await screen.findByLabelText('Le membre'), 'p42');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire et pointer' }));

    await waitFor(() => expect(derniere('participations', 'POST')).toBeDefined());
    /* Aucun versement n'est parti : zéro n'est pas un encaissement. */
    expect(derniere('versements')).toBeUndefined();
  });

  test('quelqu’un de déjà inscrit n’est pas proposé', async () => {
    /* La base a une contrainte d'unicité : le proposer mènerait droit
       au refus, et l'on chercherait pourquoi. */
    poser({ actualites: [SORTIE_PAYANTE], participations: [INSCRIT], profils: ANNUAIRE });
    await ouvrir();

    await userEvent.click(
      await screen.findByRole('button', { name: /Inscrire un membre payé en espèces/ })
    );
    const liste = await screen.findByLabelText('Le membre');
    expect(liste).toHaveTextContent('RANDRIA Soa');
    expect(liste).not.toHaveTextContent('RAKOTONDRABE Nirina');
  });

  test('un administrateur qui n’a pas créé la sortie ne voit pas le bouton', async () => {
    /* Ce n'est pas cet écran qui protège — c'est le déclencheur de la
       0021. Mais proposer un bouton dont l'appui finit toujours par un
       refus est une promesse qu'on ne tient pas. */
    poser({
      actualites: [{ ...SORTIE_PAYANTE, auteur_id: 'quelquun-dautre' }],
      participations: [INSCRIT],
      profils: ANNUAIRE
    });
    await ouvrir();

    await screen.findByText('RAKOTONDRABE Nirina');
    expect(
      screen.queryByRole('button', { name: /Inscrire un membre payé en espèces/ })
    ).not.toBeInTheDocument();
  });
});
