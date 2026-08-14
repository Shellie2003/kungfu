/* ============================================================
   data.js — Données fictives réalistes
   Monastère de Long Shan — Antananarivo, Madagascar
   Devise : Ariary (Ar)
   ============================================================ */

const BELTS = [
  { id: 'blanc',  name: 'Débutant', color: '#EDE7DA', order: 0 },
  { id: 'jaune',  name: 'Jaune',    color: '#D9AE3C', order: 1 },
  { id: 'orange', name: 'Orange',   color: '#C97A32', order: 2 },
  { id: 'vert',   name: 'Vert',     color: '#5E7F4E', order: 3 },
  { id: 'bleu',   name: 'Bleu',     color: '#4A6580', order: 4 },
  { id: 'marron', name: 'Marron',   color: '#6B4A33', order: 5 },
  { id: 'noir',   name: 'Noir',     color: '#1E1B18', order: 6 }
];
const beltOf = (id) => BELTS.find((b) => b.id === id) || BELTS[0];

/* ---------------------------------------------- Personnes */
const PEOPLE = [
  { id: 'p1',  name: 'Rakoto Andry',      role: 'Élève',   level: 'Intermédiaire', belt: 'jaune',  progress: 82, attendance: 87, sessions: 42, techniques: 7,  resident: true,  since: '2024-03-12', room: 'A101', phone: '034 12 345 67', dues: 'À jour' },
  { id: 'p2',  name: 'Rasoa Hery',        role: 'Élève',   level: 'Intermédiaire', belt: 'jaune',  progress: 74, attendance: 92, sessions: 38, techniques: 6,  resident: true,  since: '2024-04-02', room: 'A101', phone: '033 45 118 20', dues: 'À jour' },
  { id: 'p3',  name: 'Andrianina Toky',   role: 'Élève',   level: 'Avancé',        belt: 'vert',   progress: 91, attendance: 95, sessions: 96, techniques: 14, resident: false, since: '2022-09-18', room: null,   phone: '032 77 640 11', dues: 'À jour' },
  { id: 'p4',  name: 'Rabe Jean',         role: 'Élève',   level: 'Débutant',      belt: 'blanc',  progress: 34, attendance: 61, sessions: 11, techniques: 2,  resident: false, since: '2026-01-20', room: null,   phone: '034 90 223 45', dues: 'Retard' },
  { id: 'p5',  name: 'Randria Paul',      role: 'Élève',   level: 'Débutant',      belt: 'blanc',  progress: 28, attendance: 44, sessions: 9,  techniques: 1,  resident: false, since: '2026-02-11', room: null,   phone: '033 08 771 92', dues: 'Retard' },
  { id: 'p6',  name: 'Naina Fenosoa',     role: 'Élève',   level: 'Intermédiaire', belt: 'orange', progress: 66, attendance: 88, sessions: 57, techniques: 9,  resident: true,  since: '2023-11-05', room: 'A102', phone: '034 55 129 03', dues: 'À jour' },
  { id: 'p7',  name: 'Miora Tantely',     role: 'Élève',   level: 'Intermédiaire', belt: 'orange', progress: 79, attendance: 90, sessions: 61, techniques: 10, resident: true,  since: '2023-08-27', room: 'A102', phone: '032 41 660 78', dues: 'À jour' },
  { id: 'p8',  name: 'Lova Mamy',         role: 'Élève',   level: 'Avancé',        belt: 'bleu',   progress: 88, attendance: 93, sessions: 132,techniques: 19, resident: true,  since: '2021-06-14', room: 'A103', phone: '034 20 887 51', dues: 'À jour' },
  { id: 'p9',  name: 'Hasina Njaka',      role: 'Moine',   level: 'Résident',      belt: 'marron', progress: 95, attendance: 99, sessions: 210,techniques: 26, resident: true,  since: '2019-02-01', room: 'B201', phone: '—', dues: '—' },
  { id: 'p10', name: 'Fanilo Sitraka',    role: 'Moine',   level: 'Résident',      belt: 'vert',   progress: 71, attendance: 97, sessions: 148,techniques: 16, resident: true,  since: '2021-10-09', room: 'B201', phone: '—', dues: '—' },
  { id: 'p11', name: 'Maître Chen Wei',   role: 'Grand Maître', level: 'Enseignant', belt: 'noir', progress: 100, attendance: 100, sessions: 0, techniques: 48, resident: true, since: '2011-04-30', room: 'B101', phone: '034 00 001 01', dues: '—' },
  { id: 'p12', name: 'Maître Ravaka',     role: 'Maître',  level: 'Enseignant',    belt: 'noir',   progress: 100, attendance: 98, sessions: 0, techniques: 34, resident: true,  since: '2016-07-22', room: 'B102', phone: '033 12 004 88', dues: '—' },
  { id: 'p13', name: 'Solofo Rakotomalala',role:'Personnel',level: 'Cuisine',      belt: null,     progress: 0,  attendance: 96, sessions: 0,  techniques: 0,  resident: true,  since: '2020-01-15', room: 'B203', phone: '034 61 220 17', dues: '—' },
  { id: 'p14', name: 'Vololona Ranaivo',  role: 'Personnel', level: 'Intendance',  belt: null,     progress: 0,  attendance: 94, sessions: 0,  techniques: 0,  resident: false, since: '2022-05-03', room: null,   phone: '032 30 551 44', dues: '—' },
  { id: 'p15', name: 'Rakoto Jean',       role: 'Donateur', level: 'Bienfaiteur',  belt: null,     progress: 0,  attendance: 0,  sessions: 0,  techniques: 0,  resident: false, since: '2023-03-19', room: null,   phone: '034 77 900 12', dues: '—' },
  { id: 'p16', name: 'Tsiory Rabemananjara', role: 'Ancien élève', level: 'Diplômé', belt: 'noir', progress: 100, attendance: 0, sessions: 386, techniques: 41, resident: false, since: '2014-09-01', room: null, phone: '033 90 112 66', dues: '—' },
  { id: 'p17', name: 'Faniry Andriamana', role: 'Visiteur', level: 'Retraite 7 j', belt: null,     progress: 0,  attendance: 0,  sessions: 0,  techniques: 0,  resident: true,  since: '2026-08-09', room: 'A103', phone: '034 18 447 30', dues: 'Réglé' }
];
const person = (id) => PEOPLE.find((p) => p.id === id);
/* Enrichit chaque personne avec la couleur de sa ceinture. */
PEOPLE.forEach((p) => { if (p.belt) { p.beltColor = beltOf(p.belt).color; p.beltName = beltOf(p.belt).name; } });

