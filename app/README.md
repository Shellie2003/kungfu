# L'application

Expo (React Native), Android d'abord. Ce dossier contient le thème, les composants
communs et les écrans portés depuis la maquette.

## Comment on garantit que le design est le même

Pas en relisant côte à côte. En mesurant.

```bash
npm run verifier     # extrait le thème, rebâtit la maquette, compare
```

Sortie attendue :

```
✓ etudiants
    géométrie : 27 textes au même endroit, à la même taille, dans la même couleur
    pixels    : 0.04 % (133 sur 304 200, seuil 0.3 %)
```

Deux vérifications, et la première est la plus forte.

**La géométrie ne tolère rien.** Chaque texte visible est relevé des deux côtés — sa
position, sa taille, sa couleur, sa graisse — et doit concorder exactement. C'est ce qui
attrape ce que l'œil ne voit pas : une marge de 2 px, une graisse 600 au lieu de 700, un
gris légèrement différent. Le texte est mesuré par un `Range`, donc l'encre elle-même et
non la boîte qui la contient : la maquette pose le texte sur l'élément rembourré, React
Native impose un `<Text>` à l'intérieur, et comparer les boîtes comparerait deux choses
différentes.

**Les pixels sont le filet.** Ils attrapent ce que la géométrie ne voit pas — une bordure,
un fond, une icône. Le seuil de 0,3 % couvre les seules différences légitimes : le rendu
des glyphes d'un moteur à l'autre.

### Ce que cela ne prouve pas

Les composants sont rendus par **react-native-web** dans un navigateur, pas par Android.
Cela vérifie que l'arbre de composants produit la bonne géométrie — là où se logent la
quasi-totalité des écarts. Cela ne vérifie pas le rendu natif : le lissage des polices, les
ombres (`elevation`), et l'arrondi des sous-pixels diffèrent par nature. Ces trois-là se
regardent à l'œil, sur un vrai téléphone, une fois par écran.

## Le thème n'est pas recopié, il est extrait

```bash
npm run theme        # css/app.css → app/theme/tokens.ts
```

`app/theme/tokens.ts` est **généré**. On ne le modifie pas à la main : on corrige la
maquette et on régénère. Il porte 13 couleurs, 2 polices, 4 rayons et 34 mesures relevées
règle par règle — hauteur du bouton, rembourrage du chip, écart de la ligne, taille de la
pastille de grade.

Recopier ces valeurs à la main, c'est garantir qu'un jour l'une changera sans l'autre.
L'extraction échoue bruyamment si une règle disparaît de la feuille : mieux vaut ne pas
construire que construire avec une valeur inventée.

**Une valeur écrite en dur dans un écran est une dérive en puissance.** Si une mesure
manque, on l'ajoute à l'extracteur.

## Ce que le portage a révélé

La comparaison a trouvé quatre défauts **dans la maquette**, invisibles à la relecture :

| Défaut | Effet |
|---|---|
| Blocs comprimés par la flexbox | Le rail de filtres tombait de 53 à 18 px sur Étudiants et Casier |
| Hauteur du chip laissée à la police | Variable d'un moteur de rendu à l'autre |
| Animation d'entrée non désactivable | Ignorait le réglage « animations réduites » du système |

Le même défaut de compression existait côté React Native : un `ScrollView` horizontal dans
une colonne se laisse comprimer par défaut. Corrigé par `flexGrow: 0, flexShrink: 0`.

## Les pièges de React Native traités dans `composants/base.tsx`

- La direction par défaut est la **colonne**, pas la ligne.
- Tout texte doit être dans `<Text>` : il n'hérite pas du parent.
- Une ombre CSS n'existe pas : c'est `elevation` sur Android.
- `box-shadow: inset` non plus : la pastille de grade emploie une bordure de 1 px, sans
  quoi la ceinture blanche disparaît sur le fond clair.

## Écrans portés

| Écran | Géométrie | Pixels |
|---|---|---|
| 03 · Étudiants | 27 textes exacts | 0,04 % |

Les autres suivent le même moule. Chaque écran porté s'ajoute à la liste `ECRANS` de
`outils/comparer.mjs`, et la vérification devient automatique.

## Ce qui reste à faire avant le premier APK

- Le projet Expo lui-même (`npx create-expo-app`), avec `expo-font` pour embarquer Archivo
  et Karla — les mêmes fichiers que `css/fonts.css`.
- `react-native-svg` pour les icônes. `outils/shim-svg.js` ne sert qu'à la comparaison et
  ne part jamais dans l'application.
- Le branchement à Supabase, écran par écran, après l'étape 2 de `ARCHITECTURE.md`.
