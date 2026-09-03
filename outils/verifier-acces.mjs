/* ============================================================
   verifier-acces.mjs — Ce que la comparaison à la maquette ne voit
   pas.

       node outils/verifier-acces.mjs

   Le banc de comparaison mesure des pixels et de la géométrie. Il ne
   dit rien de ce qui ne se photographie pas : un bouton qu'aucun
   lecteur d'écran ne sait nommer, une cible trop petite pour un
   doigt, un parcours au clavier où l'on ne voit jamais où l'on est.

   Ces trois défauts ont ceci de commun qu'ils sont INVISIBLES à qui
   ne les subit pas. Le club compte des parents d'un certain âge, des
   téléphones d'entrée de gamme et des écrans fêlés ; personne ne se
   plaindra, on cessera simplement de se servir de l'écran.

   ------------------------------------------------------------
   CE QUE CE CONTRÔLE NE DIT PAS

   Il ne remplace pas un essai avec un vrai lecteur d'écran. Il
   attrape ce qui se vérifie mécaniquement — un nom manquant, une
   cible de douze pixels, un liseré de focus absent — et ce sont
   justement les défauts qui reviennent, parce qu'ils s'introduisent
   sans qu'on y pense.
   ============================================================ */
import { chromium } from 'playwright';
import { brancher, poserSession, servir } from './bouchon.mjs';

const RACINE = new URL('../app/dist/', import.meta.url).pathname;

/* Vingt-quatre pixels : le minimum du critère 2.5.8 des règles
   d'accessibilité du web, niveau AA. Ce n'est PAS le confort — le
   confort est à quarante-quatre — c'est le plancher en dessous
   duquel on ne vise plus, on tâtonne. Les barres d'onglets et les
   boutons ronds de cette application sont à quarante-quatre ; ce
   contrôle attrape ce qui tomberait par accident. */
const CIBLE_MINIMALE = 24;

const ECRANS = [
  ['accueil', '/#/accueil'],
  ['etudiants', '/#/etudiants'],
  ['profil', '/#/etudiants/p1'],
  ['casier', '/#/casier'],
  ['actualite', '/#/casier/a1'],
  ['participation', '/#/casier/a1/participer'],
  ['album', '/#/album'],
  ['photo', '/#/album/al1/0'],
  ['club', '/#/club'],
  ['notifications', '/#/notifications'],
  ['messages', '/#/messages'],
  ['salon', '/#/messages/s1'],
  ['carte', '/#/carte'],
  ['motdepasse', '/#/motdepasse'],
  ['admin', '/#/admin'],
  ['adm-fiche', '/#/admin/fiche'],
  ['adm-comptes', '/#/admin/comptes'],
  ['adm-publier', '/#/admin/publier'],
  ['adm-club', '/#/admin/club'],
  ['adm-presences', '/#/presences/pointer'],
  ['adm-participations', '/#/admin/participations']
];

/* ------------------------------------------------------------
   Le relevé, exécuté DANS la page.

   Le nom accessible est calculé à la main plutôt que demandé au
   navigateur : « accessibleName » n'existe pas partout, et la règle
   qui compte ici est simple — aria-label, ou title, ou le texte
   qu'on voit, ou l'étiquette d'un champ. Un bouton qui n'a que des
   traits de dessin dedans n'a rien de tout cela, et c'est ce cas-là
   qu'on cherche.
   ------------------------------------------------------------ */
