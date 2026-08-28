/* ============================================================
   Bouchon de react-native-svg, pour la comparaison seule.

   react-native-svg est un module natif : il ne s'exécute pas dans
   un navigateur. Pour comparer le rendu à la maquette, on le
   remplace par les balises SVG du DOM — que la maquette emploie
   déjà. Les tracés sont identiques des deux côtés, seul le moteur
   de rendu change.

   Ce fichier ne part JAMAIS dans l'application : il n'est monté
   que par outils/comparer.mjs.
   ============================================================ */
import React from 'react';

/* React Native écrit strokeWidth, le DOM veut stroke-width. Les
   attributs de présentation SVG passent tels quels en camelCase
   dans React, sauf quelques-uns — on convertit tout par sécurité. */
const TIRETS = {
  strokeWidth: 'strokeWidth', strokeLinecap: 'strokeLinecap',
  strokeLinejoin: 'strokeLinejoin', fillRule: 'fillRule'
};

const passe = (props) => {
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children') continue;
    out[TIRETS[k] ?? k] = v;
  }
  return out;
};

const balise = (nom) => {
  const C = ({ children, ...props }) => React.createElement(nom, passe(props), children);
  C.displayName = nom;
  return C;
};

export const Svg = ({ children, width, height, viewBox, ...r }) =>
  React.createElement('svg', { width, height, viewBox, ...passe(r) }, children);

export const Path = balise('path');
export const Circle = balise('circle');
export const Rect = balise('rect');
export const G = balise('g');
export const Line = balise('line');
export const Ellipse = balise('ellipse');
export const Polygon = balise('polygon');

export default Svg;
