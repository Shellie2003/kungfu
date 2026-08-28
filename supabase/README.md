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
