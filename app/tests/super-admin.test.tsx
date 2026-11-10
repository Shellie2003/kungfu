/* ============================================================
   Le super administrateur.

   « Il y a un compte super admin qui a le contrôle sur tout, puis un
   admin (maître ou gradé). Le super admin décide quel est le rôle
   d'une personne dès l'inscription, puis l'application génère
   automatiquement les infos de connexion de ce membre créé. Seul lui
   peut suspendre, supprimer définitivement un membre. »

   ------------------------------------------------------------
   CE QUE CES TESTS TIENNENT, ET CE QU'ILS NE TIENNENT PAS

   Ils tiennent le comportement de l'ÉCRAN : à qui l'on propose quoi,
   ce qui part sur le réseau, et ce qui s'affiche en retour.

   Ils ne tiennent PAS la sécurité. Elle est ailleurs, et c'est
   volontaire : dans la migration 0016 — deux déclencheurs et une
   règle de suppression — et dans la fonction déployée « comptes »,
   qui refuse « suspendre » et « supprimer » à qui n'est pas super
   administrateur. Un écran ne protège rien : la fonction reste
   appelable avec le jeton de n'importe quel administrateur, depuis
   n'importe quel outil.

   Ce que l'écran doit faire, c'est ne pas PROPOSER ce qui sera
   refusé — montrer un bouton qui mène à une erreur laisse la
   personne se demander si le fautif est elle ou l'application.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminFiche } from '../src/ecrans/admin/Fiche';
import { AdminComptes } from '../src/ecrans/admin/Comptes';
import { AdminSuper } from '../src/ecrans/admin/Super';
import { Admin } from '../src/ecrans/Admin';
import { brancherServeur, derniere, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_SUPER, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

/* La fonction déployée rend le mot de passe engendré par le serveur.
   L'application ne l'invente jamais : elle ne le verrait pas passer
   deux fois, et un mot de passe tiré côté téléphone serait tiré avec
   le générateur du téléphone. */
const AVEC_COMPTE = {
  'fonction:comptes': { motDePasse: 'Kf7mQ2pXwR4t' },
  'rpc:prochain_numero': 'F04x065',
  profils: [{ id: 'neuf', numero: 'F04x065' }],
  grades: []
};

describe('le rôle se choisit à l’inscription — par le super administrateur', () => {
  test('le super administrateur voit le choix du rôle', async () => {
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    expect(await screen.findByLabelText('Rôle')).toBeInTheDocument();
  });

  test('un administrateur ordinaire ne le voit pas', async () => {
    /* Le serveur le lui refuserait — un déclencheur de la base
       n'accepte l'inscription d'un non-élève que d'un super
       administrateur. Le lui proposer serait l'envoyer vers une
       erreur qu'il ne saurait pas s'expliquer. */
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_ADMIN });

    await screen.findByLabelText('Nom');
    expect(screen.queryByLabelText('Rôle')).not.toBeInTheDocument();
  });

  test('le rôle choisi PART avec la fiche', async () => {
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.selectOptions(screen.getByLabelText('Rôle'), 'maitre');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    const envoi = (await waitFor(() => {
      const r = derniere('profils');
      expect(r).toBeDefined();
      return r!;
    })).corps as { role: string; nom: string };
    expect(envoi.role).toBe('maitre');
  });

  test('sans choix, on inscrit un ÉLÈVE', async () => {
    /* Le cas de soixante et un des soixante-quatre membres, et le
       seul qu'un administrateur ordinaire puisse inscrire. */
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_ADMIN });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    const envoi = (await waitFor(() => {
      const r = derniere('profils');
      expect(r).toBeDefined();
      return r!;
    })).corps as { role: string };
    expect(envoi.role).toBe('eleve');
  });
});

