/* ============================================================
   Les écrans portés de la maquette vers l'application.

   Une seule liste, employée par outils/comparer.mjs (qui mesure
   l'écart) et par outils/batir-apercu.mjs (qui publie l'aperçu).
   Porter un écran, c'est ajouter une ligne ici.
   ============================================================ */
/* « props » : ce que la route fournirait à la vue. Ici un bouchon,
   puisque la comparaison ne se connecte à rien — la vue est rendue
   telle quelle, sans serveur. */
export const ECRANS = [
  {
    cle: 'connexion', titre: 'Connexion', module: 'mobile/ecrans/Connexion.tsx',
    props: `{ connecter: async () => ({ ok: false, message: 'Aperçu : la connexion n’est pas branchée.' }) }`,
    /* La maquette montre des valeurs d'exemple dans les champs ;
       l'application démarre avec des champs vides, ce qui est le
       comportement voulu. Expressions régulières, appliquées aux
       deux côtés. */
    exemples: ['^F04x\\d+$', '^•+$']
  },
  {
    cle: 'etudiants', titre: 'Étudiants', module: 'mobile/ecrans/Etudiants.tsx',
    /* Le jeu d'essai de la maquette, à l'identique : la comparaison
       doit porter sur les mêmes données des deux côtés. */
    props: `{
      filtres: ['Tous', 'Blanche', 'Jaune', 'Orange', 'Verte'],
      membres: [
        { id: '1', nom: 'RAKOTONDRABE',     prenom: 'Nirina',      grade: { nom: 'Ceinture verte',   couleur: '#4E9C57' } },
        { id: '2', nom: 'RASOAMANANA',      prenom: 'Fanjaniaina', grade: { nom: 'Ceinture jaune',   couleur: '#D8A93A' } },
        { id: '3', nom: 'ANDRIANJAFY',      prenom: 'Tokiniaina',  grade: { nom: 'Ceinture bleue',   couleur: '#3E6E9C' } },
        { id: '4', nom: 'RABEMANANJARA',    prenom: 'Hery',        grade: { nom: 'Ceinture noire',   couleur: '#1E2320' } },
        { id: '5', nom: 'RAZAFIMAHATRATRA', prenom: 'Miora',       grade: { nom: 'Ceinture orange',  couleur: '#C97A32' } },
        { id: '6', nom: 'RANDRIAMAMPIONONA', prenom: 'Toky',       grade: { nom: 'Ceinture blanche', couleur: '#E7EDE9' } }
      ]
    }`,
    /* La maquette annonce « 64 membres », la vue compte ce qu'elle
       reçoit. Le décompte dépend du jeu de données : c'est voulu. */
    exemples: ['^\\d+ membres? · classés par grade$']
  }
];
