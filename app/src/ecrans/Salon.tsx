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
import { Bouton, Carte, ChoisirFichier, Entete, Surtitre } from '../ui/base';
import { ChoixEmoji } from '../ui/Emoji';
import { Anneau } from '../ui/Anneau';
import { Visionneuse } from '../ui/Visionneuse';
import {
  MINUTES_CORRECTION,
  corrigible,
  enAttente,
  estImage,
  nomDeLaPiece,
  initiales,
  joindre,
  journaliser,
  useArchiver,
  marquerLu,
  useCorriger,
  useRetirerMonMessage,
  useDirects,
  useEnvoyer,
  useMessages,
  useSalon,
  useSalons,
  useSignaler
} from '../services/messagerie';
import type { Message } from '../services/messagerie';
import { estAdmin, useSession } from '../services/session';
import { enregistrer } from '../services/telechargement';
import { useUrls } from '../services/stockage';

/* ---------------------------------------------- Le fil */
function Fil({
  messages,
  moiId,
  onSignaler,
  onMien
}: {
  messages: Message[];
  moiId: string | undefined;
  onSignaler: (m: Message) => void;
  onMien: (m: Message) => void;
}) {
  const bas = useRef<HTMLDivElement>(null);
  /* Les pièces jointes du fil en UN appel : une adresse signée par
     image ferait autant d'allers-retours que de photos. */
  const pieces = useUrls('pieces', messages.map((m) => m.piece));

  /* Où en est le téléchargement d'un document, par pièce. Le fil
     peut en contenir plusieurs, et deux téléchargements simultanés
     ne doivent pas s'écraser l'un l'autre dans l'affichage. */
  const [enCours, setEnCours] = useState<Record<string, string>>({});
  /* L'image ouverte en grand. Fermée, la visionneuse n'existe pas
     dans le document — c'est ce qui laisse le fil identique à la
     maquette au repos. */
  const [enGrand, setEnGrand] = useState<Message | null>(null);

  /* ---- TOUTES LES IMAGES DU FIL, DANS L'ORDRE ----

     « Si quelqu'un envoie plusieurs images à la fois, on peut les
     glisser de droite vers la gauche et vice versa. »

     Un message ne porte qu'une pièce jointe : « plusieurs images à la
     fois » sont donc plusieurs messages qui se suivent. On feuillette
     entre toutes les images de la conversation, ce qui rend le geste
     plus utile encore — on retrouve la photo d'avant-hier sans
     remonter le fil au doigt.

     Seules celles dont l'adresse est ARRIVÉE comptent : une image
     encore en cours de signature ferait un écran noir au milieu de la
     série, et l'on croirait avoir cassé quelque chose. */
  const galerie = messages.filter((m) => m.piece && estImage(m.piece) && pieces[m.piece]);
  const rangEnGrand = enGrand ? galerie.findIndex((m) => m.id === enGrand.id) : -1;

  const prendre = async (chemin: string, nom: string, url: string) => {
    setEnCours((p) => ({ ...p, [chemin]: 'Enregistrement…' }));
    const r = await enregistrer(url, nom);
    setEnCours((p) => ({
      ...p,
      [chemin]:
        r.fait === 'enregistre'
          ? `Enregistré dans « ${r.ou} »`
          : r.fait === 'ouvert'
            ? 'Ouvert dans un onglet'
            : `Échec : ${r.pourquoi}`
    }));
  };

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
              /* Le même geste, deux issues selon à qui appartient le
                 message : on signale celui d'un autre, on corrige ou
                 l'on retire le sien. Signaler son propre message
                 n'aurait aucun sens. */
              if (mien) onMien(m);
              else onSignaler(m);
            }}
          >
            {!mien && m.auteur && (
              <b className="bul__auteur">
                {m.auteur.nom} {m.auteur.prenom}
              </b>
            )}
            {/* La pièce jointe avant le texte : c'est elle qu'on
                regarde, le texte la commente.

                Une PHOTO se montre ; un DOCUMENT se télécharge. Les
                confondre donnait un cadre vide à la place d'un PDF —
                la version précédente n'acceptait que des images et
                rendait une balise « img » quoi qu'il arrive. */}
            {m.piece && pieces[m.piece] && (
              estImage(m.piece) ? (
                /* UN BOUTON AUTOUR DE L'IMAGE.

                   Elle s'affichait à 240 pixels de large et rien ne
                   se passait quand on appuyait dessus : un visage au
                   fond d'une photo de groupe était donc invisible, et
                   la seule façon de la voir en grand était de la
                   redemander à celui qui l'avait envoyée. */
                <button
                  onClick={() => setEnGrand(m)}
                  aria-label={`Voir en grand : ${m.texte || 'photo'}`}
                  style={{
                    display: 'block',
                    padding: 0,
                    border: 0,
                    background: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: 240
                  }}
                >
                  <img
                    src={pieces[m.piece]}
                    alt={m.texte}
                    loading="lazy"
                    /* Les proportions réservent la place AVANT que
                       l'image n'arrive : sans elles, le fil sursaute à
                       chaque photo chargée et l'on perd sa lecture. */
                    width={240}
                    height={180}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '4 / 3',
                      objectFit: 'cover',
                      background: 'rgba(0,0,0,.06)',
                      borderRadius: 12,
                      marginBottom: 6
                    }}
                  />
                </button>
              ) : (
                /* UN BOUTON, ET NON UN LIEN.

                   C'était un lien, avec « download » et
                   « target=_blank ». Dans un navigateur cela marche ;
                   dans l'APK cela ne fait RIEN, et rien veut dire
                   rien — pas de message, pas d'erreur, le doigt tape
                   et l'écran ne bouge pas. « download » ne vaut que
                   pour une adresse de même origine, et la nôtre est
                   signée sur le serveur Supabase ; et une WebView
                   Android ne télécharge rien d'elle-même.

                   Le bouton rapatrie le fichier, l'écrit dans les
                   documents du téléphone et propose de l'ouvrir. Et
                   il DIT ce qui s'est passé : un téléchargement muet
                   est ce qu'on avait déjà. */
                <button
                  className="piece"
                  onClick={() =>
                    void prendre(
                      m.piece!,
                      nomDeLaPiece(m.piece!) ?? 'document',
                      pieces[m.piece!]!
                    )
                  }
                  disabled={enCours[m.piece] === 'Enregistrement…'}
                >
                  <Icone nom="news" taille={20} couleur="#0F5132" />
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <b>{nomDeLaPiece(m.piece) ?? 'Document'}</b>
                    <i>{enCours[m.piece] || 'Toucher pour enregistrer'}</i>
                  </span>
                  <Icone nom="chev" taille={16} couleur="#12613C" epaisseur={2} />
                </button>
              )
            )}
            <p className="bul__txt">{m.texte}</p>
            <i className="bul__h">
              {/* « Envoi… » plutôt que l'heure tant que le serveur
                  n'a pas confirmé. Le message est déjà à l'écran —
                  c'est ce qui le rend instantané — mais prétendre
                  qu'il est arrivé serait le mensonge que ce projet a
                  déjà payé trois fois. */}
              {enAttente(m)
                ? 'Envoi…'
                : new Date(m.cree_le).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
              {/* Un message corrigé le dit. Sans cette marque, on
                  pourrait réécrire ce qu'on a dit hier et prétendre
                  l'avoir toujours dit. */}
              {m.modifie_le ? ' · modifié' : ''}
            </i>
          </div>
        );
      })}
      <div ref={bas} />

      {enGrand?.piece && pieces[enGrand.piece] && (
        <Visionneuse
          src={pieces[enGrand.piece]!}
          nom={nomDeLaPiece(enGrand.piece) ?? 'photo.jpg'}
          genre="message"
          /* Un message pas encore confirmé par le serveur n'a pas
             d'identifiant réel : on le regarde, on n'y réagit pas —
             la réaction partirait dans le vide. */
          sujet={enAttente(enGrand) ? null : enGrand.id}
          legende={enGrand.texte}
          fermer={() => setEnGrand(null)}
          precedente={
            rangEnGrand > 0 ? () => setEnGrand(galerie[rangEnGrand - 1]!) : null
          }
          suivante={
            rangEnGrand >= 0 && rangEnGrand < galerie.length - 1
              ? () => setEnGrand(galerie[rangEnGrand + 1]!)
              : null
          }
          /* Le compteur n'apparaît que s'il y a de quoi compter :
             « 1 sur 1 » sur une conversation qui ne contient qu'une
             photo est du bruit. */
          position={galerie.length > 1 ? `${rangEnGrand + 1} sur ${galerie.length}` : null}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------- La saisie */
function Saisie({
  envoyer,
  occupe,
  joindreFichier
}: {
  envoyer: (texte: string, piece: string | null) => void;
  occupe: boolean;
  joindreFichier: ((f: File, progres: (p: number | null) => void) => Promise<string>) | null;
}) {
  const [texte, setTexte] = useState('');
  const [piece, setPiece] = useState<string | null>(null);
  const [envoiPiece, setEnvoiPiece] = useState(false);
  /* Où en est l'envoi de la pièce, de 0 à 1 — puis « null » quand
     tout est parti et qu'on attend le serveur. Un PDF de cinq
     mégaoctets met une bonne minute sur la ligne d'Antananarivo :
     sans repère, on croit que rien ne se passe. */
  const [partPiece, setPartPiece] = useState<number | null>(null);
  const [souci, setSouci] = useState<string | null>(null);
  const [emoji, setEmoji] = useState(false);
  /* Pour rendre le clavier après un choix : sans cela, le champ perd
     le curseur et il faut le retoucher pour continuer à écrire. */
  const champ = useRef<HTMLInputElement>(null);
  /* Une pièce jointe SEULE suffit : « regarde » n'ajoute rien à une
     photo, et exiger un texte ferait taper « photo » vingt fois. */
  const propre = texte.trim();
  const envoyable = Boolean(propre || piece);

  return (
    <form
      className="saisie"
      /* « relative » : c'est l'ancrage du choix d'emoji, qui se pose
         AU-DESSUS de la saisie sans entrer dans le flux — il ne
         décale donc jamais le fil. */
      style={{ flexWrap: 'wrap', position: 'relative' }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!envoyable || occupe) return;
        envoyer(propre || '📎', piece);
        setTexte('');
        setPiece(null);
      }}
    >
      {/* Ce qui est joint, avant l'envoi : sans cet indice, on ne
          saurait pas si le fichier est bien parti. */}
      {(piece || envoiPiece || souci) && (
        <div
          style={{
            width: '100%',
            fontSize: 12,
            color: souci ? '#B3341A' : '#59685F',
            padding: '0 4px 6px',
            display: 'flex',
            gap: 8
          }}
        >
          <span style={{ flexGrow: 1 }}>
            {/* L'ANNEAU PENDANT L'ENVOI, le texte le reste du temps.

                C'était « Envoi de la photo… », qui ne distingue pas
                « c'est parti » de « c'est bloqué ». Un PDF de cinq
                mégaoctets met une bonne minute sur la ligne
                d'Antananarivo, et pendant cette minute on appuie une
                seconde fois. L'anneau suit les octets réellement
                partis : quand le réseau s'arrête, il s'arrête. */}
            {souci ?? (envoiPiece ? <Anneau part={partPiece} taille={26} epaisseur={3} /> : 'Pièce jointe.')}
          </span>
          {piece && (
            <button
              type="button"
              className="link"
              style={{ color: '#B3341A' }}
              onClick={() => { setPiece(null); setSouci(null); }}
            >
              Retirer
            </button>
          )}
        </div>
      )}

      {joindreFichier && (
        <ChoisirFichier
          documents
          nomAccessible="Joindre une photo ou un document"
          libelle={<Icone nom="plus" taille={20} couleur="#0F5132" epaisseur={2} />}
          desactive={envoiPiece || occupe}
          style={{ width: 44, flex: 'none', padding: 0 }}
          onFichier={async ([f]) => {
            if (!f) return;
            setEnvoiPiece(true);
            setPartPiece(0);
            setSouci(null);
            try {
              setPiece(await joindreFichier(f, setPartPiece));
            } catch (err) {
              /* « Fichier » et non « Photo » : depuis que les
                 documents sont acceptés, un PDF refusé s'annonçait
                 comme une photo refusée. */
              setSouci(`Fichier refusé : ${(err as Error).message}`);
            } finally {
              setEnvoiPiece(false);
              setPartPiece(0);
            }
          }}
        />
      )}
      {emoji && (
        <ChoixEmoji
          onFermer={() => setEmoji(false)}
          onChoisir={(e) => {
            /* L'EMOJI PART TOUT DE SUITE.

               Il s'ajoutait au champ de saisie, et il fallait encore
               appuyer sur « envoyer ». Le club a demandé l'inverse,
               et il a raison : un emoji seul EST le message. « 👍 »
               répond à une convocation, il ne la commente pas. Deux
               gestes pour un pouce levé, c'est un geste de trop, et
               c'est la raison pour laquelle personne ne s'en servait.

               Ce qui est en cours d'écriture n'est pas touché : on
               peut avoir commencé une phrase, envoyer un « 👏 », et
               reprendre sa phrase où on l'avait laissée. L'écraser
               ou l'emporter serait perdre du texte que personne n'a
               demandé à perdre.

               La pièce jointe non plus n'est pas emportée : elle
               attend son propre envoi. */
            setEmoji(false);
            envoyer(e, null);
          }}
        />
      )}

      <button
        type="button"
        className="tapicon"
        aria-label="Choisir un emoji"
        aria-expanded={emoji}
        style={{ width: 40, flex: 'none', fontSize: 20 }}
        onClick={() => setEmoji((v) => !v)}
      >
        <span aria-hidden="true">🙂</span>
      </button>

      <input
        ref={champ}
        className="saisie__champ"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Écrire un message…"
        aria-label="Écrire un message"
        maxLength={4000}
      />
      <button
        className="saisie__env"
        type="submit"
        aria-label="Envoyer"
        disabled={!envoyable || occupe || envoiPiece}
      >
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
  /* Un salon direct n'a pas de titre en base : il porte le nom de
     l'autre personne. Sans cela l'en-tête affichait
     « Conversation », ce qui ne dit pas à qui l'on parle. */
  const { data: directs } = useDirects();
  const enFace = salonId ? directs?.[salonId] : undefined;
  const { data: messages, isPending, error } = useMessages(salonId);
  const envoi = useEnvoyer(salonId);
  const corriger = useCorriger(salonId);
  const retirer = useRetirerMonMessage(salonId);
  const signalement = useSignaler();
  const archiver = useArchiver();
  const [avis, setAvis] = useState<string | null>(null);
  /* Le message sur lequel on vient d'appuyer longuement, et le texte
     en cours de correction. « null » = aucun, donc rien d'affiché. */
  const [mien, setMien] = useState<Message | null>(null);
  const [correction, setCorrection] = useState<string | null>(null);

  /* Le compteur de non-lus se remet à zéro quand on a vraiment
     ouvert le salon, pas quand on l'a survolé dans la liste. */
  useEffect(() => {
    if (salonId && moi) void marquerLu(salonId, moi.id);
  }, [salonId, moi]);

  /* L'ouverture de l'espace des maîtres est consignée — et elle
     seule. Journaliser chaque salon ferait un registre de la vie de
     tout le monde, ce qui serait une atteinte à la vie privée
     déguisée en mesure de sécurité. Ici, en revanche, se discutent
     les passages de grade et les difficultés d'un élève : savoir qui
     y est entré est légitime, et la table existait pour cela sans
     que personne ne l'écrive. */
  useEffect(() => {
    if (salonId && sombre) journaliser(salonId, 'ouverture de l’espace des maîtres');
  }, [salonId, sombre]);

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

  const titre = sombre
    ? 'Espace des maîtres'
    : salon?.type === 'direct'
      ? (enFace ? `${enFace.nom} ${enFace.prenom}` : 'Conversation')
      : (salon?.titre ?? 'Conversation');

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
            {initiales(titre)}
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
        {/* Ranger la conversation. Réservé à l'administration : la
            règle d'accès ne laisse qu'elle écrire sur un salon, et
            laisser chacun archiver ferait disparaître de sa liste un
            salon que le club croit lu.

            Archiver n'est pas supprimer — les messages restent, le
            salon se rouvre, et un litige de l'an dernier se relit. */}
        {estAdmin(moi) && salonId && !sombre && (
          <button
            className="tapicon"
            aria-label={
              salon?.archive ? 'Sortir de l’archive' : 'Archiver cette conversation'
            }
            disabled={archiver.isPending}
            onClick={() =>
              archiver.mutate(
                { salonId, archive: !salon?.archive },
                {
                  onSuccess: () => aller('/messages'),
                  onError: (e) => setAvis((e as Error).message)
                }
              )
            }
          >
            <Icone
              nom={salon?.archive ? 'plus' : 'base'}
              taille={20}
              couleur="#0E2119"
              epaisseur={salon?.archive ? 2 : undefined}
            />
          </button>
        )}
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

      {/* Un refus se lit en rouge, et à voix haute pour un lecteur
          d'écran : annoncer un échec sur le ton d'une réussite est
          une façon de le cacher. */}
      {avis && (
        <p
          role={/pas parti|refusé|échou/i.test(avis) ? 'alert' : 'status'}
          style={{
            padding: '10px 20px 0',
            fontSize: 12.5,
            lineHeight: '18px',
            color: /pas parti|refusé|échou/i.test(avis) ? '#B3341A' : '#12613C'
          }}
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
        <Fil
          messages={messages ?? []}
          moiId={moi?.id}
          onSignaler={signaler}
          onMien={(m) => {
            setMien(m);
            setCorrection(null);
          }}
        />
      )}

      {/* Ce qu'on peut faire de SON propre message. Le choix est
          proposé après l'appui long, jamais avant : un bouton
          « corriger » sur chaque bulle encombrerait un fil que l'on
          lit bien plus souvent qu'on ne le corrige. */}
      {mien && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--filet)',
            background: '#F5F8F6',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {correction === null ? (
            <>
              {/* La fenêtre de quinze minutes vient de la note de
                  sécurité livrée au club : « passé ce délai, le fil
                  devient une trace stable, utile en cas de litige ».
                  Elle est tenue par la RÈGLE D'ACCÈS ; l'écran ne
                  fait que s'y conformer, et le dit quand elle est
                  passée plutôt que de proposer un geste que le
                  serveur refusera. */}
              {corrigible(mien, moi?.id) ? (
                <>
                  <p style={{ fontSize: 12.5, color: '#59685F' }}>
                    Votre message — corrigeable pendant {MINUTES_CORRECTION} minutes
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Bouton genre="ghost" onClick={() => setCorrection(mien.texte)}>
                      Corriger
                    </Bouton>
                    <Bouton
                      genre="ghost"
                      desactive={retirer.isPending}
                      onClick={() =>
                        retirer.mutate(mien.id, {
                          onSuccess: () => {
                            setAvis('Message retiré. La trace du retrait reste dans le fil.');
                            setMien(null);
                          },
                          onError: (e) => setAvis((e as Error).message)
                        })
                      }
                    >
                      Retirer
                    </Bouton>
                    <Bouton genre="ghost" onClick={() => setMien(null)}>
                      Annuler
                    </Bouton>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}>
                    Les {MINUTES_CORRECTION} minutes pendant lesquelles un message se corrige
                    sont passées. Le fil devient une trace stable — c’est ce qui le rend utile
                    en cas de litige. Pour faire retirer ce message, signalez-le à
                    l’administration.
                  </p>
                  <Bouton genre="ghost" onClick={() => setMien(null)}>
                    Fermer
                  </Bouton>
                </>
              )}
            </>
          ) : (
            <>
              <input
                className="saisie__champ"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                aria-label="Corriger mon message"
                maxLength={4000}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <Bouton
                  desactive={!correction.trim() || corriger.isPending}
                  onClick={() =>
                    corriger.mutate(
                      { id: mien.id, texte: correction },
                      {
                        onSuccess: () => {
                          setAvis('Message corrigé.');
                          setMien(null);
                          setCorrection(null);
                        },
                        onError: (e) => setAvis((e as Error).message)
                      }
                    )
                  }
                >
                  Enregistrer
                </Bouton>
                <Bouton genre="ghost" onClick={() => setCorrection(null)}>
                  Annuler
                </Bouton>
              </div>
            </>
          )}
        </div>
      )}

      {/* ⚠ « onError » n'est pas décoratif, et son absence était le
          défaut que le club a signalé : « si j'écris un message il ne
          s'affiche pas ».

          Un envoi refusé par le serveur levait une erreur que
          PERSONNE ne rattrapait. React Query la garde pour lui,
          l'écran ne montrait rien, le champ se vidait comme après un
          envoi réussi — et le message n'apparaissait jamais. Du point
          de vue de celui qui écrit, l'application avait avalé son
          message sans un mot.

          Le message vient du serveur : le réécrire ici le ferait
          diverger de la règle le jour où le club la change. */}
      <Saisie
        envoyer={(texte, piece) => {
          /* ⚠ Le second silence, et le vrai coupable de « j'écris un
             message et il ne s'affiche pas ».

             Ce code disait « moi && envoi.mutate(…) ». Sans fiche
             chargée, l'expression valait « null » : AUCUNE requête ne
             partait, aucune erreur n'était levée, aucun message ne
             s'affichait — et le champ se vidait quand même. Le
             téléphone du club n'a rien envoyé pendant des jours, et
             l'application n'avait pas un mot à dire à ce sujet.

             La cause première est corrigée ailleurs (lireProfil ne
             rend plus « null » à tout le monde), mais un « et si »
             muet reste un piège : on le remplace par une phrase. */
          if (!moi) {
            setAvis(
              'Le message n’est pas parti : votre fiche n’est pas chargée. Fermez et rouvrez l’application, ou reconnectez-vous.'
            );
            return;
          }
          envoi.mutate(
            /* L'auteur part avec : le message provisoire s'affiche
               AVANT la réponse du serveur, et sans nom il apparaîtrait
               anonyme une seconde puis se corrigerait — un
               clignotement pour rien. */
            { texte, auteurId: moi.id, piece, auteur: { nom: moi.nom, prenom: moi.prenom } },
            {
              onSuccess: () => setAvis(null),
              onError: (e) =>
                setAvis(`Le message n’est pas parti : ${(e as Error).message}`)
            }
          );
        }}
        occupe={envoi.isPending}
        joindreFichier={salonId ? (f) => joindre(salonId, f) : null}
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
