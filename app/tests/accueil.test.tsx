/* ============================================================
   L'accueil — les cinq fonctionnalités validées à la livraison.

     acc-logo          Logo et nom du club
     acc-visuel        Photo du club
     acc-presentation  Présentation courte
     acc-vaovao        Dernières actualités
     acc-notif         Pastille de notification

   L'écran n'avait AUCUN test : c'est le premier qu'on ouvre, celui
   que la maquette montre en premier, et il reposait entièrement sur
   la comparaison d'images. Or une comparaison d'images ne dit pas
   d'où vient un texte — elle voit « KUNG-FU WAISHI » et ne sait pas
   s'il vient de la base ou du code.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { Accueil } from '../src/ecrans/Accueil';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, rendre } from './rendu';

const SORTIE = {
  id: 'a1',
  titre: 'Sortie au lac Mantasoa',
  categorie: 'Sortie',
  texte: 'Départ 6h00 devant la salle. Prévoir le repas.',
  date_evt: '2026-09-12',
  lieu: 'Devant la salle',
  image: null,
  cree_le: new Date().toISOString(),
  profils: null
};

const VIDE = { actualites: [], notifications: [], profils: [], horaires: [], reglages: [] };

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser(VIDE);
});

/* ---------------------------------------------- acc-logo */
describe('le logo et le nom du club', () => {
  /* Le club a déposé son logo dans img/ — la maquette le place
     partout depuis le premier jour. L'application, elle, dessinait
     un écusson générique : le club voyait son logo dans la maquette
     et jamais dans l'application. */
  test('l’emblème porte le logo du club, pas un écusson', async () => {
    rendre(<Accueil />, { route: '/accueil' });
    const emblemes = document.querySelectorAll('.emblem');
    expect(emblemes.length).toBeGreaterThan(0);
    /* La classe « emblem--img » et une image : c'est exactement ce
       que la maquette pose, et le même fichier source. */
    expect(emblemes[0]).toHaveClass('emblem--img');
    expect(emblemes[0]?.querySelector('img')).toBeInTheDocument();
  });

  test('le nom vient du réglage, pas du code', async () => {
    /* Il était écrit en dur dans l'en-tête, et lu depuis le réglage
       dans la carte juste en dessous : renommer le club dans
       l'administration donnait DEUX noms sur le même écran. */
    poser({ reglages: [{ cle: 'nom_club', valeur: 'Waishi Antananarivo' }] });
    rendre(<Accueil />, { route: '/accueil' });

    expect(await screen.findByText('WAISHI ANTANANARIVO')).toBeInTheDocument();
    expect(screen.queryByText('KUNG-FU WAISHI')).not.toBeInTheDocument();
  });

  test('sans réglage, l’écran reste celui que le club a validé', async () => {
    rendre(<Accueil />, { route: '/accueil' });
    /* Le repli est le texte de la maquette, mot pour mot. C'est ce
       qui permet à la comparaison d'images de rester juste tant que
       le club n'a rien saisi. */
    expect(await screen.findByText('KUNG-FU WAISHI')).toBeInTheDocument();
    expect(screen.getByText('Analamahitsy · Antananarivo')).toBeInTheDocument();
  });
});

/* ---------------------------------------------- acc-visuel */
describe('la photo du club', () => {
  /* « La possibilité d'ajouter une photo du club » : elle existait,
     mais dans l'écran d'administration, à trois appuis de l'endroit
     où l'on constate qu'elle manque. */
  test('l’emplacement vide EST le bouton, pour l’administration', async () => {
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    expect(await screen.findByLabelText('Ajouter la photo du club')).toBeInTheDocument();
  });

  test('un élève voit l’emplacement, pas un bouton', async () => {
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ELEVE });
    /* Le texte reste — il dit honnêtement ce qui manque — mais rien
       ne propose une action que le serveur refuserait. */
    expect(await screen.findByText('Photo du club à fournir')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ajouter la photo du club')).not.toBeInTheDocument();
  });
});

/* ---------------------------------------------- acc-presentation */
describe('la présentation courte', () => {
  test('vient du réglage quand il est posé', async () => {
    poser({
      reglages: [{ cle: 'presentation_courte', valeur: 'Le kung-fu Waishi depuis 1998.' }]
    });
    rendre(<Accueil />, { route: '/accueil' });
    expect(await screen.findByText('Le kung-fu Waishi depuis 1998.')).toBeInTheDocument();
  });
});

/* ---------------------------------------------- acc-vaovao */
describe('les dernières actualités', () => {
  test('les deux plus récentes, et pas davantage', async () => {
    const trois = [1, 2, 3].map((n) => ({ ...SORTIE, id: `a${n}`, titre: `Actualité ${n}` }));
    poser({ actualites: trois });
    rendre(<Accueil />, { route: '/accueil' });

    /* « Actualité 1 » paraît DEUX fois, et c'est voulu : la plus
       récente s'annonce aussi dans le bandeau vert, en haut. */
    expect(await screen.findAllByText('Actualité 1')).toHaveLength(2);
    expect(screen.getByText('Actualité 2')).toBeInTheDocument();
    /* « Les deux plus récentes, avec lien vers le casier » : la
       troisième se lit dans le casier, pas ici. */
    expect(screen.queryByText('Actualité 3')).not.toBeInTheDocument();
  });

  test('le casier vide propose de le remplir, à l’administration', async () => {
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    expect(await screen.findByText('Aucune actualité pour le moment.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publier la première/ })).toBeInTheDocument();
  });

  test('un élève voit le vide, sans proposition', async () => {
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ELEVE });
    expect(await screen.findByText('Aucune actualité pour le moment.')).toBeInTheDocument();
    expect(screen.queryByText(/Publier la première/)).not.toBeInTheDocument();
  });
});

/* ---------------------------------------------- acc-notif */
describe('la pastille de notification', () => {
  test('compte les non-lues, et disparaît quand tout est lu', async () => {
    poser({
      notifications: [
        { id: 'n1', titre: 'A', texte: '', vers: null, lue_le: null, cree_le: SORTIE.cree_le },
        { id: 'n2', titre: 'B', texte: '', vers: null, lue_le: null, cree_le: SORTIE.cree_le },
        { id: 'n3', titre: 'C', texte: '', vers: null, lue_le: SORTIE.cree_le, cree_le: SORTIE.cree_le }
      ]
    });
    rendre(<Accueil />, { route: '/accueil' });

    /* Deux non-lues sur trois. Le nom accessible le DIT : une
       pastille rouge sans texte n'annonce rien à un lecteur
       d'écran. */
    expect(await screen.findByLabelText('Notifications, 2 non lues')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('sans rien à lire, aucune pastille', async () => {
    rendre(<Accueil />, { route: '/accueil' });
    expect(await screen.findByLabelText('Notifications')).toBeInTheDocument();
  });
});
