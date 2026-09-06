/* ============================================================
   LES NOTIFICATIONS QUI SORTENT DU TÉLÉPHONE.

   « not-push — Notification sur le téléphone » : la dernière ligne
   du cahier des charges restée sans preuve.

   Jusqu'ici le club ne recevait rien quand l'application était
   fermée. Un cours déplacé, une sortie annulée : l'annonce attendait
   sagement dans le casier que quelqu'un pense à ouvrir l'application
   — c'est-à-dire, le plus souvent, après le cours.

   ------------------------------------------------------------
   POURQUOI FIREBASE, PUISQU'ON A DÉJÀ LE TEMPS RÉEL

   Le temps réel de Supabase tient une conversation ouverte tant que
   l'application tourne. Android COUPE cette conversation quelques
   secondes après le passage en arrière-plan, et tue le processus
   ensuite — c'est ce qui fait tenir la batterie.

   Faire sonner un téléphone dont l'application est fermée n'est donc
   pas une affaire d'application : seul le service système d'Android,
   qui lui ne dort jamais, peut le faire. Sur Android ce service est
   Firebase Cloud Messaging, et il n'a pas de concurrent — ce n'est
   pas un choix, c'est le seul chemin.

   ------------------------------------------------------------
   ⚠ CE FICHIER NE FAIT RIEN SUR LE WEB, ET RIEN SANS FIREBASE

   Sur le web : la page est ouverte ou elle ne l'est pas, il n'y a
   pas d'application à réveiller.

   Sans les identifiants Firebase — que le club doit créer, voir
   LIVRER.md — « register() » échoue. On rattrape l'échec et on
   n'affiche RIEN : les notifications dans l'application continuent
   d'arriver comme avant. Une fonctionnalité en moins n'est pas une
   panne, et ne doit pas se présenter comme telle à un membre qui
   n'y peut rien.

   Le greffon est chargé par « import() » et non en haut du fichier :
   il ne sert qu'à l'APK, et un import ordinaire l'embarquerait dans
   le paquet web, qui tient dans un budget de 245 ko.
   ============================================================ */
import { useEffect } from 'react';
import { supabase } from './supabase';
import { SUR_TELEPHONE } from './telechargement';
import { useSession } from './session';

/* Ce qu'on garde du greffon, réduit à ce qu'on emploie. Le typer
   ici plutôt que d'importer ses types évite de faire dépendre la
   compilation du web d'un paquet qui ne le concerne pas. */
type Permission = { receive: 'granted' | 'denied' | 'prompt' | string };
type GreffonPush = {
  checkPermissions: () => Promise<Permission>;
  requestPermissions: () => Promise<Permission>;
  register: () => Promise<void>;
  addListener: (
    nom: string,
    quoiFaire: (donnee: unknown) => void
  ) => Promise<{ remove: () => Promise<void> }>;
  removeAllListeners: () => Promise<void>;
};

/* ------------------------------------------------------------
   POSER LE JETON.

   « on conflict (jeton) do update » plutôt qu'un insert simple :
   Firebase rend le MÊME jeton à chaque ouverture tant qu'il est
   valide. Sans cela, la deuxième ouverture échouerait sur un doublon
   de clé — et l'échec serait muet, puisqu'on ne montre rien.

   Le « profil_id » est remis à jour dans la clause : c'est le cas du
   téléphone prêté, où le même appareil sert à quelqu'un d'autre.
   Sans cette ligne, l'ancien membre continuerait de recevoir les
   notifications destinées au nouveau.
   ------------------------------------------------------------ */
export async function poserLeJeton(
  jeton: string,
  profilId: string
): Promise<void> {
  const { error } = await supabase.from('jetons_push').upsert(
    {
      jeton,
      profil_id: profilId,
      plateforme: 'android',
      vu_le: new Date().toISOString()
    },
    { onConflict: 'jeton' }
  );
  if (error) throw error;
}

/* Au moment de se déconnecter. Sans ce retrait, le téléphone
   continuerait de sonner pour un membre qui n'est plus connecté
   dessus — le cas du téléphone partagé au club. */
