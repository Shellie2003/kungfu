/* ============================================================
   La fiche du membre connecté.

   Un seul test, et c'est le plus important du dossier : la lecture
   du profil au démarrage. Sa panne n'a rien cassé de visible — elle
   a rendu « null » là où l'on attendait une fiche, et une dizaine
   d'écrans se sont comportés comme si personne n'était connecté,
   sans un message d'erreur.

   Ce qui est vérifié ici est donc la REQUÊTE, pas l'affichage :
   l'absence du filtre est invisible à l'écran tant que la base ne
   contient qu'un membre, et le club en a soixante-quatre.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { supabase } from '../src/services/supabase';
import { useEcouteSession, useSession } from '../src/services/session';
import type { Requete } from './serveur';
import { brancherServeur, poser, poserAuth, recues, reinitialiser, sessionFactice } from './serveur';

/* L'annuaire tel que la règle d'accès le rend à un membre connecté :
   TOUTES les fiches actives, pas seulement la sienne. C'est ce qui
   rendait « .single() » systématiquement en erreur. */
const ANNUAIRE = [
  { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina', role: 'eleve', grade_id: 'gv', photo: null },
  { id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery', role: 'maitre', grade_id: 'gn', photo: null },
  { id: 'p0', numero: 'F04x001', nom: 'RAHARISOA', prenom: 'Fanja', role: 'admin', grade_id: 'gn', photo: null }
];

function Sonde() {
  useEcouteSession();
  return null;
}

beforeEach(async () => {
  reinitialiser();
  brancherServeur();
  useSession.setState({ session: null, profil: null, chargement: true });
  await supabase.auth.signOut({ scope: 'local' });
});

describe('la lecture de la fiche au démarrage', () => {
  test('demande LA fiche de ce compte, et non la première venue', async () => {
    poserAuth({ token: sessionFactice('u1'), user: { id: 'u1' } });
    /* Le serveur simulé n'applique aucune règle d'accès : il rend ce
       qu'on lui demande. Si le code oublie le filtre, il recevra donc
       les trois fiches — exactement comme le vrai serveur. */
    poser({
      profils: (r: Requete) =>
        ANNUAIRE.filter((p) =>
          r.parametres.get('compte_id') === 'eq.u1' ? p.id === 'p0' : true
        )
    });
    render(<Sonde />);
    await supabase.auth.signInWithPassword({ email: 'f04x001@waishi.local', password: 'essai' });

    await waitFor(() => expect(useSession.getState().profil).not.toBeNull());

    /* ⚠ Le cœur du test. Sans « compte_id=eq.<uid> », la requête
       ramène l'annuaire entier et la fiche du connecté devient un
       tirage au sort — quand elle ne devient pas « null ». */
    const demande = [...recues].reverse().find((r) => r.table === 'profils' && r.methode === 'GET');
    expect(demande?.parametres.get('compte_id')).toBe('eq.u1');
    expect(useSession.getState().profil?.numero).toBe('F04x001');
    expect(useSession.getState().profil?.role).toBe('admin');
  });

  test('une fiche non rattachée ne fait pas d’erreur, elle fait « aucune »', async () => {
    /* Un compte créé dont la fiche n'est pas encore rattachée : zéro
       ligne. C'est un cas NORMAL, et « .single() » en faisait une
       erreur. « maybeSingle » en fait un « null » — la différence
       entre « personne » et « la lecture a échoué ». */
    poserAuth({ token: sessionFactice('u9'), user: { id: 'u9' } });
    poser({ profils: [] });
    render(<Sonde />);
    await supabase.auth.signInWithPassword({ email: 'f04x061@waishi.local', password: 'essai' });

    await waitFor(() => expect(useSession.getState().chargement).toBe(false));
    expect(useSession.getState().profil).toBeNull();
  });
});
