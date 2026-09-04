# Topo de démarrage — passage au développement

La maquette est faite. Ce document dit avec quoi on construit, dans quel ordre, et ce
qu'il faut avoir tranché avant d'écrire la première ligne.

Il est écrit pour un développeur seul, qui connaît React et JavaScript, pour un club de
64 membres à Antananarivo, sur Android.

---

## 1. Le choix technologique

**React Native avec Expo, et Supabase pour le serveur.**

Vous connaissez React : c'est l'argument qui pèse le plus lourd. Un développeur seul livre
plus vite dans ce qu'il maîtrise qu'avec l'outil théoriquement meilleur. Flutter serait un
choix défendable, mais il faudrait apprendre Dart, et cela coûterait des semaines pour un
gain qui ne se verrait pas ici.

Expo apporte trois choses qui comptent pour ce projet :

**Un APK que vous distribuez vous-même.** `eas build --platform android --profile preview`
produit un fichier que vous envoyez par WhatsApp ou par lien. Le club l'installe et teste
pendant que vous développez, sans passer par le Play Store et sans payer les 25 dollars
d'inscription. C'est décisif ici : à Madagascar, l'installation directe d'un APK est une
pratique courante, et vous obtenez les retours du club des semaines avant la publication.

**Les notifications sur le téléphone sans serveur à monter.** `expo-notifications` s'appuie
sur le service d'Expo, gratuit, qui parle à Google à votre place. Sans lui, il faudrait
gérer les clés Firebase et un envoi côté serveur — plusieurs jours de travail.

**Pas de chaîne de compilation native à installer.** Les builds tournent chez Expo. Vous
développez sur votre machine avec un simple `npx expo start` et l'application se recharge
sur votre téléphone.

### Ce que j'ai écarté, et pourquoi

**Une application web installable (PWA).** Techniquement possible, moins chère, mise à jour
instantanée. Deux raisons de ne pas la retenir : les notifications sur le téléphone sont
capricieuses selon les fabricants Android, et surtout le club voudra « une application »,
pas un lien à ajouter à l'écran d'accueil — c'est une attente à respecter, pas à corriger.

**Flutter.** Meilleur sur le papier pour un projet mobile pur. Mais vous ne le connaissez
pas, et rien dans ce cahier des charges ne demande ce qu'il fait de mieux.

**Android natif en Kotlin.** Le plus solide, le plus lent à écrire, et sans issue si le
club demande iOS dans deux ans.

### iOS

Vous m'avez dit : pas ou peu d'iPhone. On développe **Android uniquement**. Expo garde la
porte ouverte : le jour où le club en aura besoin, c'est une recompilation et le compte
Apple à 99 dollars par an, pas une réécriture.

### La liste des outils

| Rôle | Choix | Pourquoi celui-là |
|---|---|---|
| Application | Expo (React Native) | Vous connaissez React ; APK distribuable tout de suite |
| Navigation | Expo Router | Navigation par fichiers, comme Next.js |
| Serveur | Supabase | Base, comptes, temps réel et fichiers d'un seul tenant |
| Données | `@supabase/supabase-js` + TanStack Query | Le cache et le rechargement sont déjà écrits |
| État local | Zustand | Cent lignes suffisent ici ; Redux serait disproportionné |
| Notifications | `expo-notifications` | Pas de serveur d'envoi à monter |
| Types | TypeScript, générés depuis la base | `supabase gen types` — les colonnes ne mentent pas |

---

## 1 bis. Comment on garantit que le design ne dérive pas

Le client demande que l'application ressemble à la maquette à 100 %. Une relecture côte à
côte ne le garantit pas : une marge de 2 px, une graisse 600 au lieu de 700, un gris
légèrement différent — rien de tout cela ne se voit, et tout cela s'accumule.

Deux dispositifs, tous deux en place et exécutables :

**Le thème est extrait, pas recopié.** `node outils/extraire-theme.mjs` lit `css/app.css`
et produit `app/theme/tokens.ts` : 13 couleurs, 2 polices, 4 rayons et 34 mesures relevées
règle par règle. Le fichier est généré ; on ne le modifie jamais à la main.

