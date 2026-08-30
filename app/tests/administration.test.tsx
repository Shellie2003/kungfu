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
import { PROFIL_ELEVE, rendre } from './rendu';

const GRADES = [{ id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true }];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser({ grades: GRADES });
});

describe('ajouter un étudiant', () => {
  test('refuse d’envoyer sans nom ni prénom', async () => {
    rendre(<AdminFiche />, { route: '/admin/fiche', chemin: '/admin/fiche' });

    await userEvent.click(await screen.findByRole('button', { name: 'Créer la fiche' }));
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
    await userEvent.click(screen.getByRole('button', { name: 'Créer la fiche' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Créer la fiche' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Créer la fiche' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Créer la fiche' }));

    await waitFor(() => expect(derniere('profils')).toBeDefined());
    expect(derniere('profils_prives')).toBeUndefined();
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
    expect(avis).toHaveTextContent('il ne sera plus affiché');
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
