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
  /* Qui a publié. La colonne existait depuis le premier jour et
     restait vide ; l'écran affichait « par l'administration » pour
     tout le monde. Un déclencheur de la base la pose maintenant —
     et l'écrase si le téléphone propose autre chose. */
  auteur: { nom: string; prenom: string } | null;
};

const CHAMPS =
  'id, titre, categorie, texte, date_evt, lieu, image, cree_le, profils:auteur_id ( nom, prenom )';

/* PostgREST rend une jointure « un vers un » tantôt en objet, tantôt
   en tableau d'un élément selon ce qu'il déduit des clés. On accepte
   les deux plutôt que de parier. */
type LigneActu = Omit<Actualite, 'auteur'> & {
  profils: { nom: string; prenom: string } | { nom: string; prenom: string }[] | null;
};

const enActualite = (l: LigneActu): Actualite => {
  const { profils, ...reste } = l;
  return { ...reste, auteur: Array.isArray(profils) ? (profils[0] ?? null) : profils };
};

export function useActualites() {
  return useQuery({
    queryKey: ['actualites'],
    queryFn: async (): Promise<Actualite[]> => {
      const { data, error } = await supabase
        .from('actualites')
        .select(CHAMPS)
        .order('cree_le', { ascending: false });
      if (error) throw error;
      return (data as unknown as LigneActu[]).map(enActualite);
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
        .select(CHAMPS)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data ? enActualite(data as unknown as LigneActu) : null;
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
  /* zéro-ligne-normal: tout était déjà lu, et appuyer sur « Tout
     lire » dans ce cas ne doit pas afficher une erreur. C'est la
     différence entre « le serveur a refusé » et « il n'y avait rien
     à faire » — la seconde n'est pas un incident. */
  const { error } = await supabase
    .from('notifications')
    .update({ lue_le: new Date().toISOString() })
    .is('lue_le', null);
  if (error) throw error;
}

/* ------------------------------------------------------------
   Ranger ses notifications, une par une.

   L'écran ne savait faire qu'une chose : « Tout lire ». On ne
   pouvait ni en marquer une seule, ni en retirer aucune. Cinquante
   s'accumulaient, la plus ancienne restait à côté de la plus
   récente, et la pastille du casier ne disait plus rien d'utile.

   « lue_le » est posé par le SERVEUR ? Non : par le téléphone, avec
   son horloge. C'est assumé — ce champ ne sert qu'à distinguer lu de
   non lu, et une minute d'écart entre deux téléphones n'a aucune
   conséquence. Rien n'en dépend qui compte.
   ------------------------------------------------------------ */
export async function marquerLue(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ lue_le: new Date().toISOString() })
    .eq('id', id)
    .is('lue_le', null)
    .select('id');
  if (error) throw error;
  /* Zéro ligne n'est PAS une erreur ici : cela veut dire qu'elle
     était déjà lue, ce qui arrive dès qu'on rouvre la même
     notification. On ne lève donc rien — contrairement aux
     écritures où zéro ligne signale un refus. */
  return data?.length === 1;
}

export async function retirerNotification(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw error;
  /* Ici, en revanche, zéro ligne EST un refus : la notification
     existait, on vient de la voir à l'écran. Sans ce contrôle, la
     liste se rafraîchirait et la notification réapparaîtrait sans
     que rien n'ait expliqué pourquoi. */
  if (!data?.length) {
    throw new Error('Le serveur n’a pas retiré cette notification.');
  }
}

/* Vider ce qui est déjà lu. Le geste de rangement le plus fréquent :
   on veut retrouver un écran qui ne montre que ce qui reste à
   voir. Ce qui n'est PAS lu n'est jamais emporté — ce serait
   effacer une annonce qu'on n'a pas vue. */
export async function viderLesLues() {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .not('lue_le', 'is', null)
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
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
