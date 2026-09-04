/* ============================================================
   Ce qui se comporte AUTREMENT dans l'APK.

   « Vérifier que le côté APK fonctionne parfaitement comme dans le
   web, corriger les incohérences au passage. »

   Trois divergences ont été trouvées, et deux d'entre elles ne se
   devinaient pas : il a fallu lire la source Android de Capacitor,
   qui est dans node_modules et que personne n'ouvre jamais.

     1. « window.print() » ne fait RIEN dans la WebView. Elle
        n'imprime pas d'elle-même — il faut que l'application appelle
        « PrintManager », et la source de Capacitor n'en contient
        aucune trace. Deux boutons étaient inertes.

     2. « setBackgroundColor » sur la barre d'état ne fait plus rien
        depuis Android 15 : « shouldSetStatusBarColor » rend faux dès
        l'API 35. Les icônes claires posées une fois pour toutes
        devenaient invisibles sur la barre de titre blanche.

     3. Un greffon employé mais non déclaré échoue en silence, comme
        sur le web — sauf que sur le web c'est normal. Vérifié par
        outils/verifier-apk.mjs.

   Ces tests-ci tiennent la logique ; le banc tient les écrans.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { couleurDuHaut, hautEstClair, oublierLaBarre } from '../src/services/barreDetat';
import { Etudiants } from '../src/ecrans/Etudiants';
import { Salon } from '../src/ecrans/Salon';
import { brancherServeur, poser, recues, reinitialiser } from './serveur';
import { rendre } from './rendu';

/* elementsFromPoint n'existe pas dans jsdom : on le pose, et l'on
   décide nous-mêmes ce qui se trouve sous la barre d'état. C'est
   exactement ce qu'on veut mesurer — la décision, pas le rendu. */
function sousLaBarre(...fonds: string[]) {
  const elements = fonds.map((f) => {
    const e = document.createElement('div');
    e.style.backgroundColor = f;
    document.body.appendChild(e);
    return e;
  });
  document.elementsFromPoint = () => elements;
  return elements;
}

beforeEach(() => {
  oublierLaBarre();
  document.body.innerHTML = '';
});
afterEach(() => vi.restoreAllMocks());

describe('la couleur du haut de l’écran', () => {
  test('elle est LUE, et non déduite d’une liste d’écrans', () => {
    /* Une liste d'écrans sombres marcherait aujourd'hui et se
       périmerait au premier écran ajouté. */
    sousLaBarre('rgb(15, 81, 50)');
    expect(couleurDuHaut()).toBe('rgb(15, 81, 50)');
  });

  test('un fond TRANSPARENT n’est pas la couleur : on regarde dessous', () => {
    /* Presque tous les conteneurs sont transparents. Les compter
       pour du noir aurait posé des icônes claires sur toute
       l’application — c’est-à-dire exactement le défaut qu’on
       corrige. */
    sousLaBarre('rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)');
    expect(couleurDuHaut()).toBe('rgb(255, 255, 255)');
  });

  test('sans rien de peint, on ne décide pas', () => {
    sousLaBarre('rgba(0, 0, 0, 0)');
    expect(couleurDuHaut()).toBeNull();
    /* Et l'appelant garde ce qu'il avait, plutôt que de faire
       clignoter la barre à chaque navigation. */
    expect(hautEstClair()).toBeNull();
  });
});

describe('le choix des icônes', () => {
  test('barre de titre BLANCHE → icônes sombres', () => {
    /* LE DÉFAUT CORRIGÉ. Sur Android 15 la barre laisse voir la
       page ; des icônes claires sur du blanc, c'est l'heure et la
       batterie qui disparaissent. */
    sousLaBarre('rgb(255, 255, 255)');
    expect(hautEstClair()).toBe(true);
  });

  test('bandeau VERT du club → icônes claires', () => {
    /* Le vert du club : #0F5132, luminance très basse. */
    sousLaBarre('rgb(15, 81, 50)');
    expect(hautEstClair()).toBe(false);
  });

  test('l’en-tête sombre de l’administration → icônes claires', () => {
    sousLaBarre('rgb(14, 33, 25)');
    expect(hautEstClair()).toBe(false);
  });

  test('la visionneuse de photos → icônes claires', () => {
    sousLaBarre('rgb(11, 23, 18)');
    expect(hautEstClair()).toBe(false);
  });

  test('la luminance est PERÇUE, pas une moyenne', () => {
    /* Le vert pèse presque quatre fois le bleu dans ce que l'œil
       appelle « clair ». Une moyenne des trois canaux rendrait le
       vert vif sombre et le bleu vif clair, soit l'inverse. */
    /* Vert vif : moyenne 85, mais perçu comme CLAIR. */
    sousLaBarre('rgb(0, 255, 0)');
    expect(hautEstClair()).toBe(true);
    oublierLaBarre();
    /* Bleu vif : même moyenne, perçu comme SOMBRE. */
    sousLaBarre('rgb(0, 0, 255)');
    expect(hautEstClair()).toBe(false);
  });
});

