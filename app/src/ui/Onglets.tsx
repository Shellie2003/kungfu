/* ============================================================
   La barre du bas.

   Cinq onglets, pas six : au-delà, les libellés se tronquent sur un
   téléphone. Les messages entrent donc à la place du Club, qui se
   consulte une ou deux fois par an et reste accessible depuis
   l'accueil.
   ============================================================ */
import { NavLink } from 'react-router-dom';
import { Icone } from './Icone';

const ONGLETS = [
  { vers: '/accueil', libelle: 'Accueil', icone: 'home' },
  { vers: '/etudiants', libelle: 'Étudiants', icone: 'users' },
  { vers: '/messages', libelle: 'Messages', icone: 'chat' },
  { vers: '/casier', libelle: 'Casier', icone: 'news' },
  { vers: '/album', libelle: 'Album', icone: 'album' }
] as const;

export function Onglets() {
  return (
    <nav className="tabbar">
      {ONGLETS.map(({ vers, libelle, icone }) => (
        <NavLink key={vers} to={vers} className="tabbar__item">
          {({ isActive }) => (
            <>
              <Icone
                nom={icone}
                taille={23}
                couleur={isActive ? '#0F5132' : '#7C8B82'}
                epaisseur={isActive ? 1.8 : 1.7}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#0F5132' : '#7C8B82'
                }}
              >
                {libelle}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
