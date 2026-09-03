/* ============================================================
   Valider les inscriptions à une sortie.

   « Ajouter un écran pour visualiser les participations en attente
   d'une validation, et seul l'admin qui a créé la sortie qui peut le
   voir et valider. »

   ------------------------------------------------------------
   CE QUE CES TESTS TIENNENT, ET CE QU'ILS NE TIENNENT PAS

   Ils tiennent le comportement de l'ÉCRAN : ce qu'il demande au
   serveur, ce qu'il affiche, et ce qu'il envoie quand on tranche.

   Ils ne tiennent PAS la règle « seul l'auteur ». Elle vit sur le
   serveur, dans la migration 0020 — une règle d'accès et un
   déclencheur — et c'est volontaire. Un écran ne protège rien : la
   table reste accessible avec le jeton de n'importe quel
   administrateur, depuis n'importe quel outil.

   Ce que l'écran doit faire, c'est ne DEMANDER que ce qu'il a le
   droit de voir, et lire un refus quand il en reçoit un. Les deux
   sont testés.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAValider } from '../src/ecrans/admin/AValider';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ADMIN, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

const maintenant = new Date().toISOString();

const ATTENTE = [
  {
    id: 'pa1',
    actualite_id: 'a1',
    accompagnants: 2,
    montant_promis: 15000,
    note: 'Je viens avec ma sœur, elle n’est pas membre.',
    cree_le: maintenant,
    profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' },
    actualites: { titre: 'Sortie au lac', date_evt: '2026-10-12', auteur_id: PROFIL_ADMIN.id }
  }
];

describe('l’écran ne demande que ce qu’il a le droit de voir', () => {
  test('il filtre sur l’auteur de la sortie, et sur ce qui est en attente', async () => {
    /* LE POINT LE PLUS IMPORTANT DU FICHIER.

       La règle du serveur laisse aussi passer l'administration en
       général — elle doit pouvoir pointer les versements de toutes
       les sorties. Sans le filtre sur l'auteur, un administrateur
       verrait donc dans SA file d'attente des inscriptions qu'il n'a
       pas le droit de valider, et le bouton échouerait sous ses
       yeux sans qu'il comprenne pourquoi. */
    poser({ participations: ATTENTE });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    await screen.findByText('RAKOTONDRABE Nirina');

    const demande = recues.find((r) => r.table === 'participations' && r.methode === 'GET');
    expect(demande).toBeDefined();
    /* Sur les sorties dont JE suis l'auteur. */
    expect(demande!.parametres.get('actualites.auteur_id')).toBe(`eq.${PROFIL_ADMIN.id}`);
    /* Et seulement ce qui n'est ni validé ni refusé : une file
       d'attente qui montre ce qui est déjà traité ne se vide jamais
       à l'œil. */
    expect(demande!.parametres.get('valide_le')).toBe('is.null');
    expect(demande!.parametres.get('refuse_le')).toBe('is.null');
  });

  test('vide, il dit POURQUOI', async () => {
    /* « Rien à afficher » sur un écran mort fait croire à une panne.
       Un administrateur qui n'a créé aucune sortie doit comprendre
       que c'est normal. */
    poser({ participations: [] });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    expect(
      await screen.findByText(/sorties que vous avez créées/)
    ).toBeInTheDocument();
  });
});

describe('ce que l’écran montre pour décider', () => {
  test('le nom, les accompagnants, le montant promis et la NOTE', async () => {
    /* La note est souvent ce qui décide : « je viens avec ma sœur qui
       n'est pas membre » demande une place de plus dans le
       taxi-brousse. La colonne existait et personne ne la lisait. */
    poser({ participations: ATTENTE });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    expect(await screen.findByText('RAKOTONDRABE Nirina')).toBeInTheDocument();
    expect(screen.getByText('F04x042')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/ma sœur/)).toBeInTheDocument();
    /* Et le titre de la sortie : on valide une sortie, pas une
       ligne. */
    expect(screen.getByText('Sortie au lac')).toBeInTheDocument();
    expect(screen.getByText('1 en attente')).toBeInTheDocument();
  });
});

describe('trancher', () => {
  test('valider écrit la date ET qui a validé', async () => {
    poser({ participations: ATTENTE });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByRole('button', { name: /Valider/ }));

    const envoi = (await waitFor(() => {
      const r = derniere('participations', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    })).corps as {
      valide_le: string | null;
      valide_par: string | null;
      refuse_le: string | null;
    };

    expect(envoi.valide_le).toBeTruthy();
    expect(envoi.valide_par).toBe(PROFIL_ADMIN.id);
    /* Un refus antérieur est effacé : valider après avoir refusé doit
       laisser une ligne cohérente, pas une inscription à la fois
       validée et refusée. */
    expect(envoi.refuse_le).toBeNull();
  });

  test('refuser demande un motif avant d’envoyer', async () => {
    /* Refuser sans rien dire laisse quelqu'un aller demander pourquoi
       au bord du tapis. On le propose sans l'exiger — mais on ne
       part pas au premier appui. */
    poser({ participations: ATTENTE });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByRole('button', { name: 'Refuser' }));

    expect(await screen.findByLabelText('Motif du refus')).toBeInTheDocument();
    /* Rien n'est parti tant qu'on n'a pas confirmé. */
    expect(derniere('participations', 'PATCH')).toBeUndefined();
  });

  test('le motif part avec le refus', async () => {
    poser({ participations: ATTENTE });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByRole('button', { name: 'Refuser' }));
    await userEvent.type(
      await screen.findByLabelText('Motif du refus'),
      'Le taxi-brousse est complet.'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer le refus' }));

    const envoi = (await waitFor(() => {
      const r = derniere('participations', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    })).corps as { refuse_le: string | null; motif: string | null; valide_le: string | null };

    expect(envoi.refuse_le).toBeTruthy();
    expect(envoi.motif).toBe('Le taxi-brousse est complet.');
    expect(envoi.valide_le).toBeNull();
  });

  test('un refus du serveur se LIT', async () => {
    /* LE CAS QUI COMPTE.

       Si l'on n'est pas l'auteur de la sortie, la règle d'accès rend
       la ligne invisible : la mise à jour ne touche RIEN et revient
       sans erreur. Sans « .select() », l'écran annoncerait « c'est
       validé » alors que le serveur a refusé — et l'inscription
       resterait en attente sans que personne le sache.

       C'est le défaut que ce projet a payé cinq fois ; il ne le paiera
       pas une sixième sur la seule fonctionnalité dont la règle
       d'accès EST le propos. */
    poser({ participations: ATTENTE, 'participations:PATCH': [] });
    rendre(<AdminAValider />, { route: '/admin/a-valider', profil: PROFIL_ADMIN });

    await userEvent.click(await screen.findByRole('button', { name: /Valider/ }));

    expect(await screen.findByText(/n’a pas validé/)).toBeInTheDocument();
    expect(screen.queryByText(/est inscrit\./)).not.toBeInTheDocument();
  });
});