**L'écart est mesuré, pas supposé.** `node outils/comparer.mjs` rend les composants React
Native dans un navigateur, photographie l'écran correspondant de la maquette, et compare.
La géométrie de chaque texte doit concorder **exactement** ; les pixels doivent rester
sous 0,3 %. Aujourd'hui, sur l'écran Étudiants : 27 textes au même endroit, 0,04 % de
pixels différents.

Le détail est dans `app/README.md`, y compris ce que la méthode ne prouve pas.

**Ce dispositif a déjà payé** : en portant un seul écran, il a trouvé trois défauts dans la
maquette que personne n'avait vus — un rail de filtres comprimé de 53 à 18 px sur deux
écrans, une hauteur de chip qui dépendait des métriques de la police, et une animation
d'entrée qui ignorait le réglage « animations réduites » du système.

## 2. Ce qu'on ne construit pas

Le dire maintenant évite de le construire par accident.

- **Pas de serveur à nous.** Supabase suffit. Chaque service qu'on ajoute est un service à
  surveiller, et personne ne surveillera rien dans ce club.
- **Pas de messagerie chiffrée de bout en bout.** L'administration doit pouvoir modérer un
  signalement, et le club compte des mineurs. Le chiffrement de bout en bout rendrait la
  modération impossible — ce serait un mauvais service rendu.
- **Pas de paiement des cotisations.** Hors du cahier des charges. Si le club le demande,
  c'est un projet à part.
- **Pas de mode hors ligne complet.** Le cache de TanStack Query suffit à relire ce qu'on
  a déjà vu. Une vraie synchronisation hors ligne est un projet à elle seule.

---

## 3. L'architecture, en trois morceaux

```
  Téléphone Android                    Supabase (compte du club)
  ┌───────────────────┐                ┌──────────────────────────┐
  │  Expo / React     │  clé publique  │  Auth   comptes          │
  │                   │ ─────────────► │  Base   règles d'accès   │
  │  TanStack Query   │ ◄───────────── │  Temps réel  messages    │
  │  Zustand          │   temps réel   │  Fichiers    photos      │
  └───────────────────┘                └──────────────────────────┘
           │                                        ▲
           │  jeton d'accès                         │ clé de service
           ▼                                        │
     Expo Notifications ◄──────── Fonction serveur ─┘
                                  (création de comptes, envois)
```

**Il n'y a pas de code à nous entre le téléphone et la base.** C'est l'intérêt de Supabase,
et c'est aussi ce qui déplace toute la sécurité dans les règles d'accès de la base.

**La clé embarquée dans l'application est publique.** Elle se lit dans n'importe quel APK
en quelques minutes. Écrivez-le au mur de votre bureau : rien de ce que fait l'interface ne
protège quoi que ce soit. Seules les règles d'accès protègent.

**La clé de service ne quitte jamais le serveur.** Elle passe outre toutes les règles. Elle
n'a rien à faire dans l'application, ni dans un fichier `.env` livré, ni dans le dépôt.
Elle ne vit que dans les fonctions serveur (Edge Functions), qui font deux choses : créer
les comptes et envoyer les notifications.

---

## 4. La base

Elle est écrite, elle est dans `supabase/migrations/`, et elle a été exécutée sur un
PostgreSQL réel avant d'être livrée. Douze tables :

| Table | Ce qu'elle porte |
|---|---|
| `profils` | L'annuaire : nom, prénom, grade, photo, rôle |
| `profils_prives` | Naissance, téléphone, adresse — séparé exprès |
| `tuteurs` | Parents et responsables, avec le contact d'urgence |
| `actualites` | Le casier |
| `albums`, `photos` | L'album photo |
| `salons` | Un fil : club, grade, événement, direct, **maîtres** |
| `membres_salon` | **Qui a le droit d'être où.** La table qui décide de tout |
| `messages` | Le texte, l'auteur, la date |
| `signalements` | Ce que la modération remonte |
| `journal_acces` | Qui a ouvert l'espace des maîtres |
| `notifications` | Les notifications à l'intérieur de l'application |

Deux décisions structurantes :

**`profils_prives` est une table à part.** Les règles d'accès de PostgreSQL travaillent par
ligne, pas par colonne. Mettre la date de naissance dans `profils` la rendrait visible de
tout l'annuaire, ou obligerait à des vues fragiles. Une table séparée règle le problème des
mineurs proprement.

