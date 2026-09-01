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
  /* Le chemin de la photo qui représente l'album. Nulle tant que le
     club n'a rien choisi : l'écran prend alors la première, ce qui
     est presque toujours la bonne — et « presque » est la raison
     pour laquelle la colonne existe. */
  couverture: string | null;
  /* « rang » est conservé : l'écran d'administration en a besoin
     pour échanger deux photos, et le recalculer depuis la position
     dans le tableau se tromperait dès qu'une photo est retirée. */
  photos: { id: string; chemin: string; legende: string | null; rang: number }[];
};

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async (): Promise<Album[]> => {
      const { data, error } = await supabase
        .from('albums')
        .select('id, titre, categorie, couverture, photos ( id, chemin, legende, rang )')
        .order('cree_le', { ascending: false });
      if (error) throw error;
      return (data as unknown as Album[]).map((a) => ({
        ...a,
        photos: [...a.photos].sort((x, y) => x.rang - y.rang)
      }));
    }
  });
}

/* L'adresse d'une photo ne se compose plus ici : les seaux sont
   privés et il faut une adresse SIGNÉE, que seul le serveur délivre.
   Voir services/stockage.ts — et surtout useUrls(), qui les demande
   en lot plutôt qu'une par une. */

/* ---------------------------------------------- Les valeurs du club

   Elles étaient ÉCRITES DANS L'ÉCRAN, avec ce commentaire : « elles
   ne changent pas, et les mettre en base aurait donné un écran
   d'administration de plus pour rien ».

   Le club a demandé de pouvoir les changer. Ce n'est pas un caprice :
   ces trois lignes sont ce que le club dit de lui-même, et c'est
   justement le genre de texte qu'on veut retoucher après l'avoir vu
   en vrai sur un téléphone. Ce que la remarque d'origine visait —
   ne pas ajouter un écran pour si peu — reste vrai, et c'est
   pourquoi elles s'éditent SUR l'écran du Club, sans en ouvrir un
   autre.

   Un réglage, pas une table : trois lignes de texte ne justifient ni
   une migration, ni des rangs, ni un ordre à maintenir. Une valeur
   par ligne, « Titre : description ». L'ordre est celui des lignes.

   Vide ou absent, on retombe sur les trois d'origine — l'écran ne
   doit jamais afficher une section vide parce que personne n'a
   encore ouvert le formulaire. */
export const VALEURS_PAR_DEFAUT: [string, string][] = [
  ['Respect', 'Du maître, des partenaires, du lieu.'],
  ['Constance', 'La progression vient de la régularité.'],
  ['Entraide', 'Les anciens accompagnent les nouveaux.']
];

export function lireValeurs(texte: string | undefined | null): [string, string][] {
  const lignes = (texte ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lignes.length) return VALEURS_PAR_DEFAUT;

  return lignes.map((ligne) => {
    /* Le premier deux-points sépare, les suivants appartiennent à la
       description — « Respect : du maître, du lieu : partout ». */
    const coupe = ligne.indexOf(':');
    if (coupe === -1) return [ligne, ''] as [string, string];
    return [ligne.slice(0, coupe).trim(), ligne.slice(coupe + 1).trim()] as [string, string];
  });
}

export const ecrireValeurs = (valeurs: [string, string][]) =>
  valeurs.map(([t, d]) => (d ? `${t} : ${d}` : t)).join('\n');
