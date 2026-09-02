/* ============================================================
   Les réactions à une image.

   « Une visualisation grande si on appuie sur une image, avec des
   boutons de réaction et téléchargement. »

   Une réaction porte sur une pièce jointe de conversation OU sur une
   photo d'album — deux tables différentes, une seule table de
   réactions, distinguées par « genre ». Voir la migration 0017, qui
   explique pourquoi une seule.

   UNE SEULE RÉACTION PAR PERSONNE ET PAR IMAGE. Appuyer sur « 👏 »
   quand on avait mis « 👍 » REMPLACE — c'est ce que font les
   messageries que le club connaît, et cela évite qu'une même
   personne empile six emoji sur la même photo. Appuyer sur celui
   qu'on a déjà le RETIRE.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useSession } from './session';

export type Genre = 'message' | 'photo';

export type Reaction = {
  id: string;
  emoji: string;
  profil_id: string;
  profils: { nom: string; prenom: string } | null;
};

/* Les six qu'on emploie vraiment sur une photo de club. Le choix
   complet de la messagerie en propose vingt-quatre ; ici on réagit
   d'un doigt, et une grille de vingt-quatre demanderait de viser. */
export const REACTIONS = ['👍', '👏', '🔥', '❤️', '😂', '💪'];

export function useReactions(genre: Genre, sujet: string | null | undefined) {
  return useQuery({
    queryKey: ['reactions', genre, sujet],
    enabled: Boolean(sujet),
    queryFn: async (): Promise<Reaction[]> => {
      const { data, error } = await supabase
        .from('reactions')
        .select('id, emoji, profil_id, profils ( nom, prenom )')
        .eq('genre', genre)
        .eq('sujet', sujet as string);
      if (error) throw error;
      return data as unknown as Reaction[];
    }
  });
}

/* Le compte par emoji, dans l'ordre où REACTIONS les propose : sans
   ordre fixe, les pastilles sautent de place à chaque nouvelle
   réaction et l'on appuie sur la mauvaise. */
export function compter(reactions: Reaction[] | undefined) {
  const par: Record<string, number> = {};
  for (const r of reactions ?? []) par[r.emoji] = (par[r.emoji] ?? 0) + 1;
  return REACTIONS.filter((e) => par[e]).map((e) => [e, par[e] as number] as const);
}

export const maReaction = (reactions: Reaction[] | undefined, moiId: string | undefined) =>
  reactions?.find((r) => r.profil_id === moiId)?.emoji ?? null;

export function useReagir(genre: Genre, sujet: string | null | undefined) {
  const client = useQueryClient();
  const moi = useSession((e) => e.profil);

  return useMutation({
    mutationFn: async (emoji: string) => {
      if (!sujet || !moi) throw new Error('Rien à quoi réagir.');

      /* Ce qu'on a déjà posé, s'il y a lieu. On le demande au serveur
         plutôt qu'au cache : deux téléphones peuvent avoir réagi
         entre-temps, et une réaction posée en double serait refusée
         par la contrainte d'unicité avec un message que personne ne
         comprendrait. */
      const { data: deja, error: eLire } = await supabase
        .from('reactions')
        .select('id, emoji')
        .eq('genre', genre)
        .eq('sujet', sujet)
        .eq('profil_id', moi.id)
        .maybeSingle();
      if (eLire) throw eLire;

      /* Le MÊME emoji : on retire. C'est ainsi qu'on annule, et il
         n'y a rien d'autre à apprendre. */
      if (deja?.emoji === emoji) {
        const { data, error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', deja.id)
          .select('id');
        if (error) throw error;
        /* ⚠ Sans « .select() », une suppression que les règles
           écartent revient sans erreur et l'écran retire la réaction
           qui est toujours en base. Cinquième occurrence de ce défaut
           dans ce projet ; on ne l'écrit plus sans. */
        if (!data?.length) throw new Error('Le serveur n’a pas retiré la réaction.');
        return;
      }

      /* Un AUTRE emoji : on remplace, on n'ajoute pas. */
      if (deja) {
        const { data, error } = await supabase
          .from('reactions')
          .update({ emoji })
          .eq('id', deja.id)
          .select('id');
        if (error) throw error;
        if (!data?.length) throw new Error('Le serveur n’a pas changé la réaction.');
        return;
      }

      const { data, error } = await supabase
        .from('reactions')
        .insert({ genre, sujet, profil_id: moi.id, emoji })
        .select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('Le serveur n’a pas enregistré la réaction.');
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['reactions', genre, sujet] });
    }
  });
}
