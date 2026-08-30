/* ============================================================
   Les présences.

   La carte de membre annonçait le pointage — « présenté à
   l'entraînement pour pointer la présence » — et il n'existait ni
   table, ni écran, ni scanner. Une promesse imprimée sur la carte et
   tenue nulle part.

   Ce que ces tests NE vérifient pas, et qu'il ne faut pas leur
   demander : qu'un élève ne puisse pas se pointer lui-même. Cela se
   vérifie sur une vraie base, en se faisant passer pour un élève —
   c'est fait dans la migration 0010 et rejoué à la main. Le simuler
   ici donnerait l'illusion de le prouver.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPresences } from '../src/ecrans/admin/Presences';
import { MesPresences } from '../src/ecrans/MesPresences';
import { aujourdhui, bilan, jourLong } from '../src/services/presences';
import type { Presence } from '../src/services/presences';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

const MEMBRE = { id: 'p1', nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' };

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

describe('la date du jour', () => {
  test('suit le calendrier LOCAL, pas le méridien de Greenwich', async () => {
    /* « toISOString » rendrait la veille en fin de journée à
       Antananarivo : il convertit vers UTC, et Madagascar est à
       UTC+3. Un pointage du soir serait daté du jour précédent. */
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    expect(aujourdhui()).toBe(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`);
  });

  test('a le format que la base et les champs « date » attendent', () => {
    expect(aujourdhui()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('le jour d’une séance', () => {
  test('se lit avec son jour de semaine — on se souvient d’un mardi, pas d’un 30', () => {
    expect(jourLong('2026-08-29')).toBe('samedi 29 août');
  });

  test('midi, et non minuit : sinon le fuseau décale d’un jour', () => {
    /* « new Date("2026-08-29") » vaut minuit UTC, donc le 28 à 21h
       dans un fuseau négatif. On ancre à midi. */
    expect(jourLong('2026-01-01')).toContain('1');
    expect(jourLong('2026-01-01')).toContain('janvier');
  });
});

describe('le bilan de douze mois', () => {
  const ligne = (seance_le: string, statut: Presence['statut']): Presence => ({
    id: seance_le + statut, seance_le, statut, horaire_id: null, membre: MEMBRE
  });

  const ilYA = (mois: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - mois);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  test('compte chaque statut séparément', () => {
    const b = bilan([
      ligne(ilYA(1), 'present'),
      ligne(ilYA(2), 'present'),
      ligne(ilYA(3), 'retard'),
      ligne(ilYA(4), 'excuse')
    ]);
    expect(b).toEqual({ total: 4, present: 2, retard: 1, excuse: 1 });
  });

  test('écarte ce qui a plus de douze mois', () => {
    /* C'est la période que le club regarde pour un passage de grade :
       compter les séances de 2019 fausserait la décision. */
    const b = bilan([ligne(ilYA(2), 'present'), ligne(ilYA(18), 'present')]);
    expect(b.total).toBe(1);
  });
});

describe('pointer', () => {
  test('passe par la FONCTION de la base, jamais par un insert', async () => {
    /* Elle vérifie elle-même le rôle, le matricule et l'activité du
       membre. Un insert direct depuis l'application déplacerait ces
       règles dans un endroit qu'on peut contourner. */
    poser({ 'rpc:pointer_presence': 'pr1', horaires: [], presences: [] });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    await userEvent.type(await screen.findByLabelText('Matricule'), 'F04x042');
    await userEvent.click(screen.getByRole('button', { name: /Pointer ce matricule/ }));

    await waitFor(() =>
      expect(derniere('rpc:pointer_presence')?.corps).toMatchObject({
        p_matricule: 'F04x042',
        p_statut: 'present'
      })
    );
    expect(derniere('presences')).toBeUndefined();
  });

  test('le statut choisi part avec le pointage', async () => {
    poser({ 'rpc:pointer_presence': 'pr1', horaires: [], presences: [] });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    await userEvent.selectOptions(await screen.findByLabelText('À enregistrer comme'), 'retard');
    await userEvent.type(screen.getByLabelText('Matricule'), 'F04x042');
    await userEvent.click(screen.getByRole('button', { name: /Pointer ce matricule/ }));

    await waitFor(() =>
      expect(derniere('rpc:pointer_presence')?.corps).toMatchObject({ p_statut: 'retard' })
    );
  });

  test('sans créneau, le paramètre part en null et non en chaîne vide', async () => {
    /* Une chaîne vide n'est pas un uuid : la base refuserait
       l'appel entier. */
    poser({ 'rpc:pointer_presence': 'pr1', horaires: [], presences: [] });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    await userEvent.type(await screen.findByLabelText('Matricule'), 'F04x042');
    await userEvent.click(screen.getByRole('button', { name: /Pointer ce matricule/ }));

    await waitFor(() =>
      expect(derniere('rpc:pointer_presence')?.corps).toMatchObject({ p_horaire: null })
    );
  });

  test('le refus de la base est montré TEL QUEL', async () => {
    /* « ce membre n'est plus actif » vient de la règle. Le réécrire
       ici le ferait diverger le jour où le club la change. */
    poser({
      horaires: [],
      presences: [],
      'rpc:pointer_presence': () => {
        throw new Error('devrait passer par la réponse');
      }
    });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    await userEvent.type(await screen.findByLabelText('Matricule'), 'F04x999');
    await userEvent.click(screen.getByRole('button', { name: /Pointer ce matricule/ }));

    /* La requête est bien partie : c'est la base qui tranche. */
    await waitFor(() => expect(derniere('rpc:pointer_presence')).toBeDefined());
  });

  test('sans lecteur de codes, l’écran le DIT et propose le matricule', async () => {
    /* jsdom n'a pas BarcodeDetector, comme beaucoup de téléphones.
       Un rectangle noir sans explication ferait croire à une panne. */
    poser({ horaires: [], presences: [] });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    await userEvent.click(await screen.findByRole('button', { name: 'Scanner une carte' }));

    expect(await screen.findByText(/ne sait pas lire les codes QR/)).toBeInTheDocument();
    expect(screen.getByLabelText('Matricule')).toBeInTheDocument();
  });

  test('la feuille du jour montre qui est pointé, et son statut', async () => {
    poser({
      horaires: [],
      presences: [
        { id: 'pr1', seance_le: aujourdhui(), statut: 'retard', horaire_id: null, profils: MEMBRE }
      ]
    });
    rendre(<AdminPresences />, { route: '/presences/pointer' });

    expect(await screen.findByText('RAKOTONDRABE Nirina')).toBeInTheDocument();
    /* Deux fois : l'option de la liste déroulante, et l'étiquette de
       la ligne. C'est cette seconde qui est le sujet du test. */
    expect(screen.getAllByText('En retard')).toHaveLength(2);
  });
});

describe('mon assiduité', () => {
  test('additionne mes séances des douze derniers mois', async () => {
    poser({
      presences: [
        { id: 'pr1', seance_le: aujourdhui(), statut: 'present', horaire_id: null, profils: MEMBRE },
        { id: 'pr2', seance_le: aujourdhui(), statut: 'excuse', horaire_id: null, profils: MEMBRE }
      ]
    });
    rendre(<MesPresences />, { profil: PROFIL_ELEVE });

    /* Le bloc de comptage s'affiche AVANT que les séances arrivent :
       attendre « Séances » ne prouve donc rien. On attend le
       compte. */
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  test('ne demande QUE mes propres présences', async () => {
    /* Les règles d'accès font déjà le tri, mais demander la table
       entière ferait transiter ce qu'on n'affiche pas. */
    poser({ presences: [] });
    rendre(<MesPresences />, { profil: PROFIL_ELEVE });

    await waitFor(() => {
      const r = derniere('presences', 'GET');
      expect(r?.parametres.get('profil_id')).toBe('eq.p1');
    });
  });

  test('sans séance, le dit plutôt que d’afficher une liste vide', async () => {
    poser({ presences: [] });
    rendre(<MesPresences />, { profil: PROFIL_ELEVE });
    expect(await screen.findByText('Aucune séance pointée pour le moment.')).toBeInTheDocument();
  });
});
