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


/* ------------------------------------------------------------
   Le journal d'accès.

   La note de sécurité livrée au club annonce le « journal des
   accès » comme l'un des trois moyens de tenir la confidentialité de
   l'espace des maîtres — avec le rôle et le filtre en base. Il
   s'écrit depuis peu ; personne ne pouvait le LIRE. Un journal qu'on
   ne consulte pas ne répond à aucune question, et donne l'illusion
   du contraire.

   La règle d'accès le réserve à l'administration, et il n'y a rien à
   refiltrer ici : c'est le serveur qui décide.
   ------------------------------------------------------------ */
export type Passage = {
  id: number;
  quoi: string;
  quand: string;
  membre: { nom: string; prenom: string; numero: string } | null;
  salon: { titre: string | null; type: string } | null;
};

type LignePassage = Omit<Passage, 'membre' | 'salon'> & {
  profils: Passage['membre'] | Passage['membre'][] | null;
  salons: Passage['salon'] | Passage['salon'][] | null;
};

const seul = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

export function useJournal(limite = 100) {
  return useQuery({
    queryKey: ['journal'],
    queryFn: async (): Promise<Passage[]> => {
      const { data, error } = await supabase
        .from('journal_acces')
        .select(
          `id, quoi, quand,
           profils:profil_id ( nom, prenom, numero ),
           salons:salon_id ( titre, type )`
        )
        .order('quand', { ascending: false })
        .limit(limite);
      if (error) throw error;
      return (data as unknown as LignePassage[]).map(({ profils, salons, ...p }) => ({
        ...p,
        membre: seul(profils),
        salon: seul(salons)
      }));
    }
  });
}

/* « il y a 3 minutes », « hier à 19h04 ». Un horodatage complet sur
   cent lignes se lit mal ; ce qu'on cherche dans un journal, c'est
   « quand, par rapport à maintenant ». */
export function quandLire(iso: string): string {
  const d = new Date(iso);
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 60 * 24) return `il y a ${Math.floor(minutes / 60)} h`;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });
}
