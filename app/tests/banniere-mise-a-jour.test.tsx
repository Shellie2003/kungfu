/* ============================================================
   LA BANNIÈRE DE MISE À JOUR S'AFFICHE-T-ELLE VRAIMENT ?

   « Vérifiez que la fonctionnalité de mise à jour est bien présente
   et correctement implémentée dans l'application déjà livrée, car je
   ne peux plus voir l'application : je n'ai pas de compte membre. »

   ------------------------------------------------------------
   CE QUI ÉTAIT COUVERT, ET CE QUI NE L'ÉTAIT PAS

   Le SERVICE était bien tenu : la comparaison des numéros, le piège
   du « 1.10.0 » contre « 1.9.0 », le passage par le pont natif plutôt
   que par « fetch », la parcimonie d'une demande par jour.

   La BANNIÈRE, elle, n'était vérifiée nulle part. Or c'est la seule
   chose que le club voit. Un service parfait dont l'affichage ne se
   monte pas, ou se monte derrière l'écran de connexion, ne sert à
   personne — et c'est exactement le genre de défaut que ce projet a
   déjà rencontré trois fois : tout marche, rien ne s'affiche, aucune
   erreur.

   ------------------------------------------------------------
   ⚠ LE POINT QUI RÉPOND À LA QUESTION POSÉE

   La bannière est-elle visible SANS COMPTE ? Dans App.tsx elle est
   posée en FRÈRE de « Racine », et non à l'intérieur :

       <HashRouter>
         <Nouveaute />
         <MiseAJourApk />     ← ici
         <Racine />           ← et l'authentification est là-dedans
       </HashRouter>

   Elle ne dépend donc d'aucune session. Mais cela se LIT dans le
   code, et se lire n'est pas se prouver : il suffirait qu'un jour
   quelqu'un la déplace à l'intérieur de « Racine » — un geste qui
   paraîtrait anodin — pour que le club cesse de recevoir les mises à
   jour sans que rien n'échoue.

   Ces essais rendent donc l'application ENTIÈRE, sans session, et
   regardent l'écran.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { brancherServeur, reinitialiser } from './serveur';

/* Ce que le serveur de GitHub rendrait pour une version PLUS RÉCENTE
   que celle installée. « 9.9.9 » plutôt qu'un numéro plausible : on
   veut que l'essai reste juste quand le vrai numéro montera. */
const PLUS_RECENTE = {
  status: 200,
  data: { numero: '9.9.9', notes: 'Les messages arrivent en direct.' }
};

async function rendreApplication(reponse: { status: number; data: unknown }) {
  const get = vi.fn(async (_o: { url: string }) => reponse);

  /* Le téléphone, et le pont natif. « isNativePlatform » à vrai est
     ce qui décide : sur le web, la bannière ne doit RIEN proposer —
     la version web se met à jour en rechargeant la page. */
  vi.doMock('@capacitor/core', () => ({
    Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' },
    CapacitorHttp: { get }
  }));

  vi.resetModules();
  const { default: App } = await import('../src/App');
  render(<App />);
  return { get };
}

beforeEach(() => {
  reinitialiser();
  brancherServeur();
  localStorage.clear();
});

afterEach(() => {
  vi.doUnmock('@capacitor/core');
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe('la bannière de mise à jour, dans l’application livrée', () => {
  test('⚠ elle s’affiche SANS COMPTE, sur l’écran d’entrée', async () => {
    /* LA question posée. Aucune session n'est posée : on est sur
       l'écran de connexion, comme quelqu'un qui vient d'installer
       l'application et n'a pas encore de matricule. */
    await rendreApplication(PLUS_RECENTE);

    expect(
      await screen.findByText(/Version 9\.9\.9 disponible/),
      'La bannière ne s’affiche pas sans session. Si elle a été déplacée ' +
        'DANS « Racine », le club ne verra plus jamais une mise à jour ' +
        'tant qu’il n’est pas connecté — et rien n’échouera pour le dire.'
    ).toBeInTheDocument();
  });

  test('elle dit ce que la version apporte, et quelle version on a', async () => {
    await rendreApplication(PLUS_RECENTE);

    await screen.findByText(/Version 9\.9\.9 disponible/);
    /* La note vient du fichier publié : c'est ce que le club écrit
       dans le formulaire de publication. */
    expect(screen.getByText(/Les messages arrivent en direct/)).toBeInTheDocument();
    /* Et le numéro INSTALLÉ, sans quoi on ne sait pas ce qu'on a. */
    expect(screen.getByText(/Vous avez la/)).toBeInTheDocument();
  });

  test('le lien mène au fichier, à l’adresse permanente', async () => {
    await rendreApplication(PLUS_RECENTE);

    const lien = await screen.findByRole('link', { name: /Mettre à jour/ });
    /* « latest » et un nom FIXE : c'est ce qui rend l'adresse
       permanente. La renommer couperait en silence les téléphones
       déjà installés. */
    expect(lien).toHaveAttribute(
      'href',
      expect.stringContaining('/releases/latest/download/')
    );
    expect(lien.getAttribute('href')).toMatch(/waishi\.apk$/);
  });

  test('rien ne s’affiche quand la version publiée est la nôtre', async () => {
    /* Le silence est ici le BON comportement, et c'est ce qui rend
       la fonctionnalité impossible à distinguer d'une panne tant
       qu'aucune version n'est sortie. */
    const { NUMERO } = await import('../src/services/miseAJourApk');
    await rendreApplication({ status: 200, data: { numero: NUMERO } });

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/disponible/)).not.toBeInTheDocument();
  });

  test('⚠ on ne demande RIEN sur le web', async () => {
    /* La version web se met à jour en rechargeant la page. Lui
       proposer un APK n'aurait aucun sens, et la demande serait un
       aller-retour réseau pour rien. */
    const get = vi.fn(async () => PLUS_RECENTE);
    vi.doMock('@capacitor/core', () => ({
      Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' },
      CapacitorHttp: { get }
    }));
    vi.resetModules();
    const { default: App } = await import('../src/App');
    render(<App />);

    await new Promise((r) => setTimeout(r, 50));
    expect(get).not.toHaveBeenCalled();
    expect(screen.queryByText(/disponible/)).not.toBeInTheDocument();
  });

  test('une seule demande par jour, même si l’on rouvre', async () => {
    /* Le forfait des membres n'est pas à nous. Une version sort au
       mieux toutes les quelques semaines. */
    const { get } = await rendreApplication(PLUS_RECENTE);
    await screen.findByText(/Version 9\.9\.9 disponible/);
    expect(get).toHaveBeenCalledTimes(1);

    /* On rouvre l'application : le souvenir du jour est dans le
       stockage local, la demande ne repart pas. */
    const { get: get2 } = await rendreApplication(PLUS_RECENTE);
    await new Promise((r) => setTimeout(r, 50));
    expect(get2).not.toHaveBeenCalled();
  });
});
