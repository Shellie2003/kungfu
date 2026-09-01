/* ============================================================
   Ce que l'administration écrit.

   Tout passe par les mêmes règles d'accès que le reste : ces
   fonctions ne donnent aucun pouvoir, elles demandent. Si le rôle
   ne porte pas l'autorisation, le serveur refuse — et c'est très
   bien ainsi, parce qu'une application peut être modifiée et pas
   une politique de la base.

   Une exception, et elle est importante : créer un COMPTE
   (auth.users) demande la clé « service_role », qui passe outre
   toutes les règles. Cette clé ne doit jamais figurer dans
   l'application — n'importe qui l'extrairait de l'APK. Elle vit
   donc dans une fonction déployée à part, sur le serveur. Voir
   plus bas, et supabase/functions/comptes/.
   ============================================================ */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { enParallele, reduire } from './images';
import type { Role } from './session';

/* Après une écriture, les listes en mémoire sont périmées.

   ⚠ CE QUI ÉTAIT ÉCRIT ICI, ET POURQUOI C'ÉTAIT FAUX

   « On les invalide toutes plutôt que de choisir : se tromper de clé
   donne un écran qui montre l'ancienne valeur, et c'est le genre de
   défaut qu'on met des heures à comprendre. »

   Le raisonnement se tient, la conclusion coûte cher. Sans clé,
   « invalidateQueries() » refait TOUTES les requêtes ouvertes de
   l'application : les soixante-quatre membres avec leurs grades, les
   albums avec toutes leurs photos, les salons, les messages, les
   notifications, les présences, le journal d'accès. Une légende de
   photo corrigée redemandait l'annuaire entier.

   Sur la connexion d'Antananarivo, c'est la moitié de la lenteur que
   le club décrit. Et cela se voit à l'écran : chaque liste repasse
   par son état de chargement, donc l'application « clignote » après
   chaque geste.

   La prudence d'origine reste, mais autrement : chaque écriture
   NOMME ce qu'elle périme, et l'oubli d'une clé est un défaut de
   cette liste-là, visible et corrigeable — pas une raison de tout
   refaire à chaque fois.

   Les clés sont des PRÉFIXES : « messages » périme
   ['messages', <salon>] pour tous les salons, ce qui est bien ce
   qu'on veut d'un message supprimé par la modération. */
function useEcrire<T>(faire: (v: T) => Promise<void>, cles: string[]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: faire,
    onSuccess: () => {
      for (const cle of cles) void client.invalidateQueries({ queryKey: [cle] });
    }
  });
}

/* ---------------------------------------------- Les fiches */
export type SaisieFiche = {
  nom: string;
  prenom: string;
  grade_id: string | null;
  debut: string | null;
  biographie: string | null;
  date_naissance: string | null;
  telephone: string | null;
  adresse: string | null;
  /* Une note interne, à l'usage de l'encadrement seul : « ne peut
     pas courir », « rentre à pied ». Elle vit dans la table privée
     avec le reste, donc sous la même règle d'accès — un élève ne la
     lit pas, pas même la sienne. */
  notes: string | null;
};

/* Le numéro de membre est attribué par la BASE, pas ici : deux
   inscriptions simultanées produiraient sinon deux fois le même
   numéro. prochain_numero() s'en charge. */
export function useCreerFiche() {
  return useEcrire(async (s: SaisieFiche) => {
    const { data: numero, error: eNum } = await supabase.rpc('prochain_numero');
    if (eNum) throw eNum;

    const { data, error } = await supabase
      .from('profils')
      .insert({
        numero,
        nom: s.nom.trim().toUpperCase(),
        prenom: s.prenom.trim(),
        grade_id: s.grade_id,
        debut: s.debut,
        biographie: s.biographie
      })
      .select('id')
      .single();
    if (error) throw error;

    /* La vie privée vit dans une table SÉPARÉE : une règle d'accès
       porte sur une ligne, jamais sur une colonne. C'est ainsi que
       la date de naissance d'un mineur reste hors de l'annuaire. */
    if (s.date_naissance || s.telephone || s.adresse || s.notes) {
      const { error: ePrive } = await supabase.from('profils_prives').insert({
        profil_id: (data as { id: string }).id,
        date_naissance: s.date_naissance,
        telephone: s.telephone,
        adresse: s.adresse,
        notes: s.notes
      });
      if (ePrive) throw ePrive;
    }
  }, ['membres','fiche','comptes']);
}

