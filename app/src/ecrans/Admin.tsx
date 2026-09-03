/* ============================================================
   12 · Administration

   L'écran est celui de la maquette, avec les chiffres réels et les
   sept écrans qu'il annonce.

   « Créer un album » et « Gérer les photos » n'en font qu'un : on
   ne crée pas un album pour le laisser vide, et séparer les deux
   obligeait à revenir en arrière entre chaque geste.

   « Le club » n'était pas dans la maquette et s'est imposé : sans
   lui, changer un horaire ou le numéro MVola passait par le tableau
   de bord Supabase, c'est-à-dire par le développeur.

   L'accès à cet écran ne dépend pas de ce qui est écrit ici : un
   élève qui atteindrait l'adresse n'obtiendrait rien du serveur.
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Surtitre } from '../ui/base';
import { useMembres } from '../services/membres';
import { useActualites } from '../services/casier';
import { useAlbums, useReglages } from '../services/club';
import { useSession } from '../services/session';

type Rangee = [titre: string, detail: string, icone: string, vers: string];

const MEMBRES: Rangee[] = [
  ['Ajouter un étudiant', 'Fiche, photo, grade, biographie', 'plus', '/admin/fiche'],
  ['Modifier une fiche', 'Corriger ou compléter', 'edit', '/admin/fiches'],
  ['Changer un grade', 'Après un passage validé', 'edit', '/admin/grades'],
  ['Les grades du club', 'Créer, renommer, recolorer, ordonner', 'martial', '/admin/grades/liste'],
  ['Comptes et accès', 'Créer, suspendre, réinitialiser', 'lock', '/admin/comptes'],
  ['Imprimer les cartes', 'Dix par page A4, avec traits de coupe', 'shieldCheck', '/admin/impression']
];

const PUBLICATION: Rangee[] = [
  ['Publier une actualité', 'Sortie, compétition, réunion…', 'news', '/admin/publier'],
  ['Envoyer une notification', 'Prévient tous les membres', 'bell', '/admin/notifier'],
  ['Albums et photos', 'Créer, ajouter, supprimer', 'album', '/admin/albums'],
  ['Les catégories', 'Rubriques du casier et des albums, et leurs couleurs', 'flag', '/admin/categories']
];

/* ------------------------------------------------------------
   DEUX SECTIONS DE PLUS, ET POURQUOI.

   « Publication » en comptait dix, dont la fiche de présence, les
   versements d'une sortie et le journal d'accès à l'espace des
   maîtres. Aucun des trois ne publie quoi que ce soit.

   Un intitulé de section n'est pas une décoration : c'est ce qui
   permet de trouver un écran sans lire les dix lignes. Quand il
   cesse de décrire ce qu'il contient, la liste redevient une liste,
   et l'on parcourt tout à chaque fois. C'est exactement ce qui était
   arrivé — la section avait grossi d'une ligne à chaque
   fonctionnalité, et personne n'avait rouvert la question du
   classement.
   ------------------------------------------------------------ */
const VIE_DU_CLUB: Rangee[] = [
  ['Pointer les présences', 'En scannant les cartes, ou au matricule', 'shield', '/presences/pointer'],
  ['Inscriptions à valider', 'Les demandes en attente sur VOS sorties', 'shieldCheck', '/admin/a-valider'],
  ['Participations', 'Qui vient, et pointer les versements', 'shieldCheck', '/admin/participations'],
  ['Les salons', 'Ouvrir un fil par grade ou par événement', 'chat', '/admin/salons']
];

const REGLAGES: Rangee[] = [
  ['Le club', 'Horaires, responsable, contact, MVola', 'calendar', '/admin/club'],
  ['Journal d’accès', 'Qui est entré dans l’espace des maîtres', 'eyeOff', '/admin/journal']
];

function Bloc({ titre, lignes }: { titre: string; lignes: Rangee[] }) {
  const aller = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Surtitre>{titre}</Surtitre>
      <div className="list">
        {lignes.map(([t, d, ic, vers]) => (
          <button key={t} className="listrow" onClick={() => aller(vers)}>
            <span className="tile tile--sm">
              <Icone nom={ic} taille={18} couleur="#0F5132" />
            </span>
            <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
              <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{t}</b>
              <span
                style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
              >
                {d}
              </span>
            </span>
            <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Admin() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: membres } = useMembres();
  const { data: actus } = useActualites();
  const { data: albums } = useAlbums();
  const { data: reglages } = useReglages();

  const photos = (albums ?? []).reduce((s, a) => s + a.photos.length, 0);
  const stats: [string, string][] = [
    [membres ? String(membres.length) : '—', 'membres'],
    [actus ? String(actus.length) : '—', 'actualités'],
    [albums ? String(photos) : '—', 'photos']
  ];

  return (
    <div className="phone">
      <div
        style={{
          background: '#0E2119',
          padding: '20px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="tapicon"
            onClick={() => aller('/accueil')}
            aria-label="Retour"
            style={{ marginLeft: -10 }}
          >
            <Icone nom="back" taille={22} couleur="#FFF" epaisseur={2} />
          </button>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <p className="display" style={{ fontSize: 18, fontWeight: 600, color: '#FFF' }}>
              Administration
            </p>
            <p style={{ fontSize: 12, color: '#9BB0A5', marginTop: 2 }}>
              {/* « NOM Prénom », comme partout ailleurs dans
                  l'application — l'annuaire, la file de validation,
                  la liste des participations. Cet écran écrivait
                  « Prénom NOM », et deux façons d'écrire un nom dans
                  la même application, c'est une hésitation que le
                  lecteur porte à chaque fois. */}
              {moi ? `${moi.nom} ${moi.prenom}` : (reglages?.responsable ?? '')}
            </p>
          </div>
        </div>

        <div className="stats">
          {stats.map(([n, l]) => (
            <div
              key={l}
              style={{
                background: '#1B3128',
                borderRadius: 12,
                padding: '13px 10px',
                textAlign: 'center'
              }}
            >
              <p className="display" style={{ fontSize: 20, color: '#FFF' }}>
                {n}
              </p>
              <p style={{ fontSize: 11, color: '#9BB0A5', marginTop: 2 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: '20px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <Bloc titre="Membres" lignes={MEMBRES} />
        <Bloc titre="Publication" lignes={PUBLICATION} />
        <Bloc titre="Vie du club" lignes={VIE_DU_CLUB} />
        <Bloc titre="Réglages" lignes={REGLAGES} />

        <div className="warn">
          <i />
          <p>
            L’administration est le seul rôle autorisé à écrire ; les membres consultent. Ce
            n’est pas cet écran qui le décide — c’est la base, et elle refuserait les mêmes
            gestes depuis n’importe quelle autre application.
          </p>
        </div>
      </div>
    </div>
  );
}
