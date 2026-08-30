/* ============================================================
   02 · Accueil
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Carte, Surtitre } from '../ui/base';
import { useActualites, useNotifications, jourEtMois, teinte } from '../services/casier';
import { useMembres } from '../services/membres';
import { useHoraires, useReglages } from '../services/club';
import { estAdmin, useSession } from '../services/session';

export function Accueil() {
  const aller = useNavigate();
  const profil = useSession((e) => e.profil);
  const { data: actus } = useActualites();
  const { data: notifs } = useNotifications();
  const { data: membres } = useMembres();
  const { data: horaires } = useHoraires();
  const { data: reglages } = useReglages();

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
          <div className="emblem">
            <Icone nom="shieldCheck" taille={26} couleur="#0F5132" />
          </div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <p
              className="display"
              style={{ fontSize: 17, color: '#FFF', letterSpacing: '.02em', lineHeight: '20px' }}
            >
              KUNG-FU WAISHI
            </p>
            <p style={{ fontSize: 13, color: 'var(--sur-vert)', marginTop: 2 }}>
              Analamahitsy · Antananarivo
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
          <div className="ph" style={{ height: 168 }}>
            <Icone nom="martial" taille={52} couleur="#8FB3A0" epaisseur={1.4} />
            <p className="ph__label">Photo du club à fournir</p>
          </div>
          <div style={{ padding: 18 }}>
            <p className="display" style={{ fontSize: 19, lineHeight: '24px' }}>
              Kung-fu Waishi Analamahitsy
            </p>
            <p style={{ fontSize: 14, lineHeight: '22px', color: '#59685F', marginTop: 8 }}>
              {reglages?.presentation ??
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

        {/* Trois écrans n'avaient aucune porte d'entrée : la carte de
            membre, sa propre fiche, et l'administration. Les routes
            existaient, rien n'y menait — un compte d'administration
            ne montrait donc rien de plus qu'un compte d'élève.

            Ce bloc est cette porte. L'administration n'y figure que
            pour qui a le rôle, mais ce n'est pas ce qui protège : le
            serveur refuse de toute façon ce que le rôle n'autorise
            pas. C'est de la place gagnée, pas une serrure. */}
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

          {actus && actus.length === 0 && (
            <Carte>
              <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#59685F' }}>
                Aucune actualité pour le moment.
              </p>
            </Carte>
          )}
        </div>
      </div>
    </>
  );
}