export function useModifierFiche(id: string | undefined) {
  return useEcrire(async (s: SaisieFiche) => {
    if (!id) throw new Error('Aucune fiche à modifier.');

    /* Ni le numéro ni le rôle ne figurent ici : un déclencheur de la
       base les fige, et les envoyer ferait échouer toute la mise à
       jour. Le grade se change par son propre écran. */
    const { error } = await supabase
      .from('profils')
      .update({
        nom: s.nom.trim().toUpperCase(),
        prenom: s.prenom.trim(),
        debut: s.debut,
        biographie: s.biographie
      })
      .eq('id', id);
    if (error) throw error;

    const { error: ePrive } = await supabase.from('profils_prives').upsert(
      {
        profil_id: id,
        date_naissance: s.date_naissance,
        telephone: s.telephone,
        adresse: s.adresse,
        notes: s.notes
      },
      { onConflict: 'profil_id' }
    );
    if (ePrive) throw ePrive;
  }, ['membres','fiche']);
}

/* Le grade passe par l'administration seule, et jamais par la fiche :
   un élève qui « corrige sa fiche » ne doit pas pouvoir se promouvoir.
   Un déclencheur de la base l'interdit ; cet appel est le chemin
   autorisé. */
export function useChangerGrade() {
  return useEcrire(async ({ profilId, gradeId }: { profilId: string; gradeId: string }) => {
    const { error } = await supabase
      .from('profils')
      .update({ grade_id: gradeId })
      .eq('id', profilId);
    if (error) throw error;
  }, ['membres','fiche']);
}

/* ---------------------------------------------- Les grades

   Ils vivaient en base et ne se modifiaient que par le tableau de
   bord Supabase — c'est-à-dire par le développeur. Un club qui
   renomme une ceinture ou en ajoute une devait donc écrire à
   quelqu'un et attendre. Cela ne se serait pas fait.

   Le grade n'est PAS supprimé quand le club cesse de l'employer : des
   fiches y sont rattachées, et une suppression casserait leur
   historique. Il est désactivé, comme une fiche d'élève. */
export type SaisieGrade = { nom: string; couleur: string; rang: number };

export function useCreerGrade() {
  return useEcrire(async (g: SaisieGrade) => {
    const { error } = await supabase
      .from('grades')
      .insert({ nom: g.nom.trim(), couleur: g.couleur, rang: g.rang });
    if (error) throw error;
  }, ['grades','membres','fiche']);
}

export function useModifierGrade() {
  return useEcrire(async ({ id, ...g }: SaisieGrade & { id: string }) => {
    const { error } = await supabase
      .from('grades')
      .update({ nom: g.nom.trim(), couleur: g.couleur, rang: g.rang })
      .eq('id', id);
    if (error) throw error;
  }, ['grades','membres','fiche']);
}

export function useActiverGrade() {
  return useEcrire(async ({ id, actif }: { id: string; actif: boolean }) => {
    const { error } = await supabase.from('grades').update({ actif }).eq('id', id);
    if (error) throw error;
  }, ['grades']);
}

/* ---------------------------------------------- Le rôle

   « Attribution du rôle de maître — par l'administration seule » :
   c'est l'une des fonctionnalités validées à la livraison de la
   maquette, et aucun écran ne la tenait. Le club ne pouvait donc
   promouvoir personne — et l'espace des maîtres, construit et
   protégé, n'aurait jamais servi à personne d'autre qu'aux comptes
   posés à la main en base.

   Le déclencheur « figer_profil » interdit déjà à un membre de
   changer son propre rôle : « le rôle, le numéro, le grade, le
   compte et l'activation ne se modifient que par l'administration ».
   Cet appel est le chemin autorisé, pas une permission de plus.

   ⚠ Un garde-fou qui n'est PAS une règle d'accès, et qui n'a pas à
   en être une : refuser à l'administration de se retirer son propre
   rôle. Ce n'est pas une question de sécurité — quelqu'un qui veut
   le faire y arrivera par le tableau de bord — c'est une question
   d'accident. S'il ne reste aucun administrateur, plus personne ne
   peut en nommer un depuis l'application, et le club est enfermé
   dehors. */
