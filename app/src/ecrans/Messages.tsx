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
import { heureCourte, initiales, useDirects, useSalons } from '../services/messagerie';
import type { Salon } from '../services/messagerie';
import { useSignalementsEnAttente } from '../services/moderation';
import { estMaitre, useSession } from '../services/session';

function Vignette({ salon, photo }: { salon: Salon; photo?: string | null }) {
  if (salon.type === 'direct') return <Portrait taille={44} rayon={22} photo={photo ?? null} />;
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

function Ligne({
  salon, onClick, enFace
}: {
  salon: Salon;
  onClick: () => void;
  enFace?: { nom: string; prenom: string; photo: string | null };
}) {
  /* Un salon direct n'a pas de titre en base : il porte le nom de
     l'autre personne, qui n'est pas le même pour les deux. */
  const titre = salon.type === 'direct'
    ? (enFace ? `${enFace.nom} ${enFace.prenom}` : 'Conversation')
    : (salon.titre ?? 'Conversation');

  return (
    <button className="listrow" onClick={onClick}>
      <Vignette salon={salon} photo={enFace?.photo} />
      <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
        <span className="convrow__haut">
          <b className="convrow__nom">{titre}</b>
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
  const profil = useSession((e) => e.profil);
  const { data: salons, isPending, error } = useSalons();
  const { data: directs } = useDirects();
  /* Le décompte n'est demandé qu'à qui peut traiter : un élève ne
     recevrait de toute façon que ses propres signalements, et la
     requête serait du bruit. */
  const { data: enAttente } = useSignalementsEnAttente(estMaitre(profil));
  const [recherche, setRecherche] = useState('');

  const nomDe = (s: Salon) =>
    s.type === 'direct'
      ? [directs?.[s.id]?.nom, directs?.[s.id]?.prenom].filter(Boolean).join(' ')
      : (s.titre ?? '');

  const q = recherche.trim().toLowerCase();
  const liste = (salons ?? []).filter((s) => !q || nomDe(s).toLowerCase().includes(q));

  /* L'espace des maîtres est sorti de la liste ordinaire pour être
     mis en tête : il n'a pas la même nature que « Tout le club ». */
  const maitres = liste.filter((s) => s.type === 'maitres');
  const collectifs = liste.filter((s) => s.type !== 'maitres' && s.type !== 'direct');
  const aDeux = liste.filter((s) => s.type === 'direct');

  return (
    <>
      <Entete
        titre="Messages"
        action={
          <>
            {/* La messagerie affichait les conversations existantes
                sans qu'aucune ne puisse naître. */}
            <button
              className="tapicon"
              onClick={() => aller('/messages/nouvelle')}
              aria-label="Nouvelle conversation"
            >
              <Icone nom="plus" taille={21} couleur="#0E2119" epaisseur={2} />
            </button>
            {maitres.length > 0 && (
              <button
                className="tapicon"
                onClick={() => aller('/maitres')}
                aria-label="Espace des maîtres"
              >
                <Icone nom="key" taille={21} couleur="#0E2119" />
              </button>
            )}
          </>
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

          {aDeux.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Surtitre>Conversations</Surtitre>
              <div className="list">
                {aDeux.map((s) => (
                  <Ligne
                    key={s.id}
                    salon={s}
                    enFace={directs?.[s.id]}
                    onClick={() => aller(`/messages/${s.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </Etat>

        {/* Pour un maître, la carte devient une PORTE : le
            signalement s'enregistrait déjà et personne ne le lisait,
            ce qui promettait une modération qui n'existait pas. */}
        {estMaitre(profil) ? (
          <button
            className="card"
            style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%',
              background: '#FFF7F2', borderColor: '#F2D8C6', textAlign: 'left'
            }}
            onClick={() => aller('/signalements')}
          >
            <Icone nom="flag" taille={20} couleur="#B0530F" />
            <span style={{ flexGrow: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, lineHeight: '18px' }}>
                Signalements
              </span>
              <span
                style={{
                  display: 'block', fontSize: 12.5, lineHeight: '18px',
                  color: '#59685F', marginTop: 4
                }}
              >
                {enAttente
                  ? `${enAttente} message${enAttente > 1 ? 's' : ''} en attente de traitement.`
                  : 'Rien en attente. Le club compte des mineurs : la modération n’est pas une option.'}
              </span>
            </span>
            {enAttente ? <span className="pastille">{enAttente}</span> : null}
          </button>
        ) : (
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
        )}
      </div>
    </>
  );
}
