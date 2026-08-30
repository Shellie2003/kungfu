# Comment tester

Trois façons, de la plus rapide à la plus fidèle. Elles ne répondent pas à la même
question : la première **contrôle** les écrans sans les regarder, la deuxième montre
l'**application qui fonctionne**, la troisième montre ce que le **club aura réellement**.

---

## 1. Sans téléphone, sans même regarder — le contrôle automatique

```bash
npm install                      # une fois, à la racine
cd app && npm install && cp .env.essai .env && cd ..
npm run verifier-app
```

Ce que cela fait : construit l'application, la sert dans un vrai navigateur, remplace le
serveur Supabase par des réponses en boîte, **ouvre les seize écrans** et vérifie que
chacun affiche ce qu'il doit afficher, sans erreur de console.

```
✓ accueil        32 lignes de texte
✓ etudiants      20 lignes de texte
…
✓ code QR        se décode, et rend « F04x042 » — le matricule de la fiche
✓ connexion      sans session, l’écran de connexion s’affiche seul
```

Le code QR de la carte de membre est **relu depuis la capture**, comme le ferait le
téléphone du maître qui pointe la présence : un QR qu'on n'a pas décodé est une image,
pas un code.

Il laisse une capture de chaque écran dans `outils/comparaisons/app/`. C'est le moyen le
plus rapide de voir ce qu'une modification a changé — et de le montrer au club sans rien
lui faire installer.

**Ce que ce contrôle ne dit pas** : que le rendu natif est correct. Il tourne dans
Chromium ; la WebView d'Android lissera les polices autrement. Il ne dit rien non plus de
la vraie base — elle a son propre test, dans `supabase/README.md`.

---

## 2. Dans un navigateur, avec la vraie base — le développement au quotidien

```bash
cd app
npm install
cp .env.essai .env
npm run dev
```

Ouvrez l'adresse affichée. Le rechargement est immédiat : on modifie un fichier, l'écran
se met à jour en une seconde. **Y compris `css/app.css` à la racine** — l'application lit
la feuille de la maquette, et la corriger corrige les deux.

Sans le fichier `.env`, l'application s'arrête au démarrage avec un message qui le dit.
C'est voulu : mieux vaut échouer franchement que laisser chaque écran afficher une erreur
incompréhensible.

Depuis un téléphone sur le même réseau : `npm run dev -- --host`, puis l'adresse en
`192.168.…` qui s'affiche.

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
travail — et c'est ce qui rassurera le club sur la confidentialité de l'espace des
maîtres. Notez bien ce qui se passe : l'espace des maîtres **n'apparaît pas** dans la
liste de l'élève, il n'est pas grisé. Le téléphone ne l'a jamais reçu.

L'annuaire contient quatre fiches, dont **une sans compte** : l'élève qui n'a pas de
téléphone. Il doit apparaître comme les autres.

### Ce qui ne marche pas encore

Les huit rangées de l'écran d'administration ne s'ouvrent pas : ces écrans restent à
écrire. Elles sont volontairement inertes plutôt que boutons morts.

---

## 3. Un APK, construit par GitHub — ce que le club aura

Rien à installer sur votre machine : la construction se fait entièrement sur les serveurs
de GitHub, et l'APK se télécharge depuis la page de l'exécution.

### La mise en place

**Aucune.** Pas de secret à configurer, pas de compte à créer.

### Construire

Onglet **Actions** → **Construire l'APK** → **Run workflow**. Ou simplement pousser un
changement dans `app/`, `css/` ou `icones.mjs` : la construction part toute seule. Ces
trois-là parce que l'application lit la feuille de style et les icônes de la maquette.

Une dizaine de minutes. À la fin, deux pièces jointes en bas de la page :

- **`waishi-<n>.apk`** — à télécharger, envoyer par WhatsApp, installer. Android demande
  une fois l'autorisation d'installer depuis cette source.
- **`ecrans-<n>`** — une capture de chacun des seize écrans, prise pendant la
  vérification. Pour regarder cette version **sans l'installer**.

Le workflow vérifie les types et ouvre les seize écrans avant de construire : une erreur
arrête la chaîne plutôt que de produire un APK cassé.