export function useChangerRole() {
  return useEcrire(async ({ profilId, role }: { profilId: string; role: Role }) => {
    const { data, error } = await supabase
      .from('profils')
      .update({ role })
      .eq('id', profilId)
      .select('id');
    if (error) throw error;
    /* Comme pour la correction d'un message : une mise à jour qu'une
       règle d'accès écarte ne rend pas d'erreur. Sans « .select() »,
       un refus s'annoncerait comme un succès. */
    if (!data?.length) {
      throw new Error('Le serveur a refusé ce changement de rôle.');
    }
  }, ['membres','fiche','comptes']);
}

export function useDesactiver() {
  return useEcrire(async ({ profilId, actif }: { profilId: string; actif: boolean }) => {
    /* On désactive, on ne supprime pas : un élève qui revient
       retrouve son numéro, son grade et son historique. */
    const { error } = await supabase.from('profils').update({ actif }).eq('id', profilId);
    if (error) throw error;
  }, ['membres','fiche','comptes']);
}

/* ---------------------------------------------- Les tuteurs */
export type SaisieTuteur = {
  nom: string;
  lien: string;
  telephone: string | null;
  urgence: boolean;
};

export function useAjouterTuteur(profilId: string | undefined) {
  return useEcrire(async (t: SaisieTuteur) => {
    const { error } = await supabase.from('tuteurs').insert({ profil_id: profilId, ...t });
    if (error) throw error;
  }, ['fiche']);
}

export function useRetirerTuteur() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('tuteurs').delete().eq('id', id);
    if (error) throw error;
  }, ['fiche']);
}

/* ---------------------------------------------- Publication */
export type SaisieActualite = {
  titre: string;
  categorie: string;
  texte: string;
  date_evt: string | null;
  lieu: string | null;
  /* Le chemin dans le seau « album », pas l'adresse : les seaux sont
     privés et l'adresse signée expire. Stocker l'adresse donnerait
     une actualité dont l'image cesse de s'afficher au bout d'une
     heure. */
  image: string | null;
  publiee: boolean;
};

/* L'identifiant est un paramètre de la MUTATION, jamais du hook.

   C'est la leçon de l'album : passé au hook, il serait capturé au
   rendu, et choisir une actualité puis enregistrer dans la même
   interaction écrirait dans la précédente — ou créerait un doublon.
   Le défaut est silencieux et se découvre en relisant le casier du
   club trois jours plus tard.

   Sans identifiant, on crée. Avec, on remplace. */
export function usePublier() {
  return useEcrire(async ({ id, ...s }: SaisieActualite & { id?: string }) => {
    if (id) {
      const { error } = await supabase.from('actualites').update(s).eq('id', id);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('actualites').insert(s);
    if (error) throw error;
  }, ['actualites','actualite','notifications']);
}

export function useSupprimerActualite() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('actualites').delete().eq('id', id);
    if (error) throw error;
  }, ['actualites','actualite']);
}

/* Une notification est une ligne PAR membre : la table porte
   profil_id, pour que chacun marque la sienne comme lue sans
   toucher à celle des autres. On les écrit donc toutes d'un coup. */
export function useNotifierTous() {
  return useEcrire(
    async ({ titre, texte, vers }: { titre: string; texte: string; vers: string | null }) => {
      const { data, error } = await supabase.from('profils').select('id').eq('actif', true);
      if (error) throw error;
      const lignes = (data as { id: string }[]).map((p) => ({
        profil_id: p.id,
        titre,
        texte: texte || null,
        vers
      }));
      if (!lignes.length) throw new Error('Aucun membre actif à prévenir.');
      const { error: eIns } = await supabase.from('notifications').insert(lignes);
      if (eIns) throw eIns;
    },
    ['notifications']
  );
}

/* ---------------------------------------------- Albums et photos */
export function useCreerAlbum() {
  return useEcrire(async ({ titre, categorie }: { titre: string; categorie: string }) => {
    const { error } = await supabase.from('albums').insert({ titre, categorie });
    if (error) throw error;
  }, ['albums']);
}

export function useSupprimerAlbum() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) throw error;
  }, ['albums']);
}

/* Le fichier part dans un seau, la base n'en garde que le chemin.
   Le nom est tiré au sort : deux téléphones qui envoient tous deux
   « IMG_0001.jpg » écraseraient sinon la photo l'un de l'autre. */
