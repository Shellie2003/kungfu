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

/* ------------------------------------------------------------
   Une fiche.

   Les informations privées et les tuteurs sont demandés en même
   temps que la fiche. S'ils reviennent vides, ce n'est pas une
   erreur : c'est que les règles d'accès ne les accordent pas à qui
   regarde. L'écran s'en sert directement — il montre ce qu'il a
   reçu, il ne décide pas de ce qu'il a le droit de montrer.

   Ce partage est le cœur de la protection des mineurs : la date de
   naissance et le téléphone vivent dans une TABLE séparée, parce
   qu'une règle d'accès porte sur une ligne, jamais sur une colonne.
   ------------------------------------------------------------ */
export type Tuteur = {
  id: string;
  nom: string;
  lien: string;
  telephone: string | null;
  urgence: boolean;
};

export type Fiche = Membre & {
  debut: string | null;
  biographie: string | null;
  /* « notes » est la note interne de l'encadrement. Elle arrive par
     la même table privée, donc sous la même règle d'accès : un élève
     ne la reçoit pas, pas même la sienne. */
  prive: {
    date_naissance: string | null;
    telephone: string | null;
    adresse: string | null;
    notes: string | null;
  } | null;
  tuteurs: Tuteur[];
};

export function useFiche(id: string | undefined) {
  return useQuery({
    queryKey: ['fiche', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Fiche | null> => {
      const { data, error } = await supabase
        .from('profils')
        .select(
          `id, numero, nom, prenom, photo, debut, biographie,
           grades ( nom, couleur, rang ),
           profils_prives ( date_naissance, telephone, adresse, notes ),
           tuteurs ( id, nom, lien, telephone, urgence )`
        )
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const l = data as unknown as LigneBrute & {
        debut: string | null;
        biographie: string | null;
        profils_prives: Fiche['prive'] | Fiche['prive'][] | null;
        tuteurs: Tuteur[];
      };
      /* Supabase rend une relation un-à-un tantôt en objet, tantôt
         en tableau selon la forme de la requête. On normalise ici. */
      const prive = Array.isArray(l.profils_prives) ? (l.profils_prives[0] ?? null) : l.profils_prives;
      return {
        id: l.id,
        numero: l.numero,
        nom: l.nom,
        prenom: l.prenom,
        photo: l.photo,
        grade: l.grades ?? null,
        debut: l.debut,
        biographie: l.biographie,
        prive: prive ?? null,
        tuteurs: [...(l.tuteurs ?? [])].sort((a, b) => Number(b.urgence) - Number(a.urgence))
      };
    }
  });
}

/* Une date de Postgres, « 2006-03-14 », se lit « 14 mars 2006 ». */
export const dateFr = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
