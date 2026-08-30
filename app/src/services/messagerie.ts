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
  /* Posé par la base à chaque correction — le déclencheur
     « figer_message » s'en charge, et interdit au passage de changer
     le salon, l'auteur et la date. Un message corrigé le DIT : sans
     cela, on pourrait réécrire ce qu'on a dit hier et prétendre
     l'avoir toujours dit. */
  modifie_le: string | null;
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
        .select(
          'id, texte, cree_le, modifie_le, supprime_le, auteur_id, profils:auteur_id ( nom, prenom )'
        )
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

/* Corriger son propre message. La règle d'accès « corriger mon
   message » existait depuis le premier jour et aucun écran ne s'en
   servait : une faute de frappe restait pour toujours.

   Ce que l'application n'a PAS à vérifier ici : que c'est bien le
   sien. La règle de la base le fait, et la refaire ici donnerait
   l'illusion que c'est l'application qui protège. */
export function useCorriger(salonId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, texte }: { id: string; texte: string }) => {
      const propre = texte.trim();
      if (!propre) throw new Error('Un message vide se retire, il ne s’enregistre pas.');
      const { error } = await supabase.from('messages').update({ texte: propre }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['messages', salonId] })
  });
}

/* Retirer son propre message. Suppression DOUCE, comme celle de la
   modération : la ligne reste, seule sa date de retrait est posée.
   Le fil garde donc la trace du retrait — « Message retiré » —
   plutôt que de faire disparaître un échange sans laisser d'indice,
   ce qui permettrait d'effacer la moitié d'une conversation et de
   rendre l'autre moitié incompréhensible. */
export function useRetirerMonMessage(salonId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ supprime_le: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['messages', salonId] });
      client.invalidateQueries({ queryKey: ['salons'] });
    }
  });
}

/* ------------------------------------------------------------
   Le journal d'accès.

   La table journal_acces et la fonction journaliser_acces()
   existaient — l'analyseur de sécurité signale même la seconde — et
   RIEN ne les appelait. Le club s'était donc doté d'un journal
   vide, ce qui est pire que pas de journal du tout : on croit
   pouvoir répondre à « qui a lu quoi » et l'on ne peut pas.

   Ce qui est consigné, et rien d'autre : l'OUVERTURE de l'espace
   des maîtres, là où se discutent les passages de grade et les
   difficultés d'un élève. Journaliser chaque salon ferait un
   registre de la vie de tout le monde, ce qui serait une atteinte à
   la vie privée déguisée en mesure de sécurité.

   L'échec est SILENCIEUX, et c'est voulu : le journal ne doit
   jamais empêcher un maître d'ouvrir sa messagerie.
   ------------------------------------------------------------ */
export function journaliser(salonId: string, quoi: string) {
  /* Le « .then » n'est pas décoratif, et le test l'a prouvé avant
     que le club ne s'en aperçoive : le constructeur de requête de
     supabase-js est PARESSEUX. Tant que personne ne réclame le
     résultat, rien ne part sur le réseau. Un simple appel, si
     naturel qu'il paraisse, aurait donc laissé le journal aussi
     vide qu'avant — en donnant l'illusion du contraire, ce qui est
     pire.

     L'échec, lui, reste silencieux : le journal ne doit jamais
     empêcher un maître d'ouvrir sa messagerie. */
  void supabase
    .rpc('journaliser_acces', { p_salon: salonId, p_quoi: quoi })
    .then(() => undefined, () => undefined);
}

/* ------------------------------------------------------------
   Ouvrir une conversation à deux.

   Passe par une fonction de la base, et non par un insert : créer
   un salon et y inscrire quelqu'un sont réservés à
   l'administration — c'est ce qui empêche un élève de s'inscrire
   tout seul dans l'espace des maîtres. La fonction ouvre une porte
   étroite : un salon DIRECT, entre l'appelant et une personne, et
   elle vérifie tout elle-même.

   Elle est idempotente : rappelée sur quelqu'un à qui l'on écrit
   déjà, elle rend le salon existant plutôt qu'un doublon.
   ------------------------------------------------------------ */
export function useOuvrirDirect() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (autreId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('ouvrir_direct', { p_autre: autreId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['salons'] });
      client.invalidateQueries({ queryKey: ['directs'] });
    }
  });
}

/* Qui est EN FACE, dans chaque conversation directe. Un salon
   direct n'a pas de titre en base : il porte le nom de l'autre, qui
   n'est pas le même pour les deux. */
export function useDirects() {
  return useQuery({
    queryKey: ['directs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mes_directs')
        .select('salon_id, autre_id, autre_nom, autre_prenom, autre_photo');
      if (error) throw error;
      const dico: Record<string, { nom: string; prenom: string; photo: string | null }> = {};
      for (const l of data as {
        salon_id: string; autre_nom: string; autre_prenom: string; autre_photo: string | null;
      }[]) {
        dico[l.salon_id] = { nom: l.autre_nom, prenom: l.autre_prenom, photo: l.autre_photo };
      }
      return dico;
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
