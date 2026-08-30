/* ============================================================
   Les photos.

   Deux propriétés à tenir, et les deux comptent pour une raison
   différente.

   SIGNÉES, parce que ce sont des photos d'enfants : un seau public
   rend chaque fichier lisible par quiconque possède son adresse, et
   une adresse ne se révoque jamais.

   EN LOT, parce que l'annuaire en affiche soixante-quatre : une
   demande par photo ferait soixante-quatre allers-retours sur un
   réseau malgache.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Etudiants } from '../src/ecrans/Etudiants';
import { brancherServeur, poser, recues, reinitialiser } from './serveur';
import { rendre } from './rendu';

const MEMBRES = [
  { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina', photo: 'a.jpg', grades: null },
  { id: 'p2', numero: 'F04x043', nom: 'RASOAMANANA', prenom: 'Fanjaniaina', photo: 'b.jpg', grades: null },
  /* Sans portrait : le cas le plus courant au début. */
  { id: 'p3', numero: 'F04x044', nom: 'ANDRIANJAFY', prenom: 'Tokiniaina', photo: null, grades: null }
];

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  poser({ profils: MEMBRES, grades: [] });
});

const appelsStockage = () => recues.filter((r) => r.table === 'storage');

describe('les adresses de photos', () => {
  test('sont demandées SIGNÉES, jamais publiques', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');

    await waitFor(() => expect(appelsStockage().length).toBeGreaterThan(0));
    /* createSignedUrls, pas getPublicUrl — cette dernière ne fait
       même pas d'appel réseau, donc son absence se lit ici. */
    const appel = appelsStockage()[0]!;
    expect(appel.methode).toBe('POST');
  });

  test('sont demandées EN UN SEUL appel pour toute la liste', async () => {
    rendre(<Etudiants />);
    await screen.findByText('RAKOTONDRABE');

    await waitFor(() => expect(appelsStockage().length).toBe(1));
    /* Les deux chemins dans la même requête. Trois membres, deux
       photos : l'appel en porte deux, pas trois ni un par membre. */
    const corps = appelsStockage()[0]!.corps as { paths: string[] };
    expect(corps.paths.sort()).toEqual(['a.jpg', 'b.jpg']);
  });

  test('un membre sans photo n’en fait pas demander une', async () => {
    poser({ profils: [MEMBRES[2]] });
    rendre(<Etudiants />);
    await screen.findByText('ANDRIANJAFY');

    /* Aucune photo : aucun appel. Demander une adresse pour « null »
       ferait une requête inutile à chaque écran vide. */
    await waitFor(() => expect(screen.getByText(/1 membre/)).toBeInTheDocument());
    expect(appelsStockage()).toHaveLength(0);
  });

  test('une photo introuvable ne vide pas la liste', async () => {
    /* Le serveur rend une erreur POUR ELLE SEULE. Les autres photos
       doivent rester, et surtout les membres doivent rester
       affichés. */
    poser({
      storage: [
        { path: 'a.jpg', signedUrl: 'https://essai/signee-a', error: null },
        { path: 'b.jpg', signedUrl: null, error: 'Object not found' }
      ]
    });
    rendre(<Etudiants />);

    expect(await screen.findByText('RAKOTONDRABE')).toBeInTheDocument();
    expect(screen.getByText('RASOAMANANA')).toBeInTheDocument();
    expect(screen.getByText(/3 membres/)).toBeInTheDocument();
  });
});
