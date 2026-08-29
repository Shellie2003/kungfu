-- ============================================================
-- Kung-fu Waishi Analamahitsy — 5. Les politiques suivent
--
-- Les 43 politiques appelaient mon_role(), mon_profil() et
-- est_membre() par leur nom court, résolu par le search_path —
-- donc vers public. Supprimer les fonctions de public sans
-- qualifier les appels casserait toutes les règles d'un coup.
--
-- La réécriture se fait à partir de ce que la base contient.
-- Retranscrire 43 politiques à la main, ce serait 43 occasions de
-- se tromper sur celles qui protègent l'espace des maîtres.
-- ============================================================
do $$
declare
  r record;
  q_using text;
  q_check text;
  cmd text;
  roles text;
begin
  for r in
    select p.polname, c.relname, p.polpermissive, p.polcmd, p.polroles,
           pg_get_expr(p.polqual, p.polrelid) as qual,
           pg_get_expr(p.polwithcheck, p.polrelid) as wcheck
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
  loop
    cmd := case r.polcmd when 'r' then 'select' when 'a' then 'insert'
                         when 'w' then 'update' when 'd' then 'delete' else 'all' end;
    roles := array_to_string(array(select rolname from pg_roles where oid = any(r.polroles)), ', ');

    q_using := regexp_replace(coalesce(r.qual, ''),
      '\m(mon_role|mon_profil|est_membre)\(', 'prive.\1(', 'g');
    q_check := regexp_replace(coalesce(r.wcheck, ''),
      '\m(mon_role|mon_profil|est_membre)\(', 'prive.\1(', 'g');

    execute format('drop policy %I on public.%I', r.polname, r.relname);
    execute format('create policy %I on public.%I as %s for %s to %s %s %s',
      r.polname, r.relname,
      case when r.polpermissive then 'permissive' else 'restrictive' end,
      cmd, roles,
      case when q_using <> '' then 'using (' || q_using || ')' else '' end,
      case when q_check <> '' then 'with check (' || q_check || ')' else '' end
    );
  end loop;
end $$;

-- Plus référencées, et leur seule présence les exposait à l'API.
drop function if exists public.mon_profil();
drop function if exists public.mon_role();
drop function if exists public.est_membre(uuid);
drop function if exists public.figer_profil();
