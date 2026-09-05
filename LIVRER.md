# Livrer une version aux membres

Comment **signer** l'application, **publier** une version, et comment les membres la
reçoivent **depuis l'application elle-même**, sans Play Store.

---

## Partie 1 — La clé de signature

### Ce qu'il faut comprendre avant de taper quoi que ce soit

Android n'accepte d'installer une mise à jour par-dessus une application que si les deux
sont signées par **la même clé**. C'est la seule chose qui distingue « une nouvelle
version de l'application du club » de « une autre application qui porte le même nom ».

Trois conséquences, et elles commandent tout le reste :

1. **Cette clé se crée une fois, et sert pour toujours.** Il n'y a pas de
   renouvellement.
2. **La perdre est définitif.** Plus aucune mise à jour ne pourra s'installer. Il
   faudrait republier sous un autre nom d'application et demander aux 64 membres de
   désinstaller puis réinstaller — en perdant leur session.
3. **Elle ne doit jamais entrer dans le dépôt**, qui est public. Quiconque l'a peut
   fabriquer une application qui s'installe par-dessus celle du club comme si c'était
   une mise à jour officielle.

> ### ⚠️ Ce que ce changement casse, une fois
>
> L'application est aujourd'hui signée par `app/signature/debug.keystore`, une clé de
> **débogage** dont le mot de passe est `android` et qui est dans le dépôt — donc
> connue de tous. Passer à une vraie clé est nécessaire, mais :
>
> **les téléphones qui ont déjà l'APK actuel devront désinstaller avant d'installer la
> nouvelle version.** Android refusera sinon, avec « application non installée » et
> aucune autre explication.
>
> C'est le bon moment pour le faire : le club n'a pas encore distribué largement. Ce
> sera impossible plus tard sans déranger tout le monde.

### Étape 1.1 — Créer la clé

Sur **votre machine**, pas sur un serveur. Une seule commande :

```bash
keytool -genkeypair -v \
  -keystore waishi-release.jks \
  -alias waishi \
  -keyalg RSA -keysize 4096 \
  -validity 10000 \
  -dname "CN=Kung-fu Waishi Analamahitsy, OU=Club, O=Kung-fu Waishi, L=Antananarivo, C=MG"
```

Elle demandera **deux mots de passe** :

| Ce qu'elle demande | Ce que c'est | Conseil |
|---|---|---|
| *Enter keystore password* | Le mot de passe du **coffre** (le fichier `.jks`) | Long, et noté |
| *Enter key password for \<waishi\>* | Le mot de passe de la **clé** dans ce coffre | **Mettez le même** — un seul à perdre |

Ce que veut dire chaque option :

- **`-keystore waishi-release.jks`** — le fichier produit. C'est LE fichier à ne jamais
  perdre.
- **`-alias waishi`** — le nom de la clé **à l'intérieur** du coffre. Un coffre peut en
  contenir plusieurs ; il faut donc dire laquelle signer. Notez-le : il est demandé à
  chaque construction. Ici, `waishi`.
- **`-keyalg RSA -keysize 4096`** — l'algorithme et la taille. 4096 plutôt que 2048 :
  cette clé va servir dix ans, et l'écart de coût est nul.
- **`-validity 10000`** — la durée, en **jours**. Dix mille jours ≈ **27 ans**, soit
  jusqu'en 2054. Une clé expirée ne peut plus signer : mieux vaut voir large.
- **`-dname "…"`** — l'identité inscrite dans le certificat. Elle est visible de qui
  inspecte l'APK. `CN` = le nom, `L` = la ville, `C` = le pays (`MG` pour Madagascar).

> Sans `-dname`, `keytool` pose les six questions une par une — et la dernière, « Is
> CN=… correct? », attend **`yes`** en toutes lettres, pas `y`. C'est là que la plupart
> des gens se trompent la première fois.

### Étape 1.2 — Noter l'empreinte

```bash
keytool -list -v -keystore waishi-release.jks -alias waishi
```

Relevez la ligne **`SHA256:`**. C'est l'identité de votre clé. Elle sert à deux choses :
vérifier qu'un APK vient bien de vous, et détecter qu'on vous a remplacé le fichier.

Collez-la dans le dépôt, dans le workflow, à la place de l'empreinte de la clé de
débogage — elle y est déjà contrôlée à chaque construction. **L'empreinte n'est pas un
secret** : elle est publique dans chaque APK.

### Étape 1.3 — Mettre la clé à l'abri

**Trois copies, trois endroits différents :**

1. Sur votre machine, hors du dossier du projet — pour ne jamais la commiter par accident.
2. Sur une clé USB ou un disque externe, rangé ailleurs.
3. Dans un espace de stockage en ligne **privé**.

Le **mot de passe** est noté ailleurs que dans le même dossier : un gestionnaire de mots
de passe, ou un papier chez le responsable du club. Une clé et son mot de passe dans le
même dossier, c'est une seule copie.

