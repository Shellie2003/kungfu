/* ============================================================
   L'emblème du club — son logo, ou l'écusson à défaut.

   Ce que le client a validé sous « acc-logo » : « Logo et nom du
   club — en haut de l'accueil et sur la carte de membre ».

   La maquette le fait depuis le début : build-logo.mjs lit
   img/logo.<ext>, le réduit, et js/app.js le pose dans CHAQUE
   emplacement d'emblème. L'application, elle, ne l'a jamais fait —
   elle dessinait un écusson générique. Le club a donc déposé son
   logo dans img/, l'a vu dans la maquette, et ne l'a jamais vu dans
   l'application.

   Ici, on lit LE MÊME FICHIER. Pas une copie : le même, à la racine
   du dépôt, celui que la maquette emploie. C'est le principe déjà
   retenu pour css/app.css et icones.mjs — corriger la maquette
   corrige l'application, et il n'y a pas d'écart possible.

   Vite s'occupe du reste : il empaquette l'image, la nomme par son
   empreinte et rend son adresse. Le fichier ABSENT n'est pas une
   erreur — c'est l'état du projet tant que le club n'a rien fourni,
   et l'écusson reprend alors sa place.
   ============================================================ */
import type { ReactNode } from 'react';
import { Icone } from './Icone';
import type { NomIcone } from './Icone';

/* « eager » plutôt qu'un import direct : un import direct de
   ../../../img/logo.png FERAIT ÉCHOUER la construction le jour où le
   fichier n'est pas là, et le club n'a pas à livrer un logo pour que
   son application se construise. Le motif accepte les quatre
   extensions que build-logo.mjs accepte, pour que les deux ne
   puissent pas diverger. */
const trouves = import.meta.glob('../../../img/logo.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

export const LOGO: string | null = Object.values(trouves)[0] ?? null;

/* Les tailles où la maquette place l'emblème. « lg » est celui de la
   connexion et de l'écran du club ; les autres sont donnés au cas
   par cas, comme la vignette de 36 px de la carte de membre. */
export function Emblem({
  taille,
  icone = 'shieldCheck',
  grand = false,
  style
}: {
  /* La taille de l'ICÔNE de repli, en pixels — celle que la maquette
     donne à cet endroit. Le logo, lui, remplit le cadre. */
  taille: number;
  icone?: NomIcone;
  grand?: boolean;
  style?: React.CSSProperties;
}): ReactNode {
  const classe = `emblem${grand ? ' emblem--lg' : ''}${LOGO ? ' emblem--img' : ''}`;

  return (
    <div className={classe} style={style}>
      {LOGO ? (
        /* Le texte alternatif est VIDE, et c'est délibéré : le nom du
           club est écrit juste à côté, en toutes lettres. Le répéter
           ferait dire deux fois la même chose à un lecteur d'écran. */
        <img src={LOGO} alt="" />
      ) : (
        <Icone nom={icone} taille={taille} couleur="#0F5132" epaisseur={1.7} />
      )}
    </div>
  );
}
