# Kung-fu Waishi Analamahitsy — Maquette de l'application mobile

**Statut : maquette soumise à validation.** Aucune technologie n'est choisie, rien n'est
développé. Ces écrans servent à se mettre d'accord sur le contenu, l'agencement et
l'identité visuelle avant d'écrire la première ligne de l'application.

Ce dépôt contient un site statique qui présente les écrans dans un cadre de téléphone,
avec un index à gauche. Il s'ouvre dans un navigateur et se publie sur n'importe quel
hébergeur.

## En ligne

| Adresse | Ce qu'on y trouve |
|---|---|
| `/` | **La maquette** — 26 écrans, avec l'outil de commentaires |
| `/apercu` | **L'application** — les vrais composants React Native, rendus dans le navigateur |

Le site se redéploie à chaque poussée sur la branche : rien à compiler, rien à renvoyer.
L'adresse exacte est celle du projet Vercel `kungfu_idealy`.

L'aperçu n'est pas une capture d'écran : c'est le code de `app/` assemblé avec
react-native-web. Ce qu'il ne montre pas, c'est le rendu **natif** — lissage des polices,
ombres, défilement à l'inertie. Pour cela il faut l'APK, ou Expo Go.

## Lancer en local

```bash
python3 -m http.server 8000     # puis ouvrir http://localhost:8000
npm run apercu                  # reconstruit /apercu après un changement dans app/
```

- **Colonne de gauche** : les 26 écrans.
- **Flèches ↑ ↓** : passer d'un écran à l'autre.
- Les écrans sont cliquables entre eux : la barre du bas, les fiches, les retours.
- Sous 900 px de large, l'index disparaît et la maquette occupe tout l'écran.

## Relire et commenter — c'est le cœur de cette version

La maquette porte son propre outil de relecture. Rien à installer, rien à envoyer.

**Écran « Fonctionnalités »** — le premier de la liste. Chaque fonctionnalité y est une
ligne : touchez-la, écrivez ce qu'il faut changer, ajouter ou retirer. Une pastille verte
marque les lignes commentées.

**Bulle verte sur chaque écran** — pour réagir à ce que vous voyez, pas seulement à une
liste.

**Bouton « Exporter »** — rassemble tous les commentaires dans un fichier texte, et les
copie dans le presse-papier. Envoyez-le, je travaille dessus.

Les commentaires restent **sur votre appareil** : la maquette n'envoie rien nulle part.
Ils survivent à la fermeture du navigateur, mais pas à un changement d'appareil — exportez
avant de passer de votre téléphone à votre ordinateur.

## Sur téléphone

La maquette s'utilise depuis un téléphone. Une barre verte apparaît en haut avec le menu
des écrans à gauche et l'export à droite ; le cadre de téléphone disparaît et l'écran
occupe toute la place.

## Le logo du club

Deux façons de le poser, aucune ne demande un développeur.

**Dans le dépôt** — déposez le fichier dans `img/`, sous le nom `logo` avec n'importe
quelle extension : `logo.png`, `logo.jpg`, `logo.webp` ou `logo.svg`. Le **cachet du club**
suit exactement la même règle, sous le nom `cachet` : `img/cachet.png`, `img/cachet.jpg`…
Puis :

```bash
node build-logo.mjs    # réduit le logo et l'incorpore à la maquette
node build.js          # réassemble le fichier unique
```

`build-logo.mjs` ramène l'image à 320 px et l'incorpore dans `js/logo.js`. Sans cette
étape, le logo s'affiche quand même dans le site, mais **pas** dans le fichier unique
envoyé par courriel : un chemin vers `img/` n'y résoudrait pas.

**Depuis la maquette** — boutons « Logo du club » et « Cachet du club » dans le menu. Le fichier reste sur votre
appareil, ce qui est pratique pour essayer avant de trancher.

Un carré à fond transparent, d'au moins 512 × 512 pixels, donne le meilleur résultat.

## Les écrans

