/* ============================================================
   Le casier — actualités et notifications.

   Comme pour l'annuaire : ce sont les règles d'accès de la base
   qui décident de ce qui revient. Un brouillon non publié ne sort
   pas d'ici parce qu'une condition l'exclut au serveur, pas parce
   que l'écran l'a caché.
   ============================================================ */
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Actualite = {
  id: string;
  titre: string;
  categorie: string;
  texte: string;
  date_evt: string | null;
  lieu: string | null;
  image: string | null;
  cree_le: string;
};

export function useActualites() {
  return useQuery({
    queryKey: ['actualites'],
    queryFn: async (): Promise<Actualite[]> => {
      const { data, error } = await supabase
        .from('actualites')
        .select('id, titre, categorie, texte, date_evt, lieu, image, cree_le')
        .order('cree_le', { ascending: false });
      if (error) throw error;
      return data as Actualite[];
    }
  });
}

export function useActualite(id: string | undefined) {
  return useQuery({
    queryKey: ['actualite', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Actualite | null> => {
      const { data, error } = await supabase
        .from('actualites')
        .select('id, titre, categorie, texte, date_evt, lieu, image, cree_le')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as Actualite | null;
    }
  });
}

export type Notification = {
  id: string;
  titre: string;
  texte: string | null;
  vers: string | null;
  lue_le: string | null;
  cree_le: string;
};

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, titre, texte, vers, lue_le, cree_le')
        .order('cree_le', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    }
  });
}

export async function toutMarquerLu() {
  const { error } = await supabase
    .from('notifications')
    .update({ lue_le: new Date().toISOString() })
    .is('lue_le', null);
  if (error) throw error;
}

/* ------------------------------------------------------------
   Les catégories du casier viennent des actualités elles-mêmes.

   Le club en invente : « Cérémonie » n'était pas prévue et elle
   existe. Une liste écrite dans l'application obligerait à une
   nouvelle version à chaque idée.
   ------------------------------------------------------------ */
export function categories(liste: Actualite[]): string[] {
  return [...new Set(liste.map((a) => a.categorie))].sort((a, b) => a.localeCompare(b, 'fr'));
}

/* Une seule façon d'écrire les dates dans toute l'application. */
const MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

export function jourEtMois(iso: string): { jour: string; mois: string } {
  const d = new Date(iso);
  return { jour: String(d.getDate()).padStart(2, '0'), mois: MOIS[d.getMonth()] ?? '' };
}

export function dateLongue(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/* « Il y a 2 h », « Hier », « Il y a 3 j ». Au-delà d'une semaine
   la date exacte redevient plus parlante qu'un compte de jours. */
export function depuis(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `Il y a ${Math.max(1, minutes)} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours === 1) return 'Hier';
  if (jours < 8) return `Il y a ${jours} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ------------------------------------------------------------
   La teinte d'une catégorie.

   Ici, et non dans un écran : l'accueil et le casier montrent les
   mêmes actualités, et une couleur définie deux fois finit par
   différer — ce qui était le cas, vert à l'accueil et orange au
   casier pour la même ligne.

   Les catégories que le club invente tombent sur le vert du club :
   mieux qu'une couleur tirée au hasard, et toujours lisible.
   ------------------------------------------------------------ */
const TEINTES: Record<string, [string, string]> = {
  'Changement d\u2019horaire': ['#B0530F', '#FBEEE2']
};

export const teinte = (categorie: string): [string, string] =>
  TEINTES[categorie] ?? ['#12613C', '#E8F1EC'];
