/* ============================================================
   Rendre un écran comme l'application le rend.

   Un écran seul ne s'affiche pas : il lui faut le routeur, le cache
   de requêtes, et parfois une session. Composer tout cela dans
   chaque test le rendrait illisible et ferait diverger les
   conditions d'un test à l'autre.
   ============================================================ */
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Profil } from '../src/services/session';
import { useSession } from '../src/services/session';

/* Pas de réessai dans les tests : une requête qui échoue doit
   échouer TOUT DE SUITE, sinon chaque cas d'erreur attend une
   seconde pour rien et la suite devient interminable.

   Et un cache neuf par test : sans cela, le deuxième test lit la
   réponse du premier et passe pour de mauvaises raisons. */
function clientNeuf() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false }
    }
  });
}

export const PROFIL_ELEVE: Profil = {
  id: 'p1', numero: 'F04x042', nom: 'RAKOTONDRABE', prenom: 'Nirina',
  role: 'eleve', grade_id: 'gv', photo: null, super_admin: false
};

export const PROFIL_ADMIN: Profil = {
  id: 'p0', numero: 'F04x001', nom: 'IDEALY', prenom: 'Santatra',
  role: 'admin', grade_id: 'gn', photo: null, super_admin: false
};

/* LE SUPER ADMINISTRATEUR : un administrateur, PLUS le pouvoir de
   décider des rôles, de suspendre et de supprimer.

   Il est distinct de PROFIL_ADMIN à dessein. La plupart des tests
   doivent tourner en administrateur ORDINAIRE : c'est le cas le plus
   fréquent dans le club, et c'est celui où l'on risque de montrer un
   bouton qui mènerait à un refus du serveur. */
export const PROFIL_SUPER: Profil = {
  id: 'p9', numero: 'F04x000', nom: 'IDEALY', prenom: 'Santatra',
  role: 'admin', grade_id: 'gn', photo: null, super_admin: true
};

/* Le maître : ni élève ni administration. C'est le rôle qui a le
   plus servi à départager, depuis que l'encadrement tient l'image du
   club sans avoir la main sur les réglages d'argent. */
export const PROFIL_MAITRE: Profil = {
  id: 'p4', numero: 'F04x045', nom: 'RABEMANANJARA', prenom: 'Hery',
  role: 'maitre', grade_id: 'gn', photo: null, super_admin: false
};

export function poserProfil(profil: Profil | null) {
  useSession.setState({
    session: profil ? ({ access_token: 'x' } as never) : null,
    profil,
    chargement: false
  });
}

export function rendre(
  element: ReactElement,
  {
    route = '/',
    chemin,
    profil = PROFIL_ADMIN
  }: { route?: string; chemin?: string; profil?: Profil | null } = {}
) {
  poserProfil(profil);
  const client = clientNeuf();

  const Enveloppe = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        {/* « chemin » sert aux écrans qui lisent un paramètre
            d'adresse : sans une vraie Route, useParams rend un objet
            vide et l'écran croit qu'aucune fiche n'est demandée. */}
        {chemin ? (
          <Routes>
            <Route path={chemin} element={children} />
          </Routes>
        ) : (
          children
        )}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return render(element, { wrapper: Enveloppe });
}
