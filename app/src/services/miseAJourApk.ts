/* ============================================================
   La mise à jour de l'application, sans Play Store.

   « Je veux que l'utilisateur puisse mettre à jour l'app depuis
   l'intérieur ; je n'ai pas encore le Play Store, alors on utilise
   la méthode du dépôt GitHub. »

   ------------------------------------------------------------
   COMMENT ELLE SAIT QU'IL Y A DU NOUVEAU

   Elle demande un petit fichier publié À CÔTÉ de l'APK, dans la
   même « Release » GitHub :

       …/releases/latest/download/waishi.json

   Deux cents octets. GitHub sert toujours le dernier fichier d'un
   nom donné à cette adresse — c'est ce qui permet à l'application de
   ne connaître QU'UNE adresse, fixe, pour toujours.

   ------------------------------------------------------------
   POURQUOI PAS L'API DE GITHUB

   « api.github.com/repos/…/releases/latest » donnerait la même chose
   en plus riche. Elle est limitée à SOIXANTE requêtes par heure et
   par adresse IP pour qui n'est pas authentifié. Soixante-quatre
   membres derrière les quelques opérateurs malgaches partagent
   beaucoup d'adresses : la limite serait atteinte, et l'application
   annoncerait « pas de mise à jour » alors qu'il y en a une.

   Un fichier statique n'a aucune limite. Et il n'oblige pas à
   embarquer un jeton dans l'APK — ce qui reviendrait à le publier.

   ------------------------------------------------------------
   POURQUOI L'APPLICATION N'INSTALLE PAS ELLE-MÊME

   Elle le pourrait : c'est la permission « REQUEST_INSTALL_PACKAGES ».
   On ne la demande pas, pour trois raisons.

   D'abord elle fait peur, et elle a raison de faire peur : une
   application qui peut en installer d'autres est exactement ce que
   réclame un logiciel malveillant, et Android l'annonce en toutes
   lettres à l'installation.

   Ensuite elle ne fait pas gagner grand-chose : Android demandera de
   toute façon confirmation avant d'installer.

   Enfin elle n'est pas nécessaire. Le lien vers l'APK sort de la
   WebView vers le navigateur du téléphone — on l'a lu dans
   « Bridge.launchIntent » de Capacitor : toute adresse dont l'hôte
   diffère de celui de l'application part vers « ACTION_VIEW ».
   Android télécharge, puis propose d'installer.
   ============================================================ */
import { useEffect, useState } from 'react';
import { SUR_TELEPHONE } from './telechargement';

/* Le numéro de CETTE application, injecté à la construction depuis
   package.json. */
export const NUMERO: string =
  typeof __NUMERO__ === 'string' && __NUMERO__ ? __NUMERO__ : '0.0.0';

/* ⚠ L'ADRESSE DU DÉPÔT.

   Elle est écrite ici, et non lue d'un réglage : un réglage se
   modifie depuis l'administration, et une adresse de mise à jour
   modifiable serait le moyen le plus simple de faire installer
   n'importe quoi à soixante-quatre personnes. Elle change avec une
   version de l'application, comme il se doit. */
const DEPOT = 'https://github.com/Shellie2003/kungfu';
export const OU_EST_LA_VERSION = `${DEPOT}/releases/latest/download/waishi.json`;
export const OU_EST_L_APK = `${DEPOT}/releases/latest/download/waishi.apk`;

export type VersionPubliee = {
  numero: string;
  /* Ce que la version apporte, en une phrase. Facultatif : mieux
     vaut pas de note qu'une note inventée. */
  notes?: string;
  /* Le poids du fichier, en octets. Facultatif lui aussi, et pour la
     même raison : les versions déjà publiées ne le portent pas, et
     une taille inventée serait pire qu'une taille absente. */
  octets?: number;
};

/* ------------------------------------------------------------
   LE POIDS, EN CLAIR.

   « 5847268 » ne veut rien dire à personne. « 5,6 Mo » se décide.

   ⚠ ET CE CHIFFRE SE DÉCIDE VRAIMENT. À Antananarivo l'accès se
   paie au mégaoctet, et 5,6 Mo valent plusieurs centaines d'ariary
   sur un forfait de recharge. Un membre qui voit le prix choisit son
   moment — le soir, sur le wifi du club. Un membre qui ne le voit
   pas appuie, découvre sa consommation après, et n'appuiera plus.

   La virgule et l'espace insécable sont ceux du français : c'est la
   langue de tout le reste de l'application.
   ------------------------------------------------------------ */
