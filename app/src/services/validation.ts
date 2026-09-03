/* ============================================================
   Valider les inscriptions à une sortie.

   « Ajouter un écran pour visualiser les participations en attente
   d'une validation, et seul l'admin qui a créé la sortie qui peut le
   voir et valider. »

   ------------------------------------------------------------
   CE QUI PROTÈGE VRAIMENT N'EST PAS ICI

   Ce fichier ne fait que demander. Trois choses, sur le SERVEUR,
   décident (migration 0020) :

     · une règle d'accès : seul l'auteur de la sortie peut mettre à
       jour les inscriptions qui la concernent ;
     · un déclencheur : personne d'autre que lui ne touche aux
       colonnes de décision — pas même le membre inscrit, qui a par
       ailleurs le droit de corriger SA ligne et se validerait donc
       lui-même en une requête ;
     · une règle de lecture resserrée : chacun voit la sienne,
       l'auteur voit celles de sa sortie, l'administration voit tout.

   L'écran ne fait que ne pas proposer ce qui serait refusé.

   ------------------------------------------------------------
   POURQUOI « auteur_id » EST DIGNE DE CONFIANCE

   Un déclencheur BEFORE INSERT le force à l'identité de l'appelant :
   le téléphone ne l'envoie pas et ne peut pas le falsifier. Et il ne
   se déclenche pas à la mise à jour, donc corriger une actualité n'en
   transfère pas la paternité. Vérifié avant d'écrire ce fichier — la
   règle demandée n'aurait rien voulu dire sans ces deux propriétés.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { assure } from './ecrire';
import { useSession } from './session';

/* Ce qui reste à verser. Une seule façon de le calculer dans toute
   l'application : le montant attendu moins la somme des versements.

   « attendu » tient compte des ACCOMPAGNANTS — une sortie à quinze
   mille ariary pour quelqu'un qui vient avec deux personnes coûte
   quarante-cinq mille, et c'est ce que le club encaisse au bord du
   tapis. L'oublier ferait afficher « soldé » à quelqu'un qui doit
   encore deux places. */
export function attendu(prix: number | null | undefined, accompagnants: number): number {
  if (!prix) return 0;
  return prix * (1 + Math.max(0, accompagnants));
}

export const verse = (versements: { montant: number }[] | null | undefined) =>
  (versements ?? []).reduce((t, v) => t + v.montant, 0);

/* Négatif possible : quelqu'un peut avoir trop versé, et le cacher
   serait mentir sur ce que le club doit rendre. */
export const reste = (
  prix: number | null | undefined,
  accompagnants: number,
  versements: { montant: number }[] | null | undefined
) => attendu(prix, accompagnants) - verse(versements);

export type EnAttente = {
  id: string;
  actualite_id: string;
  accompagnants: number;
  montant_promis: number | null;
  note: string | null;
  cree_le: string;
  /* Ce qui a DÉJÀ été encaissé, même si l'inscription attend encore.
     Les deux vont ensemble plus souvent qu'on ne croit : quelqu'un
     envoie l'argent par MVola le lundi, l'administration le pointe, et
     l'organisateur ne tranche que le jeudi. Sans cette colonne il
     déciderait sans savoir que le club tient déjà l'argent. */
  versements: { montant: number }[];
  membre: { nom: string; prenom: string; numero: string } | null;
  sortie: { titre: string; date_evt: string | null; participation_ar: number | null } | null;
};

type Ligne = Omit<EnAttente, 'membre' | 'sortie'> & {
  profils: { nom: string; prenom: string; numero: string } | null;
  actualites: { titre: string; date_evt: string | null; participation_ar: number | null } | null;
};

/* Les inscriptions QUE JE DOIS TRAITER : celles des sorties dont je
   suis l'auteur, et qui ne sont ni validées ni refusées.

   Le filtre sur l'auteur est écrit ICI en plus de la règle d'accès.
   Ce n'est pas de la méfiance envers le serveur — c'est que la règle
   laisse aussi passer l'administration, qui doit pouvoir pointer les
   versements de toutes les sorties. Sans ce filtre, un administrateur
   verrait dans SA file d'attente des inscriptions qu'il n'a pas le
   droit de valider, et le bouton échouerait. */
export function useAValider() {
  const moi = useSession((e) => e.profil);

  return useQuery({
    queryKey: ['a-valider', moi?.id],
    enabled: Boolean(moi?.id),
    queryFn: async (): Promise<EnAttente[]> => {
      const { data, error } = await supabase
        .from('participations')
        .select(
          `id, actualite_id, accompagnants, montant_promis, note, cree_le,
           versements ( montant ),
           profils:profil_id ( nom, prenom, numero ),
           actualites!inner ( titre, date_evt, participation_ar, auteur_id )`
        )
        .is('valide_le', null)
        .is('refuse_le', null)
        .eq('actualites.auteur_id', moi!.id)
        .order('cree_le');
      if (error) throw error;
      return (data as unknown as Ligne[]).map(({ profils, actualites, ...p }) => ({
        ...p,
        versements: p.versements ?? [],
        membre: profils,
        sortie: actualites
      }));
    }
  });
}

