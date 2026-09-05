/* ============================================================
   L'image en grand.

   « Je veux aussi une visualisation grande si on appuie sur une
   image, avec des boutons de réaction et téléchargement. »

   Avant : une photo de conversation s'affichait à 240 pixels de
   large, et rien ne se passait quand on appuyait dessus. Un visage
   au fond d'une photo de groupe était donc invisible, et la seule
   façon de la voir en grand était de la demander à celui qui
   l'avait envoyée.

   ------------------------------------------------------------
   FOND SOMBRE, ET RIEN D'AUTRE

   C'est le seul écran où l'image compte plus que le cadre — la même
   décision que l'écran « photo en grand » d'un album, qui vit hors
   du gabarit clair pour la même raison. Une photo sur fond blanc
   paraît délavée ; sur fond sombre, on voit ce qu'elle contient.

   ------------------------------------------------------------
   CE QU'ON PEUT Y FAIRE

   RÉAGIR — une seule réaction par personne, qui se remplace et
   s'annule. Voir services/reactions.ts.

   ENREGISTRER — le même chemin que les documents de la messagerie :
   sur le téléphone, le fichier est rapatrié et écrit dans
   « Documents » ; sur le web, le navigateur l'ouvre. Un lien
   « download » ne ferait rien dans une WebView Android, et c'est un
   défaut que ce projet a déjà corrigé une fois.

   ------------------------------------------------------------
   FERMÉE, ELLE N'EXISTE PAS DANS LE DOCUMENT

   Comme la feuille de choix : ce n'est pas une optimisation, c'est
   ce qui laisse les écrans au repos identiques à la maquette, et
   donc ce qui permet à la comparaison au pixel de rester exigeante.
   ============================================================ */
import { useEffect, useState } from 'react';
import { Icone } from './Icone';
import { Anneau } from './Anneau';
import { enregistrer } from '../services/telechargement';
import { useGlisser } from './glisser';
import {
  REACTIONS,
  compter,
  maReaction,
  useReactions,
  useReagir
} from '../services/reactions';
import type { Genre } from '../services/reactions';
import { useSession } from '../services/session';

/* ------------------------------------------------------------
   Les réactions, seules.

   Extraites parce qu'elles servent à DEUX endroits : la visionneuse
   ci-dessous, et l'écran « photo en grand » d'un album — qui est
   déjà une visionneuse, écrite avant celle-ci et avec sa propre
   navigation d'une photo à l'autre. La remplacer par celle-ci ferait
   perdre cette navigation ; en recopier les réactions les ferait
   diverger à la première correction.
   ------------------------------------------------------------ */
