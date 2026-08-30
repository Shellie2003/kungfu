# Comment tester

**Sans rien installer : `…/essai`.** C'est la réponse courte, détaillée juste en dessous.

Quatre façons, qui ne répondent pas à la même question : la première évite d'installer
quoi que ce soit, la deuxième contrôle les écrans sans les regarder, la troisième sert au
développement au quotidien, la quatrième montre ce que le club aura réellement.

---

## 1. Le lien public — rien à installer, rien à recompiler

L'application est publiée à côté de la maquette, à l'adresse **`/essai`**. On l'ouvre dans
le navigateur du téléphone, elle se connecte à la vraie base, on se connecte avec un
compte d'essai.

Le code QR est dans `apercu/qr-app.png` : à afficher depuis un ordinateur, le club scanne
avec l'appareil photo. Le script **relit le code produit** pour vérifier qu'il encode bien
l'adresse — un QR qu'on n'a pas décodé est une image, pas un lien.

```bash
node outils/qr.mjs "https://…/essai" app     # régénère qr-app.png et qr-app.svg
```

Elle se **redéploie à chaque poussée** sur la branche : aucune installation, aucune mise à
jour à envoyer, le club a toujours la dernière version en rafraîchissant la page. C'est le
moyen de faire valider un changement en dix minutes plutôt qu'en un aller-retour d'APK.

Vercel construit l'application en même temps que la maquette, et **refuse de déployer si
TypeScript échoue** : un lien cassé ne peut pas partir au club.

**Ce que le lien ne montre pas**, et qui n'existe que dans l'APK :

- le **bouton retour d'Android** — dans le navigateur, c'est celui du navigateur ;
- la **barre d'état** en vert avec les icônes en clair ;
- l'application dans sa propre fenêtre, sans la barre d'adresse ;
- le rendu **natif** — lissage des polices, défilement à l'inertie.

Tout le reste — les écrans, les données, la connexion, les règles d'accès, la messagerie —
s'y voit à l'identique. Pour le quotidien, c'est là qu'il faut regarder ; l'APK sert à
vérifier ce que le club aura, pas à travailler.

---

## 2. Sans téléphone, sans même regarder — les contrôles automatiques

```bash
cd app && npm test
```

**106 tests**, unitaires et d'intégration. Ils tournent en cinq secondes et couvrent deux
choses que l'œil ne voit pas :

**La logique** — dates, matricules, teintes, codes USSD. Une erreur y est invisible à
l'écran et se découvre sur le téléphone du club. « Il y a 1 j » au lieu de « Hier » ne
saute pas aux yeux ; une date de sortie décalée fait rater le car.

**Le comportement des écrans**, face à un serveur Supabase simulé qui répond exactement
comme PostgREST — jointure rendue en objet ou en tableau comprise, car c'est là que les
écrans se cassent. Ces tests regardent ce qui **part** vers le serveur, pas seulement ce
qui s'affiche : un formulaire peut sembler marcher et n'écrire aucun champ.

Quelques comportements qu'ils tiennent, et qui comptent :

- l'élève **sans compte** figure à l'annuaire comme les autres ;
- la fiche montre le verrou ou les informations selon ce que le **serveur** a rendu,
  jamais selon un test de rôle fait dans l'application ;
- la date de naissance part dans sa **propre table**, jamais dans `profils` ;
- une modification de fiche n'envoie **ni le numéro, ni le rôle, ni le grade** ;
- le mot de passe actuel est **vérifié**, pas seulement demandé ;
- l'espace des maîtres n'apparaît pas parce qu'il n'a **pas été reçu**.

Ce qu'ils ne couvrent pas, et qu'il ne faut pas leur demander : le rendu visuel — jsdom ne
met pas en page, c'est `comparer-app` qui s'en charge — et les règles d'accès, qui ont leur
propre test sur un vrai PostgreSQL dans `supabase/tests/`. Les simuler donnerait l'illusion
de les vérifier.

```bash
npm install                      # une fois, à la racine
cd app && npm install && cp .env.essai .env && cd ..
npm run verifier-app
```

Ce que cela fait : construit l'application, la sert dans un vrai navigateur, remplace le
serveur Supabase par des réponses en boîte, **ouvre les vingt-quatre écrans** et vérifie
que chacun affiche ce qu'il doit afficher, sans erreur de console.

```bash
npm run comparer-app
```

Mesure la **ressemblance à la maquette**, écran par écran : chaque texte doit être au même
pixel, à la même taille, dans la même graisse et la même couleur, sans aucune tolérance.

