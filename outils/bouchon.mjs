/* ============================================================
   bouchon.mjs — Un serveur Supabase en boîte, et de quoi servir
   l'application construite.

   Partagé par les deux bancs d'essai : verifier-app.mjs, qui ouvre
   chaque écran et guette les erreurs, et comparer-app.mjs, qui
   mesure l'écart avec la maquette. Un seul jeu de données pour les
   deux — sinon les deux mesurent des écrans différents et leurs
   verdicts cessent d'être comparables.

   Ce que ce bouchon N'EST PAS : une base de données. Il ne fait
   respecter aucune règle d'accès. Les règles ont leur propre test,
   dans supabase/tests/, qui se fait passer pour un élève, un maître
   et l'administration et vérifie ce que chacun reçoit. Ici on
   vérifie les ÉCRANS, en leur donnant des réponses de la forme
   exacte que rend PostgREST — jointure en objet ou en tableau,
   c'est là que les écrans se cassent.
   ============================================================ */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

export const PROJET = 'znotzkfwukvvtaqfrozn';

/* ---------------------------------------------- Les données

   Inventées de bout en bout : rien ici ne touche un vrai projet, et
   aucune donnée réelle du club n'entre dans ce dépôt public. */
/* Les grades de la maquette, avec ses couleurs exactes. L'ordre est
   celui du filtre : blanche, jaune, orange, verte — le classement
   par rang décroissant, lui, est fait par la base. */
export const GRADES = [
  { id: 'gc', nom: 'Ceinture blanche', couleur: '#E7EDE9', rang: 1, actif: true },
  { id: 'gj', nom: 'Ceinture jaune', couleur: '#D8A93A', rang: 2, actif: true },
  { id: 'go', nom: 'Ceinture orange', couleur: '#C97A32', rang: 3, actif: true },
  { id: 'gv', nom: 'Ceinture verte', couleur: '#4E9C57', rang: 4, actif: true },
  { id: 'gb', nom: 'Ceinture bleue', couleur: '#3E6E9C', rang: 5, actif: true },
  { id: 'gn', nom: 'Ceinture noire', couleur: '#1E2320', rang: 6, actif: true }
];

/* Les six mêmes élèves que la maquette, dans le même ordre et avec
   les mêmes grades. C'est ce qui rend la comparaison lisible : si
   les données diffèrent, l'écart mesuré mélange une différence de
   contenu et une différence de mise en page, et ne dit plus rien.

   « Toky » ferme la marche parce que c'est lui, l'élève SANS
   compte — le cas que l'architecture doit tenir. */
