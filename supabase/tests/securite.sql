\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Tout est dans une transaction annulée à la fin : le test se
-- rejoue autant de fois qu'on veut sans laisser de trace.
begin;

-- ---------- Jeu d'essai, posé en tant que propriétaire ----------
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),   -- Nirina, élève
  ('22222222-2222-2222-2222-222222222222'),   -- Hery, maître
  ('33333333-3333-3333-3333-333333333333');   -- l'administration

-- La fiche et le compte sont deux choses. Ici les identifiants sont
-- volontairement différents : si le code confondait les deux, tout le
-- test passerait au vert par accident.
insert into profils (id, compte_id, numero, nom, prenom, role) values
  ('ffff0000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'F04x042', 'RAKOTONDRABE', 'Nirina', 'eleve'),
  ('ffff0000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'F04x045', 'RABEMANANJARA', 'Hery', 'maitre'),
  ('ffff0000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'F04x001', 'RAHARISOA', 'Fanja', 'admin');

-- Un élève SANS téléphone : il doit figurer à l'annuaire quand même.
insert into profils (id, numero, nom, prenom, role) values
  ('ffff0000-0000-0000-0000-000000000004', 'F04x077', 'ANDRIAMBELO', 'Rado', 'eleve');

insert into profils_prives (profil_id, date_naissance) values
  ('ffff0000-0000-0000-0000-000000000001', '2012-04-18');   -- un mineur

insert into grades (nom, couleur, rang) values ('Ceinture blanche', '#E7EDE9', 1);

insert into actualites (titre, categorie, texte, publiee) values
  ('Sortie au lac Mantasoa', 'Sortie', 'Départ 6h00 devant la salle.', true);

insert into salons (id, type, titre) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'club', 'Tout le club'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'maitres', 'Espace des maîtres');

insert into membres_salon (salon_id, profil_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ffff0000-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ffff0000-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'ffff0000-0000-0000-0000-000000000002');

insert into messages (salon_id, auteur_id, texte) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ffff0000-0000-0000-0000-000000000002',
   'L''entraînement de mercredi est maintenu.'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'ffff0000-0000-0000-0000-000000000002',
   'Passage de grade : je propose de reporter deux candidats.');

\echo '=============================================='
\echo 'CE QUE VOIT NIRINA, ÉLÈVE'
\echo '=============================================='
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
          'ffff0000-0000-0000-0000-000000000001', 'je passe par la fenêtre');
  raise notice 'FAILLE : l''insertion a réussi';
exception when insufficient_privilege or others then
  raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s1;

\echo -n 'se déclarer maître .................. '
savepoint s2;
do $$ begin
  update profils set role = 'maitre' where compte_id = auth.uid();
  if (select role from profils where compte_id = auth.uid()) = 'maitre' then
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
  values ('aaaaaaaa-0000-0000-0000-000000000002', prive.mon_profil());
  raise notice 'FAILLE : inscription réussie';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s3;

\echo -n 'écrire sous le nom de Hery .......... '
savepoint s4;
do $$ begin
  insert into messages (salon_id, auteur_id, texte)
  values ('aaaaaaaa-0000-0000-0000-000000000001',
          'ffff0000-0000-0000-0000-000000000002', 'faux message');
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

\echo -n 'l''élève sans téléphone est à l''annuaire (attendu 4) '
select count(*) from profils;

\echo -n 'rattacher sa fiche au compte d''un maître  '
savepoint s7;
do $$ begin
  update profils set compte_id = '22222222-2222-2222-2222-222222222222'
  where compte_id = auth.uid();
  raise notice 'FAILLE : la fiche a changé de compte';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s7;

\echo -n 's''inscrire à la place d''un autre ...... '
savepoint s8;
do $$ begin
  insert into participations (actualite_id, profil_id, accompagnants)
  values ((select id from actualites limit 1),
          'ffff0000-0000-0000-0000-000000000002', 2);
  raise notice 'FAILLE : inscription au nom d''un autre';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s8;

\echo -n 'se déclarer un versement reçu ....... '
savepoint s9;
do $$
declare pid uuid;
begin
  insert into participations (actualite_id, profil_id) values
    ((select id from actualites limit 1), prive.mon_profil()) returning id into pid;
  insert into versements (participation_id, montant) values (pid, 10000);
  raise notice 'FAILLE : versement déclaré par le membre';
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s9;

\echo -n 'modifier la liste des grades ........ '
savepoint s10;
do $$ begin
  update grades set nom = 'Ceinture noire' where rang = 1;
  if found then raise notice 'FAILLE : les grades ont changé';
  else raise notice 'sans effet — aucune ligne modifiée'; end if;
exception when others then raise notice 'refusé — %', sqlerrm;
end $$;
rollback to savepoint s10;

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
select count(*) from salons where prive.est_membre(id);
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
