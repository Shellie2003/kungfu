/* ============================================================
   css/app.css  →  app/theme/tokens.ts

   La maquette est la référence. Recopier ses couleurs à la main
   dans le code de l'application, c'est garantir qu'un jour l'une
   changera sans l'autre. On les extrait donc, et on regénère.

     node outils/extraire-theme.mjs

   Le script échoue s'il manque un jeton attendu : mieux vaut ne
   pas construire que construire avec une couleur inventée.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const CSS = readFileSync('css/app.css', 'utf8');

/* ---------- Les couleurs, prises dans :root ---------- */
const bloc = CSS.match(/:root\s*\{([\s\S]*?)\}/);
if (!bloc) throw new Error('css/app.css : bloc :root introuvable');

const brut = {};
for (const [, nom, val] of bloc[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
  brut[nom] = val.trim();
}

/* Les noms de la maquette sont en français ; on les garde. Une
   traduction en anglais ferait perdre le lien avec la feuille. */
const COULEURS = {
  vert: 'vert', vertTexte: 'vert-texte', vertClair: 'vert-clair',
  fond: 'fond', encre: 'encre', gris: 'gris', grisClair: 'gris-clair',
  filet: 'filet', bord: 'bord', alerte: 'alerte'
};

const couleurs = {};
const manquants = [];
for (const [cle, css] of Object.entries(COULEURS)) {
  if (!brut[css]) manquants.push('--' + css);
  else couleurs[cle] = brut[css];
}
if (manquants.length) {
  throw new Error('Jetons absents de :root — ' + manquants.join(', '));
}

/* ---------- Les couleurs hors :root, mesurées dans la feuille ----------
   Certaines valeurs vivent dans une règle et pas dans :root : le blanc
   des cartes, les verts du bandeau. On les relève à leur emplacement
   exact plutôt que de les redéclarer ici, pour que le lien tienne. */
const releve = (motif, nom) => {
  const m = CSS.match(motif);
  if (!m) throw new Error(`Couleur « ${nom} » introuvable dans css/app.css`);
  return m[1];
};

const surVert = {
  /* Fond de l'encart sur le bandeau vert, et son filet. */
  encart: releve(/\.hero__note\s*\{[^}]*background:\s*(#[0-9A-Fa-f]{6})/, 'hero__note'),
  filet: releve(/\.hero__note\s*\{[^}]*border:\s*1px solid\s*(#[0-9A-Fa-f]{6})/, 'hero__note bord'),
  /* Texte secondaire sur vert — mesuré à 5,4:1. */
  texte: releve(/\.carte__prenom\s*\{[^}]*color:\s*(#[0-9A-Fa-f]{6})/, 'texte sur vert')
};

/* ---------- Typographie ---------- */
const famille = (v) => v.split(',')[0].trim().replace(/^'|'$/g, '');
const polices = {
  titre: famille(brut['display'] || ''),
  texte: famille(brut['texte'] || '')
};
if (!polices.titre || !polices.texte) throw new Error('Polices introuvables dans :root');

/* ---------- Les mesures des composants ----------
   C'est ici que se joue la ressemblance. Une couleur fausse se voit ;
   un rayon de 14 au lieu de 12, ou une marge de 16 au lieu de 14, ne
   se voit pas — et pourtant l'écran n'est plus le même. On relit donc
   la règle dans la feuille, on ne la recopie pas de mémoire. */
const regle = (sel) => {
  const m = CSS.match(new RegExp(`(?:^|\\})\\s*\\${sel}\\s*\\{([^}]*)\\}`, 'm'));
  if (!m) throw new Error(`Règle « ${sel} » introuvable dans css/app.css`);
  const out = {};
  for (const [, p, v] of m[1].matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) out[p.trim()] = v.trim();
  return out;
};

/* « 12px 14px » → { haut: 12, cotes: 14 } ; « 10px 8px 12px » → trois. */
const px = (v) => (v || '').split(/\s+/).map((n) => parseFloat(n) || 0);

const btn = regle('.btn');
const chip = regle('.chip');
const grade = regle('.grade');
const gradePastille = regle('.grade i');
const listrow = regle('.listrow');
const studentrow = regle('.studentrow');
const recherche = regle('.searchbar');
const entete = regle('.apphead');
const onglets = regle('.tabbar');

const composants = {
  bouton: {
    hauteur: px(btn['min-height'])[0],
    rayon: px(btn['border-radius'])[0],
    taille: px(btn['font-size'])[0],
    graisse: btn['font-weight']
  },
  chip: {
    padVertical: px(chip['padding'])[0],
    padHorizontal: px(chip['padding'])[1],
    taille: px(chip['font-size'])[0],
    interligne: px(chip['line-height'])[0],
    ecart: px(regle('.chips')['gap'])[0]
  },
  grade: {
    fond: grade['background'],
    padVertical: px(grade['padding'])[0],
    padHorizontal: px(grade['padding'])[1],
    ecart: px(grade['gap'])[0],
    taille: px(grade['font-size'])[0],
    pastille: px(gradePastille['width'])[0]
  },
  ligne: {
    ecart: px(listrow['gap'])[0],
    padVertical: px(listrow['padding'])[0],
    padHorizontal: px(listrow['padding'])[1]
  },
  ligneEleve: {
    ecart: px(studentrow['gap'])[0],
    padVertical: px(studentrow['padding'])[0],
    padHorizontal: px(studentrow['padding'])[1]
  },
  recherche: {
    hauteur: px(recherche['min-height'])[0],
    rayon: px(recherche['border-radius'])[0],
    ecart: px(recherche['gap'])[0],
    padHorizontal: px(recherche['padding'])[1],
    taille: px(recherche['font-size'])[0],
    couleur: recherche['color']
  },
  entete: {
    ecart: px(entete['gap'])[0],
    padHaut: px(entete['padding'])[0],
    padCotes: px(entete['padding'])[1],
    padBas: px(entete['padding'])[2]
  },
  onglets: {
    padHaut: px(onglets['padding'])[0],
    padCotes: px(onglets['padding'])[1],
    padBas: px(onglets['padding'])[2]
  }
};

const rayons = {
  carte: px(regle('.card')['border-radius'])[0],
  liste: px(regle('.list')['border-radius'])[0],
  vignette: px(regle('.tapicon')['border-radius'])[0],
  membre: px(regle('.carte')['border-radius'])[0]
};

/* Un zéro non voulu passerait inaperçu ; on le refuse tout de suite. */
for (const [nom, grp] of Object.entries(composants)) {
  for (const [cle, val] of Object.entries(grp)) {
    if (val === 0 || val === undefined || val === '') {
      throw new Error(`Mesure vide : composants.${nom}.${cle} — la règle a dû changer dans css/app.css`);
    }
  }
}

/* ---------- Écriture ---------- */
const ts = `/* ============================================================
   GÉNÉRÉ — ne pas modifier à la main.

   Source : css/app.css (la maquette validée par le club).
   Régénérer : node outils/extraire-theme.mjs

   Toute couleur employée dans l'application vient d'ici. Une
   valeur écrite en dur dans un écran est un écart avec la
   maquette qui ne se verra que trop tard.
   ============================================================ */

export const couleurs = ${JSON.stringify(couleurs, null, 2)} as const;

/* Employées sur le bandeau vert, où le blanc ne convient pas. */
export const surVert = ${JSON.stringify(surVert, null, 2)} as const;

export const polices = ${JSON.stringify(polices, null, 2)} as const;

export const rayons = ${JSON.stringify(rayons, null, 2)} as const;

/* Mesures relevées règle par règle dans css/app.css. Une valeur
   écrite en dur dans un composant est une dérive en puissance. */
export const composants = ${JSON.stringify(composants, null, 2)} as const;

/* Échelle d'espacement de la maquette : 4 px de pas. */
export const espace = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 26
} as const;
`;

mkdirSync('app/theme', { recursive: true });
writeFileSync('app/theme/tokens.ts', ts);

const nCoul = Object.keys(couleurs).length + Object.keys(surVert).length;
const nMes = Object.values(composants).reduce((t, g) => t + Object.keys(g).length, 0);
console.log(`app/theme/tokens.ts — ${nCoul} couleurs, 2 polices, ${Object.keys(rayons).length} rayons, ${nMes} mesures`);