const STUDENTS = PEOPLE.filter((p) => p.role === 'Élève');

/* ---------------------------------------------- Journée */
const TODAY = [
  { time: '05:30', title: 'Méditation',            meta: 'Salle du Silence · 34 présents',    state: 'done' },
  { time: '08:00', title: 'Travaux du monastère',  meta: 'Jardin, cuisine, réfectoire',       state: 'done' },
  { time: '10:00', title: 'Entraînement fondamental', meta: 'Groupe débutant · 16 élèves',    state: 'done' },
  { time: '12:00', title: 'Déjeuner',              meta: 'Réfectoire · 62 couverts',          state: 'done' },
  { time: '16:00', title: 'Kung-Fu intermédiaire', meta: 'Cour d’honneur · 24 élèves',        state: 'now', to: 'session' },
  { time: '18:00', title: 'Méditation du soir',    meta: 'Salle du Silence',                  state: 'next' },
  { time: '19:00', title: 'Dîner',                 meta: 'Réfectoire',                        state: 'next' },
  { time: '21:00', title: 'Repos',                 meta: 'Extinction des lampes',             state: 'locked' }
];

/* ---------------------------------------------- Entraînements */
const SESSIONS = [
  { id: 's1', title: 'Kung-Fu intermédiaire', time: '16:00', dur: '90 min', group: 'Groupe intermédiaire', master: 'Maître Ravaka', count: 24, place: 'Cour d’honneur', state: 'now' },
  { id: 's2', title: 'Kung-Fu avancé',        time: '18:00', dur: '90 min', group: 'Groupe avancé',        master: 'Maître Chen Wei', count: 12, place: 'Grande salle', state: 'next' },
  { id: 's3', title: 'Fondamentaux',          time: '10:00', dur: '60 min', group: 'Groupe débutant',      master: 'Maître Ravaka', count: 16, place: 'Cour d’honneur', state: 'done' },
  { id: 's4', title: 'Formes traditionnelles', time: '07:00', dur: '60 min', group: 'Tous niveaux',        master: 'Maître Chen Wei', count: 31, place: 'Terrasse nord', state: 'next', day: 'Demain' }
];

