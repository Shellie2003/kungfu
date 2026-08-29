/* ============================================================
   Choisir une police par son nom, jamais par fontWeight.

   Le piège Android : avec une police embarquée, fontWeight ne
   sélectionne pas un fichier. Au mieux le système fabrique un faux
   gras en épaississant les traits — plus lourd et plus laid que le
   vrai ; au pire il ignore la demande. Le texte de la maquette
   n'est alors plus le texte de l'application, et la comparaison
   au pixel ne le verrait pas : elle tourne sur le navigateur, qui
   sait synthétiser, lui.

   D'où : une famille par graisse, nommée, et cette fonction pour
   la désigner. Les fichiers sont produits par
   outils/extraire-polices.py depuis la maquette elle-même.
   ============================================================ */
import { polices } from './tokens';

export type Graisse = 400 | 500 | 600 | 700;
export type Famille = 'titre' | 'texte';

const SUFFIXE: Record<Graisse, string> = {
  400: '',
  500: '-Medium',
  600: '-SemiBold',
  700: '-Bold'
};

/* Les huit clés déclarées à expo-font dans app/_layout.tsx. Le
   tableau est construit ici pour qu'un ajout de graisse se fasse à
   un seul endroit. */
export const CLES_POLICES = (['titre', 'texte'] as const).flatMap((f) =>
  (Object.keys(SUFFIXE) as unknown as Graisse[]).map((g) => nomPolice(f, Number(g) as Graisse))
);

export function nomPolice(famille: Famille, graisse: Graisse = 400): string {
  return polices[famille] + SUFFIXE[graisse];
}

/* Raccourci pour les feuilles de style : remplace le couple
   { fontFamily, fontWeight } par un seul champ juste.

     ...texte('texte', 600), fontSize: 13
*/
export const texte = (famille: Famille, graisse: Graisse = 400) =>
  ({ fontFamily: nomPolice(famille, graisse) } as const);
