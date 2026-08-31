/* ============================================================
   02 · Accueil
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Emblem } from '../ui/Emblem';
import { Carte, Surtitre } from '../ui/base';
import { useActualites, useNotifications, jourEtMois, teinte } from '../services/casier';
import { useMembres } from '../services/membres';
import { useHoraires, useReglages } from '../services/club';
import { useUrl } from '../services/stockage';
import { estAdmin, estMaitre, useSession } from '../services/session';

export function Accueil() {
  const aller = useNavigate();
  const profil = useSession((e) => e.profil);
  const { data: actus } = useActualites();
  const { data: notifs } = useNotifications();
  const { data: membres } = useMembres();
  const { data: horaires } = useHoraires();
  const { data: reglages } = useReglages();
  /* La photo du club vient d'un réglage : c'est un CHEMIN dans le
     seau, dont il faut une adresse signée. */
  const photoClub = useUrl('album', reglages?.photo_club ?? null);

  const nonlues = (notifs ?? []).filter((n) => !n.lue_le).length;
  const derniere = (actus ?? [])[0];
  const deux = (actus ?? []).slice(0, 2);

  /* Les trois chiffres viennent de la base, pas d'une constante :
     le club recrute, et « 64 membres » serait faux dans un mois. */
  const stats: [string, string][] = [
    [membres ? String(membres.length) : '—', 'membres'],
    [horaires ? String(horaires.length) : '—', 'séances / sem.'],
    [reglages?.fondation ?? '—', 'fondé en']
  ];

  return (
    <>
      <div className="hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem taille={26} />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            {/* Le nom du club vient du RÉGLAGE, comme sur la carte
                de membre — il était écrit ici en dur, et le corriger
                dans l'administration changeait la carte plus bas
                sans changer l'en-tête. Deux noms différents sur le
                même écran.

                Le repli est le texte de la maquette, mot pour mot :
                tant que le club n'a rien saisi, l'écran est celui
                qu'il a validé. */}
            <p
              className="display"
              style={{ fontSize: 17, color: '#FFF', letterSpacing: '.02em', lineHeight: '20px' }}
            >
              {(reglages?.nom_club ?? 'Kung-fu Waishi').toUpperCase()}
            </p>
            <p style={{ fontSize: 13, color: 'var(--sur-vert)', marginTop: 2 }}>
              {reglages?.lieu_club ?? 'Analamahitsy · Antananarivo'}
            </p>
          </div>
          <button
            className="tapicon"
            onClick={() => aller('/notifications')}
            aria-label={
              nonlues ? `Notifications, ${nonlues} non lues` : 'Notifications'
            }
            style={{ position: 'relative' }}
          >
            <Icone nom="bell" taille={22} couleur="#FFF" />
            {nonlues > 0 && <span className="dot">{nonlues}</span>}
          </button>
        </div>

        {derniere && (
          <div className="hero__note">
            <Icone nom="news" taille={20} couleur="#7FD9A8" />
            <div style={{ flexGrow: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', lineHeight: '19px' }}>
                {derniere.titre}
              </p>
              <p style={{ fontSize: 12, color: 'var(--sur-vert)', marginTop: 3 }}>
                Consultez le casier pour les détails.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          padding: '22px 20px 26px'
        }}
      >
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* La photo du club, quand il l'a fournie. L'emplacement
              vide reste sinon, et le DIT : une image d'illustration
              prise ailleurs ferait plus joli et serait un mensonge. */}
          {photoClub ? (
            <img
              src={photoClub}
              alt=""
              style={{ height: 168, width: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : estAdmin(profil) ? (
            /* L'emplacement vide DEVIENT le bouton, et c'est tout
               l'intérêt : le club cherchait « la possibilité
               d'ajouter une photo » et la photo manquante était sous
               ses yeux, muette. On l'ajoute là où l'on constate
               qu'elle manque, plutôt qu'à trois appuis de là.

               Même boîte, même icône, même texte : la géométrie de
               la maquette est intacte. Seul le nom accessible et le
               curseur changent. */
            <button
              className="ph"
              style={{ height: 168, width: '100%', cursor: 'pointer' }}
              onClick={() => aller('/admin/club')}
              aria-label="Ajouter la photo du club"
            >
              <Icone nom="martial" taille={52} couleur="#8FB3A0" epaisseur={1.4} />
              <p className="ph__label">Photo du club à fournir</p>
            </button>
          ) : (
            <div className="ph" style={{ height: 168 }}>
              <Icone nom="martial" taille={52} couleur="#8FB3A0" epaisseur={1.4} />
              <p className="ph__label">Photo du club à fournir</p>
            </div>
          )}
          <div style={{ padding: 18 }}>
            <p className="display" style={{ fontSize: 19, lineHeight: '24px' }}>
              {reglages?.nom_club ?? 'Kung-fu Waishi Analamahitsy'}
            </p>
            <p style={{ fontSize: 14, lineHeight: '22px', color: '#59685F', marginTop: 8 }}>
              {/* Deux présentations, pas une : la maquette en montre
                  une courte ici et une longue sur l'écran du Club.
                  N'en garder qu'une obligeait le club à choisir entre
                  un accueil bavard et une page de club maigre. */}
              {reglages?.presentation_courte ??
                'Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière.'}
            </p>
            <button className="linkrow" onClick={() => aller('/club')}>
              En savoir plus sur le club
              <Icone nom="chev" taille={16} couleur="#12613C" epaisseur={2} />
            </button>
          </div>
        </div>

        <div className="stats">
          {stats.map(([n, l]) => (
            <div key={l} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <p className="display" style={{ fontSize: 22, color: '#0F5132' }}>
                {n}
              </p>
              <p style={{ fontSize: 11, color: '#59685F', marginTop: 3 }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="rowhead">
            {/* « Vaovao farany » — les dernières nouvelles. Le club
                parle malgache entre ses murs ; le titre reste dans
                sa langue, le reste de l'écran en français. */}
            <Surtitre>Vaovao farany</Surtitre>
            <button className="link" onClick={() => aller('/casier')}>
              Tout le casier
            </button>
          </div>

          {deux.map((a) => {
            const { jour, mois } = jourEtMois(a.date_evt ?? a.cree_le);
            const [cc, cb] = teinte(a.categorie);
            return (
              <button
                key={a.id}
                className="card newsrow"
                onClick={() => aller(`/casier/${a.id}`)}
              >
                <span className="datebox">
                  <b>{jour}</b>
                  <i>{mois}</i>
                </span>
                <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                  <span className="tag" style={{ color: cc, background: cb }}>
                    {a.categorie}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: '20px',
                      marginTop: 7
                    }}
                  >
                    {a.titre}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13,
                      color: '#59685F',
                      lineHeight: '18px',
                      marginTop: 4
                    }}
                  >
                    {a.texte.split('.')[0]}.
                  </span>
                </span>
              </button>
            );
          })}

          {/* Le casier vide, et — pour l'administration — de quoi
              le remplir. « C'est pareil pour les dernières
              actualités » : la photo du club et l'actualité se
              constatent manquantes au même endroit, sur cet écran,
              et se posaient toutes deux ailleurs.

              Le raccourci n'est PAS une permission : le serveur
              refuse déjà ce que le rôle n'autorise pas. Il n'apparaît
              qu'à qui peut s'en servir, ce qui est une question
              d'encombrement. */}
          {actus && actus.length === 0 && (
            <Carte>
              <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#59685F' }}>
                Aucune actualité pour le moment.
              </p>
              {estAdmin(profil) && (
                <button
                  className="linkrow"
                  onClick={() => aller('/admin/publier')}
                  style={{ marginTop: 4 }}
                >
                  Publier la première
                  <Icone nom="chev" taille={16} couleur="#12613C" epaisseur={2} />
                </button>
              )}
            </Carte>
          )}
        </div>

        {/* Trois écrans n'avaient aucune porte d'entrée : la carte de
            membre, sa propre fiche, et l'administration. Les routes
            existaient, rien n'y menait — un compte d'administration
            ne montrait donc rien de plus qu'un compte d'élève.

            Ce bloc est cette porte. L'administration n'y figure que
            pour qui a le rôle, mais ce n'est pas ce qui protège : le
            serveur refuse de toute façon ce que le rôle n'autorise
            pas. C'est de la place gagnée, pas une serrure.

            Il est EN BAS, après les actualités, et c'est délibéré :
            la maquette n'a pas ce bloc, et le poser plus haut
            décalait tout ce qu'elle montre. Mesuré — la comparaison
            perdait « Vaovao farany » et les deux actualités, sortis
            du premier écran. En bas, la maquette reste intacte et
            l'ajout reste atteignable. */}
        {profil && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Mon espace</Surtitre>
            <div className="list">
              <button className="listrow" onClick={() => aller('/carte')}>
                <span className="tile tile--sm">
                  <Icone nom="shieldCheck" taille={18} couleur="#0F5132" />
                </span>
                <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                    Ma carte de membre
                  </b>
                  <span
                    style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
                  >
                    {profil.numero} · avec le code à présenter
                  </span>
                </span>
                <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
              </button>

              <button className="listrow" onClick={() => aller(`/etudiants/${profil.id}`)}>
                <span className="tile tile--sm">
                  <Icone nom="users" taille={18} couleur="#0F5132" />
                </span>
                <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Ma fiche</b>
                  <span
                    style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
                  >
                    Et le changement de mot de passe
                  </span>
                </span>
                <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
              </button>

              <button className="listrow" onClick={() => aller('/presences')}>
                <span className="tile tile--sm">
                  <Icone nom="calendar" taille={18} couleur="#0F5132" />
                </span>
                <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                    Mon assiduité
                  </b>
                  <span
                    style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
                  >
                    Les séances pointées, sur douze mois
                  </span>
                </span>
                <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
              </button>

              {/* Le pointage revient au MAÎTRE, pas seulement à
                  l'administration : c'est lui qui tient la salle. */}
              {estMaitre(profil) && (
                <button className="listrow" onClick={() => aller('/presences/pointer')}>
                  <span className="tile tile--sm">
                    <Icone nom="shield" taille={18} couleur="#0F5132" />
                  </span>
                  <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                    <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                      Pointer les présences
                    </b>
                    <span
                      style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
                    >
                      En scannant les cartes, ou au matricule
                    </span>
                  </span>
                  <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
                </button>
              )}

              {estAdmin(profil) && (
                <button className="listrow" onClick={() => aller('/admin')}>
                  <span className="tile tile--sm">
                    <Icone nom="lock" taille={18} couleur="#0F5132" />
                  </span>
                  <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                    <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                      Administration
                    </b>
                    <span
                      style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}
                    >
                      Membres, publications, comptes
                    </span>
                  </span>
                  <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
