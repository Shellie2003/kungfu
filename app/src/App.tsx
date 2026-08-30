/* ============================================================
   Le squelette de l'application : session, routes, onglets.

   Trois états seulement, et l'ordre compte :
     1. on ne sait pas encore  → on n'affiche rien, on n'oriente pas
     2. pas de session         → l'écran de connexion, seul
     3. session                → l'application

   Le premier état existe parce que lire le jeton stocké prend un
   instant. Sans lui, l'application afficherait la connexion à
   chaque démarrage, avant de sauter à l'accueil.
   ============================================================ */
import { useEffect } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Onglets } from './ui/Onglets';
import { Connexion } from './ecrans/Connexion';
import { Accueil } from './ecrans/Accueil';
import { Etudiants } from './ecrans/Etudiants';
import { Profil } from './ecrans/Profil';
import { Casier, Actualite } from './ecrans/Casier';
import { Album, Photo } from './ecrans/Album';
import { Club } from './ecrans/Club';
import { Notifications } from './ecrans/Notifications';
import { Messages } from './ecrans/Messages';
import { Salon, Maitres } from './ecrans/Salon';
import { Moderation } from './ecrans/Moderation';
import { Participation } from './ecrans/Participation';
import { MotDePasse } from './ecrans/MotDePasse';
import { CarteMembre } from './ecrans/CarteMembre';
import { Admin } from './ecrans/Admin';
import { AdminFiche } from './ecrans/admin/Fiche';
import { AdminChoisirFiche, AdminGrade } from './ecrans/admin/Membres';
import { AdminAlbums, AdminNotifier, AdminPublier } from './ecrans/admin/Publication';
import { AdminComptes } from './ecrans/admin/Comptes';
import { AdminClub } from './ecrans/admin/Club';

import { seConnecter } from './services/supabase';
import { estAdmin, useEcouteSession, useSession } from './services/session';

/* Un réessai suffit : sur un réseau qui coupe, insister trois fois
   fait attendre une minute pour le même échec. Les données ne
   changent pas à la seconde — une minute de fraîcheur évite de
   redemander l'annuaire à chaque aller-retour entre deux onglets. */
const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false } }
});

/* ------------------------------------------------------------
   Le bouton « retour » d'Android.

   Sans cela, il ferme l'application depuis n'importe quel écran —
   ce qui, au milieu d'une conversation, donne l'impression d'un
   plantage. Ici il remonte d'un écran, et ne quitte que depuis
   l'accueil.
   ------------------------------------------------------------ */
const RACINES = ['/accueil', '/etudiants', '/messages', '/casier', '/album'];

function RetourAndroid() {
  const aller = useNavigate();
  const ou = useLocation();

  useEffect(() => {
    let retirer: (() => void) | undefined;
    /* Le module n'existe que dans l'application empaquetée. Dans un
       navigateur, l'import échoue et il n'y a rien à faire : le
       navigateur a déjà son propre bouton retour. */
    import('@capacitor/app')
      .then(({ App }) =>
        App.addListener('backButton', ({ canGoBack }) => {
          if (RACINES.includes(window.location.hash.replace('#', ''))) {
            void App.exitApp();
          } else if (canGoBack) {
            aller(-1);
          } else {
            aller('/accueil');
          }
        })
      )
      .then((h) => {
        retirer = () => void h.remove();
      })
      .catch(() => undefined);

    return () => retirer?.();
  }, [aller, ou.pathname]);

  return null;
}

/* Changer d'écran doit ramener en haut. Le navigateur garde sinon
   la position de l'écran précédent, et l'on arrive au milieu d'une
   fiche sans comprendre pourquoi. */
function RemonterEnHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector('.phone')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/* ------------------------------------------------------------
   L'application connectée.
   ------------------------------------------------------------ */
function Connectee() {
  const profil = useSession((e) => e.profil);
  const { pathname } = useLocation();

  /* Les écrans qui occupent tout l'écran n'ont pas la barre du bas :
     une photo en plein cadre et l'administration ne sont pas des
     onglets, et la barre y volerait de la place à des formulaires
     déjà longs. */
  const pleinEcran = pathname.startsWith('/album/') || pathname.startsWith('/admin');

  return (
    <div className="phone">
      <RetourAndroid />
      <RemonterEnHaut />

      <Routes>
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/etudiants" element={<Etudiants />} />
        <Route path="/etudiants/:id" element={<Profil />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Salon />} />
        <Route path="/maitres" element={<Maitres />} />
        {/* La modération n'est pas gardée par l'application : un élève
            qui l'atteindrait ne verrait que SES propres signalements,
            ce que la base lui accorde déjà. */}
        <Route path="/signalements" element={<Moderation />} />
        <Route path="/casier" element={<Casier />} />
        <Route path="/casier/:id" element={<Actualite />} />
        <Route path="/casier/:id/participer" element={<Participation />} />
        <Route path="/album" element={<Album />} />
        <Route path="/album/:id/:index" element={<Photo />} />
        <Route path="/club" element={<Club />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/carte" element={<CarteMembre />} />
        <Route path="/motdepasse" element={<MotDePasse />} />
        {/* L'écran d'administration n'est pas une porte : y accéder
            ne donne rien de plus, puisque le serveur refuse tout ce
            que le rôle n'autorise pas. La route est masquée pour ne
            pas encombrer, pas pour protéger. */}
        {estAdmin(profil) && <Route path="/admin" element={<Admin />} />}
        {estAdmin(profil) && <Route path="/admin/fiche" element={<AdminFiche />} />}
        {estAdmin(profil) && <Route path="/admin/fiche/:id" element={<AdminFiche />} />}
        {estAdmin(profil) && <Route path="/admin/fiches" element={<AdminChoisirFiche />} />}
        {estAdmin(profil) && <Route path="/admin/grades" element={<AdminGrade />} />}
        {estAdmin(profil) && <Route path="/admin/comptes" element={<AdminComptes />} />}
        {estAdmin(profil) && <Route path="/admin/publier" element={<AdminPublier />} />}
        {estAdmin(profil) && <Route path="/admin/notifier" element={<AdminNotifier />} />}
        {estAdmin(profil) && <Route path="/admin/albums" element={<AdminAlbums />} />}
        {estAdmin(profil) && <Route path="/admin/club" element={<AdminClub />} />}
        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>

      {!pleinEcran && <Onglets />}
    </div>
  );
}

function Racine() {
  const { session, chargement } = useSession();
  useEcouteSession();

  /* Rien pendant qu'on lit le jeton : un écran de chargement qui
     dure deux dixièmes de seconde clignote plus qu'il n'informe. */
  if (chargement) return <div className="phone" />;

  if (!session) return <Connexion connecter={seConnecter} />;

  return <Connectee />;
}

export default function App() {
  return (
    <QueryClientProvider client={client}>
      {/* Routes par ancre : Capacitor sert les fichiers depuis le
          disque de l'application, où une adresse « propre » comme
          /etudiants ne correspond à aucun fichier et rend 404. */}
      <HashRouter>
        <Racine />
      </HashRouter>
    </QueryClientProvider>
  );
}
