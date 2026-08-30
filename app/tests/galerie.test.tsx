/* ============================================================
   La galerie : légendes, et suppressions qui se confirment.

   Ces tests couvrent deux défauts d'une même nature — une colonne
   ou un geste que l'écran promettait et que rien ne servait :

   — « legende » était AFFICHÉE sous la photo en grand et servait de
     nom accessible à la vignette, et aucun écran ne l'écrivait. Elle
     valait donc « null » pour toutes les photos du club, à jamais.

   — un simple appui sur une vignette détruisait la photo, du serveur
     compris, sans rien demander. L'avertissement était écrit en bas
     de page, c'est-à-dire là où on le lit APRÈS.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAlbums } from '../src/ecrans/admin/Publication';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { rendre } from './rendu';

const ALBUM = {
  id: 'a1',
  titre: 'Championnat régional',
  categorie: 'Compétitions',
  couverture: null as string | null,
  photos: [{ id: 'ph1', chemin: 'une.jpg', legende: null, rang: 1 }]
};

/* Deux photos : le déplacement n'a de sens qu'à partir de là. */
const ALBUM2 = {
  ...ALBUM,
  photos: [
    { id: 'ph1', chemin: 'une.jpg', legende: 'Première', rang: 1 },
    { id: 'ph2', chemin: 'deux.jpg', legende: 'Seconde', rang: 2 }
  ]
};

const fichier = () => new File(['x'], 'IMG_0001.jpg', { type: 'image/jpeg' });

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('la légende d’une photo', () => {
  test('part avec la photo à l’envoi', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.type(
      screen.getByLabelText('Légende de cet envoi'),
      'Finale par équipe, mars 2026'
    );
    await userEvent.upload(screen.getByLabelText(/Ajouter des photos/i), fichier());

    await waitFor(() =>
      expect(derniere('photos')?.corps).toMatchObject({
        album_id: 'a1',
        legende: 'Finale par équipe, mars 2026'
      })
    );
  });

  test('est la même pour tout un envoi, et une seule saisie suffit', async () => {
    /* Vingt photos rentrent d'une compétition. En demander vingt
       légendes aurait pour seul effet qu'il n'y en aurait aucune. */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.type(screen.getByLabelText('Légende de cet envoi'), 'Kata, juin');
    await userEvent.upload(screen.getByLabelText(/Ajouter des photos/i), [fichier(), fichier()]);

    await waitFor(() => {
      const envois = recues.filter((r) => r.table === 'photos' && r.methode === 'POST');
      expect(envois).toHaveLength(2);
      expect(envois.every((e) => (e.corps as { legende: string }).legende === 'Kata, juin')).toBe(
        true
      );
    });
  });

  test('reste absente plutôt que vide quand on n’en met pas', async () => {
    /* Chaîne vide et absence ne s'affichent pas pareil : l'écran a
       un texte de repli pour « null », pas pour « ». */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(screen.getByLabelText(/Ajouter des photos/i), fichier());

    await waitFor(() => expect(derniere('photos')?.corps).toMatchObject({ legende: null }));
  });

  test('se corrige ensuite, photo par photo', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));
    await userEvent.type(
      screen.getByLabelText('Légende de cette photo'),
      'Hery au premier rang'
    );
    await userEvent.click(screen.getByText('Enregistrer la légende'));

    await waitFor(() =>
      expect(derniere('photos', 'PATCH')?.corps).toEqual({ legende: 'Hery au premier rang' })
    );
  });
});

describe('retirer une photo', () => {
  test('un appui ouvre la photo, il ne la détruit plus', async () => {
    /* C'est le cœur du correctif : un doigt qui glisse effaçait une
       photo de compétition, du serveur compris. */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));

    expect(screen.getByLabelText('Légende de cette photo')).toBeInTheDocument();
    expect(derniere('photos', 'DELETE')).toBeUndefined();
  });

  test('la suppression demande confirmation, et ne part qu’après', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));
    await userEvent.click(screen.getByText('Retirer cette photo'));

    /* La question est posée, rien n'est encore parti. */
    expect(screen.getByText(/c’est définitif/)).toBeInTheDocument();
    expect(derniere('photos', 'DELETE')).toBeUndefined();

    await userEvent.click(screen.getByText('Oui, supprimer'));
    await waitFor(() => expect(derniere('photos', 'DELETE')).toBeDefined());
  });

  test('annuler ne supprime rien', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));
    await userEvent.click(screen.getByText('Retirer cette photo'));
    await userEvent.click(screen.getByText('Annuler'));

    expect(derniere('photos', 'DELETE')).toBeUndefined();
  });

  test('supprimer un album nomme l’album avant de le faire', async () => {
    /* « Supprimer ? » ne dit pas quoi, et l'on confirme alors sans
       savoir. */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Supprimer l’album Championnat régional'));
    /* Deux fois en gras : une dans la carte de l'album, une dans la
       question. C'est cette seconde qui est le sujet du test. */
    expect(screen.getAllByText('Championnat régional', { selector: 'b' })).toHaveLength(2);
    expect(derniere('albums', 'DELETE')).toBeUndefined();

    await userEvent.click(screen.getByText('Oui, supprimer'));
    await waitFor(() => expect(derniere('albums', 'DELETE')).toBeDefined());
  });
});


describe('la couverture et l’ordre', () => {
  test('choisir la couverture enregistre le CHEMIN, pas l’identifiant', async () => {
    /* L'affichage a besoin du chemin pour demander une adresse
       signée ; passer par l'identifiant obligerait à retrouver la
       photo dans la liste à chaque rendu. */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));
    await userEvent.click(screen.getByText('Faire la couverture de l’album'));

    await waitFor(() =>
      expect(derniere('albums', 'PATCH')?.corps).toEqual({ couverture: 'une.jpg' })
    );
  });

  test('une couverture déjà choisie le dit, au lieu de proposer deux fois', async () => {
    poser({ albums: [{ ...ALBUM, couverture: 'une.jpg' }] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Photo sans légende'));
    expect(screen.getByText('C’est déjà la couverture')).toBeInTheDocument();
  });

  test('déplacer ÉCHANGE deux rangs, en deux mises à jour', async () => {
    /* Renuméroter vingt photos pour en déplacer une ferait vingt
       écritures là où deux suffisent. */
    poser({ albums: [ALBUM2] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Seconde'));
    await userEvent.click(screen.getByRole('button', { name: 'Avancer' }));

    await waitFor(() => {
      const envois = recues.filter((r) => r.table === 'photos' && r.methode === 'PATCH');
      expect(envois).toHaveLength(2);
      expect(envois.map((e) => (e.corps as { rang: number }).rang).sort()).toEqual([1, 2]);
    });
  });

  test('la première photo ne peut pas avancer, la dernière pas reculer', async () => {
    poser({ albums: [ALBUM2] });
    rendre(<AdminAlbums />);

    await userEvent.click(await screen.findByLabelText('Première'));
    expect(screen.getByRole('button', { name: 'Avancer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reculer' })).not.toBeDisabled();
  });
});
