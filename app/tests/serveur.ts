/* ============================================================
   Un serveur Supabase simulé, pour les tests d'intégration.

   Il intercepte fetch et répond comme PostgREST : c'est la FORME
   des réponses qui compte — une jointure rendue en tableau plutôt
   qu'en objet est exactement le genre d'écart qui casse un écran
   sans que le typage s'en aperçoive.

   Ce qu'il n'est pas, et ce qu'il ne faut pas lui demander : une
   base de données. Il n'applique aucune règle d'accès. Les règles
   ont leur propre test, dans supabase/tests/, exécuté sur un vrai
   PostgreSQL en se faisant passer pour un élève, un maître et
   l'administration. Les simuler ici donnerait l'illusion de les
   vérifier — le pire des deux mondes.
   ============================================================ */
import { vi } from 'vitest';
import { supabase } from '../src/services/supabase';

export const URL_ESSAI = 'https://essai.supabase.co';

/* Une session complète, telle que le service d'authentification la
   rend. La forme compte : supabase-js refuse une session à laquelle
   il manque « token_type » ou « expires_in », et rend alors une
   erreur générique qui ressemble à un problème de réseau. Un premier
   essai avec un objet abrégé a échoué exactement ainsi. */
export function sessionFactice(id = 'u1') {
  return {
    access_token: 'jeton-de-controle',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'renouvellement-de-controle',
    user: {
      id,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'f04x042@waishi.local',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString()
    }
  };
}

export type Requete = {
  methode: string;
  table: string;
  parametres: URLSearchParams;
  corps: unknown;
  entetes: Record<string, string>;
  /* Le chemin appelé. Il ne sert que pour le stockage, où c'est
     justement le chemin qui porte l'information : « <salon>/<nom> »
     pour une pièce jointe, et c'est lui que la règle d'accès lit. */
  chemin?: string;
};

/* Ce que le serveur simulé a reçu. Les tests s'en servent pour
   vérifier ce qui a été ENVOYÉ, et pas seulement ce qui s'affiche :
   un formulaire peut sembler marcher et n'écrire aucun champ. */
export const recues: Requete[] = [];

type Reponse = unknown | ((r: Requete) => unknown);

let tables: Record<string, Reponse> = {};
let auth: Record<string, Reponse> = {};

export function poser(nouvelles: Record<string, Reponse>) {
  tables = { ...tables, ...nouvelles };
}

export function poserAuth(nouvelles: Record<string, Reponse>) {
  auth = { ...auth, ...nouvelles };
}

/* Les CATÉGORIES sont posées par défaut, comme la migration les
   sème dans une base neuve.

   Elles étaient écrites dans l'écran de publication ; elles vivent
   maintenant en base, et les listes de choix les lisent. Sans elles
   ici, huit tests qui choisissaient « Sortie » ou « Réunion » se
   retrouvaient devant une liste vide — un échec qui n'aurait rien
   dit du code, seulement du bouchon.

   Un test qui veut une base SANS catégorie pose « categories: [] » :
   « poser » écrase, il ne complète pas. */
const CATEGORIES_SEMEES = [
  { id: 'c1', genre: 'actualite', nom: 'Sortie', couleur: '#12613C', rang: 1, actif: true },
  { id: 'c2', genre: 'actualite', nom: 'Compétition', couleur: '#12613C', rang: 2, actif: true },
  { id: 'c3', genre: 'actualite', nom: 'Réunion', couleur: '#12613C', rang: 3, actif: true },
  { id: 'c4', genre: 'actualite', nom: 'Cérémonie', couleur: '#12613C', rang: 4, actif: true },
  {
    id: 'c5', genre: 'actualite', nom: 'Changement d\u2019horaire',
    couleur: '#B0530F', rang: 5, actif: true
  },
  { id: 'c6', genre: 'album', nom: 'Compétitions', couleur: '#12613C', rang: 1, actif: true },
  { id: 'c7', genre: 'album', nom: 'Entraînements', couleur: '#12613C', rang: 2, actif: true },
  { id: 'c8', genre: 'album', nom: 'Cérémonies', couleur: '#12613C', rang: 3, actif: true }
];