describe('les identifiants sont engendrés dans la foulée', () => {
  test('l’inscription crée le compte et montre le mot de passe', async () => {
    /* C'ÉTAIT EN DEUX TEMPS, et l'on oubliait le second : créer la
       fiche ici, puis retrouver le membre dans l'écran des comptes et
       lui créer un accès. La fiche existait, le membre ne pouvait pas
       se connecter, et personne ne s'en apercevait avant qu'il essaie
       un samedi matin. */
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    /* Le matricule vient de la BASE, le mot de passe du SERVEUR :
       ni l'un ni l'autre n'est inventé par le téléphone. */
    expect(await screen.findByText('F04x065')).toBeInTheDocument();
    expect(screen.getByText('Kf7mQ2pXwR4t')).toBeInTheDocument();
    /* Et l'on prévient qu'il ne repassera pas : il n'est stocké en
       clair nulle part, ici pas plus qu'en base. */
    expect(screen.getByText(/ne s’affichera plus/)).toBeInTheDocument();
  });

  test('si le COMPTE échoue, la fiche reste et l’écran le dit', async () => {
    /* LE CAS QUI DÉCIDE DE LA QUALITÉ DE CETTE FONCTIONNALITÉ.

       La fiche est le travail de saisie : nom, grade, date de
       naissance, tuteur. La perdre parce que la création du compte a
       échoué ferait tout retaper. Mais annoncer une réussite complète
       laisserait un membre sans accès, et personne ne le saurait.

       On garde la fiche ET on dit ce qui manque. */
    poser({
      ...AVEC_COMPTE,
      'fonction:comptes': { statut: 409, message: 'Cette fiche a déjà un compte.' }
    });
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    expect(await screen.findByText(/n’a pas pu l’être/)).toBeInTheDocument();
    /* La fiche, elle, est bien partie. */
    expect(derniere('profils')).toBeDefined();
  });
});

describe('la photo se pose DÈS l’inscription', () => {
  test('elle part dans le seau des portraits, et avec la fiche', async () => {
    /* Elle ne se posait qu'après : créer la fiche, ressortir, la
       rouvrir, choisir la photo. Trois écrans pour une chose qu'on a
       sous la main au moment où l'on inscrit quelqu'un — donc une
       chose qu'on ne faisait pas, et soixante-quatre silhouettes
       grises dans l'annuaire. */
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    await userEvent.type(await screen.findByLabelText('Nom'), 'RANDRIA');
    await userEvent.type(screen.getByLabelText('Prénom'), 'Koto');
    await userEvent.upload(
      screen.getByLabelText('Importer'),
      new File(['x'], 'koto.jpg', { type: 'image/jpeg' })
    );

    const envoiPhoto = await waitFor(() => {
      const r = [...recues].reverse().find((x) => x.chemin?.includes('/object/portraits/'));
      expect(r).toBeDefined();
      return r!;
    });
    expect(envoiPhoto.chemin).toMatch(/\/object\/portraits\//);

    await userEvent.click(screen.getByRole('button', { name: 'Inscrire ce membre' }));

    const fiche = (await waitFor(() => {
      const r = derniere('profils');
      expect(r).toBeDefined();
      return r!;
    })).corps as { photo: string | null };
    /* La fiche reçoit le CHEMIN, jamais une adresse : les seaux sont
       privés et une adresse signée expire au bout d'une heure. */
    expect(fiche.photo).toBeTruthy();
    expect(fiche.photo).not.toMatch(/^https?:/);
  });

  test('l’appareil photo est proposé, pas seulement la galerie', async () => {
    poser(AVEC_COMPTE);
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    expect(await screen.findByLabelText('Prendre une photo')).toHaveAttribute(
      'capture',
      'environment'
    );
    expect(screen.getByLabelText('Importer')).not.toHaveAttribute('capture');
  });
});

describe('suspendre et supprimer : au super administrateur seul', () => {
  const COMPTES = [
    {
      id: 'p7', numero: 'F04x050', nom: 'RANDRIA', prenom: 'Koto',
      role: 'eleve', actif: true, compte_id: 'u7'
    }
  ];

  test('le super administrateur les voit', async () => {
    poser({ profils: COMPTES });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    expect(await screen.findByRole('button', { name: 'Suspendre' })).toBeInTheDocument();
    expect(
      screen.getByLabelText('Supprimer définitivement RANDRIA Koto')
    ).toBeInTheDocument();
  });

  test('un administrateur ordinaire ne les voit pas', async () => {
    poser({ profils: COMPTES });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_ADMIN });

    await screen.findByText(/F04x050/);
    expect(screen.queryByRole('button', { name: 'Suspendre' })).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Supprimer définitivement RANDRIA Koto')
    ).not.toBeInTheDocument();
    /* Ce qu'il garde : créer un compte et réinitialiser un mot de
       passe. Ce sont les gestes du samedi matin, et les réserver au
       super administrateur ferait attendre le club sans rien
       protéger de plus. */
    expect(screen.getByRole('button', { name: 'Réinitialiser' })).toBeInTheDocument();
  });

  test('on ne se supprime pas soi-même', async () => {
    /* Se supprimer déconnecte définitivement ; si c'est le dernier
       super administrateur, plus personne ne peut en nommer un autre
       et le club est enfermé dehors. Le serveur le refuse aussi. */
    poser({
      profils: [
        {
          id: PROFIL_SUPER.id, numero: PROFIL_SUPER.numero, nom: PROFIL_SUPER.nom,
          prenom: PROFIL_SUPER.prenom, role: 'admin', actif: true, compte_id: 'u9'
        }
      ]
    });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    await screen.findByText(new RegExp(PROFIL_SUPER.numero));
    expect(
      screen.queryByLabelText(`Supprimer définitivement ${PROFIL_SUPER.nom} ${PROFIL_SUPER.prenom}`)
    ).not.toBeInTheDocument();
  });

  test('la suppression demande confirmation, en NOMMANT la personne', async () => {
    /* « Supprimer ce membre ? » se répond « oui » sans lire.
       « Supprimer RANDRIA Koto ? » fait relever les yeux. Il n'y a
       pas de corbeille : un appui de trop efface dix ans
       d'historique. */
    poser({ profils: COMPTES });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    await userEvent.click(
      await screen.findByLabelText('Supprimer définitivement RANDRIA Koto')
    );

    expect(
      await screen.findByText('Supprimer définitivement RANDRIA Koto ?')
    ).toBeInTheDocument();
    /* Rien n'est parti tant qu'on n'a pas confirmé. */
    expect(recues.filter((r) => r.table === 'fonction:comptes')).toHaveLength(0);
  });

  test('confirmée, elle part avec l’action « supprimer »', async () => {
    poser({ profils: COMPTES, 'fonction:comptes': { ok: true, supprime: 'F04x050' } });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    await userEvent.click(
      await screen.findByLabelText('Supprimer définitivement RANDRIA Koto')
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Supprimer définitivement' })
    );

    const appel = (await waitFor(() => {
      const r = derniere('fonction:comptes');
      expect(r).toBeDefined();
      return r!;
    })).corps as { action: string; profilId: string };
    expect(appel.action).toBe('supprimer');
    expect(appel.profilId).toBe('p7');
  });

  test('un refus du serveur se LIT', async () => {
    /* Le serveur a le dernier mot, et c'est lui qui protège. Si un
       jour l'écran laissait passer ce qu'il ne devrait pas, le refus
       doit s'afficher — pas disparaître en silence. */
    poser({
      profils: COMPTES,
      /* « statut » fait rendre un vrai refus au bouchon. Sans lui, il
         répondait 200 et l'application n'empruntait jamais son chemin
         d'erreur : le test aurait éprouvé le mauvais code. */
      'fonction:comptes': {
        statut: 403,
        message: 'Supprimer définitivement un membre est réservé au super administrateur.'
      }
    });
    rendre(<AdminComptes />, { route: '/admin/comptes', profil: PROFIL_SUPER });

    await userEvent.click(
      await screen.findByLabelText('Supprimer définitivement RANDRIA Koto')
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Supprimer définitivement' })
    );

    expect(await screen.findByText(/réservé au super administrateur/)).toBeInTheDocument();
  });
});

