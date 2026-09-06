/* ============================================================
   La mise à jour de l'application depuis l'application.

   « Je veux que l'utilisateur puisse mettre à jour l'app depuis
   l'intérieur ; je n'ai pas encore le Play Store, alors on utilise
   la méthode du dépôt GitHub. »

   ------------------------------------------------------------
   CE QUI EST TENU ICI

   La comparaison des numéros, la lecture du fichier publié, et la
   parcimonie du réseau. Ce sont les trois endroits où une erreur ne
   se voit PAS : une mise à jour qu'on ne propose jamais ressemble à
   « il n'y a rien de neuf », et personne ne s'en plaint.

   Ce qui ne se vérifie que sur un vrai téléphone est dit dans
   LIVRER.md : le passage du lien vers le navigateur d'Android, et
   l'installation elle-même.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  OU_EST_LA_VERSION,
  OU_EST_L_APK,
  plusRecent,
  poidsLisible,
  tropTot,
  versionPubliee
} from '../src/services/miseAJourApk';

describe('comparer deux numéros', () => {
  test('reconnaît une version plus récente', () => {
    expect(plusRecent('1.1.0', '1.0.0')).toBe(true);
    expect(plusRecent('2.0.0', '1.9.9')).toBe(true);
    expect(plusRecent('1.0.1', '1.0.0')).toBe(true);
  });

  test('ne propose rien pour la même version, ni pour une plus ancienne', () => {
    expect(plusRecent('1.0.0', '1.0.0')).toBe(false);
    expect(plusRecent('1.0.0', '1.1.0')).toBe(false);
    /* Le cas qui compte : revenir en arrière ne doit pas se proposer
       comme une mise à jour. */
    expect(plusRecent('0.9.0', '1.0.0')).toBe(false);
  });

  test('⚠ 1.10.0 est plus récent que 1.9.0', () => {
    /* LE PIÈGE, et il ne se voit qu'à la dixième version : comparé
       comme du TEXTE, « 1.10.0 » vient AVANT « 1.9.0 » parce que
       « 1 » vient avant « 9 ». Tout marche pendant des mois, puis
       les mises à jour cessent d'être proposées sans que rien n'ait
       changé — et personne ne se plaint, puisque l'application dit
       simplement qu'il n'y a rien de neuf. */
    expect(plusRecent('1.10.0', '1.9.0')).toBe(true);
    expect(plusRecent('1.9.0', '1.10.0')).toBe(false);
    expect('1.10.0' > '1.9.0').toBe(false); // la comparaison naïve, pour mémoire
  });

  test('des numéros de longueurs différentes se comparent quand même', () => {
    expect(plusRecent('1.1', '1.0.9')).toBe(true);
    expect(plusRecent('1.0', '1.0.0')).toBe(false);
  });
});

describe('lire la version publiée', () => {
  afterEach(() => vi.unstubAllGlobals());

  const repondre = (corps: unknown, ok = true) =>
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok, json: async () => corps })));

  test('va chercher un FICHIER, pas l’API de GitHub', async () => {
    /* L'API est limitée à soixante requêtes par heure et par adresse
       IP. Soixante-quatre membres derrière les quelques opérateurs
       malgaches partagent beaucoup d'adresses : la limite serait
       atteinte, et l'application annoncerait « rien de neuf » alors
       qu'il y a une mise à jour. */
    expect(OU_EST_LA_VERSION).not.toContain('api.github.com');
    expect(OU_EST_LA_VERSION).toContain('/releases/latest/download/');
    expect(OU_EST_L_APK).toContain('/releases/latest/download/');
    /* Des noms FIXES : c'est ce qui rend l'adresse permanente. */
    expect(OU_EST_L_APK.endsWith('waishi.apk')).toBe(true);
  });

  test('rend le numéro et la note', async () => {
    repondre({ numero: '1.2.0', notes: 'Le matricule se corrige.' });
    expect(await versionPubliee()).toEqual({
      numero: '1.2.0',
      notes: 'Le matricule se corrige.'
    });
  });

  test('refuse ce qui n’a pas la forme d’un numéro', async () => {
    /* Un 404 déguisé en page HTML, un fichier tronqué, un champ
       manquant. Sans ce contrôle, l'application proposerait
       d'installer « undefined ». */
    repondre({ numero: 'la dernière' });
    expect(await versionPubliee()).toBeNull();
    repondre({ notes: 'sans numéro' });
    expect(await versionPubliee()).toBeNull();
    repondre('<!doctype html>');
    expect(await versionPubliee()).toBeNull();
  });

  test('une note trop longue est coupée, pas refusée', async () => {
    /* Le numéro compte, la note est un agrément. La refuser pour sa
       longueur priverait d'une mise à jour réelle. */
    repondre({ numero: '1.2.0', notes: 'x'.repeat(5000) });
    const v = await versionPubliee();
    expect(v?.numero).toBe('1.2.0');
    expect(v?.notes?.length).toBe(300);
  });

  test('hors ligne, elle ne dit RIEN plutôt que d’inventer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('réseau'); }));
    expect(await versionPubliee()).toBeNull();
    repondre({ numero: '9.9.9' }, false);
    expect(await versionPubliee()).toBeNull();
  });
});