const GROUPS = [
  { id: 'g1', name: 'Groupe débutant',      members: 16, master: 'Maître Ravaka',   slots: 'Lun · Mer · Ven — 10:00' },
  { id: 'g2', name: 'Groupe intermédiaire', members: 24, master: 'Maître Ravaka',   slots: 'Lun · Mar · Jeu — 16:00' },
  { id: 'g3', name: 'Groupe avancé',        members: 12, master: 'Maître Chen Wei', slots: 'Mar · Jeu · Sam — 18:00' },
  { id: 'g4', name: 'Résidents',            members: 18, master: 'Maître Chen Wei', slots: 'Quotidien — 05:30' }
];

/* ---------------------------------------------- Technique & formes */
const TECHNIQUES = [
  { id: 't1', name: 'Ma Bu',        fr: 'Position du cavalier', belt: 'blanc',  cat: 'Position', mastered: true },
  { id: 't2', name: 'Gong Bu',      fr: 'Position de l’arc',    belt: 'blanc',  cat: 'Position', mastered: true },
  { id: 't3', name: 'Chong Quan',   fr: 'Poing direct',         belt: 'jaune',  cat: 'Frappe',   mastered: true },
  { id: 't4', name: 'Pi Zhang',     fr: 'Paume tranchante',     belt: 'jaune',  cat: 'Frappe',   mastered: true },
  { id: 't5', name: 'Dan Tui',      fr: 'Coup de pied direct',  belt: 'jaune',  cat: 'Jambe',    mastered: true },
  { id: 't6', name: 'Xie Bu',       fr: 'Position croisée',     belt: 'orange', cat: 'Position', mastered: true },
  { id: 't7', name: 'Tan Tui',      fr: 'Jambe jaillissante',   belt: 'orange', cat: 'Jambe',    mastered: true },
  { id: 't8', name: 'Sao Tui',      fr: 'Balayage bas',         belt: 'orange', cat: 'Jambe',    mastered: false },
  { id: 't9', name: 'Zhou Ji',      fr: 'Frappe du coude',      belt: 'orange', cat: 'Frappe',   mastered: false },
  { id: 't10',name: 'Xu Bu',        fr: 'Position vide',        belt: 'vert',   cat: 'Position', mastered: false },
  { id: 't11',name: 'Teng Kong Fei',fr: 'Coup de pied sauté',   belt: 'vert',   cat: 'Jambe',    mastered: false },
  { id: 't12',name: 'Qin Na',       fr: 'Saisie et contrôle',   belt: 'bleu',   cat: 'Contrôle', mastered: false }
];

const FORMS = [
  { id: 'f1', name: 'Wu Bu Quan',      fr: 'Forme des cinq positions', belt: 'jaune',  moves: 18, dur: '1 min 10' },
  { id: 'f2', name: 'Lian Huan Quan',  fr: 'Poings enchaînés',         belt: 'orange', moves: 32, dur: '1 min 45' },
  { id: 'f3', name: 'Gong Li Quan',    fr: 'Forme de la puissance',    belt: 'vert',   moves: 46, dur: '2 min 20' },
  { id: 'f4', name: 'Chang Quan',      fr: 'Boxe longue',              belt: 'bleu',   moves: 62, dur: '3 min' }
];

/* ---------------------------------------------- Examens */
const EXAM = {
  id: 'e1', from: 'jaune', to: 'orange', date: '15 août 2026', time: '09:00',
  place: 'Grande salle', jury: ['Maître Chen Wei', 'Maître Ravaka'], candidates: 14,
  trials: [
    { name: 'Positions',  weight: 15 },
    { name: 'Techniques', weight: 25 },
    { name: 'Forme',      weight: 25 },
    { name: 'Combat',     weight: 15 },
    { name: 'Discipline', weight: 10 },
    { name: 'Théorie',    weight: 10 }
  ]
};
const EXAM_SCORES = [
  { name: 'Technique',  score: 18 },
  { name: 'Forme',      score: 16 },
  { name: 'Combat',     score: 17 },
  { name: 'Discipline', score: 20 },
  { name: 'Théorie',    score: 15 }
];

