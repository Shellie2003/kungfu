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
import { Actualite, Casier } from '../src/ecrans/Casier';
import { Participation } from '../src/ecrans/Participation';
import { brancherServeur, derniere, poser, reinitialiser } from './serveur';
import { PROFIL_ADMIN, PROFIL_ELEVE, rendre } from './rendu';

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

  test('le montant FIXÉ par le club est dit, et ce qui reste avec', async () => {
    /* Le vrai défaut de cet écran : il proposait quatre sommes rondes
       et personne ne savait combien il fallait donner. On demandait au
       maître le samedi. Le montant vient maintenant de la sortie
       elle-même, et le total suit les accompagnants — c'est par place
       qu'on paie le taxi-brousse. */
    poser({
      actualites: { ...SORTIE, participation_ar: 15000 },
      participations: {
        id: 'pa1', accompagnants: 1, montant_promis: null, note: null,
        valide_le: null, refuse_le: null, motif: null,
        versements: [{ id: 'v1', montant: 10000, recu_le: '2026-09-01' }]
      },
      reglages: []
    });
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

    /* Deux places à quinze mille. */
    expect(await screen.findByText(/15 000 Ar × 2 places/)).toBeInTheDocument();
    expect(screen.getByText('30 000 Ar')).toBeInTheDocument();
    /* Et le reliquat, proposé d'un appui : c'est le montant qu'on
       voulait envoyer, et le chercher parmi des sommes rondes qui ne
       tombent pas juste était tout le problème. */
    const reliquat = screen.getByRole('button', { name: /Tout le reste/ });
    expect(reliquat.textContent?.replace(/\s/g, ' ')).toContain('20 000');
  });

  test('sans montant fixé, l’écran ne réclame rien', async () => {
    /* Gratuit et « pas encore décidé » se ressemblent, et l'écran les
       traite pareil : il se tait. Afficher « reste 0 Ar » ferait
       croire à un montant qu'on a oublié de poser. */
    poser({ actualites: SORTIE, participations: null, reglages: [] });
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

    await screen.findByText('Ma participation');
    expect(screen.queryByText('Reste')).not.toBeInTheDocument();
    expect(screen.queryByText(/tout le reste/)).not.toBeInTheDocument();
  });
});

/* ============================================================
   Les raccourcis de publication.

   « Pour le casier on doit ajouter un bouton pour ajouter un
   événement avec toutes les infos nécessaires » : le formulaire
   existait — titre, catégorie, date, lieu, texte, image — mais il
   vivait à trois appuis de là, dans l'écran d'administration. On
   publie là où l'on constate qu'une annonce manque.

   Ce n'est PAS une permission de plus : la route et le serveur
   refusent déjà ce que le rôle n'autorise pas. Le bouton n'apparaît
   qu'à qui peut s'en servir, ce qui est une question d'encombrement,
   pas de sécurité — d'où les deux tests.
   ============================================================ */
describe('publier depuis le casier', () => {
  test('l’administration a le raccourci', async () => {
    poser({ actualites: [SORTIE], notifications: [] });
    rendre(<Casier />, { route: '/casier', profil: PROFIL_ADMIN });
    expect(await screen.findByLabelText('Publier une actualité')).toBeInTheDocument();
  });

  test('un élève ne l’a pas — il n’aurait rien à en faire', async () => {
    poser({ actualites: [SORTIE], notifications: [] });
    rendre(<Casier />, { route: '/casier', profil: PROFIL_ELEVE });
    await screen.findByText('Sortie au lac Mantasoa');
    expect(screen.queryByLabelText('Publier une actualité')).not.toBeInTheDocument();
  });
});

/* ============================================================
   LE CODE USSD, MODIFIABLE.

   « Les codes USSD doivent être éditables ; voici la structure par
   défaut : #111*1*2*num_responsable*montant#. Ceci n'est pas exécuté
   automatiquement mais renvoyé seulement dans l'application de
   téléphonie par défaut. »

   Les menus d'un opérateur changent — MVola a déjà renuméroté les
   siens — et un code figé dans l'application ferait attendre une mise
   à jour sur le Play Store pour un chiffre.
   ============================================================ */
