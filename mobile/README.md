# L'application

**Expo SDK 52 · React Native 0.76 · TypeScript · Expo Router · Supabase · Android**

## Démarrer

```bash
cd mobile
npm install
cp .env.example .env        # puis remplir les deux valeurs Supabase
npx expo start              # QR code Expo Go, rechargement immédiat
```

Rien ne démarre sans `.env` : le client Supabase échoue avec un message clair plutôt que
de laisser chaque requête retourner une erreur incompréhensible.

```bash
npm run types               # tsc --noEmit, en mode strict
npm run apk                 # eas build, APK à distribuer par lien
npm run diffuser            # eas update, arrive sur les téléphones en quelques secondes
```

## L'organisation

```
mobile/
├─ app/          les routes Expo Router — elles ne font que brancher
├─ ecrans/       les vues, qui ne connaissent NI le routage NI le serveur
├─ composants/   les briques communes, mesurées sur la maquette
├─ services/     supabase, session — le seul endroit qui parle au serveur
├─ theme/        tokens.ts (généré) et typo.ts
└─ assets/       polices (générées) et images (générées)
```

**Une vue ne connaît ni le routage ni le serveur.** La redirection après connexion est
faite par `app/index.tsx`, qui écoute la session ; la fonction qui authentifie arrive en
paramètre. Ce n'est pas de la théorie : sans cela, rendre l'écran de connexion seul
chargerait `expo-secure-store`, un module natif absent du navigateur, et ni l'aperçu ni la
comparaison ne fonctionneraient.

## Trois pièges de React Native, traités une fois

**La graisse ne se choisit pas par `fontWeight`.** Avec une police embarquée, Android ne
sélectionne pas un fichier : au mieux il fabrique un faux gras, au pire il ignore la
demande. D'où une famille par graisse — `Archivo-Bold`, `Karla-SemiBold` — et
`theme/typo.ts` pour la désigner. Il n'y a **aucun `fontWeight`** dans le code.

**La direction par défaut est la colonne**, pas la ligne.

**`box-shadow: inset` n'existe pas** : la pastille de grade emploie une bordure de 1 px,
sans quoi la ceinture blanche disparaît sur le fond clair.

## Ce qui est généré, et ne se modifie pas à la main

| Fichier | Produit par |
|---|---|
| `theme/tokens.ts` | `npm run theme` — depuis `css/app.css` |
| `assets/polices/*.ttf` | `npm run polices` — depuis `css/fonts.css` |
| `assets/*.png` | `npm run images` — depuis `img/logo.jpg` |

Les polices sont **les mêmes fichiers que la maquette**, extraits de son base64, convertis
en TTF et figés à quatre graisses. La comparaison au pixel les charge aussi : elle teste
donc les polices que l'appareil aura.

## Où on en est

| Écran | Géométrie | Pixels |
|---|---|---|
| 01 · Connexion | 11 textes exacts | 0,11 % |
| 03 · Étudiants | 27 textes exacts | 0,04 % |

Les quatre autres onglets affichent un marque-place nommé, qui dit quel écran de la
maquette reste à porter.

## À faire avant le premier APK

1. Créer le projet Supabase **sur le compte du club**, appliquer `supabase/migrations/`.
2. `npx eas init` — remplit `extra.eas.projectId` dans `app.json`.
3. Créer le premier compte administrateur, et sa fiche dans `profils`.
