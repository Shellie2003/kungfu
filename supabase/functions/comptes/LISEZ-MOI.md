# La fonction « comptes »

Elle crée les comptes des membres et réinitialise les mots de passe. C'est le seul
morceau du projet qui ne peut pas vivre dans l'application.

## Pourquoi elle est à part

Créer un compte demande la clé **`service_role`**. Cette clé passe outre **toutes** les
règles d'accès : avec elle, on lit la date de naissance de chaque mineur du club et on
écrit ce qu'on veut.

Une clé placée dans l'APK est une clé **publiée** — n'importe qui l'en extrait en deux
minutes, et le dépôt est public par-dessus le marché. Elle vit donc sur le serveur, où
personne ne la voit, et l'application demande poliment.

## Ce que la fonction vérifie avant d'agir

Elle monte **deux** clients Supabase, et la distinction est le cœur de la sécurité :

| Client | Clé | Ce qu'il sert à faire |
|---|---|---|
| « comme l'appelant » | publiable + le jeton reçu | Demander à la base **qui appelle** |
| « admin » | `service_role` | Agir, une fois seulement que le rôle est établi |

Le contrôle du rôle se fait avec la clé **publiable**, jamais avec `service_role` : on
demande à la base « qui es-tu », et c'est elle qui répond, règles d'accès appliquées.
Employer `service_role` pour cette lecture reviendrait à croire l'appelant sur parole.

Si la fiche que le jeton désigne ne porte pas le rôle `admin`, la fonction répond 403 et
s'arrête.

## Où elle en est

Elle est **déployée sur le projet d'essai** (`znotzkfwukvvtaqfrozn`), version 1, active,
avec `verify_jwt` activé. L'écran « Comptes et accès » l'atteint donc réellement lors des
essais.

Une réserve à ne pas passer sous silence : je n'ai pas pu l'**exercer** de bout en bout
depuis ici — l'environnement où je travaille bloque les connexions sortantes vers
`supabase.co`, et l'appel n'est jamais parti. Ce qui est vérifié, c'est qu'elle est en
ligne ; ce qui reste à voir sur un vrai téléphone, c'est la création d'un compte. La
fiche **F04x077 · ANDRIAMBELO Rado** est justement sans compte dans la base d'essai :
c'est celle sur laquelle essayer.

Sur le projet du club, quand il existera, elle sera à déployer une fois de plus — une
fonction appartient à son projet.

## Déployer

```bash
npx supabase login
npx supabase link --project-ref VOTRE_REF
npx supabase functions deploy comptes
```

> ⚠ **La copie actuellement en ligne n'est pas exactement ce fichier.** Le 5 septembre, la
> version 3 a été déployée depuis un environnement sans terminal Supabase : la LOGIQUE est
> identique — mêmes actions, mêmes contrôles, mêmes messages — mais les longs commentaires
> de ce fichier y sont abrégés.
>
> Ce n'est pas une divergence de comportement, et rien ne casse. C'en est une de **source de
> vérité**, et elle se referme d'elle-même au prochain déploiement par la commande
> ci-dessus : elle envoie ce fichier-ci, tel quel. Faites-le une fois, sans urgence, et
> supprimez ce paragraphe.
>
> La même remarque vaut pour `fondation` (version 2).

Les trois variables dont elle a besoin — `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` — sont fournies **automatiquement** par Supabase à toute
fonction déployée. Il n'y a rien à configurer, et surtout rien à écrire dans ce dépôt.

## Tant qu'elle n'est pas déployée

L'écran « Comptes et accès » fonctionne, mais chaque action répond :

> La fonction « comptes » n'est pas déployée sur le serveur.

C'est voulu : mieux vaut le dire que laisser croire qu'un compte a été créé. Tout le
reste de l'administration — fiches, grades, actualités, notifications, albums, photos —
n'en dépend pas et marche sans elle.

## Le mot de passe engendré

Douze caractères tirés par le générateur cryptographique, dans un alphabet sans `O`, `0`,
`l`, `1` ni `I` : il se dicte au téléphone sans se tromper.

Il est affiché **une seule fois**. Il n'est stocké en clair nulle part, et personne — pas
même l'administration — ne peut le relire ensuite. C'est ce qui doit être : un mot de
passe relisible est un mot de passe qui fuit. S'il est perdu, on réinitialise.

## Suspendre plutôt que supprimer

L'action `suspendre` interdit la connexion sans rien détruire — la fiche, le grade et
l'historique restent. Techniquement, un bannissement de cent ans, réversible d'un appel.
Supprimer un compte casserait le rattachement de la fiche et perdrait l'historique de
messagerie.
