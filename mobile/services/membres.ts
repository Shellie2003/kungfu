/* ============================================================
   L'annuaire.

   Le seul endroit qui sait comment les membres se lisent. Les
   écrans reçoivent des données déjà mises en forme : le jour où
   une colonne change, on corrige ici.

   Ce que les règles d'accès garantissent déjà, et qu'on ne
   refiltre donc pas : un membre non connecté ne reçoit rien, et
   un élève ne voit que les fiches actives. Refiltrer ici
   donnerait l'illusion que c'est l'application qui protège.
   ============================================================ */
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Membre = {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  photo: string | null;
  grade: { nom: string; couleur: string; rang: number } | null;
};

/* Supabase rend la jointure comme un objet ou un tableau selon la
   forme de la requête. On normalise ici plutôt que dans l'écran. */
type LigneBrute = {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  photo: string | null;
  grades: { nom: string; couleur: string; rang: number } | null;
};

export async function lireMembres(): Promise<Membre[]> {
  const { data, error } = await supabase
    .from('profils')
    .select('id, numero, nom, prenom, photo, grades ( nom, couleur, rang )')
    /* Classé par grade, du plus élevé au plus bas, puis par nom.
       « Ito hoe classé par grade ito » — le club l'a demandé. */
    .order('rang', { referencedTable: 'grades', ascending: false })
    .order('nom', { ascending: true });

  if (error) throw error;

  return (data as unknown as LigneBrute[]).map((l) => ({
    id: l.id,
    numero: l.numero,
    nom: l.nom,
    prenom: l.prenom,
    photo: l.photo,
    grade: l.grades ?? null
  }));
}

export function useMembres() {
  return useQuery({ queryKey: ['membres'], queryFn: lireMembres });
}

/* La liste des grades, pour les filtres. Elle vient de la base :
   « Mety modifiena » — le club doit pouvoir la modifier sans
   nouvelle version de l'application. */
export type Grade = { id: string; nom: string; couleur: string; rang: number };

export function useGrades() {
  return useQuery({
    queryKey: ['grades'],
    queryFn: async (): Promise<Grade[]> => {
      const { data, error } = await supabase
        .from('grades')
        .select('id, nom, couleur, rang')
        .eq('actif', true)
        .order('rang');
      if (error) throw error;
      return data as Grade[];
    }
  });
}
