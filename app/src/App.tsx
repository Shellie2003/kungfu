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
import { Suspense, lazy, useEffect } from 'react';
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
import { NouvelleConversation } from './ecrans/NouvelleConversation';
import { Participation } from './ecrans/Participation';
import { MotDePasse } from './ecrans/MotDePasse';
import { CarteMembre } from './ecrans/CarteMembre';
import { MesPresences } from './ecrans/MesPresences';

/* ------------------------------------------------------------
   Les écrans d'encadrement arrivent SÉPARÉMENT.

   Ils étaient chargés avec le reste : le paquet unique pesait
   633 ko, et il était téléchargé EN ENTIER avant que l'écran de
   connexion s'affiche — par les soixante-quatre membres, dont
   soixante et un sont élèves et n'ouvriront jamais aucun de ces
   douze écrans. La planche d'impression et son générateur de codes
   QR, la gestion des comptes, le journal d'accès : tout cela
   attendait sur la ligne d'Antananarivo avant le premier mot.

   « import() » les met dans des fichiers à part, demandés le jour
   où l'on ouvre l'écran. Ce qui reste dans le premier paquet est ce
   dont TOUT LE MONDE a besoin.

   Un élève ne les demande jamais : les routes n'existent pas pour
   lui, et un fichier qu'aucune route ne mène nulle part n'est
   jamais téléchargé.
   ------------------------------------------------------------ */
const Admin = lazy(() => import('./ecrans/Admin').then((m) => ({ default: m.Admin })));
const AdminFiche = lazy(() =>
  import('./ecrans/admin/Fiche').then((m) => ({ default: m.AdminFiche }))
);
const AdminChoisirFiche = lazy(() =>
  import('./ecrans/admin/Membres').then((m) => ({ default: m.AdminChoisirFiche }))
);
const AdminGrade = lazy(() =>
  import('./ecrans/admin/Membres').then((m) => ({ default: m.AdminGrade }))
);
const AdminAlbums = lazy(() =>
  import('./ecrans/admin/Publication').then((m) => ({ default: m.AdminAlbums }))
);
const AdminNotifier = lazy(() =>
  import('./ecrans/admin/Publication').then((m) => ({ default: m.AdminNotifier }))
);
const AdminPublier = lazy(() =>
  import('./ecrans/admin/Publication').then((m) => ({ default: m.AdminPublier }))
);
const AdminComptes = lazy(() =>
  import('./ecrans/admin/Comptes').then((m) => ({ default: m.AdminComptes }))
);
const AdminClub = lazy(() =>
  import('./ecrans/admin/Club').then((m) => ({ default: m.AdminClub }))
);
const AdminAValider = lazy(() =>
  import('./ecrans/admin/AValider').then((m) => ({ default: m.AdminAValider }))
);
const AdminParticipations = lazy(() =>
  import('./ecrans/admin/Participations').then((m) => ({ default: m.AdminParticipations }))
);
const AdminPresences = lazy(() =>
  import('./ecrans/admin/Presences').then((m) => ({ default: m.AdminPresences }))
);
const AdminCategories = lazy(() =>
  import('./ecrans/admin/Categories').then((m) => ({ default: m.AdminCategories }))
);
const AdminGrades = lazy(() =>
  import('./ecrans/admin/Grades').then((m) => ({ default: m.AdminGrades }))
);
const AdminSalons = lazy(() =>
  import('./ecrans/admin/Salons').then((m) => ({ default: m.AdminSalons }))
);
const AdminOccupation = lazy(() =>
  import('./ecrans/admin/Occupation').then((m) => ({ default: m.AdminOccupation }))
);
const AdminJournal = lazy(() =>
  import('./ecrans/admin/Journal').then((m) => ({ default: m.AdminJournal }))
);
const AdminImpression = lazy(() =>
  import('./ecrans/admin/Impression').then((m) => ({ default: m.AdminImpression }))
);

