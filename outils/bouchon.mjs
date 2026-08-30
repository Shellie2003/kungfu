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
import { readFileSync, existsSync } from 'node:fs';
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
  role: 'admin', grade_id: 'gn', photo: null, debut: '2014-02-01', biographie: null
};

const avecGrade = (p) => ({ ...p, grades: GRADES.find((g) => g.id === p.grade_id) ?? null });

const maintenant = () => new Date().toISOString();

export const REPONSES = {
  grades: GRADES,
  profils: PROFILS.map(avecGrade),
  actualites: [
    { id: 'a1', titre: 'Sortie au lac Mantasoa', categorie: 'Sortie', texte: 'Départ 6h00 devant la salle.\n\nPrévoir le repas de midi.', date_evt: '2026-09-12', lieu: 'Devant la salle', image: null, cree_le: maintenant() },
    { id: 'a2', titre: 'Séance du mercredi à 17h30', categorie: 'Changement d’horaire', texte: 'Décalée d’une heure jusqu’à la fin décembre.', date_evt: null, lieu: null, image: null, cree_le: '2026-01-18T09:00:00Z' }
  ],
  notifications: [
    { id: 'n1', titre: 'Sortie', texte: 'Nouvelle sortie prévue ce samedi.', vers: '/casier/a1', lue_le: null, cree_le: maintenant() },
    { id: 'n2', titre: 'Compétition', texte: 'Huit membres sélectionnés.', vers: null, lue_le: '2026-01-01T00:00:00Z', cree_le: '2026-01-01T00:00:00Z' }
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
  albums: [
    { id: 'al1', titre: 'Compétitions', categorie: 'Compétitions', cree_le: '2026-01-01T00:00:00Z', photos: [{ id: 'ph1', chemin: null, legende: 'Tournoi', rang: 0 }] }
  ],
  salons: [
    { id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132', dernier_le: maintenant(), membres_salon: [{ lu_le: null }], messages: [{ texte: 'L’entraînement est maintenu.', cree_le: maintenant(), profils: { nom: 'RAHARISOA', prenom: 'Fanja' } }] },
    { id: 's2', type: 'maitres', titre: 'Espace des maîtres', couleur: '#0B2B1D', dernier_le: maintenant(), membres_salon: [{ lu_le: null }], messages: [] }
  ],
  messages: [
    { id: 'm1', texte: 'Bonsoir à tous.', cree_le: maintenant(), supprime_le: null, auteur_id: 'p2', profils: { nom: 'RABEMANANJARA', prenom: 'Hery' } },
    { id: 'm2', texte: 'Merci pour l’information.', cree_le: maintenant(), supprime_le: null, auteur_id: 'p1', profils: { nom: 'RAKOTONDRABE', prenom: 'Nirina' } }
  ],
  participations: [],
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
  tuteurs: []
};

/* ---------------------------------------------- Servir app/dist */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

export function servir(racine, port = 4173) {
  if (!existsSync(join(racine, 'index.html'))) {
    console.error('app/dist est vide. Lancez d’abord : cd app && npx vite build');
    process.exit(1);
  }
  const serveur = createServer((req, res) => {
    const chemin = normalize(decodeURI((req.url ?? '/').split('?')[0]));
    const fichier = join(racine, chemin === '/' ? 'index.html' : chemin);
    if (!fichier.startsWith(racine) || !existsSync(fichier)) {
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
export async function brancher(page, inconnues = []) {
  await page.route(`https://${PROJET}.supabase.co/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/auth/v1')) {
      return route.fulfill({ json: { user: { id: 'u1' } } });
    }
    const table = url.pathname.replace('/rest/v1/', '');
    const corps = REPONSES[table];
    if (corps === undefined) {
      inconnues.push(table);
      return route.fulfill({ json: [] });
    }

    const seul = (route.request().headers()['accept'] ?? '').includes('vnd.pgrst.object');

    /* La requête de session est la seule à demander « role » sur une
       ligne unique : c'est ainsi qu'on rend MA fiche, et non celle
       du premier venu de la liste. */
    if (table === 'profils' && seul && (url.searchParams.get('select') ?? '').includes('role')) {
      return route.fulfill({ json: avecGrade(MOI) });
    }

    let donnees = corps;
    const id = url.searchParams.get('id')?.replace('eq.', '');
    /* MA fiche se cherche par identifiant comme les autres — la
       carte de membre le fait. L'oublier vidait la carte, et le code
       QR devenait illisible faute de matricule à encoder. */
    if (id) {
      donnees = [...corps, ...(table === 'profils' ? [avecGrade(MOI)] : [])]
        .filter((l) => l.id === id);
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