/* ============================================================
   RÉESSAYER, SANS RIEN À PRESSER.

   Le message disait « vérifiez la connexion, puis réessayez » — et
   il n'y avait rien pour réessayer. Sur le web on rafraîchit d'un
   F5 ; dans l'APK il n'y a ni barre d'adresse, ni bouton de
   rafraîchissement, rien. Le seul recours était de tuer
   l'application et de la rouvrir.

   Sur la ligne d'Antananarivo, une requête qui tombe n'est pas une
   panne : c'est mardi.
   ============================================================ */
describe('quand le réseau tombe', () => {
  beforeEach(() => {
    reinitialiser();
    brancherServeur();
  });

  test('l’écran propose de RÉESSAYER, et le bouton redemande vraiment', async () => {
    /* « statut » fait rendre au serveur simulé une vraie réponse en
       échec : sans cela on vérifierait l'affichage d'une erreur qui
       n'a jamais eu lieu. */
    poser({ 'profils:GET': { statut: 503 }, grades: [] });
    rendre(<Etudiants />, { route: '/etudiants' });

    expect(await screen.findByText(/Vérifiez la connexion/)).toBeInTheDocument();

    const avant = recues.filter((r) => r.table === 'profils').length;
    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

    await waitFor(() =>
      expect(recues.filter((r) => r.table === 'profils').length).toBeGreaterThan(avant)
    );
  });
});

/* ============================================================
   PLUS AUCUNE BOÎTE DE DIALOGUE DU SYSTÈME.

   « window.prompt » ouvre une boîte GRISE, hors du design du club,
   et Capacitor la redessine à sa façon dans l'APK : la même action
   n'avait donc pas la même allure des deux côtés. Elle cachait
   aussi ce sur quoi on travaillait — on tapait le motif d'un
   signalement sans voir le message signalé.

   Deux endroits l'employaient, et ce sont les deux qui comptent
   le plus : le chemin de l'argent, et celui de la modération.
   ============================================================ */
describe('signaler un message', () => {
  const MESSAGES = [
    {
      id: 'm1',
      texte: 'Ce message pose problème.',
      cree_le: new Date().toISOString(),
      modifie_le: null,
      supprime_le: null,
      piece: null,
      auteur_id: 'p9',
      profils: { nom: 'ANDRIANJAFY', prenom: 'Tokiniaina', grades: null }
    }
  ];

  beforeEach(() => {
    reinitialiser();
    brancherServeur();
  });

  test('le motif s’écrit DANS l’application, et le message reste visible', async () => {
    /* Une boîte du système cachait le message : on tapait le motif à
       l'aveugle. Le club compte des mineurs, et la modération est
       l'endroit où l'on veut le moins d'hésitation. */
    poser({
      salons: { id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132', archive: false },
      messages: MESSAGES,
      membres_salon: []
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id' });

    const bulle = await screen.findByText('Ce message pose problème.');
    /* L'appui long ouvre le signalement. Sur un téléphone, l'appui
       long ARRIVE au navigateur sous la forme d'un « contextmenu » —
       c'est cet évènement-là que la bulle écoute, et non une suite
       d'appuis et de relâchements. Le simuler avec un pointeur qu'on
       maintient ne déclenche donc rien du tout. */
    fireEvent.contextMenu(bulle);

    /* La feuille montre le message ET demande le motif. */
    expect(await screen.findByLabelText('Que se passe-t-il ?')).toBeInTheDocument();
    /* Deux fois : dans la conversation, qui n'est pas masquée, et
       cité dans la feuille. C'est précisément ce que la boîte du
       système ne savait pas faire. */
    expect(screen.getAllByText(/Ce message pose problème/)).toHaveLength(2);
  });
});
