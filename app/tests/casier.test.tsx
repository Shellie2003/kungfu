/* ============================================================
   Le casier, une actualité, et « je participe ».

   Trois colonnes vivaient ici sans que rien ne les serve :
   actualites.image, actualites.auteur_id et participations.note.
   Les tests ci-dessous verrouillent le fait qu'elles servent
   maintenant — et, pour l'auteur, le fait que le téléphone ne le
   décide pas.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Actualite } from '../src/ecrans/Casier';
import { Participation } from '../src/ecrans/Participation';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

const SORTIE = {
  id: 'a1',
  titre: 'Sortie au lac Mantasoa',
  categorie: 'Sortie',
  texte: 'Départ 6h00 devant la salle.',
  date_evt: '2026-09-12',
  lieu: 'Devant la salle',
  image: null as string | null,
  cree_le: new Date().toISOString(),
  profils: null as { nom: string; prenom: string } | null
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('une actualité', () => {
  test('nomme la personne qui a publié', async () => {
    poser({
      actualites: { ...SORTIE, profils: { nom: 'RAHARISOA', prenom: 'Fanja' } }
    });
    rendre(<Actualite />, { route: '/casier/a1', chemin: '/casier/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText(/RAHARISOA Fanja/)).toBeInTheDocument();
  });

  test('retombe sur « l’administration » quand l’auteur est inconnu', async () => {
    /* Les actualités d'avant le déclencheur n'ont pas d'auteur. Un
       nom vide serait pire qu'une formule générale. */
    poser({ actualites: SORTIE });
    rendre(<Actualite />, { route: '/casier/a1', chemin: '/casier/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText(/par l’administration/)).toBeInTheDocument();
  });

  test('sans image, l’emplacement le DIT plutôt que de rester nu', async () => {
    poser({ actualites: SORTIE });
    rendre(<Actualite />, { route: '/casier/a1', chemin: '/casier/:id', profil: PROFIL_ELEVE });

    expect(await screen.findByText('Photo à fournir')).toBeInTheDocument();
  });

  test('avec une image, elle est demandée SIGNÉE et remplace l’emplacement', async () => {
    /* Le seau est privé : une adresse composée à la main ne
       s'ouvrirait pas. */
    poser({ actualites: { ...SORTIE, image: 'ceremonie.jpg' } });
    rendre(<Actualite />, { route: '/casier/a1', chemin: '/casier/:id', profil: PROFIL_ELEVE });

    /* On attend le TITRE d'abord : sans cela, « pas d'emplacement
       vide » serait vrai dès l'écran de chargement, et le test
       passerait sans rien avoir vérifié. */
    await screen.findByText('Sortie au lac Mantasoa');
    await waitFor(() =>
      expect(document.querySelector('img')?.getAttribute('src')).toContain(
        '/object/sign/album/ceremonie.jpg'
      )
    );
    expect(screen.queryByText('Photo à fournir')).not.toBeInTheDocument();
  });
});

describe('je participe', () => {
  test('le mot laissé au club part avec l’inscription', async () => {
    poser({ actualites: SORTIE, participations: null, reglages: [] });
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

    await userEvent.type(
      await screen.findByLabelText('Un mot pour le club'),
      'J’arrive après le travail.'
    );
    await userEvent.click(screen.getByRole('button', { name: /participation/i }));

    await waitFor(() =>
      expect(derniere('participations')?.corps).toMatchObject({
        profil_id: 'p1',
        note: 'J’arrive après le travail.'
      })
    );
  });

  test('sans mot, la note part en null et non en chaîne vide', async () => {
    poser({ actualites: SORTIE, participations: null, reglages: [] });
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

    await userEvent.click(await screen.findByRole('button', { name: /participation/i }));

    await waitFor(() => expect(derniere('participations')?.corps).toMatchObject({ note: null }));
  });

  test('la note déjà enregistrée s’affiche, plutôt qu’un champ vide', async () => {
    /* Sinon, mettre à jour ses accompagnants effacerait le mot
       laissé la semaine précédente. */
    poser({
      actualites: SORTIE,
      participations: {
        id: 'pa1', accompagnants: 1, montant_promis: 5000,
        note: 'Je viens avec ma sœur.', versements: []
      },
      reglages: []
    });
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Un mot pour le club')).toHaveValue('Je viens avec ma sœur.')
    );
  });
});
