# Kung Fu — Système d'interface mobile

Monastère de Kung-Fu · école d'arts martiaux · gestion de la vie quotidienne.

Prototype d'interface **mobile-first** complet et navigable : 39 écrans, deux thèmes,
un design system cohérent. Il sert de **référence directe pour l'implémentation Flutter** —
chaque composant CSS ci-dessous a son équivalent widget indiqué.

Plusieurs écrans ne sont pas des maquettes : la **recherche globale** interroge réellement
les données, l'**évaluation d'examen** se saisit au pas-à-pas avec moyenne et verdict
recalculés, l'**appel de présence** se filtre au nom, et la **messagerie** envoie de vrais
messages qui remontent dans la liste des conversations.

## Lancer

```bash
python3 -m http.server 8000     # puis ouvrir http://localhost:8000
```

Aucune dépendance, aucun réseau, aucune police externe. Ouvrir `index.html` suffit.

- **Colonne de gauche** : index des 39 écrans.
- **Flèches ↑ ↓** : parcourir les écrans. **Échap** : fermer un overlay.
- **Mode clair / Temple de nuit** : bascule en haut de la scène.
- Sous 900 px de large, l'échafaudage disparaît et l'application occupe tout l'écran.

## Déploiement

Site statique sans étape de build : `vercel.json` fixe `framework`, `buildCommand` et
`installCommand` à `null`, et `outputDirectory` à la racine. Vercel sert les fichiers tels
quels.

À l'import depuis l'interface Vercel — `vercel.json` étant lu au build et non à l'import,
l'écran demande quand même ces valeurs :

