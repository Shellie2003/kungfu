/* ============================================================
   L'annuaire et la fiche.

   Deux comportements y sont structurants, et tous deux viennent du
   client : un élève SANS COMPTE doit figurer comme les autres, et
   la fiche montre le verrou ou les informations selon ce que le
   SERVEUR a rendu — jamais selon un test de rôle fait ici.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Etudiants } from '../src/ecrans/Etudiants';
import { Profil } from '../src/ecrans/Profil';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

const GRADES = [
  { id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true },
  { id: 'gn', nom: 'Ceinture noire', couleur: '#1E2320', rang: 6, actif: true }
];

const MEMBRES = [
  {
    id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
    photo: null, grades: GRADES[0]
  },
  {
    id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery',
    photo: null, grades: GRADES[1]
  },
  /* L'élève sans téléphone, donc sans compte. Il n'a pas de grade
     non plus : c'est le cas le plus dépouillé que l'écran doit
     tenir sans se casser. */
  {
    id: 'p6', numero: 'F04x061', nom: 'RANDRIAMAMPIONONA', prenom: 'Toky',
    photo: null, grades: null
  }
];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser({ grades: GRADES, profils: MEMBRES });
});

describe('l’annuaire', () => {
  test('affiche tout le monde, y compris l’élève sans compte', async () => {
    rendre(<Etudiants />);
    expect(await screen.findByText('RAKOTONDRABE')).toBeInTheDocument();
    /* Le cas qui a imposé toute l'architecture : « tsy izy rehetra
       manana android ». Une fiche sans compte est ordinaire. */
    expect(screen.getByText('RANDRIAMAMPIONONA')).toBeInTheDocument();
    expect(screen.getByText(/3 membres/)).toBeInTheDocument();
  });

  test('une fiche sans grade s’affiche quand même', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RANDRIAMAMPIONONA');
    /* Aucune pastille de grade, mais la ligne existe : un grade
       absent ne doit pas faire disparaître le membre. */
    expect(screen.getByText('Toky')).toBeInTheDocument();
  });

  test('la recherche ignore la casse et les accents', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');

    await userEvent.type(screen.getByLabelText(/Rechercher/i), 'hery');
    expect(screen.getByText('RABEMANANJARA')).toBeInTheDocument();
    expect(screen.queryByText('RAKOTONDRABE')).not.toBeInTheDocument();
    expect(screen.getByText(/1 membre/)).toBeInTheDocument();
  });

  test('une recherche sans résultat le dit, plutôt que d’afficher le vide', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');
    await userEvent.type(screen.getByLabelText(/Rechercher/i), 'zzzz');
    expect(screen.getByText('Aucun membre ne correspond.')).toBeInTheDocument();
  });

  test('le filtre par grade vient de la base, avec sa majuscule', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');

    /* Les puces disent « Verte », pas « verte » ni « Ceinture
       verte » : la place manque, mais une minuscule se lit comme
       une faute. */
    const puce = screen.getByRole('button', { name: 'Verte' });
    await userEvent.click(puce);

    expect(screen.getByText('RAKOTONDRABE')).toBeInTheDocument();
    expect(screen.queryByText('RABEMANANJARA')).not.toBeInTheDocument();
  });

  test('un second appui sur la puce active retire le filtre', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');
    const puce = screen.getByRole('button', { name: 'Verte' });
    await userEvent.click(puce);
    await userEvent.click(puce);
    expect(screen.getByText('RABEMANANJARA')).toBeInTheDocument();
  });
});

