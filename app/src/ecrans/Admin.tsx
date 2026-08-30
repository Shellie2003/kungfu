/* ============================================================
   12 · Administration

   L'écran est celui de la maquette, avec les chiffres réels. Les
   rangées ne sont PAS des boutons : les écrans qu'elles annoncent
   n'existent pas encore. Un bouton qui ne fait rien se signale au
   premier essai et fait douter du reste ; une rangée inerte,
   annoncée comme telle, ne trompe personne.

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

const MEMBRES: [string, string, string][] = [
  ['Ajouter un étudiant', 'Fiche, photo, grade, biographie', 'plus'],
  ['Modifier une fiche', 'Corriger ou compléter', 'edit'],
  ['Changer un grade', 'Après un passage validé', 'edit'],
  ['Comptes et accès', 'Créer, suspendre, réinitialiser', 'lock']
];

const PUBLICATION: [string, string, string][] = [
  ['Publier une actualité', 'Sortie, compétition, réunion…', 'news'],
  ['Envoyer une notification', 'Prévient tous les membres', 'bell'],
  ['Créer un album', 'Puis y ajouter des photos', 'album'],
  ['Gérer les photos', 'Ajouter, classer, supprimer', 'album']
];

function Bloc({ titre, lignes }: { titre: string; lignes: [string, string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Surtitre>{titre}</Surtitre>
      <div className="list">
        {lignes.map(([t, d, ic]) => (
          <div key={t} className="listrow">
            <span className="tile tile--sm">
              <Icone nom={ic} taille={18} couleur="#0F5132" />
            </span>
            <span style={{ flexGrow: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{t}</b>
              <span
                style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
              >
                {d}
              </span>
            </span>
            <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
          </div>
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
              {moi ? `${moi.prenom} ${moi.nom}` : (reglages?.responsable ?? '')}
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

        <div className="warn">
          <i />
          <p>
            Ces huit écrans restent à construire : les rangées ci-dessus ne s’ouvrent pas
            encore. Ce qu’elles feront est déjà permis en base — l’administration est le seul
            rôle autorisé à modifier une fiche, les membres consultent sans jamais pouvoir
            écrire.
          </p>
        </div>
      </div>
    </div>
  );
}
