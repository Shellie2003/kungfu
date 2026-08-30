/* ============================================================
   17 · Une conversation — et 19 · l'espace des maîtres

   Le même écran, deux entrées. L'espace des maîtres est un salon
   ordinaire, de type « maitres » : lui donner son propre code
   aurait créé un endroit de plus où oublier une vérification.
   Ce qui change ici est la couleur de l'en-tête, rien d'autre.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Carte, Entete, Surtitre } from '../ui/base';
import {
  initiales,
  marquerLu,
  useEnvoyer,
  useMessages,
  useSalon,
  useSalons,
  useSignaler
} from '../services/messagerie';
import type { Message } from '../services/messagerie';
import { useSession } from '../services/session';

/* ---------------------------------------------- Le fil */
function Fil({
  messages,
  moiId,
  onSignaler
}: {
  messages: Message[];
  moiId: string | undefined;
  onSignaler: (m: Message) => void;
}) {
  const bas = useRef<HTMLDivElement>(null);

  /* On arrive en bas du fil, comme dans toute messagerie : lire les
     messages d'il y a trois semaines n'intéresse personne. */
  useEffect(() => {
    bas.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="fil">
      <p className="fil__jour">Aujourd’hui</p>
      {messages.map((m) => {
        const mien = m.auteur_id === moiId;
        if (m.supprime_le) {
          return (
            <div key={m.id} className={`bul ${mien ? 'bul--envoye' : 'bul--recu'}`}>
              <p className="bul__txt" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                Message retiré
              </p>
            </div>
          );
        }
        return (
          <div
            key={m.id}
            className={`bul ${mien ? 'bul--envoye' : 'bul--recu'}`}
            /* Appui long : c'est le geste que la maquette annonce, et
               le seul qui n'entre pas en conflit avec le défilement. */
            onContextMenu={(e) => {
              e.preventDefault();
              if (!mien) onSignaler(m);
            }}
          >
            {!mien && m.auteur && (
              <b className="bul__auteur">
                {m.auteur.nom} {m.auteur.prenom}
              </b>
            )}
            <p className="bul__txt">{m.texte}</p>
            <i className="bul__h">
              {new Date(m.cree_le).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </i>
          </div>
        );
      })}
      <div ref={bas} />
    </div>
  );
}

/* ---------------------------------------------- La saisie */
function Saisie({ envoyer, occupe }: { envoyer: (texte: string) => void; occupe: boolean }) {
  const [texte, setTexte] = useState('');
  const propre = texte.trim();

  return (
    <form
      className="saisie"
      onSubmit={(e) => {
        e.preventDefault();
        if (!propre || occupe) return;
        envoyer(propre);
        setTexte('');
      }}
    >
      <input
        className="saisie__champ"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Écrire un message…"
        aria-label="Écrire un message"
        maxLength={4000}
      />
      <button className="saisie__env" type="submit" aria-label="Envoyer" disabled={!propre || occupe}>
        <Icone nom="send" taille={20} couleur="#FFF" epaisseur={1.8} />
      </button>
    </form>
  );
}

/* ---------------------------------------------- Ce qui est commun */
function Conversation({ salonId, sombre }: { salonId: string | undefined; sombre: boolean }) {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: salon } = useSalon(salonId);
  const { data: messages, isPending, error } = useMessages(salonId);
  const envoi = useEnvoyer(salonId);
  const signalement = useSignaler();
  const [avis, setAvis] = useState<string | null>(null);

  /* Le compteur de non-lus se remet à zéro quand on a vraiment
     ouvert le salon, pas quand on l'a survolé dans la liste. */
  useEffect(() => {
    if (salonId && moi) void marquerLu(salonId, moi.id);
  }, [salonId, moi]);

  function signaler(m: Message) {
    if (!moi) return;
    const motif = window.prompt(
      'Signaler ce message à l’administration. Que se passe-t-il ?'
    );
    if (!motif?.trim()) return;
    signalement.mutate(
      { messageId: m.id, auteurId: moi.id, motif: motif.trim() },
      {
        onSuccess: () => setAvis('Signalement transmis à l’administration.'),
        onError: () => setAvis('Le signalement n’a pas pu être envoyé.')
      }
    );
  }

  const titre = sombre ? 'Espace des maîtres' : salon?.titre ?? 'Conversation';

  return (
    <>
      <div className={sombre ? 'apphead apphead--sombre' : 'apphead'}>
        <button
          className="tapicon"
          onClick={() => aller('/messages')}
          aria-label="Retour"
        >
          <Icone nom="back" taille={22} couleur={sombre ? '#FFF' : '#0E2119'} epaisseur={2} />
        </button>
        {!sombre && (
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              flex: 'none',
              background: `${salon?.couleur ?? '#0F5132'}1A`,
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 13,
              color: salon?.couleur ?? '#0F5132'
            }}
          >
            {initiales(salon?.titre ?? '??')}
          </span>
        )}
        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: sombre ? 4 : 10 }}>
          <b
            style={{
              display: 'block',
              fontFamily: 'var(--display)',
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '19px',
              color: sombre ? '#FFF' : 'var(--encre)'
            }}
          >
            {titre}
          </b>
          <i
            style={{
              display: 'block',
              fontSize: 11.5,
              color: sombre ? '#9CC4AF' : '#59685F',
              fontStyle: 'normal',
              marginTop: 1
            }}
          >
            {sombre ? 'confidentiel' : ''}
          </i>
        </span>
        {sombre && <Icone nom="lock" taille={20} couleur="#9CC4AF" />}
      </div>

      {sombre && (
        <div style={{ padding: '14px 20px 0' }}>
          <Carte
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              background: '#E8F1EC',
              borderColor: '#C4D9CC'
            }}
          >
            <Icone nom="eyeOff" taille={20} couleur="#0F5132" />
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#12613C' }}>
              Rien de ce qui est écrit ici n’apparaît dans les salons des élèves. Les captures
              d’écran, en revanche, restent possibles : la confidentialité tient aussi aux
              personnes.
            </p>
          </Carte>
        </div>
      )}

      {avis && (
        <p
          role="status"
          style={{ padding: '10px 20px 0', fontSize: 12.5, color: '#12613C' }}
        >
          {avis}
        </p>
      )}

      {isPending || error ? (
        <div
          style={{
            flexGrow: 1,
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            color: '#59685F'
          }}
        >
          {isPending ? 'Chargement…' : 'Les messages n’ont pas pu être chargés.'}
        </div>
      ) : (
        <Fil messages={messages ?? []} moiId={moi?.id} onSignaler={signaler} />
      )}

      <Saisie
        envoyer={(texte) => moi && envoi.mutate({ texte, auteurId: moi.id })}
        occupe={envoi.isPending}
      />
    </>
  );
}