```
✓ connexion    11 textes · 1,18 % de pixels différents
✓ accueil      27 textes · 0,72 %
✓ etudiants    27 textes · 0,12 %
✓ club         18 textes · 1,20 %
✓ motdepasse   14 textes · 0,04 %
```

C'est ce qui donne un sens à « ressemble à 100 % ». Les deux côtés lisent la même feuille
de style : un écart n'est donc plus une approximation tolérable, c'est un défaut.

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

## 3. Sur votre machine — le rechargement immédiat

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
| `F04x001` | **L'administration** : en plus, la rangée « Administration » sur l'accueil |

Une fois connecté, un bloc **« Mon espace »** apparaît sur l'accueil : la carte de membre
avec son code QR, sa propre fiche, et — pour l'administration seulement — l'écran
d'administration. C'est la seule porte vers ces trois écrans.

Cette rangée n'est pas une serrure : elle n'apparaît pas à un élève parce que c'est de la
place gagnée, mais atteindre l'adresse ne lui donnerait rien de plus — le serveur refuse
ce que le rôle n'autorise pas.

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

### L'administration

Les neuf écrans existent et écrivent réellement en base :

| Écran | Ce qu'il fait |
|---|---|
| Ajouter un étudiant | Fiche, informations privées, biographie. Le numéro est attribué par la base |
| Modifier une fiche | Le même formulaire, plus le portrait, les tuteurs et la désactivation |
| Changer un grade | Le seul chemin autorisé : un élève ne peut pas se promouvoir |
| Comptes et accès | Créer un compte, réinitialiser un mot de passe |
| Publier une actualité | Avec brouillon, et suppression de ce qui est au casier |
| Envoyer une notification | À tous les membres actifs, une ligne chacun |
| Albums et photos | Créer, envoyer plusieurs photos d'un coup, supprimer |
| Participations | Qui vient à une sortie, et **pointer les versements reçus** |
| Le club | Horaires, responsable, téléphone, adresse, numéro MVola |

**Une seule dépend d'un déploiement à part : « Comptes et accès ».** Créer un compte
demande la clé `service_role`, qui passe outre toutes les règles d'accès — la mettre dans
l'APK reviendrait à la publier. Elle vit donc dans une fonction sur le serveur.

Elle est **désormais déployée sur le projet d'essai** : l'écran l'atteint réellement. Pour
l'essayer, la fiche **F04x077 · ANDRIAMBELO Rado** est volontairement sans compte.

Ce que je n'ai **pas** pu vérifier moi-même, et qu'il faut donc regarder sur le téléphone :
l'environnement où je travaille bloque les connexions sortantes vers `supabase.co`, si
bien que l'appel n'est jamais parti d'ici. Je sais que la fonction est en ligne ; je ne
sais pas de mes yeux qu'elle crée un compte.

Sur le projet du club, elle sera à déployer une fois :

```bash
npx supabase functions deploy comptes
```

Tant que ce n'est pas fait sur un projet donné, l'écran y fonctionne mais chaque action
répond « la fonction n'est pas déployée ». C'est voulu : mieux vaut le dire que laisser
croire qu'un compte a été créé. Le détail est dans
`supabase/functions/comptes/LISEZ-MOI.md`.

### La modération

Les signalements remontent maintenant aux maîtres, depuis l'écran de messagerie. Deux
issues : **retirer** le message ou **classer sans suite**.

« Retirer » est une suppression douce — la ligne reste, seule sa date de retrait est posée.
Un message effacé ne se défend pas, et le club doit pouvoir expliquer sa décision à un
parent trois mois plus tard, ou revenir dessus si le signalement était abusif.

### Les photos

Les seaux de stockage sont **privés**, et c'est délibéré : ce sont des photos d'enfants. Un
seau public rend chaque fichier lisible par quiconque possède son adresse — et une adresse
se copie, se transfère, se retrouve dans un historique de navigateur, et **ne se révoque
jamais**.

L'application demande donc des adresses **signées**, valables une heure, que le serveur ne
délivre qu'à qui a le droit de voir le fichier. Une adresse qui fuite expire ; un membre
exclu cesse d'en obtenir.

Elles sont demandées **en lot** : l'annuaire affiche soixante-quatre portraits, et une
demande par photo ferait soixante-quatre allers-retours sur un réseau malgache. Quatre tests
verrouillent ces deux propriétés.

Ce que cela impose au club : les photos ne s'ouvrent qu'**une fois connecté**. Un lien
copié-collé hors de l'application ne montrera rien à un tiers, et c'est voulu.

### Les conversations à deux

