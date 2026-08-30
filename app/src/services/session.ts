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
  const { data, error } = await supabase
    .from('profils')
    .select('id, numero, nom, prenom, role, grade_id, photo')
    .single();
  /* Les règles d'accès limitent déjà la réponse à ma propre fiche
     via compte_id : inutile de refiltrer ici, et le faire donnerait
     l'illusion que c'est l'application qui protège. */
  if (error) return null;
  return data as Profil;
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
