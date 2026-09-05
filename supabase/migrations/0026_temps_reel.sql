-- ============================================================
-- 0026 — LE TEMPS RÉEL, QUI N'AVAIT JAMAIS ÉTÉ ALLUMÉ.
--
-- « Le message n'est pas en temps réel : l'utilisateur doit sortir
-- de la conversation pour voir un nouveau message. »
--
-- ------------------------------------------------------------
-- CE QUI MANQUAIT, ET POURQUOI ON NE LE VOYAIT PAS
--
-- Le code de l'application écoutait pourtant, et depuis le premier
-- jour — services/messagerie.ts ouvre un canal « salon:<id> » et
-- redemande les messages à chaque changement. Ce code est correct.
--
-- Mais PostgreSQL n'envoie les changements d'une table que si cette
-- table appartient à une PUBLICATION. Supabase en fournit une,
-- « supabase_realtime », et n'y met rien : c'est au projet de
-- déclarer ce qu'il veut diffuser. Aucune migration ne l'avait fait.
--
--     select * from pg_publication_tables
--      where pubname = 'supabase_realtime';
--     → aucune ligne
--
-- L'application s'abonnait donc à un canal parfaitement valide, qui
-- n'émettait jamais rien. AUCUNE ERREUR nulle part : ni dans la
-- console, ni dans les journaux, ni dans les essais. Le canal se
-- connecte, dit « SUBSCRIBED », et se tait pour toujours.
--
-- C'est la troisième fois dans ce projet qu'un défaut prend cette
-- forme — quelque chose qui ne marche pas SANS RIEN DIRE. Les deux
-- autres étaient la mise à jour bloquée par le CORS et le 204 avec
-- un corps.
--
-- ------------------------------------------------------------
-- CE QUE L'ON DIFFUSE, ET CE QUE L'ON NE DIFFUSE PAS
--
-- Trois tables, pas une de plus. Chaque table publiée fait grossir
-- le journal d'écriture et le trafic de tous les téléphones
-- connectés ; on ne publie donc que ce qu'un écran REGARDE
-- réellement.
--
--   · messages       — le fil ouvert, et la liste des conversations
--   · salons         — une conversation nouvelle, ou archivée
--   · notifications  — la pastille de l'accueil
--
-- Ce qu'on NE publie pas, et pourquoi : profils, présences,
-- versements, participations, photos, journal. Ce sont des écrans
-- que l'on consulte, pas des conversations que l'on suit. Les y
-- ajouter enverrait la fiche de chaque membre modifié à tous les
-- téléphones du club — du trafic, et une surface de fuite, pour une
-- fraîcheur dont personne n'a besoin.
--
-- ⚠ LES RÈGLES D'ACCÈS S'APPLIQUENT. Publier une table ne la rend
-- pas publique : Realtime vérifie, pour CHAQUE abonné et CHAQUE
-- ligne, qu'il aurait le droit de la lire. Un élève ne reçoit donc
-- rien d'un salon dont il n'est pas membre, et l'espace des maîtres
-- reste fermé. C'est la même barrière que pour une lecture
-- ordinaire, et c'est pourquoi il n'y a pas de règle à ajouter ici.
--
-- ------------------------------------------------------------
-- POURQUOI PAS « REPLICA IDENTITY FULL »
--
-- Sans elle, une suppression n'envoie que la clé de la ligne — pas
-- ses colonnes. Pour les MESSAGES cela suffit : l'application n'en
-- supprime jamais un, elle pose « supprime_le », ce qui est une
-- modification et porte donc toute la ligne.
--
-- Les NOTIFICATIONS, elles, sont bel et bien supprimées. La
-- conséquence, dite franchement : retirer une notification sur un
-- téléphone ne l'efface pas en direct sur un second téléphone du
-- même membre — il la verra disparaître à la prochaine ouverture de
-- l'écran. Cela ne vaut pas d'alourdir le journal d'écriture de la
-- table : personne n'attend qu'un rangement se propage à la seconde.
-- ============================================================

-- « add table » échoue si la table y est déjà. On ne peut pas écrire
-- « if not exists » sur cette commande ; on passe donc par le
-- catalogue, ce qui rend la migration rejouable sans erreur.
do $$
declare
  t text;
begin
  foreach t in array array['messages', 'salons', 'notifications'] loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
      raise notice 'temps réel : public.% diffusée', t;
    else
      raise notice 'temps réel : public.% l''était déjà', t;
    end if;
  end loop;
end
$$;