export async function retirerLeJeton(jeton: string): Promise<void> {
  await supabase.from('jetons_push').delete().eq('jeton', jeton);
}

/* Le dernier jeton connu, gardé pour pouvoir le retirer à la
   déconnexion : le greffon ne sait pas le redonner sur demande. */
const CLE_JETON = 'waishi.jetonPush';

export function jetonRetenu(): string | null {
  try {
    return localStorage.getItem(CLE_JETON);
  } catch {
    return null;
  }
}

function retenirLeJeton(jeton: string): void {
  try {
    localStorage.setItem(CLE_JETON, jeton);
  } catch {
    /* Sans stockage, on ne saura pas retirer le jeton à la
       déconnexion. Le ménage des six mois s'en chargera. */
  }
}

/* ------------------------------------------------------------
   LE CROCHET, POSÉ UNE FOIS DANS L'APPLICATION.

   Il ne demande la permission QU'UNE FOIS CONNECTÉ. Android 13 et
   suivants ouvrent une boîte de dialogue système, et la poser sur
   l'écran de connexion — avant que la personne ait la moindre idée
   de ce qu'est cette application — est le moyen le plus sûr de se
   faire répondre « non » définitivement : Android ne redemande plus
   après deux refus.
   ------------------------------------------------------------ */
export function useNotificationsPush(): void {
  const profil = useSession((e) => e.profil);
  const profilId = profil?.id ?? null;

  useEffect(() => {
    if (!SUR_TELEPHONE || !profilId) return;
    let vivant = true;

    void (async () => {
      try {
        const { PushNotifications } = (await import(
          '@capacitor/push-notifications'
        )) as unknown as { PushNotifications: GreffonPush };

        let permission = await PushNotifications.checkPermissions();
        if (permission.receive === 'prompt') {
          permission = await PushNotifications.requestPermissions();
        }
        if (permission.receive !== 'granted' || !vivant) return;

        await PushNotifications.addListener('registration', (donnee) => {
          const jeton = (donnee as { value?: string })?.value;
          if (!jeton || !vivant) return;
          retenirLeJeton(jeton);
          void poserLeJeton(jeton, profilId).catch(() => {
            /* Le serveur n'a pas voulu du jeton. Les notifications
               dans l'application continuent d'arriver ; celle-ci ne
               sonnera pas. Rien à dire au membre, qui n'y peut rien. */
          });
        });

        /* ⚠ CE QUI SE PASSE QUAND ON TAPE LA NOTIFICATION.

           Sans cette écoute, taper « Cours de samedi déplacé » ouvre
           l'application sur l'ACCUEIL, et le membre doit retrouver
           lui-même de quoi on lui parlait. La notification aurait
           alors réveillé le téléphone pour rien.

           « vers » est le même champ que celui de la table
           « notifications » : l'écran à ouvrir. On le passe par le
           hachage parce que les routes de cette application sont des
           ancres — Capacitor sert les fichiers depuis le disque, où
           une adresse « propre » ne correspond à aucun fichier. */
        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (donnee) => {
            const vers = (
              donnee as { notification?: { data?: { vers?: unknown } } }
            )?.notification?.data?.vers;
            /* On n'accepte qu'un chemin INTERNE. Un « vers » venu du
               réseau qui commencerait par « http » ou « // » ferait
               sortir l'application vers une adresse choisie par qui
               a envoyé la notification. */
            if (typeof vers !== 'string') return;
            if (!vers.startsWith('/') || vers.startsWith('//')) return;
            window.location.hash = `#${vers}`;
          }
        );

        await PushNotifications.addListener('registrationError', () => {
          /* Le cas ordinaire tant que le club n'a pas créé son projet
             Firebase : pas de « google-services.json » dans l'APK,
             donc pas d'enregistrement possible. Ce n'est pas une
             panne de l'application. */
        });

        await PushNotifications.register();
      } catch {
        /* Greffon absent, ou Android qui refuse. On se tait. */
      }
    })();

    return () => {
      vivant = false;
    };
  }, [profilId]);
}
