-- ============================================================
-- SAVOIR CE QU'ON OCCUPE, ET RANGER CE QUI NE SERT PLUS.
--
-- « Tôt ou tard la base de données sera saturée et pleine, alors on
-- doit anticiper cela. »
--
-- ------------------------------------------------------------
-- CE QUE LA MESURE A DIT, ET POURQUOI ELLE CHANGE LA RÉPONSE
--
-- Les vingt tables du club pèsent 1,26 Mo, dont l'essentiel est de la
-- place réservée par Postgres et non des données. Pour soixante-
-- quatre membres — une conversation active, quatre séances par
-- semaine pointées, une cinquantaine de publications par an — cela
-- fait de l'ordre de quinze mégaoctets PAR AN.
--
-- Le palier gratuit en offre cinq cents. La base est donc la dernière
-- chose qui se remplira, et de très loin : une trentaine d'années.
-- Ce qui sature avant, dans l'ordre :
--
--   1. la mise en veille au bout de sept jours sans requête —
--      traitée hors de la base, par une tâche planifiée ;
--   2. le trafic sortant, cinq gigaoctets par mois ;
--   3. les photos, un gigaoctet, soit six ans environ ;
--   4. la base elle-même.
--
-- D'où ce que fait cette migration, et ce qu'elle ne fait pas. Elle
-- ne partitionne rien entre plusieurs projets : on ne joint pas deux
-- bases, l'authentification est par projet, et cinquante-quatre
-- règles d'accès tenues en quatre exemplaires divergent au premier
-- oubli. Elle donne au club DE QUOI VOIR VENIR, et de quoi ranger.
-- ============================================================

-- ------------------------------------------------------------
-- CE QU'ON OCCUPE.
--
-- Une fonction plutôt qu'une vue : elle doit lire « storage.objects »
-- et « pg_database_size », que la règle d'accès d'un membre ordinaire
-- n'atteint pas. « security definer » la fait tourner avec les droits
-- de son propriétaire, et la première ligne de son corps vérifie
-- elle-même que l'appelant est bien de l'administration — sans quoi
-- on aurait ouvert une porte au lieu d'une fenêtre.
-- ------------------------------------------------------------
create or replace function public.occupation()
returns table (
  quoi text,
  octets bigint,
  lignes bigint
)
language plpgsql
security definer
set search_path = public, storage, pg_catalog, pg_temp
as $$
begin
  if prive.mon_role() <> 'admin' then
    raise exception 'Seule l''administration consulte l''occupation.';
  end if;

  return query
  -- La base entière, telle que le tableau de bord la compte : les
  -- tables du club, mais aussi les schémas de l'authentification, du
  -- stockage et du temps réel. C'est ce chiffre-là qu'on compare aux
  -- cinq cents mégaoctets, pas celui des seules tables du club.
  select 'base'::text, pg_database_size(current_database())::bigint, null::bigint
  union all
  select 'tables', coalesce(sum(pg_total_relation_size(c.oid)), 0)::bigint, null::bigint
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
  union all
  -- Les fichiers, seau par seau. C'est ici que ça grossit vraiment :
  -- une photo compressée pèse un demi-mégaoctet, une ligne de message
  -- en pèse deux cents fois moins.
  select 'seau:' || o.bucket_id,
         coalesce(sum((o.metadata->>'size')::bigint), 0)::bigint,
         count(*)::bigint
    from storage.objects o
   group by o.bucket_id
  union all
  select 'lignes:messages', null::bigint, count(*)::bigint from public.messages
  union all
  select 'lignes:presences', null::bigint, count(*)::bigint from public.presences
  union all
  select 'lignes:notifications', null::bigint, count(*)::bigint from public.notifications
  union all
  select 'lignes:journal', null::bigint, count(*)::bigint from public.journal_acces;
end $$;

revoke all on function public.occupation() from public, anon;
grant execute on function public.occupation() to authenticated;

comment on function public.occupation() is
  'Ce que le club occupe : base, tables, seaux de fichiers, lignes. Administration seule.';

