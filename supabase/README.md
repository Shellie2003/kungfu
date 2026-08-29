# La base

Trois migrations et un test. Le test n'est pas une formalité : il a déjà trouvé une faille
— un élève pouvait se nommer maître lui-même, parce qu'une règle d'accès travaille par
ligne et non par colonne. **Rejouez-le à chaque fois que vous touchez à `0003_securite.sql`.**

## Les fichiers

| Fichier | Ce qu'il fait |
|---|---|
| `migrations/0001_club.sql` | Membres, tuteurs, actualités, albums |
| `migrations/0002_messagerie.sql` | Salons, messages, signalements, journal |
| `migrations/0003_securite.sql` | **Les règles d'accès.** C'est ce fichier qui protège l'espace des maîtres |
| `migrations/0004_fonctions_hors_api.sql` | Sort les fonctions de service du schéma publié par l'API |
| `migrations/0005_politiques_vers_prive.sql` | Qualifie les 43 politiques vers le nouveau schéma |
| `tests/securite.sql` | Se fait passer pour un élève, un maître, l'administration, et vérifie ce que chacun voit |
| `tests/bouchon_supabase.sql` | `auth.uid()` et les rôles, pour tester hors ligne |

## Appliquer sur le projet Supabase du club

```bash
supabase link --project-ref <ref-du-projet>
supabase db push
```

Les migrations ne créent **aucun** compte et **aucune** donnée. Le premier compte
administrateur se crée à la main dans le tableau de bord, puis :

```sql
insert into profils (id, numero, nom, prenom, role)
values ('<uuid du compte>', 'WA-0001', 'NOM', 'Prénom', 'admin');
```

## Rejouer le test

Sur un PostgreSQL local, sans Supabase :

```bash
createdb waishi_test
psql -d waishi_test -f supabase/tests/bouchon_supabase.sql
psql -d waishi_test -f supabase/migrations/0001_club.sql
psql -d waishi_test -f supabase/migrations/0002_messagerie.sql
psql -d waishi_test -f supabase/migrations/0003_securite.sql
psql -d waishi_test -f supabase/tests/securite.sql | grep FAILLE
```

**La sortie doit être vide.** Une ligne `FAILLE` signifie qu'un membre accède à ce qui ne
le regarde pas.

Le bouchon remplace ce que Supabase fournit et qu'un PostgreSQL nu n'a pas : la fonction
`auth.uid()` et les rôles `anon` et `authenticated`. Il ne sert qu'au test, il n'est jamais
appliqué au projet du club.

## Le projet d'essai

Un projet **jetable** existe, sur un compte personnel :
`znotzkfwukvvtaqfrozn`, région `ap-southeast-1`. Les cinq migrations y sont appliquées et
le test y a été rejoué. Trois comptes d'essai — `F04x001` administration, `F04x045` maître,
`F04x042` élève — plus une fiche **sans compte**, pour vérifier qu'un élève sans téléphone
figure bien à l'annuaire.

**Aucune donnée réelle du club ne doit entrer dans ce projet.** Des dates de naissance de
mineurs sur un compte personnel, ce serait exactement ce que l'architecture cherche à
éviter. Le projet du club sera créé au déploiement final, sur son propre compte.

## Ce que le contrôle de Supabase a trouvé

Le linter de Supabase, lancé sur le projet réel, a remonté **neuf avertissements**. Trois
étaient de vrais défauts, corrigés par les migrations 0004 et 0005 :

**Les fonctions de service étaient publiées par l'API.** `mon_role`, `mon_profil`,
`est_membre` et surtout `figer_profil` — un déclencheur — vivaient dans `public`, donc
appelables par `/rest/v1/rpc/…`. Elles sont passées dans un schéma `prive` que PostgREST ne
publie pas. Les règles d'accès les appellent toujours ; l'extérieur, non.

**Trois fonctions n'avaient pas de `search_path` fixe** — `prochain_numero`,
`figer_message`, `toucher_salon`. Sans lui, un appelant peut faire pointer un nom de table
vers une table à lui.

**`journaliser_acces` bornait mal son entrée** : un membre pouvait remplir le journal du
texte de son choix. Elle tronque désormais à 120 caractères. Elle reste appelable par
l'application — c'est sa raison d'être, et l'avertissement qui subsiste est assumé.

Reste un avertissement à traiter dans le tableau de bord, sur le projet du club :
**activer la protection contre les mots de passe compromis** (Authentication → Policies).

## Deux pièges

**La récursion.** Une règle sur `membres_salon` qui interroge `membres_salon` tourne à
l'infini. D'où `est_membre()` en `security definer`, qui ne repasse pas par les règles.
C'est l'erreur la plus courante sur ce type de base.

**Le `search_path`.** Toute fonction `security definer` doit fixer son `search_path`. Sans
cela, un utilisateur peut faire pointer un nom de table vers une table à lui, et la
fonction s'exécute sur ses données avec les droits du propriétaire.

## Ce que la base ne protège pas

Un maître peut faire une capture d'écran de l'espace des maîtres. La confidentialité
technique s'arrête à l'écran ; au-delà, elle tient aux personnes. Et `journal_acces` est un
journal déclaratif : c'est l'application qui appelle `journaliser_acces()` en entrant.
PostgreSQL ne journalise pas les lectures. Le journal dissuade et documente ; il ne prouve
pas.