import { seConnecter } from './services/supabase';
import { estAdmin, estMaitre, useEcouteSession, useSession } from './services/session';
import { VERSION, useMiseAJour, versionCourte } from './services/version';

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

      {/* Le temps d'aller chercher un écran d'encadrement, on ne
          montre rien plutôt qu'un mot qui clignote : le fichier vient
          du disque du téléphone, l'attente se compte en millisecondes,
          et un « Chargement… » qui apparaît puis disparaît aussitôt
          est plus dérangeant que le silence. Les écrans du quotidien,
          eux, sont déjà là et ne passent jamais par ici. */}
      <Suspense fallback={null}>
      <Routes>
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/etudiants" element={<Etudiants />} />
        <Route path="/etudiants/:id" element={<Profil />} />
        <Route path="/messages" element={<Messages />} />
        {/* Avant « /messages/:id » : sinon « nouvelle » serait pris
            pour un identifiant de salon. */}
        <Route path="/messages/nouvelle" element={<NouvelleConversation />} />
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
        <Route path="/presences" element={<MesPresences />} />
        {/* Le pointage est ouvert aux MAÎTRES, pas seulement à
            l'administration : c'est le maître qui tient la salle, et
            faire dépendre l'appel de la présence d'un administrateur
            reviendrait à ce qu'il ne se fasse pas. La base dit la
            même chose — « l'encadrement pointe ». */}
        {estMaitre(profil) && <Route path="/presences/pointer" element={<AdminPresences />} />}
        {/* L'écran d'administration n'est pas une porte : y accéder
            ne donne rien de plus, puisque le serveur refuse tout ce
            que le rôle n'autorise pas. La route est masquée pour ne
            pas encombrer, pas pour protéger. */}
        {estAdmin(profil) && <Route path="/admin" element={<Admin />} />}
        {estAdmin(profil) && <Route path="/admin/fiche" element={<AdminFiche />} />}
        {estAdmin(profil) && <Route path="/admin/fiche/:id" element={<AdminFiche />} />}
        {estAdmin(profil) && <Route path="/admin/fiches" element={<AdminChoisirFiche />} />}
        {estAdmin(profil) && <Route path="/admin/grades" element={<AdminGrade />} />}
        {estAdmin(profil) && (
          <Route path="/admin/grades/liste" element={<AdminGrades />} />
        )}
        {estAdmin(profil) && <Route path="/admin/comptes" element={<AdminComptes />} />}
        {estAdmin(profil) && <Route path="/admin/publier" element={<AdminPublier />} />}
        {estAdmin(profil) && <Route path="/admin/notifier" element={<AdminNotifier />} />}
        {/* La route suit la PERMISSION, pas le nom du dossier : les
            albums sont ouverts à l'encadrement depuis la migration
            0013, et laisser la route en « admin seul » aurait envoyé
            un maître sur une adresse inexistante après avoir cliqué
            un bouton qu'on venait de lui montrer. La moitié d'une
            permission est une panne. */}
        {estMaitre(profil) && <Route path="/admin/albums" element={<AdminAlbums />} />}
        {estAdmin(profil) && <Route path="/admin/club" element={<AdminClub />} />}
        {estAdmin(profil) && (
          <Route path="/admin/categories" element={<AdminCategories />} />
        )}
        {estAdmin(profil) && <Route path="/admin/salons" element={<AdminSalons />} />}
        {estAdmin(profil) && <Route path="/admin/journal" element={<AdminJournal />} />}
        {estAdmin(profil) && (
          <Route path="/admin/occupation" element={<AdminOccupation />} />
        )}
        {estAdmin(profil) && <Route path="/admin/impression" element={<AdminImpression />} />}
        {estAdmin(profil) && (
          <Route path="/admin/a-valider" element={<AdminAValider />} />
        )}
        {estAdmin(profil) && (
          <Route path="/admin/participations" element={<AdminParticipations />} />
        )}
        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
      </Suspense>

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

/* ---------------------------------------------- Une version plus récente

   « Je veux voir chaque mise à jour en rafraîchissant le
   navigateur. » Le rafraîchissement suffit — la page n'est pas mise
   en cache, les fichiers portent une empreinte, il n'y a pas de
   service worker qui retiendrait l'ancienne. Ce qui manquait était
   de SAVOIR : la publication prend une à deux minutes, et pendant
   ce temps un écran inchangé ne dit pas s'il est vieux ou à jour.

   Ce bandeau ne rafraîchit RIEN tout seul, et c'est délibéré :
   recharger la page sous les doigts de quelqu'un qui écrit un
   message lui ferait perdre ce qu'il tape. Il propose, on décide. */
function Nouveaute() {
  const neuve = useMiseAJour();
  if (!neuve) return null;

  return (
    <div
      role="status"
      className="banner"
      style={{ margin: '8px 12px 0', gap: 10 }}
    >
      <span style={{ flexGrow: 1 }}>
        Version {versionCourte(neuve)} publiée — vous avez {versionCourte(VERSION)}.
      </span>
      <button className="link" onClick={() => window.location.reload()}>
        Rafraîchir
      </button>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={client}>
      {/* Routes par ancre : Capacitor sert les fichiers depuis le
          disque de l'application, où une adresse « propre » comme
          /etudiants ne correspond à aucun fichier et rend 404. */}
      <HashRouter>
        <Nouveaute />
        <Racine />
      </HashRouter>
    </QueryClientProvider>
  );
}
