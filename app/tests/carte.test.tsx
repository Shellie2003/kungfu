/* ============================================================
   La carte de membre, et son enregistrement en image.

   « Enregistrer en image — pour l'envoyer ou l'imprimer » : la
   maquette le promettait et cela n'avait jamais été fait. C'est
   pourtant l'usage le plus concret de cet écran — envoyer sa carte
   au maître, la garder quand le réseau tombe, la faire imprimer au
   kiosque du quartier. Aucun des trois ne passe par une capture
   d'écran, où l'on voit la barre d'état et la moitié des onglets.

   ------------------------------------------------------------
   CE QUE CES TESTS TIENNENT

   Ils tiennent la COMPOSITION — ce que l'image contient, et surtout
   ce qu'elle ne contient pas — et le chemin de l'écran jusqu'au
   fichier. Ils ne tiennent pas l'apparence : une toile de 1011 sur
   638 ne se compare pas dans un test unitaire, et c'est le banc de
   comparaison qui regarde à quoi ressemble un écran.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { CarteMembre } from '../src/ecrans/CarteMembre';
import { dessinerCarte, nomFichierCarte } from '../src/services/carteImage';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { rendre, PROFIL_ELEVE } from './rendu';

const FICHE = {
  id: 'p1',
  numero: 'F04x042',
  nom: 'RAKOTONDRABE',
  prenom: 'Nirina',
  photo: null,
  actif: true,
  debut: '2019-09-09',
  biographie: null,
  grades: { nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4 },
  profils_prives: null,
  tuteurs: []
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('le nom du fichier', () => {
  test('porte le matricule', () => {
    /* Dix cartes dans le même dossier de téléchargements se
       distinguent alors sans qu'on les ouvre. */
    expect(nomFichierCarte('F04x042')).toBe('carte-F04x042.png');
  });
});

describe('ce que l’image contient', () => {
  /* On n'inspecte pas des pixels : on écoute ce que le dessin
     DEMANDE à la toile. C'est ce qui permet de vérifier qu'une
     information privée n'y entre pas — la seule chose qui compte
     vraiment ici, parce qu'une image se transmet, se reçoit par
     erreur, et reste dans la galerie d'un téléphone partagé. */
  function toileEspionne() {
    const ecrits: string[] = [];
    const faux = {
      fillStyle: '', font: '', textBaseline: '', textAlign: '',
      fillRect: vi.fn(), fillText: (t: string) => ecrits.push(t),
      drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(), clip: vi.fn(),
      beginPath: vi.fn(), moveTo: vi.fn(), arcTo: vi.fn(), arc: vi.fn(),
      closePath: vi.fn(), fill: vi.fn()
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      faux as unknown as CanvasRenderingContext2D
    );
    return ecrits;
  }

  const CARTE = {
    nomClub: 'Kung-fu Waishi',
    nom: 'RAKOTONDRABE',
    prenom: 'Nirina',
    grade: 'Ceinture verte',
    couleurGrade: '#4E9C57',
    numero: 'F04x042',
    depuis: '9 septembre 2019',
    lieuClub: 'Analamahitsy',
    qr: null,
    portrait: null
  };

  test('le nom, le prénom, le grade, le matricule et le club', () => {
    const ecrits = toileEspionne();
    dessinerCarte(CARTE);

    expect(ecrits).toContain('RAKOTONDRABE');
    expect(ecrits).toContain('Nirina');
    expect(ecrits).toContain('Ceinture verte');
    expect(ecrits).toContain('F04x042');
    expect(ecrits).toContain('KUNG-FU WAISHI');
    expect(ecrits).toContain('Analamahitsy');
  });

  test('RIEN de privé n’y entre', () => {
    /* LE TEST QUI COMPTE. Une image se transmet — c'est même sa
       raison d'être ici. Y glisser une date de naissance ou le
       téléphone d'un tuteur ferait circuler dans les conversations
       du club ce que la fiche garde derrière une session. */
    const ecrits = toileEspionne().join(' ');
    dessinerCarte({ ...CARTE });

    expect(ecrits).not.toMatch(/2006/);
    expect(ecrits).not.toMatch(/03[34]\s?\d{2}/);
    expect(ecrits).not.toMatch(/naissance|tuteur|adresse/i);
  });

  test('sans grade, la carte se dessine quand même', () => {
    /* Un membre qui vient de s'inscrire n'a pas encore de ceinture,
       et c'est le cas ORDINAIRE d'une fiche neuve. */
    const ecrits = toileEspionne();
    expect(() => dessinerCarte({ ...CARTE, grade: null })).not.toThrow();
    expect(ecrits).toContain('F04x042');
  });

  test('sans date de début, la carte ne dit pas « Membre depuis null »', () => {
    const ecrits = toileEspionne();
    dessinerCarte({ ...CARTE, depuis: null });
    expect(ecrits).toContain('Membre du club');
    expect(ecrits.join(' ')).not.toMatch(/null/);
  });
});

describe('l’écran', () => {
  test('propose d’enregistrer et d’imprimer, et pas de régénérer', async () => {
    /* « Régénérer le code » figurait dans la maquette et n'est pas
       fait : ce code encode le MATRICULE, qui est déjà écrit en
       toutes lettres sur la carte. Il n'y a rien à régénérer, et un
       bouton qui prétendrait le faire laisserait croire qu'une carte
       perdue se révoque. */
    poser({ profils: FICHE, reglages: [] });
    rendre(<CarteMembre />, { route: '/carte', profil: PROFIL_ELEVE });

    expect(await screen.findByText('Enregistrer en image')).toBeInTheDocument();
    expect(screen.getByText('Imprimer la carte')).toBeInTheDocument();
    expect(screen.queryByText('Régénérer le code')).not.toBeInTheDocument();
  });

  test('un appareil sans toile le DIT, au lieu de rendre une image vide', () => {
    /* Sur un appareil où la toile n'est pas disponible, le dessin
       doit lever plutôt que rendre une carte blanche : l'écran
       attrape et affiche le message. Rien, sur un téléphone, ne se
       distingue d'une application figée.

       C'est vérifié ICI et non à l'écran : jsdom n'a pas de toile du
       tout, et un test d'écran mesurerait le manque de jsdom plutôt
       que le comportement de l'application. */
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(() =>
      dessinerCarte({
        nomClub: 'Kung-fu Waishi', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        grade: null, couleurGrade: '#4E9C57', numero: 'F04x042',
        depuis: null, lieuClub: 'Analamahitsy', qr: null, portrait: null
      })
    ).toThrow(/pas possible sur cet appareil/);
  });
});