| Champ | Valeur |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` |
| Build / Output / Install Command | laisser vide, sans *Override* |

**Sur la politique de cache.** Les fichiers CSS et JS ne portent pas d'empreinte de version
dans leur nom. Tant que le prototype est en relecture, tout est donc revalidé à chaque
requête : le risque n'est pas la bande passante mais qu'un relecteur recharge et obtienne
une feuille de style en cache associée à un script neuf. Le jour où les ressources seront
versionnées (`app.a1b2c3.js`), il faudra passer les assets en `max-age=31536000, immutable`
et ne garder la revalidation que sur le HTML.

**Attention aux commentaires.** Vercel valide `vercel.json` strictement et rejette toute
propriété hors schéma — y compris la clé `"//"` couramment utilisée pour commenter du JSON.
Les explications appartiennent à ce fichier, pas à la configuration.

## Fichiers

| Fichier | Rôle |
|---|---|
| `css/tokens.css` | Source de vérité : couleurs, typographie, espacement, rayons, durées |
| `css/base.css` | Reset + cadre de présentation (téléphone, index) — **non porté en Flutter** |
| `css/components.css` | La bibliothèque de composants |
| `js/qr.js` | Encodeur QR autonome (mode octet, niveau M, versions 1 à 6) + jeton de membre |
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
| `--font-display` | Serif (Iowan Old Style / Noto Serif / Georgia) | Titres, **tous les nombres**, citations |
| `--font-ui` | Sans-serif système | Corps, libellés, boutons |

En Flutter : `Noto Serif` + `Noto Sans` (les deux couvrent le français et le malgache).

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
| `.railblock` / `.rail` | Carousel horizontal à accroche, débordant des marges | `ListView.separated(scrollDirection: Axis.horizontal)`, accroche via `PageScrollPhysics` ou `CarouselView` |
| `.mcard` | **Fiche membre en couches** (156 × 208) : portrait, voile dégradé, grade flottant, nom ancré en bas. Toutes les couches partagent la cellule `1 / 1` d'une grille | `Stack` + `Positioned` — c'est le cas d'usage direct de `Stack` |
| `portraitSVG()` | Portrait déterministe généré : dégradé teinté par le grade, sceau en filigrane, initiales gravées | `CustomPaint` ou `SvgPicture.string` |
| `.stepper` | Pas-à-pas de notation, cible 38 px | `IconButton` + `InkWell` |
| `.thread` / `.msg` | Fil de conversation, bulles asymétriques, envois consécutifs regroupés | `ListView` + `Align` + `Container` |
| `.daysep` | Séparateur de journée, même filet que le reste de l'app | `Row` + `Divider` |
| `.composer` | Zone de saisie auto-extensible + bouton sceau | `TextField(maxLines: null)` |
| `.notice` | Bandeau qui **remplace** la saisie (silence, canal en lecture seule) | `Container` en pied de `Scaffold` |
| `.scard` | Fiche séance paysage (232 px), l'heure domine | `SizedBox(width: 232)` + `Card` |
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

### Composition de l'accueil

L'accueil ne s'empile pas en cartes pleine largeur — c'est ce qui fait le dashboard
générique. Il alterne deux rythmes : des blocs pleine largeur pour ce qui appelle une
décision (l'état du monastère, la prochaine activité), et des **rails horizontaux** pour
ce qui s'explore (les membres, les séances du jour).

Le rail des membres est la pièce centrale, et il est **filtrable** — Présents · Élèves ·
Maîtres · Moines · Personnel · Visiteurs. Il se lit avec le bloc d'encre juste au-dessus :
les chiffres donnent l'état, les visages donnent qui le compose. Deux règles le régissent :

- Les cartes sont ordonnées selon la **hiérarchie du monastère** (enseignants, moines,
  élèves, puis le reste), jamais par ordre alphabétique.
- Les enseignants reçoivent la **carte d'encre**, les autres la carte de papier. Le rang
  se lit dans la matière de la carte, pas dans une étiquette de plus.

Le rail déborde volontairement des marges : une carte tronquée au bord droit indique
qu'il y a une suite, ce qui évite flèches et pastilles de pagination.
Les deux autres accueils reprennent le principe avec le rail qui les concerne —
« Résidents et personnel » pour l'intendance, « Mon groupe » pour l'élève.

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
`session` (détail d'une séance), `dues` (cotisations), `messages` (conversations),
`chat` (une conversation), `newStudent` (admission), `card` (carte de membre),
`states` (chargement / vide / erreur / synchronisation).

### Fonctionnalités interactives

| Écran | Ce qui fonctionne réellement |
|---|---|
| `search` | Index construit sur les données de l'app — personnes, grades, techniques, formes, séances, événements, documents, chambres, ressources, dons. Recherche insensible aux accents (« maitre » trouve « Maître »), multi-mots, résultats groupés, portion trouvée surlignée, tri plaçant les débuts de libellé en tête, filtres par catégorie, état vide. |
| `evaluate` | Chaque épreuve porte un pas-à-pas −/+ borné à 0–20. La moyenne et le verdict (« Grade acquis » / « Sous le seuil », seuil 12) se recalculent à chaque appui, et la cérémonie de validation reprend la moyenne réellement saisie. Seule la ligne touchée est redessinée. |
| `attendance` | Filtre par nom au-dessus de l'appel — avec 48 élèves inscrits, taper coûte moins cher que faire défiler. Taux et compteur recalculés en direct, « tout cocher », état vide si le filtre ne rend rien. |
| `dues` | Suivi des cotisations : taux de recouvrement, montants en attente, retards classés par ancienneté, rappel groupé. Les montants dérivent d'un tarif unique (25 000 Ar, 12 000 Ar pour les résidents dont l'hébergement est facturé à part) — les totaux de l'écran sont donc cohérents entre eux, pas saisis à la main. |
| `messages` / `chat` | Messagerie réelle : la saisie envoie, le message s'ajoute au fil, la liste des conversations se met à jour, Entrée envoie et Maj+Entrée passe à la ligne, la zone de saisie grandit avec le texte, la conversation s'ouvre sur son dernier message. |
| `newStudent` | Admission réelle : validation de trois champs requis avec messages et remontée au premier problème, la cotisation suit l'interrupteur « résident », et la validation crée l'élève dans les mêmes tableaux que les autres — il apparaît aussitôt dans les listes, les rails, les cotisations et la recherche. |
| `card` | Carte de membre avec un **vrai code QR**, encodé à la volée. |
| Rails d'accueil | Filtrage par rôle avec redessin animé de la piste. |

---

## 10. Messagerie

Une messagerie de monastère n'est pas un fil de discussion neutre : elle porte les règles
du lieu.

**Trois natures de canal.** `annonce` — lu par tous, écrit par les seuls maîtres, la règle
étant affichée sous le fil plutôt que découverte par un envoi refusé. `group` — un groupe
de pratique ou un corps de la communauté, où l'auteur est nommé au-dessus de sa bulle.
`direct` — de personne à personne, sans nom d'auteur puisqu'il est déjà dans l'en-tête.

**Le silence du monastère.** Pendant les méditations (05:30–06:30, 18:00–18:45) et après
l'extinction des lampes (21:00–05:30), la zone de saisie est **remplacée** par un bandeau
qui nomme la plage en cours et l'heure de reprise — elle n'est pas grisée sans explication.
Hors de ces plages, un rappel discret annonce la prochaine. C'est la même donnée que le
rythme quotidien de l'écran `planning` : un seul tableau `SILENCE` sert les deux.

**Deux voix, une matière.** L'émetteur se distingue par la matière de sa bulle, pas par une
couleur vive : encre sur papier en mode clair, soit un écart de 17:1. Deux surfaces sombres
ne peuvent pas atteindre un tel écart — mesuré à 1,2:1 — donc le mode sombre confie la
distinction à un filet doré, via les jetons `--bubble-mine-*`. Le principe tient dans les
deux thèmes sans qu'aucun composant ne connaisse le thème courant.

---

## 11. Carte de membre et code QR

La carte sert à pointer les présences : son code doit **réellement se scanner**. Un motif
décoratif qui ressemble à un QR ne servirait à rien devant une caméra. `js/qr.js` est donc
un encodeur complet écrit à la main — mode octet, correction de niveau M, versions 1 à 6 :
corps de Galois GF(256), correction Reed-Solomon, entrelacement des blocs, placement en
zigzag, évaluation des huit masques par pénalité, information de format protégée par
BCH(15,5). Aucune dépendance : l'application ne charge rien de l'extérieur.

**La vérification ne repose pas sur l'œil.** Chaque motif produit est relu par un décodeur
tiers (`jsqr`), y compris — et c'est le test qui compte — le SVG **tel qu'il est rendu dans
la carte**, rastérisé depuis la page puis décodé. Huit charges utiles couvrant les versions
1 à 5 et les caractères accentués passent le test.

**Le jeton.** Format `KF|<numéro de membre>|<année>|<contrôle>`. La somme de contrôle
repère une carte modifiée à la main ; elle **n'empêche pas une contrefaçon délibérée**, ce
qui demanderait une signature délivrée par le serveur. C'est écrit sur l'écran de la carte
plutôt que laissé à supposer.

**Le format.** Badge vertical plutôt que carte bancaire : sur un écran de téléphone, le
format paysage ne permet pas de garder à la fois un portrait et un code assez grands. Le
portrait généré est repris tel quel des fiches de rail, et la bande de grade en pied est
doublée du nom de la ceinture dans la ligne de rôle — jamais la couleur seule.

**Le coût.** Rendre la carte prend ~7 ms, encodage et évaluation des huit masques compris.
La marge claire de 4 modules autour du code est imposée par la norme : sans elle, beaucoup
de lecteurs échouent.

---

## 12. Audit et optimisation

Le prototype a été mesuré plutôt qu'estimé. Ce que l'audit a donné :

**Ce qui allait déjà.** Rendu d'un écran entre 2 et 6 ms (médiane 2,2 ms), défilement à
60 images/s sur l'écran le plus lourd, aucun bouton imbriqué dans un autre. Il n'y avait
donc rien à gagner à optimiser le JavaScript, et ça n'a pas été fait.

**Deux bugs visuels que seule la mesure révélait.** Un `<svg>` sans `width`/`height`
s'étire à 100 % de son conteneur. Conséquence : les icônes remplissaient le sceau entier
(36, 52 et 76 px au lieu de 17, 24 et 36), et l'icône d'erreur de l'écran de connexion
s'affichait à **194 px**. Chaque conteneur pose désormais sa taille.

**Un défaut de cascade.** `.card--tap` déclarait `display: block` et, plus bas dans la
feuille, écrasait le `flex` de `.row` : les enfants retombaient en flux inline et le
chevron, devenu inline, ignorait sa largeur. Cinq cartes de trois écrans étaient touchées.
Les utilitaires de disposition sont maintenant repris en fin de feuille.

**Sprite d'icônes.** L'écran Communauté portait 15 balises `<svg>` pour 3 dessins
distincts. Les tracés sont déclarés une fois dans un sprite `<symbol>`, chaque usage
n'émettant plus qu'un `<use>` : **4 008 → 3 814 nœuds DOM** sur l'ensemble des écrans
(−4,8 %), sans aucune régression de taille d'icône (vérifié écran par écran).

**Un sélecteur `:has()` qui coûtait cher.** `.section__head:has(+ .filters)` élargit
l'invalidation de style bien au-delà de son effet : il pesait sur le rendu d'écrans qui ne
contiennent aucun rail. En le remplaçant par une classe posée à la construction,
l'écran Communauté est passé de **11,5 à 4,6 ms** et le total de tous les écrans de
**168 à 127 ms**. Leçon retenue dans la feuille : ce qui peut être décidé au moment de
construire le balisage ne doit pas être déduit par le sélecteur.

**Plafond de rail.** Un rail chargeait toutes les personnes du filtre. Avec les 48 élèves
réels du monastère, cela ferait 48 portraits rendus pour trois visibles. Le rail plafonne
à 10 cartes, la carte de fin annonçant « + N autres ». C'était la réserve signalée au
tour précédent : elle est levée.

**Accessibilité.** Les interrupteurs de `settings` et `permissions` n'avaient pas de nom
accessible — un lecteur d'écran annonçait « bouton » sans dire lequel. Les actions de
section (« Tout voir », « Planning ») offraient une cible de 30 px ; elles font désormais
44 px, les marges négatives préservant la hauteur visuelle de la ligne de titre. Les
interrupteurs gardent leur rail de 28 px mais portent une cible de 44 px via un
pseudo-élément — vérifié par un clic 6 px au-dessus du rail, qui bascule bien l'état.

**Le coût assumé.** Les portraits pleine carte sont plus chers que les pastilles
d'initiales qu'ils remplacent : l'accueil rend en ~12 ms contre ~6 ms auparavant. C'est un
choix, pas une dérive — le budget d'une image à 60 images/s est de 16 ms, le défilement
reste à 60 images/s, et le rendu n'a lieu qu'à la navigation.

**Robustesse de liste.** Un sous-titre long poussait la colonne de droite et cassait
l'alignement de toute la liste ; `.item__sub` tient maintenant sur une ligne avec ellipse.

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
- Toute la terminologie est en français ; les termes techniques malgaches sont
  systématiquement accompagnés de leur traduction française
  (« Fijoroana soavaly · Position du cavalier »).

---

## 9. Données fictives

Monastère **Kung Fu**, Antananarivo. 17 personnes détaillées (élèves, moines, maîtres,
personnel, visiteur, ancien élève, donateur), 7 grades, 12 techniques, 4 formes, 4 groupes,
9 chambres sur 2 bâtiments, 3 repas, 5 catégories de stock, 6 mois de finances,
5 dons, 5 événements, 6 documents, 6 notifications, 7 rôles.
Devise : **Ariary**, format français (`4 850 000 Ar`).

Les seuils sont volontairement cohérents entre écrans : le stock d'huile à 4 L déclenche
l'alerte sur `stock`, le rappel sur `meals`, la notification sur `notifications` et la ligne
« à traiter » sur `homeAdmin`.
