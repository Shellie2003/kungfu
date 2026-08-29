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
       comportement voulu. On les déclare ici plutôt que de les
       laisser compter comme un écart. */
    exemples: ['F04x042', '••••••••']
  },
  { cle: 'etudiants', titre: 'Étudiants', module: 'mobile/ecrans/Etudiants.tsx' }
];