export async function televerser(seau: string, fichier: File): Promise<string> {
  /* ⚠ La RÉDUCTION, qui manquait ici.

     Elle n'existait que dans la messagerie. Les albums, les portraits
     et la photo du club envoyaient donc les fichiers TELS QUELS —
     trois à cinq mégaoctets par cliché sortant d'un téléphone récent.
     Le club a signalé un import « horriblement lent » : c'en est la
     moitié de la cause.

     Mesuré dans un navigateur sur un cliché 4032x3024 :
     7436 ko → 1086 ko. Presque sept fois moins à transporter, pour
     celui qui envoie comme pour chacun des soixante-quatre qui
     regardent ensuite. */
  const envoye = await reduire(fichier);
  const ext = envoye.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const chemin = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(seau).upload(chemin, envoye, {
    cacheControl: '3600',
    upsert: false,
    contentType: envoye.type
  });
  if (error) throw error;
  return chemin;
}

/* L'album est un paramètre de la MUTATION, pas du hook. Le passer
   au hook le capturait au rendu : choisir l'album et lancer l'envoi
   dans la même interaction envoyait les photos dans l'album
   précédent, ou nulle part. */
export function useAjouterPhotos() {
  return useEcrire(
    async ({
      albumId, fichiers, legende
    }: { albumId: string; fichiers: File[]; legende?: string }) => {
      if (!albumId) throw new Error('Aucun album choisi.');
      /* La légende est celle de l'ENVOI, donc la même pour les vingt
         photos qui rentrent d'une compétition — « Championnat
         régional, mars 2026 ». C'est ce qu'on peut raisonnablement
         demander à quelqu'un qui vide sa carte mémoire ; en exiger
         une par photo aurait pour seul effet qu'il n'y en aurait
         aucune. Chacune se corrige ensuite individuellement. */
      const commune = legende?.trim() || null;

      /* ⚠ LE RANG N'EST PAS UN HORODATAGE.

         Il valait « Date.now() » : un nombre de treize chiffres dans
         une colonne « integer », dont le maximum est 2 147 483 647.
         Le serveur refusait donc TOUT ajout de photo, avec un message
         que personne ne pouvait relier à l'album :

             value "1788248967396" is out of range for type integer

         L'intention était bonne — poser la nouvelle photo APRÈS les
         autres — mais un compteur qui déborde n'ordonne rien du tout.
         On demande donc à la base où elle en est. Un seul appel, et
         la réponse est un vrai rang. */
      const { data: dernier, error: eRang } = await supabase
        .from('photos')
        .select('rang')
        .eq('album_id', albumId)
        .order('rang', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (eRang) throw eRang;
      const depart = (dernier?.rang ?? 0) + 1;

      /* Les envois de FRONT, et l'insertion en UN SEUL appel.

         Vingt photos faisaient quarante allers-retours enchaînés :
         envoyer, écrire, envoyer, écrire… Sur un réseau malgache,
         c'est là que passait l'essentiel de l'attente.

         Trois envois de front — pas vingt, qui satureraient la
         connexion et les feraient toutes échouer au lieu d'une — puis
         une seule insertion pour toutes les lignes. L'ordre des
         résultats est conservé : il porte le rang. */
      const chemins = await enParallele(fichiers, 3, (f) => televerser('album', f));

      const { data, error } = await supabase
        .from('photos')
        .insert(
          chemins.map((chemin, i) => ({
            album_id: albumId,
            chemin,
            legende: commune,
            rang: depart + i
          }))
        )
        .select('id');
      if (error) throw error;
      /* Zéro ligne écrite alors que le serveur n'a rien signalé :
         c'est le refus silencieux que ce projet a déjà payé trois
         fois. Les fichiers seraient dans le seau et l'album resterait
         vide. */
      if (!data?.length) {
        throw new Error(
          'Les photos sont sur le serveur mais aucune ligne n’a été écrite — réessayez.'
        );
      }
    },
    ['albums']
  );
}

/* Corriger la légende d'une photo — une faute de frappe, un nom mal
   orthographié. Vide, elle redevient nulle plutôt que chaîne vide :
   l'écran affiche alors son texte de repli au lieu d'un blanc. */
export function useLegender() {
  return useEcrire(async ({ id, legende }: { id: string; legende: string }) => {
    const { error } = await supabase
      .from('photos')
      .update({ legende: legende.trim() || null })
      .eq('id', id);
    if (error) throw error;
  }, ['albums']);
}

/* La photo qui représente l'album. On enregistre son CHEMIN et non
   son identifiant : l'affichage a besoin du chemin pour demander une
   adresse signée, et passer par l'identifiant obligerait à retrouver
   la photo dans la liste à chaque rendu. */
export function useCouverture() {
  return useEcrire(async ({ albumId, chemin }: { albumId: string; chemin: string | null }) => {
    const { error } = await supabase
      .from('albums')
      .update({ couverture: chemin })
      .eq('id', albumId);
    if (error) throw error;
  }, ['albums']);
}

/* Déplacer une photo dans l'album.

   Les deux rangs sont ÉCHANGÉS, plutôt que renumérotés de proche en
   proche : renuméroter vingt photos pour en déplacer une ferait
   vingt écritures là où deux suffisent, sur un réseau qui n'aime pas
   les allers-retours. L'ordre reste juste puisque seul l'ordre
   relatif compte.

   Deux mises à jour, et non un « upsert » de deux lignes : un upsert
   est un INSERT avec repli, et l'insertion exigerait album_id et
   chemin, qui ne sont pas obligatoires ici. Il échouerait sur une
   contrainte au lieu de déplacer la photo.

   Si la seconde échoue, deux photos portent le même rang : elles se
   suivent dans un ordre indéterminé, ce qui se corrige d'un appui.
   L'inverse — renuméroter et s'arrêter au milieu — laisserait des
   trous et un ordre faux durablement. */
export function useDeplacerPhoto() {
  return useEcrire(
    async ({ a, b }: { a: { id: string; rang: number }; b: { id: string; rang: number } }) => {
      const { error } = await supabase.from('photos').update({ rang: b.rang }).eq('id', a.id);
      if (error) throw error;
      const { error: e2 } = await supabase.from('photos').update({ rang: a.rang }).eq('id', b.id);
      if (e2) throw e2;
    },
    ['albums']
  );
}

export function useSupprimerPhoto() {
  return useEcrire(async ({ id, chemin }: { id: string; chemin: string }) => {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
    /* Le fichier part après la ligne : si l'inverse échouait à
       mi-chemin, la base montrerait une photo qui n'existe plus. */
    await supabase.storage.from('album').remove([chemin]);
  }, ['albums']);
}

export function useChangerPortrait() {
  return useEcrire(async ({ profilId, fichier }: { profilId: string; fichier: File }) => {
    const chemin = await televerser('portraits', fichier);
    const { error } = await supabase.from('profils').update({ photo: chemin }).eq('id', profilId);
    if (error) throw error;
  }, ['membres','fiche','urls']);
}

/* ---------------------------------------------- Les salons

   « Salons par grade » et « salon par événement » figuraient tous
   deux dans la liste validée à la livraison de la maquette, et rien
   ne les créait : le club n'avait que les salons posés à la main en
   base, et n'aurait jamais pu ouvrir un fil pour un tournoi.

   Créer un salon et y inscrire quelqu'un sont réservés à
   l'administration — c'est ce qui empêche un élève de s'inscrire
   tout seul dans l'espace des maîtres. Ces fonctions sont le chemin
   autorisé ; le serveur refuserait les mêmes gestes à un autre rôle.

   L'ordre compte : le salon d'abord, les membres ensuite. Si la
   seconde écriture échoue, il reste un salon vide, que l'on peuple
   d'un second essai. L'inverse est impossible — on ne peut pas
   inscrire dans un salon qui n'existe pas. */
export function useCreerSalon() {
  return useEcrire(
    async ({
      type, titre, couleur, membres
    }: {
      type: 'grade' | 'evenement' | 'club';
      titre: string;
      couleur: string;
      membres: string[];
    }) => {
      const { data, error } = await supabase
        .from('salons')
        .insert({ type, titre: titre.trim(), couleur })
        .select('id')
        .single();
      if (error) throw error;

      const salonId = (data as { id: string }).id;
      if (!membres.length) return;

      const { error: eMembres } = await supabase
        .from('membres_salon')
        .insert(membres.map((profil_id) => ({ salon_id: salonId, profil_id })));
      if (eMembres) throw eMembres;
    },
    ['salons','membres-salon']
  );
}

/* Qui est dans un salon. Les règles d'accès ne rendent la liste
   complète qu'à ses membres — l'administration la voit par sa propre
   règle. */
export function useMembresSalon(salonId: string | undefined) {
  return useQuery({
    queryKey: ['membres-salon', salonId],
    enabled: Boolean(salonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membres_salon')
        .select('profil_id, profils:profil_id ( nom, prenom, numero )')
        .eq('salon_id', salonId!);
      if (error) throw error;
      type Ligne = {
        profil_id: string;
        profils:
          | { nom: string; prenom: string; numero: string }
          | { nom: string; prenom: string; numero: string }[]
          | null;
      };
      return (data as unknown as Ligne[]).map((l) => ({
        profil_id: l.profil_id,
        membre: Array.isArray(l.profils) ? (l.profils[0] ?? null) : l.profils
      }));
    }
  });
}

export function useInscrireAuSalon() {
  return useEcrire(async ({ salonId, profilIds }: { salonId: string; profilIds: string[] }) => {
    if (!profilIds.length) return;
    /* « upsert » plutôt qu'« insert » : réinscrire quelqu'un qui est
       déjà là est un geste ordinaire — on ajoute dix personnes dont
       deux y étaient — et cela ne doit pas faire échouer les huit
       autres sur une contrainte d'unicité. */
    const { error } = await supabase
      .from('membres_salon')
      .upsert(
        profilIds.map((profil_id) => ({ salon_id: salonId, profil_id })),
        { onConflict: 'salon_id,profil_id', ignoreDuplicates: true }
      );
    if (error) throw error;
  }, ['membres-salon','salons']);
}

export function useRetirerDuSalon() {
  return useEcrire(async ({ salonId, profilId }: { salonId: string; profilId: string }) => {
    const { error } = await supabase
      .from('membres_salon')
      .delete()
      .eq('salon_id', salonId)
      .eq('profil_id', profilId);
    if (error) throw error;
  }, ['membres-salon','salons']);
}

/* ---------------------------------------------- Réglages et horaires */

/* Tous les réglages d'un coup, pas un par un : l'écran présente un
   formulaire, et l'enregistrer champ par champ laisserait la moitié
   des valeurs à jour et l'autre pas si le réseau lâche au milieu.

   « upsert » plutôt que « update » : un réglage que le club n'avait
   jamais posé n'existe pas encore en base, et un update ne créerait
   rien — le champ paraîtrait s'enregistrer sans effet. */
export type Reglage = { cle: string; valeur: string; libelle: string };

export function useEnregistrerReglages() {
  return useEcrire(async (lignes: Reglage[]) => {
    if (!lignes.length) return;
    /* ⚠ « .select() » N'EST PAS DÉCORATIF.

       Sans lui, une écriture que les règles du serveur refusent
       revient SANS erreur et sans rien avoir écrit : l'écran
       annonce « Enregistré », et le club découvre des semaines plus
       tard que le numéro de téléphone n'a jamais changé. Ce projet
       a déjà payé trois fois ce défaut exact, ailleurs.

       Il compte double depuis que ces réglages s'écrivent aussi
       depuis l'écran du Club : un maître y pose la photo du club —
       la migration 0013 le lui permet — mais PAS la présentation ni
       le contact. Le refus est donc un cas normal, pas une
       hypothèse, et il doit se voir. */
    const { data, error } = await supabase
      .from('reglages')
      .upsert(
        lignes.map((l) => ({ cle: l.cle, valeur: l.valeur.trim() || null, libelle: l.libelle })),
        { onConflict: 'cle' }
      )
      .select('cle');
    if (error) throw error;
    if (!data || data.length < lignes.length) {
      throw new Error(
        'Le serveur n’a pas accepté cette modification — votre rôle ne permet ' +
          'peut-être pas de la faire. Rien n’a été changé.'
      );
    }
  }, ['reglages','urls']);
}

export function useAjouterHoraire() {
  return useEcrire(
    /* Le lieu manquait, et il était pourtant AFFICHÉ : l'écran du
       club le lit depuis la base, si bien qu'il restait
       éternellement vide. Un créneau au dojo et un créneau au
       gymnase ne se distinguaient pas. */
    async (h: { jour: number; debut: string; fin: string; niveau: string; lieu?: string }) => {
      const { error } = await supabase
        .from('horaires')
        .insert({ ...h, lieu: h.lieu?.trim() || null });
      if (error) throw error;
    },
    ['horaires']
  );
}

export function useRetirerHoraire() {
  return useEcrire(async (id: string) => {
    /* On désactive plutôt que de supprimer : un créneau retiré pour
       les travaux revient souvent, et le retrouver vaut mieux que de
       le ressaisir. */
    const { error } = await supabase.from('horaires').update({ actif: false }).eq('id', id);
    if (error) throw error;
  }, ['horaires']);
}

/* ---------------------------------------------- Comptes et accès

   Ici, et seulement ici, l'application ne peut PAS faire le travail
   elle-même. Créer un compte ou réinitialiser un mot de passe
   demande la clé « service_role », qui passe outre toutes les
   règles d'accès. La mettre dans l'APK reviendrait à la publier :
   n'importe qui l'en extrairait et lirait la date de naissance de
   tous les mineurs du club.

   Elle vit donc sur le serveur, dans une fonction déployée à part
   qui vérifie elle-même que l'appelant est bien l'administration.
   Tant qu'elle n'est pas déployée, cet appel échoue franchement et
   l'écran le dit — plutôt que de laisser croire que le compte a été
   créé.
   ------------------------------------------------------------ */
export type ResultatCompte = { ok: true; motDePasse?: string } | { ok: false; message: string };

async function appelerFonction(action: string, corps: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('comptes', {
    body: { action, ...corps }
  });
  if (error) {
    /* Distinguer « pas déployée » de « refusée » : ce n'est pas la
       même chose à faire ensuite, et un message générique enverrait
       chercher au mauvais endroit.

       Le STATUT, pas le message : supabase-js enveloppe toute
       réponse non-2xx dans le même texte, « Edge Function returned
       a non-2xx status code ». Chercher « 404 » dedans ne trouvait
       jamais rien, et l'écran annonçait un refus du serveur là où
       la fonction n'existait pas. */
    const statut = (error as { context?: { status?: number } }).context?.status;
    if (statut === 404) {
      return {
        ok: false as const,
        message:
          'La fonction « comptes » n’est pas déployée sur le serveur. ' +
          'Voir supabase/functions/comptes/LISEZ-MOI.md.'
      };
    }

    /* Le corps de la réponse porte le vrai message — « Réservé à
       l'administration », par exemple. Le lire vaut mieux que de
       répéter le texte générique de la bibliothèque. */
    let detail = String(error.message ?? '');
    try {
      const corps = await (error as { context?: Response }).context?.json?.();
      if (corps?.message) detail = String(corps.message);
    } catch {
      /* Réponse sans corps JSON : on garde le message générique. */
    }
    return { ok: false as const, message: 'Le serveur a refusé : ' + detail };
  }
  return { ok: true as const, ...(data as { motDePasse?: string }) };
}

export function useCreerCompte() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ profilId }: { profilId: string }): Promise<ResultatCompte> =>
      appelerFonction('creer', { profilId }),
    /* Un compte neuf change QUI a un compte, et le rôle affiché dans
       l'annuaire. Rien d'autre : ni les albums, ni les messages. */
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['comptes'] });
      void client.invalidateQueries({ queryKey: ['membres'] });
    }
  });
}

