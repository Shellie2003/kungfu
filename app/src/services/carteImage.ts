/* ============================================================
   La carte de membre, en image.

   « Enregistrer en image — pour l'envoyer ou l'imprimer » : la
   maquette le promettait, et cela n'a jamais été fait. C'est
   pourtant l'usage le plus concret de cet écran. Un membre veut
   envoyer sa carte au maître par message, la garder quand le
   téléphone n'a plus de réseau, ou la faire imprimer au kiosque du
   quartier. Aucun des trois ne passe par une capture d'écran : on y
   voit la barre d'état, les onglets, et la moitié du bandeau vert.

   ------------------------------------------------------------
   POURQUOI ON DESSINE, PLUTÔT QUE DE PHOTOGRAPHIER LE DOM

   La façon habituelle serait html2canvas : on lui donne l'élément,
   il rend une image. Elle coûte quarante kilo-octets compressés, et
   le budget du premier chargement est à 241 sur 245 — la carte de
   membre ferait grossir le paquet de TOUT LE MONDE, y compris de
   ceux qui ne l'ouvriront jamais.

   Et elle rend mal ce qui compte ici : les polices chargées à
   distance, les dégradés, les coins arrondis. La carte, elle, a une
   composition connue et fixe — un bandeau, un portrait, quatre
   lignes, un code. La dessiner à la main tient en cent lignes, ne
   pèse rien, et donne un fichier net à la résolution qu'on veut.

   ------------------------------------------------------------
   CE QUE L'IMAGE CONTIENT, ET CE QU'ELLE NE CONTIENT PAS

   Ce qui est déjà sur la carte : nom, prénom, grade, matricule, et
   le code du matricule. Rien d'autre. Pas de date de naissance, pas
   de téléphone, pas de tuteur — une image se transmet, se reçoit
   par erreur et se retrouve dans la galerie d'un téléphone partagé.
   Ce qui est privé reste sur la fiche, derrière une session.
   ============================================================ */

export type CarteAImprimer = {
  nomClub: string;
  nom: string;
  prenom: string;
  grade: string | null;
  couleurGrade: string;
  numero: string;
  depuis: string | null;
  lieuClub: string;
  /* Le code QR, en image déjà prête. On ne le regénère pas ici :
     l'écran en a un, et deux façons de produire le même code
     finiraient par en produire deux différents. */
  qr: HTMLImageElement | null;
  /* Le portrait, quand il y en a un. Le marque-place est dessiné
     sinon — un cadre vide est plus honnête qu'une silhouette qui
     ressemble à quelqu'un. */
  portrait: HTMLImageElement | null;
};

/* Le format d'une carte bancaire — 85,6 × 54 mm — à 300 points par
   pouce : c'est ce qu'attend l'imprimeur du quartier, et c'est aussi
   assez fin pour que le code se scanne depuis l'écran d'un autre
   téléphone. */
const LARGEUR = 1011;
const HAUTEUR = 638;

const VERT = '#0F5132';
const ENCRE = '#0E2119';
const GRIS = '#59685F';

/* Un rectangle à coins arrondis. « roundRect » existe dans les
   navigateurs récents et manque dans la WebView de certains
   téléphones encore en service à Antananarivo ; on le dessine donc
   soi-même plutôt que de laisser l'image sortir carrée sur un
   appareil et arrondie sur l'autre. */
function coinsArrondis(
  c: CanvasRenderingContext2D,
  x: number, y: number, l: number, h: number, r: number
) {
  const rayon = Math.min(r, l / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rayon, y);
  c.arcTo(x + l, y, x + l, y + h, rayon);
  c.arcTo(x + l, y + h, x, y + h, rayon);
  c.arcTo(x, y + h, x, y, rayon);
  c.arcTo(x, y, x + l, y, rayon);
  c.closePath();
}