export function BarreReactions({
  genre,
  sujet,
  sombre = true
}: {
  genre: Genre;
  sujet: string | null;
  sombre?: boolean;
}) {
  const moi = useSession((e) => e.profil);
  const { data: reactions } = useReactions(genre, sujet);
  const reagir = useReagir(genre, sujet);

  const mienne = maReaction(reactions, moi?.id);
  const comptes = compter(reactions);

  if (!sujet) return null;

  return (
    <>
      {/* Le compte : sans lui, on ne sait pas si l'on est seul à
          avoir aimé la photo — et c'est justement ce qu'on veut
          savoir. */}
      {comptes.length > 0 && (
        <div className="visionneuse__comptes">
          {comptes.map(([emoji, n]) => (
            <span
              key={emoji}
              className="visionneuse__compte"
              style={sombre ? undefined : { background: 'rgba(0,0,0,.06)', color: '#59685F' }}
            >
              <span aria-hidden="true">{emoji}</span> {n}
            </span>
          ))}
        </div>
      )}
      <div className="visionneuse__reactions">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className={
              mienne === emoji
                ? 'visionneuse__reaction visionneuse__reaction--mienne'
                : 'visionneuse__reaction'
            }
            aria-label={mienne === emoji ? `Retirer ${emoji}` : `Réagir ${emoji}`}
            aria-pressed={mienne === emoji}
            disabled={reagir.isPending}
            onClick={() => reagir.mutate(emoji)}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function Visionneuse({
  src,
  nom,
  genre,
  sujet,
  legende,
  fermer,
  precedente,
  suivante,
  position
}: {
  /* L'adresse signée de l'image. */
  src: string;
  /* Le nom sous lequel elle sera enregistrée. */
  nom: string;
  genre: Genre;
  /* L'identifiant du message ou de la photo. Nul : on regarde
     l'image, on ne réagit pas — c'est le cas d'un message pas encore
     confirmé par le serveur. */
  sujet: string | null;
  legende?: string | null;
  fermer: () => void;
  /* ---- FEUILLETER LES IMAGES DE LA CONVERSATION ----

     « C'est pareil si quelqu'un envoie plusieurs images à la fois :
     si on clique sur l'image on peut les glisser de droite vers la
     gauche et vice versa. »

     Un message ne porte qu'une pièce jointe : « plusieurs images à la
     fois » sont donc plusieurs messages qui se suivent. On feuillette
     entre TOUTES les images du fil, dans l'ordre où elles ont été
     envoyées — ce qui est plus utile encore : on retrouve la photo
     d'avant-hier sans remonter le fil au doigt.

     Nuls quand il n'y a qu'une image : ni flèches, ni compteur, et le
     glissement ne fait rien. */
  precedente?: (() => void) | null;
  suivante?: (() => void) | null;
  /* « 3 sur 8 ». Sans lui, on ne sait pas si l'on a tout vu. */
  position?: string | null;
}) {
  const [etat, setEtat] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const [sens, setSens] = useState<'gauche' | 'droite' | null>(null);

  /* Un seul chemin pour les trois façons de tourner la page : le
     doigt, les flèches et le clavier. Les avoir laissés appeler
     « suivante » directement aurait fait qu'un chemin anime et pas
     les autres — le genre d'écart qu'on ne voit qu'à l'usage. */
  const aller = (ou: 'gauche' | 'droite') => {
    setSens(ou);
    if (ou === 'gauche') suivante?.();
    else precedente?.();
  };

  const { gestes, onAGlisse, decalage, enGeste } = useGlisser({
    versLaGauche: suivante ? () => aller('gauche') : undefined,
    versLaDroite: precedente ? () => aller('droite') : undefined
  });

  /* ------------------------------------------------------------
     L'IMAGE QUI ARRIVE VIENT DU BON CÔTÉ.

     Suivre le doigt ne suffisait pas : au relâchement, la nouvelle
     image apparaissait quand même d'un coup, à sa place finale. On
     la fait donc ENTRER depuis le côté d'où elle vient — à gauche si
     l'on tourne la page vers la suivante, à droite pour revenir en
     arrière.

     Le sens est déduit du geste, mais aussi des flèches et du
     clavier : la version web tourne sur des ordinateurs, où l'on
     feuillette au clavier et où le même mouvement doit se voir.

     On repère l'image par sa SOURCE et non par un compteur : c'est
     elle qui change, et la visionneuse ne connaît pas son rang.
     ------------------------------------------------------------ */
  /* Le réglage « moins de mouvement » existe pour les personnes que
     l'animation gêne réellement — vertiges, migraines. On ne
     ralentit pas : on ne bouge pas. */
  const doux =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  /* Échap ferme. Sur un téléphone il n'y a pas de clavier, mais la
     version web tourne sur des ordinateurs — et la croix seule
     obligerait à viser. */
  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
      /* Les flèches font ce que fait le doigt : la version web tourne
         sur des ordinateurs, où il n'y a rien à glisser. */
      if (e.key === 'ArrowRight') aller('gauche');
      if (e.key === 'ArrowLeft') aller('droite');
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [fermer, precedente, suivante]);

  const prendre = async () => {
    setEnCours(true);
    setEtat(null);
    const r = await enregistrer(src, nom);
    setEnCours(false);
    setEtat(
      r.fait === 'enregistre'
        ? `Enregistré dans « ${r.ou} »`
        : r.fait === 'ouvert'
          ? 'Ouvert dans un onglet'
          : `Échec : ${r.pourquoi}`
    );
  };

  return (
    <div
      className="visionneuse"
      role="dialog"
      aria-modal="true"
      aria-label={legende ?? 'Image en grand'}
      /* Le fond ferme ; l'image et la barre ne remontent pas
         jusqu'à lui, sans quoi appuyer sur une réaction refermerait
         tout. */
      onClick={fermer}
    >
      <div className="visionneuse__barre" onClick={(e) => e.stopPropagation()}>
        <button className="tapicon" onClick={fermer} aria-label="Fermer">
          <Icone nom="x" taille={22} couleur="#FFF" epaisseur={2} />
        </button>
        <span style={{ flexGrow: 1, fontSize: 14, color: '#C9D8D0', textAlign: 'center' }}>
          {position ?? ''}
        </span>
        {enCours ? (
          <Anneau part={null} taille={26} epaisseur={3} />
        ) : (
          <button
            className="link"
            style={{ color: '#FFF', padding: '0 6px' }}
            onClick={() => void prendre()}
          >
            Enregistrer
          </button>
        )}
      </div>

      {/* La zone de l'image reçoit le geste. « pan-y pinch-zoom »
          laisse au navigateur le défilement vertical et le zoom à
          deux doigts, qu'on vient de rendre à l'application. */}
      <div
        {...gestes}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center',
          justifyContent: 'center', touchAction: 'pan-y pinch-zoom'
        }}
      >
        {precedente && (
          <button
            className="tapicon feuilleter feuilleter--gauche"
            aria-label="Image précédente"
            onClick={() => aller('droite')}
          >
            <Icone nom="back" taille={22} couleur="#FFF" epaisseur={2} />
          </button>
        )}
        {suivante && (
          <button
            className="tapicon feuilleter feuilleter--droite"
            aria-label="Image suivante"
            onClick={() => aller('gauche')}
          >
            <Icone nom="chev" taille={22} couleur="#FFF" epaisseur={2} />
          </button>
        )}
        <img
          /* La clé porte la SOURCE : React remonte donc l'élément à
             chaque changement d'image, et l'animation d'entrée
             repart. Sans elle, le même nœud serait réutilisé et
             l'animation ne jouerait qu'une seule fois. */
          key={src}
          src={src}
          alt={legende ?? ''}
          className={
            'visionneuse__image' +
            (doux || !sens ? '' : ` visionneuse__image--vient-de-${sens}`)
          }
          style={{
            transform: decalage ? `translateX(${decalage}px)` : undefined,
            /* Pendant le geste, AUCUNE transition : l'image doit
               coller au doigt. Au relâchement, elle revient en place
               en douceur — c'est ce retour-là qui dit « pas assez
               loin » sans un mot. */
            transition: enGeste ? 'none' : 'transform 220ms cubic-bezier(.22,.61,.36,1)'
          }}
          draggable={false}
          /* Un glissement se termine par un clic que le navigateur
             envoie quand même ; le fond de la visionneuse ferme au
             clic, et glisser refermait donc tout. */
          onClick={() => onAGlisse()}
        />
      </div>

      <div className="visionneuse__bas" onClick={(e) => e.stopPropagation()}>
        {legende && <p className="visionneuse__legende">{legende}</p>}

        {etat && (
          <p
            role="status"
            style={{ fontSize: 12.5, color: etat.startsWith('Échec') ? '#FFB4A2' : '#C9D8D0' }}
          >
            {etat}
          </p>
        )}

        <BarreReactions genre={genre} sujet={sujet} />
      </div>
    </div>
  );
}
