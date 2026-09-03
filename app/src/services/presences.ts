/* ============================================================
   Les présences.

   La carte de membre annonçait le pointage depuis le premier jour —
   « présenté à l'entraînement pour pointer la présence » — et il
   n'existait ni table, ni écran, ni scanner.

   Ce que l'application NE décide pas, et c'est important : qui a le
   droit de pointer. La fonction pointer_presence() de la base le
   vérifie elle-même, refuse un matricule inconnu et refuse un membre
   inactif. Refaire ces contrôles ici donnerait l'illusion que c'est
   l'application qui protège — alors qu'on peut parler à la base
   directement, sans elle.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { assure } from './ecrire';

export type Statut = 'present' | 'retard' | 'excuse';

export const LIBELLE: Record<Statut, string> = {
  present: 'Présent',
  retard: 'En retard',
  excuse: 'Excusé'
};

/* Vert pour présent, orange pour un retard, gris pour une absence
   annoncée : la couleur doit se lire d'un coup d'œil sur une feuille
   de trente lignes. Elle ne dit jamais rien SEULE — le libellé est
   toujours écrit à côté, pour qui distingue mal les couleurs. */
export const teinteStatut = (s: Statut): [string, string] =>
  s === 'present' ? ['#12613C', '#E4F0E9']
  : s === 'retard' ? ['#B0530F', '#FBEEE2']
  : ['#59685F', '#EDF1EE'];

export type Presence = {
  id: string;
  seance_le: string;
  statut: Statut;
  horaire_id: string | null;
  membre: { id: string; nom: string; prenom: string; numero: string } | null;
};

type Ligne = Omit<Presence, 'membre'> & {
  profils: Presence['membre'] | Presence['membre'][] | null;
};

const enPresence = (l: Ligne): Presence => {
  const { profils, ...reste } = l;
  return { ...reste, membre: Array.isArray(profils) ? (profils[0] ?? null) : profils };
};

const CHAMPS = 'id, seance_le, statut, horaire_id, profils:profil_id ( id, nom, prenom, numero )';

/* La feuille d'une séance. « jour » est une date au format ISO — le
   même que rend un champ de saisie de type date, pour qu'aucune
   conversion ne traîne entre l'écran et la base. */
export function usePresencesDuJour(jour: string) {
  return useQuery({
    queryKey: ['presences', jour],
    queryFn: async (): Promise<Presence[]> => {
      const { data, error } = await supabase
        .from('presences')
        .select(CHAMPS)
        .eq('seance_le', jour)
        .order('cree_le');
      if (error) throw error;
      return (data as unknown as Ligne[]).map(enPresence);
    }
  });
}

/* L'historique d'un membre. Les règles d'accès font le tri : chacun
   ne reçoit que la sienne, l'encadrement reçoit celle de tous. On ne
   refiltre donc pas ici. */
export function useMesPresences(profilId: string | undefined, limite = 40) {
  return useQuery({
    queryKey: ['mes-presences', profilId],
    enabled: Boolean(profilId),
    queryFn: async (): Promise<Presence[]> => {
      const { data, error } = await supabase
        .from('presences')
        .select(CHAMPS)
        .eq('profil_id', profilId!)
        .order('seance_le', { ascending: false })
        .limit(limite);
      if (error) throw error;
      return (data as unknown as Ligne[]).map(enPresence);
    }
  });
}

/* Pointer, par matricule. C'est ce que rend le code QR de la carte,
   et c'est aussi ce qu'on tape quand la caméra ne veut rien savoir. */
export function usePointer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matricule,
      horaireId = null,
      statut = 'present'
    }: {
      matricule: string;
      horaireId?: string | null;
      statut?: Statut;
    }) => {
      const { data, error } = await supabase.rpc('pointer_presence', {
        p_matricule: matricule.trim(),
        p_horaire: horaireId,
        p_statut: statut
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['presences'] });
      client.invalidateQueries({ queryKey: ['mes-presences'] });
    }
  });
}

/* Effacer un pointage : on s'est trompé de personne, ou l'on a lu
   deux cartes à la suite. Une présence n'est pas une écriture
   comptable — la corriger le jour même est normal. */
export function useDepointer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: ecrit1, error } = await supabase.from('presences').delete().eq('id', id)
        .select('id');
      if (error) throw error;
      assure(ecrit1, 'retiré cette présence');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['presences'] })
  });
}

/* ------------------------------------------------------------
   Le compte des séances d'un membre, sur les douze derniers mois.

   Il sert au passage de grade, et c'est la seule raison pour
   laquelle le club tient ces registres. Le calcul est ici, à un seul
   endroit, plutôt que dans chaque écran qui voudrait l'afficher.
   ------------------------------------------------------------ */
export function bilan(presences: Presence[]) {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 1);
  const recentes = presences.filter((p) => new Date(p.seance_le) >= limite);
  return {
    total: recentes.length,
    present: recentes.filter((p) => p.statut === 'present').length,
    retard: recentes.filter((p) => p.statut === 'retard').length,
    excuse: recentes.filter((p) => p.statut === 'excuse').length
  };
}

/* « 2026-08-30 » se lit « samedi 30 août ». Le jour de la semaine
   compte : on se souvient d'un mardi, pas d'un 30. */
export function jourLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* La date du jour au format que la base et les champs « date »
   attendent tous les deux. « toISOString » donnerait la veille en
   fin de journée à Antananarivo : il convertit vers UTC, et
   Madagascar est à UTC+3. */
export function aujourdhui(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