/* ============================================================
   LE PANNEAU DE SUPER ADMINISTRATION.

   « Je veux une interface sous forme de panneau de super admin avec
   toutes les fonctionnalités que le super admin seul peut avoir. »

   ------------------------------------------------------------
   CE QUI EST NOUVEAU, ET CE QUI NE L'EST PAS

   Trois des quatre pouvoirs existaient déjà, dispersés dans deux
   écrans d'administration ordinaires. Le panneau les rassemble et
   les NOMME, sans rien recopier : il conduit vers eux.

   Le quatrième — NOMMER un second super administrateur — manquait
   vraiment. La base l'autorisait depuis la migration 0016 ; aucun
   écran ne le proposait, et le club n'avait donc aucun moyen d'en
   désigner un autre depuis l'application. Cela s'est révélé coûteux
   le jour où le seul super administrateur s'est retrouvé dehors.

   ------------------------------------------------------------
   ⚠ CE QUE CES ESSAIS NE TIENNENT PAS

   La sécurité, comme pour le reste de ce fichier. Elle est dans le
   déclencheur de la migration 0016, qui refuse toute modification de
   « super_admin » à qui n'est pas déjà super, et qui refuse de
   retirer le DERNIER. Un écran ne protège rien.

   Ce que l'écran doit faire, c'est ne pas proposer ce qui sera
   refusé — et ne pas cacher ce qui est permis.
   ============================================================ */
