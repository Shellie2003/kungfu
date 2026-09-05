/* ============================================================
   fondation — le tout premier compte du club, et lui seul.

   ------------------------------------------------------------
   POURQUOI CETTE FONCTION EXISTE

   Tout compte est créé par l'administration depuis l'application.
   C'est vrai des soixante-quatre membres, et c'est CIRCULAIRE pour
   le premier : personne ne peut créer le compte de celui qui crée
   les comptes. Il fallait jusqu'ici ouvrir le tableau de bord
   Supabase et écrire du SQL à la main — un club qui installe
   l'application n'a pas à faire cela.

   ------------------------------------------------------------
   POURQUOI ELLE EST SÉPARÉE DE « comptes », ET NON UNE ACTION DE
   PLUS DANS CELLE-CI

   C'est la seule action du projet qui ne peut PAS exiger de jeton :
   celui qui la demande n'a pas encore de compte, par définition.
   Elle doit donc être déployée avec « verify_jwt » DÉSACTIVÉ.

   « comptes », elle, garde « verify_jwt » activé — et ce n'est pas
   négociable : c'est la fonction qui crée, suspend et supprime les
   membres. Y loger la fondation aurait obligé à désarmer la barrière
   d'entrée de tout le reste pour servir une action qui n'arrive
   qu'UNE FOIS dans la vie du club. Le marché est mauvais.

   Ici, la surface est d'une seule action, et cette action est
   verrouillée par la BASE elle-même. Une fois le club fondé, cette
   fonction peut même être supprimée du projet : elle ne répondra
   plus rien d'utile.

   ------------------------------------------------------------
   « SANS JETON » N'EST PAS « SANS CONTRÔLE »

   Le verrou n'est pas ici. Il est dans la base, en deux moitiés que
   la migration 0024 détaille :

     · « fonder_reserver » insère une ligne dont la clé est PRIMAIRE.
       De deux inscriptions parties en même temps, une seule passe —
       c'est PostgreSQL qui arbitre, pas un « if » qu'on aurait pu
       perdre entre deux requêtes.

     · toutes les fonctions refusent dès qu'un super administrateur
       existe. Même en effaçant la ligne, la porte reste fermée.

   Autrement dit : réécrire cette fonction, ou l'appeler depuis
   n'importe quel outil, ne permet pas de se fabriquer un compte
   super administrateur le lendemain de l'installation.

   ------------------------------------------------------------
   POURQUOI TROIS APPELS ET NON UN SEUL

   Le compte de CONNEXION ne vit pas dans la base du club : il vit
   dans « auth.users », et seul un appel HTTP l'y crée. Cet appel ne
   tient pas dans une transaction SQL. Or il faut connaître le numéro
   de membre AVANT de créer le compte, puisque l'adresse en est
   tirée : F04x001 devient f04x001@waishi.local.

   On réserve donc, on crée, on pose — et si la création échoue,
   « fonder_annuler » rend la place. Sans ce dernier geste, une
   coupure de réseau au mauvais moment enfermerait le club dehors
   définitivement.

   Déploiement : voir LISEZ-MOI.md à côté.
   ============================================================ */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const URL = Deno.env.get('SUPABASE_URL')!;
const CLE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/* L'adresse est composée à partir du matricule : le service
   d'authentification travaille par courriel, le club par numéro.
   Elle n'est jamais envoyée ni affichée — c'est un identifiant, pas
   un moyen de contact. */
const DOMAINE = 'waishi.local';

/* Le même minimum que l'écran annonce. Il est écrit des DEUX côtés :
   là-bas pour le dire avant l'envoi, ici parce que c'est le seul
   endroit qui décide. */
const MINIMUM_MOT_DE_PASSE = 8;

const ENTETES = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS'
};

