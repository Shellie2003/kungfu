/* ============================================================
   pousser — faire sonner les téléphones du club.

   ------------------------------------------------------------
   POURQUOI CETTE FONCTION EXISTE

   Les notifications s'écrivent déjà en base, une ligne par membre,
   depuis l'application. Elles s'affichent dans le casier. Mais elles
   n'atteignent personne tant que l'application n'est pas ouverte —
   et un cours déplacé se sait la veille, pas quand on y pense.

   Firebase seul peut réveiller un téléphone endormi. Or l'envoi
   demande une clé de compte de service, qui signe les demandes au
   nom du club. Cette clé ne peut PAS vivre dans l'APK : un APK se
   décompresse en une commande, et la clé donnerait à qui l'ouvre le
   droit d'envoyer des notifications au nom du club, sur tous les
   téléphones. D'où une fonction serveur, où elle reste.

   ------------------------------------------------------------
   ⚠ CE QUE CETTE FONCTION NE FAIT PAS : ÉCRIRE LA NOTIFICATION

   Elle ne fait que SONNER. L'écriture en base reste là où elle
   était, dans l'application, et se produit AVANT l'appel ici.

   L'ordre n'est pas indifférent. Si l'envoi Firebase échoue — clé
   expirée, Firebase en panne, club sans projet Firebase du tout —
   la notification est déjà dans le casier de chacun : le club a été
   prévenu, moins bien, mais prévenu. L'ordre inverse aurait fait
   d'une panne de Firebase une perte d'annonce.

   C'est aussi pourquoi l'application n'affiche AUCUNE erreur quand
   cet appel échoue : il n'y a rien à corriger pour celui qui publie,
   et lui dire « échec » alors que l'annonce est partie serait faux.

   ------------------------------------------------------------
   ⚠ TANT QUE LE CLUB N'A PAS DE PROJET FIREBASE

   « FCM_COMPTE_SERVICE » est absent, cette fonction répond 200 avec
   « envoyees: 0 » et « firebase: false ». Elle ne se plaint pas.
   L'application marche exactement comme avant : c'est l'état livré,
   et il est correct, pas dégradé.

   La marche à suivre pour créer le projet est dans LIVRER.md.

   ------------------------------------------------------------
   QUI A LE DROIT D'APPELER

   Le jeton du membre qui publie, et la base qui vérifie son rôle.
   Un élève qui appellerait cette fonction à la main se ferait
   refuser par « mon_role() » : seuls les maîtres et l'administration
   publient. Sans ce contrôle, n'importe quel membre pourrait faire
   sonner soixante-quatre téléphones à trois heures du matin.

   Déploiement : voir LISEZ-MOI.md à côté.
   ============================================================ */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const URL = Deno.env.get('SUPABASE_URL')!;
const CLE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
/* La clé du compte de service Firebase, en JSON, telle que la console
   la donne au téléchargement. Absente = pas de Firebase = silence. */
const COMPTE_FIREBASE = Deno.env.get('FCM_COMPTE_SERVICE');

const ENTETES = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS'
};

/* Un 204 n'a pas le droit d'avoir un corps — voir « fondation », où
   ce défaut a empêché la création du premier compte du club en
   annonçant « la requête n'est pas partie ». */
const repondre = (corps: unknown, statut = 200) =>
  new Response(statut === 204 || statut === 304 ? null : JSON.stringify(corps), {
    status: statut,
    headers: ENTETES
  });

/* ------------------------------------------------------------
   LE JETON D'ACCÈS DE GOOGLE.

   L'API d'envoi de Firebase (« HTTP v1 ») n'accepte pas la clé du
   compte de service telle quelle : il faut s'en servir pour SIGNER
   une petite assertion, puis l'échanger contre un jeton d'une heure.

   ⚠ ON NE PEUT PAS EMPLOYER L'ANCIENNE API « legacy », qui prenait
   une simple clé de serveur dans un en-tête et tenait en trois
   lignes : Google l'a fermée en juin 2024. Tout exemple trouvé en
   ligne qui parle de « fcm.googleapis.com/fcm/send » et d'une
   « clé serveur » ne fonctionne plus — c'est le piège de cette
   fonctionnalité, et il coûte une demi-journée à qui l'ignore.

   La signature est du RS256, que Deno sait faire nativement. La clé
   privée arrive au format PEM et doit être convertie en binaire :
   c'est le seul endroit un peu ingrat de ce fichier.
   ------------------------------------------------------------ */
type CompteService = {
  client_email: string;
  private_key: string;
  project_id: string;
};

