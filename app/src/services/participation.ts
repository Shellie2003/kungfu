/* ============================================================
   Je participe — inscription à une sortie, et versements.

   Une limite à garder en tête, et qui est dite à l'écran :
   l'application n'envoie pas d'argent. Elle compose le code MVola
   et ouvre le clavier ; c'est la personne qui appuie sur appeler.
   Elle ne sait pas non plus si le transfert a réussi — c'est le
   club qui pointe ce qu'il a reçu, et c'est pour cela que seule
   l'administration peut inscrire un versement.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { assure } from './ecrire';

export type Participation = {
  id: string;
  accompagnants: number;
  montant_promis: number | null;
  /* Un mot laissé au club en s'inscrivant : « j'arrive après le
     travail », « je viens avec ma sœur qui n'est pas membre ». La
     colonne existait et rien ne l'écrivait ; les gens le disaient
     donc de vive voix, et cela se perdait. */
  note: string | null;
  /* Où en est la demande. Nuls tous les deux = EN ATTENTE, ce qui est
     l'état de départ de toute inscription.

     Le membre doit le voir : une validation que seul l'organisateur
     connaît n'est pas une validation, c'est une décision privée. On
     s'inscrit à une sortie et l'on veut savoir si l'on part. */
  valide_le: string | null;
  refuse_le: string | null;
  /* Le motif du refus, écrit par l'organisateur. Facultatif — mais
     quand il existe, il est ce qui évite d'aller demander pourquoi
     au bord du tapis. */
  motif: string | null;
  versements: { id: string; montant: number; recu_le: string }[];
};

export function useParticipation(actualiteId: string | undefined, profilId: string | undefined) {
  return useQuery({
    queryKey: ['participation', actualiteId, profilId],
    enabled: Boolean(actualiteId && profilId),
    queryFn: async (): Promise<Participation | null> => {
      const { data, error } = await supabase
        .from('participations')
        .select(
          `id, accompagnants, montant_promis, note, valide_le, refuse_le, motif,
           versements ( id, montant, recu_le )`
        )
        .eq('actualite_id', actualiteId!)
        .eq('profil_id', profilId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = data as unknown as Participation;
      return {
        ...p,
        versements: [...p.versements].sort((a, b) => b.recu_le.localeCompare(a.recu_le))
      };
    }
  });
}

export function useInscrire(actualiteId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profilId,
      accompagnants,
      montantPromis,
      note
    }: {
      profilId: string;
      accompagnants: number;
      montantPromis: number | null;
      note?: string | null;
    }) => {
      const { data: ecrit1, error } = await supabase.from('participations').upsert(
        {
          actualite_id: actualiteId,
          profil_id: profilId,
          accompagnants,
          montant_promis: montantPromis,
          note: note?.trim() || null
        },
        { onConflict: 'actualite_id,profil_id' }
      )
      .select('id');
      if (error) throw error;
      assure(ecrit1, 'enregistré votre participation');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['participation'] })
  });
}

/* Le code USSD de MVola, tel qu'il se compose sur un téléphone
   malgache. Le numéro du club est un réglage : il change de main
   comme le reste. */
export function codeMvola(numero: string, montant: number): string {
  return `#111*1*2*${numero}*${montant}#`;
}

/* « 10 000 Ar », avec l'espace insécable qui empêche le nombre de
   se couper en fin de ligne. */
export const ariary = (n: number) => `${n.toLocaleString('fr-FR').replace(/ | | /g, ' ')} Ar`;