/* ⚠ UN 204 N'A PAS LE DROIT D'AVOIR UN CORPS.

   Ce défaut a empêché la création du tout premier compte du club, et
   son message ne disait rien de sa cause :

       Failed to send a request to the Edge Function

   On lisait « la requête n'est pas partie » et l'on cherchait du côté
   du réseau. En réalité elle partait, arrivait, et la fonction
   plantait — les journaux du projet le disaient noir sur blanc :

       TypeError: Response with null body status cannot have body

   « repondre(null, 204) » fabriquait JSON.stringify(null), c'est-à-
   dire le TEXTE « null », soit un corps de quatre octets. Or 204
   signifie « pas de contenu » : Deno refuse, la fonction rend 500, et
   le navigateur — qui n'a reçu qu'une erreur à sa demande de
   préparation — n'envoie jamais le vrai appel. D'où le message : rien
   n'était effectivement parti.

   La préparation répond donc maintenant SANS corps. */
const repondre = (corps: unknown, statut = 200) =>
  new Response(statut === 204 || statut === 304 ? null : JSON.stringify(corps), {
    status: statut,
    headers: ENTETES
  });

Deno.serve(async (requete) => {
  if (requete.method === 'OPTIONS') return repondre(null, 204);

  let corps: { nom?: string; prenom?: string; motDePasse?: string };
  try {
    corps = await requete.json();
  } catch {
    return repondre({ message: 'Corps illisible.' }, 400);
  }

  const nom = (corps.nom ?? '').trim();
  const prenom = (corps.prenom ?? '').trim();
  const mdp = corps.motDePasse ?? '';

  if (!nom || !prenom) return repondre({ message: 'Le nom et le prénom sont requis.' }, 400);
  if (mdp.length < MINIMUM_MOT_DE_PASSE) {
    return repondre(
      { message: `Le mot de passe doit faire au moins ${MINIMUM_MOT_DE_PASSE} caractères.` },
      400
    );
  }

  const admin = createClient(URL, CLE_SERVICE, { auth: { persistSession: false } });

  /* On demande d'abord, pour répondre proprement au cas ordinaire —
     quelqu'un rouvre l'écran après coup, ou tombe dessus par un lien
     gardé — sans rien réserver ni laisser de trace à annuler. */
  const { data: ouverte } = await admin.rpc('fondation_ouverte');
  if (ouverte !== true) {
    return repondre(
      {
        message:
          'L’inscription est fermée : le club a déjà son administrateur. ' +
          'Demandez-lui de vous créer un compte.'
      },
      403
    );
  }

  const { data: numero, error: eNum } = await admin.rpc('fonder_reserver');
  if (eNum || !numero) {
    /* Deux inscriptions parties en même temps : c'est ici que la
       seconde apprend qu'elle a perdu. */
    return repondre({ message: 'L’inscription vient d’être faite par quelqu’un d’autre.' }, 409);
  }

  const courriel = `${String(numero).toLowerCase()}@${DOMAINE}`;
  const { data: cree, error: eCompte } = await admin.auth.admin.createUser({
    email: courriel,
    password: mdp,
    email_confirm: true
  });

  if (eCompte || !cree?.user) {
    await admin.rpc('fonder_annuler');
    return repondre({ message: eCompte?.message ?? 'La création du compte a échoué.' }, 400);
  }

  const { error: eFiche } = await admin.rpc('fonder_poser', {
    p_numero: numero,
    p_nom: nom,
    p_prenom: prenom,
    p_compte: cree.user.id
  });

  if (eFiche) {
    /* Dans cet ORDRE : le compte de connexion part d'abord. Un compte
       sans fiche pourrait se connecter sans rôle et sans nom, et
       aucun écran de l'application ne permettrait de le retrouver. */
    await admin.auth.admin.deleteUser(cree.user.id);
    await admin.rpc('fonder_annuler');
    return repondre({ message: eFiche.message }, 400);
  }

  /* Le mot de passe n'est PAS renvoyé : c'est celui qu'on vient de
     taper, on le connaît déjà. Le numéro, si — c'est la base qui
     l'attribue, et c'est avec lui qu'on se connectera désormais. */
  return repondre({ numero });
});
