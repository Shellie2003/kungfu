-- ============================================================
-- Les présences.
--
-- La carte de membre porte un code QR et annonce, en toutes
-- lettres : « Présenté à l'entraînement pour pointer la présence ».
-- Il n'existait ni table, ni écran, ni scanner. C'était une
-- promesse imprimée sur la carte et tenue nulle part.
--
-- Ce que ce fichier décide, et pourquoi
-- -------------------------------------
--
-- 1. SEUL L'ENCADREMENT POINTE. Un élève ne peut pas s'inscrire
--    présent lui-même, et ce n'est pas une méfiance de principe :
--    une présence sert à savoir qui était là le jour où quelque
--    chose est arrivé, et à décider d'un passage de grade. Une
--    présence qu'on se donne à soi-même ne vaut rien. C'est la même
--    raison qui fait que le membre ne pointe pas ses propres
--    versements.
--
-- 2. QUI A POINTÉ EST POSÉ PAR LA BASE, comme pour les versements —
--    on réemploie le déclencheur de la migration 0009. Une valeur
--    envoyée par le téléphone est une valeur qu'on peut choisir.
--
-- 3. CHACUN VOIT LA SIENNE, l'encadrement voit tout. Un élève n'a
--    pas à savoir qui d'autre était absent mardi : c'est une
--    information sur la vie de quelqu'un d'autre, et le club compte
--    des mineurs. Le club peut ouvrir cela d'une ligne s'il le
--    souhaite ; l'inverse, après coup, ne rattrape rien.
--
-- 4. L'ABSENCE N'EST PAS UNE LIGNE. Une ligne veut dire « était
--    là », avec une nuance : à l'heure, en retard, ou excusé.
--    Enregistrer les absents obligerait à écrire soixante-quatre
--    lignes à chaque séance pour en cocher douze.
--
-- 5. UNE SEULE PRÉSENCE PAR MEMBRE, PAR JOUR ET PAR CRÉNEAU. Le
--    scanner lit un code deux fois plus souvent qu'on ne croit — une
--    main qui tremble, un élève qui repasse. « nulls not distinct »
--    est nécessaire : sans lui, deux pointages hors créneau le même
--    jour passeraient tous les deux, PostgreSQL considérant que deux
--    NULL sont différents.
-- ============================================================

create type statut_presence as enum ('present', 'retard', 'excuse');

create table public.presences (
  id          uuid primary key default gen_random_uuid(),
  profil_id   uuid not null references public.profils (id) on delete cascade,
  seance_le   date not null default current_date,
  /* Le créneau, quand la séance en est un. Une compétition ou un
     stage n'en a pas, d'où le « null » autorisé. */
  horaire_id  uuid references public.horaires (id) on delete set null,
  statut      statut_presence not null default 'present',
  note        text,
  pointe_par  uuid references public.profils (id),
  cree_le     timestamptz not null default now(),

  constraint presences_une_par_seance
    unique nulls not distinct (profil_id, seance_le, horaire_id)
);

/* Les deux lectures que l'application fait vraiment : l'historique
   d'un membre, et la feuille d'une séance. */
create index presences_profil_idx on public.presences (profil_id, seance_le desc);
create index presences_seance_idx on public.presences (seance_le desc);

/* Qui a pointé : posé par la base, jamais par le téléphone. */
create trigger presences_pointeur
  before insert on public.presences
  for each row execute function prive.poser_acteur('pointe_par');

alter table public.presences enable row level security;

create policy "je vois mes présences"
  on public.presences
  for select
  to authenticated
  using (profil_id = prive.mon_profil());

create policy "l'encadrement voit les présences"
  on public.presences
  for select
  to authenticated
  using (prive.mon_role() in ('maitre', 'admin'));

/* Une seule règle pour les trois écritures : ce sont les mêmes
   personnes, et les séparer aurait fini par diverger. */
create policy "l'encadrement pointe"
  on public.presences
  for all
  to authenticated
  using (prive.mon_role() in ('maitre', 'admin'))
  with check (prive.mon_role() in ('maitre', 'admin'));

/* ------------------------------------------------------------
   Pointer par matricule.

   Le code QR de la carte encode le MATRICULE, pas un identifiant
   interne : il est public par nature, déjà écrit en toutes lettres
   sur la carte. Le scanner rend donc « F04x042 », et il faut le
   traduire en fiche.

   Pourquoi une fonction plutôt que deux requêtes depuis
   l'application : entre la lecture de la fiche et l'écriture de la
   présence, l'application aurait à porter la règle « refuser un
   membre inactif ». Une règle portée par l'application est une règle
   qu'on contourne en parlant à la base directement. Elle est ici,
   une fois.

   Idempotente : rappelée sur le même membre, le même jour et le même
   créneau, elle met à jour plutôt que d'échouer. Le scanner relit un
   code plus souvent qu'on ne croit, et un message d'erreur au
   deuxième passage ferait douter de la première lecture.
   ------------------------------------------------------------ */
create or replace function public.pointer_presence(
  p_matricule text,
  p_horaire   uuid default null,
  p_statut    statut_presence default 'present'
)
returns uuid
language plpgsql
security definer
set search_path = public, prive, pg_temp
as $$
declare
  v_profil uuid;
  v_actif  boolean;
  v_id     uuid;
begin
  if prive.mon_role() not in ('maitre', 'admin') then
    raise exception 'seul l''encadrement pointe les présences';
  end if;

  select id, actif into v_profil, v_actif
  from public.profils
  where upper(numero) = upper(btrim(p_matricule));

  if v_profil is null then
    raise exception 'aucun membre ne porte le matricule %', p_matricule;
  end if;
  if not v_actif then
    raise exception 'ce membre n''est plus actif';
  end if;

  insert into public.presences (profil_id, horaire_id, statut)
  values (v_profil, p_horaire, p_statut)
  on conflict (profil_id, seance_le, horaire_id)
    do update set statut = excluded.statut, pointe_par = prive.mon_profil()
  returning id into v_id;

  return v_id;
end
$$;

revoke all on function public.pointer_presence(text, uuid, statut_presence)
  from public, anon;
grant execute on function public.pointer_presence(text, uuid, statut_presence)
  to authenticated;
