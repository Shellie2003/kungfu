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

const ENTETES = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS'
};

/* ⚠ UN 204 N'A PAS LE DROIT D'AVOIR UN CORPS — voir la note détaillée
   dans fondation/index.ts, où ce défaut a été trouvé.

   « repondre(null, 204) » fabriquait le texte « null », soit un corps
   de quatre octets, que le statut 204 interdit. Deno lève, la fonction
   rend 500, et le navigateur cesse là : l'appel réel n'est jamais
   envoyé. L'écran n'annonce alors qu'un « Failed to send a request to
   the Edge Function », qui ne dit rien de la cause.

   Le défaut était ici aussi, identique, et il aurait frappé la
   première fois qu'un maître aurait inscrit un élève. */
const repondre = (corps: unknown, statut = 200) =>
  new Response(statut === 204 || statut === 304 ? null : JSON.stringify(corps), {
    status: statut,
    headers: ENTETES
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
    .select('id, role, super_admin')
    .eq('compte_id', compte)
    .maybeSingle();

  if (eMoi || !moi) return repondre({ message: 'Aucune fiche pour ce compte.' }, 401);
  if (moi.role !== 'admin') {
    return repondre({ message: 'Réservé à l’administration.' }, 403);
  }
  const superAdmin = moi.super_admin === true;

  /* --- L'action demandée --- */
  let corps: { action?: string; profilId?: string; suspendu?: boolean };
  try {
    corps = await requete.json();
  } catch {
    return repondre({ message: 'Corps illisible.' }, 400);
  }
  const { action, profilId } = corps;
  if (!action || !profilId) return repondre({ message: 'action et profilId sont requis.' }, 400);

  /* ------------------------------------------------------------
     CE QUI EST RÉSERVÉ AU SUPER ADMINISTRATEUR.

     « Seul lui peut suspendre, supprimer définitivement un membre. »

     Le contrôle est ICI, sur le serveur, et non dans l'écran. Un
     écran qui cache un bouton ne protège rien : la fonction est
     appelable par n'importe quel administrateur avec son propre
     jeton, depuis n'importe quel outil. C'est le même raisonnement
     qui fait vivre la clé de service sur le serveur plutôt que dans
     l'APK.

     La création de compte et la réinitialisation de mot de passe
     restent à l'administration ordinaire : ce sont les gestes du
     quotidien — un membre a perdu son mot de passe un samedi matin —
     et les réserver au super administrateur ferait attendre le club
     sans rien protéger de plus.
     ------------------------------------------------------------ */
  if ((action === 'suspendre' || action === 'supprimer') && !superAdmin) {
    return repondre(
      {
        message:
          action === 'supprimer'
            ? 'Supprimer définitivement un membre est réservé au super administrateur.'
            : 'Suspendre un membre est réservé au super administrateur.'
      },
      403
    );
  }

  /* On ne se suspend ni ne se supprime soi-même : le super
     administrateur se déconnecterait définitivement, et s'il est le
     dernier, plus personne ne peut en nommer un autre. Le club
     serait enfermé dehors, et cela ne se rattraperait que par le
     tableau de bord Supabase. */
  if ((action === 'suspendre' || action === 'supprimer') && profilId === moi.id) {
    return repondre(
      { message: 'On ne peut pas se suspendre ni se supprimer soi-même.' },
      400
    );
  }

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

  /* ------------------------------------------------------------
     RENOMMER : changer le matricule d'un membre.

     ⚠ LE PIÈGE, ET IL EST SILENCIEUX.

     L'adresse de connexion est DÉRIVÉE du matricule : « F04x042 »
     donne « f04x042@waishi.local ». Changer « profils.numero » sans
     toucher au compte laisserait donc un membre dont l'application
     compose une adresse qui n'existe pas — il taperait son nouveau
     matricule et le bon mot de passe, et lirait « numéro de membre
     ou mot de passe incorrect ». Rien, dans la base, ne paraîtrait
     anormal.

     Les deux changements sont donc faits ICI, ensemble. L'ordre est
     réfléchi : le COMPTE d'abord, la fiche ensuite.

       · si la fiche échoue après le compte, on remet l'ancienne
         adresse — c'est ce que fait le « revenir en arrière »
         ci-dessous, et l'on retombe exactement sur l'état de
         départ ;
       · dans l'autre sens, on ne pourrait pas : la fiche serait déjà
         renommée et le membre déjà dehors.

     Une fiche SANS compte de connexion — le cas de la plupart des
     élèves, qui n'ont pas de téléphone — ne renomme que la fiche.
     ------------------------------------------------------------ */
  if (action === 'renommer') {
    const neuf = String((corps as { numero?: string }).numero ?? '').replace(/\s+/g, '');
    if (!/^[A-Za-z0-9]{3,20}$/.test(neuf)) {
      return repondre({ message: 'Un matricule ne contient que des lettres et des chiffres.' }, 400);
    }
    if (neuf === fiche.numero) return repondre({ ok: true, numero: neuf });

    /* ⚠ L'UNICITÉ SE VÉRIFIE SANS DISTINGUER LA CASSE.
       La colonne est unique, mais PostgreSQL distingue « F04x077 »
       de « F04X077 » : les deux pourraient coexister. Or l'adresse
       de connexion met tout en minuscules — les deux membres
       auraient donc la MÊME adresse, et le second ne pourrait jamais
       se connecter. C'est sur cette adresse que porte la vraie
       contrainte, c'est donc elle qu'il faut vérifier. */
    const { data: pris } = await admin
      .from('profils')
      .select('id')
      .ilike('numero', neuf)
      .maybeSingle();
    if (pris) return repondre({ message: `Le matricule ${neuf} est déjà attribué.` }, 409);

    const nouvelleAdresse = `${neuf.toLowerCase()}@${DOMAINE}`;

    if (fiche.compte_id) {
      const { error } = await admin.auth.admin.updateUserById(fiche.compte_id, {
        email: nouvelleAdresse,
        email_confirm: true
      });
      if (error) return repondre({ message: error.message }, 400);
    }

    const { error: eNum } = await admin
      .from('profils')
      .update({ numero: neuf })
      .eq('id', profilId);

    if (eNum) {
      /* Revenir en arrière : sans cela le membre resterait dehors,
         avec une adresse que plus rien ne compose. */
      if (fiche.compte_id) {
        await admin.auth.admin.updateUserById(fiche.compte_id, {
          email: courriel,
          email_confirm: true
        });
      }
      return repondre({ message: eNum.message }, 400);
    }

    return repondre({ ok: true, numero: neuf });
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

  if (action === 'supprimer') {
    /* ⚠ DÉFINITIF, ET DANS CET ORDRE.

       Le projet DÉSACTIVE partout ailleurs — un grade retiré, une
       fiche d'élève, un créneau d'horaire — parce qu'effacer casse un
       historique que personne ne peut reconstituer. Le club a demandé
       la suppression définitive pour ce seul compte ; elle existe
       donc, et elle est réellement définitive.

       L'ordre compte. Le COMPTE de connexion part d'abord :
       si l'on supprimait la fiche en premier et que la suppression du
       compte échouait, il resterait un compte capable de se connecter
       sans aucune fiche — donc sans rôle, sans nom, et qu'aucun écran
       de l'application ne permettrait plus de retrouver.

       Dans l'autre sens, l'échec est bénin : une fiche sans compte
       est l'état ordinaire de soixante et un membres du club.

       Ce qui part avec la fiche, par les liens en cascade posés au
       premier jour : la vie privée, les tuteurs, l'appartenance aux
       salons, les présences. Ce qui reste : les messages écrits, dont
       l'auteur devient nul — faire disparaître une conversation à
       laquelle d'autres ont participé n'est pas ce qu'on demande en
       supprimant un membre.

       ⚠ CE PARAGRAPHE A ÉTÉ FAUX PENDANT TOUT LE PROJET. Le lien
       était « on delete CASCADE » : supprimer un membre effaçait
       bel et bien ses messages, au milieu des conversations des
       autres. L'intention écrite ici était la bonne ; c'est le
       schéma qui ne la suivait pas, et personne ne les avait
       confrontés. La migration 0027 corrige la BASE — et non ce
       commentaire — parce que c'est le commentaire qui avait
       raison. */
    if (fiche.compte_id) {
      const { error } = await admin.auth.admin.deleteUser(fiche.compte_id);
      if (error) return repondre({ message: error.message }, 400);
    }

    const { error: eFin } = await admin.from('profils').delete().eq('id', profilId);
    if (eFin) return repondre({ message: eFin.message }, 400);

    return repondre({ ok: true, supprime: fiche.numero });
  }

  return repondre({ message: `Action inconnue : ${action}` }, 400);
});
