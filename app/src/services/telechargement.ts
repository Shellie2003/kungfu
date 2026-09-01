/* ============================================================
   Enregistrer une pièce jointe sur le téléphone.

   POURQUOI CE FICHIER EXISTE

   La messagerie affichait déjà les documents, avec un lien portant
   l'attribut « download » et « target=_blank ». Dans un navigateur,
   cela marche. Dans l'APK, cela ne fait RIEN — et rien, c'est
   littéralement rien : pas de message, pas d'erreur, le doigt tape
   et l'écran ne bouge pas.

   Deux raisons, et il fallait les deux pour comprendre :

   — « download » ne vaut que pour une adresse de MÊME ORIGINE. Nos
     pièces vivent sur le serveur Supabase, derrière une adresse
     signée ; pour la page, c'est une autre origine, et l'attribut
     est ignoré.

   — une WebView Android ne télécharge rien par elle-même. Un
     navigateur a une barre de téléchargements ; une WebView n'a que
     ce que l'application lui donne, et sans « DownloadListener »
     elle laisse tomber la demande sans le dire.

   Ce que fait ce fichier : il RAPATRIE le fichier, l'écrit dans les
   documents du téléphone, puis propose de l'ouvrir ou de le
   partager. Sur le web, il garde le chemin qui marche déjà — un lien
   que le navigateur sait traiter.

   ⚠ Les deux plugins sont chargés par « import() » et non en haut du
   fichier. Ils ne servent qu'à l'APK, et un « import » ordinaire les
   ferait entrer dans le paquet que TOUT LE MONDE télécharge, y
   compris ceux qui ouvrent la version web et n'en auront jamais
   l'usage. C'est le sens du budget posé dans outils/verifier-poids.mjs.
   ============================================================ */
import { Capacitor } from '@capacitor/core';

export const SUR_TELEPHONE = Capacitor.isNativePlatform();

/* Ce que l'appelant doit montrer. On ne lance aucun message soi-même :
   l'écran sait où le poser, ce fichier ne le sait pas. */
export type Resultat =
  | { fait: 'enregistre'; ou: string }
  | { fait: 'ouvert' }
  | { fait: 'refuse'; pourquoi: string };

/* Un blob se lit en base64 par le lecteur du navigateur. Le plugin
   Filesystem n'accepte que cela — il traverse le pont JavaScript
   vers Java, où un blob n'existe pas. */
function enBase64(blob: Blob): Promise<string> {
  return new Promise((ok, non) => {
    const lecteur = new FileReader();
    lecteur.onerror = () => non(new Error('Le fichier n’a pas pu être lu.'));
    lecteur.onload = () => {
      const brut = String(lecteur.result);
      /* « data:application/pdf;base64,JVBERi0… » : on ne garde que ce
         qui suit la virgule. */
      const virgule = brut.indexOf(',');
      ok(virgule === -1 ? brut : brut.slice(virgule + 1));
    };
    lecteur.readAsDataURL(blob);
  });
}

/* Un nom de fichier qui ne trahit pas le système : pas de barre
   oblique, pas de deux-points, et jamais vide. */
const nomSur = (nom: string) => nom.replace(/[/\\:*?"<>|]/g, '_').slice(0, 120) || 'document';

export async function enregistrer(url: string, nom: string): Promise<Resultat> {
  const propre = nomSur(nom);

  /* ---- Le web : le navigateur sait faire, et le fait mieux ---- */
  if (!SUR_TELEPHONE) {
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = propre;
    /* Même sur le web, « download » est ignoré parce que l'adresse
       signée est d'une autre origine : le navigateur OUVRE le
       fichier au lieu de l'enregistrer, ce qui reste utile — on lit
       le PDF, et le navigateur propose de le garder. On l'ouvre donc
       dans un onglet, ce qui est le comportement honnête. */
    lien.target = '_blank';
    lien.rel = 'noreferrer';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    return { fait: 'ouvert' };
  }

  /* ---- Le téléphone : on rapatrie, on écrit, on propose ---- */
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      return {
        fait: 'refuse',
        pourquoi: `Le serveur a refusé le fichier (${reponse.status}). L’adresse a peut-être expiré — rouvrez la conversation.`
      };
    }
    const blob = await reponse.blob();
    const donnees = await enBase64(blob);

    const { Filesystem, Directory } = await import('@capacitor/filesystem');

    /* « Documents » et non le cache : le club doit RETROUVER le
       fichier plus tard, dans son gestionnaire de fichiers. Un
       document écrit dans le cache disparaît au premier nettoyage
       du téléphone, et personne ne comprend pourquoi. */
    const ecrit = await Filesystem.writeFile({
      path: propre,
      data: donnees,
      directory: Directory.Documents,
      recursive: true
    });

    /* Puis on PROPOSE de l'ouvrir. Sans cela, le fichier est bien
       enregistré et l'on n'a aucun moyen de le voir depuis
       l'application — l'utilité s'arrête à un message.

       Le partage échoue si aucune application ne sait ouvrir ce type
       de fichier ; ce n'est pas un échec de l'enregistrement, et
       cela ne doit donc pas s'afficher comme tel. */
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: propre, url: ecrit.uri });
    } catch {
      /* Rien : le fichier est sur le téléphone, c'est l'essentiel. */
    }

    return { fait: 'enregistre', ou: 'Documents' };
  } catch (e) {
    return { fait: 'refuse', pourquoi: (e as Error).message };
  }
}
