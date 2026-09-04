/* ============================================================
   Les briques communes aux écrans.

   Ce sont exactement celles de la maquette — header(), card(),
   chip(), btn(), grade(), portrait() — traduites en composants.
   Les classes CSS sont celles de css/app.css, qui est lu tel quel :
   la mise en forme n'est donc pas réécrite, seulement appelée.
   ============================================================ */
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Icone } from './Icone';

/* ---------------------------------------------- Portrait

   Marque-place assumé tant que les photos ne sont pas fournies :
   une silhouette au trait sur fond teinté. Dès qu'une photo existe,
   elle prend la place, au même cadrage. */
export function Portrait({
  taille,
  hauteur,
  rayon = 12,
  photo = null
}: {
  taille: number;
  hauteur?: number;
  rayon?: number;
  photo?: string | null;
}) {
  const h = hauteur ?? taille;
  const cadre: CSSProperties = {
    width: taille,
    height: h,
    borderRadius: rayon,
    background: '#E8F1EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    overflow: 'hidden'
  };
  if (photo) {
    return (
      <div style={cadre}>
        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const s = Math.round(taille * 0.5);
  return (
    <div style={cadre}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8FB3A0"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8.5" r="3.6" />
        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
      </svg>
    </div>
  );
}

/* ---------------------------------------------- En-tête d'écran */
export function Entete({
  titre,
  retour,
  action,
  sombre = false
}: {
  titre: string;
  retour?: () => void;
  action?: ReactNode;
  sombre?: boolean;
}) {
  return (
    <div className={sombre ? 'apphead apphead--sombre' : 'apphead'}>
      {retour ? (
        <button className="tapicon" onClick={retour} aria-label="Retour">
          <Icone nom="back" taille={22} couleur={sombre ? '#FFF' : '#0E2119'} epaisseur={2} />
        </button>
      ) : (
        <span style={{ width: 12 }} />
      )}
      <h1 className="apphead__title" style={sombre ? { color: '#FFF' } : undefined}>
        {titre}
      </h1>
      {action}
    </div>
  );
}

/* ---------------------------------------------- Petites briques */
export const Surtitre = ({ children }: { children: ReactNode }) => (
  <h2 className="overline">{children}</h2>
);

export const Carte = ({
  children,
  pad = 18,
  style,
  className = ''
}: {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  className?: string;
}) => (
  <div className={`card ${className}`.trim()} style={{ padding: pad, ...style }}>
    {children}
  </div>
);

export const Puce = ({
  texte,
  actif = false,
  onClick
}: {
  texte: string;
  actif?: boolean;
  onClick?: () => void;
}) => (
  <button
    className={actif ? 'chip chip--on' : 'chip'}
    onClick={onClick}
    aria-pressed={actif}
    type="button"
  >
    {texte}
  </button>
);

export const Bouton = ({
  children,
  genre = 'primary',
  onClick,
  type = 'button',
  desactive = false
}: {
  children: ReactNode;
  genre?: 'primary' | 'ghost' | 'soft';
  onClick?: () => void;
  type?: 'button' | 'submit';
  desactive?: boolean;
}) => (
  <button
    className={`btn btn--${genre}`}
    onClick={onClick}
    type={type}
    disabled={desactive}
    style={desactive ? { opacity: 0.55 } : undefined}
  >
    {children}
  </button>
);

/* Le nom du grade est TOUJOURS écrit à côté de la pastille. Un
   daltonien ne distingue pas le vert du orange ; la couleur seule
   ne porte donc jamais l'information. */
export const Grade = ({ nom, couleur }: { nom: string; couleur: string }) => (
  <span className="grade">
    <i style={{ background: couleur }} />
    {nom}
  </span>
);

export const Tuile = ({
  icone,
  petite = false,
  fond,
  couleur = '#0F5132'
}: {
  icone: string;
  petite?: boolean;
  fond?: string;
  couleur?: string;
}) => (
  <span className={petite ? 'tile tile--sm' : 'tile'} style={fond ? { background: fond } : undefined}>
    <Icone nom={icone} taille={petite ? 17 : 22} couleur={couleur} />
  </span>
);

export const Filet = () => <div className="hr" />;

/* ---------------------------------------------- États de liste

   Trois écrans sur quatre lisent une liste depuis le serveur. Les
   trois cas — ça charge, ça a raté, il n'y a rien — reviennent donc
   partout, et méritent une seule écriture. */
/* ------------------------------------------------------------
   « RÉESSAYEZ » SANS RIEN À PRESSER.

   Le message disait « vérifiez la connexion, puis réessayez » — et
   il n'y avait rien pour réessayer. Sur le web, on rafraîchit d'un
   F5 ; dans l'APK, il n'y a PAS de bouton de rafraîchissement, pas
   de barre d'adresse, rien. Le seul recours était de tuer
   l'application et de la rouvrir.

   Sur la ligne d'Antananarivo, une requête qui tombe n'est pas une
   panne : c'est mardi. Le bouton est donc la moitié qui manquait au
   message.

   On redemande TOUT plutôt que la seule requête en défaut : quand le
   réseau revient, il revient pour tout l'écran, et redemander une
   liste pendant que la suivante reste en erreur donnerait un écran à
   moitié réparé.
   ------------------------------------------------------------ */
function EnErreur() {
  const client = useQueryClient();
  const [encours, setEncours] = useState(false);

  return (
    <Carte style={{ background: '#FFF7F2', borderColor: '#F2D8C6' }}>
      <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#6B4218' }}>
        La liste n’a pas pu être chargée. Vérifiez la connexion, puis réessayez.
      </p>
      <div style={{ marginTop: 12 }}>
        <Bouton
          genre="ghost"
          desactive={encours}
          onClick={() => {
            setEncours(true);
            void client.refetchQueries().finally(() => setEncours(false));
          }}
        >
          {encours ? 'Nouvel essai…' : 'Réessayer'}
        </Bouton>
      </div>
    </Carte>
  );
}

export function Etat({
  chargement,
  erreur,
  vide,
  messageVide,
  children
}: {
  chargement: boolean;
  erreur: unknown;
  vide: boolean;
  messageVide: string;
  children: ReactNode;
}) {
  if (chargement) {
    return (
      <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
        Chargement…
      </div>
    );
  }
  if (erreur) {
    return <EnErreur />;
  }
  if (vide) {
    return (
      <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
        {messageVide}
      </div>
    );
  }
  return <>{children}</>;
}

/* ---------------------------------------------- Les formulaires

   Les écrans d'administration sont presque tous des formulaires. Un
   champ, c'est un libellé en petites capitales et une boîte : c'est
   « .field » et « .input » de la maquette, et rien d'autre. Les
   composer ici évite dix écritures légèrement différentes. */
export function Champ({
  libelle,
  valeur,
  poser,
  type = 'text',
  invite,
  aide,
  fige = false,
  obligatoire = false
}: {
  libelle: string;
  valeur: string;
  poser: (v: string) => void;
  type?: 'text' | 'date' | 'time' | 'tel' | 'password' | 'number';
  invite?: string;
  aide?: string;
  fige?: boolean;
  obligatoire?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__label">
        {libelle}
        {/* L'astérisque n'est pas décorative : sans elle, on découvre
            qu'un champ était obligatoire au moment où l'envoi
            échoue. */}
        {obligatoire && <span style={{ color: 'var(--alerte)' }}> *</span>}
      </span>
      {/* Le nom accessible est écrit explicitement, comme pour la
          liste déroulante : sans lui il est calculé sur tout le
          contenu du <label>, texte d'aide et astérisque compris. */}
      <input
        className={fige ? 'input input--fige' : 'input'}
        aria-label={libelle}
        type={type}
        value={valeur}
        onChange={(e) => poser(e.target.value)}
        placeholder={invite}
        disabled={fige}
        required={obligatoire}
      />
      {aide && <span className="aide">{aide}</span>}
    </label>
  );
}

export function Zone({
  libelle,
  valeur,
  poser,
  lignes = 5,
  aide
}: {
  libelle: string;
  valeur: string;
  poser: (v: string) => void;
  lignes?: number;
  aide?: string;
}) {
  return (
    <label className="field">
      <span className="field__label">{libelle}</span>
      <textarea
        className="input"
        aria-label={libelle}
        style={{ minHeight: lignes * 22 + 20, padding: '12px 14px', lineHeight: '22px' }}
        value={valeur}
        onChange={(e) => poser(e.target.value)}
        rows={lignes}
      />
      {aide && <span className="aide">{aide}</span>}
    </label>
  );
}

export function Choix<T extends string>({
  libelle,
  valeur,
  poser,
  options,
  aide,
  fige = false
}: {
  libelle: string;
  valeur: T | '';
  poser: (v: T) => void;
  options: { valeur: T; texte: string }[];
  aide?: string;
  /* Montré mais non modifiable, comme « Champ » sait déjà le faire.
     Le cacher serait pire : on veut voir à quoi la ligne est
     rattachée, sans pouvoir la déplacer. */
  fige?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__label">{libelle}</span>
      {/* Le chevron n'est pas décoratif : sans lui, « appearance:
          none » donne une boîte identique à un champ de texte vide,
          et rien ne dit qu'elle s'ouvre. Il est dessiné en fond
          plutôt qu'en élément, pour rester dans la boîte du champ. */}
      <span style={{ position: 'relative', display: 'block' }}>
        {/* Le nom accessible est écrit explicitement. Sans lui, il
            est calculé à partir du libellé PLUS le texte de toutes
            les options — un lecteur d'écran annonçait « Catégorie
            Choisir… Sortie Compétition Réunion… ». */}
        <select
          className={fige ? 'input input--fige' : 'input'}
          aria-label={libelle}
          value={valeur}
          disabled={fige}
          onChange={(e) => poser(e.target.value as T)}
          style={{ appearance: 'none', width: '100%', paddingRight: 40 }}
        >
          <option value="">Choisir…</option>
          {options.map((o) => (
            <option key={o.valeur} value={o.valeur}>
              {o.texte}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            pointerEvents: 'none',
            display: 'flex'
          }}
        >
          <Icone nom="chev" taille={16} couleur="#7C8B82" epaisseur={2} />
        </span>
      </span>
      {aide && <span className="aide">{aide}</span>}
    </label>
  );
}

/* Le retour d'une écriture : ce qui a marché, ce qui a échoué.
   Annoncé aux lecteurs d'écran — sans « role », un aveugle voit le
   bouton ne rien faire. */
export function Avis({ bon, children }: { bon: boolean; children: ReactNode }) {
  return (
    <p
      role={bon ? 'status' : 'alert'}
      style={{
        fontSize: 13,
        lineHeight: '19px',
        color: bon ? 'var(--vert-texte)' : '#B3341A'
      }}
    >
      {children}
    </p>
  );
}


/* ============================================================
   Choisir un fichier.

   Il y avait cinq « <input type="file" hidden> » dans des <label>
   à travers l'application, et le club a signalé que rien ne
   s'ouvrait : « l'import de fichier ne marche pas ».

   Ce qui reste, et ce qui change. L'ÉTIQUETTE reste : c'est elle
   qui donne son nom au champ, pour un lecteur d'écran comme pour un
   test. Ce qui change, c'est trois choses :

   1. « hidden » disparaît. Il vaut « display: none », et un champ
      qui n'est pas dans la mise en page ne se laisse pas toujours
      activer par un clic sur son étiquette — c'est le cas de
      certaines WebView d'Android, où le pont natif ne voit alors
      passer aucune demande d'ouverture. Le champ est maintenant
      invisible SANS sortir de la mise en page.

   2. Un clic explicite en second rideau. Si l'étiquette ne
      transmet rien, on ouvre le sélecteur nous-mêmes. Deux chemins
      valent mieux qu'un quand on ne peut pas essayer sur l'appareil.

   3. « accept="image/*" » envoie certaines WebView droit sur
      l'appareil photo, sans proposer la galerie. La liste explicite
      — les mêmes types que le seau accepte — ramène le sélecteur de
      documents.

   Et un quatrième cas, plus bête, qui ne se voyait nulle part :
   choisir DEUX FOIS la même photo ne déclenchait rien, la valeur du
   champ n'ayant pas changé. On la remet à zéro après chaque choix.
   ============================================================ */
export function ChoisirFichier({
  libelle,
  onFichier,
  multiple = false,
  desactive = false,
  appareil = false,
  documents = false,
  nomAccessible,
  style
}: {
  libelle: ReactNode;
  onFichier: (fichiers: File[]) => void;
  multiple?: boolean;
  desactive?: boolean;
  /* Élargit le choix aux documents — PDF, texte, Word, Excel. Éteint
     par défaut : partout ailleurs (portrait, album, photo du club),
     un PDF n'aurait aucun sens et le proposer inviterait à une
     erreur que le serveur refuserait ensuite. */
  documents?: boolean;
  /* « Prendre une photo » plutôt que « en choisir une ».
     « capture » demande à Android d'ouvrir l'appareil photo au lieu
     du sélecteur de documents. Sur un navigateur de bureau
     l'attribut est ignoré et l'on retombe sur le sélecteur : c'est
     pour cela que les deux boutons coexistent, plutôt qu'un seul
     qui ne marcherait qu'à moitié selon l'appareil. */
  appareil?: boolean;
  /* Obligatoire quand l'étiquette ne porte qu'une icône : sans lui,
     le champ n'a aucun nom, et un lecteur d'écran annonce
     « bouton ». C'est le cas du trombone de la messagerie. */
  nomAccessible?: string;
  style?: CSSProperties;
}) {
  const champ = useRef<HTMLInputElement>(null);

  return (
    <label
      className="btn btn--ghost"
      style={{ cursor: desactive ? 'default' : 'pointer', ...style }}
      /* Le second rideau : sur une WebView qui ne relaie pas le clic
         de l'étiquette, on ouvre le sélecteur à la main. « detail »
         distingue un vrai clic de celui que nous provoquons — sans
         quoi les deux chemins se rappelleraient l'un l'autre. */
      onClick={(e) => {
        if (desactive) {
          e.preventDefault();
          return;
        }
        if (e.detail !== 0 && e.target === e.currentTarget) champ.current?.click();
      }}
    >
      {libelle}
      <input
        ref={champ}
        type="file"
        accept={
          documents
            ? 'image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,' +
              'application/msword,' +
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
              'application/vnd.ms-excel,' +
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'image/jpeg,image/png,image/webp'
        }
        capture={appareil ? 'environment' : undefined}
        multiple={multiple && !appareil}
        disabled={desactive}
        aria-label={nomAccessible}
        /* Invisible, mais TOUJOURS dans la mise en page : c'est ce
           qui le distingue de « hidden », et c'est tout le point. */
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
        onChange={(e) => {
          const fichiers = [...(e.target.files ?? [])];
          /* Remis à zéro pour que rechoisir le même fichier
             redéclenche l'événement. */
          e.target.value = '';
          if (fichiers.length) onFichier(fichiers);
        }}
      />
    </label>
  );
}

/* ---------------------------------------------- Feuille

   Le panneau qui monte du bas de l'écran, par-dessus le reste.

   Il existait déjà, écrit à la main dans l'accueil pour la photo du
   club. L'écran du Club en demande cinq de plus — présentation,
   valeurs, contact… — et cinq copies du même balisage auraient
   dérivé l'une de l'autre à la première correction.

   FERMÉE, ELLE N'EXISTE PAS DANS LE DOCUMENT. Ce n'est pas une
   optimisation : c'est ce qui laisse les écrans au repos identiques
   à la maquette, et donc ce qui permet à la comparaison au pixel de
   rester exigeante. Un panneau simplement caché en CSS s'y verrait.

   Le clic sur le voile ferme ; le clic DANS la feuille ne remonte
   pas jusqu'à lui, sans quoi taper dans un champ refermerait le
   panneau qu'on est en train de remplir. */
export function Feuille({
  sur,
  titre,
  fermer,
  children
}: {
  /* Le surtitre : d'où l'on vient. « Le Club », « Accueil ». */
  sur: string;
  titre: string;
  fermer: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="voile"
      role="dialog"
      aria-modal="true"
      aria-label={titre}
      onClick={fermer}
    >
      <div className="feuille" onClick={(e) => e.stopPropagation()}>
        <span className="feuille__poignee" />
        <p className="feuille__sur">{sur}</p>
        <p className="feuille__titre">{titre}</p>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------- Modifier

   Le crayon posé au bout d'un titre de section.

   Il ne s'affiche qu'à qui peut réellement écrire. Montrer un
   crayon qui mène à un refus du serveur est pire que ne rien
   montrer : la personne essaie, échoue, et ne sait pas si c'est
   elle ou l'application. */
export function Modifier({ quoi, onClick }: { quoi: string; onClick: () => void }) {
  /* « modif » et non « link » : c'est la classe que porte déjà
     « Modifiable par l'administration », au bout du même titre de
     section, et que la maquette a mesurée.

     « link » fait 13 pixels contre 11 : la ligne de titre grandissait
     de deux pixels, et tout l'écran descendait d'autant — « Valeurs »
     en (20, 555) au lieu de (20, 553). Deux pixels ne se voient pas ;
     c'est précisément pour cela qu'on les mesure, parce que la
     ressemblance se perd deux pixels à la fois. */
  return (
    <button
      className="modif"
      aria-label={`Modifier ${quoi}`}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textDecoration: 'underline'
      }}
    >
      Modifier
    </button>
  );
}
