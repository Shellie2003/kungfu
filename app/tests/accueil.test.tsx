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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accueil } from '../src/ecrans/Accueil';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
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
  test('elle s’ajoute SUR L’ACCUEIL, sans passer par l’administration', async () => {
    /* Le contrôle existait, tout en bas de l'écran d'administration,
       après les horaires et dix champs de texte. « On ne peut pas
       ajouter une photo de club » : il n'était pas absent, il était
       introuvable. */
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    await userEvent.click(await screen.findByLabelText('Ajouter la photo du club'));
    expect(await screen.findByLabelText(/Prendre une photo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Importer depuis la galerie/)).toBeInTheDocument();
  });

  test('le bouton SE VOIT — une pastille « + » sur l’emplacement', async () => {
    /* Sans elle, l'emplacement avait exactement l'aspect qu'il avait
       avant de devenir un bouton, et le club a signalé TROIS FOIS ne
       pas trouver comment ajouter une image. Un bouton qui ne se
       voit pas n'est pas un bouton.

       Elle est en absolu et sans texte : la mesure de conformité à
       la maquette refuse un décalage comme un texte de plus. */
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    const bouton = await screen.findByLabelText('Ajouter la photo du club');
    /* On vise le SPAN, pas n'importe quoi de « aria-hidden » : les
       icônes elles-mêmes le portent, et le premier essai attrapait
       le pictogramme du fond. */
    const pastille = bouton.querySelector<HTMLElement>('span[aria-hidden="true"]');
    expect(pastille).not.toBeNull();
    expect(pastille?.querySelector('svg')).not.toBeNull();
    /* Hors du flux : c'est ce qui laisse la géométrie intacte. */
    expect(pastille?.style.position).toBe('absolute');
    /* Et muette : un texte de plus serait refusé par la mesure. */
    expect(pastille?.textContent).toBe('');
  });

  test('au repos, rien ne s’ajoute à l’écran de la maquette', async () => {
    /* La feuille n'existe dans le document qu'une fois ouverte. Une
       première version posait les deux boutons À MÊME
       l'emplacement : la mesure l'a refusée — « Photo du club à
       fournir » remontait de 30 px. */
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    await screen.findByLabelText('Ajouter la photo du club');
    expect(screen.queryByLabelText(/Prendre une photo/)).not.toBeInTheDocument();
    expect(screen.queryByText('Photo du club')).not.toBeInTheDocument();
  });

  test('« Prendre » ouvre l’appareil, « Importer » la galerie', async () => {
    /* « capture » ouvre l'appareil photo ET ferme la porte à la
       galerie : un seul bouton ne pouvait pas faire les deux. */
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    await userEvent.click(await screen.findByLabelText('Ajouter la photo du club'));
    expect(await screen.findByLabelText(/Prendre une photo/)).toHaveAttribute(
      'capture',
      'environment'
    );
    expect(screen.getByLabelText(/Importer depuis la galerie/)).not.toHaveAttribute('capture');
  });

  test('la photo choisie part, et le réglage est écrit', async () => {
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ADMIN });
    await userEvent.click(await screen.findByLabelText('Ajouter la photo du club'));
    await userEvent.upload(
      await screen.findByLabelText(/Importer depuis la galerie/),
      new File(['x'], 'dojo.jpg', { type: 'image/jpeg' })
    );

    /* Deux écritures, dans cet ordre : le fichier dans le seau, puis
       le CHEMIN dans les réglages. Sans la seconde, la photo serait
       sur le serveur et l'accueil resterait vide — exactement le
       symptôme déjà vu avec les pièces jointes. */
    await waitFor(() => expect(derniere('reglages')).toBeDefined());
    expect(recues.some((r) => r.chemin?.includes('/object/album/'))).toBe(true);
    expect(derniere('reglages')?.corps).toMatchObject([
      { cle: 'photo_club', libelle: 'Photo du club' }
    ]);
  });

  test('un élève voit l’emplacement, sans aucun bouton', async () => {
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

/* ============================================================
   Le carrousel.

   « Je veux que cette carte devienne un carrousel auto-animé, pour
   plus de visionnage de l'info et d'image. » L'accueil ne montrait
   qu'UNE photo pendant que les dizaines de l'album dormaient à deux
   écrans de là.

   Ce qui est vérifié ici tient surtout à ce qu'il ne doit PAS faire :
   une seule image n'est pas un carrousel, et l'accueil doit rester
   identique à la maquette tant que le club n'a rien fourni.
   ============================================================ */
const ALBUM = {
  id: 'al1',
  titre: 'Championnat régional',
  categorie: 'Compétitions',
  couverture: null,
  photos: [
    { id: 'ph1', chemin: 'une.jpg', legende: 'Finale par équipe', rang: 1 },
    { id: 'ph2', chemin: 'deux.jpg', legende: null, rang: 2 }
  ]
};

describe('le carrousel de l’accueil', () => {
  test('rassemble la photo du club ET celles de l’album', async () => {
    poser({
      reglages: [{ cle: 'photo_club', valeur: 'club.jpg' }],
      albums: [ALBUM]
    });
    rendre(<Accueil />, { route: '/accueil' });

    /* Trois vues : le club, puis les deux clichés. Le serveur simulé
       rend de vraies adresses signées — sans quoi ce test passerait
       sur une fiction, comme cela s'est déjà produit. */
    await waitFor(() =>
      expect(document.querySelectorAll('.carrousel__vue').length).toBe(3)
    );
    /* Les points disent qu'il y a autre chose à voir. Sans eux, le
       carrousel se réduit à une image qui change sans qu'on
       comprenne pourquoi. */
    expect(document.querySelectorAll('.carrousel__point')).toHaveLength(3);
  });

  test('la légende d’une photo la nomme, à défaut son album', async () => {
    poser({ albums: [ALBUM] });
    rendre(<Accueil />, { route: '/accueil' });

    expect(await screen.findByText('Finale par équipe')).toBeInTheDocument();
    /* La seconde n'a pas de légende : le titre de l'album vaut mieux
       qu'un vide. */
    expect(screen.getByText('Championnat régional')).toBeInTheDocument();
  });

  test('UNE seule image n’est pas un carrousel — aucun point', async () => {
    poser({ reglages: [{ cle: 'photo_club', valeur: 'club.jpg' }], albums: [] });
    rendre(<Accueil />, { route: '/accueil' });

    await waitFor(() =>
      expect(document.querySelectorAll('.carrousel__vue').length).toBe(1)
    );
    expect(document.querySelectorAll('.carrousel__point')).toHaveLength(0);
  });

  test('sans aucune image, l’emplacement de la maquette, tel quel', async () => {
    /* C'est ce qui permet à la comparaison d'images de rester juste :
       tant que le club n'a rien fourni, l'accueil est exactement
       celui qu'il a validé. */
    rendre(<Accueil />, { route: '/accueil', profil: PROFIL_ELEVE });
    expect(await screen.findByText('Photo du club à fournir')).toBeInTheDocument();
    expect(document.querySelectorAll('.carrousel__vue')).toHaveLength(0);
  });
});
