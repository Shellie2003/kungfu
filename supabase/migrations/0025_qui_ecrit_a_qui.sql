-- ============================================================
-- Kung-fu Waishi Analamahitsy — 25. Qui écrit à qui, et qui lit quoi.
--
-- « Les élèves peuvent envoyer des messages entre eux, aux maîtres,
-- et les maîtres peuvent envoyer aussi ; mais personne ne peut voir
-- les contenus de l'espace maître et gradé à part eux et ceux qui
-- ont l'autorisation. »
--
-- C'est la réponse à la question que la maquette laissait ouverte
-- depuis le premier jour — « msg-qui : à décider, élève vers élève,
-- ou seulement vers un maître ? ». Le club a tranché.
--
-- Deux moitiés, et elles ne se séparent pas : on OUVRE la
-- messagerie entre membres, et l'on FERME ce qui restait entrouvert
-- du côté de la lecture. Ouvrir sans fermer serait pire que de ne
-- rien faire.
-- ============================================================


-- ============================================================
-- 1. LA MESSAGERIE S'OUVRE ENTRE TOUS LES MEMBRES.
--
-- CE QUI CHANGE
--
-- La migration 0006 refusait une conversation entre deux élèves si
-- l'un des deux était mineur — ou de date de naissance inconnue, ce
-- qui est le cas de la plupart des fiches. En pratique, presque
-- aucun élève ne pouvait écrire à un autre.
--
-- Ce n'était pas une position technique : c'était une décision que
-- je ne pouvais pas prendre à la place du club, et la règle la plus
-- prudente en attendant. Le fichier 0006 le disait mot pour mot :
-- « le club peut assouplir cela d'une ligne le jour où il tranche ».
-- Il a tranché ; voici la ligne.
--
-- CE QUI PROTÈGE MAINTENANT, ET QUI N'EST PLUS LA MÊME CHOSE
--
-- Avant, la protection était la PRÉVENTION : la conversation
-- n'existait pas. Maintenant, elle est le SIGNALEMENT : n'importe
-- quel membre peut remonter un message à l'administration, qui le
-- voit avec son contexte dans l'écran de modération.
--
-- Cela vaut la peine d'être dit clairement au club, parce que c'est
-- un changement de nature : on passe d'un mur à une surveillance. Un
-- mur ne demande à personne d'être attentif ; un signalement, si.
-- ============================================================
create or replace function public.ouvrir_direct(p_autre uuid)
returns uuid
language plpgsql
security definer
set search_path = public, prive, pg_temp
as $$
declare
  v_moi   uuid;
  v_salon uuid;
begin
  v_moi := prive.mon_profil();
  if v_moi is null then
    raise exception 'aucune fiche rattachée à ce compte';
  end if;
  if p_autre = v_moi then
    raise exception 'on n''ouvre pas une conversation avec soi-même';
  end if;

  -- La personne existe et est active. Un membre désactivé ne reçoit
  -- plus de messages : c'est le sens de la désactivation, et c'est
  -- le seul refus qui subsiste.
  if not exists (select 1 from profils where id = p_autre and actif) then
    raise exception 'membre introuvable ou désactivé';
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

comment on function public.ouvrir_direct(uuid) is
  'Ouvre (ou retrouve) la conversation directe entre l''appelant et p_autre. '
  'Ouverte à tous les membres actifs depuis la décision du club (migration 0025).';


-- ============================================================
-- 2. CE QUI RESTAIT ENTROUVERT, ET QU'IL FAUT FERMER MAINTENANT.
--
-- ------------------------------------------------------------
-- CE QUI ÉTAIT DÉJÀ BON — vérifié sur la base, pas supposé
--
-- La lecture des messages est gouvernée par une seule règle,
-- « lire les messages de mes salons », qui dit « est_membre(salon) »
-- et rien d'autre. Aucune exception pour l'administration. Mesuré en
-- se faisant passer pour chacun :
--
--   · un administrateur non membre lit une conversation privée
--       → 0 message
--   · un administrateur non membre lit l'espace des maîtres
--       → 0 message
--   · un élève lit l'espace des maîtres
--       → 0 message
--
-- C'est exactement ce que le club demande, et c'était déjà le cas.
--
-- ------------------------------------------------------------
-- CE QUI NE L'ÉTAIT PAS
--
-- La règle « l'administration inscrit » sur « membres_salon » est un
-- « for all » sans restriction de type. Un administrateur pouvait
-- donc S'AJOUTER LUI-MÊME à n'importe quel salon — et devenir
-- membre, c'est devenir lecteur. Mesuré aussi :
--
--   · un administrateur s'ajoute à une conversation privée
--       → 1 ligne insérée
--   · il relit la même conversation
--       → 1 message, en clair
--
-- Tant que deux élèves ne pouvaient pas s'écrire, la portée était
-- limitée. Elle ne l'est plus : le club vient d'ouvrir la messagerie
-- entre tous ses membres, dont des mineurs. « Personne ne peut voir
-- les contenus à part eux » ne serait pas vrai avec cette porte-là.
--
-- ------------------------------------------------------------
-- CE QU'ON FERME, ET CE QU'ON NE FERME PAS
--
-- On ferme le salon DIRECT : plus personne n'y entre par
-- l'administration. Il n'y a que deux façons d'être dans une
-- conversation à deux — l'avoir ouverte, ou l'avoir reçue — et les
-- deux passent par « ouvrir_direct », qui inscrit les deux
-- personnes lui-même.
--
-- On NE ferme PAS les autres : le salon des maîtres, ceux par grade,
-- ceux par événement et celui du club se peuplent par
-- l'administration, et c'est justement cela, « ceux qui ont
-- l'autorisation ». Un nouveau maître doit pouvoir entrer dans le
-- fil des maîtres ; personne ne doit pouvoir entrer dans la
-- conversation de deux élèves.
--
-- ⚠ Ce que cela ne protège pas, et qu'il faut dire : la CLÉ DE
-- SERVICE passe outre les règles d'accès. Elle ne quitte jamais le
-- serveur, et c'est ce qui la retient — pas une règle SQL. De même,
-- l'administration voit toujours qu'un salon direct EXISTE (une
-- ligne sans titre) ; elle ne voit ni qui y est — « les membres de
-- mes salons » ne montre que les siens — ni ce qui s'y dit.
-- ============================================================
drop policy if exists "l'administration inscrit" on public.membres_salon;

create policy "l'administration inscrit" on public.membres_salon
  for all to authenticated
  using (
    prive.mon_role() = 'admin'
    and (select type from public.salons where id = salon_id) <> 'direct'
  )
  with check (
    prive.mon_role() = 'admin'
    and (select type from public.salons where id = salon_id) <> 'direct'
  );

comment on policy "l'administration inscrit" on public.membres_salon is
  'L''administration peuple les salons du club, des grades, des événements et '
  'des maîtres. JAMAIS une conversation à deux : on y entre en l''ouvrant ou en '
  'la recevant, et par aucun autre chemin.';
