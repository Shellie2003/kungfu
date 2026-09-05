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
};

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

export async function versionPubliee(): Promise<VersionPubliee | null> {
  try {
    const r = await fetch(OU_EST_LA_VERSION, { cache: 'no-store' });
    if (!r.ok) return null;
    const brut: unknown = await r.json();
    const o = brut as { numero?: unknown; notes?: unknown };
    /* On vérifie la FORME avant de croire le contenu. Un 404 déguisé
       en page HTML, un fichier tronqué, une note de deux mille
       caractères : rien de tout cela ne doit arriver jusqu'à
       l'écran. */
    if (typeof o?.numero !== 'string' || !/^\d+(\.\d+){0,3}$/.test(o.numero)) return null;
    const notes = typeof o.notes === 'string' ? o.notes.slice(0, 300) : undefined;
    return { numero: o.numero, notes };
  } catch {
    /* Hors ligne, ou GitHub injoignable. Ne rien dire : annoncer une
       mise à jour parce que le réseau est tombé serait un mensonge,
       et ne rien annoncer est le comportement d'hier. */
    return null;
  }
}

/* ------------------------------------------------------------
   Le crochet employé par l'écran.

   Rend la version publiée quand elle est PLUS RÉCENTE que la
   nôtre, « null » sinon.

   Il ne fait rien hors du téléphone : la version web se met à jour
   toute seule en rechargeant la page, et proposer d'y télécharger un
   APK n'aurait aucun sens.
   ------------------------------------------------------------ */
export function useMiseAJourApk(): VersionPubliee | null {
  const [neuve, setNeuve] = useState<VersionPubliee | null>(null);

  useEffect(() => {
    if (!SUR_TELEPHONE || tropTot()) return;
    let vivant = true;
    void (async () => {
      const publiee = await versionPubliee();
      if (!vivant || !publiee) return;
      noterLeRegard();
      if (plusRecent(publiee.numero, NUMERO)) setNeuve(publiee);
    })();
    return () => {
      vivant = false;
    };
  }, []);

  return neuve;
}