export function Salon() {
  const { id } = useParams();
  return <Conversation salonId={id} sombre={false} />;
}

/* ---------------------------------------------- 18 et 19 · les maîtres

   Deux écrans dans la maquette, un seul ici, et c'est la même
   raison qu'au profil : ce qui décide est ce que le serveur a
   rendu. Pas de salon de maîtres dans la réponse ⇒ le verrou.
   Le rôle n'est jamais lu dans l'application pour ouvrir une porte. */
export function Maitres() {
  const aller = useNavigate();
  const { data: salons, isPending } = useSalons();
  const salon = (salons ?? []).find((s) => s.type === 'maitres');

  if (isPending) {
    return (
      <>
        <Entete titre="Espace des maîtres" retour={() => aller('/messages')} />
        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
          Chargement…
        </div>
      </>
    );
  }

  if (salon) return <Conversation salonId={salon.id} sombre />;

  return (
    <>
      <Entete titre="Espace des maîtres" retour={() => aller('/messages')} />
      <div
        style={{
          flexGrow: 1,
          padding: '34px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 24,
            background: '#0F5132',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <Icone nom="lock" taille={32} couleur="#FFF" epaisseur={1.8} />
        </div>
        <div>
          <p className="display" style={{ fontSize: 20, lineHeight: '26px' }}>
            Réservé aux maîtres
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: '21px',
              color: '#59685F',
              marginTop: 10,
              maxWidth: 290
            }}
          >
            Votre compte n’a pas ce rôle. Cet espace n’apparaît pas dans la liste des salons et
            son contenu n’est pas transmis à votre téléphone.
          </p>
        </div>

        <Carte
          style={{
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {(
            [
              ['Le rôle est posé sur le serveur', 'Pas dans l’application : la modifier ne donne rien.'],
              ['Le filtre est en base', 'Une requête d’un élève sur ces messages revient vide.'],
              ['Seule l’administration accorde le rôle', 'Et peut le retirer à tout moment.']
            ] as [string, string][]
          ).map(([t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <Icone nom="shieldCheck" taille={19} couleur="#12613C" />
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: '18px' }}>{t}</p>
                <p
                  style={{
                    fontSize: 12.5,
                    color: '#59685F',
                    lineHeight: '17px',
                    marginTop: 2
                  }}
                >
                  {d}
                </p>
              </div>
            </div>
          ))}
        </Carte>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Surtitre>Ce que l’espace contient</Surtitre>
          <div className="list">
            {(
              [
                ['Délibérations de passage de grade', 'Avant l’annonce publique'],
                ['Situations individuelles', 'Blessure, absence prolongée, difficulté familiale'],
                ['Signalements des élèves', 'Messages remontés par la modération'],
                ['Notes d’encadrement', 'Répartition des groupes, remplacements']
              ] as [string, string][]
            ).map(([t, d]) => (
              <div key={t} className="listrow">
                <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 14, fontWeight: 600, lineHeight: '19px' }}>
                    {t}
                  </b>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      color: '#59685F',
                      lineHeight: '17px',
                      marginTop: 2
                    }}
                  >
                    {d}
                  </span>
                </span>
                <Icone nom="lock" taille={17} couleur="#7C8B82" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
