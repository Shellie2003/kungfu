# `pousser` — faire sonner les téléphones du club

> ## ⚠ DORMANTE — plus rien ne l'appelle
>
> Cette fonction est **déployée et active**, mais l'application ne
> l'appelle plus : les notifications sur le téléphone ont été
> retirées à la demande du club, le 6 septembre 2026.
>
> Elle n'est pas effacée, pour deux raisons. Elle ne coûte rien tant
> que personne ne l'appelle ; et elle est, avec la migration 0029,
> ce qui permettra de reprendre la fonctionnalité sans tout refaire
> le jour où le club aura son projet Firebase.
>
> **Pour la remettre en service**, il faut aussi rétablir le code
> côté application — voir le commit « Version 1.3.0 » puis celui qui
> l'a retiré. Le mode d'emploi Firebase ci-dessous reste valable.

Cette fonction envoie les notifications aux téléphones. Elle ne sonne
nulle part tant que le club n'a pas de projet Firebase.

Ce n'est pas une panne. Sans Firebase, elle répond :

```json
{ "firebase": false, "envoyees": 0, "retirees": 0 }
```

…et l'application se comporte exactement comme avant : les
notifications arrivent dans le casier, il faut ouvrir l'application
pour les voir. C'est l'état livré, et il est correct.

---

## Ce qu'il reste à faire, et que personne ne peut faire à votre place

Firebase demande un compte Google et l'acceptation de conditions
d'utilisation. C'est un engagement au nom du club : il se signe par
quelqu'un du club, pas par un prestataire.

### 1. Créer le projet Firebase

1. Aller sur <https://console.firebase.google.com>, se connecter avec
   le compte Google du club.
2. **Ajouter un projet** → nom : `Kung-fu Waïshi` (le nom n'a aucune
   importance technique).
3. Google Analytics : **non**. Le club n'en a pas l'usage, et cela
   ajoute des conditions supplémentaires à accepter.

Le forfait gratuit suffit très largement : les notifications sont
**sans limite et sans frais**, quel que soit le nombre d'envois.
Soixante-quatre membres n'en approcheront jamais le bord.

### 2. Déclarer l'application Android

Dans le projet, **Ajouter une application** → Android.

> ⚠ **Le nom du paquet doit être exactement :**
>
> ```
> mg.analamahitsy.waishi
> ```
>
> Sans tréma, et au caractère près. C'est l'identifiant de
> l'application déjà installée sur les téléphones du club. Une seule
> lettre de différence, et Firebase enverra les notifications à une
> application qui n'existe pas — **sans aucune erreur nulle part**.
> Ni la console, ni le serveur, ni le téléphone ne diront quoi que ce
> soit : les envois seront simplement acceptés et perdus.

Le surnom et l'empreinte SHA-1 sont facultatifs : les laisser vides.

Télécharger le fichier **`google-services.json`** que la console
propose.

### 3. Poser le fichier dans le dépôt GitHub

Dans GitHub → **Settings** → *Secrets and variables* → **Actions** →
*New repository secret* :

| | |
|---|---|
| **Name** | `FIREBASE_GOOGLE_SERVICES` |
| **Secret** | le contenu **entier** de `google-services.json` |

Ouvrir le fichier avec un éditeur de texte, tout sélectionner, tout
coller. Le début doit ressembler à `{ "project_info": {`.

> Ce fichier n'est pas un secret dangereux — il est embarqué dans
> chaque APK, donc lisible par qui télécharge l'application. Il passe
> par les secrets uniquement parce que **le dépôt est public** et
> qu'un fichier de configuration du club n'a pas à y figurer en
> clair.

### 4. La clé d'envoi, elle, est un vrai secret

Toujours dans la console Firebase : **Paramètres du projet** →
**Comptes de service** → *Générer une nouvelle clé privée*. Un fichier
JSON se télécharge.

> ⚠ **Celui-là ne doit JAMAIS être dans le dépôt, ni dans l'APK, ni
> envoyé par message.** Il permet d'envoyer des notifications au nom
> du club sur tous les téléphones. Traitez-le comme le mot de passe
> de l'administration.

Il se pose dans Supabase, et non dans GitHub — c'est le serveur qui
envoie :

Tableau de bord Supabase → **Edge Functions** → **Secrets** →
*Add new secret* :

| | |
|---|---|
| **Name** | `FCM_COMPTE_SERVICE` |
| **Value** | le contenu entier du JSON téléchargé |

### 5. Republier l'application

Le fichier `google-services.json` s'embarque **dans l'APK** : il faut
donc une nouvelle version pour qu'il y arrive. Lancer le workflow
« Publier une version » après avoir monté le numéro dans
`app/package.json`.

Les membres installeront cette version, et l'application leur
demandera au premier lancement l'autorisation d'envoyer des
notifications.

---

## Vérifier que cela marche

Publier une actualité depuis l'administration, en cochant « prévenir
les membres ». Un téléphone qui a la nouvelle version, application
**fermée**, doit sonner dans les secondes qui suivent.

Si rien ne sonne, l'ordre où chercher :

1. **Le membre a-t-il accepté la notification ?** Paramètres du
   téléphone → Applications → Kung-fu Waïshi → Notifications.
2. **A-t-il la version qui contient Firebase ?** Les versions
   antérieures ne s'enregistrent pas — elles n'ont pas le fichier.
3. **La table des jetons est-elle vide ?** Dans Supabase :
   `select count(*) from jetons_push;`. Zéro signifie qu'aucun
   téléphone ne s'est enregistré : c'est le point 1 ou 2.
4. **Les journaux de la fonction** : Supabase → Edge Functions →
   `pousser` → Logs. « clé Firebase refusée » désigne le point 4
   ci-dessus ; un compte `envoyees: 0` avec des jetons en base
   désigne un décalage de nom de paquet (point 2 de la section 2).

---

## Ce qui a été vérifié, et ce qui ne l'a pas été

**Vérifié ici** : que les deux moitiés du mécanisme existent et se
répondent — l'enregistrement du téléphone et l'envoi serveur ; que
l'envoi ne peut pas faire échouer la publication ; qu'il est réservé
aux maîtres et à l'administration ; que les jetons morts sont
effacés ; que le jeton est retiré avant la déconnexion et non après ;
qu'un lien reçu du réseau ne peut pas faire sortir l'application.

**Non vérifié, faute d'appareil et de projet Firebase** : qu'un
téléphone sonne réellement. Cela demande la manipulation décrite
ci-dessus, et un vrai téléphone. Personne ne peut l'affirmer avant.