On en ouvre une depuis le **+** de l'écran Messages. La règle est posée en base, pas dans
l'application :

- écrire à un **maître ou à l'administration** est toujours possible — c'est le canal par
  lequel un enfant signale un problème ;
- entre **deux élèves**, il faut que les deux soient majeurs ;
- une **date de naissance inconnue compte comme mineure**.

C'est la réponse la plus prudente à une question que le club n'a pas encore tranchée. Il
peut l'assouplir d'une ligne le jour où il décide ; ce qu'il ne faut pas faire, c'est ouvrir
par défaut et corriger après un incident.

Ce comportement est vérifié sur une **vraie base** :

```bash
psql "$DATABASE_URL" -f supabase/tests/directs.sql
```

Sept cas d'autorisation et de refus, plus le contenu du salon créé. Résultat obtenu sur le
projet d'essai : les sept passent, deux membres inscrits, la personne en face correctement
nommée, et la fonction est idempotente — rappelée, elle rend le même salon plutôt qu'un
doublon.

**Ce qui reste à faire** : les notifications poussées sur l'écran verrouillé du téléphone.
Elles demandent un projet Firebase au nom du club — je ne peux ni le créer ni en vérifier le
fonctionnement d'ici, et écrire du code que personne ne peut essayer vaudrait moins que de
le dire.

---

## 4. Un APK, construit par GitHub — ce que le club aura

Rien à installer sur votre machine : la construction se fait entièrement sur les serveurs
de GitHub, et l'APK se télécharge depuis la page de l'exécution.

### La mise en place

**Aucune.** Pas de secret à configurer, pas de compte à créer.

### Construire

Onglet **Actions** → **Construire l'APK** → **Run workflow**. Ou simplement pousser un
changement dans `app/`, `css/` ou `icones.mjs` : la construction part toute seule. Ces
trois-là parce que l'application lit la feuille de style et les icônes de la maquette.

**Deux minutes et quart** — c'était treize minutes avec Expo. L'APK fait **4,0 Mo**, contre
32 Mo. À la fin, deux pièces jointes en bas de la page :

- **`waishi-<n>.apk`** — à télécharger, envoyer par WhatsApp, installer. Android demande
  une fois l'autorisation d'installer depuis cette source.
- **`ecrans-<n>`** — une capture de chacun des vingt-quatre écrans, prise pendant la
  vérification. Pour regarder cette version **sans l'installer**.

Le workflow vérifie les types et ouvre les vingt-quatre écrans et mesure l'écart avec la maquette avant de construire : une erreur
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

**Vérifié sur GitHub** : la construction Gradle passe. Exécution 6, `waishi-6.apk`,
4 029 529 octets, du premier coup — il n'y a pas de SDK Android sur ma machine, c'est donc
là que cette étape s'exécute pour la première fois.

**Vérifié aussi** : l'application servie depuis un sous-chemin, comme elle l'est sur
`/essai`. Le vert du club sort à `rgb(15, 81, 50)`, le rayon des boutons à 12 px, la police
des titres à Archivo, et aucune erreur de console. Les chemins des ressources sont
relatifs, ce qui est ce qui permet à `/essai` de fonctionner.

**Vérifié par vous** : l'APK s'installe et démarre sur un vrai téléphone. C'est ce qui a
permis de retirer `mobile/`, la version React Native — on ne retire pas un chemin qui marche
avant que le nouveau ait fait ses preuves. Elle reste dans l'historique du dépôt.

**Pas vérifié** : que l'application joigne Supabase depuis un téléphone, et que le temps
réel de la messagerie s'ouvre. Mon environnement ne peut joindre ni `supabase.co` en HTTP
depuis le navigateur, ni une WebSocket. Les migrations s'appliquent et la base répond aux
requêtes SQL — je l'ai fait pour `ouvrir_direct` — mais l'appel depuis le téléphone, c'est
vous qui le verrez.

Défauts trouvés en faisant ces vérifications : **aucune porte ne menait à l'écran
d'administration, à la carte de membre ni à sa propre fiche** — les routes existaient, rien
n'y conduisait, et un compte d'administration ne montrait donc rien de plus qu'un compte
d'élève ; la même actualité s'affichait en vert sur l'accueil et en orange dans le casier,
la couleur étant définie deux fois ; le filtre par grade affichait « verte » en minuscule ;
la carte de membre répétait le matricule dans son pied de page à la place d'une date de
validité qui n'existe pas en base ; et Gradle aurait engendré une clé de signature
différente à chaque construction, ce qui aurait fait refuser toutes les mises à jour.