-- ------------------------------------------------------------
-- CE QU'ON PEUT RANGER.
--
-- Trois choses, et TROIS SEULEMENT. Ce qui n'est pas dans cette liste
-- ne s'efface pas au temps qui passe :
--
--   · les FICHES restent, même celles des anciens — un club se
--     souvient de qui est passé ;
--   · les ACTUALITÉS et les ALBUMS restent, c'est la mémoire du club ;
--   · les PRÉSENCES restent, c'est le registre d'assiduité sur lequel
--     se décident les passages de grade. Les effacer au bout de deux
--     ans effacerait la raison d'une ceinture.
--
-- Ce qui se range :
--
--   · le JOURNAL D'ACCÈS. C'est un registre de sécurité, pas une
--     archive : savoir qui est entré dans l'espace des maîtres il y a
--     trois ans ne sert plus, et le garder indéfiniment est en
--     soi-même un risque.
--   · les NOTIFICATIONS DÉJÀ LUES. Du bruit, par définition.
--   · les MESSAGES, si et seulement si le club le demande. Par défaut
--     on n'y touche pas : une conversation est à ceux qui l'ont eue,
--     et l'effacer sans qu'on l'ait décidé serait le pire de ce que
--     cette application peut faire.
-- ------------------------------------------------------------

-- COMPTER D'ABORD. Un rangement qui ne dit pas ce qu'il va emporter
-- ne se lance qu'une fois — et l'on découvre après.
create or replace function public.a_ranger(mois_journal int default 12,
                                           mois_notifs int default 3,
                                           mois_messages int default null)
returns table (quoi text, lignes bigint)
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
begin
  if prive.mon_role() <> 'admin' then
    raise exception 'Seule l''administration range.';
  end if;

  return query
  select 'journal'::text, count(*)::bigint
    from public.journal_acces
   where mois_journal is not null
     and quand < now() - (mois_journal || ' months')::interval
  union all
  select 'notifications', count(*)::bigint
    from public.notifications
   where mois_notifs is not null
     and lue_le is not null
     and cree_le < now() - (mois_notifs || ' months')::interval
  union all
  select 'messages', count(*)::bigint
    from public.messages
   where mois_messages is not null
     and cree_le < now() - (mois_messages || ' months')::interval;
end $$;

revoke all on function public.a_ranger(int, int, int) from public, anon;
grant execute on function public.a_ranger(int, int, int) to authenticated;

-- PUIS RANGER.
--
-- Elle rend les CHEMINS des pièces jointes des messages emportés.
-- C'est le point qui compte : effacer la ligne d'un message laisse le
-- fichier dans le seau, et ce sont les fichiers qui remplissent. Une
-- fonction SQL ne sait pas supprimer dans le stockage — cela passe
-- par son interface — donc elle rend la liste, et l'application s'en
-- charge. Sans cela, le rangement aggraverait précisément le problème
-- qu'il prétend résoudre.
create or replace function public.ranger(mois_journal int default 12,
                                         mois_notifs int default 3,
                                         mois_messages int default null)
returns table (quoi text, lignes bigint, chemins text[])
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
declare
  n bigint;
  pieces text[];
begin
  if prive.mon_role() <> 'admin' then
    raise exception 'Seule l''administration range.';
  end if;

  if mois_journal is not null then
    delete from public.journal_acces
     where quand < now() - (mois_journal || ' months')::interval;
    get diagnostics n = row_count;
    quoi := 'journal'; lignes := n; chemins := null; return next;
  end if;

  if mois_notifs is not null then
    delete from public.notifications
     where lue_le is not null
       and cree_le < now() - (mois_notifs || ' months')::interval;
    get diagnostics n = row_count;
    quoi := 'notifications'; lignes := n; chemins := null; return next;
  end if;

  if mois_messages is not null then
    -- Les chemins d'abord : après la suppression, ils n'existent plus
    -- nulle part et les fichiers seraient perdus dans le seau, sans
    -- rien pour les rattacher à quoi que ce soit.
    select array_agg(piece) into pieces
      from public.messages
     where piece is not null
       and cree_le < now() - (mois_messages || ' months')::interval;

    delete from public.messages
     where cree_le < now() - (mois_messages || ' months')::interval;
    get diagnostics n = row_count;
    quoi := 'messages'; lignes := n; chemins := coalesce(pieces, '{}'); return next;
  end if;
end $$;

revoke all on function public.ranger(int, int, int) from public, anon;
grant execute on function public.ranger(int, int, int) to authenticated;

comment on function public.ranger(int, int, int) is
  'Efface le vieux journal, les notifications lues et — sur demande — les vieux messages. Rend les chemins des pièces jointes à supprimer du seau.';