/* ---------------------------------------------- Bâtiments */
const BUILDINGS = [
  { name: 'Bâtiment A — Élèves', rooms: [
    { id: 'A101', cap: 4, taken: 3, state: 'Occupée' },
    { id: 'A102', cap: 4, taken: 4, state: 'Complète' },
    { id: 'A103', cap: 4, taken: 2, state: 'Occupée' },
    { id: 'A104', cap: 4, taken: 0, state: 'Libre' }
  ]},
  { name: 'Bâtiment B — Résidents', rooms: [
    { id: 'B101', cap: 1, taken: 1, state: 'Occupée' },
    { id: 'B102', cap: 1, taken: 1, state: 'Occupée' },
    { id: 'B201', cap: 6, taken: 5, state: 'Occupée' },
    { id: 'B203', cap: 2, taken: 1, state: 'Occupée' },
    { id: 'B204', cap: 2, taken: 0, state: 'Entretien' }
  ]}
];

/* ---------------------------------------------- Repas */
const MEALS = [
  { id: 'm1', name: 'Petit déjeuner', time: '06:30', people: 62, menu: 'Riz blanc · Thé vert · Fruits de saison',
    items: [{ n: 'Riz', q: '8 kg' }, { n: 'Thé vert', q: '300 g' }, { n: 'Bananes', q: '9 kg' }] },
  { id: 'm2', name: 'Déjeuner', time: '12:00', people: 62, menu: 'Riz · Légumes sautés · Légumineuses',
    items: [{ n: 'Riz', q: '12 kg' }, { n: 'Légumes', q: '8 kg' }, { n: 'Légumineuses', q: '4 kg' }, { n: 'Huile', q: '0,8 L' }] },
  { id: 'm3', name: 'Dîner', time: '19:00', people: 58, menu: 'Soupe de légumes · Riz · Thé',
    items: [{ n: 'Riz', q: '9 kg' }, { n: 'Légumes', q: '6 kg' }, { n: 'Sel', q: '120 g' }] }
];

/* ---------------------------------------------- Stocks */
const STOCK = [
  { cat: 'Nourriture', items: [
    { n: 'Riz',           q: 72,  u: 'kg', min: 40, },
    { n: 'Légumineuses',  q: 18,  u: 'kg', min: 20 },
    { n: 'Huile',         q: 4,   u: 'L',  min: 10 },
    { n: 'Thé vert',      q: 6,   u: 'kg', min: 3 }
  ]},
  { cat: 'Équipements Kung-Fu', items: [
    { n: 'Gants',         q: 12,  u: 'paires', min: 20 },
    { n: 'Bâtons',        q: 31,  u: 'unités', min: 15 },
    { n: 'Ceintures',     q: 44,  u: 'unités', min: 20 },
    { n: 'Tapis',         q: 26,  u: 'unités', min: 20 }
  ]},
  { cat: 'Produits d’entretien', items: [
    { n: 'Savon',         q: 22,  u: 'unités', min: 10 },
    { n: 'Balais',        q: 9,   u: 'unités', min: 6 }
  ]},
  { cat: 'Livres', items: [
    { n: 'Manuels de formes', q: 35, u: 'unités', min: 10 },
    { n: 'Textes classiques', q: 12, u: 'unités', min: 5 }
  ]},
  { cat: 'Matériel technique', items: [
    { n: 'Cibles de frappe', q: 14, u: 'unités', min: 8 },
    { n: 'Chronomètres',     q: 3,  u: 'unités', min: 4 }
  ]}
];

