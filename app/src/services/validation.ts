/* ============================================================
   Valider les inscriptions à une sortie.

   « Ajouter un écran pour visualiser les participations en attente
   d'une validation, et seul l'admin qui a créé la sortie qui peut le
   voir et valider. »

   ------------------------------------------------------------
   CE QUI PROTÈGE VRAIMENT N'EST PAS ICI

   Ce fichier ne fait que demander. Trois choses, sur le SERVEUR,
   décident (migration 0020) :

     · une règle d'accès : seul l'auteur de la sortie peut mettre à
       jour les inscriptions qui la concernent ;
     · un déclencheur : personne d'autre que lui ne touche aux
       colonnes de décision — pas même le membre inscrit, qui a par
       ailleurs le droit de corriger SA ligne et se validerait donc
       lui-même en une requête ;
     · une règle de lecture resserrée : chacun voit la sienne,
       l'auteur voit celles de sa sortie, l'administration voit tout.

   L'écran ne fait que ne pas proposer ce qui serait refusé.

   ------------------------------------------------------------
   POURQUOI « auteur_id » EST DIGNE DE CONFIANCE

   Un déclencheur BEFORE INSERT le force à l'identité de l'appelant :
   le téléphone ne l'envoie pas et ne peut pas le falsifier. Et il ne
   se déclenche pas à la mise à jour, donc corriger une actualité n'en
   transfère pas la paternité. Vérifié avant d'écrire ce fichier — la
   règle demandée n'aurait rien voulu dire sans ces deux propriétés.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { assure } from './ecrire';
import { useSession } from './session';

export type EnAttente = {
  id: string;
  actualite_id: string;
  accompagnants: number;
  montant_promis: number | null;
  note: string | null;
  cree_le: string;
  membre: { nom: string; prenom: string; numero: string } | null;
  sortie: { titre: string; date_evt: string | null } | null;
};

type Ligne = Omit<EnAttente, 'membre' | 'sortie'> & {
  profils: { nom: string; prenom: string; numero: string } | null;
  actualites: { titre: string; date_evt: string | null } | null;
};

/* Les inscriptions QUE JE DOIS TRAITER : celles des sorties dont je
   suis l'auteur, et qui ne sont ni validées ni refusées.

   Le filtre sur l'auteur est écrit ICI en plus de la règle d'accès.
   Ce n'est pas de la méfiance envers le serveur — c'est que la règle
   laisse aussi passer l'administration, qui doit pouvoir pointer les
   versements de toutes les sorties. Sans ce filtre, un administrateur
   verrait dans SA file d'attente des inscriptions qu'il n'a pas le
   droit de valider, et le bouton échouerait. */
export function useAValider() {
  const moi = useSession((e) => e.profil);

  return useQuery({
    queryKey: ['a-valider', moi?.id],
    enabled: Boolean(moi?.id),
    queryFn: async (): Promise<EnAttente[]> => {
      const { data, error } = await supabase
        .from('participations')
        .select(
          `id, actualite_id, accompagnants, montant_promis, note, cree_le,
           profils:profil_id ( nom, prenom, numero ),
           actualites!inner ( titre, date_evt, auteur_id )`
        )
        .is('valide_le', null)
        .is('refuse_le', null)
        .eq('actualites.auteur_id', moi!.id)
        .order('cree_le');
      if (error) throw error;
      return (data as unknown as Ligne[]).map(({ profils, actualites, ...p }) => ({
        ...p,
        membre: profils,
        sortie: actualites
      }));
    }
  });
}

/* Combien attendent. Sert la pastille de l'écran d'administration :
   une file d'attente qu'il faut penser à ouvrir est une file
   d'attente qui ne se vide pas. */
export function useNombreAValider() {
  const { data } = useAValider();
  return data?.length ?? 0;
}

export function useTrancher() {
  const client = useQueryClient();
  const moi = useSession((e) => e.profil);

  return useMutation({
    mutationFn: async ({
      id,
      accepter,
      motif
    }: {
      id: string;
      accepter: boolean;
      motif?: string;
    }) => {
      const maintenant = new Date().toISOString();
      const { data, error } = await supabase
        .from('participations')
        .update(
          accepter
            ? { valide_le: maintenant, valide_par: moi?.id ?? null, refuse_le: null, motif: null }
            : { refuse_le: maintenant, valide_par: moi?.id ?? null, valide_le: null,
                motif: motif?.trim() || null }
        )
        .eq('id', id)
        .select('id');
      if (error) throw error;
      /* Zéro ligne = le serveur a refusé. C'est le cas ordinaire ici
         si l'on n'est pas l'auteur de la sortie, et il doit se LIRE
         plutôt que de passer pour un succès. */
      assure(data, accepter ? 'validé cette inscription' : 'refusé cette inscription');
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['a-valider'] });
      void client.invalidateQueries({ queryKey: ['participations'] });
      void client.invalidateQueries({ queryKey: ['participation'] });
    }
  });
}