> Vérifiez que `*.jks` est bien ignoré par git avant toute chose :
>
> ```bash
> git check-ignore -v waishi-release.jks
> ```
>
> Si la commande ne répond rien, le fichier **n'est pas ignoré** et un `git add -A` le
> commiterait. Ajoutez-le à `.gitignore` immédiatement.

### Étape 1.4 — Donner la clé à GitHub, sans la publier

GitHub ne stocke que du **texte** dans ses secrets, et un `.jks` est un fichier
**binaire**. On l'encode donc en base64 — ce n'est pas un chiffrement, seulement une
façon d'écrire des octets avec des lettres.

La commande diffère selon le système, et c'est là qu'on se trompe :

**Linux**
```bash
base64 -w 0 waishi-release.jks > waishi-release.b64
```
> `-w 0` n'est pas décoratif : sans lui, `base64` coupe la sortie tous les 76
> caractères. GitHub accepterait le secret, et le décodage échouerait à la
> construction avec « invalid input ».

**macOS**
```bash
base64 -i waishi-release.jks -o waishi-release.b64
```
> La version macOS ne connaît pas `-w`. Elle n'insère pas de retours à la ligne par
> défaut, il n'y a donc rien à désactiver.

**Windows — PowerShell**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("waishi-release.jks")) `
  | Set-Content -NoNewline waishi-release.b64
```
> `-NoNewline` évite d'ajouter un retour à la ligne final, que `base64 -d` refuse sur
> certaines versions.

**Windows — invite de commandes**
```cmd
certutil -encode waishi-release.jks waishi-release.b64
```
> ⚠️ `certutil` ajoute les lignes `-----BEGIN CERTIFICATE-----` et `-----END
> CERTIFICATE-----`, ainsi que des retours à la ligne. **Il faut les retirer à la main**
> avant de coller. Préférez PowerShell.

### Vérifier avant de coller

Un secret mal encodé ne se voit qu'à la première publication, et le message ne dit pas
pourquoi. Deux contrôles de dix secondes :

```bash
# 1. Une seule ligne ? (Linux/macOS)
wc -l < waishi-release.b64        # doit afficher 0 ou 1

# 2. Le décodage redonne-t-il la clé ?
base64 -d waishi-release.b64 > controle.jks
keytool -list -keystore controle.jks -storepass VOTRE_MOT_DE_PASSE
rm controle.jks
```

Si la seconde commande liste votre alias `waishi`, l'encodage est bon.

### Les six secrets

Dans **Settings → Secrets and variables → Actions → New repository secret** :

| Nom du secret | Valeur | Employé par |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | tout le contenu de `waishi-release.b64`, en une seule fois | `publier.yml` |
| `ANDROID_KEYSTORE_PASSWORD` | le mot de passe du **coffre** | `publier.yml` |
| `ANDROID_KEY_ALIAS` | `waishi` | `publier.yml` |
| `ANDROID_KEY_PASSWORD` | le mot de passe de la **clé** (le même, si vous avez suivi le conseil) | `publier.yml` |
| `SUPABASE_URL` | `https://<ref>.supabase.co` | `apk.yml`, `publier.yml`, `reveil.yml` |
| `SUPABASE_CLE` | la clé **publiable** (`sb_publishable_…`) | `apk.yml`, `publier.yml`, `reveil.yml` |

> **Il n'y en avait pas six mais huit, et deux faisaient doublon.** La tâche qui empêche
> la base de s'endormir demandait `SUPABASE_PROJET` et `SUPABASE_CLE_PUBLIABLE`, c'est-à-
> dire la même clé sous un second nom et un identifiant qui se lit déjà dans l'adresse.
>
> Ce n'était pas seulement du travail en trop : le jour où l'on change de projet Supabase
> et qu'on oublie l'un des doublons, la tâche continue de réveiller **l'ancien** projet.
> Le nouveau s'endort au bout de sept jours, et **rien ne le dit**. Les deux noms en trop
> ont été supprimés ; l'identifiant du projet est extrait de l'adresse.

Puis **effacez le fichier `.b64`** — il contient la clé en clair :

```bash
rm waishi-release.b64
```
```powershell
Remove-Item waishi-release.b64   # PowerShell
```

> Un secret GitHub ne se relit pas : une fois posé, on ne peut que le remplacer. C'est
> voulu. C'est aussi pourquoi la copie hors ligne du `.jks` est indispensable — le
> secret n'est **pas** une sauvegarde.

---

## Partie 2 — Le numéro de version

L'application affichait jusqu'ici l'empreinte du commit — `a3f9c21`. C'est très bien
pour retrouver un état exact du code, et **inutilisable pour une mise à jour** : entre
`a3f9c21` et `7b2e004`, rien ne dit lequel est le plus récent.

Il faut donc un numéro qui **augmente**. Deux nombres, et ils ne servent pas à la même
chose :

| | Ce que c'est | Qui le lit |
|---|---|---|
| **`versionName`** — `1.2.0` | Ce que la personne lit | Le club, l'écran « Le club » |
| **`versionCode`** — `47` | Un entier qui doit **toujours** augmenter | Android, pour refuser une installation plus ancienne |

