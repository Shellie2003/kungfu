/* ============================================================
   Les catégories appartiennent au club.

   « Je veux que les catégories soient éditables, pas en dur ou en
   lecture uniquement. »

   Elles ne l'étaient nulle part :

   — celles des ACTUALITÉS étaient cinq noms écrits dans l'écran de
     publication. En ajouter une demandait une nouvelle version de
     l'APK, donc une construction, donc moi ;

   — celles des ALBUMS n'existaient pas : la catégorie se tapait à la
     main à chaque création, si bien que « Compétition » et
     « Compétitions » devenaient deux rubriques, et que le filtre de
     l'écran Album en montrait autant que de fautes de frappe ;

   — les COULEURS venaient d'un tableau écrit en dur qui ne contenait
     qu'une seule entrée.

   Ce fichier tient les trois, et une quatrième chose qui compte
   autant : qu'une catégorie retirée n'emporte pas ce qui la
   portait.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCategories } from '../src/ecrans/admin/Categories';
import { AdminAlbums, AdminPublier } from '../src/ecrans/admin/Publication';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('les listes de choix viennent de la base', () => {
  test('publier propose les catégories du club, pas celles du code', async () => {
    /* Le club invente une rubrique ; elle doit apparaître sans qu'on
       reconstruise l'APK. C'est tout l'objet du changement. */
    poser({
      categories: [
        { id: 'x1', genre: 'actualite', nom: 'Stage', couleur: '#12613C', rang: 1, actif: true }
      ],
      actualites: []
    });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    /* On ATTEND l'option, on ne la cherche pas tout de suite : la
       liste existe dès le premier rendu et se remplit quand la
       requête revient. Chercher trop tôt trouvait une liste vide et
       accusait le code. */
    await screen.findByRole('option', { name: 'Stage' });
    const options = [...(await screen.findByLabelText('Catégorie')).querySelectorAll('option')]
      .map((o) => o.textContent);
    /* Et celles qui étaient écrites dans le code ont bien disparu. */
    expect(options).not.toContain('Réunion');
  });

  test('une catégorie retirée n’est plus PROPOSÉE', async () => {
    poser({
      categories: [
        { id: 'x1', genre: 'actualite', nom: 'Stage', couleur: '#12613C', rang: 1, actif: true },
        { id: 'x2', genre: 'actualite', nom: 'Ancienne', couleur: '#12613C', rang: 2, actif: false }
      ],
      actualites: []
    });
    rendre(<AdminPublier />, { route: '/admin/publier' });

    await screen.findByRole('option', { name: 'Stage' });
    const options = [...(await screen.findByLabelText('Catégorie')).querySelectorAll('option')]
      .map((o) => o.textContent);
    expect(options).not.toContain('Ancienne');
  });

  test('l’album a SA liste, pas celle du casier', async () => {
    /* Le casier parle de Sorties et de Réunions, l'album de
       Compétitions et d'Entraînements. Les mêler donnerait des
       rubriques qui n'ont aucun sens là où elles s'affichent. */
    poser({ albums: [] });
    rendre(<AdminAlbums />, { route: '/admin/albums' });

    await screen.findByRole('option', { name: 'Compétitions' });
    const options = [...(await screen.findByLabelText('Catégorie')).querySelectorAll('option')]
      .map((o) => o.textContent);
    expect(options).not.toContain('Réunion');
  });

  test('la catégorie d’un album n’est plus tapée à la main', async () => {
    /* C'était un champ de texte libre, avec pour seule aide un
       exemple dans l'invite. « Compétition » et « Compétitions »
       devenaient deux rubriques, et rien ne permettait de les
       réunir ensuite. */
    poser({ albums: [] });
    rendre(<AdminAlbums />, { route: '/admin/albums' });

    expect((await screen.findByLabelText('Catégorie')).tagName).toBe('SELECT');
  });
});

describe('l’écran de gestion écrit vraiment', () => {
  test('créer une catégorie envoie son genre, son nom et sa couleur', async () => {
    poser({ categories: [] });
    rendre(<AdminCategories />, { route: '/admin/categories', profil: PROFIL_ADMIN });

    await userEvent.type(await screen.findByLabelText('Nom'), 'Stage');
    await userEvent.click(screen.getByRole('button', { name: 'Créer cette catégorie' }));

    const envoi = (await waitFor(() => {
      const r = derniere('categories');
      expect(r).toBeDefined();
      return r!;
    })).corps as { genre: string; nom: string; couleur: string; rang: number };

    expect(envoi.genre).toBe('actualite');
    expect(envoi.nom).toBe('Stage');
    expect(envoi.couleur).toBe('#12613C');
    /* Le rang se place APRÈS la dernière du même genre : proposer 0
       obligerait à renuméroter toute la liste à chaque ajout. */
    expect(envoi.rang).toBe(1);
  });

  test('le rang proposé suit la dernière du MÊME genre', async () => {
    poser({
      categories: [
        { id: 'x1', genre: 'actualite', nom: 'Une', couleur: '#12613C', rang: 4, actif: true },
        { id: 'x2', genre: 'album', nom: 'Autre', couleur: '#12613C', rang: 9, actif: true }
      ]
    });
    rendre(<AdminCategories />, { route: '/admin/categories', profil: PROFIL_ADMIN });

    /* Cinq, et non dix : la catégorie créée est une catégorie
       d'actualité, et les deux listes se numérotent séparément. */
    await waitFor(() => expect(screen.getByLabelText('Rang')).toHaveValue(5));
  });

  test('retirer une catégorie la DÉSACTIVE, sans la supprimer', async () => {
    /* Des actualités la portent. L'effacer laisserait leur étiquette
       sans couleur et sans place dans le filtre — on cesse seulement
       de la proposer. C'est ce que fait déjà un grade. */
    poser({
      categories: [
        { id: 'x1', genre: 'actualite', nom: 'Stage', couleur: '#12613C', rang: 1, actif: true }
      ]
    });
    rendre(<AdminCategories />, { route: '/admin/categories', profil: PROFIL_ADMIN });

    /* Le libellé porte le NOM de la catégorie : avec dix rangées,
       dix boutons « Retirer » ne se distinguent pas les uns des
       autres pour un lecteur d'écran. */
    await userEvent.click(
      await screen.findByRole('button', { name: 'Retirer Stage des listes' })
    );

    const envoi = await waitFor(() => {
      const r = derniere('categories', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toEqual({ actif: false });
    /* Et surtout : aucune suppression n'est partie. */
    expect(derniere('categories', 'DELETE')).toBeUndefined();
  });

  test('un refus du serveur se LIT', async () => {
    /* Sans « .select() », une écriture que les règles écartent
       revient sans erreur et l'écran annonce un succès qui n'a pas
       eu lieu. Ce projet a payé ce défaut quatre fois ; il ne le
       paiera pas une cinquième sur cette table. */
    poser({ categories: [], 'categories:POST': [] });
    rendre(<AdminCategories />, { route: '/admin/categories', profil: PROFIL_ADMIN });

    await userEvent.type(await screen.findByLabelText('Nom'), 'Stage');
    await userEvent.click(screen.getByRole('button', { name: 'Créer cette catégorie' }));

    expect(await screen.findByText(/refusé/i)).toBeInTheDocument();
    expect(screen.queryByText('Catégorie créée.')).not.toBeInTheDocument();
  });
});
