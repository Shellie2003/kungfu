-- ============================================================
-- ouvrir_direct — ce que la fonction autorise, et ce qu'elle refuse.
--
--     psql "$DATABASE_URL" -f supabase/tests/directs.sql
--
-- Pourquoi ce test existe séparément de securite.sql : celui-là
-- vérifie ce que chaque rôle VOIT ; celui-ci vérifie ce qu'une
-- fonction ÉCRIT, et ses refus. Les refus lèvent une exception,
-- qu'il faut attraper une par une — mêler les deux styles rendrait
-- l'ensemble illisible.
--
-- Tout est dans une transaction annulée à la fin : le test se rejoue
-- autant de fois qu'on veut sans laisser de trace.
-- ============================================================
\set ON_ERROR_STOP on
\pset format aligned

begin;

-- ---------- Jeu d'essai ----------
insert into auth.users (id) values
  ('aa000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000005'),
  ('aa000000-0000-0000-0000-000000000006'),
  ('aa000000-0000-0000-0000-000000000007');

insert into profils (id, compte_id, numero, nom, prenom, role, actif) values
  ('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'T001', 'MAJEUR',  'Un',     'eleve',  true),
  ('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', 'T002', 'MAJEUR',  'Deux',   'eleve',  true),
  ('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'T003', 'MINEUR',  'Trois',  'eleve',  true),
  ('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'T005', 'INCONNU', 'Cinq',   'eleve',  true),
  ('bb000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000006', 'T006', 'PARTI',   'Six',    'eleve',  false),
  ('bb000000-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000007', 'T007', 'MAITRE',  'Sept',   'maitre', true);

insert into profils_prives (profil_id, date_naissance) values
  ('bb000000-0000-0000-0000-000000000001', '1990-01-01'),
  ('bb000000-0000-0000-0000-000000000002', '1992-01-01'),
  ('bb000000-0000-0000-0000-000000000003', '2015-01-01');
-- T005 n'a AUCUNE date de naissance : elle doit compter comme
-- mineure. Ne rien savoir n'est pas une raison d'autoriser.

create temp table resultats (cas text, verdict text);
grant all on resultats to authenticated;

set role authenticated;
set request.jwt.claim.sub = 'aa000000-0000-0000-0000-000000000001';

\echo ''
\echo '=============================================='
\echo 'CE QUE T001, ÉLÈVE MAJEUR, PEUT OUVRIR'
\echo '=============================================='

do $$
declare
  v uuid;
  essais text[][] := array[
    array['un élève majeur',            'bb000000-0000-0000-0000-000000000002', 'AUTORISE'],
    array['un maître',                  'bb000000-0000-0000-0000-000000000007', 'AUTORISE'],
    array['un mineur',                  'bb000000-0000-0000-0000-000000000003', 'refuse'],
    array['une date de naissance inconnue', 'bb000000-0000-0000-0000-000000000005', 'refuse'],
    array['un membre désactivé',        'bb000000-0000-0000-0000-000000000006', 'refuse'],
    array['soi-même',                   'bb000000-0000-0000-0000-000000000001', 'refuse'],
    array['un identifiant inexistant',  '00000000-0000-0000-0000-0000000000ff', 'refuse']
  ];
  e text[];
  obtenu text;
begin
  foreach e slice 1 in array essais loop
    begin
      v := public.ouvrir_direct(e[2]::uuid);
      obtenu := 'AUTORISE';
    exception when others then
      obtenu := 'refuse';
    end;
    insert into resultats
      values (e[1], case when obtenu = e[3] then '✓ ' || obtenu
                         else '✗ ATTENDU ' || e[3] || ', OBTENU ' || obtenu end);
  end loop;
end $$;

select cas as "cas", verdict as "verdict" from resultats;

\echo ''
\echo '=============================================='
\echo 'CE QUE LA CONVERSATION OUVERTE CONTIENT'
\echo '=============================================='

-- Deux instructions séparées : les lignes écrites par une fonction
-- ne sont pas visibles aux autres sous-requêtes de la MÊME
-- instruction, qui travaille sur un instantané pris avant son début.
create temp table ouvert as
  select public.ouvrir_direct('bb000000-0000-0000-0000-000000000002') as salon;

\echo -n 'membres inscrits (attendu 2) ............ '
select count(*) from membres_salon where salon_id = (select salon from ouvert);

\echo -n 'salon visible par l''élève (attendu 1) ... '
select count(*) from salons where id = (select salon from ouvert);

\echo -n 'la personne en face (attendu MAJEUR Deux) '
select autre_nom || ' ' || autre_prenom from mes_directs
 where salon_id = (select salon from ouvert);

\echo -n 'rappelée, elle rend le MÊME salon ....... '
select public.ouvrir_direct('bb000000-0000-0000-0000-000000000002')
       = (select salon from ouvert);

rollback;
