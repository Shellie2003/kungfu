/* ============================================================
   16 · Messages — la liste des conversations

   Ce que cet écran ne fait PAS, et c'est volontaire : il ne cache
   pas l'espace des maîtres. Il ne le reçoit pas. Un élève qui
   demande la liste des salons obtient une réponse où ce salon
   n'existe pas — la différence n'est pas cosmétique, elle tient
   même si quelqu'un modifie l'application.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Carte, Entete, Etat, Portrait, Surtitre } from '../ui/base';
import { heureCourte, initiales, useSalons } from '../services/messagerie';
import type { Salon } from '../services/messagerie';

function Vignette({ salon }: { salon: Salon }) {
  if (salon.type === 'direct') return <Portrait taille={44} rayon={22} />;
  const couleur = salon.couleur ?? '#0F5132';
  return (
    <span
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        flex: 'none',
        background: `${couleur}1A`,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: 15,
        color: couleur
      }}
    >
      {initiales(salon.titre ?? '??')}
    </span>
  );
}

function Ligne({ salon, onClick }: { salon: Salon; onClick: () => void }) {
  return (
    <button className="listrow" onClick={onClick}>
      <Vignette salon={salon} />
      <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
        <span className="convrow__haut">
          <b className="convrow__nom">{salon.titre ?? 'Conversation'}</b>
          <i className="convrow__heure">{heureCourte(salon.dernier_le)}</i>
        </span>
        <span className="convrow__txt">
          {salon.dernier ? (
            <>
              {salon.dernier.auteur && salon.type !== 'direct' && (
                <b>{salon.dernier.auteur.split(' ')[1] ?? salon.dernier.auteur} : </b>
              )}
              {salon.dernier.texte}
            </>
          ) : (
            'Aucun message pour l’instant.'
          )}
        </span>
      </span>
      {salon.nonlus > 0 && <span className="pastille">{salon.nonlus}</span>}
    </button>
  );
}

export function Messages() {
  const aller = useNavigate();
  const { data: salons, isPending, error } = useSalons();
  const [recherche, setRecherche] = useState('');

  const q = recherche.trim().toLowerCase();
  const liste = (salons ?? []).filter(
    (s) => !q || (s.titre ?? '').toLowerCase().includes(q)
  );

  /* L'espace des maîtres est sorti de la liste ordinaire pour être
     mis en tête : il n'a pas la même nature que « Tout le club ». */
  const maitres = liste.filter((s) => s.type === 'maitres');
  const collectifs = liste.filter((s) => s.type !== 'maitres' && s.type !== 'direct');
  const directs = liste.filter((s) => s.type === 'direct');

  return (
    <>
      <Entete
        titre="Messages"
        action={
          maitres.length > 0 ? (
            <button
              className="tapicon"
              onClick={() => aller('/maitres')}
              aria-label="Espace des maîtres"
            >
              <Icone nom="key" taille={21} couleur="#0E2119" />
            </button>
          ) : undefined
        }
      />

      <div style={{ padding: '14px 20px 0' }}>
        <div className="searchbar">
          <Icone nom="search" taille={19} couleur="#7C8B82" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une conversation"
            aria-label="Rechercher une conversation"
            style={{
              flexGrow: 1,
              minWidth: 0,
              border: 0,
              background: 'transparent',
              fontSize: 15,
              color: 'var(--encre)'
            }}
          />
        </div>
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: '16px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucune conversation."
        >
          {maitres.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Surtitre>Confidentiel</Surtitre>
              <div className="list">
                {maitres.map((s) => (
                  <Ligne key={s.id} salon={s} onClick={() => aller('/maitres')} />
                ))}
              </div>
            </div>
          )}

          {collectifs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Surtitre>Salons du club</Surtitre>
              <div className="list">
                {collectifs.map((s) => (
                  <Ligne key={s.id} salon={s} onClick={() => aller(`/messages/${s.id}`)} />
                ))}
              </div>
            </div>
          )}

          {directs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Surtitre>Conversations</Surtitre>
              <div className="list">
                {directs.map((s) => (
                  <Ligne key={s.id} salon={s} onClick={() => aller(`/messages/${s.id}`)} />
                ))}
              </div>
            </div>
          )}
        </Etat>

        <Carte style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FFF7F2', borderColor: '#F2D8C6' }}>
          <Icone nom="flag" taille={20} couleur="#B0530F" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, lineHeight: '18px' }}>Signaler un message</p>
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F', marginTop: 4 }}>
              Un appui long sur un message le signale à l’administration. Le club compte des
              mineurs : la modération n’est pas une option.
            </p>
          </div>
        </Carte>
      </div>
    </>
  );
}