const RELEVE = `(minimum) => {
  const nomDe = (e) => {
    const aria = (e.getAttribute('aria-label') || '').trim();
    if (aria) return aria;
    const par = e.getAttribute('aria-labelledby');
    if (par) {
      const cible = document.getElementById(par);
      if (cible && cible.textContent.trim()) return cible.textContent.trim();
    }
    const titre = (e.getAttribute('title') || '').trim();
    if (titre) return titre;
    const texte = (e.innerText || e.textContent || '').replace(/\\s+/g, ' ').trim();
    if (texte) return texte;
    /* Un champ tire son nom de son étiquette, y compris quand elle
       l'entoure au lieu de le désigner. */
    if (e.labels && e.labels.length) {
      const l = [...e.labels].map((x) => x.innerText.trim()).join(' ').trim();
      if (l) return l;
    }
    const invite = (e.getAttribute('placeholder') || '').trim();
    if (invite) return invite;
    return '';
  };

  const sansNom = [];
  const tropPetits = [];
  const cibles = document.querySelectorAll(
    'button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );

  for (const e of cibles) {
    /* Ce qui est caché n'est pas une cible. « offsetParent » vaut
       null pour un élément non affiché ; on regarde aussi la boîte,
       parce qu'un élément en « position: fixed » a un offsetParent
       nul tout en étant bien visible. */
    const b = e.getBoundingClientRect();
    if (!b.width && !b.height) continue;
    if (e.disabled) continue;
    if (e.getAttribute('aria-hidden') === 'true') continue;

    const nom = nomDe(e);
    if (!nom) {
      sansNom.push(e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''));
      continue;
    }

    /* Un lien de texte au fil d'un paragraphe est explicitement hors
       du critère : on ne peut pas agrandir un mot sans casser la
       ligne. Ici, aucun lien ne vit dans un paragraphe — mais la
       règle vaut d'être écrite pour le jour où il y en aura un. */
    if (e.tagName === 'A' && e.closest('p')) continue;

    /* LA CIBLE N'EST PAS TOUJOURS L'ÉLÉMENT.

       Un champ de fichier accessible se cache : il garde sa place
       dans la page — un pixel sur un pixel — pour rester atteignable
       au clavier et nommable par un lecteur d'écran, et c'est
       l'ÉTIQUETTE qui l'entoure qu'on touche. Mesurer le champ
       reviendrait à reprocher à ce motif d'exister ; on mesure donc
       ce que le doigt vise vraiment. */
    let boite = b;
    if (b.width <= 2 || b.height <= 2) {
      const etiquette = e.closest('label');
      if (!etiquette) continue;
      boite = etiquette.getBoundingClientRect();
    }

    /* La zone RÉELLEMENT touchable peut dépasser la boîte : plusieurs
       liens de cette application l'agrandissent par un calque
       invisible, précisément pour ne pas déformer la mise en page.
       On mesure donc l'union de l'élément et de son pseudo-élément. */
    const apres = getComputedStyle(e, '::after');
    let l = boite.width;
    let h = boite.height;
    if (apres.content && apres.content !== 'none' && apres.position === 'absolute') {
      const px = (v) => (v && v.endsWith('px') ? parseFloat(v) : 0);
      l += -px(apres.left) + -px(apres.right);
      h += -px(apres.top) + -px(apres.bottom);
    }
    if (l < minimum || h < minimum) {
      tropPetits.push(nom.slice(0, 40) + ' — ' + Math.round(l) + '×' + Math.round(h));
    }
  }
  return { sansNom, tropPetits };
}`;

/* Le liseré de focus : on met le premier bouton de l'écran au foyer
   COMME LE FERAIT UN CLAVIER, puis on regarde s'il porte un contour.
   « :focus-visible » ne s'allume pas sur un focus programmé dans
   tous les navigateurs — on passe donc par la touche de tabulation,
   qui est le geste réel. */
const CONTOUR = `() => {
  const e = document.activeElement;
  if (!e || e === document.body) return { foyer: false };
  const c = getComputedStyle(e);
  const largeur = parseFloat(c.outlineWidth) || 0;
  return {
    foyer: true,
    quoi: (e.getAttribute('aria-label') || e.innerText || e.tagName).slice(0, 30),
    visible: largeur > 0 && c.outlineStyle !== 'none'
  };
}`;

const site = await servir(RACINE);
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 390, height: 780 } });
await poserSession(page);
await brancher(page);

console.log('');
let echecs = 0;

for (const [nom, route] of ECRANS) {
  await page.goto(`${site.adresse}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);

  /* La fonction est ÉCRITE puis APPELÉE dans la page, plutôt que
     passée avec son argument : une chaîne et un argument séparés ne
     rendaient rien du tout, sans erreur — le même piège que le banc
     de comparaison avait déjà rencontré, et il l'évite de la même
     façon. */
  const { sansNom, tropPetits } = await page.evaluate(
    `(${RELEVE})(${CIBLE_MINIMALE})`
  );

  /* Le parcours au clavier : une tabulation depuis le haut de la
     page doit poser le foyer quelque part, et cela doit SE VOIR. */
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(`(${CONTOUR})()`);

  const soucis = [];
  for (const s of sansNom) soucis.push(`sans nom accessible : ${s}`);
  for (const t of tropPetits) soucis.push(`cible sous ${CIBLE_MINIMALE} px : ${t}`);
  if (!focus.foyer) soucis.push('la tabulation ne pose le foyer nulle part');
  else if (!focus.visible) soucis.push(`le foyer sur « ${focus.quoi} » ne se voit pas`);

  if (soucis.length) echecs++;
  console.log(`${soucis.length ? '✗' : '✓'} ${nom.padEnd(20)} ${soucis.length ? '' : 'noms, cibles et foyer'}`);
  for (const s of soucis.slice(0, 6)) console.log(`   ${s}`);
  if (soucis.length > 6) console.log(`   … et ${soucis.length - 6} autres`);
}

await navigateur.close();
site.fermer();

console.log('');
if (echecs) {
  console.error(`${echecs} écran(s) laissent quelqu’un dehors.`);
  process.exit(1);
}
console.log(
  `Les ${ECRANS.length} écrans se nomment, se visent au doigt et se parcourent au clavier.`
);
