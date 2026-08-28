\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- ---------- Jeu d'essai, posé en tant que propriétaire ----------
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),   -- Nirina, élève
  ('22222222-2222-2222-2222-222222222222'),   -- Hery, maître
  ('33333333-3333-3333-3333-333333333333');   -- l'administration

insert into profils (id, numero, nom, prenom, role) values
  ('11111111-1111-1111-1111-111111111111', 'WA-0042', 'RAKOTONDRABE', 'Nirina', 'eleve'),
  ('22222222-2222-2222-2222-222222222222', 'WA-0045', 'RABEMANANJARA', 'Hery', 'maitre'),
  ('33333333-3333-3333-3333-333333333333', 'WA-0001', 'RAHARISOA', 'Fanja', 'admin');

insert into profils_prives (profil_id, date_naissance) values
  ('11111111-1111-1111-1111-111111111111', '2012-04-18');   -- un mineur

insert into salons (id, type, titre) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'club', 'Tout le club'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'maitres', 'Espace des maîtres');

insert into membres_salon (salon_id, profil_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');

insert into messages (salon_id, auteur_id, texte) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'L''entraînement de mercredi est maintenu.'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Passage de grade : je propose de reporter deux candidats.');

\echo '=============================================='
\echo 'CE QUE VOIT NIRINA, ÉLÈVE'
\echo '=============================================='
begin;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

\echo -n 'salons visibles (attendu 1) ......... '
select count(*) from salons;
\echo -n 'messages visibles (attendu 1) ....... '
select count(*) from messages;
\echo -n 'messages des maîtres (attendu 0) .... '
select count(*) from messages where salon_id = 'aaaaaaaa-0000-0000-0000-000000000002';
\echo -n 'le salon des maitres nommé (attendu 0) '
select count(*) from salons where type = 'maitres';
\echo -n 'dates de naissance vues (attendu 1, la sienne) '
select count(*) from profils_prives;

\echo -n 'écrire dans le salon des maîtres .... '
savepoint s1;
do $$ begin
  insert into messages (salon_id, auteur_id, texte)
  values ('aaaaaaaa-0000-0000-0000-000000000002',
          '11111111-1111-1111-1111-111111111111', 'je passe par la fenêtre');
  raise notice 'FAILLE : l''insertion a réussi';
exception when insufficient_privilege or others then
  raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s1;

\echo -n 'se déclarer maître .................. '
savepoint s2;
do $$ begin
  update profils set role = 'maitre' where id = auth.uid();
  if (select role from profils where id = auth.uid()) = 'maitre' then
    raise notice 'FAILLE : le rôle a changé';
  else
    raise notice 'sans effet — le rôle est resté élève';
  end if;
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s2;

\echo -n 's''inscrire dans le salon des maîtres  '
savepoint s3;
do $$ begin
  insert into membres_salon (salon_id, profil_id)
  values ('aaaaaaaa-0000-0000-0000-000000000002', auth.uid());
  raise notice 'FAILLE : inscription réussie';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s3;

\echo -n 'écrire sous le nom de Hery .......... '
savepoint s4;
do $$ begin
  insert into messages (salon_id, auteur_id, texte)
  values ('aaaaaaaa-0000-0000-0000-000000000001',
          '22222222-2222-2222-2222-222222222222', 'faux message');
  raise notice 'FAILLE : usurpation réussie';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s4;

\echo -n 'supprimer un message ................ '
savepoint s5;
do $$
declare n int;
begin
  delete from messages;
  get diagnostics n = row_count;
  if n > 0 then raise notice 'FAILLE : % ligne(s) supprimée(s)', n;
  else raise notice 'sans effet — aucune ligne supprimée'; end if;
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s5;

\echo ''
\echo '=============================================='
\echo 'CE QUE VOIT HERY, MAÎTRE'
\echo '=============================================='
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
\echo -n 'salons visibles (attendu 2) ......... '
select count(*) from salons;
\echo -n 'messages visibles (attendu 2) ....... '
select count(*) from messages;
\echo -n 'dates de naissance vues (attendu 1) . '
select count(*) from profils_prives;

\echo -n 'déplacer son message vers le salon du club '
savepoint s6;
do $$ begin
  update messages set salon_id = 'aaaaaaaa-0000-0000-0000-000000000001'
  where salon_id = 'aaaaaaaa-0000-0000-0000-000000000002';
  raise notice 'FAILLE : le message a changé de salon';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s6;

\echo ''
\echo '=============================================='
\echo 'CE QUE VOIT L''ADMINISTRATION'
\echo '=============================================='
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
\echo -n 'salons visibles (attendu 0 : non inscrite) '
select count(*) from salons where est_membre(id);
\echo -n 'messages des maîtres (attendu 0) .... '
select count(*) from messages where salon_id = 'aaaaaaaa-0000-0000-0000-000000000002';
\echo -n 'fiches privées (attendu 1) .......... '
select count(*) from profils_prives;

\echo ''
\echo '=============================================='
\echo 'SANS JETON — visiteur non connecté'
\echo '=============================================='
set request.jwt.claim.sub = '';
\echo -n 'profils (attendu 0) ................. '
select count(*) from profils;
\echo -n 'messages (attendu 0) ................ '
select count(*) from messages;

reset role;
rollback;
