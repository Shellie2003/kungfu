# Long Shan — Système d'interface mobile

Monastère de Kung-Fu · école d'arts martiaux · gestion de la vie quotidienne.

Prototype d'interface **mobile-first** complet et navigable : 34 écrans, deux thèmes,
un design system cohérent. Il sert de **référence directe pour l'implémentation Flutter** —
chaque composant CSS ci-dessous a son équivalent widget indiqué.

## Lancer

```bash
python3 -m http.server 8000     # puis ouvrir http://localhost:8000
```

Aucune dépendance, aucun réseau, aucune police externe. Ouvrir `index.html` suffit.

- **Colonne de gauche** : index des 34 écrans.
- **Flèches ↑ ↓** : parcourir les écrans. **Échap** : fermer un overlay.
- **Mode clair / Temple de nuit** : bascule en haut de la scène.
- Sous 900 px de large, l'échafaudage disparaît et l'application occupe tout l'écran.

## Fichiers

| Fichier | Rôle |
|---|---|
| `css/tokens.css` | Source de vérité : couleurs, typographie, espacement, rayons, durées |
| `css/base.css` | Reset + cadre de présentation (téléphone, index) — **non porté en Flutter** |
| `css/components.css` | La bibliothèque de composants |
| `js/data.js` | Données fictives (personnes, séances, grades, stocks, finances…) |
| `js/ui.js` | Icônes + fabriques de composants |
| `js/screens-core.js` | Écrans 01 → 16 (identité, accueils, arts martiaux) |
| `js/screens-life.js` | Écrans 17 → 30 + hubs + états d'interface |
| `js/app.js` | Navigation, thème, feuilles, dialogues, micro-interactions |

---

## 1. Direction artistique

> *Traditional monastery meets modern digital product.*

Papier légèrement chaud, encre noire, bois sombre, doré parcimonieux, vermillon d'accent.
Trois règles tenues sur tous les écrans :

1. **Une seule zone dense par écran.** Le reste respire.
2. **Le doré ne sert qu'à trois choses** : le grade, la progression, l'action principale distinguée.
   Jamais en décoration.
3. **Pas de grille de widgets.** Les statistiques sont composées de manière asymétrique
   dans un bloc unique (`.ink`), jamais en quatre cartes identiques.

### Éléments signature

| Élément | Description | Où |
|---|---|---|
| **Le sceau** (`.seal`) | Carré à coins très arrondis (rayon 30 %), bordure intérieure claire | Identité, avatars de grade, bouton central de navigation, icônes de tête de liste |
| **Le bloc d'encre** (`.ink`) | Surface sombre inversée, tampon circulaire en filigrane | Un seul par écran : l'information la plus importante |
| **La surface papier** (`.card--paper`) | Carte claire, tranche dorée d'1 px en haut | Prochaine activité, grade actuel, élément mis en avant |
| **Le filet** (`.rule`) | Trait fin + losange doré centré | Respiration entre deux idées d'un même bloc |
| **Le nœud losange** (`.tl__node`) | Carré pivoté à 45° sur un filet vertical | Toutes les timelines |

---

## 2. Jetons de conception (`tokens.css`)

### Couleurs — mode clair

| Jeton | Valeur | Usage |
|---|---|---|
| `--bg` | `#EFE9DE` | Fond d'écran |
| `--surface` | `#F6F2EA` | Surface principale, feuilles |
| `--surface-raised` | `#FFFDF8` | Cartes |
| `--surface-sunken` | `#E7E0D3` | Champs, pistes de progression |
| `--surface-ink` | `#1D1A17` | Bloc inversé, bouton primaire |
| `--text` / `--text-secondary` / `--text-tertiary` | `#171717` / `#5B5248` / `#6B6358` | Hiérarchie de texte |
| `--line` / `--line-strong` | `#DDD4C5` / `#C9BDA9` | Séparateurs, bordures |
| `--accent` / `--accent-text` | `#A63D2F` / `#8F3225` | Vermillon : action forte, alerte, moment présent |
| `--gold` / `--gold-text` / `--gold-bright` | `#A5813A` / `#7A5F26` / `#C6A15B` | Grade, progression, distinction |
| `--wood` | `#684936` | Données neutres, étapes passées |
| `--positive` / `--warning` / `--danger` | `#4A6B46` / `#8A5E1B` / `#A63D2F` | États |

