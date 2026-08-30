/* ============================================================
   La barre du bas.

   Cinq onglets, pas six : au-delà, les libellés se tronquent sur un
   téléphone. Les messages entrent donc à la place du Club, qui se
   consulte une ou deux fois par an et reste accessible depuis
   l'accueil.
   ============================================================ */
import { NavLink, useLocation } from 'react-router-dom';
import { Icone } from './Icone';

const ONGLETS = [
  { vers: '/accueil', libelle: 'Accueil', icone: 'home' },
  { vers: '/etudiants', libelle: 'Étudiants', icone: 'users' },
  { vers: '/messages', libelle: 'Messages', icone: 'chat' },
  { vers: '/casier', libelle: 'Casier', icone: 'news' },
  { vers: '/album', libelle: 'Album', icone: 'album' }
] as const;

/* ------------------------------------------------------------
   Quel onglet s'allume, pour un écran qui n'est pas un onglet.

   Le Club, les notifications et l'espace des maîtres ne sont pas
   des onglets, mais ils appartiennent à l'un d'eux — et la maquette
   le montre : sur l'écran du Club, c'est « Accueil » qui est en
   vert et en gras.

   Sans cette table, aucun onglet ne s'allumait sur ces écrans, et
   l'on ne savait plus où l'on était. C'est la comparaison avec la
   maquette qui l'a relevé, pas l'œil.
   ------------------------------------------------------------ */
const RATTACHEMENT: [RegExp, string][] = [
  [/^\/club/, '/accueil'],
  [/^\/notifications/, '/accueil'],
  [/^\/carte/, '/accueil'],
  [/^\/motdepasse/, '/etudiants'],
  [/^\/maitres/, '/messages']
];

export function ongletDe(chemin: string): string {
  for (const [motif, onglet] of RATTACHEMENT) {
    if (motif.test(chemin)) return onglet;
  }
  /* Sinon, l'onglet dont l'adresse préfixe celle-ci : /etudiants/42
     allume « Étudiants », /casier/7/participer allume « Casier ». */
  const direct = ONGLETS.find(
    (o) => chemin === o.vers || chemin.startsWith(`${o.vers}/`)
  );
  return direct?.vers ?? '';
}

export function Onglets() {
  const { pathname } = useLocation();
  const actif = ongletDe(pathname);

  return (
    <nav className="tabbar">
      {ONGLETS.map(({ vers, libelle, icone }) => {
        const on = vers === actif;
        return (
          <NavLink
            key={vers}
            to={vers}
            className="tabbar__item"
            aria-current={on ? 'page' : undefined}
          >
            <Icone
              nom={icone}
              taille={23}
              couleur={on ? '#0F5132' : '#7C8B82'}
              epaisseur={on ? 1.8 : 1.7}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: on ? 700 : 400,
                color: on ? '#0F5132' : '#7C8B82'
              }}
            >
              {libelle}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
