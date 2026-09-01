/* ============================================================
   « Voir chaque mise à jour en rafraîchissant. »

   Ce que ce repère doit faire est évident ; ce qu'il ne doit PAS
   faire l'est moins, et c'est là qu'un défaut ferait des dégâts :

     — annoncer une mise à jour qui n'existe pas ferait rafraîchir
       pour rien, à chaque ouverture, sur un forfait malgache ;
     — l'annoncer parce que le réseau est tombé serait un mensonge
       de plus, du genre que ce projet a déjà payé cher ;
     — un 404 qui rend une page HTML au lieu du fichier ne doit
       surtout pas passer pour un numéro de version. Ce cas n'est
       pas théorique : la base des chemins a été fausse deux fois
       cette semaine, et /essai/version.txt aurait alors rendu la
       page d'accueil.

   Les tests montent donc VRAIMENT le hook et regardent ce qu'il
   rend, plutôt que de se contenter d'importer le module.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const COURANTE = 'a277203b309d6fe918af9d71ee01bb6136953a0d';
const PUBLIEE = 'e0d9429ba1b525652ce7d7cbedcf339c1e32920f';

const texte = (corps: string, statut = 200) =>
  new Response(corps, { status: statut, headers: { 'content-type': 'text/plain' } });

/* La version « construite » est injectée par Vite ; dans les tests
   elle est vide, ce qui vaut « developpement » et désactive tout le
   mécanisme. On la pose donc avant de charger le module. */
async function monter(reponse: () => Response | Promise<Response>) {
  vi.stubGlobal('__VERSION__', COURANTE);
  const appels = vi.fn(async () => reponse());
  vi.stubGlobal('fetch', appels);
  vi.resetModules();
  const { useMiseAJour } = await import('../src/services/version');
  const vue = renderHook(() => useMiseAJour());
  return { vue, appels };
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe('le numéro de version', () => {
  test('se raccourcit pour être lisible, sans être tronqué n’importe comment', async () => {
    vi.stubGlobal('__VERSION__', COURANTE);
    vi.resetModules();
    const { versionCourte, VERSION } = await import('../src/services/version');

    /* Sept caractères : la convention de git, celle que le club
       retrouvera sur la page des exécutions. */
    expect(versionCourte(COURANTE)).toBe('a277203');
    /* Ce qui n'est pas une empreinte reste entier : « developpement »
       tronqué à sept lettres ne voudrait plus rien dire. */
    expect(versionCourte('developpement')).toBe('developpement');
    expect(VERSION).toBe(COURANTE);
  });
});

describe('quand une version plus récente est publiée', () => {
  test('elle est annoncée, et nommée', async () => {
    const { vue } = await monter(() => texte(PUBLIEE));
    await waitFor(() => expect(vue.result.current).toBe(PUBLIEE));
  });

  test('le fichier est demandé SANS cache, à côté de la page', async () => {
    /* Sans « no-store », le navigateur peut répondre depuis son
       cache : on demanderait sa propre ancienneté à un fichier
       périmé, et le bandeau ne partirait jamais. */
    const { vue, appels } = await monter(() => texte(PUBLIEE));
    await waitFor(() => expect(appels).toHaveBeenCalled());

    const [adresse, options] = appels.mock.calls[0] as unknown as [string, RequestInit];
    expect(adresse).toMatch(/version\.txt$/);
    expect(options?.cache).toBe('no-store');
    expect(vue.result.current).toBe(PUBLIEE);
  });
});

describe('ce qui ne doit JAMAIS passer pour une mise à jour', () => {
  test('la même version que celle qu’on exécute', async () => {
    const { vue, appels } = await monter(() => texte(COURANTE));
    await waitFor(() => expect(appels).toHaveBeenCalled());
    expect(vue.result.current).toBeNull();
  });

  test('une page HTML rendue à la place du fichier', async () => {
    /* Le 404 déguisé. Sans ce contrôle, l'application annoncerait
       une mise à jour à CHAQUE ouverture, indéfiniment. */
    const { vue, appels } = await monter(() => texte('<!doctype html><html><body>…'));
    await waitFor(() => expect(appels).toHaveBeenCalled());
    expect(vue.result.current).toBeNull();
  });

  test('un fichier vide', async () => {
    const { vue, appels } = await monter(() => texte('   '));
    await waitFor(() => expect(appels).toHaveBeenCalled());
    expect(vue.result.current).toBeNull();
  });

  test('une réponse en erreur', async () => {
    const { vue, appels } = await monter(() => texte(PUBLIEE, 500));
    await waitFor(() => expect(appels).toHaveBeenCalled());
    expect(vue.result.current).toBeNull();
  });

  test('le réseau tombé — et l’APK, où le fichier n’existe pas', async () => {
    const { vue, appels } = await monter(() => {
      throw new Error('hors ligne');
    });
    await waitFor(() => expect(appels).toHaveBeenCalled());
    expect(vue.result.current).toBeNull();
  });
});

describe('dans l’APK', () => {
  test('rien n’est demandé : le fichier ne peut pas exister', async () => {
    /* Le silence en cas d'échec ne suffisait pas — la requête
       partait quand même et échouait en 404. Le banc d'essai l'a vue
       (« accueil : Failed to load resource: 404 ») avant le club.
       Sur un téléphone c'est un aller-retour réseau à chaque
       démarrage, sur un forfait malgache, pour une information qui
       ne peut pas exister : l'APK ne se rafraîchit pas, il se
       réinstalle. */
    vi.stubGlobal('__VERSION__', COURANTE);
    vi.doMock('@capacitor/core', () => ({
      Capacitor: { isNativePlatform: () => true }
    }));
    const appels = vi.fn(async () => texte(PUBLIEE));
    vi.stubGlobal('fetch', appels);
    vi.resetModules();
    const { useMiseAJour } = await import('../src/services/version');

    const vue = renderHook(() => useMiseAJour());
    expect(vue.result.current).toBeNull();
    expect(appels).not.toHaveBeenCalled();
    vi.doUnmock('@capacitor/core');
  });
});

describe('en développement', () => {
  test('rien n’est demandé du tout', async () => {
    /* Sur un poste, il n'y a pas de commit à nommer et pas de
       version.txt à côté : sonder serait un 404 à chaque
       rechargement, dans la console de celui qui développe. */
    vi.stubGlobal('__VERSION__', '');
    const appels = vi.fn(async () => texte(PUBLIEE));
    vi.stubGlobal('fetch', appels);
    vi.resetModules();
    const { useMiseAJour, VERSION } = await import('../src/services/version');

    expect(VERSION).toBe('developpement');
    const vue = renderHook(() => useMiseAJour());
    expect(vue.result.current).toBeNull();
    expect(appels).not.toHaveBeenCalled();
  });
});
