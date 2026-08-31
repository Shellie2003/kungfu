/* ============================================================
   Quelle version regarde-t-on ?

   Le club veut « voir chaque mise à jour en rafraîchissant le
   navigateur ». Mécaniquement, c'est déjà le cas : le site se
   redéploie à chaque poussée, la page n'est pas mise en cache
   (« must-revalidate ») et les fichiers portent une empreinte dans
   leur nom. Il n'y a pas de service worker pour retenir une
   ancienne version.

   Ce qui manquait n'est donc pas le rafraîchissement, c'est de
   SAVOIR. Deux fois de suite, le club a rafraîchi pendant que la
   publication tournait encore — elle prend une à deux minutes — et
   a vu l'ancienne page, sans rien qui puisse le lui dire. Un écran
   inchangé ne distingue pas « la mise à jour n'est pas encore
   là » de « la mise à jour ne marche pas ».

   L'application dit maintenant les deux :

     — sa PROPRE version, inscrite à la construction ;
     — celle qui est PUBLIÉE, lue dans version.txt à côté d'elle.

   Quand elles diffèrent, c'est qu'une version plus récente attend :
   on le dit, avec de quoi la prendre.
   ============================================================ */
import { useEffect, useState } from 'react';

/* Injectée par Vite à la construction. Le repli couvre le mode
   développement, où il n'y a pas de commit à nommer. */
export const VERSION: string =
  typeof __VERSION__ === 'string' && __VERSION__ ? __VERSION__ : 'developpement';

export const versionCourte = (v: string) =>
  /^[0-9a-f]{40}$/.test(v) ? v.slice(0, 7) : v;

/* version.txt vit À CÔTÉ de la page, et on le demande par un chemin
   relatif à la base : c'est la même adresse que l'application soit
   servie à /essai ou ailleurs. Dans l'APK il n'existe pas — d'où le
   silence en cas d'échec, plus bas. */
const OU = `${import.meta.env.BASE_URL}version.txt`;

async function versionPubliee(): Promise<string | null> {
  try {
    /* « no-store » n'est pas décoratif : sans lui, le navigateur
       peut répondre depuis son cache et l'on comparerait la version
       publiée d'il y a dix minutes. On demanderait alors sa propre
       ancienneté à un fichier périmé. */
    const r = await fetch(OU, { cache: 'no-store' });
    if (!r.ok) return null;
    const texte = (await r.text()).trim();
    /* Une page HTML rendue à la place du fichier — un 404 déguisé —
       n'est pas une version. Sans ce contrôle, l'application
       annoncerait une mise à jour à chaque chargement.

       « developpement » non plus : c'est ce qu'écrit la construction
       quand il n'y a aucun commit à nommer. Le prendre pour une
       version publiée ferait clignoter le bandeau sur toutes les
       constructions locales. */
    if (texte === 'developpement') return null;
    return /^[\w.-]{4,60}$/.test(texte) ? texte : null;
  } catch {
    /* Hors ligne, ou dans l'APK où le fichier n'existe pas. Ne rien
       dire : annoncer une mise à jour parce que le réseau est tombé
       serait un mensonge de plus. */
    return null;
  }
}

/* Rend la version publiée quand elle DIFFÈRE de celle qu'on
   exécute, « null » sinon — donc « il y a du nouveau, et voici
   quoi ».

   On regarde au démarrage, puis chaque fois que l'onglet revient au
   premier plan : c'est exactement le moment où quelqu'un qui attend
   une publication revient voir. Pas de sondage régulier — cela
   consommerait le forfait de soixante-quatre téléphones pour une
   information dont on n'a besoin qu'en revenant. */
export function useMiseAJour(): string | null {
  const [neuve, setNeuve] = useState<string | null>(null);

  useEffect(() => {
    if (VERSION === 'developpement') return;
    let vivant = true;

    const regarder = async () => {
      const publiee = await versionPubliee();
      if (vivant) setNeuve(publiee && publiee !== VERSION ? publiee : null);
    };

    void regarder();
    const auRetour = () => {
      if (document.visibilityState === 'visible') void regarder();
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      vivant = false;
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, []);

  return neuve;
}