| # | Écran | Ce qu'il montre |
|---|---|---|
| 01 | Connexion | Un compte par membre, numéro de membre et mot de passe |
| 02 | Accueil | Logo, nom du club, visuel, présentation, dernières actualités, notification |
| 03 | Étudiants | Recherche par nom ou prénom, filtres par grade, photo + nom + grade |
| 04 | Profil verrouillé | Ce qui est public, et la liste de ce qui ne l'est pas |
| 05 | Profil ouvert | Fiche complète une fois connecté |
| 06 | Casier | Toutes les actualités du club, filtrables |
| 07 | Une actualité | Détail : date, lieu, texte, participation |
| 08 | Album photo | Catégories et grille |
| 09 | Photo en grand | Vue plein écran d'une photo |
| 10 | Le Club | Présentation, valeurs, entraînements, contact, localisation |
| 11 | Notifications | Centre de notifications, lues et non lues |
| 12 | Administration | Ce que le responsable peut faire |
| 13 | Charte graphique | Couleurs, typographies, composants — référence pour le développement |
| 14 | Carte de membre | Photo, numéro, grade et code de présence |
| 15 | Planche d'impression | La carte imprimée : dix par page A4, avec traits de coupe |
| 16 | Messages | Salons du club et conversations à deux |
| 17 | Une conversation | Le fil, avec l'auteur et l'heure |
| 18 | Espace des maîtres — verrouillé | Ce que voit un élève qui tente d'y entrer |
| 19 | Espace des maîtres | Le fil réservé, et ce qu'il contient |
| 20 | Sécurité et confidentialité | Note technique : tables, règles d'accès, rôles |
| 21 | Je participe | Inscription à une sortie, accompagnants, contribution MVola |
| 22 | Mot de passe | Changement, et réinitialisation par l'administration |
| 00 | Fonctionnalités | La liste à commenter |

## Imprimer les cartes

Écran « Planche d'impression ». Le bouton **Imprimer ou enregistrer en PDF** ouvre la
boîte d'impression du navigateur ; « Enregistrer en PDF » comme destination donne le
fichier à envoyer à l'imprimeur.

**Format retenu : 85,6 × 54 mm**, celui d'une carte bancaire, plutôt qu'un format inventé.
Les étuis, porte-badges et cordons du commerce sont à cette taille, et la carte entre dans
un portefeuille. Il en tient **dix par page A4**, en deux colonnes de cinq, séparées par
des traits de coupe à suivre au massicot.

Seule la feuille part sur le papier : l'index, le menu et le texte d'explication sont
retirés à l'impression. Réglages du navigateur : format A4, marges **aucune**, et
**imprimer les arrière-plans** coché — sinon les bandes de couleur de grade disparaissent.

La taille du nom est calée sur le plus long patronyme du club :
RANDRIAMAMPIONONA tient sur une ligne, aucun nom n'est coupé en deux.

Le verso reste à décider — règlement, horaires, ou rien du tout pour imprimer en recto
seul, deux fois moins cher. Une proposition figure sur l'écran.

## Messagerie et espace des maîtres

La messagerie tient en trois formes de fil : le **salon de tout le club** pour les
annonces, un **salon par grade** ou par événement, et la **conversation à deux**. Un
message se signale à l'administration par un appui long — le club compte des mineurs, la
modération n'est pas une option.

L'**espace des maîtres** est un salon comme les autres du point de vue du code, et pas du
tout du point de vue de l'accès : il n'apparaît pas dans la liste d'un élève, et une
requête d'un élève sur son contenu revient vide. Deux écrans le montrent — celui que voit
un élève qui tente d'y entrer, et celui que voit un maître.

L'écran **Sécurité et confidentialité** est la note technique correspondante : les six
tables, les règles d'accès, les trois rôles, et ce qui reste à décider. Elle est écrite
pour être lue par le club, pas seulement par un développeur.

## Retours du client, du 24 août

Douze commentaires reçus. Ce qui en découle, et qui est déjà dans la maquette :