export function reinitialiser() {
  tables = { categories: CATEGORIES_SEMEES };
  auth = {};
  recues.length = 0;
}

/* La dernière requête reçue sur une table, ou undefined. Presque
   tous les tests d'écriture s'en servent. */
export const derniere = (table: string, methode = 'POST') =>
  [...recues].reverse().find((r) => r.table === table && r.methode === methode);

const json = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json' }
  });

export function brancherServeur() {
  /* Les deux, toujours : un test qui branche le serveur veut que
     TOUT le réseau soit simulé, pas seulement la moitié qui passe
     par « fetch ». Les oublier a fait expirer huit tests d'envoi de
     photo le jour où les envois sont passés à XMLHttpRequest. */
  brancherXHR();
  poserSessionLocale();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (entree: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(entree instanceof Request ? entree.url : entree));
      const methode = (options?.method ?? (entree instanceof Request ? entree.method : 'GET')).toUpperCase();

      let corps: unknown = null;
      const brut = options?.body;
      if (typeof brut === 'string') {
        try { corps = JSON.parse(brut); } catch { corps = brut; }
      }

      const entetes: Record<string, string> = {};
      new Headers(options?.headers ?? {}).forEach((v, k) => { entetes[k] = v; });

      /* --- Authentification --- */
      if (url.pathname.startsWith('/auth/v1/')) {
        const quoi = url.pathname.replace('/auth/v1/', '');
        /* Enregistré AVANT toute sortie : « recues » est le registre
           de ce qui a été ENVOYÉ, pas de ce à quoi l'on a pensé à
           répondre. L'enregistrement venait après le retour anticipé,
           si bien qu'un appel sans réponse posée — une déconnexion,
           par exemple — n'y figurait jamais. Un test ne pouvait donc
           pas vérifier qu'elle était partie. */
        recues.push({ methode, table: `auth:${quoi}`, parametres: url.searchParams, corps, entetes });
        const reponse = auth[quoi];
        if (reponse === undefined) return json({ user: null, session: null });
        const valeur = typeof reponse === 'function' ? (reponse as (r: Requete) => unknown)({ methode, table: quoi, parametres: url.searchParams, corps, entetes }) : reponse;
        if (valeur && typeof valeur === 'object' && 'erreur' in (valeur as object)) {
          return json({ error: 'invalid_grant', error_description: (valeur as { erreur: string }).erreur, msg: (valeur as { erreur: string }).erreur }, 400);
        }
        return json(valeur);
      }

      /* --- Fonctions déployées --- */
      if (url.pathname.startsWith('/functions/v1/')) {
        const nom = url.pathname.replace('/functions/v1/', '');
        recues.push({ methode, table: `fonction:${nom}`, parametres: url.searchParams, corps, entetes });
        const reponse = tables[`fonction:${nom}`];
        if (reponse === undefined) return json({ message: 'Not Found' }, 404);
        return json(typeof reponse === 'function' ? (reponse as (r: Requete) => unknown)({ methode, table: nom, parametres: url.searchParams, corps, entetes }) : reponse);
      }

      /* --- Le stockage de fichiers ---
         createSignedUrls rend UN TABLEAU, une entrée par chemin
         demandé, chacune avec sa propre erreur éventuelle. C'est
         cette forme-là qu'il faut reproduire : une photo manquante
         ne doit pas faire échouer la liste entière. */
      if (url.pathname.startsWith('/storage/v1/')) {
        recues.push({
          methode, table: 'storage', parametres: url.searchParams, corps, entetes,
          chemin: url.pathname
        });
        const prevu = tables['storage'];
        if (prevu !== undefined) return json(prevu);
        const chemins = (corps as { paths?: string[] } | null)?.paths;
        if (chemins) {
          /* La forme EXACTE du vrai serveur, et j'ai dû l'apprendre
             à mes dépens : il rend « signedURL » — un CHEMIN relatif,
             avec un U et un R majuscules — que supabase-js préfixe
             ensuite de l'adresse du stockage pour composer
             « signedUrl ».

             Mon premier bouchon rendait directement « signedUrl ».
             La bibliothèque, ne trouvant pas « signedURL », posait
             donc « signedUrl: null » PAR-DESSUS, et toutes les
             adresses valaient null dans les tests. Ils passaient
             quand même : aucun ne regardait une image, ils
             regardaient que la liste des membres survive — ce qu'elle
             fait tout aussi bien avec zéro adresse.

             C'est le danger d'un simulateur : il ne se trompe jamais
             de la façon dont le vrai serveur se trompe. Celui-ci rend
             maintenant ce que rend l'autre. */
          const seau = url.pathname.split('/object/sign/')[1] ?? 'album';
          return json(
            chemins.map((p) => ({
              path: p,
              signedURL: `/object/sign/${seau}/${p}?token=essai`,
              error: null
            }))
          );
        }
        return json({ Key: 'album/essai.jpg' });
      }

      /* --- PostgREST --- */
      const table = url.pathname.replace('/rest/v1/', '').replace(/^rpc\//, 'rpc:');
      const requete: Requete = { methode, table, parametres: url.searchParams, corps, entetes };
      recues.push(requete);

      /* Une réponse peut être posée POUR UNE MÉTHODE — « messages:PATCH »
         — ou pour la table entière. La distinction compte : un PATCH
         que la règle d'accès écarte ne touche aucune ligne et rend un
         tableau vide, là où le GET de la même table rend les
         messages. Sans cela, on ne peut pas simuler un refus. */
      /* Un INSERT ne rend pas la table, il rend LA LIGNE CRÉÉE.

         Le simulateur rendait jusqu'ici la valeur posée pour la
         table — c'est-à-dire, pour un test qui pose « messages: [] »
         afin de partir d'un fil vide, un tableau vide. Le vrai
         PostgREST, lui, renvoie la ligne écrite dès qu'on demande
         « .select() ». Un code qui distingue « accepté » de « refusé
         en silence » sur ce retour aurait donc échoué ici tout en
         marchant sur le serveur, et — le piège inverse, celui des
         adresses signées — un code faux aurait pu passer.

         On écho donc le corps envoyé, ce que fait le vrai serveur à
         ceci près qu'il y ajoute l'identifiant et les valeurs par
         défaut. Un test qui veut simuler un insert REFUSÉ pose
         explicitement « <table>:POST », qui garde la priorité. */
      const explicite = tables[`${table}:${methode}`];
      const reponse =
        explicite ??
        (methode === 'POST' && corps !== undefined && !table.startsWith('rpc:')
          ? [corps].flat().map((ligne) => {
              /* C'est le SERVEUR qui pose l'identifiant, pas celui
                 qui écrit. Un test qui a besoin de le connaître à
                 l'avance — pour vérifier qu'une seconde écriture s'y
                 rattache bien — pose la table avec la ligne voulue,
                 et l'identifiant en est repris ici. */
              const attendue = (tables[table] as { id?: string }[] | undefined)?.[0];
              const l = ligne as Record<string, unknown>;
              return l && typeof l === 'object' && l.id === undefined && attendue?.id
                ? { ...l, id: attendue.id }
                : l;
            })
          : tables[table]);
      if (reponse === undefined) {
        /* Une table non prévue rend un tableau vide plutôt qu'une
           erreur : un test qui ne s'intéresse pas aux notifications
           ne doit pas avoir à les déclarer. Mais elle est notée dans
           « recues », consultable en cas de doute. */
        return json([]);
      }

      /* « await » : une réponse posée peut être une PROMESSE, et
         c'est ce qui permet de simuler un serveur LENT — ou un
         serveur qui ne répond jamais.

         Sans lui, une promesse était passée telle quelle à
         JSON.stringify, qui en fait « {} » : le test croyait mesurer
         une attente et mesurait une réponse instantanée et vide. On
         ne pouvait donc pas éprouver l'affichage immédiat d'un
         message, qui est justement ce qui rend l'envoi rapide. */
      const valeur = await (typeof reponse === 'function'
        ? (reponse as (r: Requete) => unknown)(requete)
        : reponse);

      /* .single() et .maybeSingle() demandent un OBJET, pas un
         tableau. C'est la distinction que fait PostgREST par
         l'en-tête Accept, et la reproduire ici est le cœur de
         l'intérêt de ce simulateur. */
      const seul = (entetes['accept'] ?? '').includes('vnd.pgrst.object');
      if (seul && Array.isArray(valeur)) return json(valeur[0] ?? null);
      return json(valeur);
    })
  );
}

