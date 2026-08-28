-- Ce que Supabase fournit et qu'un PostgreSQL nu n'a pas.
-- Sert uniquement à vérifier les migrations hors ligne.
create schema if not exists auth;

create table auth.users (id uuid primary key);

-- auth.uid() lit l'identité posée par la requête, comme le fait
-- Supabase à partir du jeton.
create or replace function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

-- Les rôles sont à l'échelle du serveur : on ne les recrée pas.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
grant usage on schema public to anon, authenticated;
-- Supabase accorde l'accès au schéma auth à ces rôles.
grant usage on schema auth to anon, authenticated;
grant select on auth.users to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
