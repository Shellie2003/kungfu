-- ============================================================
-- Qui a publié, qui a pointé.
--
-- Deux colonnes existaient depuis le premier jour et restaient
-- vides : actualites.auteur_id et versements.pointe_par. Le club
-- pouvait donc lire « le club a reçu 20 000 Ar le 3 mars » sans
-- jamais savoir qui l'avait inscrit.
--
-- Pourquoi la BASE les pose, et pas l'application
-- -----------------------------------------------
-- L'application aurait pu les envoyer. Elle connaît le profil du
-- connecté, c'était une ligne. Mais une valeur envoyée par le
-- téléphone est une valeur qu'on peut CHOISIR : il suffit de
-- rejouer la requête avec l'identifiant de quelqu'un d'autre pour
-- que la base enregistre « pointé par le trésorier » sur un
-- versement inventé.
--
-- Sur de l'argent, c'est exactement ce qu'il ne faut pas. Le
-- déclencheur ci-dessous écrase donc ce que l'appelant propose,
-- toujours, sans le lui demander. Ce n'est plus une déclaration,
-- c'est un constat.
--
-- Un DÉFAUT plutôt qu'un déclencheur n'aurait pas suffi : un défaut
-- ne s'applique que si la colonne est absente de la requête, et
-- n'empêche donc rien du tout dès qu'on la fournit.
--
-- Le nom de la colonne passe en argument : deux déclencheurs, une
-- seule fonction. Une par table aurait divergé.
-- ============================================================

create or replace function prive.poser_acteur()
returns trigger
language plpgsql
security definer
set search_path = public, prive, pg_temp
as $$
begin
  /* to_jsonb / jsonb_populate_record : la façon d'écrire une
     colonne dont le nom n'est connu qu'à l'exécution. */
  return jsonb_populate_record(
    new,
    jsonb_build_object(TG_ARGV[0], prive.mon_profil())
  );
end
$$;

revoke all on function prive.poser_acteur() from public;

drop trigger if exists actualites_auteur on public.actualites;
create trigger actualites_auteur
  before insert on public.actualites
  for each row execute function prive.poser_acteur('auteur_id');

drop trigger if exists versements_pointeur on public.versements;
create trigger versements_pointeur
  before insert on public.versements
  for each row execute function prive.poser_acteur('pointe_par');
