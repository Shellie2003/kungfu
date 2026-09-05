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
import { supabase } from './supabase';
import { useTempsReel } from './tempsReel';
import { assure } from './ecrire';
import { TYPES_IMAGE, reduire } from './images';
import { envoyerFichier } from './envoi';
import { pliage } from './texte';
import type { Progres } from './envoi';

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

/* « archivees » bascule la liste : les conversations en cours, ou
   celles qu'on a rangées. Deux requêtes distinctes plutôt qu'un tri
   dans l'application — le club aura des dizaines de salons de sortie
   au bout de deux ans, et les charger tous pour en cacher la moitié
   ferait payer l'archive à chaque ouverture de l'écran. */
export function useSalons(archivees = false) {
  /* ⚠ LA LISTE AUSSI, ET C'EST CE QUI MANQUAIT LE PLUS.

     Seul le fil OUVERT écoutait. Depuis la liste des conversations,
     un message reçu ne se voyait donc pas : ni l'aperçu, ni la
     pastille des non-lus. Il fallait quitter l'écran et y revenir —
     précisément le geste dont le club se plaint.

     Sans filtre, volontairement : on veut savoir qu'il se passe
     quelque chose dans N'IMPORTE quelle conversation qu'on a le
     droit de lire. Les règles d'accès s'en chargent — un élève ne
     reçoit rien d'un salon dont il n'est pas membre. */
  useTempsReel('conversations', [
    { table: 'messages', cles: [['salons']] },
    { table: 'salons', cles: [['salons']] }
  ]);

  return useQuery({
    queryKey: ['salons', archivees],
    queryFn: async (): Promise<Salon[]> => {
      const { data, error } = await supabase
        .from('salons')
        .select(
          `id, type, titre, couleur, dernier_le,
           membres_salon ( lu_le ),
           messages ( texte, cree_le, profils:auteur_id ( nom, prenom ) )`
        )
        .eq('archive', archivees)
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

/* Ranger une conversation, et la ressortir.

   La colonne « archive » était filtrée à la lecture depuis le
   premier jour et personne ne la posait : elle valait « false » pour
   tous les salons, à jamais. Une sortie de 2024 restait donc en tête
   de la messagerie du club en 2026.

   Archiver n'est PAS supprimer, et c'est le point : les messages
   restent, le salon se rouvre, et un litige de l'an dernier se
   relit. C'est l'administration qui range — la règle d'accès
   « l'administration ouvre les salons » couvre déjà l'écriture, et
   laisser chacun archiver ferait disparaître de sa liste un salon
   que le club croit lu. */
export function useArchiver() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ salonId, archive }: { salonId: string; archive: boolean }) => {
      const { data: ecrit1, error } = await supabase.from('salons').update({ archive }).eq('id', salonId)
        .select('id');
      if (error) throw error;
      assure(ecrit1, 'archivé cette conversation');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['salons'] })
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
  /* Le CHEMIN de la pièce jointe dans le seau « pieces », pas son
     adresse : elle est signée et expire au bout d'une heure. */
  piece: string | null;
  supprime_le: string | null;
  auteur_id: string;
  auteur: { nom: string; prenom: string } | null;
};

type LigneMessage = Omit<Message, 'auteur'> & { profils: { nom: string; prenom: string } | null };

export function useMessages(salonId: string | undefined) {
  /* Le temps réel n'est pas un confort : sans lui, deux personnes
     dans la même salle croient s'être écrit dans le vide. On écoute
     les changements du salon ouvert, et rien d'autre.

     ⚠ Ce code existait depuis le premier jour et n'a JAMAIS rien
     reçu : la table « messages » n'était dans aucune publication,
     donc PostgreSQL n'émettait rien. Voir 0026_temps_reel.sql. */
  useTempsReel(
    `salon:${salonId}`,
    [{ table: 'messages', filtre: `salon_id=eq.${salonId}`, cles: [['messages', salonId], ['salons']] }],
    Boolean(salonId)
  );

  return useQuery({
    queryKey: ['messages', salonId],
    enabled: Boolean(salonId),
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          'id, texte, cree_le, modifie_le, piece, supprime_le, auteur_id, ' +
            'profils:auteur_id ( nom, prenom )'
        )
        .eq('salon_id', salonId!)
        /* Les DEUX CENTS DERNIERS, et non les deux cents premiers.

           Écrit « ascending: true » avec une limite, PostgREST rend
           les plus ANCIENS : passé deux cents messages, un salon
           n'aurait plus jamais montré un nouveau message — il serait
           tombé hors de la fenêtre à l'instant même où il est écrit.
           Le club n'y est pas encore ; il y sera, et le défaut aurait
           alors été incompréhensible.

           On demande donc les plus récents, puis on remet le fil dans
           l'ordre de lecture. */
        .order('cree_le', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as unknown as LigneMessage[])
        .map(({ profils, ...m }) => ({ ...m, auteur: profils }))
        .reverse();
    }
  });
}

