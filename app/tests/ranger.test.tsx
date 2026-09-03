/* ============================================================
   Trois écrans qui montraient sans laisser agir.

   Le club a signalé, sur trois écrans différents, la même chose :
   « il n'y a pas encore de CRUD », « il n'y a pas encore de
   fonctionnalités ». Ce n'était pas trois demandes distinctes, mais
   un même défaut répété — l'écran affiche, et le geste qu'on a envie
   de faire en le regardant vit ailleurs, ou nulle part.

   Ce fichier tient les trois corrections, et surtout les DÉFAUTS
   qu'elles réparent — parce que ce sont eux qui reviendraient.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Etudiants } from '../src/ecrans/Etudiants';
import { Actualite } from '../src/ecrans/Casier';
import { Notifications } from '../src/ecrans/Notifications';
import { AdminFiche } from '../src/ecrans/admin/Fiche';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

const maintenant = new Date().toISOString();
const dans = (jours: number) =>
  new Date(Date.now() + jours * 86400000).toISOString().slice(0, 10);

describe('l’annuaire : inscrire, et voir qui est parti', () => {
  const MEMBRES = [
    {
      id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
      photo: null, actif: true, grades: null
    },
    {
      id: 'p2', numero: 'F04x043', nom: 'PARTI', prenom: 'Jean',
      photo: null, actif: false, grades: null
    }
  ];

  test('l’administration inscrit depuis l’annuaire', async () => {
    /* L'inscription vivait uniquement dans l'écran d'administration :
       constater qu'un membre manque en regardant la liste, puis
       ressortir, ouvrir l'administration, retrouver « Ajouter un
       étudiant ». Trois appuis pour un geste qu'on décide ICI. */
    poser({ profils: MEMBRES, grades: [] });
    rendre(<Etudiants />, { profil: PROFIL_ADMIN });

    expect(await screen.findByLabelText('Inscrire un membre')).toBeInTheDocument();
  });

  test('un élève ne l’a pas', async () => {
    poser({ profils: MEMBRES, grades: [] });
    rendre(<Etudiants />, { profil: PROFIL_ELEVE });

    await screen.findByText('RAKOTONDRABE');
    expect(screen.queryByLabelText('Inscrire un membre')).not.toBeInTheDocument();
  });

  test('un membre RETIRÉ se distingue des autres', async () => {
    /* LE DÉFAUT QUE CE TEST TIENT.

       « Désactiver cette fiche » existait depuis toujours, et la
       requête de l'annuaire ne lisait même pas la colonne « actif ».
       Un membre retiré du club restait donc affiché à
       l'administration exactement comme les autres — même portrait,
       même grade, rien qui le distingue. Le geste existait et
       n'avait aucun effet visible.

       La règle d'accès le cache aux élèves, pas à l'administration :
       elle doit le retrouver pour le réintégrer, encore faut-il
       qu'elle le voie. */
    poser({ profils: MEMBRES, grades: [] });
    rendre(<Etudiants />, { profil: PROFIL_ADMIN });

    expect(await screen.findByText('Retiré du club')).toBeInTheDocument();
  });

  test('une fiche retirée propose de RÉINTÉGRER, pas de retirer encore', async () => {
    /* Le bouton disait « Désactiver cette fiche » quel que soit
       l'état, et n'envoyait jamais que « actif: false ». Un élève
       retiré ne pouvait donc pas revenir : la fonction existait dans
       les services, aucun écran ne l'appelait, et la seule issue
       était le tableau de bord Supabase.

       Le texte de l'écran promettait pourtant l'inverse : « un élève
       qui revient retrouve son numéro, son grade et son
       historique ». */
    poser({
      profils: [{ ...MEMBRES[1], profils_prives: null, tuteurs: [] }],
      grades: []
    });
    rendre(<AdminFiche />, {
      route: '/admin/fiche/p2',
      chemin: '/admin/fiche/:id',
      profil: PROFIL_ADMIN
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Réintégrer ce membre' }));

    const envoi = await waitFor(() => {
      const r = derniere('profils', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toEqual({ actif: true });
  });
});

describe('le casier : modifier là où l’on lit, et participer quand cela a un sens', () => {
  const annonce = (extra: Record<string, unknown>) => ({
    actualites: [
      {
        id: 'a1', titre: 'Sortie au lac', categorie: 'Sortie',
        texte: 'Départ 6h00.', lieu: 'Devant la salle', image: null,
        cree_le: maintenant, auteur: null, ...extra
      }
    ]
  });

  test('l’administration modifie l’actualité depuis l’écran qui l’affiche', async () => {
    /* Corriger une faute demandait de ressortir, d'ouvrir
       l'administration, d'ouvrir « Publier une actualité », puis de
       retrouver l'annonce dans la liste du bas. Quatre appuis pour
       une virgule — donc une virgule qui reste. */
    poser(annonce({ date_evt: dans(7) }));
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ADMIN
    });

    expect(await screen.findByLabelText('Modifier cette actualité')).toBeInTheDocument();
  });

  test('un élève ne le voit pas', async () => {
    poser(annonce({ date_evt: dans(7) }));
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    await screen.findByText('Sortie au lac');
    expect(screen.queryByLabelText('Modifier cette actualité')).not.toBeInTheDocument();
  });

  test('« J’y participe » s’affiche pour un ÉVÉNEMENT à venir', async () => {
    poser(annonce({ date_evt: dans(7) }));
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    expect(await screen.findByRole('button', { name: 'J’y participe' })).toBeInTheDocument();
  });

  test('il ne s’affiche PAS sur une annonce sans date', async () => {
    /* LE DÉFAUT QUE CE TEST TIENT.

       Le bouton s'affichait sur TOUTE actualité, y compris un
       changement d'horaire. On ne participe pas à un changement
       d'horaire : l'écran de participation demandait alors des
       accompagnants et une promesse de versement pour une
       information qui n'attend aucune réponse. */
    poser(annonce({ date_evt: null, categorie: 'Changement d’horaire' }));
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    await screen.findByText('Sortie au lac');
    expect(screen.queryByRole('button', { name: 'J’y participe' })).not.toBeInTheDocument();
  });

  test('ni sur un événement PASSÉ', async () => {
    /* S'inscrire à une sortie d'il y a trois mois ne veut rien dire,
       et le club recevrait des promesses de versement pour un
       événement qui a eu lieu. */
    poser(annonce({ date_evt: dans(-90) }));
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    await screen.findByText('Sortie au lac');
    expect(screen.queryByRole('button', { name: 'J’y participe' })).not.toBeInTheDocument();
  });

  test('déjà inscrit, l’écran dit OÙ EN EST la demande', async () => {
    /* Il s'affichait à l'identique qu'on soit inscrit ou non : on ne
       savait plus si l'on s'était inscrit, donc on recommençait. */
    poser({
      ...annonce({ date_evt: dans(7) }),
      participations: [
        {
          id: 'pa1', accompagnants: 0, montant_promis: null, note: null,
          valide_le: null, refuse_le: null, motif: null, versements: []
        }
      ]
    });
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    /* Une inscription neuve est EN ATTENTE, et l'écran le dit : une
       validation que seul l'organisateur connaît n'est pas une
       validation, c'est une décision privée. */
    expect(
      await screen.findByText('Inscription envoyée — en attente de validation.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Modifier mon inscription' })
    ).toBeInTheDocument();
  });

  test('validée, l’écran le dit aussi', async () => {
    poser({
      ...annonce({ date_evt: dans(7) }),
      participations: [
        {
          id: 'pa1', accompagnants: 0, montant_promis: null, note: null,
          valide_le: maintenant, refuse_le: null, motif: null, versements: []
        }
      ]
    });
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    expect(await screen.findByText('Votre inscription est validée.')).toBeInTheDocument();
  });

  test('refusée, le MOTIF s’affiche', async () => {
    /* Refuser sans rien dire laisse quelqu'un aller demander pourquoi
       au bord du tapis — exactement ce que l'application devrait
       éviter. */
    poser({
      ...annonce({ date_evt: dans(7) }),
      participations: [
        {
          id: 'pa1', accompagnants: 0, montant_promis: null, note: null,
          valide_le: null, refuse_le: maintenant,
          motif: 'Le taxi-brousse est complet.', versements: []
        }
      ]
    });
    rendre(<Actualite />, {
      route: '/casier/a1',
      chemin: '/casier/:id',
      profil: PROFIL_ELEVE
    });

    expect(await screen.findByText(/n’a pas été retenue/)).toBeInTheDocument();
    expect(screen.getByText(/Le taxi-brousse est complet/)).toBeInTheDocument();
  });
});

