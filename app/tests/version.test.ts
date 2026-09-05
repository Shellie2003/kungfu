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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

/* ============================================================
   ⚠ LE NUMÉRO QUI DÉCIDE DOIT ÊTRE CELUI QU'ON LIT.

   « Après des réglages comme le temps réel ou la galerie, on doit
   passer à une autre version — or ce n'est pas le cas. »

   Trois numéros coexistaient, et ils ne disaient pas la même chose :

     · app/package.json — celui que les TÉLÉPHONES comparent pour
       savoir s'il existe une mise à jour ;
     · le nom de version de l'APK d'essai — le numéro d'EXÉCUTION,
       « 77.0 », sans rapport avec le précédent ;
     · l'écran du club — l'empreinte du commit, « 583262e ».

   À la question « quelle version as-tu ? », le membre, Android et
   l'application donnaient trois réponses différentes. Aucune n'était
   fausse ; ensemble, elles rendaient la mise à jour impossible à
   diagnostiquer.
   ============================================================ */
describe('un seul numéro fait foi', () => {
  test('NUMERO vient de package.json et a la forme d’un numéro', async () => {
    const { NUMERO } = await import('../src/services/miseAJourApk');
    /* La forme compte : c'est elle que « versionPubliee » exige du
       fichier publié, et une comparaison entre deux formes
       différentes ne proposerait jamais rien. */
    expect(NUMERO).toMatch(/^\d+(\.\d+){0,3}$/);
    expect(NUMERO).not.toBe('0.0.0');
  });

  test('l’écran du club montre ce numéro-là, pas seulement le commit', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/ecrans/Club.tsx'),
      'utf8'
    );
    /* Sans lui, un membre à qui l'on demande sa version répond par
       une empreinte de commit — illisible, et sans rapport avec ce
       que compare la mise à jour. */
    expect(source).toContain('Version {NUMERO}');
  });

  test('⚠ l’APK d’essai s’annonce à Android avec ce numéro', () => {
    const workflow = readFileSync(
      resolve(process.cwd(), '..', '.github', 'workflows', 'apk.yml'),
      'utf8'
    );
    /* Il s'annonçait « 77.0 » — le numéro d'exécution. Android
       affichait donc un numéro que l'application ne connaissait pas,
       et l'on ne pouvait pas savoir, depuis un téléphone, si la
       version installée était celle qu'on croyait. */
    expect(workflow).toMatch(/versionName .*steps\.numero\.outputs\.numero/);
  });

  test('la publication refuse un numéro déjà sorti', () => {
    const workflow = readFileSync(
      resolve(process.cwd(), '..', '.github', 'workflows', 'publier.yml'),
      'utf8'
    );
    /* La barrière DURE est ici, et pas ailleurs : republier un numéro
       déjà distribué ne proposerait rien à personne, et l'on croirait
       avoir livré. */
    expect(workflow).toContain('est déjà publiée');
    expect(workflow).toMatch(/git ls-remote .*refs\/tags\/v\$NUMERO/);
  });
});