/* ============================================================
   XMLHttpRequest, parce que l'envoi de fichiers ne passe plus par
   « fetch ».

   Les pièces jointes, les portraits et les photos d'album partent
   maintenant par XMLHttpRequest : c'est la seule façon de savoir où
   en est un ENVOI et donc d'afficher un anneau de progression qui
   dit la vérité. « fetch » ne le sait pas, et ne le saura pas dans
   la WebView d'un Android 9.

   Le bouchon du navigateur (outils/bouchon.mjs) n'a rien eu à
   changer : « page.route » intercepte tout le réseau, quel que soit
   le moyen. Ici, en revanche, seul « fetch » était remplacé — les
   huit tests d'envoi de photo sont donc partis chercher un vrai
   serveur et ont expiré.

   Ce faux XHR ne réimplémente pas la norme : il en fait juste assez
   pour que le code d'envoi marche, et il retombe sur le MÊME
   traitement que « fetch ». Les requêtes se retrouvent donc dans
   « recues » comme les autres, et un test peut vérifier ce qui est
   parti.
   ============================================================ */
class FauxXHR {
  status = 0;
  responseText = '';
  upload = {
    onprogress: null as ((e: ProgressEvent) => void) | null,
    onload: null as (() => void) | null
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  private methode = 'GET';
  private adresse = '';
  private entetes: Record<string, string> = {};

  open(methode: string, adresse: string) {
    this.methode = methode;
    this.adresse = adresse;
  }

  setRequestHeader(nom: string, valeur: string) {
    this.entetes[nom] = valeur;
  }

  send(corps?: Blob | null) {
    /* La progression est annoncée AVANT la réponse, comme sur un
       vrai réseau : un test peut donc voir l'anneau à mi-chemin. */
    const total = corps instanceof Blob ? corps.size : 0;
    this.upload.onprogress?.({ lengthComputable: true, loaded: total, total } as ProgressEvent);
    this.upload.onload?.();

    void (globalThis.fetch as typeof fetch)(this.adresse, {
      method: this.methode,
      headers: this.entetes,
      body: corps as BodyInit
    })
      .then(async (r) => {
        this.status = r.status;
        this.responseText = await r.text();
        this.onload?.();
      })
      .catch(() => this.onerror?.());
  }
}

export function brancherXHR() {
  vi.stubGlobal('XMLHttpRequest', FauxXHR);
}

/* ------------------------------------------------------------
   Le jeton de session, pour l'envoi de fichiers.

   L'envoi pose lui-même l'en-tête « Authorization », ce que
   supabase-js faisait pour lui auparavant. Il demande donc le jeton
   à « supabase.auth.getSession() ». Sans session, il s'arrête avant
   de partir sur « Session expirée » — le bon comportement, et ce qui
   a fait tomber huit tests d'envoi de photo qui n'avaient jamais eu
   besoin d'une session jusque-là.

   J'ai d'abord écrit la session dans localStorage, sous la clé que
   supabase-js emploie. Elle n'était pas relue : le client garde en
   mémoire ce qu'il a lu au démarrage, et il avait déjà conclu qu'il
   n'y avait pas de session. Écrire dans le stockage APRÈS ne change
   plus rien.

   On remplace donc la méthode elle-même. C'est plus direct, et
   surtout c'est HONNÊTE : le test dit « il y a une session », il ne
   fait pas semblant d'en fabriquer une par un chemin détourné qui
   pourrait marcher pour de mauvaises raisons.
   ------------------------------------------------------------ */
export function poserSessionLocale(id = 'u1') {
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: { session: sessionFactice(id) },
    error: null
  } as never);
}