La source de vérité du premier est **`app/package.json`**, champ `version`. On l'y
change à la main avant chaque publication. Le second est le **numéro d'exécution** du
workflow, qui augmente tout seul.

Comment choisir le `versionName` :

- **`1.0.1`** — une correction, rien de neuf à raconter.
- **`1.1.0`** — une fonctionnalité de plus.
- **`2.0.0`** — un changement que le club remarquera fortement.

---

## Partie 3 — Publier une version

### Étape 3.1 — Changer le numéro

Dans `app/package.json` :

```json
"version": "1.1.0",
```

Commitez ce changement. **C'est ce numéro que les téléphones compareront au leur.**

### Étape 3.2 — Poser l'étiquette

```bash
git tag v1.1.0
git push origin v1.1.0
```

L'étiquette déclenche le workflow de publication. Elle doit être **exactement** `v` suivi
du numéro de `package.json` — le workflow refuse si les deux ne concordent pas, plutôt
que de publier une version qui s'annoncerait sous un faux nom.

### Étape 3.3 — Ce que GitHub fait tout seul

1. Il construit l'application, **avec toute la batterie de contrôles** — 458 tests, les
   écrans, la conformité à la maquette, l'accessibilité, l'impression, le poids. Une
   version qui ne passe pas n'est pas publiée.
2. Il signe l'APK avec **votre** clé.
3. Il publie une **Release** portant deux fichiers, **aux noms fixes** :
   - `waishi.apk` — l'application ;
   - `waishi.json` — le numéro de version et les nouveautés.

> **Pourquoi des noms fixes.** GitHub sert toujours le dernier fichier d'un nom donné à
> l'adresse `…/releases/latest/download/<nom>`. Des noms fixes veulent dire une adresse
> fixe — donc l'application n'a besoin ni de l'API de GitHub, ni d'une clé, ni de
> connaître le numéro de la dernière version pour aller la chercher.
>
> C'est aussi ce qui évite la limite de 60 requêtes par heure de l'API GitHub : à 64
> membres derrière les mêmes opérateurs malgaches, elle serait atteinte.

### Étape 3.4 — Les membres reçoivent la version

Rien à faire. À l'ouverture de l'application, si une version plus récente existe, un
bandeau le dit et propose de la prendre. Voir la partie 4.

---

## Partie 4 — La mise à jour depuis l'application

### Ce qui se passe, exactement

1. L'application demande `waishi.json` **une fois par jour au plus** — c'est un fichier
   de deux cents octets, et le forfait des membres n'est pas à nous.
2. Si le numéro qu'il porte est **supérieur** au sien, elle affiche un bandeau : la
   version, ce qu'elle apporte, et un bouton.
3. Le bouton ouvre l'adresse de `waishi.apk` **dans le navigateur du téléphone**.
   Android télécharge le fichier et propose de l'installer.
4. La personne appuie sur « Installer ». La session n'est pas perdue : c'est une mise à
   jour, pas une réinstallation.

### Pourquoi l'application n'installe pas elle-même

Elle le pourrait — c'est une permission qui s'appelle `REQUEST_INSTALL_PACKAGES`. Trois
raisons de ne pas la demander :

1. **Elle fait peur, et elle a raison de faire peur.** Une application qui peut en
   installer d'autres est exactement ce qu'un logiciel malveillant demande. À
   l'installation, Android l'annonce en toutes lettres.
2. **Elle ne fait pas gagner grand-chose** : Android demandera de toute façon une
   confirmation avant d'installer.
3. **Elle n'est pas nécessaire** : le passage par le navigateur marche sur tous les
   téléphones, sans permission ni greffon.

Le jour où le club passera au Play Store, tout ceci disparaît — c'est le Store qui met à
jour.

### Ce qu'il faut dire aux membres, une fois

La première fois, Android affichera **« Pour votre sécurité, votre téléphone n'est pas
autorisé à installer des applications inconnues provenant de cette source »**, avec un
bouton « Paramètres ». Il faut autoriser **le navigateur** (Chrome, en général) à
installer des applications. C'est à faire une seule fois, et cela ne concerne que ce
navigateur.

> Dites-le au club **avant** la première mise à jour. Un message d'avertissement qu'on
> n'attend pas fait renoncer ; le même, annoncé, ne surprend personne.

---

## Partie 5 — Ce qui reste vrai quoi qu'il arrive

- **La clé.** Trois copies, mot de passe rangé ailleurs. Tout le reste se refait ; pas
  elle.
- **`versionCode` ne redescend jamais.** Si vous republiez, le numéro d'exécution du
  workflow a déjà augmenté — ne le forcez pas à la main.
- **`waishi.apk` et `waishi.json` gardent leurs noms.** Les changer casse la mise à jour
  de tous les téléphones déjà installés, qui continueront à chercher l'ancien nom.
- **Une version ne se publie pas si la batterie est rouge.** C'est le seul garde-fou
  entre une erreur et soixante-quatre téléphones.