**Le matricule est `F04x001`, puis `F04x002`, `F04x003`…** Le préfixe est un réglage en
base, pas une constante du code : il pourra changer sans nouvelle version.

**Tous les élèves n'ont pas de téléphone Android.** C'est le retour qui a corrigé une
erreur d'architecture : la fiche du membre était liée au compte. Un élève sans téléphone
n'aurait donc pas pu figurer à l'annuaire, ni sur une carte de membre. La fiche et le
compte sont maintenant deux choses distinctes, et le compte est facultatif.

**Les listes appartiennent au club, pas au code.** Grades, jours d'entraînement, maître
responsable, téléphone, adresse : tout est en base et modifiable depuis l'administration.
Les entraînements passent à mardi, jeudi, vendredi, samedi.

**Changement de mot de passe** (écran 22). Sans réinitialisation par courriel, puisque la
connexion se fait au matricule : c'est l'administration qui réinitialise.

**Participation à une sortie** (écran 21) — prénom et matricule repris de la fiche, nombre
d'accompagnants pour le conjoint et les enfants, et contribution **MVola** par code USSD :
l'application ouvre le clavier avec le code déjà écrit, le membre appuie sur appeler. Le
montant se choisit entre 1 000 et 10 000 Ar, ou se saisit librement, et se verse en
plusieurs fois.

**Le cachet du club** a son emplacement sur la carte de membre. Il est vide tant que le
fichier n'est pas déposé — voir la section sur le logo.

**Direction visuelle : A · Lame**, retenue par le client. Reste à appliquer à l'ensemble
des écrans.

## Décisions prises, à confirmer

**Cinq onglets, pas six.** Le cahier des charges liste six entrées de menu. Six onglets
deviennent illisibles sur un téléphone : chaque libellé se retrouve tronqué. Les
Notifications passent donc en cloche dans l'en-tête, avec leur écran dédié.

**Les messages prennent la place du Club en bas.** Une messagerie se consulte plusieurs
fois par jour, la page de présentation du club une ou deux fois par an. Le Club reste
accessible depuis l'accueil, d'un seul appui.

**La confidentialité ne vient pas du compte, mais des règles.** Héberger les données sur
le compte du club est la bonne décision — elle garantit que le club **reste propriétaire**
de ses messages et de ses photos. Mais la clé publique de l'application se lit dans
n'importe quel téléphone : ce qui protège l'espace des maîtres, ce sont les règles d'accès
posées sur les tables. Sans elles, un élève lirait les délibérations de passage de grade.

**Un compte par membre, plutôt qu'un code partagé.** Un code unique donné à tout le club
ne protège rien : tous les élèves l'ont, il circule dès qu'une personne le communique, et
il ne peut être changé qu'en prévenant tout le monde. Avec un compte par membre, on peut
retirer l'accès à quelqu'un qui quitte le club sans déranger les autres. L'administration
reste le seul rôle autorisé à modifier une fiche.

**Interface en français.** Les libellés du cahier des charges le sont — Accueil,
Étudiants, Casier, Album Photo, Le Club. Le mot « Casier » et le sur-titre « Vaovao
farany » sont conservés tels que le club les emploie. Une version malgache complète est
possible : c'est une décision à prendre maintenant, car elle change la longueur des
libellés et donc la mise en page.

## À trancher avant le développement

**Le code de la carte de membre est factice.** Le motif affiché ressemble à un QR mais
n'encode rien et ne se scanne pas — la mention est écrite dans la carte elle-même, pour
qu'elle suive la capture d'écran si on la partage. Le vrai code, unique par membre, sera
produit au développement une fois la maquette validée.

**Les mineurs.** Date de naissance et photo d'enfants, visibles par 64 membres, méritent
une décision explicite du club. Une piste : n'ouvrir ces deux champs qu'à
l'administration, et laisser aux membres le nom, le grade et la biographie.

**Les notifications push.** Elles supposent un serveur et un compte développeur sur les
boutiques d'applications, avec un coût annuel. Les notifications à l'intérieur de
l'application, elles, ne coûtent rien de plus. À décider selon le budget.

