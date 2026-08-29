/* ============================================================
   Assemble un écran React Native pour le navigateur.

   Employé par outils/comparer.mjs (qui mesure l'écart avec la
   maquette) et par outils/batir-apercu.mjs (qui publie l'aperçu).
   Une seule configuration : deux copies auraient fini par diverger,
   et l'aperçu ne montrerait plus ce que la comparaison valide.
   ============================================================ */
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';

const requis = createRequire(import.meta.url);
const racine = process.cwd();

/* Une seule copie de React dans le paquet.
   Le dossier mobile/ a son propre node_modules, la racine aussi :
   sans ces deux alias, esbuild embarque deux React, les crochets
   voient un moteur qui n'est pas le leur, et l'écran reste blanc
   sur un « Invalid hook call » — sans que rien n'échoue à la
   compilation. */
const unique = (paquet) => dirname(requis.resolve(`${paquet}/package.json`));

/* Les sous-chemins ne sont PAS couverts par l'alias du paquet :
   esbuild compare le spécificateur entier. « react/jsx-runtime »
   doit donc pointer sur le fichier, pas sur le dossier — sinon il
   résout vers l'entrée principale de React, qui n'exporte pas jsx,
   et chaque composant échoue à l'exécution. */
export const ALIAS = {
  react: unique('react'),
  'react-dom': unique('react-dom'),
  'react/jsx-runtime': requis.resolve('react/jsx-runtime'),
  'react/jsx-dev-runtime': requis.resolve('react/jsx-dev-runtime'),
  'react-native': unique('react-native-web'),
  /* Module natif : remplacé par les balises SVG du DOM. Les tracés
     sont identiques ; seul le moteur de rendu change. */
  'react-native-svg': join(racine, 'outils/shim-svg.js')
};

export async function assembler(module, { minifier = false, dev = false, props = null } = {}) {
  const entree = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import Ecran from '${join(racine, module).replace(/\\/g, '/')}';
    createRoot(document.getElementById('r')).render(React.createElement(Ecran, ${props || 'null'}));
  `;
  const r = await build({
    stdin: { contents: entree, resolveDir: racine, loader: 'tsx' },
    bundle: true, write: false, format: 'iife', platform: 'browser',
    jsx: 'automatic', minify: minifier,
    loader: { '.tsx': 'tsx', '.ts': 'ts', '.ttf': 'dataurl', '.png': 'dataurl' },
    define: {
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      __DEV__: String(dev)
    },
    alias: ALIAS,
    logLevel: 'silent'
  });
  return r.outputFiles[0].text;
}

/* Assemble plusieurs écrans dans un seul paquet, avec un sélecteur.
   Sert à l'aperçu ; la comparaison, elle, rend un écran à la fois. */
export async function assemblerPlusieurs(ecrans, { minifier = true } = {}) {
  const entree = `
import React from 'react';
import { createRoot } from 'react-dom/client';
${ecrans.map((e, i) => `import E${i} from '${join(racine, e.module).replace(/\\/g, '/')}';`).join('\n')}

const ECRANS = [
${ecrans.map((e, i) => `  { cle: '${e.cle}', titre: ${JSON.stringify(e.titre)}, C: E${i}, p: ${e.props || 'null'} }`).join(',\n')}
];

function Apercu() {
  const [i, setI] = React.useState(0);
  const Ecran = ECRANS[i].C;
  React.useEffect(() => {
    document.getElementById('nom').textContent = ECRANS[i].titre;
    document.querySelectorAll('#onglets button').forEach((b, k) =>
      b.setAttribute('aria-current', String(k === i)));
  }, [i]);
  React.useEffect(() => { window.__aller = setI; }, []);
  return React.createElement(Ecran, ECRANS[i].p);
}

createRoot(document.getElementById('ecran')).render(React.createElement(Apercu));
`;
  const r = await build({
    stdin: { contents: entree, resolveDir: racine, loader: 'tsx' },
    bundle: true, write: false, format: 'iife', platform: 'browser',
    jsx: 'automatic', minify: minifier,
    loader: { '.tsx': 'tsx', '.ts': 'ts', '.ttf': 'dataurl', '.png': 'dataurl' },
    define: { 'process.env.NODE_ENV': '"production"', __DEV__: 'false' },
    alias: ALIAS,
    logLevel: 'silent'
  });
  return r.outputFiles[0].text;
}
