/* ============================================================
   Les icônes.

   Le trait vient de icones.mjs, à la racine — le fichier que lit
   aussi la maquette. Rien n'est recopié ici : corriger une flèche
   la corrige des deux côtés, et il n'existe pas de version qui
   traîne.

   Les attributs reprennent exactement ceux de la maquette
   (fill none, trait arrondi, 24×24) : c'est ce qui fait que le
   dessin sort au pixel près.
   ============================================================ */
import { ICON } from '../../../icones.mjs';

export type NomIcone = keyof typeof ICON;

type Props = {
  nom: string;
  taille?: number;
  couleur?: string;
  epaisseur?: number;
};

export function Icone({ nom, taille = 22, couleur = '#0E2119', epaisseur = 1.7 }: Props) {
  const trait = ICON[nom];
  if (!trait) throw new Error(`Icône inconnue : ${nom}`);
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: trait }}
    />
  );
}
