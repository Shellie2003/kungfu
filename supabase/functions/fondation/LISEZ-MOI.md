# La fonction « fondation »

Elle crée le **tout premier compte du club** — celui du super administrateur — puis
l'inscription se ferme définitivement.

## Pourquoi elle existe

Tout compte est créé par l'administration depuis l'application. C'est vrai des
soixante-quatre membres, et c'est **circulaire** pour le premier : personne ne peut créer
le compte de celui qui crée les comptes.

Jusqu'ici, il fallait ouvrir le tableau de bord Supabase et écrire du SQL à la main. Un
club qui installe l'application n'a pas à faire cela.

## Pourquoi elle n'est pas une action de « comptes »

C'est la **seule** action du projet qui ne peut pas exiger de jeton : celui qui la demande
n'a pas encore de compte, par définition. Elle est donc déployée avec **`verify_jwt`
désactivé**.

`comptes`, elle, garde `verify_jwt` **activé** — ce n'est pas négociable, c'est la
fonction qui crée, suspend et supprime les membres. Y loger la fondation aurait obligé à
désarmer la barrière d'entrée de tout le reste pour servir une action qui n'arrive
**qu'une fois** dans la vie du club. Le marché est mauvais.

Ici, la surface est d'une seule action, et cette action est verrouillée par la base
elle-même.

## « Sans jeton » n'est pas « sans contrôle »

Le verrou n'est **pas** dans cette fonction. Il est dans la base, en deux moitiés que la
migration `0024_fondation.sql` détaille :

| Moitié | Ce qu'elle empêche |
|---|---|
| une ligne `fondation_faite` dont la clé est **primaire** | deux inscriptions parties en même temps : une seule passe, c'est PostgreSQL qui arbitre |
| toutes les fonctions refusent dès qu'un **super administrateur existe** | même en effaçant la ligne, la porte reste fermée |

Un déclencheur interdit par-dessus le marché de modifier ou d'effacer cette ligne depuis
l'application — y compris à un administrateur, qui passe pourtant les règles d'accès sur
tous les autres réglages.

Autrement dit : réécrire cette fonction, ou l'appeler depuis n'importe quel outil, ne
permet pas de se fabriquer un compte super administrateur le lendemain de l'installation.

**Vérifié sur la base d'essai**, en se faisant passer pour chacun :

| Qui | Ce qu'il tente | Ce qui arrive |
|---|---|---|
| deux inscriptions simultanées | fonder toutes les deux | la seconde échoue sur la clé primaire |
| un élève | effacer le verrou | 0 ligne — les règles d'accès ne la lui montrent pas |
| un administrateur | effacer le verrou | refusé par le déclencheur |
| un administrateur | modifier le verrou | refusé par le déclencheur |
| un administrateur | modifier `prefixe_matricule` | 1 ligne — les réglages ordinaires restent à lui |
| n'importe qui | annuler une fondation aboutie | refusé |

## Pourquoi trois appels et non un seul

Le compte de **connexion** ne vit pas dans la base du club : il vit dans `auth.users`, et
seul un appel HTTP l'y crée. Cet appel ne tient pas dans une transaction SQL. Or il faut
connaître le numéro **avant** de créer le compte, puisque l'adresse en est tirée :
`F04x001` devient `f04x001@waishi.local`.

On réserve, on crée, on pose — et si la création échoue, `fonder_annuler` rend la place.
Sans ce dernier geste, une coupure de réseau au mauvais moment enfermerait le club dehors
définitivement.

## Le mot de passe

Contrairement aux autres comptes, il n'est **pas** engendré : le fondateur le choisit,
puisqu'il n'y a personne à qui le dicter. Huit caractères au minimum, exigés des deux
côtés — dans l'écran pour le dire avant l'envoi, ici parce que c'est le seul endroit qui
décide.

L'écran demande une **confirmation**, et ce n'est pas une formalité : ce mot de passe ne
se réinitialise par personne. Il n'y a pas encore d'administration pour le faire — c'est
justement celle qu'on est en train de créer. Une faute de frappe enfermerait le club
dehors.

## Où elle en est

**Déployée sur le projet d'essai** (`znotzkfwukvvtaqfrozn`), version 1, active,
`verify_jwt` désactivé.

Sur ce projet, la porte est **fermée** : le club a déjà son super administrateur
(`F04x001`), créé à la main avant que cette fonction n'existe. L'écran d'inscription n'y
apparaît donc pas — ce qui est exactement le comportement attendu.

Réserve à ne pas passer sous silence : comme pour `comptes`, je n'ai pas pu l'**exercer**
de bout en bout depuis mon environnement, qui bloque les connexions sortantes vers
`supabase.co`. Ce qui est vérifié, c'est qu'elle est en ligne, et que **les fonctions SQL
qu'elle appelle se comportent correctement sur la vraie base** — le tableau ci-dessus a
été exécuté, pas raisonné. Ce qui reste à voir sur un projet neuf : l'enchaînement
complet.

## Déployer

```bash
npx supabase login
npx supabase link --project-ref VOTRE_REF
npx supabase functions deploy fondation --no-verify-jwt
```

Le `--no-verify-jwt` est **obligatoire** : sans lui, la passerelle rejette l'appel avant
qu'il n'atteigne le code, et l'inscription répond « 401 » sans explication.

Les deux variables dont elle a besoin — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` —
sont fournies automatiquement par Supabase à toute fonction déployée. Il n'y a rien à
configurer, et surtout rien à écrire dans ce dépôt.

## Une fois le club fondé

Cette fonction peut être **supprimée** du projet : elle ne répondra plus que « 403,
l'inscription est fermée ». La laisser ne coûte rien et ne risque rien ; la retirer est
une façon de plus de fermer la porte, si le club le préfère.
