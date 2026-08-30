/* ============================================================
   06 · Casier — et 07 · une actualité
   ============================================================ */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete, Etat, Puce, Filet } from '../ui/base';
import {
  categories,
  dateLongue,
  jourEtMois,
  teinte,
  useActualite,
  useActualites,
  useNotifications
} from '../services/casier';

export function Casier() {
  const aller = useNavigate();
  const { data: actus, isPending, error } = useActualites();
  const { data: notifs } = useNotifications();
  const [filtre, setFiltre] = useState<string | null>(null);

  const nonlues = (notifs ?? []).filter((n) => !n.lue_le).length;
  const liste = (actus ?? []).filter((a) => !filtre || a.categorie === filtre);

  return (
    <>
      <Entete
        titre="Casier"
        action={
          <button
            className="tapicon"
            onClick={() => aller('/notifications')}
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <Icone nom="bell" taille={22} couleur="#0E2119" />
            {nonlues > 0 && <span className="dot dot--plain" />}
          </button>
        }
      />

      <div className="chips">
        <Puce texte="Tout" actif={filtre === null} onClick={() => setFiltre(null)} />
        {categories(actus ?? []).map((c) => (
          <Puce
            key={c}
            texte={c}
            actif={filtre === c}
            onClick={() => setFiltre(filtre === c ? null : c)}
          />
        ))}
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: '14px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Rien dans le casier pour le moment."
        >
          {liste.map((a, i) => {
            const [cc, cb] = teinte(a.categorie);
            const { jour, mois } = jourEtMois(a.date_evt ?? a.cree_le);
            /* « Nouveau » se mérite : moins de sept jours. Marquer la
               première de la liste l'aurait toujours marquée, même un
               an après la dernière publication. */
            const neuf = Date.now() - new Date(a.cree_le).getTime() < 7 * 86400000;
            return (
              <button
                key={a.id}
                className={`card newscard${i === 0 && neuf ? ' newscard--new' : ''}`}
                onClick={() => aller(`/casier/${a.id}`)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag" style={{ color: cc, background: cb }}>
                    {a.categorie}
                  </span>
                  <span style={{ fontSize: 12, color: '#7C8B82' }}>
                    {jour} {mois}
                  </span>
                  {neuf && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#E4572E'
                      }}
                    >
                      NOUVEAU
                    </span>
                  )}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: '21px',
                    textAlign: 'left'
                  }}
                >
                  {a.titre}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 14,
                    lineHeight: '21px',
                    color: '#59685F',
                    textAlign: 'left'
                  }}
                >
                  {a.texte}
                </span>
              </button>
            );
          })}
        </Etat>
      </div>
    </>
  );
}

/* ---------------------------------------------- 07 · Une actualité */
export function Actualite() {
  const { id } = useParams();
  const aller = useNavigate();
  const { data: a, isPending } = useActualite(id);

  if (isPending || !a) {
    return (
      <>
        <Entete titre="Actualité" retour={() => aller('/casier')} />
        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
          {isPending ? 'Chargement…' : 'Cette actualité n’est plus disponible.'}
        </div>
      </>
    );
  }

  const [cc, cb] = teinte(a.categorie);

  return (
    <>
      <Entete titre={a.categorie} retour={() => aller('/casier')} />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="ph" style={{ height: 190 }}>
          <Icone nom="album" taille={46} couleur="#8FB3A0" epaisseur={1.3} />
          <p className="ph__label">Photo à fournir</p>
        </div>

        <div
          style={{
            padding: '22px 20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          <div>
            <span className="tag" style={{ color: cc, background: cb }}>
              {a.categorie}
            </span>
            <h1 className="display" style={{ fontSize: 24, lineHeight: '30px', marginTop: 12 }}>
              {a.titre}
            </h1>
            <p style={{ fontSize: 13, color: '#7C8B82', marginTop: 8 }}>
              Publié le {jourEtMois(a.cree_le).jour} {jourEtMois(a.cree_le).mois} par
              l’administration
            </p>
          </div>

          {(a.date_evt || a.lieu) && (
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {a.date_evt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icone nom="calendar" taille={19} couleur="#0F5132" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{dateLongue(a.date_evt)}</p>
                    </div>
                  </div>
                )}
                {a.date_evt && a.lieu && <Filet />}
                {a.lieu && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icone nom="pin" taille={19} couleur="#0F5132" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{a.lieu}</p>
                      <p style={{ fontSize: 13, color: '#59685F' }}>Analamahitsy</p>
                    </div>
                  </div>
                )}
              </div>
            </Carte>
          )}

          {/* Le texte du club arrive tel qu'il l'a écrit, sauts de
              ligne compris : les reformater serait le réécrire. */}
          {a.texte.split(/\n{2,}/).map((paragraphe, i) => (
            <p key={i} style={{ fontSize: 15, lineHeight: '25px', color: '#3C4A42' }}>
              {paragraphe}
            </p>
          ))}

          <Bouton onClick={() => aller(`/casier/${a.id}/participer`)}>J’y participe</Bouton>
        </div>
      </div>
    </>
  );
}
