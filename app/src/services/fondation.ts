/* ============================================================
   La fondation du club : le premier compte se crée lui-même, puis
   l'inscription se ferme.

   « Je veux que le super admin crée son compte via inscription ; une
   fois créé, la création du compte par inscription sera coupée. »

   ------------------------------------------------------------
   CE QUI FERME LA PORTE, ET CE QUI NE LA FERME PAS

   Ce fichier NE ferme rien. Il DEMANDE si elle est ouverte, et il
   affiche la réponse. C'est une distinction qui compte : un écran
   qui cache un bouton ne protège rien, puisque l'inscription est un
   appel HTTP qui s'envoie depuis n'importe quel outil.

   Le verrou est dans la base — une ligne « fondation_faite » dont la
   clé est primaire, plus l'existence d'un super administrateur. La
   migration 0024 le détaille. Même en modifiant l'APK, on ne peut
   pas se fabriquer un compte super administrateur le lendemain de
   l'installation.
   ============================================================ */
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

/* Le minimum que le serveur exige aussi. Il est écrit des DEUX
   côtés : ici pour le dire avant l'envoi, là-bas parce que c'est le
   seul endroit qui décide. Un contrôle qui n'existe que dans
   l'écran ne contrôle rien. */
export const MINIMUM_MOT_DE_PASSE = 8;

/* ------------------------------------------------------------
   « La porte est-elle encore ouverte ? »

   Posée SANS ÊTRE CONNECTÉ — c'est tout l'objet. La fonction est
   accordée à « anon » dans la migration ; elle ne rend qu'un
   booléen, jamais un nom ni un effectif.

   En cas de panne on répond FAUX : mieux vaut ne pas proposer
   l'inscription à quelqu'un dont le club est déjà fondé que de la
   proposer à tort et de le laisser se heurter au refus du serveur.
   ------------------------------------------------------------ */
export function useFondationOuverte() {
  return useQuery({
    queryKey: ['fondation'],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('fondation_ouverte');
      if (error) return false;
      return data === true;
    },
    /* Elle ne change qu'une fois dans la vie du club : inutile de la
       redemander à chaque retour sur l'écran. */
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}

export type SaisieFondation = { nom: string; prenom: string; motDePasse: string };
export type ResultatFondation = { ok: true; numero: string } | { ok: false; message: string };

/* ------------------------------------------------------------
   Fonder.

   Le numéro n'est PAS choisi ici : c'est la base qui l'attribue, et
   c'est elle qui le renvoie. On l'affiche ensuite, parce que c'est
   avec lui — et non avec un nom — qu'on se connectera désormais.
   ------------------------------------------------------------ */
export function useFonder() {
  return useMutation({
    mutationFn: async (saisie: SaisieFondation): Promise<ResultatFondation> => {
      /* Une fonction À PART, et non une action de « comptes ». C'est
         la seule du projet qui ne peut pas exiger de jeton — celui
         qui la demande n'a pas encore de compte — elle est donc
         déployée sans barrière d'entrée. « comptes », qui crée,
         suspend et supprime les membres, garde la sienne. */
      const { data, error } = await supabase.functions.invoke('fondation', {
        body: saisie
      });

      if (error) {
        const statut = (error as { context?: { status?: number } }).context?.status;
        if (statut === 404) {
          return {
            ok: false,
            message:
              'La fonction « fondation » n’est pas déployée sur le serveur. ' +
              'Voir supabase/functions/fondation/LISEZ-MOI.md.'
          };
        }
        /* Le corps porte le vrai message — « L'inscription est
           fermée », par exemple. Le texte générique de la
           bibliothèque enverrait chercher au mauvais endroit. */
        let detail = String(error.message ?? '');
        try {
          const corps = await (error as { context?: Response }).context?.json?.();
          if (corps?.message) detail = String(corps.message);
        } catch {
          /* Réponse sans corps JSON : on garde le message générique. */
        }
        return { ok: false, message: detail };
      }

      const numero = (data as { numero?: string } | null)?.numero;
      if (!numero) return { ok: false, message: 'Le serveur n’a pas renvoyé de numéro.' };
      return { ok: true, numero };
    }
  });
}