describe('la fiche', () => {
  test('sans informations privées, elle montre le verrou', async () => {
    /* Et c'est le SERVEUR qui l'a décidé : il n'a rien rendu de
       privé. L'écran ne teste aucun rôle — s'il le faisait, on
       croirait que c'est l'application qui protège. */
    poser({
      profils: [{ ...MEMBRES[0], debut: null, biographie: null, profils_prives: null, tuteurs: [] }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText('Informations réservées')).toBeInTheDocument();
    expect(screen.getByText('Date de naissance')).toBeInTheDocument();
    /* Les champs sont NOMMÉS mais vides : on sait ce qu'on
       obtiendrait, plutôt qu'un mur nu. */
    expect(screen.queryByText('14 mars 2006')).not.toBeInTheDocument();
  });

  test('avec les informations privées, elle les montre', async () => {
    poser({
      profils: [{
        ...MEMBRES[0],
        debut: '2019-09-09',
        biographie: 'Entrée au club à treize ans.',
        profils_prives: { date_naissance: '2006-03-14', telephone: null, adresse: null },
        tuteurs: []
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText('14 mars 2006')).toBeInTheDocument();
    expect(screen.getByText('9 septembre 2019')).toBeInTheDocument();
    expect(screen.getByText('Entrée au club à treize ans.')).toBeInTheDocument();
    expect(screen.queryByText('Informations réservées')).not.toBeInTheDocument();
  });

  test('la jointure un-à-un rendue en TABLEAU est acceptée', async () => {
    /* PostgREST rend une relation un-à-un tantôt en objet, tantôt
       en tableau selon la forme de la requête. Ne gérer qu'un des
       deux vide la fiche sans erreur visible. */
    poser({
      profils: [{
        ...MEMBRES[0],
        debut: null, biographie: null,
        profils_prives: [{ date_naissance: '2006-03-14', telephone: null, adresse: null }],
        tuteurs: []
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });
    expect(await screen.findByText('14 mars 2006')).toBeInTheDocument();
  });

  test('le tuteur à prévenir en urgence passe en tête', async () => {
    poser({
      profils: [{
        ...MEMBRES[0], debut: null, biographie: null, profils_prives: null,
        tuteurs: [
          { id: 't2', nom: 'RAKOTONDRABE Jean-Claude', lien: 'Père', telephone: '033 41 907 12', urgence: false },
          { id: 't1', nom: 'RAKOTONDRABE Voahangy', lien: 'Mère', telephone: '034 22 118 40', urgence: true }
        ]
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Parents ou tuteur');
    const noms = screen.getAllByText(/RAKOTONDRABE (Voahangy|Jean-Claude)/);
    expect(noms[0]).toHaveTextContent('Voahangy');

    /* Et le bloc « à prévenir en urgence » nomme la bonne personne. */
    expect(screen.getByText('RAKOTONDRABE Voahangy, en priorité')).toBeInTheDocument();
  });

  test('le numéro de téléphone est composable d’un appui', async () => {
    poser({
      profils: [{
        ...MEMBRES[0], debut: null, biographie: null, profils_prives: null,
        tuteurs: [{ id: 't1', nom: 'Mère', lien: 'Mère', telephone: '034 22 118 40', urgence: true }]
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });

    const lien = await screen.findByRole('link', { name: /034 22 118 40/ });
    /* Les espaces retirés : « tel:034 22 » ne compose pas. */
    expect(lien).toHaveAttribute('href', 'tel:0342211840');
  });

  test('une fiche inaccessible le dit, sans écran blanc', async () => {
    poser({ profils: [] });
    rendre(<Profil />, { route: '/etudiants/inconnu', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });
    expect(await screen.findByText('Cette fiche n’est pas accessible.')).toBeInTheDocument();
  });

  test('sur MA fiche, le raccourci vers le mot de passe apparaît', async () => {
    poser({
      profils: [{
        ...MEMBRES[0], debut: null, biographie: 'x', profils_prives: null, tuteurs: []
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p1', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });
    expect(await screen.findByLabelText('Changer le mot de passe')).toBeInTheDocument();
  });

  test('sur la fiche d’un autre, ce raccourci n’apparaît pas', async () => {
    poser({
      profils: [{
        ...MEMBRES[1], debut: null, biographie: 'x', profils_prives: null, tuteurs: []
      }]
    });
    rendre(<Profil />, { route: '/etudiants/p4', chemin: '/etudiants/:id', profil: PROFIL_ELEVE });
    /* Le nom paraît deux fois — en titre et dans la liste des
       informations. On attend donc les DEUX plutôt qu'un seul. */
    expect(await screen.findAllByText('RABEMANANJARA')).toHaveLength(2);
    expect(screen.queryByLabelText('Changer le mot de passe')).not.toBeInTheDocument();
  });
});

describe('l’accessibilité', () => {
  test('chaque grade est écrit, jamais porté par la seule couleur', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');
    /* Un daltonien ne distingue pas le vert du orange. Le nom du
       grade accompagne donc toujours la pastille. */
    const lignes = screen.getAllByRole('button');
    const ligne = lignes.find((l) => within(l).queryByText('RAKOTONDRABE'));
    expect(within(ligne!).getByText('Ceinture verte')).toBeInTheDocument();
  });
});
