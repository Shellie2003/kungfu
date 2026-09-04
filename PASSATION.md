# Passation au club

Ce document dit **comment remettre l'application au club**, et **ce qu'il faut savoir
pour la maintenir ensuite**. Il s'adresse à celui qui fait la passation, pas au club.

La règle qui commande tout le reste tient en une phrase :

> **Ce qui appartient au club doit être créé sur les comptes du club, dès le premier
> jour.**

Ce n'est pas une formalité juridique. Un projet Supabase créé sur votre compte
personnel reste sous votre contrôle : le club ne peut ni le sauvegarder, ni changer un
mot de passe, ni le récupérer si vous n'êtes plus joignable. Et à l'inverse, vous restez
responsable de données — dates de naissance de mineurs, téléphones de parents — qui ne
sont pas les vôtres. Migrer après coup est possible mais pénible ; le faire dès le début
ne coûte rien.

---

## 1. Ce que le club doit posséder

| Quoi | Sur quel compte | Pourquoi cela ne peut pas rester chez vous |
|---|---|---|
| Le projet **Supabase** | Un compte du club | C'est la base : les membres, les mineurs, les messages |
| Le dépôt **GitHub** | Une organisation ou un compte du club | Le code, les migrations, l'historique des décisions |
| Le projet **Vercel** (version web) | Un compte du club | L'adresse publique de l'application |
| Le compte **Google Play** | Le club | Publier l'application, et surtout la mettre à jour |
| Le **keystore** de signature | Le club, **sauvegardé en deux endroits** | Voir l'avertissement ci-dessous |

> ### ⚠️ Le keystore est irremplaçable
>
> Le fichier de signature de l'APK ne se régénère pas. **Le perdre, c'est perdre la
> possibilité de mettre l'application à jour, définitivement** : Google refuse une mise à
> jour signée par une autre clé, et il n'y a pas de recours. Il faudrait republier sous
> un nouveau nom, et demander aux 64 membres de désinstaller puis réinstaller.
>
> Il ne doit **jamais** être commité dans le dépôt — il est public. Deux copies, deux
> endroits, et le mot de passe noté ailleurs que dans le même dossier.

---

## 2. Les clés : ce qui est public, ce qui ne l'est jamais

C'est le point le plus souvent mal compris, et celui qui fait le plus de dégâts.

### La clé publiable (`sb_publishable_…`) — **publique par construction**

Elle voyage dans l'APK de chaque membre. N'importe qui peut l'en extraire en deux
minutes. Ce n'est pas un défaut : **elle n'est pas censée être secrète.**

Ce qui protège réellement les données du club, c'est la **sécurité au niveau des lignes**
(RLS) : chaque table dit qui a le droit de lire quoi, et la base applique ces règles quel
que soit l'appelant. Un jeton d'élève volé ne montre rien de plus qu'un élève.

> **Conséquence pratique :** une seule table sans RLS, et tout son contenu devient
> lisible par n'importe quel porteur de l'application. C'est le contrôle n° 2 du script
> de vérification.

### La clé de service (`service_role`) — **jamais, nulle part**

Elle passe outre **toutes** les règles d'accès. Avec elle, on lit la date de naissance de
chaque mineur du club et on écrit ce qu'on veut.

- Elle ne doit **jamais** figurer dans le dépôt, ni dans un fichier `.env` commité, ni
  dans un message, ni dans une capture d'écran.
- Elle vit **uniquement** sur le serveur, où Supabase la fournit automatiquement aux
  fonctions déployées (`SUPABASE_SERVICE_ROLE_KEY`). Il n'y a rien à configurer.
- Si vous la voyez passer quelque part, considérez-la comme compromise et
  **régénérez-la** depuis le tableau de bord.

### Les mots de passe

Aucun mot de passe ne figure dans le dépôt, qui est public. Ceux des comptes d'essai
n'ont jamais quitté nos échanges — et le projet d'essai est jetable, sans aucune donnée
réelle du club.

---

## 3. La marche à suivre, dans l'ordre

L'ordre compte : chaque étape suppose la précédente.

### 3.1 — Créer le projet, sur le compte du club

