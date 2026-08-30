/* ============================================================
   Les photos.

   Les seaux sont PRIVÉS, et c'est délibéré : ce sont des photos
   d'enfants. Un seau public rend chaque fichier lisible par
   quiconque possède son adresse — et une adresse se copie, se
   transfère, se retrouve dans un historique de navigateur, et ne se
   révoque jamais.

   L'application demande donc des adresses SIGNÉES, valables une
   heure, que le serveur ne délivre qu'à qui a le droit de voir le
   fichier. Une adresse qui fuite expire ; un membre exclu cesse
   d'en obtenir.

   EN LOT, et c'est le point technique qui compte : l'annuaire
   affiche soixante-quatre portraits. Une adresse par photo ferait
   soixante-quatre allers-retours sur un réseau malgache — plusieurs
   secondes d'écran vide. createSignedUrls en demande autant qu'on
   veut d'un seul appel.
   ============================================================ */
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

/* Une heure de validité, et une demi-heure de cache. L'écart n'est
   pas un détail : une adresse gardée aussi longtemps qu'elle est
   valable expirerait entre le moment où on la rend et celui où
   l'image se charge, sur une connexion lente. */
const VALIDITE = 3600;
const FRAICHEUR = 30 * 60 * 1000;

export type Urls = Record<string, string>;

async function signer(seau: string, chemins: string[]): Promise<Urls> {
  if (!chemins.length) return {};
  const { data, error } = await supabase.storage.from(seau).createSignedUrls(chemins, VALIDITE);
  if (error) throw error;

  const dico: Urls = {};
  for (const l of data ?? []) {
    /* Une photo dont le fichier a disparu rend une erreur pour ELLE
       seule ; les autres restent bonnes. On la saute plutôt que de
       faire échouer toute la liste — un album ne doit pas devenir
       vide parce qu'une image manque. */
    if (l.error || !l.signedUrl || !l.path) continue;
    dico[l.path] = l.signedUrl;
  }
  return dico;
}

/* Les adresses signées d'une liste de chemins. Les chemins nuls sont
   écartés ici plutôt que par chaque appelant : la plupart des
   membres n'ont pas encore de portrait. */
export function useUrls(seau: string, chemins: (string | null | undefined)[]) {
  /* Triés et dédoublonnés : la clé de cache doit être la même pour
     la même demande, quel que soit l'ordre d'affichage. Sans cela,
     réordonner l'annuaire redemanderait toutes les adresses. */
  const liste = [...new Set(chemins.filter((c): c is string => Boolean(c)))].sort();

  const { data } = useQuery({
    queryKey: ['urls', seau, liste],
    enabled: liste.length > 0,
    staleTime: FRAICHEUR,
    gcTime: FRAICHEUR,
    queryFn: () => signer(seau, liste)
  });

  /* Toujours un objet, jamais undefined : les écrans font
     « urls[chemin] », et une garde de plus à chaque appel finirait
     par être oubliée quelque part. */
  return data ?? {};
}

/* Une seule photo — la carte de membre, la fiche ouverte. Passe par
   la même mécanique, donc le même cache : ouvrir sa fiche après
   l'annuaire ne redemande rien. */
export function useUrl(seau: string, chemin: string | null | undefined) {
  const urls = useUrls(seau, [chemin]);
  return chemin ? (urls[chemin] ?? null) : null;
}