/* ============================================================
   ⚠ DANS L'APK, LA DEMANDE NE PASSE PAS PAR « fetch ».

   Ce défaut n'est apparu que sur la machine de construction de
   GitHub, la seule des trois qui joigne github.com pour de vrai :

       Access to fetch at '…/waishi.json' from origin
       'https://localhost' has been blocked by CORS policy.

   Capacitor sert la page depuis « https://localhost », qui est une
   origine ; GitHub ne met pas d'en-tête d'autorisation sur les
   fichiers de Release ; la WebView jette donc la réponse. Aucun
   réglage de notre côté n'y change quoi que ce soit.

   ET CELA NE SE SERAIT PAS VU. « versionPubliee » rattrape l'erreur
   et rend « null » — c'est-à-dire « rien de neuf ». Le club n'aurait
   jamais vu passer une mise à jour, sans que personne ait de raison
   de se plaindre.

   D'où le HTTP natif, qui sort de la WebView. Cet essai tient le
   point exact qui a manqué : sur le téléphone, on ne demande PAS
   avec « fetch ».
   ============================================================ */
describe('dans l’APK, le CORS ne doit pas pouvoir mordre', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock('@capacitor/core');
  });

  async function surTelephone(reponse: { status: number; data: unknown }) {
    const get = vi.fn(async (_options: { url: string }) => reponse);
    vi.doMock('@capacitor/core', () => ({
      Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' },
      CapacitorHttp: { get }
    }));
    vi.resetModules();
    const module = await import('../src/services/miseAJourApk');
    return { module, get };
  }

  test('elle demande par le pont natif, et jamais par fetch', async () => {
    const fetchDefendu = vi.fn(async () => {
      throw new Error('fetch ne doit pas être employé sur le téléphone');
    });
    vi.stubGlobal('fetch', fetchDefendu);

    const { module, get } = await surTelephone({
      status: 200,
      data: { numero: '1.4.0', notes: 'La carte s’imprime droit.' }
    });

    expect(await module.versionPubliee()).toEqual({
      numero: '1.4.0',
      notes: 'La carte s’imprime droit.'
    });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(
      expect.objectContaining({ url: module.OU_EST_LA_VERSION })
    );
    expect(fetchDefendu).not.toHaveBeenCalled();
  });

  test('le greffon peut rendre du TEXTE plutôt que du JSON', async () => {
    /* Selon ce que le serveur annonce comme type, le pont natif rend
       l'objet déjà lu ou la chaîne brute. Les deux doivent marcher :
       n'en accepter qu'un rendrait la mise à jour muette le jour où
       GitHub changerait d'en-tête. */
    const { module } = await surTelephone({
      status: 200,
      data: '{"numero":"2.0.0"}'
    });
    expect(await module.versionPubliee()).toEqual({ numero: '2.0.0', notes: undefined });
  });

  test('un statut d’erreur ne devient pas une mise à jour', async () => {
    const { module } = await surTelephone({ status: 404, data: 'Not Found' });
    expect(await module.versionPubliee()).toBeNull();
  });
});

describe('le forfait des membres', () => {
  beforeEach(() => localStorage.clear());

  test('on ne redemande pas dans la journée', () => {
    /* Une nouvelle version sort au mieux toutes les quelques
       semaines. Demander à chaque ouverture serait un aller-retour
       réseau pour rien, plusieurs fois par jour, sur soixante-quatre
       téléphones — et le forfait n'est pas à nous. */
    const maintenant = Date.now();
    localStorage.setItem('waishi.derniereVerificationApk', String(maintenant));
    expect(tropTot(maintenant + 60 * 60 * 1000)).toBe(true);
    expect(tropTot(maintenant + 25 * 60 * 60 * 1000)).toBe(false);
  });

  test('sans souvenir, on regarde', () => {
    expect(tropTot()).toBe(false);
  });

  test('si le stockage est inaccessible, on regarde quand même', () => {
    /* Navigation privée, stockage bloqué. Mieux vaut une requête de
       trop qu'une mise à jour qu'on ne propose jamais. */
    const vrai = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new Error('bloqué'); }
    });
    try {
      expect(tropTot()).toBe(false);
    } finally {
      if (vrai) Object.defineProperty(window, 'localStorage', vrai);
    }
  });
});

/* ============================================================
   LE POIDS DU TÉLÉCHARGEMENT.

   « 5847268 » ne veut rien dire ; « 5,6 Mo » se décide. À
   Antananarivo l'accès se paie au mégaoctet : un membre qui voit le
   prix choisit son moment — le soir, sur le wifi du club. Un membre
   qui ne le voit pas appuie, découvre sa consommation après, et
   n'appuiera plus.
   ============================================================ */
