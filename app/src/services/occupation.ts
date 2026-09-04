/* ============================================================
   Ce que le club occupe, et ce qu'on peut ranger.

   « Tôt ou tard la base de données sera saturée et pleine, alors on
   doit anticiper cela. »

   ------------------------------------------------------------
   CE QUE LA MESURE A DIT

   Les vingt tables du club pèsent 1,26 Mo, dont l'essentiel est de la
   place réservée par Postgres et non des données. Pour soixante-
   quatre membres, cela fait de l'ordre de quinze mégaoctets par an —
   soit une trentaine d'années avant les cinq cents du palier gratuit.

   Ce qui sature AVANT, dans l'ordre : la mise en veille au bout de
   sept jours sans requête, le trafic sortant, puis les photos. La
   base est la dernière. C'est pour cela que cet écran montre les
   trois, et pas seulement la base.

   ------------------------------------------------------------
   CE QUE CE FICHIER NE SAIT PAS DIRE

   Le TRAFIC SORTANT. Il ne se lit pas depuis la base : c'est une
   mesure du service, pas une donnée. L'écran le dit plutôt que de
   l'inventer — un chiffre faux sur une jauge est pire que pas de
   jauge du tout.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

/* Les paliers du service, en octets. Ils servent à dire « vous en
   êtes à 3 % », ce qui ne veut rien dire sans le dénominateur.

   Ils sont écrits ici et non demandés au serveur parce que la base
   ne connaît pas l'abonnement de son projet : elle sait ce qu'elle
   pèse, pas ce à quoi elle a droit. À changer le jour où le club
   passe au palier payant — huit gigaoctets et cent de fichiers. */
export const PALIERS = {
  base: 500 * 1024 * 1024,
  fichiers: 1024 * 1024 * 1024
};

/* À partir de quand on s'inquiète. Soixante-quinze pour cent laisse
   le temps de décider ; quatre-vingt-quinze, celui de paniquer. */
export const SEUIL_ALERTE = 0.75;

export type Poste = { quoi: string; octets: number | null; lignes: number | null };

export type Occupation = {
  base: number;
  tables: number;
  seaux: { nom: string; octets: number; fichiers: number }[];
  fichiers: number;
  lignes: { quoi: string; combien: number }[];
};

export function useOccupation() {
  return useQuery({
    queryKey: ['occupation'],
    /* Elle interroge « pg_database_size » et parcourt le catalogue :
       ce n'est pas gratuit, et la place occupée ne change pas d'une
       minute à l'autre. Cinq minutes de fraîcheur suffisent, et
       évitent de payer la mesure à chaque aller-retour vers l'écran. */
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Occupation> => {
      const { data, error } = await supabase.rpc('occupation');
      if (error) throw error;
      const postes = (data ?? []) as Poste[];
      const de = (q: string) => postes.find((p) => p.quoi === q)?.octets ?? 0;

      const seaux = postes
        .filter((p) => p.quoi.startsWith('seau:'))
        .map((p) => ({
          nom: p.quoi.slice(5),
          octets: p.octets ?? 0,
          fichiers: p.lignes ?? 0
        }));

      return {
        base: de('base'),
        tables: de('tables'),
        seaux,
        fichiers: seaux.reduce((t, s) => t + s.octets, 0),
        lignes: postes
          .filter((p) => p.quoi.startsWith('lignes:'))
          .map((p) => ({ quoi: p.quoi.slice(7), combien: p.lignes ?? 0 }))
      };
    }
  });
}

/* ------------------------------------------------------------
   La durée de conservation.

   Trois réglages, et TROIS SEULEMENT. Ce qui n'est pas dans cette
   liste ne s'efface jamais au temps qui passe : les fiches, les
   actualités, les albums, et surtout les PRÉSENCES — c'est le
   registre d'assiduité sur lequel se décident les passages de grade,
   et l'effacer au bout de deux ans effacerait la raison d'une
   ceinture.
   ------------------------------------------------------------ */