/* ---------------------------------------------- Finances */
const FINANCE = {
  income: 4850000, expense: 2740000,
  incomeLines: [
    { n: 'Cotisations',  v: 2450000 },
    { n: 'Hébergement',  v: 980000 },
    { n: 'Dons',         v: 720000 },
    { n: 'Formations',   v: 460000 },
    { n: 'Inscriptions', v: 180000 },
    { n: 'Événements',   v: 60000 }
  ],
  expenseLines: [
    { n: 'Nourriture',   v: 1240000 },
    { n: 'Maintenance',  v: 520000 },
    { n: 'Électricité',  v: 380000 },
    { n: 'Matériel',     v: 290000 },
    { n: 'Eau',          v: 180000 },
    { n: 'Transport',    v: 130000 }
  ],
  months: [
    { m: 'Mar', in: 3.9, out: 2.5 }, { m: 'Avr', in: 4.2, out: 2.6 },
    { m: 'Mai', in: 4.0, out: 2.9 }, { m: 'Juin', in: 4.6, out: 2.7 },
    { m: 'Juil', in: 4.4, out: 3.1 }, { m: 'Août', in: 4.85, out: 2.74 }
  ]
};

const DONATIONS = {
  total: 12850000, month: 2400000,
  list: [
    { who: 'Rakoto Jean',       amount: 800000, date: '10 août 2026', dest: 'Construction' },
    { who: 'Famille Andriana',  amount: 500000, date: '07 août 2026', dest: 'Nourriture' },
    { who: 'Anonyme',           amount: 450000, date: '04 août 2026', dest: 'Général' },
    { who: 'Association Vonjy', amount: 350000, date: '02 août 2026', dest: 'Formation' },
    { who: 'Ranaivo Hery',      amount: 300000, date: '01 août 2026', dest: 'Temple' }
  ]
};

/* ---------------------------------------------- Événements */
const EVENTS = [
  { id: 'ev1', type: 'Démonstration', title: 'Démonstration publique', date: '23 août 2026', time: '15:00', place: 'Cour d’honneur', people: 40, budget: 350000, revenue: 900000, state: 'Confirmé' },
  { id: 'ev2', type: 'Cérémonie',     title: 'Cérémonie des ceintures', date: '15 août 2026', time: '17:00', place: 'Grande salle', people: 62, budget: 180000, revenue: 0, state: 'Confirmé' },
  { id: 'ev3', type: 'Retraite',      title: 'Retraite de sept jours',  date: '02 sept. 2026', time: '06:00', place: 'Monastère', people: 24, budget: 620000, revenue: 1800000, state: 'Inscriptions' },
  { id: 'ev4', type: 'Compétition',   title: 'Tournoi régional',        date: '19 sept. 2026', time: '08:00', place: 'Antananarivo', people: 14, budget: 940000, revenue: 0, state: 'Préparation' },
  { id: 'ev5', type: 'Portes ouvertes', title: 'Journée portes ouvertes', date: '04 oct. 2026', time: '09:00', place: 'Monastère', people: 0, budget: 240000, revenue: 0, state: 'Brouillon' }
];

/* ---------------------------------------------- Documents */
const DOCS = [
  { id: 'd1', name: 'Certificat — Ceinture jaune, R. Andry', type: 'Certificat', date: '12 mars 2026', size: '218 Ko' },
  { id: 'd2', name: 'Rapport d’examen — Blanc → Jaune',      type: 'Rapport',    date: '12 mars 2026', size: '640 Ko' },
  { id: 'd3', name: 'Reçu de don — Rakoto Jean',             type: 'Reçu',       date: '10 août 2026', size: '96 Ko' },
  { id: 'd4', name: 'Rapport financier — Juillet 2026',      type: 'Finance',    date: '02 août 2026', size: '1,2 Mo' },
  { id: 'd5', name: 'Attestation de résidence — L. Mamy',    type: 'Attestation',date: '18 juil. 2026', size: '142 Ko' },
  { id: 'd6', name: 'Fiche élève — Miora Tantely',           type: 'Fiche',      date: '30 juin 2026', size: '310 Ko' }
];

/* ---------------------------------------------- Notifications */
const NOTIFS = [
  { id: 'n1', kind: 'alert',    title: 'Stock d’huile faible — 4 L restants', time: 'Il y a 20 min', unread: true,  to: 'stock' },
  { id: 'n2', kind: 'martial',  title: 'Examen Jaune → Orange dans 2 jours',  time: 'Il y a 2 h',    unread: true,  to: 'exams' },
  { id: 'n3', kind: 'users',    title: '2 élèves absents depuis 3 séances',   time: 'Il y a 5 h',    unread: true,  to: 'students' },
  { id: 'n4', kind: 'calendar', title: 'Entraînement demain à 07:00 — Formes', time: 'Hier',         unread: false, to: 'trainings' },
  { id: 'n5', kind: 'coin',     title: 'Cotisation reçue — Miora Tantely',    time: 'Hier',          unread: false, to: 'finance' },
  { id: 'n6', kind: 'temple',   title: 'Chambre B204 remise en service',      time: 'Il y a 2 j',    unread: false, to: 'rooms' }
];