**Le doré se décline en trois valeurs, et c'est délibéré.** Le `#C6A15B` de la palette
d'origine ne donne que 2,8:1 sur papier — illisible en texte, insuffisant même comme
tracé. Il est donc réservé au fond d'encre, où il atteint 7,1:1. Sur papier :
`--gold` (`#A5813A`, 3,2:1) pour les aplats, anneaux, barres et bordures ;
`--gold-text` (`#7A5F26`, 5,4:1) dès qu'il s'agit de texte. À l'œil, les trois lectures
restent le même doré ; à la mesure, chacune passe son seuil.
Le vermillon `#A63D2F` est conservé tel quel pour les fonds ; `--accent-text` en est
la déclinaison lisible.

### Couleurs — mode sombre « Temple de nuit »

Noir profond **chaud** (`#0F0D0B`), brun sombre, gris chaud, doré discret.
Aucune teinte bleue nulle part — c'est ce qui distingue ce mode sombre d'un dashboard générique.
Les rôles sémantiques sont identiques : un composant ne connaît jamais que `var(--surface)`,
jamais une valeur brute.

### Typographie

Deux familles seulement.

| Rôle | Famille | Emploi |
|---|---|---|
| `--font-display` | Serif (Iowan Old Style / Songti SC / Noto Serif / Georgia) | Titres, **tous les nombres**, citations |
| `--font-ui` | Sans-serif système | Corps, libellés, boutons |

En Flutter : `Noto Serif` + `Noto Sans` (les deux couvrent le français et le chinois).

| Échelle | Taille / interligne | Classe |
|---|---|---|
| Display | 34 / 38 | `.display` |
| Title | 22 / 28 | `.title` |
| Heading | 17 / 23 | `.heading` |
| Body | 15 / 22 | `.body` |
| Sub | 13 / 18 | `.sub` |
| Caption | 11 / 15 | `.caption` |
| Overline | 10 / 14, +0.14em, majuscules | `.overline` |

Les nombres utilisent `font-variant-numeric: tabular-nums` → en Flutter,
`FontFeature.tabularFigures()`.

### Espacement, rayons, durées

- Échelle 4 : `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`. Marge latérale d'écran : **20 px**.
- Rayons : `6 · 10 · 14 · 20 · 28 · pilule`. Le sceau utilise un rayon **en pourcentage** (30 %),
  soit `BorderRadius.circular(size * 0.3)` en Flutter.
