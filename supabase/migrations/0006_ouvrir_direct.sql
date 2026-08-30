-- ============================================================
-- ouvrir_direct — commencer une conversation à deux.
--
-- Le problème
-- -----------
-- Créer un salon et y inscrire quelqu'un sont des actes réservés à
-- l'administration, et pour de bonnes raisons : c'est ce qui empêche
-- un élève de s'inscrire tout seul dans l'espace des maîtres.
--
-- Mais cela interdisait aussi d'écrire à quelqu'un. La messagerie
-- affichait les conversations existantes sans qu'aucune ne puisse
-- naître.
--
-- La solution, et pourquoi celle-là
-- ---------------------------------
-- On n'assouplit PAS la règle générale — elle protège l'espace des
-- maîtres. On ouvre une porte étroite : une fonction qui fait
-- exactement une chose, un salon DIRECT entre l'appelant et une
-- autre personne, et qui vérifie tout elle-même.
--
-- SECURITY DEFINER lui donne les droits nécessaires ; le
-- search_path est figé pour qu'on ne puisse pas lui faire appeler
-- autre chose en glissant un schéma devant.
--
-- La question des mineurs
-- -----------------------
-- Le club compte des enfants. Laisser n'importe quel membre écrire
-- en privé à n'importe quel autre est une décision qui appartient au
-- club, pas au développeur — et elle n'a pas encore été prise.
--
-- En attendant, la règle posée ici est la plus prudente qui laisse
-- la fonctionnalité utile :
--
--   • tout le monde peut écrire à un maître ou à l'administration ;
--   • deux membres ordinaires ne peuvent s'écrire que si AUCUN des
--     deux n'est mineur ;
--   • une date de naissance inconnue compte comme mineure.
--
-- Le club peut assouplir cela d'une ligne le jour où il tranche. Ce
-- qu'il ne faut pas faire, c'est ouvrir par défaut et corriger après
-- un incident.
-- ============================================================

create or replace function public.ouvrir_direct(p_autre uuid)
returns uuid
language plpgsql
security definer
set search_path = public, prive, pg_temp
as $$
declare
  v_moi     uuid;
  v_salon   uuid;
  v_role_a  role_membre;
  v_role_b  role_membre;
  v_mineur  boolean;
begin
  v_moi := prive.mon_profil();
  if v_moi is null then
    raise exception 'aucune fiche rattachée à ce compte';
  end if;
  if p_autre = v_moi then
    raise exception 'on n''ouvre pas une conversation avec soi-même';
  end if;

  -- La personne existe et est active. Un membre désactivé ne reçoit
  -- plus de messages : c'est le sens de la désactivation.
  select role into v_role_b from profils where id = p_autre and actif;
  if not found then
    raise exception 'membre introuvable ou désactivé';
  end if;
  select role into v_role_a from profils where id = v_moi;

  -- Entre deux membres ordinaires, on regarde l'âge. Écrire à un
  -- maître ou à l'administration reste toujours possible : c'est
  -- justement le canal par lequel un enfant signale un problème.
  if v_role_a = 'eleve' and v_role_b = 'eleve' then
    select bool_or(
             pp.date_naissance is null
             or pp.date_naissance > current_date - interval '18 years'
           )
      into v_mineur
      from profils p
      left join profils_prives pp on pp.profil_id = p.id
     where p.id in (v_moi, p_autre);

    if coalesce(v_mineur, true) then
      raise exception 'une conversation privée entre élèves demande que les deux soient majeurs — passez par un maître';
    end if;
  end if;

  -- Une conversation existe déjà ? On la rend. Sans cela, chaque
  -- appui sur « écrire » créerait un salon de plus et le fil se
  -- disperserait en doublons.
  select s.id into v_salon
    from salons s
    join membres_salon a on a.salon_id = s.id and a.profil_id = v_moi
    join membres_salon b on b.salon_id = s.id and b.profil_id = p_autre
   where s.type = 'direct'
   limit 1;

  if v_salon is not null then
    return v_salon;
  end if;

  insert into salons (type, titre) values ('direct', null)
  returning id into v_salon;

  insert into membres_salon (salon_id, profil_id)
  values (v_salon, v_moi), (v_salon, p_autre);

  return v_salon;
end;
$$;

-- Seuls les comptes connectés l'appellent. « public » et « anon »
-- n'y ont pas accès : une fonction SECURITY DEFINER ouverte à
-- l'anonyme serait une porte dérobée.
revoke all on function public.ouvrir_direct(uuid) from public, anon;
grant execute on function public.ouvrir_direct(uuid) to authenticated;

comment on function public.ouvrir_direct(uuid) is
  'Ouvre (ou retrouve) la conversation directe entre l''appelant et p_autre. '
  'Refuse entre deux élèves si l''un des deux est mineur ou de date de naissance inconnue.';

-- ------------------------------------------------------------
-- Un salon direct n'a pas de titre en base : il porte le nom de
-- l'autre personne, qui n'est pas la même pour les deux. L'écran le
-- compose donc à la lecture, et a besoin de savoir QUI est en face.
--
-- La règle « les membres de mes salons » l'autorise déjà ; cette vue
-- évite seulement à l'application de refaire la jointure partout.
-- ------------------------------------------------------------
create or replace view public.mes_directs
with (security_invoker = on)
as
  select
    s.id            as salon_id,
    p.id            as autre_id,
    p.nom           as autre_nom,
    p.prenom        as autre_prenom,
    p.photo         as autre_photo
  from salons s
  join membres_salon m on m.salon_id = s.id
  join profils p       on p.id = m.profil_id
 where s.type = 'direct'
   and p.id <> prive.mon_profil();

comment on view public.mes_directs is
  'Pour chaque conversation directe, la personne EN FACE. '
  'security_invoker : la vue applique les règles d''accès de celui qui la lit, '
  'et non celles de son propriétaire — sans quoi elle exposerait tous les salons.';

grant select on public.mes_directs to authenticated;
