/* ============================================================
   Les catégories : la liste appartient au club.

   « Je veux que les catégories soient éditables, pas en dur ou en
   lecture uniquement. »

   Elles étaient à deux endroits, et mal aux deux :

   — les ACTUALITÉS lisaient une liste écrite dans l'écran de
     publication. En ajouter une demandait une nouvelle version de
     l'APK, donc une construction, donc moi.

   — les ALBUMS n'avaient aucune liste : la catégorie se tapait à la
     main à chaque création. « Compétition » et « Compétitions »
     devenaient deux rubriques distinctes, et le filtre du haut de
     l'écran en montrait autant que de fautes de frappe.

   C'est le raisonnement qui avait donné la table « grades » au
   premier jour — « la liste appartient au club, pas au code » — et
   que les catégories avaient manqué.
   ============================================================ */
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Genre = 'actualite' | 'album';

export type Categorie = {
  id: string;
  genre: Genre;
  nom: string;
  couleur: string;
  rang: number;
  actif: boolean;
};

/* Le vert du club : la couleur d'une catégorie que cette table ne
   connaît pas. Cela arrive, et ce n'est pas une anomalie — une
   actualité publiée sous une rubrique ensuite retirée garde son nom
   et doit rester lisible. */
export const VERT_DU_CLUB = '#12613C';

/* Toutes les catégories, les deux genres ensemble et les inactives
   comprises : l'écran de gestion en a besoin, et les actualités
   anciennes gardent la couleur d'une rubrique retirée.

   Une seule requête pour les deux genres. Deux requêtes coûteraient
   deux allers-retours sur la ligne d'Antananarivo pour une dizaine
   de lignes qui ne changent presque jamais. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    /* Elles changent une fois par an. Une heure de fraîcheur évite
       de les redemander à chaque ouverture d'écran, alors que le
       casier, l'accueil, l'album et la publication les lisent
       tous. */
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Categorie[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, genre, nom, couleur, rang, actif')
        .order('genre')
        .order('rang');
      if (error) throw error;
      return data as Categorie[];
    }
  });
}

/* Ce qu'on PROPOSE à la saisie : un genre, et seulement ce qui est
   actif. Une rubrique retirée cesse d'être offerte sans disparaître
   de ce qui l'employait déjà. */
export const proposees = (toutes: Categorie[] | undefined, genre: Genre) =>
  (toutes ?? []).filter((c) => c.genre === genre && c.actif);

/* ------------------------------------------------------------
   La teinte d'une catégorie : un trait, et un fond.

   Le fond n'est PAS demandé au club. Il se déduit du trait en le
   mélangeant à du blanc — réclamer deux couleurs qui s'accordent,
   c'est lui demander de faire notre travail, et c'est le meilleur
   moyen d'obtenir du rouge vif sur du bleu vif.

   Le calcul vivait auparavant dans un tableau écrit en dur qui ne
   contenait qu'UNE entrée : toutes les autres catégories tombaient
   sur le vert du club. Cinq pastilles vertes ne distinguent rien,
   ce qui était précisément le défaut.
   ------------------------------------------------------------ */
export function eclaircir(hex: string, part = 0.88): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  /* Une couleur illisible ne doit pas casser l'écran : on retombe
     sur le fond vert clair, qui va avec le vert du club. */
  if (!m) return '#E8F1EC';
  const n = parseInt(m[1] as string, 16);
  const melange = (c: number) => Math.round(c + (255 - c) * part);
  const r = melange((n >> 16) & 255);
  const v = melange((n >> 8) & 255);
  const b = melange(n & 255);
  return '#' + [r, v, b].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* [trait, fond]. La même paire partout : l'accueil et le casier
   montrent les mêmes actualités, et une couleur définie deux fois
   finit par différer — ce qui était le cas, vert à l'accueil et
   orange au casier pour la même ligne. */
export function teinter(
  toutes: Categorie[] | undefined,
  nom: string,
  genre: Genre = 'actualite'
): [string, string] {
  const trouvee = (toutes ?? []).find((c) => c.genre === genre && c.nom === nom);
  const trait = trouvee?.couleur ?? VERT_DU_CLUB;
  return [trait, eclaircir(trait)];
}
