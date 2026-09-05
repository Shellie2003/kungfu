/* ============================================================
   LE MATRICULE SE CORRIGE.

   « Je veux que le matricule puisse être éditable. »

   ------------------------------------------------------------
   CE QUI REND CETTE FONCTIONNALITÉ PIÉGEUSE

   L'adresse de connexion est DÉRIVÉE du matricule : « F04x042 »
   donne « f04x042@waishi.local ». Changer la colonne « numero » sans
   toucher au compte laisse un membre dont l'application compose une
   adresse qui n'existe plus. Il tape son nouveau matricule et son
   bon mot de passe, et lit « numéro de membre ou mot de passe
   incorrect ».

   Rien, dans la base, ne paraît anormal : la fiche est juste, le
   compte existe, le mot de passe est bon. C'est le genre de défaut
   qu'on ne trouve qu'en le cherchant, et qu'on ne cherche que si
   quelqu'un se plaint.

   D'où ces essais : ils vérifient que le renommage passe par le
   SERVEUR, qui seul peut changer les deux ensemble.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminFiche } from '../src/ecrans/admin/Fiche';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_SUPER, rendre } from './rendu';

const FICHE = {
  id: 'p1',
  numero: 'F04x042',
  nom: 'RAKOTONDRABE',
  prenom: 'Nirina',
  debut: '2019-09-09',
  biographie: null,
  photo: null,
  actif: true,
  grades: null,
  profils_prives: null,
  tuteurs: []
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

function ouvrirLaFiche() {
  poser({ profils: [FICHE], grades: [], 'fonction:comptes': { ok: true, numero: 'F04x077' } });
  rendre(<AdminFiche />, {
    route: '/admin/fiche/p1',
    chemin: '/admin/fiche/:id',
    profil: PROFIL_SUPER
  });
}

describe('à la modification', () => {
  test('le matricule est proposé, et pré-rempli', async () => {
    ouvrirLaFiche();
    const champ = await screen.findByLabelText('Numéro de membre');
    await waitFor(() => expect(champ).toHaveValue('F04x042'));
  });

  test('les espaces partent, la CASSE reste', async () => {
    /* On colle facilement « F04x 077 » : l'espace part.

       La casse, elle, est conservée — et c'est un choix. Le préfixe
       du club est « F04x », avec un x MINUSCULE. Tout mettre en
       capitales donnerait « F04X077 » juste à côté de « F04x078 »
       pour le membre suivant : deux conventions dans le même
       annuaire, sur les cartes imprimées.

       Le risque que la mise en capitales devait écarter — deux
       matricules identiques à la casse près, donc une seule adresse
       de connexion pour deux membres — est traité là où il doit
       l'être : le serveur vérifie l'unicité SANS distinguer la
       casse. */
    ouvrirLaFiche();
    const champ = await screen.findByLabelText('Numéro de membre');
    await waitFor(() => expect(champ).toHaveValue('F04x042'));
    await userEvent.clear(champ);
    await userEvent.type(champ, 'F04x 077');
    expect(champ).toHaveValue('F04x077');
  });

  test('l’écran DIT les deux conséquences', async () => {
    /* Aucune des deux ne se devine, et les deux se découvrent trop
       tard : le membre ne peut plus se connecter avec l'ancien
       numéro, et sa carte imprimée — dont le code QR encode
       l'ancien — cesse de pointer sa présence. */
    ouvrirLaFiche();
    await screen.findByLabelText('Numéro de membre');
    expect(screen.getByText(/c’est avec ce numéro que le membre se connecte/i))
      .toBeInTheDocument();
    expect(screen.getByText(/carte imprimée/i)).toBeInTheDocument();
  });

  test('le renommage passe par le SERVEUR, pas par une écriture directe', async () => {
    /* LE POINT QUI DÉCIDE DE TOUT. Seul le serveur détient la clé
       qui peut toucher au compte de connexion. Une mise à jour
       directe de « profils.numero » depuis l'application laisserait
       le compte avec l'ancienne adresse. */
    ouvrirLaFiche();
    const champ = await screen.findByLabelText('Numéro de membre');
    await waitFor(() => expect(champ).toHaveValue('F04x042'));
    await userEvent.clear(champ);
    await userEvent.type(champ, 'F04x077');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    const appel = await waitFor(() => {
      const r = derniere('fonction:comptes');
      expect(r).toBeDefined();
      return r!.corps as Record<string, unknown>;
    });
    expect(appel).toMatchObject({
      action: 'renommer',
      profilId: 'p1',
      numero: 'F04x077'
    });

    /* Et la mise à jour ordinaire de la fiche n'emporte PAS le
       numéro : elle passerait outre le compte.

       « PATCH » explicitement : « derniere » cherche des POST par
       défaut, et une fiche se MODIFIE. Sans le dire, on interrogeait
       une écriture qui n'existe pas et l'essai passait pour de
       mauvaises raisons. */
    const ecriture = derniere('profils', 'PATCH');
    expect(ecriture?.corps).not.toHaveProperty('numero');
  });

  test('sans y toucher, aucun renommage n’est demandé', async () => {
    /* On ne renomme pas un compte de connexion parce qu'une
       biographie a été corrigée. */
    ouvrirLaFiche();
    await screen.findByLabelText('Numéro de membre');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(derniere('profils', 'PATCH')).toBeDefined());
    expect(derniere('fonction:comptes')).toBeUndefined();
  });

  test('un refus du serveur est montré, et la fiche n’est pas enregistrée', async () => {
    /* « Le matricule F04x077 est déjà attribué. » L'écriture
       s'arrête là : enregistrer le reste laisserait croire que tout
       est passé. */
    poser({
      profils: [FICHE],
      grades: [],
      'fonction:comptes': { statut: 409, message: 'Le matricule F04x077 est déjà attribué.' }
    });
    rendre(<AdminFiche />, {
      route: '/admin/fiche/p1',
      chemin: '/admin/fiche/:id',
      profil: PROFIL_SUPER
    });

    const champ = await screen.findByLabelText('Numéro de membre');
    await waitFor(() => expect(champ).toHaveValue('F04x042'));
    await userEvent.clear(champ);
    await userEvent.type(champ, 'F04x077');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/déjà attribué/);
  });
});

describe('à l’inscription', () => {
  test('le matricule n’est PAS saisi', async () => {
    /* C'est la base qui l'attribue : deux inscriptions simultanées
       produiraient sinon deux fois le même numéro. */
    poser({ 'rpc:prochain_numero': 'F04x065', profils: [{ id: 'neuf' }], grades: [] });
    rendre(<AdminFiche />, { route: '/admin/fiche', profil: PROFIL_SUPER });

    await screen.findByLabelText('Nom');
    expect(screen.queryByLabelText('Numéro de membre')).toBeNull();
  });
});