**L'espace des maîtres est un salon ordinaire.** Type `maitres`, quatre membres inscrits.
Aucun code particulier, donc aucune exception à oublier le jour où on ajoutera une
fonctionnalité.

---

## 5. La sécurité — et ce que le test a trouvé

`0003_securite.sql` porte les règles. `supabase/tests/securite.sql` les vérifie : il se
fait passer pour un élève, un maître et l'administration, et compte ce que chacun voit.

**Le test a trouvé une faille avant la livraison.** La règle « chacun corrige sa fiche »
autorisait aussi « je me nomme maître » — parce qu'une règle d'accès porte sur la ligne
entière, pas sur une colonne. Corrigé par un déclencheur qui gèle le rôle, le numéro et le
grade. C'est le genre de trou qui serait parti en production sans se voir.

Ce que le test établit aujourd'hui :

| Vérification | Résultat |
|---|---|
| Un élève voit les salons des maîtres | non — la liste revient vide |
| Un élève lit un message de l'espace des maîtres | non |
| Un élève écrit dans l'espace des maîtres | refusé |
| Un élève s'inscrit lui-même dans ce salon | refusé |
| Un élève se nomme maître | refusé |
| Un élève écrit sous le nom d'un autre | refusé |
| Un élève supprime un message | aucune ligne supprimée |
| Un maître déplace son message vers un salon d'élèves | refusé |
| Un élève voit la date de naissance d'un autre | non — la sienne seulement |
| Une requête sans jeton lit quoi que ce soit | non |

**Rejouez ce test à chaque modification des règles.** La commande est dans
`supabase/README.md`.

Un point d'honnêteté : l'administration n'a **pas** accès à l'espace des maîtres — elle
n'y est pas inscrite. C'est un choix. Si le club veut que le responsable y ait accès, il
suffit de l'inscrire ; ce doit être une décision explicite du club, pas un effet de bord.

---

## 6. La connexion par numéro de membre

Le cahier des charges dit « numéro de membre et mot de passe ». Le service
d'authentification, lui, travaille par courriel ou par téléphone.

**Ma recommandation : un courriel construit à partir du numéro.** `wa-0042@waishi.local`,
jamais envoyé, jamais affiché. Le membre saisit `WA-0042`, l'application compose l'adresse.

```ts
const identifiant = `${numero.toLowerCase()}@waishi.local`;
await supabase.auth.signInWithPassword({ email: identifiant, password: motDePasse });
```

Ce que cela coûte, et qu'il faut assumer : **pas de réinitialisation de mot de passe par
courriel**. Un membre qui oublie son mot de passe s'adresse à l'administration, qui le
réinitialise depuis l'écran d'administration — lequel appelle une fonction serveur munie
de la clé de service. Pour 64 membres qui se connaissent tous, c'est acceptable, et
probablement plus sûr qu'un courriel.

Les deux autres voies, pour mémoire : un vrai courriel par membre (beaucoup n'en ont pas,
ou pas d'accès régulier) ; un code par SMS (qui se paie à chaque envoi, y compris pour
chaque erreur de saisie).

Les comptes sont créés par l'administration, jamais par inscription libre. Un club n'est
pas un service ouvert.

---

## 7. Le temps réel

```ts
supabase
  .channel(`salon:${salonId}`)
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `salon_id=eq.${salonId}` },
      ({ new: message }) => ajouterAuFil(message))
  .subscribe();
```

Deux choses à savoir :

**Il faut inscrire la table à la publication** — sinon rien n'arrive, sans message
d'erreur : `alter publication supabase_realtime add table messages;`

**Les règles d'accès s'appliquent aussi au temps réel.** Un élève abonné au canal du salon
des maîtres ne reçoit rien. Vérifiez-le vous-même le jour où vous le brancherez, plutôt que
de me croire.

---

## 8. Les photos

Trois emplacements, tous **privés** — jamais publics :

| Emplacement | Contenu | Qui y accède |
|---|---|---|
| `portraits` | Photos des membres | Tout membre connecté |
| `album` | Album du club | Tout membre connecté |
| `messages` | Pièces jointes | Les membres du salon concerné |