export function dessinerCarte(carte: CarteAImprimer): HTMLCanvasElement {
  const toile = document.createElement('canvas');
  toile.width = LARGEUR;
  toile.height = HAUTEUR;
  const c = toile.getContext('2d');
  if (!c) throw new Error('Le dessin de la carte n’est pas possible sur cet appareil.');

  /* Le fond est BLANC et non transparent. Une image transparente
     s'imprime en blanc, mais s'affiche sur fond noir dans la plupart
     des visionneuses de photos — le texte vert foncé devient
     illisible juste au moment où l'on montre sa carte. */
  c.fillStyle = '#FFFFFF';
  c.fillRect(0, 0, LARGEUR, HAUTEUR);

  /* ---- Le bandeau du club ---- */
  c.fillStyle = VERT;
  c.fillRect(0, 0, LARGEUR, 104);
  c.fillStyle = '#FFFFFF';
  c.font = '700 34px Archivo, Helvetica, sans-serif';
  c.textBaseline = 'alphabetic';
  c.fillText(carte.nomClub.toUpperCase(), 48, 52);
  c.fillStyle = '#B9D4C6';
  c.font = '400 22px Karla, system-ui, sans-serif';
  c.fillText('Carte de membre', 48, 84);

  /* ---- Le portrait ---- */
  const px = 48;
  const py = 150;
  const pl = 240;
  const ph = 300;
  c.save();
  coinsArrondis(c, px, py, pl, ph, 24);
  c.clip();
  if (carte.portrait) {
    /* « cover » à la main : on recadre au centre plutôt que
       d'écraser un visage pour le faire entrer dans le cadre. */
    const r = Math.max(pl / carte.portrait.width, ph / carte.portrait.height);
    const l = carte.portrait.width * r;
    const h = carte.portrait.height * r;
    c.drawImage(carte.portrait, px + (pl - l) / 2, py + (ph - h) / 2, l, h);
  } else {
    c.fillStyle = '#E8F1EC';
    c.fillRect(px, py, pl, ph);
  }
  c.restore();

  /* ---- Nom, prénom, grade, matricule ---- */
  const tx = px + pl + 40;
  c.fillStyle = ENCRE;
  c.font = '700 46px Archivo, Helvetica, sans-serif';
  c.fillText(carte.nom, tx, py + 52);
  c.fillStyle = '#3C4A42';
  c.font = '500 36px Archivo, Helvetica, sans-serif';
  c.fillText(carte.prenom, tx, py + 104);

  if (carte.grade) {
    /* La pastille du grade, avec sa couleur. Le nom est écrit à
       côté : la couleur seule ne dit rien à qui ne la distingue
       pas, et une carte se regarde parfois en noir et blanc — elle
       sort d'une photocopieuse. */
    c.fillStyle = carte.couleurGrade;
    c.beginPath();
    c.arc(tx + 11, py + 148, 11, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = GRIS;
    c.font = '400 26px Karla, system-ui, sans-serif';
    c.fillText(carte.grade, tx + 34, py + 157);
  }

  c.fillStyle = VERT;
  c.font = '700 40px Archivo, Helvetica, sans-serif';
  c.fillText(carte.numero, tx, py + 236);

  /* ---- Le code ---- */
  if (carte.qr) {
    const taille = 190;
    c.drawImage(carte.qr, LARGEUR - taille - 48, py - 4, taille, taille);
  }

  /* ---- Le pied ---- */
  c.fillStyle = '#59685F';
  c.font = '400 22px Karla, system-ui, sans-serif';
  c.fillText(
    carte.depuis ? `Membre depuis ${carte.depuis}` : 'Membre du club',
    48,
    HAUTEUR - 58
  );
  const lieu = carte.lieuClub;
  c.textAlign = 'right';
  c.fillText(lieu, LARGEUR - 48, HAUTEUR - 58);
  c.textAlign = 'left';

  /* La bande du grade, en bas, comme sur l'écran. */
  c.fillStyle = carte.couleurGrade;
  c.fillRect(0, HAUTEUR - 16, LARGEUR, 16);

  return toile;
}

/* Le nom du fichier porte le matricule : dix cartes dans le même
   dossier de téléchargements se distinguent alors sans les ouvrir. */
export const nomFichierCarte = (numero: string) => `carte-${numero}.png`;

/* Charger une image et ATTENDRE qu'elle soit prête. Dessiner une
   image non chargée ne lève rien : elle manque simplement, et l'on
   obtient une carte sans portrait sans savoir pourquoi. */
export function charger(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((ok) => {
    const img = new Image();
    /* Sans cela, une image d'une autre origine « salit » la toile et
       « toDataURL » lève une erreur de sécurité — la carte
       échouerait au dernier moment, après le dessin. */
    img.crossOrigin = 'anonymous';
    img.onload = () => ok(img);
    /* Un échec n'est pas fatal : la carte se dessine sans portrait,
       ce qui vaut mieux que pas de carte du tout. */
    img.onerror = () => ok(null);
    img.src = src;
  });
}