export type Conservation = {
  /* Le journal d'accès est un registre de SÉCURITÉ, pas une archive.
     Savoir qui est entré dans l'espace des maîtres il y a trois ans
     ne sert plus, et le garder indéfiniment est en soi un risque. */
  journal: number | null;
  /* Les notifications déjà lues : du bruit, par définition. */
  notifications: number | null;
  /* Les messages. Nul PAR DÉFAUT, et c'est délibéré : une
     conversation appartient à ceux qui l'ont eue, et l'effacer sans
     qu'on l'ait décidé serait le pire de ce que cette application
     peut faire. */
  messages: number | null;
};

export const CONSERVATION_PAR_DEFAUT: Conservation = {
  journal: 12,
  notifications: 3,
  messages: null
};

export function useARanger(c: Conservation) {
  return useQuery({
    queryKey: ['a-ranger', c.journal, c.notifications, c.messages],
    queryFn: async (): Promise<{ quoi: string; lignes: number }[]> => {
      const { data, error } = await supabase.rpc('a_ranger', {
        mois_journal: c.journal,
        mois_notifs: c.notifications,
        mois_messages: c.messages
      });
      if (error) throw error;
      return (data ?? []) as { quoi: string; lignes: number }[];
    }
  });
}

export function useRanger() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (c: Conservation) => {
      const { data, error } = await supabase.rpc('ranger', {
        mois_journal: c.journal,
        mois_notifs: c.notifications,
        mois_messages: c.messages
      });
      if (error) throw error;
      const fait = (data ?? []) as { quoi: string; lignes: number; chemins: string[] | null }[];

      /* ⚠ LES FICHIERS PARTENT AVEC LEURS MESSAGES.

         Effacer la ligne d'un message laisse la pièce jointe dans le
         seau, et ce sont les fichiers qui remplissent — un message
         pèse deux cents fois moins que la photo qu'il porte. Sans
         cette étape, le rangement AGGRAVERAIT le problème qu'il
         prétend résoudre : la place ne serait pas rendue, et plus
         rien ne rattacherait le fichier à quoi que ce soit.

         Une fonction SQL ne sait pas supprimer dans le stockage —
         cela passe par son interface — d'où le va-et-vient : le
         serveur rend les chemins, l'application les supprime. */
      const chemins = fait.flatMap((f) => f.chemins ?? []);
      let fichiers = 0;
      if (chemins.length) {
        const { data: partis, error: e } = await supabase.storage
          .from('pieces')
          .remove(chemins);
        /* Un échec ici ne défait pas le rangement : les messages sont
           partis, ce qui était demandé. On le DIT, et l'on pourra
           relancer — les chemins orphelins se retrouvent en comparant
           le seau aux messages restants. */
        if (e) {
          throw new Error(
            `Les messages sont rangés, mais ${chemins.length} pièce(s) jointe(s) ` +
              `sont restées dans le seau : ${e.message}`
          );
        }
        fichiers = partis?.length ?? 0;
      }

      return { fait, fichiers };
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['occupation'] });
      void client.invalidateQueries({ queryKey: ['a-ranger'] });
      void client.invalidateQueries({ queryKey: ['journal'] });
      void client.invalidateQueries({ queryKey: ['notifications'] });
      void client.invalidateQueries({ queryKey: ['messages'] });
    }
  });
}

/* « 3,1 Mo », « 487 ko ». Les octets bruts ne se lisent pas : personne
   ne sait dire de tête si 13 257 875 est beaucoup. */
export function poids(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} ko`;
  const mo = octets / (1024 * 1024);
  if (mo < 1024) return `${mo < 10 ? mo.toFixed(1) : Math.round(mo)} Mo`;
  return `${(mo / 1024).toFixed(1)} Go`;
}

/* Le nom des seaux, tel qu'on les dit. « pieces » et « album » sont
   des noms de code ; le club, lui, range des photos et des pièces
   jointes. */
export const NOM_DU_SEAU: Record<string, string> = {
  album: 'Photos des albums',
  pieces: 'Pièces jointes des conversations',
  portraits: 'Portraits des membres',
  club: 'Photo du club'
};

export const NOM_DE_LA_LIGNE: Record<string, string> = {
  messages: 'Messages',
  presences: 'Présences pointées',
  notifications: 'Notifications',
  journal: 'Passages dans le journal'
};
