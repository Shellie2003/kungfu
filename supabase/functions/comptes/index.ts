/* ============================================================
   comptes — créer un compte, réinitialiser un mot de passe.

   Pourquoi cette fonction existe
   ------------------------------
   Créer un compte dans auth.users demande la clé « service_role ».
   Cette clé passe outre TOUTES les règles d'accès : avec elle, on
   lit la date de naissance de chaque mineur du club et on écrit ce
   qu'on veut.

   Elle ne peut donc pas vivre dans l'application. Une clé dans un
   APK est une clé publiée : n'importe qui l'en extrait en deux
   minutes. Elle vit ici, sur le serveur, où personne ne la voit.

   Ce que cette fonction vérifie AVANT d'agir
   ------------------------------------------
   Qu'un jeton valide accompagne l'appel, et que la fiche qu'il
   désigne porte le rôle « admin ». Le contrôle se fait avec la clé
   PUBLIABLE, pas avec service_role : on demande à la base « qui es-
   tu », et c'est elle qui répond. Employer service_role pour cette
   lecture reviendrait à se croire sur parole.

   Déploiement : voir LISEZ-MOI.md à côté.
   ============================================================ */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const URL = Deno.env.get('SUPABASE_URL')!;
const CLE_PUBLIABLE = Deno.env.get('SUPABASE_ANON_KEY')!;
const CLE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/* L'adresse est composée à partir du matricule : le service
   d'authentification travaille par courriel, le club par numéro.
   Elle n'est jamais envoyée ni affichée — c'est un identifiant, pas
   un moyen de contact. */
const DOMAINE = 'waishi.local';

/* Un mot de passe qu'on peut dicter au téléphone sans se tromper :
   ni O ni 0, ni l ni 1, ni I. Douze caractères tirés au sort par le
   générateur cryptographique, pas par Math.random. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function motDePasse(longueur = 12): string {
  const octets = new Uint8Array(longueur);
  crypto.getRandomValues(octets);
  return [...octets].map((o) => ALPHABET[o % ALPHABET.length]).join('');
}

const repondre = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, content-type'
    }
  });

Deno.serve(async (requete) => {
  if (requete.method === 'OPTIONS') return repondre(null, 204);

  const autorisation = requete.headers.get('Authorization') ?? '';
  if (!autorisation.startsWith('Bearer ')) {
    return repondre({ message: 'Jeton absent.' }, 401);
  }

  /* --- Qui appelle, et a-t-il le droit ? ---
     Client monté avec la clé publiable ET le jeton de l'appelant :
     les règles d'accès s'appliquent donc normalement, et la requête
     ci-dessous ne rend que SA fiche. */
  const commeAppelant = createClient(URL, CLE_PUBLIABLE, {
    global: { headers: { Authorization: autorisation } }
  });

  /* Le MÊME défaut que dans l'application, et il aurait rendu cette
     fonction inutilisable : « .single() » sans filtre exige une
     ligne, et la règle « annuaire visible des membres » en rend
     autant qu'il y a de membres actifs. Toute création de compte
     aurait répondu « Jeton invalide » — y compris à
     l'administration.

     On demande donc explicitement la fiche rattachée à ce compte.
     Toujours avec la clé PUBLIABLE : c'est la base qui dit qui
     appelle, pas nous. */
  const { data: qui } = await commeAppelant.auth.getUser();
  const compte = qui.user?.id;
  if (!compte) return repondre({ message: 'Jeton invalide.' }, 401);

  const { data: moi, error: eMoi } = await commeAppelant
    .from('profils')
    .select('id, role')
    .eq('compte_id', compte)
    .maybeSingle();

  if (eMoi || !moi) return repondre({ message: 'Aucune fiche pour ce compte.' }, 401);
  if (moi.role !== 'admin') {
    return repondre({ message: 'Réservé à l’administration.' }, 403);
  }

  /* --- L'action demandée --- */
  let corps: { action?: string; profilId?: string; suspendu?: boolean };
  try {
    corps = await requete.json();
  } catch {
    return repondre({ message: 'Corps illisible.' }, 400);
  }
  const { action, profilId } = corps;
  if (!action || !profilId) return repondre({ message: 'action et profilId sont requis.' }, 400);

  const admin = createClient(URL, CLE_SERVICE, { auth: { persistSession: false } });

  const { data: fiche, error: eFiche } = await admin
    .from('profils')
    .select('id, numero, compte_id')
    .eq('id', profilId)
    .maybeSingle();

  if (eFiche || !fiche) return repondre({ message: 'Fiche introuvable.' }, 404);

  const courriel = `${fiche.numero.toLowerCase()}@${DOMAINE}`;

  if (action === 'creer') {
    if (fiche.compte_id) return repondre({ message: 'Cette fiche a déjà un compte.' }, 409);

    const mdp = motDePasse();
    const { data: cree, error } = await admin.auth.admin.createUser({
      email: courriel,
      password: mdp,
      email_confirm: true
    });
    if (error) return repondre({ message: error.message }, 400);

    /* Le rattachement se fait en dernier : si l'écriture échouait,
       mieux vaut un compte orphelin qu'une fiche pointant vers un
       compte qui n'existe pas. Un compte orphelin se rattache ;
       l'inverse casse la connexion. */
    const { error: eLien } = await admin
      .from('profils')
      .update({ compte_id: cree.user.id })
      .eq('id', profilId);
    if (eLien) return repondre({ message: eLien.message }, 400);

    return repondre({ motDePasse: mdp });
  }

  if (action === 'reinitialiser') {
    if (!fiche.compte_id) return repondre({ message: 'Cette fiche n’a pas de compte.' }, 409);
    const mdp = motDePasse();
    const { error } = await admin.auth.admin.updateUserById(fiche.compte_id, { password: mdp });
    if (error) return repondre({ message: error.message }, 400);
    return repondre({ motDePasse: mdp });
  }

  if (action === 'suspendre') {
    if (!fiche.compte_id) return repondre({ message: 'Cette fiche n’a pas de compte.' }, 409);
    /* « Suspendre » interdit la connexion sans rien détruire : la
       fiche, le grade et l'historique restent. Cent ans de bannissement
       plutôt qu'une suppression, pour que ce soit réversible. */
    const { error } = await admin.auth.admin.updateUserById(fiche.compte_id, {
      ban_duration: corps.suspendu ? '876000h' : 'none'
    });
    if (error) return repondre({ message: error.message }, 400);
    return repondre({ ok: true });
  }

  return repondre({ message: `Action inconnue : ${action}` }, 400);
});