export function useReinitialiser() {
  return useMutation({
    mutationFn: ({ profilId }: { profilId: string }): Promise<ResultatCompte> =>
      appelerFonction('reinitialiser', { profilId })
  });
}

export function useSuspendre() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ profilId, suspendu }: { profilId: string; suspendu: boolean }): Promise<ResultatCompte> =>
      appelerFonction('suspendre', { profilId, suspendu }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['comptes'] });
      void client.invalidateQueries({ queryKey: ['membres'] });
    }
  });
}

/* Qui a un compte, et qui n'en a pas. « compte_id » est nul pour
   l'élève sans téléphone — le cas ordinaire, pas l'exception. */
export function useComptes() {
  return useQuery({
    queryKey: ['comptes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profils')
        .select('id, numero, nom, prenom, role, actif, compte_id')
        .order('nom');
      if (error) throw error;
      return data as {
        id: string;
        numero: string;
        nom: string;
        prenom: string;
        role: 'eleve' | 'maitre' | 'admin';
        actif: boolean;
        compte_id: string | null;
      }[];
    }
  });
}

/* ---------------------------------------------- Participations

   Qui vient à une sortie, et ce que le club a REÇU. La nuance
   compte : l'application ouvre le clavier avec le code MVola, elle
   ne parle pas à l'opérateur et ne peut pas savoir si le transfert a
   abouti. Seule l'administration inscrit donc un versement — un
   membre qui le ferait lui-même se pointerait à crédit, et un test
   de sécurité avait précisément trouvé ce trou.
   ------------------------------------------------------------ */
