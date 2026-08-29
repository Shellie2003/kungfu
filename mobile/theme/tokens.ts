/* ============================================================
   GÉNÉRÉ — ne pas modifier à la main.

   Source : css/app.css (la maquette validée par le club).
   Régénérer : node outils/extraire-theme.mjs

   Toute couleur employée dans l'application vient d'ici. Une
   valeur écrite en dur dans un écran est un écart avec la
   maquette qui ne se verra que trop tard.
   ============================================================ */

export const couleurs = {
  "vert": "#0F5132",
  "vertTexte": "#12613C",
  "vertClair": "#E8F1EC",
  "fond": "#F5F8F6",
  "encre": "#0E2119",
  "gris": "#59685F",
  "grisClair": "#7C8B82",
  "filet": "#E4EDE8",
  "bord": "#DCE7E1",
  "alerte": "#E4572E",
  "surVertDoux": "#B9D4C6"
} as const;

/* Employées sur le bandeau vert, où le blanc ne convient pas. */
export const surVert = {
  "encart": "#12613C",
  "filet": "#2E7A55",
  "texte": "#CFE5D9"
} as const;

export const polices = {
  "titre": "Archivo",
  "texte": "Karla"
} as const;

export const rayons = {
  "carte": 16,
  "liste": 16,
  "vignette": 12,
  "membre": 22
} as const;

/* Mesures relevées règle par règle dans css/app.css. Une valeur
   écrite en dur dans un composant est une dérive en puissance. */
export const composants = {
  "bouton": {
    "hauteur": 48,
    "rayon": 12,
    "taille": 15,
    "graisse": "600"
  },
  "chip": {
    "padVertical": 9,
    "padHorizontal": 15,
    "taille": 13,
    "interligne": 17,
    "ecart": 8
  },
  "grade": {
    "fond": "#F1F6F3",
    "padVertical": 5,
    "padHorizontal": 11,
    "ecart": 7,
    "taille": 12,
    "pastille": 9
  },
  "ligne": {
    "ecart": 13,
    "padVertical": 14,
    "padHorizontal": 16
  },
  "ligneEleve": {
    "ecart": 14,
    "padVertical": 12,
    "padHorizontal": 14
  },
  "recherche": {
    "hauteur": 48,
    "rayon": 12,
    "ecart": 10,
    "padHorizontal": 14,
    "taille": 15,
    "couleur": "#8A978F"
  },
  "entete": {
    "ecart": 4,
    "padHaut": 10,
    "padCotes": 8,
    "padBas": 12
  },
  "onglets": {
    "padHaut": 8,
    "padCotes": 4,
    "padBas": 14
  }
} as const;

/* Échelle d'espacement de la maquette : 4 px de pas. */
export const espace = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 26
} as const;
