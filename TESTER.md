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

Puis créer `mobile/.env` en copiant le fichier d'essai :

```bash
cp .env.essai .env
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

| Matricule | Ce qu'on voit |
|---|---|
| `F04x042` | Un élève : l'annuaire, un seul salon |
| `F04x045` | Un maître : deux salons, dont celui des maîtres |
| `F04x001` | L'administration |

**Les mots de passe ne sont pas dans ce dépôt.** Il est public : les y écrire donnerait à
n'importe qui l'accès au projet d'essai, y compris en administrateur. Ils circulent
autrement.

**Ce qui vaut la peine d'être essayé** : connectez-vous en élève, puis en maître, et
comparez ce que chacun voit. C'est la démonstration que les règles d'accès font leur
travail — et c'est ce qui rassurera le club sur la confidentialité de l'espace des maîtres.

L'annuaire contient quatre fiches, dont **une sans compte** : l'élève qui n'a pas de
téléphone. Il doit apparaître comme les autres.

### Ce qui ne marche pas encore

Quatre onglets sur cinq affichent un marque-place nommé — Accueil, Messages, Casier,
Album. Ils disent quel écran de la maquette reste à porter.

---

## 3. Un APK, construit par GitHub — ce que le club aura

Aucun compte Expo, rien à installer sur votre machine : la construction se fait
entièrement sur les serveurs de GitHub, et l'APK se télécharge depuis la page de
l'exécution.

### La mise en place

**Aucune.** Pas de secret à configurer, pas de compte à créer.

### Construire

Onglet **Actions** → **Construire l'APK** → **Run workflow**. Ou simplement pousser un
changement dans `mobile/` : la construction part toute seule.

Environ dix minutes. À la fin, l'APK est en bas de la page, dans **Artifacts**. On le
télécharge, on l'envoie par WhatsApp, le club l'installe — en autorisant l'installation
depuis cette source, ce qu'Android demande une fois.

Le workflow vérifie aussi les types avant de construire : une erreur TypeScript arrête la
chaîne plutôt que de produire un APK cassé.

### La signature

L'APK est signé par la **clé de débogage livrée avec le modèle d'Expo**. C'est un fichier
fixe, identique sur toutes les machines, valide jusqu'en 2052 — vérifié par empreinte à
chaque construction. La signature est donc **stable** : le club installe une mise à jour
par-dessus la précédente sans désinstaller, et sans perdre sa session.

C'est ce qui permet de se passer entièrement de secrets.

**Ce que cela interdit** : la publication sur le Play Store, qui refuse la clé de débogage.
Le jour venu, il faudra une vraie clé — engendrée par vous, jamais partagée, et à ne jamais
perdre : **la perdre, c'est perdre définitivement la possibilité de mettre l'application à
jour**.

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore waishi-club.keystore -alias waishi \
  -keyalg RSA -keysize 2048 -validity 10000
```

Ce jour-là, la signature changera : l'application devra être **désinstallée une fois** sur
chaque téléphone. C'est une gêne unique, à prévoir dans le passage en production.

### Vers quel serveur pointe l'APK

Par défaut, le projet Supabase d'essai — les valeurs sont dans `mobile/.env.essai`,
versionné à dessein : l'adresse est publique et la clé publiable est faite pour partir dans
l'APK.

Pour pointer vers le projet du club, ajoutez deux secrets au dépôt, `SUPABASE_URL` et
`SUPABASE_CLE`. Le workflow les emploiera à la place, sans qu'on touche à un fichier.

### Le dépôt est public — ce que cela implique

Un dépôt public donne des minutes d'Actions **illimitées**, contre 2 000 par mois pour un
dépôt privé sur un compte gratuit. C'est ce qui permet de construire l'APK sans compter.

En contrepartie, tout ce qui est versionné est lisible par n'importe qui. D'où deux règles :

**Les mots de passe ne sont jamais dans le dépôt** — ni ceux d'essai, ni a fortiori ceux du
club.

**Aucune donnée réelle du club dans le projet Supabase d'essai.** L'adresse et la clé
publiable de ce projet sont dans `.env.essai`, donc publiques : c'est sans danger tant que
la base ne contient que des données inventées, et intenable dès qu'elle contiendrait la
date de naissance d'un mineur.

### Ce que l'APK demande comme permissions

**Internet et vibration. C'est tout.** Les permissions que React Native ajoute par défaut
— dont « dessiner par-dessus les autres applications », qui inquiète à l'installation et
attire l'attention du Play Store — sont explicitement retirées. L'appareil photo sera
demandé le jour où la fonctionnalité photo existera, pas avant.

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

**Vérifié aussi** : `npx expo prebuild` engendre un projet Android correct — paquet
`mg.analamahitsy.waishi`, deux permissions seulement — et la substitution de la clé de
signature s'applique bien au vrai `build.gradle` produit. C'est l'étape la plus fragile du
workflow ; elle échoue bruyamment si le modèle d'Expo change, plutôt que de produire un APK
signé par la mauvaise clé.

**Pas vérifié** : que l'application se connecte réellement à Supabase depuis un téléphone.
Mon environnement de travail ne peut pas joindre `supabase.co` — la politique réseau le
bloque. Le code compile et la base répond aux requêtes SQL, mais l'appel HTTP depuis Expo,
c'est vous qui le verrez en premier.

**Pas vérifié non plus** : la construction Gradle elle-même. Il n'y a pas de SDK Android
ici. Tout ce qui la précède est validé ; le `./gradlew assembleRelease` s'exécutera pour la
première fois sur GitHub. Si elle échoue, le journal de l'exécution le dira, et c'est
réparable.

Trois défauts trouvés en faisant ces vérifications : `expo-asset` manquait — rien ne démarre
sans lui dès qu'on charge une police ou une image ; `expo-system-ui` manquait aussi, pour
le verrouillage en thème clair ; et `app.json` demandait la permission caméra sans s'en
servir.
