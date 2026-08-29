-- ============================================================
-- Kung-fu Waishi Analamahitsy — 4. Les fonctions hors de l'API
--
-- Défaut trouvé par le contrôle de sécurité de Supabase, sur le
-- premier projet réel : les fonctions de service vivaient dans
-- « public », donc publiées par l'API REST. N'importe quel membre
-- connecté pouvait appeler /rest/v1/rpc/mon_role — et, plus grave,
-- /rest/v1/rpc/figer_profil, un déclencheur qui n'a rien à faire là.
--
-- Elles passent dans un schéma que PostgREST ne publie pas. Les
-- règles d'accès les appellent toujours ; l'extérieur, non.
-- ============================================================

create schema if not exists prive;
revoke all on schema prive from public;
grant usage on schema prive to authenticated;

create or replace function prive.mon_profil()
returns uuid language sql stable security definer set search_path = public, pg_temp
as $$ select id from public.profils where compte_id = auth.uid() $$;

create or replace function prive.mon_role()
returns role_membre language sql stable security definer set search_path = public, pg_temp
as $$ select role from public.profils where compte_id = auth.uid() $$;

create or replace function prive.est_membre(p_salon uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.membres_salon
    where salon_id = p_salon and profil_id = prive.mon_profil()
  )
$$;

create or replace function prive.figer_profil()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if prive.mon_role() = 'admin' then
    return new;
  end if;
  if new.role      is distinct from old.role
  or new.numero    is distinct from old.numero
  or new.grade_id  is distinct from old.grade_id
  or new.actif     is distinct from old.actif
  or new.compte_id is distinct from old.compte_id then
    raise exception
      'le rôle, le numéro, le grade, le compte et l''activation ne se modifient que par l''administration';
  end if;
  return new;
end $$;

revoke all on function prive.mon_profil(), prive.mon_role(),
  prive.est_membre(uuid), prive.figer_profil() from public;
grant execute on function prive.mon_profil(), prive.mon_role(),
  prive.est_membre(uuid) to authenticated;

drop trigger profils_figer on public.profils;
create trigger profils_figer
  before update on public.profils
  for each row execute function prive.figer_profil();

-- ------------------------------------------------------------
-- Les trois fonctions dont le search_path n'était pas fixé. Sans
-- lui, un appelant peut faire pointer un nom de table vers une
-- table à lui, et la fonction s'exécute sur ses données.
-- ------------------------------------------------------------
create or replace function public.prochain_numero()
returns text language sql security definer set search_path = public, pg_temp
as $$
  select coalesce((select valeur from reglages where cle = 'prefixe_matricule'), 'F04x')
      || lpad(nextval('numero_membre')::text, 3, '0')
$$;
revoke all on function public.prochain_numero() from public, anon, authenticated;

create or replace function public.figer_message()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  if new.salon_id is distinct from old.salon_id
     or new.auteur_id is distinct from old.auteur_id
     or new.cree_le is distinct from old.cree_le then
    raise exception 'le salon, l''auteur et la date d''un message ne se modifient pas';
  end if;
  new.modifie_le := now();
  return new;
end $$;

create or replace function public.toucher_salon()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  update salons set dernier_le = new.cree_le where id = new.salon_id;
  return new;
end $$;

-- ------------------------------------------------------------
-- journaliser_acces reste dans public : l'application doit pouvoir
-- l'appeler par RPC, c'est sa raison d'être. Le contrôle de
-- sécurité la signale, et c'est voulu. On borne en revanche ce
-- qu'elle accepte : sans cela un membre remplirait le journal du
-- texte de son choix.
-- ------------------------------------------------------------
create or replace function public.journaliser_acces(p_salon uuid, p_quoi text)
returns void language sql security definer set search_path = public, pg_temp
as $$
  insert into public.journal_acces (profil_id, salon_id, quoi)
  values (prive.mon_profil(), p_salon, left(coalesce(p_quoi, ''), 120))
$$;
revoke all on function public.journaliser_acces(uuid, text) from public, anon;
grant execute on function public.journaliser_acces(uuid, text) to authenticated;