- Durées : `180ms` (retour tactile) · `320ms` (transition d'écran) · `620ms` (barres, anneaux) ·
  `1100ms` (cérémonie : validation de grade). Courbe par défaut `cubic-bezier(.22,.61,.36,1)`
  → `Curves.easeOutCubic`.

---

## 3. Composants → widgets Flutter

| Classe CSS | Description | Équivalent Flutter |
|---|---|---|
| `.appbar` | Barre légère, titre centré, sans ombre | `AppBar(elevation: 0, centerTitle: true)` |
| `.card` | Carte, bordure 1 px, ombre chaude très basse | `Container` + `BoxDecoration` |
| `.card--paper` | Carte + tranche dorée en dégradé | `Stack` : carte + `Container` 2 px `LinearGradient` |
| `.ink` | Bloc inversé, tampon circulaire en filigrane | `Stack` : `DecoratedBox` + `Positioned` cercle bordé |
| `.seal` | Sceau, rayon 30 %, bordure intérieure | `Container` + `Container` interne inséré de 4 px |
| `.avatar` / `.avatar--ringed` | Initiales, liseré de grade | `CircleAvatar`-like : `Container` rayon 34 % + `BoxShadow` double |
| `.avatarstack` | Pile chevauchée (−10 px), initiale unique | `Stack` + `Positioned` |
| `.badge` | Pastille de statut | `Chip` compact / `Container` pilule |
| `.belt` | Disque coloré **+ libellé texte** | `Row(Container, Text)` |
| `.btn--primary / --gold / --accent / --outline / --ghost / --danger` | 6 variantes, hauteur 44 | `FilledButton` / `OutlinedButton` / `TextButton` + `ButtonStyle` |
| `.fab` | Sceau flottant, pas un cercle Material | `FloatingActionButton(shape: RoundedRectangleBorder(radius: 30%))` |
| `.tabs` / `.tab` | Onglets soulignés, indicateur vermillon | `TabBar` + `indicator` personnalisé |
| `.filters` / `.filter` | Puces de filtre défilantes | `SingleChildScrollView(horizontal)` + `FilterChip` |
| `.segmented` | Sélecteur 2–3 options | `SegmentedButton` restylé |
| `.list--card` / `.item` | Liste encartée, séparateurs internes | `Column` dans `ClipRRect` + `ListTile` |
| `.input` / `.field` / `.field--error` | Champ creusé, focus doré, état d'erreur | `TextField` + `InputDecoration` |
| `.check` | Ligne d'appel, cible 56 px, coche tracée | `InkWell` + `CustomPaint` (animation de tracé) |
| `.switch` | Interrupteur doré | `Switch` avec `activeColor: gold` |
| `.bar` / `.bar__fill` | Barre de progression, animée depuis la gauche | `LinearProgressIndicator` ou `FractionallySizedBox` |
| `.ring` | Anneau SVG, animé sur 1100 ms | `CustomPaint` + `TweenAnimationBuilder` |
| `.timeline` / `.tl` | Grille `52px · 22px · 1fr`, filet + nœud | `Row` par étape, filet en `CustomPaint` |
| `.chart` | Barres verticales sans grille ni axes | `CustomPaint` ou `fl_chart` dépouillé |
| `.gauge` | Jauge segmentée (stocks, occupation) | `Row` de `Expanded(Container)` |
| `.tabbar` | 5 emplacements, sceau surélevé au centre | `BottomAppBar` + `FloatingActionButton` centré |
| `.sheet` | Feuille inférieure, poignée, 76 % max | `showModalBottomSheet` |
| `.dialog` | Dialogue centré, entrée en tampon | `showDialog` + `ScaleTransition` |
| `.toast` | Bandeau discret, encre, 2,6 s | `SnackBar` avec `behavior: floating` |
| `.notif` | Ligne de notification, pastille de non-lu | `ListTile` |
| `.empty` | Illustration temple au trait + maxime | `Column` centrée + `SvgPicture` |
| `.skel` | Squelette, pulsation lente 1,8 s | `AnimatedOpacity` en boucle (pas de shimmer agité) |

---

## 4. Navigation

Barre inférieure à **cinq emplacements**, dont le centre est un sceau surélevé :

```
Accueil   Dojo   ⟦ ◈ ⟧   Communauté   Monastère
```

Le sceau n'est pas un simple bouton d'ajout : il ouvre une **feuille inférieure** qui porte
à la fois les actions rapides (présences, séance, évaluation, annonce) et les **espaces
secondaires** — Ressources, Finances, Documents, Notifications, Recherche, Paramètres.
C'est ce qui permet de couvrir les huit sections demandées sans jamais afficher plus de
cinq éléments de navigation à la fois.

Les trois hubs (`martial`, `community`, `temple`) sont des pages d'entrée sobres :
un bloc d'encre contextuel, puis deux listes encartées. Aucun hub n'affiche de statistiques
qu'on n'irait pas consulter.

---

## 5. Inventaire des écrans

| # | Clé | Écran | # | Clé | Écran |
|---|---|---|---|---|---|
| 01 | `splash` | Identité du monastère | 16 | `evaluate` | Évaluation d'un élève |
| 02 | `login` | Connexion *(avec erreur de champ)* | 17 | `community` | Communauté |
| 03 | `homeMaster` | Accueil maître | 18 | `member` | Profil membre |
| 04 | `homeAdmin` | Accueil administrateur | 19 | `rooms` | Chambres |
| 05 | `homeStudent` | Accueil élève | 20 | `meals` | Repas |
| 06 | `planning` | Planning quotidien | 21 | `stock` | Stocks |
| 07 | `students` | Liste des élèves | 22 | `finance` | Finances |
| 08 | `student` | Profil élève | 23 | `donations` | Dons |
| 09 | `journey` | Parcours martial | 24 | `events` | Événements |
| 10 | `grades` | Grades | 25 | `documents` | Documents |
| 11 | `gradeDetail` | Détail d'un grade | 26 | `notifications` | Notifications |
| 12 | `techniques` | Techniques & formes | 27 | `search` | Recherche globale |
| 13 | `trainings` | Entraînements | 28 | `settings` | Paramètres |
| 14 | `attendance` | Présence | 29 | `users` | Gestion des utilisateurs |
| 15 | `exams` | Examens | 30 | `permissions` | Rôles & permissions |

Écrans supplémentaires : `martial` (hub Arts martiaux), `temple` (hub Vie du monastère),
`session` (détail d'une séance), `states` (chargement / vide / erreur / synchronisation).

---

## 6. États

| État | Où le voir |
|---|---|
| Chargement | `states` — squelettes à pulsation lente |
| Synchronisation | `states` — rotation 2,4 s, jamais de spinner nerveux |
| Vide | `states` — « Aucun entraînement aujourd'hui. » + maxime + temple au trait |
| Erreur réseau | `states` — message + action de reprise |
| Erreur de champ | `login` — bordure vermillon + message + icône |
| Actif / inactif | `attendance` (coché/décoché), `permissions` (interrupteurs), `filters`, `tabs` |
| Alerte de seuil | `stock` — fond teinté **et** libellé « Sous le seuil de 20 kg » |

---

## 7. Micro-interactions

Lentes, peu nombreuses, jamais décoratives.

| Interaction | Détail |
|---|---|
| Transition d'écran | Fondu + 8 px vers le haut, 320 ms |
| Entrée d'un bloc majeur | `.rise` — 10 px, 320 ms |
| Barres et anneaux | Croissance depuis 0, 620 ms / 1100 ms |
| Validation d'une présence | Tracé de la coche (`stroke-dashoffset`), 320 ms, + recalcul du taux en direct |
| **Validation d'un grade** | `.stamp` — le sceau s'abat comme un tampon : 1,5× → 0,94× → 1×, 1100 ms |
| Séance en cours | `.halo` — halo doré respirant, 1,6 s |
| Appui | Échelle 0,97 (bouton) / 0,92 (icône, sceau) |

`prefers-reduced-motion` neutralise l'ensemble.

---

## 8. Accessibilité

- Contraste : toutes les combinaisons texte/fond du système ont été mesurées et
  atteignent au minimum **4,5:1** — y compris les libellés de 10 et 11 px, qui sont
  précisément ceux qu'on rate d'ordinaire. Mesures : principal 16,1:1 · secondaire 6,9:1 ·
  tertiaire 5,3:1 (4,5:1 sur surface creusée) · doré textuel 5,4:1 · vermillon textuel 6,6:1 ·
  badge d'avertissement 4,7:1. En mode sombre : 14,6 / 6,5 / 4,5 / 8,5:1.
  Les éléments non textuels (anneaux, barres, jauges) tiennent le seuil de 3:1.
- Cibles tactiles : 44 px minimum (`--tap`), 56 px pour les lignes d'appel.
- **La couleur n'est jamais seule porteuse d'information** : chaque disque de ceinture
  est doublé de son nom, chaque statut de stock d'un libellé, chaque état de chambre
  d'un badge textuel.
- États actifs exprimés par `aria-current`, `aria-selected`, `aria-pressed`, `aria-checked`
  → `Semantics(selected:, checked:)` en Flutter.
- Focus visible doré de 2 px sur tout élément interactif.
- Toute la terminologie est en français ; les termes techniques chinois sont
  systématiquement accompagnés de leur traduction (« Ma Bu · Position du cavalier »).

---

## 9. Données fictives

Monastère de **Long Shan**, Antananarivo. 17 personnes détaillées (élèves, moines, maîtres,
personnel, visiteur, ancien élève, donateur), 7 grades, 12 techniques, 4 formes, 4 groupes,
9 chambres sur 2 bâtiments, 3 repas, 5 catégories de stock, 6 mois de finances,
5 dons, 5 événements, 6 documents, 6 notifications, 7 rôles.
Devise : **Ariary**, format français (`4 850 000 Ar`).

Les seuils sont volontairement cohérents entre écrans : le stock d'huile à 4 L déclenche
l'alerte sur `stock`, le rappel sur `meals`, la notification sur `notifications` et la ligne
« à traiter » sur `homeAdmin`.