/* Joindre un fichier à une conversation.

   Le chemin PORTE le salon — « <salon>/<hasard>.jpg » — et ce n'est
   pas une commodité de rangement : c'est ce que lit la règle d'accès
   pour vérifier qu'on est membre du salon. Déposer ailleurs est
   refusé par le serveur, et lire la pièce d'un salon dont on n'est
   pas membre aussi. L'espace des maîtres est fermé par la même
   mécanique que ses messages.

   Le nom est tiré au sort : deux téléphones qui envoient tous deux
   « IMG_0001.jpg » écraseraient sinon la photo l'un de l'autre. */
/* Ce que le seau accepte, répété ici pour le DIRE avant d'envoyer.

   Le serveur refuse déjà au-delà — c'est lui qui protège — mais il
   refuse APRÈS avoir reçu le fichier, avec un message que personne
   ne comprend, et après avoir dépensé le forfait de celui qui
   l'envoie. Sur un réseau malgache, envoyer huit mégaoctets pour
   s'entendre dire non est une punition.

   Si les deux divergent un jour, l'écran refusera ce que le serveur
   aurait accepté : un défaut visible, jamais une protection
   contournée. */
export const TAILLE_MAX = 5 * 1024 * 1024;

/* Réexporté pour les appelants qui l'importaient d'ici. La source
   est images.ts : deux listes de types d'images auraient fini par
   diverger, et l'écran aurait alors refusé ce que le seau accepte. */
export { TYPES_IMAGE } from './images';

/* Les documents que le club échange réellement : une convocation en
   PDF, une liste d'inscrits, un règlement. On ne prend PAS tout —
   un exécutable ou une archive n'ont rien à faire dans une
   conversation d'élèves, et le seau n'est pas un disque partagé. */
export const TYPES_DOCUMENT = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const TYPES_ACCEPTES = [...TYPES_IMAGE, ...TYPES_DOCUMENT];

/* « 5 Mo », « 340 ko » — un nombre d'octets ne dit rien à personne. */
export function poids(octets: number): string {
  if (octets >= 1024 * 1024) return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
  return `${Math.round(octets / 1024)} ko`;
}

/* ------------------------------------------------------------
   Le nom du fichier, conservé DANS le chemin.

   Le chemin valait « <salon>/<hasard>.pdf » : le nom d'origine était
   perdu, et un document téléchargé s'appelait
   « 7f3a1c2e-….pdf ». Illisible, et impossible à retrouver dans le
   dossier des téléchargements.

   On le garde donc après un double tiret. La règle d'accès n'en
   souffre pas : prive.salon_du_chemin ne lit que le PREMIER segment
   du chemin et vérifie que c'est un identifiant de salon — vérifié
   dans la base avant d'écrire ceci.
   ------------------------------------------------------------ */
const SEPARATEUR = '--';

/* Un nom de fichier sûr : ni barre oblique, ni accent douteux, ni
   longueur déraisonnable. Le seau n'accepte pas n'importe quoi, et
   un nom qui voyage jusqu'au dossier de téléchargement d'un
   téléphone doit rester simple. */
function nomSur(nom: string): string {
  const sans = nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '');
  return sans.slice(0, 60) || 'document';
}

/* Le nom lisible d'une pièce, à partir de son chemin. Rend « null »
   pour les pièces d'avant ce changement, qui n'en portent pas : on
   affichera alors « Document » plutôt qu'un identifiant. */
export function nomDeLaPiece(chemin: string): string | null {
  const dernier = chemin.split('/').pop() ?? '';
  const coupe = dernier.indexOf(SEPARATEUR);
  if (coupe < 0) return null;
  return dernier.slice(coupe + SEPARATEUR.length) || null;
}

export const estImage = (chemin: string): boolean =>
  /\.(jpe?g|png|webp)$/i.test(chemin);

export async function joindre(
  salonId: string,
  fichier: File,
  progres?: Progres
): Promise<string> {
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    throw new Error(
      `Ce type de fichier n’est pas accepté : « ${fichier.type || 'type inconnu'} ». ` +
        'Photos (JPEG, PNG, WebP), PDF, texte, Word et Excel.'
    );
  }
  if (fichier.size > TAILLE_MAX) {
    throw new Error(
      `Ce fichier pèse ${poids(fichier.size)} ; la limite est ${poids(TAILLE_MAX)}.`
    );
  }

  /* La réduction vient APRÈS le contrôle de taille : un fichier de
     vingt mégaoctets doit être refusé, pas rattrapé en douce. Ce
     serait promettre une limite qu'on n'applique pas. */
  /* Un DOCUMENT ne traverse pas « reduire » — la fonction le rend
     tel quel, et c'est sa garde la plus importante : un PDF passé
     dans un canevas ne serait pas compressé, il serait remplacé par
     une image de sa première page. */
  const envoye = await reduire(fichier);

  /* L'extension n'est plus calculée à part : le nom conservé la
     porte déjà, et c'est elle que lit « estImage ». */
  const chemin = `${salonId}/${crypto.randomUUID()}${SEPARATEUR}${nomSur(envoye.name)}`;
  await envoyerFichier('pieces', chemin, envoye, progres);
  return chemin;
}

