/* ============================================================
   La messagerie, et l'espace des maîtres.

   Point important, et c'est ce qui rend la confidentialité tenable :
   l'espace des maîtres n'est PAS un cas particulier. C'est un salon
   ordinaire, de type « maitres », auquel un élève n'appartient pas.
   Il ne revient donc pas dans la liste ci-dessous, et ses messages
   ne sont jamais transmis à son téléphone — non parce que l'écran
   les cache, mais parce que la base ne les envoie pas.

   Une conséquence à garder en tête : il n'y a pas de code spécial à
   oublier de protéger le jour où l'on ajoutera un écran.
   ============================================================ */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from './supabase';

export type TypeSalon = 'club' | 'grade' | 'evenement' | 'direct' | 'maitres';

export type Salon = {
  id: string;
  type: TypeSalon;
  titre: string | null;
  couleur: string | null;
  dernier_le: string;
  dernier: { texte: string; auteur: string | null } | null;
  nonlus: number;
};

type LigneSalon = {
  id: string;
  type: TypeSalon;
  titre: string | null;
  couleur: string | null;
  dernier_le: string;
  membres_salon: { lu_le: string | null }[];
  messages: { texte: string; cree_le: string; profils: { nom: string; prenom: string } | null }[];
};

export function useSalons() {
  return useQuery({
    queryKey: ['salons'],
    queryFn: async (): Promise<Salon[]> => {
      const { data, error } = await supabase
        .from('salons')
        .select(
          `id, type, titre, couleur, dernier_le,
           membres_salon ( lu_le ),
           messages ( texte, cree_le, profils:auteur_id ( nom, prenom ) )`
        )
        .eq('archive', false)
        .order('dernier_le', { ascending: false })
        /* Un seul message par salon : celui qu'on affiche en aperçu.
           Tout charger pour n'en montrer qu'un serait payer la liste
           entière à chaque ouverture de l'écran. */
        .order('cree_le', { referencedTable: 'messages', ascending: false })
        .limit(1, { referencedTable: 'messages' });
      if (error) throw error;

      return (data as unknown as LigneSalon[]).map((s) => {
        const m = s.messages[0];
        /* membres_salon ne contient que MA ligne : la règle d'accès
           ne rend les autres qu'aux maîtres. Le non-lu se calcule
           donc sur elle, sans risque de lire celle d'un autre. */
        const lu = s.membres_salon[0]?.lu_le ?? null;
        const nonlus = m && (!lu || m.cree_le > lu) ? 1 : 0;
        return {
          id: s.id,
          type: s.type,
          titre: s.titre,
          couleur: s.couleur,
          dernier_le: s.dernier_le,
          dernier: m
            ? { texte: m.texte, auteur: m.profils ? `${m.profils.nom} ${m.profils.prenom}` : null }
            : null,
          nonlus
        };
      });
    }
  });
}

export type Message = {
  id: string;
  texte: string;
  cree_le: string;
  supprime_le: string | null;
  auteur_id: string;
  auteur: { nom: string; prenom: string } | null;
};

type LigneMessage = Omit<Message, 'auteur'> & { profils: { nom: string; prenom: string } | null };

export function useMessages(salonId: string | undefined) {
  const client = useQueryClient();

  /* Le temps réel n'est pas un confort : sans lui, deux personnes
     dans la même salle croient s'être écrit dans le vide. On écoute
     les insertions du salon ouvert, et rien d'autre. */
  useEffect(() => {
    if (!salonId) return;
    const canal = supabase
      .channel(`salon:${salonId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `salon_id=eq.${salonId}` },
        () => {
          client.invalidateQueries({ queryKey: ['messages', salonId] });
          client.invalidateQueries({ queryKey: ['salons'] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [salonId, client]);

  return useQuery({
    queryKey: ['messages', salonId],
    enabled: Boolean(salonId),
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, texte, cree_le, supprime_le, auteur_id, profils:auteur_id ( nom, prenom )')
        .eq('salon_id', salonId!)
        .order('cree_le', { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data as unknown as LigneMessage[]).map(({ profils, ...m }) => ({
        ...m,
        auteur: profils
      }));
    }
  });
}

export function useEnvoyer(salonId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ texte, auteurId }: { texte: string; auteurId: string }) => {
      const { error } = await supabase
        .from('messages')
        .insert({ salon_id: salonId, auteur_id: auteurId, texte });
      if (error) throw error;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['messages', salonId] });
      client.invalidateQueries({ queryKey: ['salons'] });
    }
  });
}

export function useSalon(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon', salonId],
    enabled: Boolean(salonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('id, type, titre, couleur')
        .eq('id', salonId!)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; type: TypeSalon; titre: string | null; couleur: string | null } | null;
    }
  });
}

/* Le club compte des mineurs : la modération n'est pas une option.
   Un signalement est un enregistrement, pas un courriel — il reste
   consultable par l'administration et par les maîtres. */
export function useSignaler() {
  return useMutation({
    mutationFn: async ({
      messageId,
      auteurId,
      motif
    }: {
      messageId: string;
      auteurId: string;
      motif: string;
    }) => {
      const { error } = await supabase
        .from('signalements')
        .insert({ message_id: messageId, auteur_id: auteurId, motif });
      if (error) throw error;
    }
  });
}

export async function marquerLu(salonId: string, profilId: string) {
  await supabase
    .from('membres_salon')
    .update({ lu_le: new Date().toISOString() })
    .eq('salon_id', salonId)
    .eq('profil_id', profilId);
}

/* Deux lettres pour une vignette de salon : « Tout le club » → TC.
   Un salon direct n'en a pas — il porte le portrait de la personne. */
export function initiales(titre: string): string {
  const mots = titre.trim().split(/\s+/);
  if (mots.length === 1) return (mots[0] ?? '').slice(0, 2).toUpperCase();
  return ((mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? '')).toUpperCase();
}

export function heureCourte(iso: string): string {
  const d = new Date(iso);
  const jours = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (jours < 1) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (jours < 2) return 'Hier';
  if (jours < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
