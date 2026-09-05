/* ============================================================
   L'OUVERTURE — l'aigle et la posture.

   « Pour le splash screen, créer une animation illustrant un aigle
   et une posture de kung-fu. »

   ------------------------------------------------------------
   POURQUOI PAS LOTTIE NI RIVE

   Ce sont les deux outils que l'on cite pour ce genre d'animation,
   et ils sont excellents. Ici ils coûteraient trop cher pour ce
   qu'ils apportent :

   « lottie-web » pèse environ 250 ko une fois compressé. Le premier
   chargement de l'application a un budget de 245 ko, tenu par
   outils/verifier-poids.mjs et mesuré à chaque construction. La
   bibliothèque à elle seule le DOUBLERAIT — pour une animation de
   deux secondes que l'on voit au démarrage, sur des forfaits
   malgaches.

   Rive est plus léger, mais ajoute un moteur WebAssembly et un
   fichier binaire qu'aucun outil du dépôt ne sait relire : on ne
   pourrait plus corriger la couleur d'une aile sans rouvrir un
   éditeur propriétaire.

   Ce fichier fait quelques kilo-octets, ne dépend de rien, se
   modifie au clavier, et s'anime avec ce que le navigateur sait
   déjà faire. C'est la même technique que le carrousel de l'accueil.

   ------------------------------------------------------------
   CE QUE L'ANIMATION RACONTE

   L'emblème du club est un aigle aux ailes déployées. On le reprend
   comme MOTIF, sans le copier : les ailes s'ouvrent, puis une
   silhouette se pose en garde — le geste que l'aigle donne à
   l'homme. Deux secondes, une fois, à l'ouverture.

   ------------------------------------------------------------
   CE QU'ELLE NE FAIT PAS

   Elle ne RETARDE rien. L'application se charge derrière ; quand
   elle est prête, l'ouverture s'efface. Une animation qui ferait
   attendre serait une animation qu'on finirait par détester.

   Et elle se tait pour qui a demandé moins de mouvement : le réglage
   « prefers-reduced-motion » existe pour les personnes que
   l'animation gêne — vertiges, migraines. On montre alors l'image
   finale, tout de suite.
   ============================================================ */
import { useEffect, useState } from 'react';

/* Assez pour voir le geste, assez court pour ne pas peser. Mesuré à
   l'œil sur un téléphone : en dessous d'une seconde et demie le
   mouvement paraît nerveux, au-delà de deux secondes et demie on
   attend. */
const DUREE = 2000;

export function Ouverture({ fini }: { fini: () => void }) {
  const [sortie, setSortie] = useState(false);

  useEffect(() => {
    /* Deux minuteurs, et le second n'est pas un doublon : le premier
       déclenche l'effacement en fondu, le second retire l'élément du
       document une fois le fondu terminé. Retirer d'un coup ferait
       disparaître l'écran net, sans transition. */
    const doux = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const attente = doux ? 300 : DUREE;
    const a = setTimeout(() => setSortie(true), attente);
    const b = setTimeout(fini, attente + 420);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [fini]);

  return (
    <div className={`ouverture${sortie ? ' ouverture--sortie' : ''}`} aria-hidden="true">
      <svg
        className="ouverture__scene"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ouv-flamme" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2B441" />
            <stop offset="100%" stopColor="#C6621A" />
          </linearGradient>
        </defs>

        {/* Le halo : il s'ouvre avec les ailes, comme un souffle. */}
        <circle className="ouv-halo" cx="100" cy="92" r="62" stroke="#7FD9A8" strokeWidth="1" />

        {/* ---- L'AIGLE ----
            Deux ailes symétriques, chacune pivotant autour du corps.

            Le bord d'ATTAQUE monte vers la pointe ; le bord de FUITE
            revient en festons. Ce sont ces deux ou trois échancrures
            qui font lire « rémiges » plutôt que « papillon » — le
            premier dessin, aux ailes lisses et tombantes, donnait
            exactement un papillon. */}
        <g className="ouv-aigle">
          <path
            className="ouv-aile ouv-aile--g"
            d="M95 66 C74 42 44 30 12 33 C24 45 34 54 46 62
               C42 68 40 72 42 79 C54 74 62 70 70 66
               C68 74 68 78 71 85 C81 78 89 71 95 69 Z"
            fill="url(#ouv-flamme)"
          />
          <path
            className="ouv-aile ouv-aile--d"
            d="M105 66 C126 42 156 30 188 33 C176 45 166 54 154 62
               C158 68 160 72 158 79 C146 74 138 70 130 66
               C132 74 132 78 129 85 C119 78 111 71 105 69 Z"
            fill="url(#ouv-flamme)"
          />
          {/* Le corps : fuselé, pas un cocon. Le premier était aussi
              large en bas qu'en haut et lisait comme une chrysalide. */}
          <path
            className="ouv-corps"
            d="M100 54 C104 54 107 58 107 63 L104 96 C103 103 97 103 96 96 L93 63 C93 58 96 54 100 54 Z"
            fill="#0E2119"
          />
          {/* La tête et le bec CROCHU, de profil : c'est lui qui dit
              « rapace » en trois trais. */}
          <circle className="ouv-tete" cx="100" cy="52" r="7" fill="#0E2119" />
          <path
            className="ouv-bec"
            d="M106 50 C112 50 114 53 112 56 C110 54 108 54 106 55 Z"
            fill="#F2B441"
          />
        </g>

        {/* ---- LA POSTURE ----
            Une garde de l'arc — « gong bu » : jambe avant fléchie,
            jambe arrière tendue, paume avant ouverte, poing arrière
            armé à la hanche.

            Le premier dessin était un bonhomme aux quatre membres
            écartés à parts égales : il lisait comme un saut, pas
            comme une garde. Ce qui fait la différence tient à trois
            choses — l'asymétrie des jambes, le buste légèrement
            engagé, et une main OUVERTE au bout du bras avant. */}
        <g
          className="ouv-garde"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="96" cy="126" r="6" fill="#FFFFFF" stroke="none" />
          {/* Le buste, penché vers l'avant : le poids est sur la
              jambe avant. */}
          <path d="M96 132 L99 150" />
          {/* Le bras avant, tendu, paume ouverte — le petit trait
              perpendiculaire au bout. */}
          <path d="M97 137 L119 133" />
          <path d="M119 128 L119 138" />
          {/* Le bras arrière, armé à la hanche. */}
          <path d="M97 137 L86 145" />
          {/* Jambe AVANT fléchie : hanche, genou, pied. */}
          <path d="M99 150 L114 163 L117 179" />
          {/* Jambe ARRIÈRE tendue, jusqu'au talon posé. */}
          <path d="M99 150 L74 176" />
          <path d="M74 176 L82 179" />
        </g>
      </svg>

      <p className="ouverture__nom">Kung-fu Waishi</p>
      <p className="ouverture__lieu">Analamahitsy</p>
    </div>
  );
}