Région : la plus proche d'Antananarivo parmi celles proposées. Notez la **référence du
projet** (`<ref>`), elle sert partout ensuite.

### 3.2 — Appliquer les migrations

```bash
supabase login
supabase link --project-ref <ref-du-projet-du-club>
supabase db push
```

Les 25 migrations s'appliquent **dans l'ordre**, `0001` à `0025`. Elles ne créent aucun
membre et aucune donnée — uniquement le schéma, les règles d'accès et les fonctions.

### 3.3 — Déployer les deux fonctions serveur

```bash
supabase functions deploy comptes
supabase functions deploy fondation --no-verify-jwt
```

> **Le `--no-verify-jwt` de la seconde n'est pas une négligence.** C'est la seule action
> du projet qui ne peut pas exiger de jeton : celui qui crée le premier compte n'en a pas
> encore. Sans ce drapeau, l'inscription du fondateur répond « 401 » sans explication.
>
> `comptes`, elle, garde sa barrière — c'est la fonction qui crée, suspend et supprime
> les membres.

Les deux ont leur `LISEZ-MOI.md` dans `supabase/functions/`.

### 3.4 — Activer la protection des mots de passe

Tableau de bord → **Authentication → Policies → Leaked password protection**.

Supabase compare alors chaque mot de passe choisi à la liste des mots de passe déjà
divulgués sur Internet. C'est le **seul** avertissement du contrôle de sécurité qui
demande une action de votre part ; tous les autres sont expliqués au § 5.

### 3.5 — Construire l'application avec les clés du club

Dans les secrets du dépôt GitHub :

| Secret | Valeur | Sert à |
|---|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` | Construire l'APK et la version web |
| `SUPABASE_CLE` | la clé **publiable** | idem |
| `SUPABASE_PROJET` | `<ref>` | Empêcher la mise en veille (§ 6) |
| `SUPABASE_CLE_PUBLIABLE` | la clé **publiable** | idem |

### 3.6 — Créer le compte du club, depuis l'application

Ouvrez l'application. Comme aucun super administrateur n'existe encore, l'écran de
connexion propose **« Créer le compte du club »**. Le responsable saisit son nom, son
prénom, et **choisit** son mot de passe.

> Ce mot de passe-là n'est réinitialisable par personne : il n'y a pas encore
> d'administration pour le faire, c'est justement celle qu'on crée. D'où la confirmation
> demandée à l'écran. **Notez le matricule affiché** (`F04x001`) : c'est avec lui que le
> responsable se connectera, jamais avec son nom.

Dès que ce compte existe, **l'inscription se referme définitivement**. Le verrou est
double et il est dans la base, pas dans l'écran : une ligne à clé primaire, plus
l'existence d'un super administrateur. Réécrire l'application ne le rouvre pas.

### 3.7 — Vérifier, sans se croire sur parole

Collez `supabase/tests/passation.sql` dans l'éditeur SQL du tableau de bord. Il ne
modifie rien et rend une ligne par contrôle :

```
  OK    Sécurité au niveau des lignes          active sur toutes les tables
  OK    Les règles d'accès                     59 règles
  OK    Les fonctions privilégiées se gardent  toutes gardées, ou hors de portée de l'API
  OK    Aucun seau n'est public                aucun
  OK    Le club a son super administrateur     F04x001
  OK    L'inscription est refermée             oui