### La signature

L'APK est signé par la **clé de débogage du projet**, versionnée dans `app/signature/` et
contrôlée par empreinte à chaque construction. Elle est **fixe** : le club installe une
mise à jour par-dessus la précédente sans désinstaller, et sans perdre sa session.

Pourquoi elle est dans le dépôt, et ce qu'elle ne protège pas : `app/signature/LISEZ-MOI.md`.
En un mot — n'importe qui peut signer avec elle, donc **l'APK ne doit circuler que par un
canal de confiance**, le WhatsApp du club envoyé par le responsable.

**Ce que cela interdit** : la publication sur le Play Store, qui refuse la clé de
débogage. Le jour venu, il faudra une vraie clé — engendrée par vous, jamais partagée, et
à ne jamais perdre : **la perdre, c'est perdre définitivement la possibilité de mettre
l'application à jour**. Ce jour-là, la signature changera : l'application devra être
**désinstallée une fois** sur chaque téléphone.

### Vers quel serveur pointe l'APK

Par défaut, le projet Supabase d'essai — les valeurs sont dans `app/.env.essai`, versionné
à dessein : l'adresse est publique et la clé publiable est faite pour partir dans l'APK.

Pour pointer vers le projet du club, ajoutez deux secrets au dépôt, `SUPABASE_URL` et
`SUPABASE_CLE`. Le workflow les emploiera à la place, sans qu'on touche à un fichier.

### Le dépôt est public — ce que cela implique

Un dépôt public donne des minutes d'Actions **illimitées**, contre 2 000 par mois pour un
dépôt privé sur un compte gratuit. C'est ce qui permet de construire l'APK sans compter.

En contrepartie, tout ce qui est versionné est lisible par n'importe qui. D'où deux
règles :

**Les mots de passe ne sont jamais dans le dépôt** — ni ceux d'essai, ni a fortiori ceux
du club.

**Aucune donnée réelle du club dans le projet Supabase d'essai.** L'adresse et la clé
publiable de ce projet sont dans `.env.essai`, donc publiques : c'est sans danger tant que
la base ne contient que des données inventées, et intenable dès qu'elle contiendrait la
date de naissance d'un mineur.

### Ce que l'APK demande comme permissions

**Internet. C'est tout.** C'est la seule permission du manifeste — vérifiable dans
`app/android/app/src/main/AndroidManifest.xml` après `npx cap add android`. L'appareil
photo sera demandé le jour où la fonctionnalité photo existera, pas avant.

---

## Ce que j'ai vérifié moi-même, et ce que je n'ai pas pu

**Vérifié** : les seize écrans s'ouvrent dans un vrai navigateur, sans erreur de console,
avec des réponses de la forme exacte que rend PostgREST — c'est là que les écrans se
cassent, sur une jointure rendue en tableau plutôt qu'en objet. TypeScript passe en mode
strict. Le code QR de la carte se décode et rend le bon matricule. Les migrations
s'appliquent sur le vrai Supabase et le test de sécurité y passe.

**Vérifié aussi** : `npx cap add android` engendre un projet Android correct — paquet
`mg.analamahitsy.waishi`, une seule permission — et la clé de signature est celle
attendue, empreinte contrôlée.

**Pas vérifié** : que l'application se connecte réellement à Supabase depuis un téléphone.
Mon environnement de travail ne peut pas joindre `supabase.co` — la politique réseau le
bloque. Le code tourne et la base répond aux requêtes SQL, mais l'appel HTTP depuis le
téléphone, c'est vous qui le verrez en premier. **Le temps réel de la messagerie** est
dans le même cas : il passe par une WebSocket, que le réseau d'ici bloque également.

**Pas vérifié non plus** : la construction Gradle elle-même. Il n'y a pas de SDK Android
ici. Tout ce qui la précède est validé ; le `./gradlew assembleDebug` s'exécutera pour la
première fois sur GitHub. S'il échoue, le journal de l'exécution le dira, et c'est
réparable.

Défauts trouvés en faisant ces vérifications : le filtre par grade affichait « verte » en
minuscule, et la carte de membre répétait le matricule dans son pied de page à la place
d'une date de validité qui n'existe pas en base.
