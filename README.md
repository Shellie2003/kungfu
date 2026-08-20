# Kung-fu Waishi Analamahitsy — Maquette de l'application mobile

**Statut : maquette soumise à validation.** Aucune technologie n'est choisie, rien n'est
développé. Ces écrans servent à se mettre d'accord sur le contenu, l'agencement et
l'identité visuelle avant d'écrire la première ligne de l'application.

Ce dépôt contient un site statique qui présente les écrans dans un cadre de téléphone,
avec un index à gauche. Il s'ouvre dans un navigateur et se publie sur n'importe quel
hébergeur.

## Lancer

```bash
python3 -m http.server 8000     # puis ouvrir http://localhost:8000
```

- **Colonne de gauche** : les 13 écrans.
- **Flèches ↑ ↓** : passer d'un écran à l'autre.
- Les écrans sont cliquables entre eux : la barre du bas, les fiches, les retours.
- Sous 900 px de large, l'index disparaît et la maquette occupe tout l'écran.

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

## Décisions prises, à confirmer

**Cinq onglets, pas six.** Le cahier des charges liste six entrées de menu. Six onglets
deviennent illisibles sur un téléphone : chaque libellé se retrouve tronqué. Les
Notifications passent donc en cloche dans l'en-tête, avec leur écran dédié ; les cinq
autres restent en bas.

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

**Les mineurs.** Date de naissance et photo d'enfants, visibles par 64 membres, méritent
une décision explicite du club. Une piste : n'ouvrir ces deux champs qu'à
l'administration, et laisser aux membres le nom, le grade et la biographie.

**Les notifications push.** Elles supposent un serveur et un compte développeur sur les
boutiques d'applications, avec un coût annuel. Les notifications à l'intérieur de
l'application, elles, ne coûtent rien de plus. À décider selon le budget.

## À fournir par le club

- Le **logo** Kung-fu Waishi Analamahitsy
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

Typographies : **Archivo** pour les titres et les chiffres, **Karla** pour le texte.
Elles sont chargées depuis Google Fonts. Si la connexion des membres est incertaine, il
faudra les embarquer dans l'application plutôt que les télécharger — à prévoir au
développement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `build-screens.mjs` | **Source de vérité des écrans.** On corrige ici, puis `node build-screens.mjs` |
| `js/screens.js` | Généré — ne pas modifier à la main |
| `css/app.css` | Couleurs, typographies, composants |
| `js/app.js` | Navigation entre les écrans de la maquette |
| `build.js` | Assemble un fichier unique dans `dist/`, à envoyer par courriel |
| `vercel.json` | Configuration d'hébergement, site statique sans étape de build |

L'application de gestion de monastère développée précédemment reste consultable dans
l'historique du dépôt : elle répondait à un autre cahier des charges.