export type ParticipationVue = {
  id: string;
  accompagnants: number;
  montant_promis: number | null;
  /* Le mot laissé en s'inscrivant. Le club le lit ici : il ne
     servirait à rien qu'un membre puisse l'écrire si personne ne le
     voyait jamais. */
  note: string | null;
  membre: { nom: string; prenom: string; numero: string } | null;
  versements: { id: string; montant: number; recu_le: string }[];
};

type LigneParticipation = Omit<ParticipationVue, 'membre'> & {
  profils: { nom: string; prenom: string; numero: string } | null;
};

export function useParticipations(actualiteId: string | undefined) {
  return useQuery({
    queryKey: ['participations', actualiteId],
    enabled: Boolean(actualiteId),
    queryFn: async (): Promise<ParticipationVue[]> => {
      const { data, error } = await supabase
        .from('participations')
        .select(
          `id, accompagnants, montant_promis, note,
           profils:profil_id ( nom, prenom, numero ),
           versements ( id, montant, recu_le )`
        )
        .eq('actualite_id', actualiteId!)
        .order('cree_le');
      if (error) throw error;
      return (data as unknown as LigneParticipation[]).map(({ profils, ...p }) => ({
        ...p,
        membre: profils,
        versements: [...(p.versements ?? [])].sort((a, b) => a.recu_le.localeCompare(b.recu_le))
      }));
    }
  });
}