/* ---------------------------------------------- Rôles & permissions */
const ROLES = [
  { id: 'r1', name: 'Super Administrateur', people: 1,  scope: 'Accès total, gestion des rôles' },
  { id: 'r2', name: 'Administrateur',       people: 2,  scope: 'Gestion complète sauf rôles' },
  { id: 'r3', name: 'Grand Maître',         people: 1,  scope: 'Arts martiaux, grades, examens' },
  { id: 'r4', name: 'Maître',               people: 3,  scope: 'Groupes, présences, évaluations' },
  { id: 'r5', name: 'Gestionnaire',         people: 2,  scope: 'Finances, stocks, chambres' },
  { id: 'r6', name: 'Personnel',            people: 6,  scope: 'Repas, travaux, entretien' },
  { id: 'r7', name: 'Élève',                people: 48, scope: 'Profil, parcours, paiements' }
];

const PERMISSIONS = [
  { group: 'Arts martiaux', items: [
    { n: 'Consulter les élèves',      on: true },
    { n: 'Prendre les présences',     on: true },
    { n: 'Évaluer un examen',         on: true },
    { n: 'Valider un grade',          on: false }
  ]},
  { group: 'Vie du monastère', items: [
    { n: 'Modifier le planning',      on: true },
    { n: 'Attribuer une chambre',     on: false },
    { n: 'Gérer les repas',           on: false }
  ]},
  { group: 'Finances', items: [
    { n: 'Consulter le solde',        on: false },
    { n: 'Enregistrer un don',        on: false },
    { n: 'Exporter un rapport',       on: false }
  ]}
];

/* ---------------------------------------------- Parcours martial */
const JOURNEY = [
  { time: 'Mars 2024',  title: 'Entrée au monastère',        meta: 'Admis dans le groupe débutant', state: 'done' },
  { time: 'Juin 2024',  title: 'Première forme apprise',     meta: 'Wu Bu Quan — 18 mouvements',    state: 'done' },
  { time: 'Mars 2026',  title: 'Ceinture jaune obtenue',     meta: 'Moyenne 16,4/20',               state: 'milestone' },
  { time: 'Juin 2026',  title: '42 entraînements suivis',    meta: '87 % de présence',              state: 'done' },
  { time: 'Août 2026',  title: 'Examen Jaune → Orange',      meta: '15 août — dans 2 jours',        state: 'now' },
  { time: '—',          title: 'Ceinture orange',            meta: '4 techniques restantes',        state: 'locked' }
];

/* ---------------------------------------------- Présences */
const ROLL = [
  { id: 'p1', present: true }, { id: 'p2', present: true },
  { id: 'p4', present: false }, { id: 'p6', present: true },
  { id: 'p7', present: true }, { id: 'p5', present: false },
  { id: 'p3', present: true }, { id: 'p8', present: true }
];

/* ---------------------------------------------- Recherche */
const SEARCH_INDEX = [
  { label: 'Rakoto Andry',  kind: 'Élève',        to: 'student' },
  { label: 'Rakoto Jean',   kind: 'Donateur',     to: 'member' },
  { label: 'Ceinture jaune',kind: 'Grade',        to: 'gradeDetail' },
  { label: 'Chambre A101',  kind: 'Chambre',      to: 'rooms' },
  { label: 'Examen Jaune → Orange', kind: 'Examen', to: 'exams' },
  { label: 'Reçu de don — Rakoto Jean', kind: 'Document', to: 'documents' }
];

/* ---------------------------------------------- Cotisations
   La spec prévoit un accès « Mes paiements » côté élève et un suivi
   côté intendance, mais aucun écran ne le portait. Montants en Ariary,
   cotisation mensuelle de base 25 000 Ar (12 000 pour les résidents,
   l'hébergement étant facturé à part). */
