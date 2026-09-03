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
import { Album } from '../src/ecrans/Album';
import { AdminAlbums } from '../src/ecrans/admin/Publication';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, PROFIL_MAITRE, rendre } from './rendu';

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
    await userEvent.upload(screen.getByLabelText(/Importer des photos/i), fichier());

    /* Le corps est un TABLEAU depuis que les photos partent en une
       seule écriture : vingt photos faisaient sinon vingt
       allers-retours enchaînés. */
    await waitFor(() =>
      expect(derniere('photos')?.corps).toMatchObject([
        { album_id: 'a1', legende: 'Finale par équipe, mars 2026' }
      ])
    );
  });

  test('est la même pour tout un envoi, et une seule saisie suffit', async () => {
    /* Vingt photos rentrent d'une compétition. En demander vingt
       légendes aurait pour seul effet qu'il n'y en aurait aucune. */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.type(screen.getByLabelText('Légende de cet envoi'), 'Kata, juin');
    await userEvent.upload(screen.getByLabelText(/Importer des photos/i), [fichier(), fichier()]);

    await waitFor(() => {
      const envois = recues.filter((r) => r.table === 'photos' && r.methode === 'POST');
      /* UNE écriture, DEUX lignes — et la même légende sur les deux. */
      expect(envois).toHaveLength(1);
      const lignes = envois[0]?.corps as { legende: string }[];
      expect(lignes).toHaveLength(2);
      expect(lignes.every((l) => l.legende === 'Kata, juin')).toBe(true);
    });
  });

  test('reste absente plutôt que vide quand on n’en met pas', async () => {
    /* Chaîne vide et absence ne s'affichent pas pareil : l'écran a
       un texte de repli pour « null », pas pour « ». */
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(screen.getByLabelText(/Importer des photos/i), fichier());

    await waitFor(() => expect(derniere('photos')?.corps).toMatchObject([{ legende: null }]));
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
       écritures là où deux suffisent.

       « photos:PATCH » est posé explicitement : depuis que les
       écritures vérifient qu'elles ont vraiment écrit, une réponse
       vide veut dire « le serveur a refusé », et la première mise à
       jour s'arrêtait là. C'est le comportement voulu — un vrai
       serveur rend la ligne touchée — et c'est au simulateur de le
       reproduire. */
    poser({ albums: [ALBUM2], 'photos:PATCH': [{ id: 'ph1' }] });
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

/* ============================================================
   Prendre une photo, ou en importer une.

   « Dans l'album il n'y a pas de boutons pour prendre ou importer
   une photo, où sont-ils ? » Il n'y en avait qu'un — « Ajouter des
   photos » — et il ouvrait le sélecteur de documents. Pour une photo
   qu'on vient de prendre, il fallait sortir de l'application.

   Un seul bouton ne pouvait pas faire les deux : « capture » ouvre
   l'appareil photo ET ferme la porte à la galerie. Les deux chemins
   existent donc côte à côte, nommés par ce qu'ils font.
   ============================================================ */
describe('les deux chemins vers une photo', () => {
  test('l’album propose de prendre ET d’importer', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    const prendre = screen.getByLabelText(/Prendre une photo/i);
    const importer = screen.getByLabelText(/Importer des photos/i);

    /* « capture » est ce qui distingue les deux : sans lui, Android
       ouvre le sélecteur de documents dans les deux cas, et le
       premier bouton ment sur ce qu'il fait. */
    expect(prendre).toHaveAttribute('capture', 'environment');
    expect(importer).not.toHaveAttribute('capture');
    /* Une seule photo à la fois quand on la prend : l'appareil n'en
       rend qu'une, et « multiple » n'aurait rien changé sinon
       promettre le contraire. */
    expect(prendre).not.toHaveAttribute('multiple');
    expect(importer).toHaveAttribute('multiple');
  });

  test('la photo prise part dans le bon album', async () => {
    poser({ albums: [ALBUM] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(screen.getByLabelText(/Prendre une photo/i), fichier());

    await waitFor(() => expect(derniere('photos')?.corps).toMatchObject([{ album_id: 'a1' }]));
  });
});

describe('le raccourci depuis l’album', () => {
  /* Le club a cherché ce bouton dans l'album, et il n'y était pas :
     la gestion des photos vivait uniquement dans l'écran
     d'administration. On ajoute des photos là où on les regarde.

     Comme au casier, ce n'est pas une permission de plus — la route
     et le serveur refusent déjà ce que le rôle n'autorise pas. */
  test('l’administration l’a, l’élève non', async () => {
    /* Le bouton d'en-tête s'appelait « Ajouter des photos » et menait
       à l'écran d'administration, où il fallait encore retrouver
       l'album. Il porte maintenant ce qu'il fait vraiment — créer un
       album — et l'ajout de photos se fait sur la vignette « + » de
       l'album concerné. */
    poser({ albums: [ALBUM] });
    rendre(<Album />, { route: '/album', profil: PROFIL_ADMIN });
    expect(await screen.findByLabelText('Créer un album')).toBeInTheDocument();

    rendre(<Album />, { route: '/album', profil: PROFIL_ELEVE });
    await screen.findAllByText('Championnat régional');
    expect(screen.queryByLabelText('Créer un album')).not.toBeInTheDocument();
  });
});

/* ============================================================
   « Refusé : value "1788248967396" is out of range for type integer »

   Le rang d'une photo valait « Date.now() » : un nombre de treize
   chiffres dans une colonne « integer », dont le maximum est
   2 147 483 647. Le serveur refusait donc TOUT ajout de photo, avec
   un message que personne ne pouvait relier à l'album.

   L'intention était bonne — poser la nouvelle photo après les
   autres — mais un compteur qui déborde n'ordonne rien du tout.
   ============================================================ */
describe('le rang des photos ajoutées', () => {
  test('tient dans un entier, et suit celui de l’album', async () => {
    poser({
      albums: [ALBUM],
      /* La base répond « le plus haut rang est 7 ». */
      photos: [{ rang: 7 }]
    });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(
      screen.getByLabelText(/Importer des photos/i),
      [fichier(), fichier()]
    );

    await waitFor(() => expect(derniere('photos')).toBeDefined());
    const lignes = derniere('photos')?.corps as { rang: number }[];

    /* Les deux photos se suivent, APRÈS la dernière de l'album. */
    expect(lignes.map((l) => l.rang)).toEqual([8, 9]);

    /* Et le contrôle qui aurait attrapé le défaut : un entier de
       PostgreSQL s'arrête à 2 147 483 647. « Date.now() » vaut mille
       fois plus. */
    for (const l of lignes) {
      expect(Number.isInteger(l.rang)).toBe(true);
      expect(l.rang).toBeLessThan(2_147_483_647);
    }
  });

  test('un album vide commence à 1', async () => {
    poser({ albums: [ALBUM], photos: [] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(screen.getByLabelText(/Importer des photos/i), fichier());

    await waitFor(() => expect(derniere('photos')).toBeDefined());
    expect((derniere('photos')?.corps as { rang: number }[])[0]?.rang).toBe(1);
  });

  test('les photos partent en UNE seule écriture, pas une par photo', async () => {
    /* Vingt photos faisaient quarante allers-retours enchaînés :
       envoyer, écrire, envoyer, écrire… Sur un réseau malgache,
       c'est là que passait l'essentiel de l'attente. */
    poser({ albums: [ALBUM], photos: [] });
    rendre(<AdminAlbums />);
    await screen.findByText('Championnat régional');

    await userEvent.upload(
      screen.getByLabelText(/Importer des photos/i),
      [fichier(), fichier(), fichier()]
    );

    await waitFor(() => expect(derniere('photos')).toBeDefined());
    const ecritures = recues.filter((r) => r.table === 'photos' && r.methode === 'POST');
    expect(ecritures).toHaveLength(1);
    expect((ecritures[0]?.corps as unknown[]).length).toBe(3);
  });
});

describe('ajouter une photo là où on la regarde', () => {
  /* « Dans l'album, il n'y a pas de fonctionnalité d'ajout (capture
     ou import de l'image) comme prévu. »

     Elle existait — dans l'écran d'administration, à trois appuis de
     distance : ouvrir l'administration, ouvrir les albums, retrouver
     l'album. Le bouton de l'écran Album n'y menait que, tout en
     s'appelant « Ajouter des photos » : le club a conclu que l'ajout
     n'existait pas, et c'était une conclusion raisonnable. */
  const DEUX = {
    ...ALBUM,
    photos: [{ id: 'ph1', chemin: 'une.jpg', legende: null, rang: 3 }]
  };

  test('la vignette « + » est là pour l’encadrement', async () => {
    poser({ albums: [DEUX] });
    rendre(<Album />, { profil: PROFIL_MAITRE });

    expect(
      await screen.findByLabelText('Ajouter des photos à Championnat régional')
    ).toBeInTheDocument();
  });

  test('un élève ne la voit pas — le serveur la lui refuserait', async () => {
    poser({ albums: [DEUX] });
    rendre(<Album />, { profil: PROFIL_ELEVE });

    await screen.findByText('Championnat régional');
    expect(
      screen.queryByLabelText('Ajouter des photos à Championnat régional')
    ).not.toBeInTheDocument();
  });

  test('la photo part dans le BON album, avec sa légende', async () => {
    /* « photos » est posé À PART de « albums » : le service lit le
       rang le plus élevé dans la TABLE, pas dans l'album déjà en
       mémoire. C'est ce qui évite deux photos au même rang, donc un
       ordre tiré au sort à chaque lecture. */
    poser({ albums: [DEUX], photos: [{ rang: 3 }] });
    rendre(<Album />, { profil: PROFIL_MAITRE });

    await userEvent.click(
      await screen.findByLabelText('Ajouter des photos à Championnat régional')
    );
    await userEvent.type(
      await screen.findByLabelText('Légende (facultative)'),
      'Finale par équipe'
    );
    await userEvent.upload(screen.getByLabelText('Importer depuis la galerie'), fichier());

    const lignes = (await waitFor(() => {
      const r = derniere('photos');
      expect(r).toBeDefined();
      return r!;
    })).corps as { album_id: string; legende: string | null; rang: number }[];

    expect(lignes[0]!.album_id).toBe('a1');
    expect(lignes[0]!.legende).toBe('Finale par équipe');
    /* Le rang suit le dernier de l'album, il ne repart pas de zéro —
       sinon deux photos porteraient le même et l'ordre serait tiré au
       sort à chaque lecture. */
    expect(lignes[0]!.rang).toBe(4);
  });

  test('l’appareil photo est proposé, pas seulement la galerie', async () => {
    /* « capture » ouvre l'appareil photo ET ferme la porte à la
       galerie : un bouton unique ne peut pas faire les deux. Le club
       a demandé « capture OU import », il faut donc bien deux
       chemins. */
    poser({ albums: [DEUX] });
    rendre(<Album />, { profil: PROFIL_MAITRE });

    await userEvent.click(
      await screen.findByLabelText('Ajouter des photos à Championnat régional')
    );
    expect(await screen.findByLabelText('Prendre une photo')).toHaveAttribute(
      'capture',
      'environment'
    );
    expect(screen.getByLabelText('Importer depuis la galerie')).not.toHaveAttribute('capture');
  });
});
