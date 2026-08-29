# Comment tester

Trois façons, de la plus rapide à la plus fidèle. Elles ne répondent pas à la même
question : la première montre le **design**, la deuxième montre l'**application qui
fonctionne**, la troisième montre ce que le **club aura réellement**.

---

## 1. Dans un navigateur — rien à installer

L'aperçu web est publié à côté de la maquette, à l'adresse `/apercu`. Sur téléphone,
scannez le code QR affiché sur cette page depuis un ordinateur.

Ce sont les vrais composants de l'application, rendus par react-native-web. Ce ne sont
**pas** des captures d'écran.

Ce qu'il ne montre pas : la connexion à Supabase — l'aperçu tourne sans serveur — et le
rendu natif : lissage des polices, ombres, défilement à l'inertie.

**Bon pour** : faire valider le design au club, sans rien lui demander d'installer.

---

## 2. Expo Go — l'application entière, avec la vraie base

C'est la façon de tester au quotidien. Le rechargement est immédiat : on modifie un
fichier, l'écran se met à jour sur le téléphone en une seconde.

### Une fois

Sur le téléphone : installer **Expo Go** depuis le Play Store.

Sur l'ordinateur :

```bash
cd mobile
npm install
```

Puis créer `mobile/.env` — le fichier n'est pas dans le dépôt, et ne doit pas y être :

```
EXPO_PUBLIC_SUPABASE_URL=https://znotzkfwukvvtaqfrozn.supabase.co
EXPO_PUBLIC_SUPABASE_CLE=sb_publishable_PsIJsXUNR6-9wbmJiiexkQ_Klh_0hDJ
```

Sans ce fichier, l'application s'arrête au démarrage avec un message qui le dit. C'est
voulu : mieux vaut échouer franchement que laisser chaque écran afficher une erreur
incompréhensible.

### À chaque fois

```bash
cd mobile
npx expo start
```

Un code QR s'affiche dans le terminal. Scannez-le avec **Expo Go**.

Si le téléphone ne trouve pas l'ordinateur — réseaux différents, Wi-Fi qui isole les
appareils, ce qui est fréquent sur un réseau partagé :

```bash
npx expo start --tunnel
```

Plus lent, mais passe partout.

### Les comptes d'essai

| Matricule | Mot de passe | Ce qu'on voit |
|---|---|---|
| `F04x042` | `essai-eleve` | Un élève : l'annuaire, un seul salon |
| `F04x045` | `essai-maitre` | Un maître : deux salons, dont celui des maîtres |
| `F04x001` | `essai-admin` | L'administration |

**Ce qui vaut la peine d'être essayé** : connectez-vous en élève, puis en maître, et
comparez ce que chacun voit. C'est la démonstration que les règles d'accès font leur
travail — et c'est ce qui rassurera le club sur la confidentialité de l'espace des maîtres.

L'annuaire contient quatre fiches, dont **une sans compte** : l'élève qui n'a pas de
téléphone. Il doit apparaître comme les autres.

### Ce qui ne marche pas encore

Quatre onglets sur cinq affichent un marque-place nommé — Accueil, Messages, Casier,
Album. Ils disent quel écran de la maquette reste à porter.

---

## 3. Un APK — ce que le club aura

Pour faire essayer au club sans qu'il installe Expo Go, et pour juger le rendu natif.

```bash
cd mobile
npx eas login          # compte Expo, gratuit
npx eas init           # écrit l'identifiant du projet dans app.json
npm run apk            # eas build --platform android --profile apercu
```

La construction tourne chez Expo et rend un lien de téléchargement. Vous l'envoyez par
WhatsApp, le club installe.

Ensuite, pour livrer une correction **sans reconstruire** :

```bash
npm run diffuser       # eas update --branch apercu
```

L'application se met à jour d'elle-même au prochain lancement, en quelques secondes. C'est
ce qui évite de refaire un APK à chaque changement.

---

## Vérifier sans téléphone

```bash
npm run verifier
```

Extrait le thème, reconstruit la maquette, et **mesure** l'écart entre chaque écran porté
et la maquette. Sortie attendue :

```
✓ connexion   11 textes au même endroit, à la même taille, dans la même couleur
✓ etudiants   27 textes au même endroit, à la même taille, dans la même couleur
```

```bash
cd mobile && npm run types
```

TypeScript en mode strict. Aucune sortie signifie que tout est bon.

Et pour les règles d'accès de la base, la commande est dans `supabase/README.md` : elle se
fait passer pour un élève, un maître et l'administration, et vérifie ce que chacun voit.

---

## Ce que j'ai vérifié moi-même, et ce que je n'ai pas pu

**Vérifié** : le paquet Android se construit — `npx expo export --platform android` rend
3,45 Mo de bytecode Hermes avec les 8 polices et les 26 images. TypeScript passe en strict.
Les migrations s'appliquent sur le vrai Supabase et le test de sécurité y passe.

**Pas vérifié** : que l'application se connecte réellement à Supabase depuis un téléphone.
Mon environnement de travail ne peut pas joindre `supabase.co` — la politique réseau le
bloque. Le code compile et la base répond aux requêtes SQL, mais l'appel HTTP depuis Expo,
c'est vous qui le verrez en premier.

Un défaut trouvé en faisant cette vérification : `expo-asset` manquait. Sans lui, rien ne
démarre dès qu'on charge une police ou une image. Vous seriez tombé dessus au premier
lancement.