/* Le préfixe d'un message pas encore confirmé. L'écran s'en sert
   pour le montrer en attente ; il disparaît quand le serveur rend le
   vrai. */
export const PROVISOIRE = 'en-attente:';

export const enAttente = (m: Message) => m.id.startsWith(PROVISOIRE);

/* Envoyer, et le voir TOUT DE SUITE.

   Le club : « l'envoi d'un message est trop lent ». Il ne l'était
   pas au sens où le serveur tarderait — il l'était parce que
   l'écran attendait DEUX allers-retours avant de montrer quoi que
   ce soit : l'écriture, puis la relecture complète du fil. Sur un
   réseau malgache, cela fait deux à quatre secondes pendant
   lesquelles il ne se passe rien de visible, et l'on retape.

   Le message est donc posé dans le fil AVANT d'être envoyé, et
   marqué « en attente ». C'est ce que fait toute messagerie, et ce
   n'est pas un mensonge tant que l'échec le retire.

   Ce que cela n'est PAS : une prétention de réussite. « onError »
   remet le fil exactement comme il était, et l'écran dit pourquoi.
   Le défaut inverse — annoncer un succès qui n'a pas eu lieu — a
   déjà coûté trois corrections à ce projet. */
export function useEnvoyer(salonId: string | undefined) {
  const client = useQueryClient();
  const cle = ['messages', salonId];

  return useMutation({
    mutationFn: async ({
      texte, auteurId, piece = null
    }: { texte: string; auteurId: string; piece?: string | null; auteur?: Message['auteur'] }) => {
      if (!salonId) throw new Error('Aucune conversation ouverte.');
      /* Le « .select() » pour la même raison qu'ailleurs : il donne
         la ligne écrite, et l'absence de ligne devient une erreur
         qu'on peut nommer plutôt qu'un succès imaginaire. */
      const { data, error } = await supabase
        .from('messages')
        .insert({ salon_id: salonId, auteur_id: auteurId, texte, piece })
        .select('id');
      if (error) throw error;
      if (!data?.length) {
        throw new Error('Le serveur a accepté sans rien écrire — réessayez.');
      }
    },

    onMutate: async ({ texte, auteurId, piece = null, auteur = null }) => {
      /* On arrête les relectures en cours : l'une d'elles pourrait
         revenir APRÈS notre ajout et l'écraser, faisant clignoter le
         message puis disparaître. */
      await client.cancelQueries({ queryKey: cle });
      const avant = client.getQueryData<Message[]>(cle);

      const provisoire: Message = {
        id: `${PROVISOIRE}${crypto.randomUUID()}`,
        texte,
        cree_le: new Date().toISOString(),
        modifie_le: null,
        piece,
        supprime_le: null,
        auteur_id: auteurId,
        auteur
      };
      client.setQueryData<Message[]>(cle, [...(avant ?? []), provisoire]);
      return { avant };
    },

    onError: (_e, _v, contexte) => {
      /* Remettre le fil tel qu'il était. Laisser le message en place
         donnerait à croire qu'il est parti. */
      if (contexte?.avant) client.setQueryData(cle, contexte.avant);
      else client.invalidateQueries({ queryKey: cle });
    },

    onSettled: () => {
      client.invalidateQueries({ queryKey: cle });
      client.invalidateQueries({ queryKey: ['salons'] });
    }
  });
}

/* La fenêtre pendant laquelle un message se corrige.

   Elle est écrite dans la RÈGLE D'ACCÈS de la base — « auteur_id =
   mon_profil() AND cree_le > now() - 15 minutes » — et c'était l'un
   des points de la note de sécurité livrée au club : « l'auteur
   seul, et pendant quinze minutes. Passé ce délai, le fil devient
   une trace stable, utile en cas de litige. »

   La valeur est répétée ici pour ce que l'écran AFFICHE, jamais pour
   décider : c'est la base qui refuse. Si les deux divergent un jour,
   l'écran proposera une correction que le serveur rejettera — un
   défaut visible, et non une protection contournée. */
export const MINUTES_CORRECTION = 15;

export const corrigible = (m: Message, moiId: string | undefined) =>
  m.auteur_id === moiId &&
  !m.supprime_le &&
  Date.now() - new Date(m.cree_le).getTime() < MINUTES_CORRECTION * 60_000;