Un emplacement public distribue des adresses devinables et éternelles : la photo d'un
enfant se retrouverait accessible à qui a le lien, indéfiniment. On lit donc par adresse
signée, valable une heure.

Redimensionnez **avant** l'envoi (`expo-image-manipulator`, 1200 px de côté). Une photo de
téléphone pèse 4 Mo ; c'est le forfait data du membre qui paie, et le club n'a qu'un
gigaoctet.

---

## 9. Les notifications

Deux choses différentes, à ne pas confondre :

**À l'intérieur de l'application** — la table `notifications`, la cloche, la pastille.
Gratuit, déjà prévu.

**Sur le téléphone, application fermée** — `expo-notifications`. Le téléphone enregistre un
jeton à la connexion ; une fonction serveur, déclenchée à la publication d'une actualité,
appelle le service d'Expo. Gratuit aussi, mais il faut une fonction serveur.

Commencez par les premières. Les secondes sont une étape 6, pas une étape 1.

---

## 10. Le dépôt

```
waishi/
├─ app/                    écrans (Expo Router)
│  ├─ (auth)/connexion.tsx
│  ├─ (app)/accueil.tsx  etudiants/  messages/  casier/  album/
│  └─ (maitres)/          l'espace réservé
├─ composants/            boutons, cartes, bulles
├─ services/              supabase.ts, messages.ts, profils.ts
├─ theme/                 couleurs et typographies, repris de la maquette
├─ supabase/              ce dépôt-ci : migrations, tests, fonctions
└─ maquette/              la maquette validée, gardée comme référence
```

**Aucun accès direct à Supabase depuis un écran.** Tout passe par `services/`. Le jour où
une règle change, on la corrige à un endroit.

Le thème est déjà écrit : couleurs, contrastes mesurés, typographies. Reprenez-le tel quel
depuis `css/app.css`, ne le réinventez pas.

---

## 11. L'ordre des étapes

Chaque étape se termine par quelque chose que le club peut ouvrir sur son téléphone.
C'est la règle : pas d'étape invisible.

| # | Étape | Ce qui marche à la fin | Durée |
|---|---|---|---|
| 1 | Projet Expo, thème extrait, migrations appliquées | L'application s'ouvre, aux bonnes couleurs, écart mesuré | 2–3 j |
| 2 | Connexion, comptes créés par l'administration | Un membre se connecte avec son numéro | 3–4 j |
| 3 | Annuaire, fiches, tuteurs | L'écran Étudiants sur les vraies données | 4–5 j |
| 4 | Casier et album | Le club publie une actualité | 4–5 j |
| 5 | **Messagerie et espace des maîtres** | Deux téléphones discutent | 6–8 j |
| 6 | Notifications sur le téléphone | Une annonce sonne | 2–3 j |
| 7 | Carte de membre et planche A4 | Le club imprime ses cartes | 2–3 j |
| 8 | APK distribué, corrections | Le club utilise l'application | 3–5 j |

Environ **six semaines** pour une personne à temps plein. L'étape 5 est la plus longue et
la plus risquée : ne la commencez pas avant que 1 à 4 tiennent debout.

**Étape 2, avant tout le reste : rejouez le test de sécurité sur le projet réel du club.**
Pas sur votre base locale. C'est là que se découvrent les écarts.

---

## 12. Les coûts réels

| Poste | Coût | Remarque |
|---|---|---|
| Supabase, offre gratuite | 0 | **Un projet inactif 7 jours est mis en pause** |
| Supabase, offre payante | ~25 $/mois | Supprime la pause. Nécessaire pour une messagerie |
| Google Play | 25 $ une fois | Pas nécessaire tant qu'on distribue l'APK |
| Compte Apple | 99 $/an | Sans objet aujourd'hui |
| Expo, builds et notifications | 0 | L'offre gratuite suffit à ce volume |

**La pause au bout de sept jours est le vrai point de budget.** Une messagerie qui s'arrête
parce que personne n'a écrit pendant une semaine de vacances scolaires est inutilisable.
Comptez les 25 dollars par mois dès la mise en service, ou dites-le clairement au club.

En attendant, `.github/workflows/reveil.yml` interroge la base une fois par jour et
l'empêche de s'endormir. Cinq secondes par jour, gratuites. Ce n'est pas un substitut à
l'abonnement — la pause n'est qu'un des quatre paliers — mais c'est le seul des quatre qui
se contourne sans payer.