describe('le panneau de super administration', () => {
  const DEUX_ADMINS = {
    profils: [
      { id: 'p9', numero: 'F04x000', nom: 'IDEALY', prenom: 'Santatra',
        role: 'admin', actif: true, compte_id: 'u9', super_admin: true },
      { id: 'pa', numero: 'F04x006', nom: 'RAZAFINDRANAIVO', prenom: 'Mampianina',
        role: 'admin', actif: true, compte_id: 'ua', super_admin: false },
      { id: 'pb', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
        role: 'eleve', actif: true, compte_id: null, super_admin: false }
    ]
  };

  test('⚠ il nomme un second super administrateur', async () => {
    /* LE POUVOIR QUI MANQUAIT. Sans lui, un club à un seul super
       administrateur n'a aucun moyen d'en désigner un autre depuis
       l'application — et le jour où celui-là perd son mot de passe,
       plus personne ne peut nommer de rôle, suspendre ni supprimer. */
    poser(DEUX_ADMINS);
    rendre(<AdminSuper />, { route: '/admin/super', profil: PROFIL_SUPER });

    await userEvent.click(
      await screen.findByRole('button', {
        name: /Nommer RAZAFINDRANAIVO Mampianina super administrateur/
      })
    );

    const envoi = (await waitFor(() => {
      /* ⚠ PATCH, et non POST : « nommer » est une MISE À JOUR de la
         colonne « super_admin », pas une inscription. Cherché en POST,
         l'essai ne trouvait rien et accusait l'écran. */
      const r = derniere('profils', 'PATCH');
      expect(r).toBeDefined();
      return r!;
    })).corps as { super_admin: boolean };
    expect(envoi.super_admin).toBe(true);
  });

  test('⚠ le DERNIER super administrateur ne se retire pas', async () => {
    /* Le retirer enfermerait le club dehors : plus personne pour
       nommer un rôle, et cela ne se rattrape que depuis le tableau
       de bord du serveur. La base le refuse ; l'écran ne le propose
       pas — montrer un bouton qui mène à un refus laisse la personne
       se demander si le fautif est elle. */
    poser(DEUX_ADMINS);
    rendre(<AdminSuper />, { route: '/admin/super', profil: PROFIL_SUPER });

    const retirer = await screen.findByRole('button', {
      name: /Retirer la qualité de super administrateur à IDEALY Santatra/
    });
    expect(
      retirer,
      'Le dernier super administrateur peut être retiré depuis l’écran : ' +
        'le club se retrouverait sans personne pour nommer un rôle.'
    ).toBeDisabled();
  });

  test('il avertit quand le club n’a qu’un seul super administrateur', async () => {
    poser(DEUX_ADMINS);
    rendre(<AdminSuper />, { route: '/admin/super', profil: PROFIL_SUPER });

    expect(
      await screen.findByText(/qu’un seul super administrateur/)
    ).toBeInTheDocument();
  });

  test('⚠ les élèves ne figurent pas dans la liste', async () => {
    /* « super_admin » est un drapeau PAR-DESSUS le rôle, pas un
       quatrième rôle : nommer un élève super administrateur n'aurait
       aucun sens, et la base le refuserait. */
    poser(DEUX_ADMINS);
    rendre(<AdminSuper />, { route: '/admin/super', profil: PROFIL_SUPER });

    await screen.findByText(/RAZAFINDRANAIVO/);
    expect(screen.queryByText(/RAKOTONDRABE/)).not.toBeInTheDocument();
  });

  test('il dit que la réinitialisation reste ouverte à toute l’administration', async () => {
    /* Le club l'a voulu ainsi, et c'est un choix qui se défend mal
       sans explication : l'écran la porte, pour qu'on ne la prenne
       pas pour un oubli. */
    poser(DEUX_ADMINS);
    rendre(<AdminSuper />, { route: '/admin/super', profil: PROFIL_SUPER });

    expect(
      await screen.findByText(/Réinitialiser le mot de passe/)
    ).toBeInTheDocument();
  });
});

describe('l’écran d’administration, et le chemin vers le panneau', () => {
  test('⚠ un administrateur ORDINAIRE ne voit pas le bloc', async () => {
    /* Il n'y a rien à y faire pour lui : chaque geste du panneau
       serait refusé par la base. */
    rendre(<Admin />, { route: '/admin', profil: PROFIL_ADMIN });
    await screen.findByText('Membres');
    expect(screen.queryByText('Réservé au super administrateur')).not.toBeInTheDocument();
    expect(screen.queryByText('Super administration')).not.toBeInTheDocument();
  });

  test('le super administrateur le voit', async () => {
    rendre(<Admin />, { route: '/admin', profil: PROFIL_SUPER });
    /* Le titre de SECTION et celui de la LIGNE sont volontairement
       différents : identiques, ils rendaient deux éléments pour le
       même texte, et l'essai échouait sur l'ambiguïté plutôt que sur
       le comportement. */
    expect(
      await screen.findByText('Réservé au super administrateur')
    ).toBeInTheDocument();
    expect(screen.getByText('Super administration')).toBeInTheDocument();
  });
});