describe('les notifications : les ranger une par une', () => {
  const DEUX = [
    { id: 'n1', titre: 'Sortie samedi', texte: null, vers: null, lue_le: null, cree_le: maintenant },
    {
      id: 'n2', titre: 'Ancienne', texte: null, vers: null,
      lue_le: maintenant, cree_le: maintenant
    }
  ];

  test('ouvrir une notification la marque lue', async () => {
    /* La seule façon de faire tomber la pastille était « Tout lire »,
       qui emporte aussi celles qu'on n'a pas regardées. */
    poser({ notifications: DEUX });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByText('Sortie samedi'));

    const envoi = await waitFor(() => {
      const r = derniere('notifications', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.corps).toHaveProperty('lue_le');
    expect(envoi.parametres.get('id')).toBe('eq.n1');
  });

  test('une notification déjà lue n’est pas remarquée lue', async () => {
    poser({ notifications: DEUX });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByText('Ancienne'));

    /* Rien ne part : elle était déjà lue. Une écriture par appui sur
       une notification déjà lue serait une requête pour rien, sur une
       ligne malgache. */
    await waitFor(() => expect(screen.getByText('Ancienne')).toBeInTheDocument());
    expect(derniere('notifications', 'PATCH')).toBeUndefined();
  });

  test('on en retire une, et une seule', async () => {
    /* La table n'avait AUCUNE politique de suppression : personne ne
       pouvait effacer une notification, ni son destinataire ni
       l'administration. Il fallait commencer par la base. */
    poser({ notifications: DEUX });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByLabelText('Retirer « Sortie samedi »'));

    const envoi = await waitFor(() => {
      const r = derniere('notifications', 'DELETE');
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoi.parametres.get('id')).toBe('eq.n1');
  });

  test('retirer n’ouvre pas la notification', async () => {
    /* La rangée EST un bouton, et la croix vit dedans : sans arrêter
       la propagation, retirer une notification l'ouvrirait aussi — et
       naviguerait vers l'écran qu'elle désigne. */
    poser({
      notifications: [{ ...DEUX[0], vers: '/casier/a1' }]
    });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByLabelText('Retirer « Sortie samedi »'));
    await waitFor(() => expect(derniere('notifications', 'DELETE')).toBeDefined());
    /* On est toujours sur l'écran des notifications. */
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('« effacer les lues » n’emporte QUE les lues', async () => {
    poser({ notifications: DEUX });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Effacer les 1 notification déjà lue' })
    );

    const envoi = await waitFor(() => {
      const r = derniere('notifications', 'DELETE');
      expect(r).toBeDefined();
      return r!;
    });
    /* « lue_le n'est pas nul » : ce qui n'a pas été lu reste. Effacer
       une annonce qu'on n'a pas vue serait la faire disparaître sans
       que personne le sache. */
    expect(envoi.parametres.get('lue_le')).toBe('not.is.null');
  });

  test('sans notification lue, le bouton n’existe pas', async () => {
    poser({ notifications: [DEUX[0]] });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await screen.findByText('Sortie samedi');
    expect(screen.queryByText(/Effacer les/)).not.toBeInTheDocument();
  });

  test('un refus du serveur se LIT', async () => {
    /* Sans « .select() », une suppression que les règles écartent
       revient sans erreur : la liste se rafraîchirait et la
       notification réapparaîtrait sans que rien n'ait expliqué
       pourquoi. */
    poser({ notifications: DEUX, 'notifications:DELETE': [] });
    rendre(<Notifications />, { profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByLabelText('Retirer « Sortie samedi »'));

    expect(await screen.findByText(/n’a pas retiré/)).toBeInTheDocument();
  });
});