/* Corriger son propre message.

   ⚠ Le « .select() » n'est pas décoratif, et son absence était un
   vrai défaut : une mise à jour qui ne touche AUCUNE ligne — parce
   que la règle d'accès l'a écartée — ne rend pas d'erreur. PostgREST
   répond « 204, rien à signaler », supabase-js n'y voit rien, et
   l'écran annonçait « Message corrigé » alors que rien n'avait
   changé. L'application MENTAIT, poliment.

   Avec « .select() », la réponse porte les lignes touchées. Zéro
   ligne veut dire refusé, et on le dit.

   Ce que l'application ne fait toujours PAS : vérifier que c'est
   bien le sien, ni compter les minutes pour décider. La base le
   fait ; le refaire ici donnerait l'illusion que c'est
   l'application qui protège. */
export function useCorriger(salonId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, texte }: { id: string; texte: string }) => {
      const propre = texte.trim();
      if (!propre) throw new Error('Un message vide se retire, il ne s’enregistre pas.');
      const { data, error } = await supabase
        .from('messages')
        .update({ texte: propre })
        .eq('id', id)
        .select('id');
      if (error) throw error;
      if (!data?.length) {
        throw new Error(
          `Le serveur a refusé : un message ne se corrige que dans les ${MINUTES_CORRECTION} minutes qui suivent son envoi.`
        );
      }
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
      /* Même mécanique, et même défaut à éviter : le retrait passe
         par la MÊME règle d'accès que la correction, donc par la
         même fenêtre de quinze minutes. Sans « .select() », un
         retrait refusé s'annonçait comme réussi et le message
         restait dans le fil sous les yeux de son auteur. */
      const { data, error } = await supabase
        .from('messages')
        .update({ supprime_le: new Date().toISOString() })
        .eq('id', id)
        .select('id');
      if (error) throw error;
      if (!data?.length) {
        throw new Error(
          `Le serveur a refusé : un message ne se retire que dans les ${MINUTES_CORRECTION} minutes qui suivent son envoi. Passé ce délai, signalez-le à l’administration.`
        );
      }
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
        .select('id, type, titre, couleur, archive')
        .eq('id', salonId!)
        .maybeSingle();
      if (error) throw error;
      /* « archive » sert à l'écran : le même bouton range ou
         ressort, et sans savoir dans quel état on est il proposerait
         d'archiver une conversation déjà archivée. */
      return data as {
        id: string; type: TypeSalon; titre: string | null;
        couleur: string | null; archive: boolean;
      } | null;
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
  /* zéro-ligne-normal: on n'est pas toujours MEMBRE du salon qu'on
     lit — l'encadrement ouvre l'espace des maîtres sans y être
     inscrit. Il n'y a alors aucune ligne à toucher, et ce n'est pas
     un incident.

     L'erreur elle-même est ignorée, et c'est assumé : marquer un fil
     lu est un confort. Échouer ne doit pas empêcher de lire les
     messages, ni faire surgir un avertissement au milieu d'une
     conversation. */
  await supabase
    .from('membres_salon')
    .update({ lu_le: new Date().toISOString() })
    .eq('salon_id', salonId)
    .eq('profil_id', profilId);
}

/* Deux lettres pour une vignette de salon : « Tout le club » → TC.
   Un salon direct n'en a pas — il porte le portrait de la personne. */
/* Les mots-outils ne comptent pas dans une initiale.

   « Tout le club » donnait « TL » : l'article prenait la place du
   mot qui identifie le salon. Les deux lettres d'une pastille sont
   tout ce qu'on a pour reconnaître une conversation d'un coup d'œil
   dans une liste — « TC » se rattache à « club », « TL » ne se
   rattache à rien. La maquette écrivait « TC », et elle avait
   raison.

   La liste reste courte à dessein : ce sont les articles et les
   prépositions qui ne portent jamais de sens dans un nom de salon.
   Si tout est mot-outil — « Le des » n'existe pas, mais la fonction
   ne doit pas rendre une pastille vide — on retombe sur les mots
   d'origine. */
const OUTILS = new Set([
  'le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'un', 'une',
  'et', 'à', 'au', 'aux', 'en'
]);

export function initiales(titre: string): string {
  const mots = titre.trim().split(/\s+/).filter(Boolean);
  const porteurs = mots.filter((m) => !OUTILS.has(pliage(m.replace(/[’']/g, ''))));
  const utiles = porteurs.length ? porteurs : mots;
  if (utiles.length === 1) return (utiles[0] ?? '').slice(0, 2).toUpperCase();
  return ((utiles[0]?.[0] ?? '') + (utiles[1]?.[0] ?? '')).toUpperCase();
}

export function heureCourte(iso: string): string {
  const d = new Date(iso);
  const jours = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (jours < 1) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (jours < 2) return 'Hier';
  if (jours < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
