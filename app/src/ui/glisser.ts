/* ============================================================
   Glisser d'une image à l'autre.

   « Dans l'album je veux qu'on puisse défiler l'image de droite vers
   la gauche comme un carrousel, et c'est pareil si quelqu'un envoie
   plusieurs images à la fois. »

   C'est le geste qu'on fait sans y penser dans n'importe quelle
   galerie de téléphone. L'application ne le connaissait pas : pour
   passer à la photo suivante il fallait fermer, revenir à la grille,
   et viser la vignette d'à côté — trois gestes pour un.

   ------------------------------------------------------------
   TROIS PIÈGES, ET C'EST POUR EUX QUE CE FICHIER EXISTE

   1. LE DÉFILEMENT VERTICAL. Un doigt qui descend pour lire la
      légende ne doit pas changer de photo. On exige donc que le
      mouvement soit franchement horizontal — une fois et demie plus
      large que haut — sinon on ne fait rien.

   2. LE ZOOM À DEUX DOIGTS. Il vient d'être rendu à l'application
      (« maximum-scale » retiré du gabarit), et c'est justement sur
      une photo qu'on s'en sert. Deux doigts posés annulent donc le
      glissement : sans cela, écarter les doigts pour agrandir
      passerait à l'image suivante.

   3. LE CLIC QUI SUIT. Un glissement se termine par un « click » que
      le navigateur envoie quand même. Sur la visionneuse, dont le
      fond ferme au clic, glisser refermait tout. On retient donc
      qu'un glissement vient d'avoir lieu, et l'appelant s'en sert
      pour ignorer ce clic-là.
   ============================================================ */
import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/* Cinquante pixels : plus court, un doigt qui tremble change de
   photo ; plus long, le geste paraît ne pas répondre. C'est aussi
   l'ordre de grandeur qu'emploient les galeries du téléphone, et
   l'on n'a rien à gagner à surprendre la main. */
const DISTANCE = 50;
/* Le mouvement doit être une fois et demie plus horizontal que
   vertical. En dessous, c'est une diagonale — donc probablement un
   défilement, et on laisse passer. */
const FRANCHISE = 1.5;

export type Glissement = {
  /* À poser sur l'élément qui reçoit le geste. */
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: () => void;
};

export function useGlisser({
  versLaGauche,
  versLaDroite
}: {
  /* Le doigt part vers la GAUCHE : on va vers la SUIVANTE, comme on
     tourne la page d'un livre. */
  versLaGauche?: () => void;
  versLaDroite?: () => void;
}): { gestes: Glissement; onAGlisse: () => boolean } {
  const depart = useRef<{ x: number; y: number; id: number } | null>(null);
  const doigts = useRef(0);
  const glisse = useRef(false);

  /* Un état, et non une simple référence, pour que le composant se
     redessine si l'appelant veut montrer quelque chose pendant le
     geste. Il n'est pas lu ici — il rend le crochet utilisable pour
     une animation sans le réécrire. */
  const [, redessiner] = useState(0);

  const gestes: Glissement = {
    onPointerDown: (e) => {
      doigts.current += 1;
      /* Deux doigts : c'est un zoom, pas un glissement. */
      if (doigts.current > 1) {
        depart.current = null;
        return;
      }
      depart.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    },

    onPointerUp: (e) => {
      doigts.current = Math.max(0, doigts.current - 1);
      const d = depart.current;
      depart.current = null;
      if (!d || d.id !== e.pointerId) return;

      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) < DISTANCE) return;
      if (Math.abs(dx) < Math.abs(dy) * FRANCHISE) return;

      glisse.current = true;
      redessiner((n) => n + 1);
      if (dx < 0) versLaGauche?.();
      else versLaDroite?.();
    },

    onPointerCancel: () => {
      doigts.current = 0;
      depart.current = null;
    }
  };

  /* « Est-ce qu'un glissement vient d'avoir lieu ? » — et la réponse
     se CONSOMME : le clic qui suit le geste est le seul qu'il faut
     ignorer, pas tous les suivants. */
  const onAGlisse = () => {
    const oui = glisse.current;
    glisse.current = false;
    return oui;
  };

  return { gestes, onAGlisse };
}