/* Combien attendent. Sert la pastille de l'écran d'administration :
   une file d'attente qu'il faut penser à ouvrir est une file
   d'attente qui ne se vide pas. */
export function useNombreAValider() {
  const { data } = useAValider();
  return data?.length ?? 0;
}

export function useTrancher() {
  const client = useQueryClient();
  const moi = useSession((e) => e.profil);

  return useMutation({
    mutationFn: async ({
      id,
      accepter,
      motif
    }: {
      id: string;
      accepter: boolean;
      motif?: string;
    }) => {
      const maintenant = new Date().toISOString();
      const { data, error } = await supabase
        .from('participations')
        .update(
          accepter
            ? { valide_le: maintenant, valide_par: moi?.id ?? null, refuse_le: null, motif: null }
            : { refuse_le: maintenant, valide_par: moi?.id ?? null, valide_le: null,
                motif: motif?.trim() || null }
        )
        .eq('id', id)
        .select('id');
      if (error) throw error;
      /* Zéro ligne = le serveur a refusé. C'est le cas ordinaire ici
         si l'on n'est pas l'auteur de la sortie, et il doit se LIRE
         plutôt que de passer pour un succès. */
      assure(data, accepter ? 'validé cette inscription' : 'refusé cette inscription');
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['a-valider'] });
      void client.invalidateQueries({ queryKey: ['participations'] });
      void client.invalidateQueries({ queryKey: ['participation'] });
    }
  });
}

/* ------------------------------------------------------------
   Inscrire un membre qui paie EN ESPÈCES, sans qu'il demande rien.

   « Parfois un membre le paie en espèces, alors on peut valider
   directement la participation dans l'app sans que le membre envoie
   une invitation. »

   C'est le cas ordinaire au bord du tapis : quelqu'un tend un billet
   le samedi matin et dit « inscris-moi ». Lui demander de sortir son
   téléphone, d'ouvrir l'application et de s'inscrire pour que
   l'organisateur valide ensuite serait absurde — et c'est ce que
   l'application imposait.

   L'inscription est créée DÉJÀ VALIDÉE, et le versement encaissé
   dans la foulée s'il y en a un.

   ⚠ QUI A LE DROIT : l'auteur de la sortie, et le serveur le vérifie
   à la CRÉATION comme à la mise à jour. La migration 0020 n'avait
   gardé que la mise à jour ; la 0021 a fermé l'insertion, sans quoi
   n'importe quel administrateur aurait validé sur la sortie d'un
   autre en la créant plutôt qu'en la modifiant.
   ------------------------------------------------------------ */
export function useInscrireEnEspeces() {
  const client = useQueryClient();
  const moi = useSession((e) => e.profil);

  return useMutation({
    mutationFn: async ({
      actualiteId,
      profilId,
      accompagnants,
      montantVerse,
      note
    }: {
      actualiteId: string;
      profilId: string;
      accompagnants: number;
      /* Ce qu'il vient de donner. Zéro est permis : on inscrit
         quelqu'un qui paiera plus tard, et c'est justement le cas
         « petit à petit ». */
      montantVerse: number;
      note?: string;
    }) => {
      const maintenant = new Date().toISOString();

      const { data, error } = await supabase
        .from('participations')
        .insert({
          actualite_id: actualiteId,
          profil_id: profilId,
          accompagnants: Math.max(0, accompagnants),
          note: note?.trim() || null,
          valide_le: maintenant,
          valide_par: moi?.id ?? null
        })
        .select('id')
        .single();
      /* Une inscription EXISTE peut-être déjà — le membre s'était
         inscrit puis a payé en espèces. La contrainte d'unicité le
         dit clairement plutôt que de créer un doublon ; on traduit,
         parce que « duplicate key value violates unique constraint »
         n'aide personne au bord du tapis. */
      if (error) {
        if (error.code === '23505') {
          throw new Error(
            'Ce membre est déjà inscrit à cette sortie. Validez son inscription ' +
              'dans la liste ci-dessus, puis pointez son versement.'
          );
        }
        throw error;
      }

      const cree = data as { id: string };

      /* Le VERSEMENT, s'il y en a un. Il part après l'inscription et
         non avant : sans inscription, il n'a rien à quoi se
         rattacher.

         Un échec ici ne défait PAS l'inscription — le membre est
         inscrit, ce qui est le plus important, et le versement se
         repointe d'un appui. Le dire vaut mieux que tout annuler. */
      if (montantVerse > 0) {
        const { error: eVersement } = await supabase.from('versements').insert({
          participation_id: cree.id,
          montant: Math.round(montantVerse)
        });
        if (eVersement) {
          throw new Error(
            `Le membre est inscrit, mais le versement n’a pas été enregistré : ` +
              `${eVersement.message}. Pointez-le depuis « Participations ».`
          );
        }
      }
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['a-valider'] });
      void client.invalidateQueries({ queryKey: ['participations'] });
      void client.invalidateQueries({ queryKey: ['participation'] });
    }
  });
}