describe('le code USSD', () => {
  const REGLAGES = [
    { cle: 'mvola_numero', valeur: '0388010853' },
    { cle: 'mvola_nom', valeur: 'Santatra Nirina Antonio' }
  ];

  const ouvrir = () =>
    rendre(<Participation />, {
      route: '/participer/a1', chemin: '/participer/:id', profil: PROFIL_ELEVE
    });

  test('la structure par défaut est celle du club', async () => {
    poser({ actualites: SORTIE, participations: null, reglages: REGLAGES });
    ouvrir();

    const champ = (await screen.findByLabelText('Code USSD à composer')) as HTMLInputElement;
    expect(champ.value).toBe('#111*1*2*0388010853*5000#');
  });

  test('le club peut poser un AUTRE gabarit, sans nouvelle version', async () => {
    /* Orange Money et Airtel Money ont leurs propres menus, et MVola
       renumérote les siens. C'est un réglage, pas une constante. */
    poser({
      actualites: SORTIE,
      participations: null,
      reglages: [...REGLAGES, { cle: 'ussd_gabarit', valeur: '#144*1*NUMERO*MONTANT#' }]
    });
    ouvrir();

    const champ = (await screen.findByLabelText('Code USSD à composer')) as HTMLInputElement;
    expect(champ.value).toBe('#144*1*0388010853*5000#');
  });

  test('le code SUIT le montant tant qu’on n’y a pas touché', async () => {
    /* Un code figé au premier rendu enverrait cinq mille ariary après
       qu'on a choisi dix mille, et personne ne s'en apercevrait. */
    poser({ actualites: SORTIE, participations: null, reglages: REGLAGES });
    ouvrir();

    await screen.findByLabelText('Code USSD à composer');
    await userEvent.click(screen.getByRole('button', { name: /^10\s?000\s?Ar$/ }));

    expect(
      (screen.getByLabelText('Code USSD à composer') as HTMLInputElement).value
    ).toBe('#111*1*2*0388010853*10000#');
  });

  test('corrigé à la main, il le DIT et ne suit plus le montant', async () => {
    /* Sinon on corrige le code, on change le montant, et le montant
       corrigé disparaît sans un mot. */
    poser({ actualites: SORTIE, participations: null, reglages: REGLAGES });
    ouvrir();

    const champ = await screen.findByLabelText('Code USSD à composer');
    await userEvent.clear(champ);
    await userEvent.type(champ, '#111*1*2*0331234567*7000#');

    expect(screen.getByText(/Code modifié à la main/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^1\s?000\s?Ar$/ }));
    expect((champ as HTMLInputElement).value).toBe('#111*1*2*0331234567*7000#');
  });

  test('« rétablir » ramène le code du club', async () => {
    poser({ actualites: SORTIE, participations: null, reglages: REGLAGES });
    ouvrir();

    const champ = await screen.findByLabelText('Code USSD à composer');
    await userEvent.clear(champ);
    await userEvent.type(champ, '#000#');
    await userEvent.click(screen.getByRole('button', { name: 'rétablir' }));

    expect((champ as HTMLInputElement).value).toBe('#111*1*2*0388010853*5000#');
    expect(screen.queryByText(/Code modifié à la main/)).not.toBeInTheDocument();
  });

  test('RIEN n’est composé tout seul : le code part au clavier', async () => {
    /* LE POINT QUI COMPTE. L'application ouvre l'application de
       téléphonie avec le code déjà écrit ; c'est la personne qui
       appuie sur appeler. Une application qui déclencherait un
       transfert d'argent sans confirmation serait exactement ce
       qu'on ne veut pas — et Android ne compose de toute façon
       jamais un code USSD depuis un lien « tel: ». */
    poser({ actualites: SORTIE, participations: null, reglages: REGLAGES });
    ouvrir();

    await screen.findByLabelText('Code USSD à composer');
    const allees: string[] = [];
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { set href(v: string) { allees.push(v); }, get href() { return ''; } }
    });

    await userEvent.click(screen.getByRole('button', { name: /Ouvrir le clavier/ }));

    expect(allees).toHaveLength(1);
    expect(allees[0]).toMatch(/^tel:/);
    expect(decodeURIComponent(allees[0]!)).toBe('tel:#111*1*2*0388010853*5000#');
  });
});