const DUES_FEE = { externe: 25000, resident: 12000 };

const DUES = STUDENTS.map((p) => {
  const fee = p.resident ? DUES_FEE.resident : DUES_FEE.externe;
  const late = p.dues === 'Retard' ? (p.id === 'p5' ? 3 : 1) : 0;
  return {
    id: p.id, fee, late,
    status: late === 0 ? 'À jour' : late === 1 ? 'En retard' : 'Critique',
    due: fee * late,
    last: late === 0 ? '2 août 2026' : late === 1 ? '4 juil. 2026' : '12 mai 2026'
  };
});

const DUES_SUMMARY = {
  collected: DUES.filter((d) => !d.late).reduce((a, d) => a + d.fee, 0),
  pending: DUES.reduce((a, d) => a + d.due, 0),
  get expected() { return this.collected + this.pending; },
  get rate() { return Math.round((this.collected / this.expected) * 100); }
};

/* ---------------------------------------------- Présents au monastère
   Sert les rails de l'accueil. Les groupes se recoupent volontairement :
   un maître présent apparaît sous « Présents » et sous « Maîtres ». */
const PRESENT_TODAY = ['p11', 'p12', 'p1', 'p2', 'p3', 'p6', 'p7', 'p8', 'p9', 'p10', 'p13', 'p17'];

const RAIL_FILTERS = [
  { key: 'present', label: 'Présents', match: (p) => PRESENT_TODAY.includes(p.id) },
  { key: 'eleves',  label: 'Élèves',   match: (p) => p.role === 'Élève' },
  { key: 'maitres', label: 'Maîtres',  match: (p) => p.role.includes('Maître') },
  { key: 'moines',  label: 'Moines',   match: (p) => p.role === 'Moine' },
  { key: 'staff',   label: 'Personnel',match: (p) => p.role === 'Personnel' },
  { key: 'visiteurs', label: 'Visiteurs', match: (p) => ['Visiteur', 'Ancien élève'].includes(p.role) }
];

/* ---------------------------------------------- Messagerie
   Les échanges du monastère ne sont pas un fil de discussion neutre :
   ils suivent les règles du lieu. Trois natures de canal —
     · `annonce` : lecture pour tous, écriture réservée aux maîtres ;
     · `group`   : un groupe de pratique ou un corps de la communauté ;
     · `direct`  : de personne à personne.
   Et une contrainte de temps : pendant les méditations et après
   l'extinction des lampes, le monastère observe le silence. */

const ME = 'p11';                       /* Maître Chen Wei */
const NOW_MIN = 16 * 60 + 4;            /* 16:04, l'heure de la maquette */

/* Plages de silence, en minutes depuis minuit. */
const SILENCE = [
  { from: 21 * 60, to: 24 * 60 + 5 * 60 + 30, label: 'Extinction des lampes', until: '05:30' },
  { from: 5 * 60 + 30, to: 6 * 60 + 30, label: 'Méditation du matin', until: '06:30' },
  { from: 18 * 60, to: 18 * 60 + 45, label: 'Méditation du soir', until: '18:45' }
];

/** Plage de silence en cours, ou null. */
function silenceNow(m = NOW_MIN) {
  return SILENCE.find((s) => (s.to > 24 * 60)
    ? (m >= s.from || m < s.to - 24 * 60)   /* plage qui franchit minuit */
    : (m >= s.from && m < s.to)) || null;
}

/** Prochaine plage de silence à venir aujourd'hui. */
function silenceNext(m = NOW_MIN) {
  const up = SILENCE.filter((s) => s.from > m).sort((a, b) => a.from - b.from)[0];
  if (!up) return null;
  const h = String(Math.floor(up.from / 60)).padStart(2, '0');
  return { at: `${h}:${String(up.from % 60).padStart(2, '0')}`, label: up.label };
}

