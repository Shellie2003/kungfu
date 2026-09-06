/* ============================================================
   Le client Supabase, et la connexion par numéro matricule.

   Un seul client pour toute l'application. Les écrans ne
   l'importent pas directement : ils passent par les dépôts de
   services/, pour qu'une règle qui change se corrige à un endroit.
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

export const ADRESSE = import.meta.env.VITE_SUPABASE_URL;
const URL = ADRESSE;
const CLE = import.meta.env.VITE_SUPABASE_CLE;

if (!URL || !CLE) {
  /* Mieux vaut échouer au démarrage, avec un message clair, que de
     laisser chaque requête retourner une erreur incompréhensible. */
  throw new Error(
    'VITE_SUPABASE_URL ou VITE_SUPABASE_CLE manquante. ' +
    'Copiez app/.env.example en app/.env et remplissez les deux valeurs.'
  );
}

/* Où dort le jeton de session
   ---------------------------
   Dans Capacitor, la page tourne dans la WebView de l'application :
   son stockage local est un fichier du dossier privé de
   l'application, qu'aucune autre application ne peut lire sur un
   téléphone ordinaire. C'est le même niveau de protection que
   @capacitor/preferences, qui n'est pas chiffré non plus.

   Ce que cela ne protège pas : un téléphone rooté, ou une
   sauvegarde extraite. Dit franchement, parce que la version
   React Native employait le coffre chiffré d'Android et que le
   changement est réel. Ce qui protège vraiment les données du
   club, c'est que le jeton ne donne accès qu'à ce que les règles
   de la base autorisent — un jeton d'élève volé ne montre rien de
   plus qu'un élève.

   Deux conséquences prises en compte : la session dure peu et se
   renouvelle, et l'espace des maîtres n'est jamais transmis à un
   téléphone qui n'a pas le rôle. */
export const supabase = createClient(URL, CLE, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    /* Pas de lecture de l'URL : l'application n'a pas de
       redirection de navigateur à interpréter. */
    detectSessionInUrl: false
  }
});

/* ------------------------------------------------------------
   Connexion par numéro matricule.

   Le service d'authentification travaille par courriel ou par
   téléphone, jamais par matricule. On compose donc une adresse à
   partir du numéro : F04x042 devient f04x042@waishi.local. Cette
   adresse n'est jamais envoyée ni affichée — c'est un identifiant,
   pas un moyen de contact.

   Conséquence assumée : pas de réinitialisation par courriel. Un
   membre qui oublie son mot de passe s'adresse à l'administration,
   qui le réinitialise depuis son écran.
   ------------------------------------------------------------ */
const DOMAINE = 'waishi.local';

export const identifiantDepuisMatricule = (matricule: string) =>
  `${matricule.trim().toLowerCase()}@${DOMAINE}`;

/* Le club écrit « F04x042 » ; les membres taperont « f04x 042 »,
   « F04X042 », ou colleront un espace. On normalise avant de
   composer l'adresse, sinon la connexion échoue sur une casse. */
export function normaliserMatricule(saisie: string): string {
  return saisie.replace(/\s+/g, '').toUpperCase();
}

export type ResultatConnexion = { ok: true } | { ok: false; message: string };

export async function seConnecter(
  matricule: string,
  motDePasse: string
): Promise<ResultatConnexion> {
  const numero = normaliserMatricule(matricule);
  if (!numero) return { ok: false, message: 'Entrez votre numéro de membre.' };
  if (!motDePasse) return { ok: false, message: 'Entrez votre mot de passe.' };

  const { error } = await supabase.auth.signInWithPassword({
    email: identifiantDepuisMatricule(numero),
    password: motDePasse
  });

  if (!error) return { ok: true };

  /* Les messages du service sont en anglais et techniques. On les
     traduit en une phrase que le club comprend — sans dire lequel
     des deux champs est faux, ce qui aiderait à deviner un numéro. */
  if (error.message.includes('Invalid login credentials')) {
    return { ok: false, message: 'Numéro de membre ou mot de passe incorrect.' };
  }
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return { ok: false, message: 'Pas de connexion. Réessayez une fois le réseau revenu.' };
  }
  return { ok: false, message: 'La connexion a échoué. Prévenez l’administration du club.' };
}

export async function seDeconnecter() {
  await supabase.auth.signOut();
}