export const PROFILS = [
  { id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina', role: 'eleve', grade_id: 'gv', photo: null, debut: '2019-09-09', biographie: 'Entrée au club à treize ans. Régulière aux entraînements du mercredi et du samedi, elle prépare le passage à la ceinture bleue.' },
  { id: 'p2', numero: 'F04x043', nom: 'RASOAMANANA', prenom: 'Fanjaniaina', role: 'eleve', grade_id: 'gj', photo: null, debut: null, biographie: null },
  { id: 'p3', numero: 'F04x044', nom: 'ANDRIANJAFY', prenom: 'Tokiniaina', role: 'eleve', grade_id: 'gb', photo: null, debut: null, biographie: null },
  { id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery', role: 'maitre', grade_id: 'gn', photo: null, debut: '2014-02-01', biographie: null },
  { id: 'p5', numero: 'F04x046', nom: 'RAZAFIMAHATRATRA', prenom: 'Miora', role: 'eleve', grade_id: 'go', photo: null, debut: null, biographie: null },
  { id: 'p6', numero: 'F04x061', nom: 'RANDRIAMAMPIONONA', prenom: 'Toky', role: 'eleve', grade_id: 'gc', photo: null, debut: null, biographie: null }
];

/* La fiche de celui qui est connecté pendant les essais. On prend
   l'administration : c'est le rôle qui voit le PLUS d'écrans, donc
   celui qui en exerce le plus. */
export const MOI = {
  id: 'p0', numero: 'F04x001', nom: 'IDEALY', prenom: 'Santatra',
  role: 'admin', grade_id: 'gn', photo: null, debut: '2014-02-01',
  /* Une fiche COMPLÈTE, et c'est le banc de comparaison qui l'exige.
     La maquette montre un profil rempli — date de naissance, deux
     tuteurs, une biographie. Une fiche à moitié vide en face ne
     mesurerait pas une différence de mise en page mais une différence
     de contenu, et l'écart annoncé ne voudrait rien dire. */
  biographie:
    'Entrée au club à treize ans. Régulière aux entraînements du mercredi et du ' +
    'samedi, elle prépare le passage à la ceinture bleue. A représenté le club à ' +
    'la démonstration d’Analamahitsy en 2024.',
  profils_prives: { date_naissance: '2006-03-14', telephone: null, adresse: null, notes: null },
  tuteurs: [
    { id: 't1', nom: 'RAKOTONDRABE Voahangy', lien: 'Mère', telephone: '034 22 118 40', urgence: true },
    { id: 't2', nom: 'RAKOTONDRABE Jean-Claude', lien: 'Père', telephone: '033 41 907 12', urgence: false }
  ],
  /* Le COMPTE rattaché à cette fiche, et il doit valoir ce que rend
     « /auth/v1 » plus bas : c'est par ce lien que l'application
     retrouve sa propre fiche dans un annuaire de soixante-quatre. */
  compte_id: 'u1'
};

const avecGrade = (p) => ({ ...p, grades: GRADES.find((g) => g.id === p.grade_id) ?? null });

const maintenant = () => new Date().toISOString();
/* « Il y a n secondes », en date. Les écrans qui écrivent « Il y a
   2 h » ou « Hier » ont besoin d'un passé RELATIF : une date figée
   change de groupe au premier changement de jour, et le banc se met
   à échouer un matin sans que rien n'ait bougé dans le code. */
const ilYA = (secondes) => new Date(Date.now() - secondes * 1000).toISOString();

export const REPONSES = {
  grades: GRADES,
  /* Les catégories, avec leurs couleurs. Elles étaient écrites dans
     l'application ; le club les tient maintenant, et le bouchon doit
     les servir comme le vrai serveur — sinon les étiquettes du
     casier repartiraient toutes en vert, et la comparaison à la
     maquette dirait vrai sur un écran faux. */
  categories: [
    { id: 'c1', genre: 'actualite', nom: 'Sortie', couleur: '#12613C', rang: 1, actif: true },
    { id: 'c2', genre: 'actualite', nom: 'Compétition', couleur: '#12613C', rang: 2, actif: true },
    { id: 'c3', genre: 'actualite', nom: 'Réunion', couleur: '#12613C', rang: 3, actif: true },
    { id: 'c4', genre: 'actualite', nom: 'Cérémonie', couleur: '#12613C', rang: 4, actif: true },
    { id: 'c5', genre: 'actualite', nom: 'Changement d’horaire', couleur: '#B0530F', rang: 5, actif: true },
    { id: 'c6', genre: 'album', nom: 'Compétitions', couleur: '#12613C', rang: 1, actif: true },
    { id: 'c7', genre: 'album', nom: 'Entraînements', couleur: '#12613C', rang: 2, actif: true },
    { id: 'c8', genre: 'album', nom: 'Cérémonies', couleur: '#12613C', rang: 3, actif: true }
  ],
  profils: PROFILS.map(avecGrade),
  actualites: [
    { id: 'a1', titre: 'Sortie au lac Mantasoa', categorie: 'Sortie', texte: 'Départ 6h00 devant la salle.\n\nPrévoir le repas de midi.', date_evt: '2026-09-12', lieu: 'Devant la salle', image: null, cree_le: maintenant() },
    { id: 'a2', titre: 'Séance du mercredi à 17h30', categorie: 'Changement d’horaire', texte: 'Décalée d’une heure jusqu’à la fin décembre.', date_evt: null, lieu: null, image: null, cree_le: '2026-01-18T09:00:00Z' }
  ],
  /* Quatre notifications, réparties comme la maquette : deux du jour,
     deux plus anciennes. Une seule d'un côté et deux de l'autre
     décalait tout le second groupe de cent trente pixels, et le banc
     mesurait alors une différence de contenu. Les heures sont
     RELATIVES à maintenant — figées, elles auraient basculé dans
     « plus tôt » au premier changement de jour. */
  notifications: [
    /* Les textes sont calibrés pour tenir sur DEUX lignes des deux
       côtés. La colonne de l'application est plus étroite de la
       largeur d'un bouton — elle porte une croix « retirer » que la
       maquette n'avait pas — et un texte à la longueur de la maquette
       y passait à trois lignes : le second groupe glissait alors de
       dix-neuf pixels, pour une raison qui n'a rien à voir avec la
       mise en page. */
    { id: 'n1', titre: 'Sortie', texte: 'Nouvelle sortie prévue ce samedi. Voir le casier.', vers: '/casier/a1', lue_le: null, cree_le: ilYA(2 * 3600) },
    { id: 'n2', titre: 'Changement d’horaire', texte: 'La séance du mercredi passe à 17h30 en décembre.', vers: null, lue_le: null, cree_le: ilYA(5 * 3600) },
    { id: 'n3', titre: 'Compétition', texte: 'Huit membres sélectionnés pour le tournoi.', vers: null, lue_le: ilYA(86400), cree_le: ilYA(86400) },
    { id: 'n4', titre: 'Cérémonie', texte: 'Onze passages de grade validés le 28 octobre.', vers: null, lue_le: ilYA(3 * 86400), cree_le: ilYA(3 * 86400) }
  ],
  horaires: [
    { id: 'h1', jour: 2, debut: '17:30:00', fin: '19:00:00', niveau: 'Tous niveaux', lieu: null },
    { id: 'h2', jour: 4, debut: '17:30:00', fin: '19:00:00', niveau: 'Tous niveaux', lieu: null },
    { id: 'h3', jour: 5, debut: '17:30:00', fin: '19:00:00', niveau: 'Débutants', lieu: null },
    { id: 'h4', jour: 6, debut: '09:00:00', fin: '11:00:00', niveau: 'Gradés', lieu: null }
  ],
  reglages: [
    { cle: 'responsable', valeur: 'Idealy Itoerantsoa Santatra' },
    { cle: 'telephone', valeur: '[NUMÉRO À FOURNIR]' },
    { cle: 'adresse', valeur: '[ADRESSE EXACTE À FOURNIR]' },
    { cle: 'presentation_courte', valeur: 'Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière. Entraînements quatre fois par semaine à Analamahitsy.' },
    { cle: 'presentation', valeur: 'Le club enseigne le Kung-fu Waishi à Analamahitsy depuis 2014. Il accueille enfants, adolescents et adultes, du débutant au gradé, autour d’une pratique régulière et d’un esprit d’entraide.' },
    { cle: 'fondation', valeur: '2014' },
    { cle: 'mvola_numero', valeur: '0388010853' },
    { cle: 'mvola_nom', valeur: 'Santatra Nirina Antonio' }
  ],
  /* Trois albums, comme la maquette, et avec le NOMBRE DE VIGNETTES
     qu'elle montre — six, trois, trois. L'application ajoute la
     tuile « + » en fin de grille pour l'encadrement : cinq photos
     plus la tuile font donc six cases, et c'est la grille qu'il faut
     comparer. Un seul album d'une photo en face de trois sections
     mesurait une différence de contenu, pas de mise en page. */
  albums: [
    {
      id: 'al1', titre: 'Compétitions', categorie: 'Compétitions',
      cree_le: '2026-01-03T00:00:00Z', couverture: null,
      photos: Array.from({ length: 5 }, (_, i) => ({ id: `ph${i}`, chemin: null, legende: null, rang: i }))
    },
    {
      id: 'al2', titre: 'Entraînements', categorie: 'Entraînements',
      cree_le: '2026-01-02T00:00:00Z', couverture: null,
      photos: Array.from({ length: 2 }, (_, i) => ({ id: `pe${i}`, chemin: null, legende: null, rang: i }))
    },
    {
      id: 'al3', titre: 'Cérémonies', categorie: 'Cérémonies',
      cree_le: '2026-01-01T00:00:00Z', couverture: null,
      photos: Array.from({ length: 2 }, (_, i) => ({ id: `pc${i}`, chemin: null, legende: null, rang: i }))
    }
  ],
  /* Trois salons collectifs et deux conversations à deux, comme la
     maquette : « Tout le club », un salon de grade, un salon
     d'événement, puis deux directs. L'espace des maîtres reste là —
     il n'apparaît qu'aux maîtres, et c'est justement ce qu'on veut
     pouvoir vérifier des deux côtés. */
  salons: [
    { id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132', archive: false, dernier_le: ilYA(3 * 3600), membres_salon: [{ lu_le: null }], messages: [{ texte: 'L’entraînement de mercredi est maintenu.', cree_le: ilYA(3 * 3600), profils: { nom: 'RAHARISOA', prenom: 'Fanja' } }] },
    { id: 's3', type: 'grade', titre: 'Ceintures vertes', couleur: '#4E9C57', archive: false, dernier_le: ilYA(6 * 3600), membres_salon: [{ lu_le: null }], messages: [{ texte: 'Qui vient tôt samedi pour la mise en place ?', cree_le: ilYA(6 * 3600), profils: { nom: 'ANDRIANJAFY', prenom: 'Tokiniaina' } }] },
    { id: 's4', type: 'evenement', titre: 'Tournoi régional', couleur: '#B0530F', archive: false, dernier_le: ilYA(30 * 3600), membres_salon: [{ lu_le: maintenant() }], messages: [{ texte: 'Rendez-vous 6h devant la salle.', cree_le: ilYA(30 * 3600), profils: { nom: 'RABEMANANJARA', prenom: 'Hery' } }] },
    { id: 's5', type: 'direct', titre: null, couleur: '#3E6E9C', archive: false, dernier_le: ilYA(31 * 3600), membres_salon: [{ lu_le: maintenant() }], messages: [{ texte: 'Merci pour la correction du taolu.', cree_le: ilYA(31 * 3600), profils: { nom: 'RASOAMANANA', prenom: 'Fanjaniaina' } }] },
    { id: 's6', type: 'direct', titre: null, couleur: '#6E5AA6', archive: false, dernier_le: ilYA(4 * 86400), membres_salon: [{ lu_le: maintenant() }], messages: [{ texte: 'D’accord pour dimanche.', cree_le: ilYA(4 * 86400), profils: { nom: 'RAKOTOARISOA', prenom: 'Lalaina' } }] },
    { id: 's2', type: 'maitres', titre: 'Espace des maîtres', couleur: '#0B2B1D', archive: false, dernier_le: ilYA(2 * 86400), membres_salon: [{ lu_le: null }], messages: [] }
  ],
  /* Le fil de « Tout le club », dans l'ordre de la maquette : deux
     messages reçus, un envoyé, un reçu, un envoyé. « p0 » est le
     connecté — ses messages partent à droite. */
  messages: [
    { id: 'm1', texte: 'Bonsoir à tous. L’entraînement de mercredi est maintenu malgré les travaux.', cree_le: ilYA(4 * 3600), supprime_le: null, auteur_id: 'p2', profils: { nom: 'RAHARISOA', prenom: 'Fanja' } },
    { id: 'm2', texte: 'Rendez-vous à 17h30 comme d’habitude.', cree_le: ilYA(3.9 * 3600), supprime_le: null, auteur_id: 'p2', profils: { nom: 'RAHARISOA', prenom: 'Fanja' } },
    { id: 'm3', texte: 'Merci pour l’information.', cree_le: ilYA(3.5 * 3600), supprime_le: null, auteur_id: 'p0', profils: { nom: 'IDEALY', prenom: 'Santatra' } },
    { id: 'm4', texte: 'Est-ce qu’on travaille encore le taolu de la semaine dernière ?', cree_le: ilYA(3 * 3600), supprime_le: null, auteur_id: 'p3', profils: { nom: 'ANDRIANJAFY', prenom: 'Tokiniaina' } },
    { id: 'm5', texte: 'Oui, et on ajoute le passage en cercle.', cree_le: ilYA(2.8 * 3600), supprime_le: null, auteur_id: 'p0', profils: { nom: 'IDEALY', prenom: 'Santatra' } }
  ],
  participations: [
    {
      id: 'pa1', accompagnants: 2, montant_promis: 5000,
      profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' },
      versements: [{ id: 'v1', montant: 5000, recu_le: '2026-09-01' }]
    }
  ],
  membres_salon: [],
  signalements: [
    {
      id: 'sg1',
      motif: 'Propos déplacés envers un plus jeune',
      cree_le: maintenant(),
      traite_le: null,
      suite: null,
      profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' },
      messages: {
        id: 'm9',
        texte: 'Ce message pose problème.',
        supprime_le: null,
        profils: { nom: 'ANDRIANJAFY', prenom: 'Tokiniaina' }
      }
    }
  ],
  versements: [],
  /* Les deux conversations à deux, avec l'autre personne. La vue
     « mes_directs » est ce qui donne un NOM à un salon de type
     direct : sans elle, la liste afficherait « ?? ». */
  mes_directs: [
    { salon_id: 's5', autre_id: 'p2', autre_nom: 'RASOAMANANA', autre_prenom: 'Fanjaniaina', autre_photo: null },
    { salon_id: 's6', autre_id: 'p7', autre_nom: 'RAKOTOARISOA', autre_prenom: 'Lalaina', autre_photo: null }
  ],
  tuteurs: [],
  /* Une séance pointée, pour que les deux écrans de présence
     montrent une ligne plutôt que leur message de liste vide : c'est
     la ligne, pas le vide, qui peut casser. */
  /* Un passage dans le journal : c'est la LIGNE, pas le vide, qui
     peut casser. */
  journal_acces: [
    {
      id: 1,
      quoi: 'ouverture de l’espace des maîtres',
      quand: new Date().toISOString(),
      profils: { nom: 'RABEMANANJARA', prenom: 'Hery', numero: 'F04x045' },
      salons: { titre: 'Espace des maîtres', type: 'maitres' }
    }
  ],
  presences: [
    {
      id: 'pr1',
      seance_le: new Date().toISOString().slice(0, 10),
      statut: 'present',
      horaire_id: null,
      profils: { id: 'p1', nom: 'RAKOTONDRABE', prenom: 'Nirina', numero: 'F04x042' }
    }
  ]
};

/* ---------------------------------------------- Servir app/dist */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

/* « racineObligatoire » vaut faux quand on sert le DÉPÔT plutôt que
   app/dist : la page vit alors sous /essai, et il n'y a pas
   d'index.html à la racine. */
export function servir(racine, port = 4173, racineObligatoire = true) {
  if (racineObligatoire && !existsSync(join(racine, 'index.html'))) {
    console.error('app/dist est vide. Lancez d’abord : cd app && npx vite build');
    process.exit(1);
  }
  const serveur = createServer((req, res) => {
    const chemin = normalize(decodeURI((req.url ?? '/').split('?')[0]));
    const demande = join(racine, chemin === '/' ? 'index.html' : chemin);
    if (!demande.startsWith(racine)) {
      res.writeHead(404).end('non trouvé');
      return;
    }

    /* Comme Vercel : « cleanUrls » fait répondre /essai avec
       essai/index.html. Sans cette reprise, la demande tombait sur un
       DOSSIER et le serveur mourait — « EISDIR: illegal operation on
       a directory ». C'est aussi le seul moyen de reproduire ici le
       chemin exact que sert le site publié. */
    const candidats = [demande, join(demande, 'index.html'), `${demande}.html`];
    const fichier = candidats.find((c) => existsSync(c) && !statSync(c).isDirectory());
    if (!fichier) {
      /* version.txt sans fichier : on répond « developpement », que
         l'application traite comme « pas de version » et ignore.

         Pourquoi pas un 404 : ce banc sert app/dist — le paquet de
         l'APK — dans un NAVIGATEUR. Sur un vrai téléphone,
         l'application ne demande rien du tout (Capacitor le dit), et
         le fichier n'a pas à exister. Un 404 ici serait donc une
         fausse alerte, signalée par « verifier-app » comme une
         erreur de console.

         Ce qui reste vérifié ailleurs, et pour de bon : la version
         web, elle, DOIT avoir son version.txt — c'est
         verifier-web.mjs qui sert le vrai dépôt et le constaterait
         manquant. */
      if (chemin.endsWith('/version.txt')) {
        res.writeHead(200, { 'content-type': 'text/plain' }).end('developpement\n');
        return;
      }
      res.writeHead(404).end('non trouvé');
      return;
    }

    res.writeHead(200, { 'content-type': TYPES[extname(fichier)] ?? 'application/octet-stream' });
    res.end(readFileSync(fichier));
  });
  return new Promise((ok) => serveur.listen(port, () => ok({
    adresse: `http://localhost:${port}`,
    fermer: () => serveur.close()
  })));
}

/* ---------------------------------------------- Intercepter Supabase

   Rien ne sort vers le réseau : toutes les requêtes vers le projet
   sont détournées ici. « inconnues » recueille les tables qu'on
   n'avait pas prévues — un écran qui interroge une table absente du
   bouchon serait sinon jugé sur une réponse vide, sans qu'on sache
   que c'est le bouchon qui a menti. */
/* « role » remplace celui de la fiche connectée, et sert au banc de
   comparaison. Plusieurs écrans montrent à l'administration des
   sections que la maquette ne pouvait pas connaître — le filtre des
   conversations archivées, le salon confidentiel des maîtres. Les
   comparer depuis un compte d'élève, c'est comparer ce que la
   maquette montre, et rien d'autre. */
export async function brancher(page, inconnues = [], { role } = {}) {
  const MOI_VU = role ? { ...MOI, role } : MOI;
  await page.route(`https://${PROJET}.supabase.co/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/auth/v1')) {
      return route.fulfill({ json: { user: { id: 'u1' } } });
    }

    /* Le stockage. createSignedUrls rend un TABLEAU, une entrée par
       chemin demandé, chacune avec sa propre erreur éventuelle. Les
       photos du bouchon n'ont pas de chemin — l'écran doit donc
       montrer son marque-place, ce qui est justement ce qu'on veut
       voir tant que le club n'a rien fourni. */
    if (url.pathname.startsWith('/storage/v1/')) {
      /* Les images d'essai.

         Elles doivent être servies ICI, et le banc du carrousel l'a
         prouvé en rendant « 0 chargée sur 5 ». supabase-js ne rend
         pas « signedURL » tel quel : il le PRÉFIXE de l'adresse du
         stockage. « /essai-image/0 » devient donc
         « /storage/v1/essai-image/0 », que la branche du stockage
         attrapait avant tout le reste et à quoi elle répondait du
         JSON. Le carrousel affichait cinq cadres vides.

         C'est exactement la classe de défaut que ce bouchon a déjà
         eue avec « signedUrl » contre « signedURL » : une fiction
         qui laisse tout passer au vert. */
      if (url.pathname.includes('/essai-image/')) {
        const teintes = ['#0F5132', '#8FB3A0', '#E4572E', '#1E2320', '#4E9C57'];
        const i = Number(url.pathname.split('/').pop()) || 0;
        return route.fulfill({
          contentType: 'image/svg+xml',
          body:
            `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="168">` +
            `<rect width="390" height="168" fill="${teintes[i % teintes.length]}"/></svg>`
        });
      }

      let corps = null;
      try { corps = JSON.parse(route.request().postData() ?? 'null'); } catch { /* pas du JSON */ }
      const chemins = corps?.paths ?? [];
      /* ⚠ La clé est « signedURL », avec URL en capitales. C'est ce
         que rend le vrai serveur ; supabase-js la lit et compose
         « signedUrl » par-dessus. Écrire « signedUrl » ici — ce que
         faisait ce bouchon — donnait un objet que la bibliothèque
         écrasait par « signedUrl: null ». Le même défaut a existé
         dans le serveur simulé des tests, où il a fait passer toute
         une série de vérifications sur une fiction.

         AVEC_PHOTOS rend de vraies images. Il est éteint par défaut :
         la maquette n'a aucune photo, et en fabriquer ici ferait
         échouer la comparaison pour de mauvaises raisons. */
      if (process.env.AVEC_PHOTOS === '1') {
        return route.fulfill({
          json: chemins.map((p, i) => ({
            path: p,
            signedURL: `/essai-image/${i}`,
            error: null
          }))
        });
      }
      return route.fulfill({
        json: chemins.map((p) => ({ path: p, signedURL: null, error: 'Object not found' }))
      });
    }
    const table = url.pathname.replace('/rest/v1/', '');
    const corps = REPONSES[table];
    if (corps === undefined) {
      inconnues.push(table);
      return route.fulfill({ json: [] });
    }

    const seul = (route.request().headers()['accept'] ?? '').includes('vnd.pgrst.object');

    /* La requête de session se reconnaît à son FILTRE, et non plus à
       son en-tête.

       Elle se reconnaissait jusqu'ici à « Accept: vnd.pgrst.object »,
       que « .single() » envoie. Le jour où l'application est passée à
       « .maybeSingle() » — parce que zéro fiche est un cas normal —
       supabase-js a cessé d'envoyer cet en-tête : il demande la liste
       et prend la première ligne lui-même. Le bouchon rendait donc
       l'annuaire entier, la fiche du connecté devenait « null », et
       SEIZE écrans d'administration disparaissaient d'un coup — les
       routes n'existent que pour qui a le rôle.

       Le filtre, lui, ne dépend pas de la version de la bibliothèque :
       c'est l'application qui l'écrit, et c'est justement lui qu'on
       veut vérifier présent. */
    const compte = url.searchParams.get('compte_id')?.replace('eq.', '');
    if (table === 'profils' && compte) {
      const fiche = compte === MOI.compte_id ? avecGrade(MOI_VU) : null;
      return route.fulfill({ json: seul ? fiche : fiche ? [fiche] : [] });
    }

    /* LA SEULE RÈGLE D'ACCÈS QUE CE BOUCHON IMITE.

       Il n'en applique aucune autre, et c'est assumé : les règles ont
       leur propre banc, dans supabase/tests/. Mais l'espace des
       maîtres est un salon qu'un élève ne reçoit JAMAIS, et le
       rendre quand même ferait apparaître une section
       « Confidentiel » sur l'écran d'un élève — un écran qui
       n'existe pas. Le banc comparerait alors une fiction. */
    let donnees = corps;
    if (table === 'salons' && MOI_VU.role === 'eleve') {
      donnees = donnees.filter((s) => s.type !== 'maitres');
    }
    const id = url.searchParams.get('id')?.replace('eq.', '');
    /* MA fiche se cherche par identifiant comme les autres — la
       carte de membre le fait. L'oublier vidait la carte, et le code
       QR devenait illisible faute de matricule à encoder. */
    if (id) {
      donnees = [...corps, ...(table === 'profils' ? [avecGrade(MOI_VU)] : [])]
        .filter((l) => l.id === id);
    }

    /* L'ORDRE DEMANDÉ EST RESPECTÉ.

       Il ne l'était pas, et cela s'est vu sur une conversation : le
       fil demande « cree_le décroissant, les deux cents derniers »
       puis retourne la liste pour la lire de haut en bas. Le bouchon
       rendant le tableau tel quel, le retournement le mettait à
       l'envers — le dernier message s'affichait en premier, et le
       banc photographiait une conversation qui remonte le temps.

       Une seule clé suffit : aucun écran n'en demande deux sur la
       table principale. Le tri des tables JOINTES, lui, reste ignoré ;
       il ne concerne qu'un aperçu d'un élément. */
    const tri = url.searchParams.get('order');
    if (tri && Array.isArray(donnees)) {
      const [champ, sens] = tri.split('.');
      const signe = sens === 'desc' ? -1 : 1;
      donnees = [...donnees].sort((a, b) => {
        const x = a?.[champ];
        const y = b?.[champ];
        if (x === y) return 0;
        if (x === null || x === undefined) return 1;
        if (y === null || y === undefined) return -1;
        return (x < y ? -1 : 1) * signe;
      });
    }
    return route.fulfill({ json: seul ? (donnees[0] ?? null) : donnees });
  });
}

/* La session est posée AVANT le chargement : c'est ce que fait un
   téléphone qui a déjà servi. */
export async function poserSession(page) {
  await page.addInitScript(
    ({ projet }) => {
      const dans1h = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem(
        `sb-${projet}-auth-token`,
        JSON.stringify({
          access_token: 'jeton-de-controle',
          refresh_token: 'renouvellement-de-controle',
          expires_at: dans1h,
          expires_in: 3600,
          token_type: 'bearer',
          user: { id: 'u1', aud: 'authenticated', role: 'authenticated' }
        })
      );
    },
    { projet: PROJET }
  );
}