export function poidsLisible(octets: number | undefined): string | null {
  if (typeof octets !== 'number' || !Number.isFinite(octets) || octets <= 0) {
    return null;
  }
  const mo = octets / (1024 * 1024);
  /* Sous le mégaoctet on descend en kilooctets plutôt que d'afficher
     « 0,3 Mo », qui se lit mal. L'APK n'y descendra pas, mais cette
     fonction n'a pas à le savoir. */
  if (mo < 1) return `${Math.round(octets / 1024)} ko`;
  return `${mo.toFixed(1).replace('.', ',')} Mo`;
}

/* ------------------------------------------------------------
   COMPARER DEUX NUMÉROS.

   « 1.10.0 » est plus récent que « 1.9.0 », et une comparaison de
   TEXTE dit le contraire — « 1 » vient avant « 9 ». C'est le piège
   classique, et il ne se voit qu'à la dixième version : tout marche
   pendant des mois, puis les mises à jour cessent d'être proposées
   sans que rien n'ait changé.

   On compare donc nombre par nombre.
   ------------------------------------------------------------ */
export function plusRecent(publie: string, courant: string): boolean {
  const chiffres = (v: string) =>
    v.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const a = chiffres(publie);
  const b = chiffres(courant);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

/* ------------------------------------------------------------
   NE PAS DEMANDER PLUS D'UNE FOIS PAR JOUR.

   Le forfait des membres n'est pas à nous. Une nouvelle version
   sort au mieux toutes les quelques semaines ; demander à chaque
   ouverture de l'application serait un aller-retour réseau pour
   rien, plusieurs fois par jour, sur soixante-quatre téléphones.

   La date du dernier regard vit dans le stockage local. S'il est
   inaccessible — navigation privée, stockage bloqué — on regarde
   quand même : mieux vaut une requête de trop qu'une mise à jour
   qu'on ne propose jamais.
   ------------------------------------------------------------ */
const CLE_DERNIER_REGARD = 'waishi.derniereVerificationApk';
const UN_JOUR = 24 * 60 * 60 * 1000;

export function tropTot(maintenant = Date.now()): boolean {
  try {
    const avant = Number.parseInt(localStorage.getItem(CLE_DERNIER_REGARD) ?? '', 10);
    if (!Number.isFinite(avant)) return false;
    return maintenant - avant < UN_JOUR;
  } catch {
    return false;
  }
}

function noterLeRegard(maintenant = Date.now()): void {
  try {
    localStorage.setItem(CLE_DERNIER_REGARD, String(maintenant));
  } catch {
    /* Stockage indisponible : on redemandera à la prochaine
       ouverture. Ce n'est pas grave, c'est seulement moins économe. */
  }
}

/* ------------------------------------------------------------
   ⚠ POURQUOI IL N'Y A PAS DE « PLUS TARD ».

   Il y en a eu un, sept jours durant, et le club l'a fait retirer :
   « je veux afficher la bande tant que l'utilisateur ne fait pas la
   mise à jour ».

   La raison lui donne raison. Ce bandeau est le SEUL canal de
   distribution du club : pas de Play Store, pas de mise à jour
   automatique. Un bouton qui l'écarte est un bouton qui laisse
   quelqu'un sur une application vieillissante — et personne ne s'en
   aperçoit, ni lui, ni le club.

   Le bandeau reste donc jusqu'à ce que la mise à jour soit faite.
   Il disparaît tout seul le jour où le numéro installé rattrape le
   numéro publié : c'est la seule façon de le faire taire, et c'est
   voulu.

   Ce que cela coûte est réel et assumé : quelqu'un sans réseau le
   traîne en haut de tous les écrans. Le bouton « Rechercher une
   mise à jour » de l'écran du club est là pour l'autre moitié du
   problème — savoir où l'on en est sans attendre.
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   ⚠ POURQUOI CE N'EST PAS « fetch » DANS L'APK.

   Ce défaut-ci ne s'est vu NULLE PART sauf sur la machine de
   construction de GitHub, et il aurait rendu toute cette
   fonctionnalité inutile en silence :

       Access to fetch at '…/releases/latest/download/waishi.json'
       from origin 'https://localhost' has been blocked by CORS
       policy: No 'Access-Control-Allow-Origin' header is present.

   L'APK n'est pas un dossier de fichiers ouvert : Capacitor sert la
   page depuis « https://localhost », qui est une ORIGINE. Une requête
   vers github.com part donc d'une origine vers une autre, et le
   navigateur exige que le serveur distant l'autorise par un en-tête.
   GitHub ne le met pas sur les fichiers de Release — la réponse
   arrive bel et bien, et c'est la WebView qui la jette.

   Ce n'est pas rattrapable côté application : aucun réglage, aucun
   en-tête de notre côté ne change l'avis du navigateur.

   D'où le passage par le HTTP NATIF de Capacitor : la requête est
   faite en Java, hors de la WebView, où la notion d'origine n'existe
   pas. On a lu le code Android — « CapacitorHttp » est enregistré
   dans Bridge.java sans condition, et sa méthode « get » ne dépend
   PAS du réglage « enabled » (celui-ci ne commande que le
   remplacement global de window.fetch, qu'on ne veut pas : il
   passerait aussi par-dessus tous les appels à Supabase).

   Sur le web, « fetch » reste le bon outil : la version web est
   servie par Vercel, ne propose aucune mise à jour d'APK, et n'appelle
   donc jamais ceci.

   ⚠ CE QUE L'ÉCHEC AURAIT DONNÉ. Rien. « versionPubliee » rattrape
   l'erreur et rend « null », ce qui veut dire « pas de nouveauté ».
   Le club n'aurait jamais vu passer une seule mise à jour, et
   personne n'aurait eu de raison de se plaindre.
   ------------------------------------------------------------ */
async function demanderLeFichier(): Promise<unknown> {
  if (SUR_TELEPHONE) {
    const { CapacitorHttp } = await import('@capacitor/core');
    const r = await CapacitorHttp.get({
      url: OU_EST_LA_VERSION,
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (r.status < 200 || r.status >= 300) throw new Error(`statut ${r.status}`);
    /* Le greffon rend déjà du JSON quand le serveur annonce du JSON,
       et du texte sinon. On accepte les deux. */
    return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
  }
  const r = await fetch(OU_EST_LA_VERSION, { cache: 'no-store' });
  if (!r.ok) throw new Error(`statut ${r.status}`);
  return r.json();
}

export async function versionPubliee(): Promise<VersionPubliee | null> {
  try {
    const brut: unknown = await demanderLeFichier();
    const o = brut as { numero?: unknown; notes?: unknown; octets?: unknown };
    /* On vérifie la FORME avant de croire le contenu. Un 404 déguisé
       en page HTML, un fichier tronqué, une note de deux mille
       caractères : rien de tout cela ne doit arriver jusqu'à
       l'écran. */
    if (typeof o?.numero !== 'string' || !/^\d+(\.\d+){0,3}$/.test(o.numero)) return null;
    const notes = typeof o.notes === 'string' ? o.notes.slice(0, 300) : undefined;
    /* Le poids doit être un nombre PLAUSIBLE. Un fichier de deux cents
       octets serait une page d'erreur ; un fichier de deux cents
       mégaoctets, un champ falsifié. Dans les deux cas on préfère ne
       rien annoncer plutôt qu'annoncer une bêtise. */
    const octets =
      typeof o.octets === 'number' &&
      Number.isFinite(o.octets) &&
      o.octets > 100_000 &&
      o.octets < 300 * 1024 * 1024
        ? o.octets
        : undefined;
    return { numero: o.numero, notes, octets };
  } catch {
    /* Hors ligne, ou GitHub injoignable. Ne rien dire : annoncer une
       mise à jour parce que le réseau est tombé serait un mensonge,
       et ne rien annoncer est le comportement d'hier. */
    return null;
  }
}

/* ------------------------------------------------------------
   REGARDER UNE FOIS, ET RENDRE CE QU'ON A VU.

   Le cœur commun aux trois façons de regarder : à l'ouverture, au
   retour dans l'application, et sur demande. « forcer » saute le
   délai d'un jour — c'est ce qui distingue « je demande » de
   « l'application vérifie toute seule ».
   ------------------------------------------------------------ */
async function regarder(forcer: boolean): Promise<{
  vue: VersionPubliee | null;
  aRegarde: boolean;
}> {
  if (!SUR_TELEPHONE) return { vue: null, aRegarde: false };
  if (!forcer && tropTot()) return { vue: null, aRegarde: false };

  const publiee = await versionPubliee();
  if (!publiee) return { vue: null, aRegarde: false };
  noterLeRegard();
  return {
    vue: plusRecent(publiee.numero, NUMERO) ? publiee : null,
    aRegarde: true
  };
}

/* ------------------------------------------------------------
   Le crochet du bandeau.

   Rend la version publiée quand elle est PLUS RÉCENTE que la
   nôtre, « null » sinon. Il ne fait rien hors du téléphone : la
   version web se met à jour en rechargeant la page.

   ------------------------------------------------------------
   ⚠ IL REGARDE AUSSI AU RETOUR DANS L'APPLICATION.

   Il ne regardait qu'au MONTAGE. Or Android garde une application
   vivante des jours : quelqu'un qui ne la ferme jamais — et
   l'application empêche justement la mise en veille pendant les
   cours — ne repassait jamais par ce montage. Le bandeau ne
   s'affichait donc plus jamais pour lui, sans que rien n'échoue.

   « resume » est l'événement que Capacitor donne quand
   l'application revient au premier plan. Le délai d'un jour tient
   toujours : revenir dix fois dans la journée ne fait pas dix
   demandes.
   ------------------------------------------------------------ */
export function useMiseAJourApk(): VersionPubliee | null {
  const [neuve, setNeuve] = useState<VersionPubliee | null>(null);

  useEffect(() => {
    if (!SUR_TELEPHONE) return;
    let vivant = true;

    const voir = async () => {
      const { vue } = await regarder(false);
      if (vivant && vue) setNeuve(vue);
    };

    void voir();

    /* Le module n'existe que dans l'application empaquetée ; dans un
       navigateur l'import échoue, et il n'y a rien à faire. */
    let retirer: (() => void) | undefined;
    void import('@capacitor/app')
      .then(({ App }) => App.addListener('resume', () => void voir()))
      .then((h) => {
        retirer = () => void h.remove();
      })
      .catch(() => undefined);

    return () => {
      vivant = false;
      retirer?.();
    };
  }, []);

  return neuve;
}

/* ------------------------------------------------------------
   ⚠ CHERCHER SOI-MÊME, ET S'ENTENDRE RÉPONDRE.

   Ce crochet-ci répond à un manque que le club a éprouvé le jour
   même de la première mise à jour : on ne pouvait rien demander.
   L'application regardait une fois par jour, et si elle avait déjà
   regardé, il fallait attendre le lendemain — ou effacer les
   données de l'application, ce qui déconnecte.

   Il y avait pire, et plus discret : quand tout va bien,
   l'application ne dit RIEN. Une fonctionnalité qui n'a aucun moyen
   d'annoncer « je marche » est une fonctionnalité qu'on ne peut
   jamais vérifier — c'est la forme exacte du défaut que ce projet a
   rencontré quatre fois. « Vous avez la dernière version » est donc
   une réponse aussi importante que l'autre.

   Le délai d'un jour est SAUTÉ ici, et seulement ici : une demande
   explicite n'est pas une vérification automatique, et quelqu'un qui
   appuie mérite une réponse fraîche.
   ------------------------------------------------------------ */
export type Recherche =
  | { etat: 'repos' }
  | { etat: 'en cours' }
  | { etat: 'a jour' }
  | { etat: 'trouvee'; version: VersionPubliee }
  | { etat: 'injoignable' };

export function useChercherMiseAJour(): {
  recherche: Recherche;
  chercher: () => void;
} {
  const [recherche, setRecherche] = useState<Recherche>({ etat: 'repos' });

  const chercher = () => {
    setRecherche({ etat: 'en cours' });
    void (async () => {
      const { vue, aRegarde } = await regarder(true);
      if (vue) setRecherche({ etat: 'trouvee', version: vue });
      /* ⚠ « aRegarde » DISTINGUE DEUX SILENCES qui se ressemblent :
         « j'ai demandé, et il n'y a rien de neuf » et « je n'ai pas
         pu demander ». Les confondre ferait dire « vous avez la
         dernière version » à quelqu'un hors ligne — un mensonge
         tranquille, et le pire des deux. */
      else if (aRegarde) setRecherche({ etat: 'a jour' });
      else setRecherche({ etat: 'injoignable' });
    })();
  };

  return { recherche, chercher };
}