### 12 bis. Ce qui se remplit, et quand — mesuré

La question a été posée en ces termes : « tôt ou tard la base sera saturée, alors on crée
quatre comptes et on bascule sur le suivant quand le précédent est plein ». La mesure dit
que ce serait résoudre le mauvais problème.

Relevé sur le projet d'essai, qui porte le même schéma :

| Poste | Occupé | Palier gratuit | Quand ce sera plein |
|---|---|---|---|
| Mise en veille | — | 7 jours sans requête | **Le premier mois creux** |
| Trafic sortant | non mesurable depuis la base | 5 Go / mois | Un mois où tout le club parcourt l'album |
| Photos et pièces jointes | 6,9 Mo | 1 Go | ~6 ans à 300 photos/an compressées |
| Base de données | 13 Mo, dont **1,26 Mo** de tables du club | 500 Mo | **~30 ans** |

Les vingt tables du club pèsent 1,26 Mo, dont l'essentiel est de la place réservée par
Postgres et non des données. Pour soixante-quatre membres — une conversation active, quatre
séances par semaine pointées, une cinquantaine de publications par an — la croissance est de
l'ordre de **quinze mégaoctets par an**. La base est la dernière chose qui se remplira.

**Pourquoi on ne partitionne pas entre plusieurs projets.** On ne joint pas deux bases :
un membre dans l'un et ses messages dans l'autre, et l'annuaire, la fiche de présence et la
messagerie cessent de fonctionner. L'authentification est par projet, donc il faudrait
demander à la connexion « vous êtes dans lequel ». Les cinquante-quatre règles d'accès
seraient à tenir en quatre exemplaires, à la main, et la première divergence est un trou de
sécurité que personne ne verra. Les migrations seraient à appliquer quatre fois, dans
l'ordre. Enfin, multiplier les projets gratuits pour contourner un quota est contraire aux
conditions d'usage de Supabase : le risque n'est pas un avertissement, c'est la disparition
des données du club.

Le seul partitionnement qui aurait du sens : **un projet par club**, le jour où
l'application servirait à plusieurs clubs. Jamais « quand le précédent est plein ».

**Ce qui a été fait à la place.** L'écran d'administration « Place et rangement » montre les
jauges et compte les lignes ; les fonctions `occupation()`, `a_ranger()` et `ranger()` de la
migration 0023 les servent. Le rangement dit ce qu'il emporte avant de l'emporter, et les
pièces jointes des messages effacés partent avec eux — sans quoi les fichiers resteraient
dans le seau, et le rangement aggraverait le problème qu'il prétend résoudre. Ne s'effacent
jamais au temps qui passe : les fiches, les actualités, les albums, et les présences.

**Le jour où le club dépassera vraiment.** Supabase, c'est du Postgres : `pg_dump` puis
`pg_restore` suffisent à déménager, vers le palier payant ou ailleurs. Rien à réécrire.

---

## 13. À trancher avant l'étape 1

Cinq questions. Aucune n'est technique, toutes changent le code.

1. **Le nom officiel.** Le logo dit « Kwoon Analamahitsy » et « Kung-fu Wáishi Malagasy »,
   l'application dit « Kung-fu Waishi Analamahitsy ». Lequel, et l'accent sur « Wáishi » ?
2. **La direction visuelle** — A · Lame, B · Souffle ou C · Tempo. Elle décide du thème,
   donc de l'étape 1.
3. **Qui peut écrire à qui.** Une conversation à deux entre mineurs, sans adulte, est une
   responsabilité pour le club. Ma proposition : conversations à deux ouvertes seulement
   vers un maître, salons de groupe toujours lisibles par un maître.
4. **L'administration a-t-elle accès à l'espace des maîtres ?** Aujourd'hui : non. C'est un
   choix à confirmer par le club.
5. **Combien de temps garde-t-on les messages ?** Sans réponse, ils s'accumulent
   indéfiniment et l'espace payant arrive plus vite que prévu.

Les questions 3 et 4 doivent être posées **au club**, pas tranchées entre nous : ce sont
des décisions de responsabilité, pas d'architecture.
