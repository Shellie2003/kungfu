-- ============================================================
-- « dernier_le » ne bougeait que pour l'administration.
--
-- Le déclencheur toucher_salon met à jour salons.dernier_le à chaque
-- message. Il était en SECURITY INVOKER : il s'exécutait donc avec
-- les droits de celui qui écrit, et la règle d'accès sur « salons »
-- ne laisse écrire QUE l'administration.
--
-- Une mise à jour qui ne touche aucune ligne ne lève pas d'erreur.
-- Le message d'un élève partait donc normalement, et le salon
-- gardait la date de son dernier message ADMINISTRATIF. Conséquences,
-- toutes silencieuses :
--
--   — la liste des conversations est triée sur dernier_le : un salon
--     où l'on vient d'écrire ne remontait pas en tête ;
--   — le compteur de non-lus se calcule en comparant lu_le à la date
--     du dernier message ; il pouvait rester à zéro.
--
-- Vérifié sur la vraie base avant d'écrire ce fichier, en se faisant
-- passer pour l'élève F04x042 : le message s'insérait, dernier_le ne
-- bougeait pas d'une microseconde.
--
-- SECURITY DEFINER le règle. Ce n'est pas un élargissement : le
-- déclencheur ne touche QUE la ligne du salon où le message vient
-- d'être accepté — donc un salon dont l'auteur est forcément membre,
-- puisque la règle d'insertion des messages l'exige. Il ne donne
-- aucun moyen d'écrire ailleurs.
--
-- search_path figé, comme toute fonction SECURITY DEFINER : sans
-- lui, un appelant peut faire pointer un nom de table vers une table
-- à lui.
-- ============================================================

create or replace function public.toucher_salon()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.salons set dernier_le = now() where id = new.salon_id;
  return new;
end
$$;

revoke all on function public.toucher_salon() from public, anon, authenticated;
