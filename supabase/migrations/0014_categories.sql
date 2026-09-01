-- ============================================================
-- Les CATÉGORIES appartiennent au club, pas au code.
--
-- « Je veux que les catégories soient éditables, pas en dur ou en
-- lecture uniquement. »
--
-- État d'avant :
--   — les catégories d'ACTUALITÉ étaient une liste écrite dans
--     l'application : Sortie, Compétition, Réunion, Cérémonie,
--     Changement d'horaire. En ajouter une demandait une nouvelle
--     version de l'APK, donc une construction, donc moi.
--   — les catégories d'ALBUM étaient du texte libre, tapé à chaque
--     création. « Compétition » et « Compétitions » devenaient deux
--     catégories distinctes, et le filtre du haut de l'écran en
--     montrait autant que de fautes de frappe.
--   — les COULEURS étaient écrites dans le code, et une seule y
--     figurait vraiment ; tout le reste tombait sur le vert du club.
--
-- C'est exactement le raisonnement qui avait donné la table
-- « grades » au premier jour : « la liste appartient au club, pas au
-- code ». Les catégories l'avaient manqué.
--
-- ------------------------------------------------------------
-- CE QUI N'EST PAS FAIT, ET POURQUOI
--
-- « categorie » reste une COLONNE DE TEXTE sur actualites et albums.
-- On n'en fait pas une clé étrangère.
--
-- Ce serait plus propre sur le papier, et destructeur en pratique :
-- il faudrait rattacher chaque ligne existante à une catégorie de la
-- nouvelle table, décider quoi faire de celles qui ne correspondent à
-- rien, et une catégorie retirée plus tard emporterait ou orphelinerait
-- les actualités qui l'employaient.
--
-- Cette table dit donc ce qu'on PROPOSE et de quelle couleur, pas ce
-- qui est permis. Une actualité publiée sous une catégorie ensuite
-- retirée reste lisible, et garde son nom : elle prend simplement la
-- couleur par défaut. C'est le comportement qu'on veut d'un club qui
-- réorganise ses rubriques.
-- ============================================================

create table categories (
  id      uuid primary key default gen_random_uuid(),
  -- « actualite » ou « album » : les deux listes sont distinctes.
  -- Le casier parle de Sorties et de Compétitions, l'album de
  -- Cérémonies et d'Entraînements — les mêlerait qui les mêle.
  genre   text not null check (genre in ('actualite', 'album')),
  nom     text not null,
  -- La couleur du TRAIT. Le fond teinté s'en déduit dans
  -- l'application, en la mélangeant à du blanc : demander deux
  -- couleurs au club pour qu'elles s'accordent serait lui demander
  -- de faire notre travail.
  couleur text not null default '#12613C',
  rang    int  not null default 0,
  -- Retirée de la liste sans être supprimée : les actualités qui la
  -- portent gardent leur nom et leur couleur, on cesse seulement de
  -- la proposer. C'est ce que fait déjà « grades.actif ».
  actif   boolean not null default true,

  unique (genre, nom)
);

create index on categories (genre, rang);

alter table categories enable row level security;

-- Tout le monde lit : la couleur d'une catégorie s'affiche dans le
-- casier de chaque membre, et le filtre du haut aussi.
create policy "chacun lit les catégories"
  on categories
  for select
  to authenticated
  using (true);

-- L'administration seule écrit. PAS l'encadrement : la migration
-- 0013 lui a confié l'IMAGE du club — la photo, les albums, les
-- photos — pas la structure des rubriques. Renommer une catégorie
-- change ce que lisent les soixante-quatre membres dans leur casier.
create policy "l'administration tient les catégories"
  on categories
  for all
  to authenticated
  using (prive.mon_role() = 'admin')
  with check (prive.mon_role() = 'admin');

-- ------------------------------------------------------------
-- Le point de départ.
--
-- Les cinq catégories d'actualité sont celles qui étaient écrites
-- dans l'application, AVEC EXACTEMENT LA COULEUR QU'ELLES Y AVAIENT :
-- le « Changement d'horaire » en orange, tout le reste au vert du
-- club.
--
-- J'avais d'abord donné une couleur distincte à chacune, en me
-- disant que cinq pastilles vertes ne distinguent rien. La
-- comparaison à la maquette l'a refusé, et elle avait raison : ce
-- n'est pas ce qui a été demandé. Le club a demandé de pouvoir
-- MODIFIER les catégories, pas que je choisisse ses couleurs. Elles
-- sont maintenant modifiables d'un appui, et l'écran est celui qu'il
-- connaît tant qu'il n'y touche pas.
--
-- Celles des albums viennent des exemples proposés à la saisie
-- (« Compétitions, Entraînements, Cérémonies… »), au pluriel comme
-- elles y figuraient.
--
-- « on conflict do nothing » : cette migration doit pouvoir repasser
-- sur une base où le club a déjà renommé ou supprimé une catégorie,
-- sans lui rendre ce qu'il a retiré.
-- ------------------------------------------------------------
insert into categories (genre, nom, couleur, rang) values
  ('actualite', 'Sortie',                '#12613C', 1),
  ('actualite', 'Compétition',           '#12613C', 2),
  ('actualite', 'Réunion',               '#12613C', 3),
  ('actualite', 'Cérémonie',             '#12613C', 4),
  ('actualite', 'Changement d''horaire', '#B0530F', 5),
  ('album',     'Compétitions',          '#12613C', 1),
  ('album',     'Entraînements',         '#12613C', 2),
  ('album',     'Cérémonies',            '#12613C', 3),
  ('album',     'Sorties',               '#12613C', 4)
on conflict (genre, nom) do nothing;
