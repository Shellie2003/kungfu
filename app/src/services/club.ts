/* ============================================================
   Le club — horaires, réglages, albums.

   « Ny maître responsable koa moa zany mety hiova, dia à modifier
   daholo » : le responsable change, le téléphone change, l'adresse
   change, les jours d'entraînement changent. Rien de tout cela
   n'est écrit dans l'application ; tout vient de la base, et
   l'administration le corrige sans qu'une nouvelle version soit
   nécessaire.
   ============================================================ */
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Horaire = {
  id: string;
  jour: number;
  debut: string;
  fin: string;
  niveau: string | null;
  lieu: string | null;
};

const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const nomDuJour = (n: number) => JOURS[n] ?? '';

/* « 17:30:00 » venant de Postgres se lit « 17h30 » à Antananarivo. */
export const heure = (t: string) => t.slice(0, 5).replace(':', 'h');

export function useHoraires() {
  return useQuery({
    queryKey: ['horaires'],
    queryFn: async (): Promise<Horaire[]> => {
      const { data, error } = await supabase
        .from('horaires')
        .select('id, jour, debut, fin, niveau, lieu')
        .eq('actif', true)
        .order('jour')
        .order('debut');
      if (error) throw error;
      return data as Horaire[];
    }
  });
}

/* Les réglages arrivent en clé/valeur ; on les rend en dictionnaire,
   pour que l'écran écrive reglages.responsable et non une recherche
   dans un tableau. */
export function useReglages() {
  return useQuery({
    queryKey: ['reglages'],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from('reglages').select('cle, valeur');
      if (error) throw error;
      const dico: Record<string, string> = {};
      for (const r of data as { cle: string; valeur: string | null }[]) {
        if (r.valeur) dico[r.cle] = r.valeur;
      }
      return dico;
    }
  });
}

export type Album = {
  id: string;
  titre: string;
  categorie: string;
  photos: { id: string; chemin: string; legende: string | null }[];
};

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async (): Promise<Album[]> => {
      const { data, error } = await supabase
        .from('albums')
        .select('id, titre, categorie, photos ( id, chemin, legende, rang )')
        .order('cree_le', { ascending: false });
      if (error) throw error;
      type Ligne = Album & { photos: (Album['photos'][number] & { rang: number })[] };
      return (data as unknown as Ligne[]).map((a) => ({
        ...a,
        photos: [...a.photos].sort((x, y) => x.rang - y.rang)
      }));
    }
  });
}

/* Une photo est stockée dans un seau ; ce qui est en base n'est que
   son chemin. L'adresse publique se compose ici, pas dans l'écran. */
export function urlPhoto(seau: string, chemin: string | null): string | null {
  if (!chemin) return null;
  return supabase.storage.from(seau).getPublicUrl(chemin).data.publicUrl;
}
