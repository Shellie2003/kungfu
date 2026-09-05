/* ============================================================
   Le temps réel, en un seul endroit.

   « Le message n'est pas en temps réel : l'utilisateur doit sortir
   de la conversation pour voir un nouveau message. »

   ------------------------------------------------------------
   CE QUI MANQUAIT VRAIMENT

   Pas ce fichier : la PUBLICATION, côté base. PostgreSQL n'envoie
   les changements d'une table que si elle appartient à la
   publication « supabase_realtime », et aucune migration ne l'avait
   déclarée. L'application s'abonnait donc à un canal parfaitement
   valide, qui répondait « SUBSCRIBED » et se taisait pour toujours.

   C'est réparé par supabase/migrations/0026_temps_reel.sql, qui
   explique le défaut en détail. Ce fichier-ci ne fait que ranger ce
   qui était déjà écrit — et l'étendre aux deux écrans qui
   n'écoutaient rien du tout.

   ------------------------------------------------------------
   POURQUOI UN SEUL ENDROIT

   L'abonnement était écrit à la main dans « useMessages », et nulle
   part ailleurs. Résultat : le fil ouvert se rafraîchissait, mais
   pas la LISTE des conversations ni la pastille de l'accueil. Il
   fallait quitter l'écran et y revenir — exactement ce dont le club
   se plaint.

   Trois écrans ont le même besoin ; le répéter trois fois aurait
   garanti qu'un jour l'un des trois oublie de se désabonner.
   ============================================================ */
import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Ecoute = {
  /* La table à suivre. Elle DOIT être dans la publication : sinon
     rien n'arrive, et sans le moindre message d'erreur. */
  table: 'messages' | 'salons' | 'notifications';
  /* Un filtre PostgREST — « salon_id=eq.<id> ». Sans lui, on reçoit
     tout ce que les règles d'accès autorisent, ce qui est parfois
     voulu (la liste des conversations) et parfois du gaspillage (un
     fil ouvert n'a que faire des autres salons). */
  filtre?: string;
  /* Ce qu'il faut redemander quand quelque chose bouge. On
     n'applique PAS le changement reçu : on redemande. La ligne
     brute n'a ni l'auteur, ni la pièce jointe signée, ni le compte
     des non-lus — la recomposer ici ferait deux vérités pour une
     même donnée. */
  cles: QueryKey[];
};

/* ------------------------------------------------------------
   S'abonner tant que l'écran est ouvert.

   « actif » permet d'attendre : un fil sans identifiant de salon ne
   doit pas ouvrir de canal, et rouvrir un canal à chaque rendu
   coûterait une connexion par frappe au clavier.
   ------------------------------------------------------------ */
export function useTempsReel(nom: string, ecoutes: Ecoute[], actif = true): void {
  const client = useQueryClient();

  /* Les écoutes sont recréées à chaque rendu par l'appelant — un
     tableau littéral n'est jamais égal au précédent. On les compare
     donc par leur CONTENU, sans quoi l'effet se relancerait sans
     fin : fermer et rouvrir une connexion WebSocket, plusieurs fois
     par seconde, sur le forfait des membres. */
  const signature = JSON.stringify(ecoutes);

  useEffect(() => {
    if (!actif) return;
    const liste: Ecoute[] = JSON.parse(signature);

    /* ⚠ UN NOM UNIQUE PAR ABONNEMENT.

       Deux canaux de même nom sur la même connexion se marchent
       dessus : le second remplace le premier, et l'écran qui se
       ferme emporte l'abonnement de celui qui reste. Cela arrive
       dès qu'un écran est monté deux fois — ce que React fait
       exprès en développement. */
    const canal = supabase.channel(`${nom}:${Math.random().toString(36).slice(2)}`);

    for (const e of liste) {
      canal.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: e.table,
          ...(e.filtre ? { filter: e.filtre } : {})
        },
        () => {
          for (const cle of e.cles) void client.invalidateQueries({ queryKey: cle });
        }
      );
    }

    canal.subscribe();
    return () => {
      void supabase.removeChannel(canal);
    };
  }, [nom, signature, actif, client]);
}