```

Une liste à cocher se coche de mémoire, un vendredi soir. Ce script, non.

### 3.8 — Ce que le club doit encore fournir

- L'image du **cachet du club** (`img/cachet.<ext>`) — l'emplacement reste vide en
  attendant, ce qui est plus honnête qu'un faux tampon.
- La **photo du club** pour l'accueil.
- Le **numéro MVola** du responsable, et le nom du club tel qu'il doit paraître.

---

## 4. Après la passation : ce qu'il faut savoir pour maintenir

### 4.1 — Les migrations ne se modifient jamais, elles s'ajoutent

C'est la règle la plus importante de tout ce document.

Une migration déjà appliquée sur la base du club est de l'**histoire**. La corriger sur
place ne change rien à la base — elle a déjà tourné — mais fait diverger le dépôt de la
réalité, et le prochain projet monté à partir du dépôt sera différent de celui du club.

**Pour changer quelque chose, on ajoute `0026_…`, puis `0027_…`.** Même pour corriger une
faute de la veille. Le dépôt raconte alors ce qui s'est réellement passé, et c'est
exactement ce qui a permis de retrouver, en deux minutes, pourquoi l'inscription était
refusée : la migration `0004` avait retiré un droit de trop, et cela se lisait.

### 4.2 — Trois pièges qui ne préviennent pas

Ce projet en a rencontré quatre ; trois peuvent se reproduire.

**Une écriture refusée ne lève pas d'erreur.** Une règle d'accès ne *rejette* pas un
`update` : elle rend la ligne invisible, et la mise à jour porte sur zéro ligne. Sans
`.select()`, l'application croit avoir écrit. C'est pourquoi les 39 écritures du projet
vérifient toutes qu'elles ont écrit, et pourquoi `outils/verifier-ecritures.mjs` le
contrôle à chaque construction.

**Un déclencheur garde `update`, pas `insert`.** Le trou est apparu deux fois. Si vous
ajoutez une règle du genre « seul un super administrateur peut poser tel champ »,
demandez-vous *aussi* ce qui se passe à la création. Les deux chemins existent.

**Une fonction `security definer` n'est protégée par aucune règle d'accès.** Elle
s'exécute avec les droits de son propriétaire. Elle doit donc soit vérifier elle-même qui
l'appelle, soit ne pas être appelable de l'extérieur. Le script de passation le contrôle.

### 4.3 — Ne travaillez jamais directement sur la base du club

Le projet d'essai existe pour cela. Le cycle :

1. écrire la migration dans le dépôt ;
2. l'appliquer sur le projet **d'essai** ;
3. la vérifier — en se faisant passer pour un élève, un maître, un administrateur ;
4. faire tourner la batterie ;
5. seulement alors, `supabase db push` sur le projet du club.

> **Aucune donnée réelle du club ne doit entrer dans le projet d'essai.** Des dates de
> naissance de mineurs sur un compte personnel, c'est exactement ce que cette
> architecture cherche à éviter.

### 4.4 — La batterie, avant chaque livraison

```bash
cd app && npx vitest run          # 458 tests
node outils/verifier-app.mjs      # les 37 écrans s'ouvrent
node outils/verifier-apk.mjs      # les 25 écrans en mode téléphone
node outils/comparer-app.mjs      # conformité à la maquette
node outils/verifier-acces.mjs    # noms, cibles au doigt, clavier
node outils/verifier-impression.mjs
node outils/verifier-ecritures.mjs
node outils/verifier-seaux.mjs
node outils/verifier-poids.mjs    # budget du premier chargement
node outils/verifier-jumeaux.mjs  # web et APK identiques
node outils/mesurer-realisation.mjs
```

Tout cela tourne aussi dans l'intégration continue à chaque envoi.

> **Un banc qui se trompe est plus dangereux qu'un banc absent.** Deux fois pendant ce
> projet, un contrôle a déclaré fausse une chose parfaitement juste — une comparaison de
> texte sensible à la casse, une attente accrochée à une phrase qu'on avait réécrite.
> Quand un banc devient rouge, la première question est « l'application, ou
> l'instrument ? ».

### 4.5 — La sauvegarde

Vérifiez ce que votre palier Supabase inclut, et **prenez de toute façon une copie qui
vous appartient** :

```bash
supabase db dump --db-url "<url de connexion>" -f sauvegarde-$(date +%F).sql
```

Une copie mensuelle suffit au rythme du club. Rangez-la ailleurs que sur la machine qui
sert à travailler, et **essayez de la restaurer au moins une fois** : une sauvegarde
jamais restaurée n'est pas une sauvegarde, c'est une intention.

Ce que le `dump` ne contient pas : les **fichiers** (portraits, photos d'album, pièces
jointes) vivent dans le stockage, pas dans la base.

### 4.6 — Ce qui arrivera en premier

Ce n'est pas la saturation. La mesure l'a montré : au rythme du club, la base tient une
trentaine d'années sur le palier gratuit, et l'écran « Occupation » de l'administration
affiche la jauge en temps réel.

**C'est la mise en veille.** Le palier gratuit met un projet en pause au bout de **sept
jours sans requête**. Le club est calme en décembre, et l'application ne répond plus en
janvier — rien n'est perdu, mais plus rien ne répond, jusqu'à ce que quelqu'un aille la
réveiller depuis un tableau de bord que personne n'ouvre.

D'où `.github/workflows/reveil.yml`, qui envoie chaque jour la plus petite requête
possible. **Sans les deux secrets du § 3.5, elle ne fait rien** — et elle le dit plutôt
que d'échouer bruyamment.

### 4.7 — Si un incident arrive

| Signe | Cause la plus probable | Geste |
|---|---|---|
| Plus rien ne répond, partout | Projet en pause | Réveiller depuis le tableau de bord, puis vérifier les secrets du § 3.5 |
| « permission denied for function … » | Un droit retiré par une migration | Comparer avec `supabase/migrations/` ; corriger par une **nouvelle** migration |
| Un écran vide sans erreur | Une règle d'accès rend zéro ligne | Se faire passer pour le rôle concerné en SQL, et compter les lignes |
| Une action « réussit » sans rien changer | Écriture sur zéro ligne | Vérifier le `.select()` ; `verifier-ecritures.mjs` |
| La clé de service a fuité | — | La régénérer **immédiatement**, puis redéployer les deux fonctions |

### 4.8 — Ce qui reste ouvert

- **Les notifications hors de l'application** (Firebase) — la seule fonctionnalité de la
  maquette non réalisée. À chiffrer si le club la veut.
- **La lecture des codes QR** dans la WebView d'Android : elle n'est pas garantie par la
  plateforme et ne se vérifie que sur un vrai appareil. Le repli — saisie du matricule,
  fiche de présence où l'on coche — est en place.
- **Le panneau « Ce que l'espace contient »** de l'espace des maîtres : le salon existe
  et porte la fonctionnalité, le panneau d'orientation de la maquette n'a pas été repris.
- **Une version malgache** de l'interface : demande à part entière.

---

## 5. Les avertissements de sécurité que Supabase affichera

Le contrôle de sécurité du tableau de bord signalera une dizaine d'avertissements. **Neuf
sont attendus et assumés** ; un seul demande une action.

| Avertissement | Verdict |
|---|---|
| `fondation_ouverte` appelable sans être connecté | **Voulu.** C'est tout son objet : l'écran de connexion doit savoir s'il propose la création du premier compte. Elle ne rend qu'un booléen — pas un nom, pas un effectif, pas un matricule. Une fois le club fondé, elle répond « non » pour toujours. |
| Huit fonctions `security definer` appelables par un membre connecté | **Voulu.** Chacune vérifie elle-même le rôle de l'appelant, ou n'agit qu'en son nom. Le contrôle n° 5 du script de passation le mesure, fonction par fonction. |
| **Leaked password protection désactivée** | **À activer** — § 3.4. C'est le seul. |

Cette liste est à relire après chaque migration : un avertissement **nouveau** est un
signal, un avertissement connu n'en est pas un.

---

## 6. Ce que cette architecture ne protège pas

Dit franchement, parce qu'une passation qui ne dit que le bon côté n'est pas une
passation.

- **La clé de service passe outre toutes les règles.** Ce qui la retient, c'est qu'elle
  ne quitte jamais le serveur — pas une règle SQL.
- **Un téléphone rooté, ou une sauvegarde de téléphone extraite**, donne accès au jeton
  de session stocké localement. Ce jeton ne donne accès qu'à ce que les règles autorisent
  pour ce membre.
- **Les captures d'écran** restent possibles : la confidentialité de l'espace des maîtres
  tient aussi aux personnes.
- **L'administration voit qu'une conversation privée existe** — une ligne sans titre. Elle
  ne voit ni qui y participe, ni ce qui s'y dit, et ne peut plus s'y ajouter depuis la
  migration `0025`.
- **Entre membres, la protection est le signalement, pas le mur.** Le club a décidé que
  chacun peut écrire à chacun ; ce qui protège les mineurs est donc la modération, qui
  demande que quelqu'un soit attentif.
