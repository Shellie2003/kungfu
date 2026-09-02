/* ============================================================
   Envoyer un fichier EN VOYANT où l'on en est.

   « Ajouter un cercle de progression pour les imports ou envois de
   document (photo, PDF, etc.) »

   Le besoin est réel et il est de premier ordre : sur la ligne
   d'Antananarivo, envoyer une photo prend cinq à quinze secondes.
   Pendant ce temps l'écran affichait « Envoi… », qui ne distingue
   pas « c'est parti, patiente » de « c'est bloqué depuis une
   minute ». On appuie donc une deuxième fois, et l'on envoie deux
   fois la même photo.

   ------------------------------------------------------------
   POURQUOI CE FICHIER N'EMPLOIE PAS supabase-js

   « supabase.storage.upload() » passe par « fetch », et fetch ne
   sait pas dire où en est un ENVOI. Il existe un jour où l'on
   pourra — les flux montants sont en train d'arriver dans les
   navigateurs — mais pas dans la WebView d'un Android 9 de 2019, et
   c'est ce téléphone-là qui compte ici.

   XMLHttpRequest, lui, a « upload.onprogress » depuis quinze ans.
   C'est de la plomberie ancienne, et c'est exactement pour cela
   qu'elle marche partout où le club se trouve.

   On parle donc à l'API de stockage directement. Elle est simple :
   un POST sur /storage/v1/object/<seau>/<chemin>, le jeton de
   session en en-tête, le fichier en corps.

   ------------------------------------------------------------
   CE QUI RESTE HONNÊTE

   L'anneau suit les OCTETS RÉELLEMENT PARTIS, pas une animation qui
   tourne. Quand le réseau s'arrête, l'anneau s'arrête — et c'est
   précisément l'information qu'on veut.

   Les derniers pour cent sont l'exception, et il faut le savoir :
   « onprogress » dit ce qui a quitté le téléphone, pas ce que le
   serveur a écrit. L'anneau atteint donc 100 % un instant avant la
   fin réelle. On garde l'état « en train de finir » jusqu'à la
   réponse, plutôt que d'annoncer un succès que le serveur n'a pas
   encore confirmé — c'est le défaut que ce projet a déjà payé
   plusieurs fois.
   ============================================================ */
import { ADRESSE, supabase } from './supabase';
import { reduire } from './images';
import type { Usage } from './images';

/* De 0 à 1 pendant l'envoi, puis « null » quand on attend la réponse
   du serveur : l'écran sait alors montrer un anneau plein qui
   patiente, au lieu d'un succès prématuré. */
export type Progres = (part: number | null) => void;

export async function envoyerFichier(
  seau: string,
  chemin: string,
  fichier: File,
  progres?: Progres
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const jeton = data.session?.access_token;
  if (!jeton) throw new Error('Session expirée — reconnectez-vous pour envoyer ce fichier.');

  await new Promise<void>((ok, non) => {
    const demande = new XMLHttpRequest();
    demande.open('POST', `${ADRESSE}/storage/v1/object/${seau}/${encodeURI(chemin)}`);
    demande.setRequestHeader('authorization', `Bearer ${jeton}`);
    demande.setRequestHeader('x-upsert', 'false');
    demande.setRequestHeader('cache-control', 'max-age=3600');
    if (fichier.type) demande.setRequestHeader('content-type', fichier.type);

    demande.upload.onprogress = (e) => {
      /* « lengthComputable » est faux quand la taille est inconnue —
         cela n'arrive pas pour un File, mais le vérifier coûte une
         ligne et évite d'afficher « NaN % ». */
      if (e.lengthComputable && e.total > 0) progres?.(e.loaded / e.total);
    };

    /* Tout est parti ; le serveur n'a pas encore répondu. */
    demande.upload.onload = () => progres?.(null);

    demande.onload = () => {
      if (demande.status >= 200 && demande.status < 300) {
        ok();
        return;
      }
      /* Le message du serveur plutôt qu'un code : « mime type
         application/pdf is not supported » se comprend, « 400 » non.
         C'est ce message-là qui aurait fait gagner des jours sur le
         PDF refusé. */
      let detail = `Le serveur a refusé le fichier (${demande.status}).`;
      try {
        const corps = JSON.parse(demande.responseText) as { message?: string; error?: string };
        if (corps.message || corps.error) detail = corps.message ?? corps.error ?? detail;
      } catch {
        /* Réponse illisible : on garde le message générique. */
      }
      non(new Error(detail));
    };

    demande.onerror = () =>
      non(new Error('La connexion a été perdue pendant l’envoi. Réessayez.'));
    demande.onabort = () => non(new Error('Envoi interrompu.'));

    demande.send(fichier);
  });
}

/* Le chemin d'un fichier neuf : un identifiant tiré au sort, pour
   que deux « IMG_0001.jpg » ne s'écrasent pas. */
export const cheminNeuf = (nom: string) => {
  const ext = nom.split('.').pop()?.toLowerCase() ?? 'jpg';
  return `${crypto.randomUUID()}.${ext}`;
};

/* Réduire puis envoyer, en rendant le chemin écrit. C'est ce
   qu'appellent les écrans ; « televerser » de admin.ts s'appuie
   dessus. */
export async function reduireEtEnvoyer(
  seau: string,
  fichier: File,
  usage: Usage = 'fil',
  progres?: Progres
): Promise<string> {
  const envoye = await reduire(fichier, usage);
  const chemin = cheminNeuf(envoye.name);
  await envoyerFichier(seau, chemin, envoye, progres);
  return chemin;
}