describe('le poids annoncé', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('se lit en français, avec une virgule', () => {
    expect(poidsLisible(5_847_268)).toBe('5,6 Mo');
    expect(poidsLisible(12 * 1024 * 1024)).toBe('12,0 Mo');
  });

  test('descend en kilooctets sous le mégaoctet', () => {
    /* « 0,3 Mo » se lit mal. L'APK n'y descendra pas, mais la
       fonction n'a pas à le savoir. */
    expect(poidsLisible(300 * 1024)).toBe('300 ko');
  });

  test('⚠ absent, il ne s’invente pas', () => {
    /* Les versions publiées AVANT ce champ n'en portent pas. Le
       bandeau doit alors ne rien dire — un chiffre par défaut serait
       faux pour toutes. */
    expect(poidsLisible(undefined)).toBeNull();
    expect(poidsLisible(0)).toBeNull();
    expect(poidsLisible(Number.NaN)).toBeNull();
    expect(poidsLisible(-1)).toBeNull();
  });

  test('un poids invraisemblable est ignoré, pas affiché', async () => {
    /* Deux cents octets serait une page d'erreur ; deux cents
       mégaoctets, un champ falsifié. Dans les deux cas on préfère ne
       rien annoncer. */
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ numero: '1.3.0', octets: 200 })
    })));
    expect((await versionPubliee())?.octets).toBeUndefined();

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ numero: '1.3.0', octets: 900 * 1024 * 1024 })
    })));
    expect((await versionPubliee())?.octets).toBeUndefined();
  });

  test('un poids plausible traverse', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ numero: '1.3.0', octets: 5_847_268 })
    })));
    expect((await versionPubliee())?.octets).toBe(5_847_268);
  });
});


/* ============================================================
   CHERCHER SOI-MÊME UNE MISE À JOUR.

   Deux manques éprouvés le jour même de la première mise à jour.

   ON NE POUVAIT RIEN DEMANDER : l'application regardait une fois par
   jour, et si elle avait déjà regardé il fallait attendre le
   lendemain — ou effacer les données de l'application, ce qui
   déconnecte.

   ET QUAND TOUT ALLAIT BIEN, ELLE NE DISAIT RIEN. « À jour » et
   « en panne » se ressemblaient trait pour trait : aucun bandeau
   dans les deux cas. C'est la forme exacte du défaut que ce projet a
   rencontré quatre fois.
   ============================================================ */
describe('chercher une mise à jour sur demande', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock('@capacitor/core');
  });

  async function surTelephone(reponse: { status: number; data: unknown }) {
    const get = vi.fn(async () => reponse);
    vi.doMock('@capacitor/core', () => ({
      Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' },
      CapacitorHttp: { get }
    }));
    vi.resetModules();
    const { renderHook, act, waitFor } = await import('@testing-library/react');
    const m = await import('../src/services/miseAJourApk');
    const { result } = renderHook(() => m.useChercherMiseAJour());
    return { result, get, act, waitFor };
  }

  test('⚠ elle demande MÊME SI l’on a déjà regardé aujourd’hui', async () => {
    /* LE POINT. Sans cela, quelqu'un à qui l'on dit « il y a une
       nouvelle version » ne peut rien faire avant le lendemain. */
    localStorage.setItem('waishi.derniereVerificationApk', String(Date.now()));

    const { result, get, act, waitFor } = await surTelephone({
      status: 200,
      data: { numero: '9.9.9' }
    });

    await act(async () => result.current.chercher());
    await waitFor(() => expect(result.current.recherche.etat).toBe('trouvee'));
    expect(
      get,
      'La demande n’est pas partie : le délai d’un jour n’est pas sauté.'
    ).toHaveBeenCalledTimes(1);
  });

  test('⚠ elle DIT que tout va bien quand tout va bien', async () => {
    /* Le silence ne se distingue pas d'une panne. Une fonctionnalité
       sans moyen d'annoncer « je marche » ne peut jamais être
       vérifiée. */
    /* Le numéro INSTALLÉ, lu du service : écrire « 1.3.0 » en dur
       rendrait cet essai faux à la version suivante. */
    const { NUMERO } = await import('../src/services/miseAJourApk');
    const { result, act, waitFor } = await surTelephone({
      status: 200,
      data: { numero: NUMERO }
    });

    await act(async () => result.current.chercher());
    await waitFor(() => expect(result.current.recherche.etat).toBe('a jour'));
  });

  test('⚠ hors ligne, elle ne dit PAS « vous êtes à jour »', async () => {
    /* Les deux silences se ressemblent, et les confondre serait un
       mensonge tranquille — le pire des deux. */
    const { result, act, waitFor } = await surTelephone({
      status: 500,
      data: 'panne'
    });

    await act(async () => result.current.chercher());
    await waitFor(() => expect(result.current.recherche.etat).toBe('injoignable'));
  });

  test('elle annonce la version trouvée, avec son numéro', async () => {
    const { result, act, waitFor } = await surTelephone({
      status: 200,
      data: { numero: '9.9.9', notes: 'La galerie glisse.' }
    });

    await act(async () => result.current.chercher());
    await waitFor(() => expect(result.current.recherche.etat).toBe('trouvee'));
    const r = result.current.recherche;
    expect(r.etat === 'trouvee' && r.version.numero).toBe('9.9.9');
  });
});
