/* ============================================================
   La modération.

   « Le club compte des mineurs : la modération n'est pas une
   option. » L'application le dit à l'écran de messagerie ; encore
   faut-il que quelqu'un puisse agir.

   Qui peut : les maîtres et l'administration, par la règle « les
   maîtres traitent les signalements ». Un élève ne reçoit que les
   siens — ce qui est exact, et sans danger.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Signalement = {
  id: string;
  motif: string;
  cree_le: string;
  traite_le: string | null;
  suite: string | null;
  auteur: { nom: string; prenom: string } | null;
  message: {
    id: string;
    texte: string;
    supprime_le: string | null;
    auteur: { nom: string; prenom: string } | null;
  } | null;
};

type Ligne = Omit<Signalement, 'auteur' | 'message'> & {
  profils: { nom: string; prenom: string } | null;
  messages: {
    id: string;
    texte: string;
    supprime_le: string | null;
    profils: { nom: string; prenom: string } | null;
  } | null;
};

export function useSignalements(traites: boolean) {
  return useQuery({
    queryKey: ['signalements', traites],
    queryFn: async (): Promise<Signalement[]> => {
      let requete = supabase
        .from('signalements')
        .select(
          `id, motif, cree_le, traite_le, suite,
           profils:auteur_id ( nom, prenom ),
           messages:message_id ( id, texte, supprime_le, profils:auteur_id ( nom, prenom ) )`
        )
        .order('cree_le', { ascending: false })
        .limit(100);

      /* Deux listes plutôt qu'une : un signalement traité reste
         consultable — le club doit pouvoir expliquer sa décision
         trois mois plus tard — mais il n'encombre pas ce qui reste
         à faire. */
      requete = traites ? requete.not('traite_le', 'is', null) : requete.is('traite_le', null);

      const { data, error } = await requete;
      if (error) throw error;

      return (data as unknown as Ligne[]).map(({ profils, messages, ...s }) => ({
        ...s,
        auteur: profils,
        message: messages
          ? {
              id: messages.id,
              texte: messages.texte,
              supprime_le: messages.supprime_le,
              auteur: messages.profils
            }
          : null
      }));
    }
  });
}

function useTraiter() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, parId, suite
    }: { id: string; parId: string; suite: string }) => {
      const { error } = await supabase
        .from('signalements')
        .update({ traite_le: new Date().toISOString(), traite_par: parId, suite })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['signalements'] })
  });
}

export const useClasser = useTraiter;

export function useMasquerMessage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId, signalementId, parId
    }: { messageId: string; signalementId: string; parId: string }) => {
      /* Suppression DOUCE : la ligne reste, seule sa date de retrait
         est posée. Le club garde de quoi expliquer sa décision à un
         parent, et de quoi revenir dessus si le signalement était
         abusif. Un message effacé ne se défend pas.

         L'ordre compte : on masque d'abord. Si le second appel
         échoue, le message est retiré et le signalement reste à
         traiter — visible, donc rattrapable. L'inverse laisserait un
         signalement classé sur un message toujours affiché. */
      const { error } = await supabase
        .from('messages')
        .update({ supprime_le: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;

      const { error: eSignal } = await supabase
        .from('signalements')
        .update({
          traite_le: new Date().toISOString(),
          traite_par: parId,
          suite: 'Message retiré'
        })
        .eq('id', signalementId);
      if (eSignal) throw eSignal;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['signalements'] });
      client.invalidateQueries({ queryKey: ['messages'] });
    }
  });
}

/* Combien de signalements attendent. Sert la pastille de l'écran de
   messagerie : sans elle, il faudrait penser à aller regarder. */
export function useSignalementsEnAttente(actif: boolean) {
  return useQuery({
    queryKey: ['signalements', 'attente'],
    enabled: actif,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('signalements')
        .select('id', { count: 'exact', head: true })
        .is('traite_le', null);
      if (error) throw error;
      return count ?? 0;
    }
  });
}