**La connexion par numéro de membre.** Le service d'authentification travaille par
courriel ou par téléphone, pas par numéro de membre. Trois voies : un courriel réel par
membre, un courriel construit à partir du numéro, ou un code par SMS — qui se paie à
l'envoi. À trancher, cela change la procédure d'inscription.

**Qui peut écrire à qui.** Une conversation à deux entre mineurs, sans adulte, est une
responsabilité pour le club. Une piste : les conversations à deux ouvertes seulement vers
un maître, les salons de groupe toujours lisibles par un maître.

**L'hébergement des messages.** L'offre gratuite suffit à 64 membres, mais un projet
inactif sept jours est mis en pause et doit être relancé à la main — inacceptable pour une
messagerie. L'offre payante, environ 25 dollars par mois, supprime cette pause. Et il faut
décider combien de temps les messages sont conservés, sinon ils s'accumulent
indéfiniment.

## À fournir par le club

- Les **photos** des membres, du club et des albums
- Le **téléphone** et l'**adresse exacte**
- La liste réelle des **grades** employés par le club
- Le texte d'**histoire et de valeurs**, s'il en existe une version officielle

Ces emplacements portent aujourd'hui un marque-place assumé plutôt qu'une image
inventée : `[NUMÉRO À FOURNIR]`, « Photo à fournir », silhouettes au trait.

## Identité visuelle

Vert dominant, blanc secondaire, comme demandé.

| Rôle | Valeur | Contraste |
|---|---|---|
| Vert profond — bandeaux, boutons | `#0F5132` | blanc dessus 9,4:1 |
| Vert texte — liens, libellés | `#12613C` | sur blanc 7,5:1 |
| Vert clair — fonds teintés | `#E8F1EC` | — |
| Fond d'écran | `#F5F8F6` | — |
| Encre — texte principal | `#0E2119` | 16,8:1 |
| Texte de soutien | `#59685F` | 5,9:1 |
| Alerte — non-lu | `#E4572E` | employé rarement |

Chaque couleur de texte a été mesurée sur son fond : le minimum retenu est **4,5:1**, y
compris pour les libellés de 11 px. Le grade est toujours écrit à côté de sa pastille de
couleur — la couleur seule ne porte jamais l'information, pour rester lisible par une
personne daltonienne.

Typographies : **Archivo** pour les titres et les chiffres, **Karla** pour le texte. Elles
sont **embarquées dans la maquette** (`css/fonts.css`, sous-ensemble latin, licence SIL
Open Font). Elle s'affiche donc à l'identique partout, y compris sans connexion — ce qui
compte pour un club à Antananarivo, et ce qui évite qu'elle change d'aspect d'un appareil
à l'autre.

## Fichiers

| Fichier | Rôle |
|---|---|
| `build-screens.mjs` | **Source de vérité des écrans.** On corrige ici, puis `node build-screens.mjs` |
| `js/screens.js` | Généré — ne pas modifier à la main |
| `css/app.css` | Couleurs, typographies, composants |
| `js/app.js` | Navigation entre les écrans de la maquette |
| `css/fonts.css` | Généré — Archivo et Karla embarquées en base64 |
| `img/logo.*` | Le logo fourni par le club, dans sa taille d'origine |
| `build-logo.mjs` | Réduit ce logo et l'incorpore dans `js/logo.js` |
| `build.js` | Assemble un fichier unique dans `dist/`, à envoyer par courriel |
| `vercel.json` | Configuration d'hébergement, site statique sans étape de build |
| `ARCHITECTURE.md` | **Le topo de démarrage** : choix technologique, étapes, coûts |
| `supabase/` | Les migrations et le test de sécurité, exécutés sur un vrai PostgreSQL |
| `app/` | **L'application** : thème extrait de cette maquette, composants, écrans |
| `outils/` | L'extracteur de thème et la comparaison maquette / application |

L'application de gestion de monastère développée précédemment reste consultable dans
l'historique du dépôt : elle répondait à un autre cahier des charges.
