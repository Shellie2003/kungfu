/* ============================================================
   La session, et le profil du membre connecté.

   Deux choses distinctes, et c'est le retour du client qui l'a
   imposé : le COMPTE (auth.users) et la FICHE (profils). Un membre
   peut avoir une fiche sans compte — tous les élèves n'ont pas de
   téléphone. L'inverse ne devrait pas arriver, mais s'il arrive on
   le traite plutôt que de planter.
   ============================================================ */
import { useEffect } from 'react';
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Role = 'eleve' | 'maitre' | 'admin';

export type Profil = {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  role: Role;
  grade_id: string | null;
  photo: string | null;
  /* Administrateur qui décide des rôles, suspend et supprime.
     Un DRAPEAU par-dessus le rôle, et non un quatrième rôle : un
     super administrateur EST un administrateur, plus ces pouvoirs.
     Voir la migration 0016, qui explique pourquoi — cinquante-quatre
     règles d'accès en dépendent. */
  super_admin: boolean;
};

type Etat = {
  session: Session | null;
  profil: Profil | null;
  /* « chargement » couvre le tout premier démarrage : tant qu'il
     est vrai, on ne sait pas encore si l'on est connecté, et
     rediriger serait faux dans un cas sur deux. */
  chargement: boolean;
  poser: (s: Session | null, p: Profil | null) => void;
};

export const useSession = create<Etat>((set) => ({
  session: null,
  profil: null,
  chargement: true,
  poser: (session, profil) => set({ session, profil, chargement: false })
}));

async function lireProfil(): Promise<Profil | null> {
  /* ⚠ LE FILTRE SUR « compte_id » N'EST PAS FACULTATIF, et son
     absence a été la panne la plus coûteuse du projet.

     Ce code disait, en commentaire : « les règles d'accès limitent
     déjà la réponse à ma propre fiche via compte_id ». C'était vrai
     au tout début, et c'est devenu FAUX le jour où l'annuaire est
     apparu : la règle « annuaire visible des membres » rend
     désormais TOUTES les fiches actives à tout membre connecté.

     « .single() » exige exactement une ligne. Elle en recevait
     quatre, rendait une erreur, et cette fonction rendait « null ».
     Le profil du connecté valait donc null POUR TOUT LE MONDE.

     Ce que cela cassait, sans le moindre message d'erreur :

       — envoyer un message. L'écran écrit « moi && envoi.mutate(…) » :
         sans profil, il n'envoie rien du tout et ne se plaint pas.
         C'est le « j'écris un message et il ne s'affiche pas » du
         club — le message n'était jamais parti.
       — le rôle. estAdmin(null) est faux : une administration ne se
         voyait pas comme telle, et l'application se comportait avec
         elle comme avec un inconnu.
       — la carte de membre, « Mon espace », l'assiduité, l'ouverture
         d'une conversation : tout ce qui a besoin de savoir QUI est
         connecté.

     Une seule cause, une dizaine de symptômes sans rapport apparent.
     Le filtre est donc explicite, et « maybeSingle » remplace
     « single » : zéro ligne est un cas normal — un compte créé dont
     la fiche n'est pas encore rattachée — pas une erreur. */
  const { data: session } = await supabase.auth.getUser();
  const compte = session.user?.id;
  if (!compte) return null;

  const { data, error } = await supabase
    .from('profils')
    .select('id, numero, nom, prenom, role, grade_id, photo, super_admin')
    .eq('compte_id', compte)
    .maybeSingle();
  if (error) return null;
  return (data as Profil) ?? null;
}

/* Branché une fois, à la racine. Écoute les changements de session
   — connexion, déconnexion, renouvellement du jeton — et garde le
   profil en regard. */
export function useEcouteSession() {
  const poser = useSession((e) => e.poser);

  useEffect(() => {
    let vivant = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!vivant) return;
      poser(data.session, data.session ? await lireProfil() : null);
    });

    const { data: abonnement } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!vivant) return;
      poser(session, session ? await lireProfil() : null);
    });

    return () => {
      vivant = false;
      abonnement.subscription.unsubscribe();
    };
  }, [poser]);
}

/* Raccourcis de lecture, pour ne pas répéter la condition partout. */
export const estMaitre = (p: Profil | null) => p?.role === 'maitre' || p?.role === 'admin';
export const estAdmin = (p: Profil | null) => p?.role === 'admin';

/* Ce que l'ÉCRAN cache. Ce n'est pas la protection — celle-ci est sur
   le serveur, dans la migration 0016 et dans la fonction déployée
   « comptes » — c'est la politesse : ne pas montrer un bouton qui
   mènerait à un refus, parce que la personne ne saurait pas si le
   fautif est elle ou l'application. */
export const estSuper = (p: Profil | null) => p?.super_admin === true;