const CONVERSATIONS = [
  { id: 'c1', kind: 'annonce', title: 'Annonces du monastère', people: 62,
    last: 'La cérémonie des ceintures est avancée à 17:00.', from: 'p11',
    time: '14:20', unread: 0, pinned: true },
  { id: 'c2', kind: 'group', title: 'Groupe intermédiaire', people: 24,
    last: 'Pensez à vos ceintures pour la séance de 16:00.', from: 'p12',
    time: '15:12', unread: 2 },
  { id: 'c3', kind: 'group', title: 'Maîtres et moines', people: 6,
    last: 'Trois candidats me semblent prêts pour l’examen.', from: 'p12',
    time: '13:48', unread: 0 },
  { id: 'c4', kind: 'direct', title: 'Rakoto Andry', with: 'p1',
    last: 'Merci Maître. Je travaillerai les appuis.', from: 'p1',
    time: '15:31', unread: 1 },
  { id: 'c5', kind: 'direct', title: 'Miora Tantely', with: 'p7',
    last: 'Je serai absente jeudi, une obligation familiale.', from: 'p7',
    time: '11:05', unread: 0 },
  { id: 'c6', kind: 'direct', title: 'Vololona Ranaivo', with: 'p14',
    last: 'Le stock d’huile ne tiendra pas la semaine.', from: 'p14',
    time: 'Hier', unread: 0 },
  { id: 'c7', kind: 'direct', title: 'Hasina Njaka', with: 'p9',
    last: 'Le jardin est prêt pour la démonstration.', from: 'p9',
    time: 'Hier', unread: 0 }
];

/* `day` ouvre un séparateur de journée. `from: ME` = message émis. */
const MESSAGES = {
  c4: [
    { day: 'Hier' },
    { from: 'p1', text: 'Maître, puis-je vous demander un conseil avant l’examen ?', time: '19:42' },
    { from: ME, text: 'Bien sûr. Que t’inquiète-t-il ?', time: '20:03' },
    { from: 'p1', text: 'La forme Wu Bu Quan. Je perds l’équilibre au troisième enchaînement.', time: '20:05' },
    { day: 'Aujourd’hui' },
    { from: ME, text: 'Ce n’est pas l’équilibre qui manque, c’est la patience. Tu enchaînes avant que le poids soit posé.', time: '15:20' },
    { from: ME, text: 'Reprends la séquence à moitié vitesse, vingt fois. Sans miroir.', time: '15:21' },
    { from: 'p1', text: 'Merci Maître. Je travaillerai les appuis.', time: '15:31', read: true }
  ],
  c2: [
    { day: 'Aujourd’hui' },
    { from: 'p12', text: 'Séance de 16:00 maintenue dans la cour d’honneur.', time: '09:14' },
    { from: 'p12', text: 'Pensez à vos ceintures pour la séance de 16:00.', time: '15:12' },
    { from: 'p6', text: 'Bien reçu, Maître.', time: '15:15' },
    { from: 'p7', text: 'Je serai là.', time: '15:18' }
  ],
  c1: [
    { day: 'Aujourd’hui' },
    { from: ME, text: 'La cérémonie des ceintures est avancée à 17:00. Les familles sont attendues à partir de 16:30.', time: '14:20' }
  ],
  c3: [
    { day: 'Aujourd’hui' },
    { from: 'p12', text: 'Trois candidats me semblent prêts pour l’examen.', time: '13:48' },
    { from: ME, text: 'Nous les verrons ensemble demain après la méditation.', time: '13:55' }
  ],
  c5: [
    { day: 'Aujourd’hui' },
    { from: 'p7', text: 'Je serai absente jeudi, une obligation familiale.', time: '11:05' },
    { from: ME, text: 'C’est noté. Rattrape la forme avec Naina à ton retour.', time: '11:20' }
  ],
  c6: [
    { day: 'Hier' },
    { from: 'p14', text: 'Le stock d’huile ne tiendra pas la semaine.', time: '17:40' }
  ],
  c7: [
    { day: 'Hier' },
    { from: 'p9', text: 'Le jardin est prêt pour la démonstration.', time: '16:02' }
  ]
};

/* ---------------------------------------------- Session courante */
const MONASTERY = {
  name: 'Long Shan',
  subtitle: 'Monastère & école d’arts martiaux',
  place: 'Antananarivo',
  todayLabel: 'Jeudi 13 août 2026',
  maxim: 'La maîtrise commence par la constance.',
  stats: { present: 24, residents: 18, exams: 3, attendance: 91 }
};