export function usePointerVersement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      participationId, montant, reference
    }: { participationId: string; montant: number; reference?: string }) => {
      if (!Number.isFinite(montant) || montant <= 0) {
        throw new Error('Le montant doit être un nombre positif.');
      }
      const { error } = await supabase.from('versements').insert({
        participation_id: participationId,
        montant: Math.round(montant),
        reference: reference?.trim() || null
      });
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['participations'] })
  });
}

/* ---------------------------------------------- Les catégories

   Elles étaient écrites dans le code pour les actualités, et tapées
   à la main pour les albums. Le club les tient maintenant lui-même.

   Comme les grades, une catégorie ne se SUPPRIME pas quand le club
   cesse de l'employer : des actualités la portent, et l'effacer
   laisserait leur rubrique sans couleur ni place dans le filtre. On
   la désactive — elle cesse d'être proposée, ce qui est ce qu'on
   voulait dire. */
export type SaisieCategorie = {
  genre: 'actualite' | 'album';
  nom: string;
  couleur: string;
  rang: number;
};

export function useCreerCategorie() {
  return useEcrire(async (c: SaisieCategorie) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...c, nom: c.nom.trim() })
      .select('id');
    if (error) throw error;
    if (!data?.length) {
      throw new Error('Le serveur a refusé cette catégorie — êtes-vous administrateur ?');
    }
  }, ['categories']);
}

export function useModifierCategorie() {
  return useEcrire(async ({ id, ...c }: SaisieCategorie & { id: string }) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ nom: c.nom.trim(), couleur: c.couleur, rang: c.rang })
      .eq('id', id)
      .select('id');
    if (error) throw error;
    /* ⚠ Sans « .select() », une modification que les règles écartent
       revient sans erreur et l'écran annonce un succès qui n'a pas
       eu lieu. Ce projet a payé ce défaut quatre fois. */
    if (!data?.length) {
      throw new Error('Le serveur a refusé cette modification — êtes-vous administrateur ?');
    }
  }, ['categories']);
}

export function useActiverCategorie() {
  return useEcrire(async ({ id, actif }: { id: string; actif: boolean }) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ actif })
      .eq('id', id)
      .select('id');
    if (error) throw error;
    if (!data?.length) {
      throw new Error('Le serveur a refusé — êtes-vous administrateur ?');
    }
  }, ['categories']);
}
