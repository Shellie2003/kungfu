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

/* Après une écriture, les listes en mémoire sont périmées. On les
   invalide toutes plutôt que de choisir : se tromper de clé donne
   un écran qui montre l'ancienne valeur, et c'est le genre de
   défaut qu'on met des heures à comprendre. */
function useEcrire<T>(faire: (v: T) => Promise<void>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: faire,
    onSuccess: () => client.invalidateQueries()
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
    if (s.date_naissance || s.telephone || s.adresse) {
      const { error: ePrive } = await supabase.from('profils_prives').insert({
        profil_id: (data as { id: string }).id,
        date_naissance: s.date_naissance,
        telephone: s.telephone,
        adresse: s.adresse
      });
      if (ePrive) throw ePrive;
    }
  });
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
        adresse: s.adresse
      },
      { onConflict: 'profil_id' }
    );
    if (ePrive) throw ePrive;
  });
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
  });
}

export function useDesactiver() {
  return useEcrire(async ({ profilId, actif }: { profilId: string; actif: boolean }) => {
    /* On désactive, on ne supprime pas : un élève qui revient
       retrouve son numéro, son grade et son historique. */
    const { error } = await supabase.from('profils').update({ actif }).eq('id', profilId);
    if (error) throw error;
  });
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
  });
}

export function useRetirerTuteur() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('tuteurs').delete().eq('id', id);
    if (error) throw error;
  });
}

/* ---------------------------------------------- Publication */
export type SaisieActualite = {
  titre: string;
  categorie: string;
  texte: string;
  date_evt: string | null;
  lieu: string | null;
  publiee: boolean;
};

export function usePublier(id?: string) {
  return useEcrire(async (s: SaisieActualite) => {
    if (id) {
      const { error } = await supabase.from('actualites').update(s).eq('id', id);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('actualites').insert(s);
    if (error) throw error;
  });
}

export function useSupprimerActualite() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('actualites').delete().eq('id', id);
    if (error) throw error;
  });
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
    }
  );
}

/* ---------------------------------------------- Albums et photos */
export function useCreerAlbum() {
  return useEcrire(async ({ titre, categorie }: { titre: string; categorie: string }) => {
    const { error } = await supabase.from('albums').insert({ titre, categorie });
    if (error) throw error;
  });
}

export function useSupprimerAlbum() {
  return useEcrire(async (id: string) => {
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) throw error;
  });
}

/* Le fichier part dans un seau, la base n'en garde que le chemin.
   Le nom est tiré au sort : deux téléphones qui envoient tous deux
   « IMG_0001.jpg » écraseraient sinon la photo l'un de l'autre. */
export async function televerser(seau: string, fichier: File): Promise<string> {
  const ext = fichier.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const chemin = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(seau).upload(chemin, fichier, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return chemin;
}

/* L'album est un paramètre de la MUTATION, pas du hook. Le passer
   au hook le capturait au rendu : choisir l'album et lancer l'envoi
   dans la même interaction envoyait les photos dans l'album
   précédent, ou nulle part. */
export function useAjouterPhotos() {
  return useEcrire(async ({ albumId, fichiers }: { albumId: string; fichiers: File[] }) => {
    if (!albumId) throw new Error('Aucun album choisi.');
    let rang = Date.now();
    for (const f of fichiers) {
      const chemin = await televerser('album', f);
      const { error } = await supabase
        .from('photos')
        .insert({ album_id: albumId, chemin, rang: rang++ });
      if (error) throw error;
    }
  });
}

export function useSupprimerPhoto() {
  return useEcrire(async ({ id, chemin }: { id: string; chemin: string }) => {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
    /* Le fichier part après la ligne : si l'inverse échouait à
       mi-chemin, la base montrerait une photo qui n'existe plus. */
    await supabase.storage.from('album').remove([chemin]);
  });
}

export function useChangerPortrait() {
  return useEcrire(async ({ profilId, fichier }: { profilId: string; fichier: File }) => {
    const chemin = await televerser('portraits', fichier);
    const { error } = await supabase.from('profils').update({ photo: chemin }).eq('id', profilId);
    if (error) throw error;
  });
}

/* ---------------------------------------------- Réglages et horaires */
export function useEnregistrerReglage() {
  return useEcrire(async ({ cle, valeur }: { cle: string; valeur: string }) => {
    const { error } = await supabase.from('reglages').update({ valeur }).eq('cle', cle);
    if (error) throw error;
  });
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
    onSuccess: () => client.invalidateQueries()
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
    onSuccess: () => client.invalidateQueries()
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
