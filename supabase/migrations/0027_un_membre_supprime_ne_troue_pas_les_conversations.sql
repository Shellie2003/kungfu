-- ============================================================
-- 0027 — SUPPRIMER UN MEMBRE NE DOIT PAS TROUER LES CONVERSATIONS
--        DES AUTRES.
--
-- ------------------------------------------------------------
-- L'ÉCART, TROUVÉ EN NETTOYANT LA BASE
--
-- La fonction « comptes » dit ceci, dans son action « supprimer » :
--
--     « Ce qui reste : les messages écrits, dont l'auteur devient
--       nul — faire disparaître une conversation à laquelle d'autres
--       ont participé n'est pas ce qu'on demande en supprimant un
--       membre. »
--
-- C'est la bonne intention. Ce n'est pas ce que faisait la base :
--
--     auteur_id uuid not null references profils (id) on delete CASCADE
--
-- Supprimer un membre effaçait donc TOUS ses messages, y compris au
-- milieu de conversations de groupe. Le fil des autres se refermait
-- sur des trous, sans laisser de trace de ce qui manquait.
--
-- ⚠ ET CELA NE SE SERAIT VU QU'UNE FOIS FAIT. La suppression est
-- définitive et n'a pas de retour en arrière : le club l'aurait
-- découvert après avoir supprimé un membre, sur une conversation
-- qu'il ne pouvait plus reconstituer.
--
-- C'est le SCHÉMA qu'on corrige, et non le commentaire : entre les
-- deux, c'est l'intention écrite qui est juste. Un membre qui part
-- emporte sa fiche, pas la mémoire du club.
--
-- ------------------------------------------------------------
-- TROIS PIÈGES ENCHAÎNÉS, ET LE DERNIER EST LE PLUS SOURNOIS
--
-- 1. « auteur_id » est « not null ». Un « set null » y échouerait.
--    On lève la contrainte — un auteur nul signifie désormais
--    « membre supprimé », ce que l'application affiche déjà : elle
--    accepte un auteur absent depuis le premier jour, parce qu'un
--    élève ne voit pas la fiche de tout le monde.
--
-- 2. « on delete set null » n'est pas une suppression mais une MISE À
--    JOUR de la ligne. Or le déclencheur « figer_message » interdit
--    précisément de changer l'auteur d'un message :
--
--        raise exception 'le salon, l''auteur et la date d''un
--                         message ne se modifient pas';
--
--    Laissé tel quel, il aurait fait ÉCHOUER toute suppression de
--    membre. On l'autorise donc pour cette transition-là, et pour
--    elle seule : d'un auteur vers nul, jamais d'un auteur vers un
--    autre. Réécrire l'histoire reste impossible.
--
-- 3. Le même déclencheur pose « modifie_le := now() ». Sans garde, la
--    suppression d'un membre aurait marqué « modifié » des dizaines
--    de messages que personne n'a touchés — et l'application AFFICHE
--    cette marque, pour dire qu'un message a été corrigé après coup.
--    Le club aurait lu une réécriture là où il n'y avait qu'un
--    départ. On ne touche donc pas à « modifie_le » dans ce cas.
-- ============================================================

-- 1. L'auteur peut être absent : c'est ce que veut dire « le membre
--    a été supprimé ».
alter table public.messages alter column auteur_id drop not null;

-- 2. Le lien ne détruit plus, il oublie.
alter table public.messages drop constraint messages_auteur_id_fkey;
alter table public.messages
  add constraint messages_auteur_id_fkey
  foreign key (auteur_id) references public.profils (id) on delete set null;

-- 3. Le déclencheur laisse passer CE changement-là, et lui seul.
create or replace function figer_message()
returns trigger
language plpgsql
as $$
declare
  -- Vrai uniquement pour « un auteur devient nul », c'est-à-dire le
  -- geste du lien ci-dessus quand un membre est supprimé.
  depart boolean := old.auteur_id is not null and new.auteur_id is null;
begin
  if new.salon_id is distinct from old.salon_id
     or new.cree_le is distinct from old.cree_le
     or (new.auteur_id is distinct from old.auteur_id and not depart) then
    raise exception 'le salon, l''auteur et la date d''un message ne se modifient pas';
  end if;

  -- ⚠ PAS DE « modifié » POUR UN DÉPART. Le message est intact ; c'est
  -- son auteur qui n'est plus là. Marquer la ligne ferait lire au club
  -- une correction qui n'a jamais eu lieu.
  if not depart then
    new.modifie_le := now();
  end if;

  return new;
end $$;

comment on constraint messages_auteur_id_fkey on public.messages is
  'set null, et non cascade : un membre qui part emporte sa fiche, pas la mémoire du club. Voir 0027.';