function base64url(donnee: string | Uint8Array): string {
  const octets =
    typeof donnee === 'string' ? new TextEncoder().encode(donnee) : donnee;
  let binaire = '';
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importerLaCle(pem: string): Promise<CryptoKey> {
  /* La clé arrive avec ses en-têtes et ses retours à la ligne, et
     ceux-ci sont souvent échappés en « \n » littéraux quand la clé a
     transité par une variable d'environnement. On rattrape les deux. */
  const corps = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaire = Uint8Array.from(atob(corps), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    binaire,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function jetonGoogle(compte: CompteService): Promise<string> {
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const charge = base64url(
    JSON.stringify({
      iss: compte.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: maintenant,
      exp: maintenant + 3600
    })
  );

  const cle = await importerLaCle(compte.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cle,
    new TextEncoder().encode(`${entete}.${charge}`)
  );
  const assertion = `${entete}.${charge}.${base64url(new Uint8Array(signature))}`;

  const reponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  if (!reponse.ok) {
    throw new Error(`Google refuse la clé du club : ${await reponse.text()}`);
  }
  const { access_token } = (await reponse.json()) as { access_token: string };
  return access_token;
}

Deno.serve(async (requete) => {
  if (requete.method === 'OPTIONS') return repondre(null, 204);
  if (requete.method !== 'POST') return repondre({ erreur: 'méthode' }, 405);

  let corps: { titre?: string; texte?: string; vers?: string | null };
  try {
    corps = await requete.json();
  } catch {
    return repondre({ erreur: 'corps illisible' }, 400);
  }

  const titre = (corps.titre ?? '').trim();
  if (!titre) return repondre({ erreur: 'titre manquant' }, 400);
  /* Android tronque au-delà, et un titre de deux mille caractères
     serait le signe d'un appel mal formé plutôt que d'une annonce. */
  const texte = (corps.texte ?? '').trim().slice(0, 500);
  const vers = typeof corps.vers === 'string' ? corps.vers : null;

  /* ------------------------------------------------------------
     QUI DEMANDE. Le jeton du membre, vérifié par la base — et non
     par nous : « mon_role() » est la seule autorité sur ce point, et
     la recopier ici la ferait diverger un jour.
     ------------------------------------------------------------ */
  const autorisation = requete.headers.get('authorization') ?? '';
  if (!autorisation.startsWith('Bearer ')) {
    return repondre({ erreur: 'jeton manquant' }, 401);
  }

  const commeMembre = createClient(URL, CLE_SERVICE, {
    auth: { persistSession: false },
    global: { headers: { authorization: autorisation } }
  });
  const { data: role, error: eRole } = await commeMembre.rpc('mon_role');
  if (eRole) return repondre({ erreur: 'jeton refusé' }, 401);
  if (role !== 'admin' && role !== 'maitre') {
    return repondre({ erreur: 'réservé aux maîtres et à l’administration' }, 403);
  }

  /* Sans Firebase, on s'arrête ici — sans se plaindre. L'annonce est
     déjà dans le casier de chacun. */
  if (!COMPTE_FIREBASE) {
    return repondre({ firebase: false, envoyees: 0, retirees: 0 });
  }

  const admin = createClient(URL, CLE_SERVICE, { auth: { persistSession: false } });
  const { data: jetons, error: eJetons } = await admin
    .from('jetons_push')
    .select('jeton');
  if (eJetons) return repondre({ erreur: 'jetons illisibles' }, 500);

  const liste = (jetons ?? []) as { jeton: string }[];
  if (!liste.length) return repondre({ firebase: true, envoyees: 0, retirees: 0 });

  let compte: CompteService;
  let acces: string;
  try {
    compte = JSON.parse(COMPTE_FIREBASE) as CompteService;
    acces = await jetonGoogle(compte);
  } catch (e) {
    /* La clé est mal formée ou refusée. C'est un défaut de
       CONFIGURATION du club, pas une faute de celui qui publie : on
       le dit dans les journaux, et on rend un compte honnête. */
    console.error('Firebase inutilisable :', e);
    return repondre({ firebase: false, envoyees: 0, retirees: 0, erreur: 'clé Firebase refusée' });
  }

  /* ------------------------------------------------------------
     L'ENVOI, UN JETON À LA FOIS.

     L'API v1 n'envoie qu'à un destinataire par appel — l'envoi en
     lot de l'ancienne API n'existe plus. Soixante-quatre appels
     partent donc ensemble ; c'est peu, et ils sont courts.

     ⚠ « UNREGISTERED » ET « INVALID_ARGUMENT » sont les réponses
     d'un jeton MORT : application désinstallée, données effacées,
     téléphone perdu. On les efface au passage — sans quoi la table
     se remplirait de jetons morts qu'on paierait à chaque annonce,
     et personne ne s'en apercevrait jamais.
     ------------------------------------------------------------ */
  const morts: string[] = [];
  let envoyees = 0;

  await Promise.all(
    liste.map(async ({ jeton }) => {
      try {
        const r = await fetch(
          `https://fcm.googleapis.com/v1/projects/${compte.project_id}/messages:send`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${acces}`,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              message: {
                token: jeton,
                notification: { title: titre, body: texte || undefined },
                /* « data » voyage à côté de la notification : c'est
                   lui que l'application relit quand on tape dessus,
                   pour ouvrir le bon écran. Tout doit y être du
                   TEXTE — Firebase refuse les autres types. */
                data: vers ? { vers } : undefined,
                android: {
                  priority: 'high',
                  notification: { sound: 'default' }
                }
              }
            })
          }
        );

        if (r.ok) {
          envoyees++;
          return;
        }
        const detail = await r.text();
        if (detail.includes('UNREGISTERED') || detail.includes('INVALID_ARGUMENT')) {
          morts.push(jeton);
        } else {
          console.error(`Firebase refuse un envoi (${r.status}) :`, detail);
        }
      } catch (e) {
        console.error('Envoi impossible :', e);
      }
    })
  );

  if (morts.length) {
    await admin.from('jetons_push').delete().in('jeton', morts);
  }

  return repondre({ firebase: true, envoyees, retirees: morts.length });
});
