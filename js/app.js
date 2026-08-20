/* ============================================================
   app.js — Coquille de la maquette

   Trois rôles, aucun n'appartient à l'application finale :
     · parcourir les écrans (index à gauche, menu sur téléphone) ;
     · recueillir les commentaires du client, écran par écran et
       fonctionnalité par fonctionnalité, puis les exporter ;
     · essayer le logo du club sans passer par un développeur.
   ============================================================ */

const GROUPES = [
  ['À relire', ['fonctionnalites']],
  ['Entrée', ['connexion', 'accueil']],
  ['Étudiants', ['etudiants', 'profilVerrouille', 'profilOuvert', 'carte']],
  ['Casier', ['casier', 'casierDetail', 'notifications']],
  ['Album', ['album', 'photo']],
  ['Le club', ['club']],
  ['Administration', ['admin']],
  ['Directions à choisir', ['directionA', 'directionB', 'directionC']],
  ['Référence', ['charte']]
];
const ORDRE = GROUPES.flatMap(([, k]) => k);

const app = { current: 'fonctionnalites', el: {} };

/* ---------------------------------------------- Stockage local
   Commentaires et logo restent sur l'appareil du client : la
   maquette n'envoie rien nulle part. */
const MAGASIN = {
  lire(cle, secours) {
    try { return JSON.parse(localStorage.getItem('waishi.' + cle)) ?? secours; }
    catch { return secours; }
  },
  ecrire(cle, valeur) {
    try { localStorage.setItem('waishi.' + cle, JSON.stringify(valeur)); } catch { /* mode privé */ }
  }
};

let commentaires = MAGASIN.lire('commentaires', {});
let logo = MAGASIN.lire('logo', null);

/* Libellé lisible d'une clé de commentaire, pour l'export. */
function nomFonction(cle) {
  if (cle.startsWith('ecran:')) {
    const k = cle.slice(6);
    return 'Écran — ' + (SCREENS[k] ? SCREENS[k].label.replace(/^\d+\s·\s/, '') : k);
  }
  const el = document.querySelector(`[data-feat="${cle}"] .featrow__t`);
  return el ? el.textContent : cle;
}

/* ---------------------------------------------- Rendu d'un écran */
function afficher(cle) {
  const ecran = SCREENS[cle];
  if (!ecran) return;
  app.current = cle;

  app.el.stage.innerHTML = ecran.wide
    ? `<div class="wide">${ecran.html}</div>`
    : `<div class="device"><div class="device__screen">${ecran.html}</div></div>`;

  /* Bouton de commentaire sur chaque écran de maquette : le client
     peut réagir à ce qu'il voit, pas seulement à une liste. */
  if (!ecran.wide && cle !== 'fonctionnalites') {
    app.el.stage.querySelector('.device').insertAdjacentHTML('beforeend',
      `<button class="bulle" data-feat="ecran:${cle}" aria-label="Commenter cet écran">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/></svg>
        <span data-count="ecran:${cle}"></span>
      </button>`);
  }

  app.el.stage.insertAdjacentHTML('beforeend', `<p class="stage__caption" id="caption"></p>`);
  document.getElementById('caption').innerHTML =
    `<b>${ecran.label.replace(/^\d+\s·\s/, '')}</b> — maquette, en attente de validation`;

  /* Entrée en cascade des blocs. */
  const racine = app.el.stage.querySelector('.phone, .sheet');
  if (racine) {
    (racine.querySelector('.dirA__body, .dirB__content, [style*="flex-grow:1"]') || racine)
      .classList.add('enter');
  }

  appliquerLogo();
  rafraichirCompteurs();
  marquerActif();
  app.el.stage.scrollTop = 0;
  if (app.el.titre) app.el.titre.textContent = ecran.label.replace(/^\d+\s·\s/, '');
  fermerTiroir();
}

function marquerActif() {
  document.querySelectorAll('#index [data-go], #tiroir [data-go]').forEach((b) =>
    b.setAttribute('aria-current', String(b.dataset.go === app.current)));
}

/* ---------------------------------------------- Logo du club */
function appliquerLogo() {
  if (!logo) return;
  /* Chaque emplacement d'emblème reçoit l'image, en conservant sa
     taille : un seul fichier suffit pour toute la maquette. */
  document.querySelectorAll('.emblem, .index__mark i').forEach((n) => {
    n.innerHTML = `<img src="${logo}" alt="Logo du club">`;
    n.classList.add('emblem--img');
  });
}

function choisirLogo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
  input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) {
      alert('Image trop lourde (maximum 1,5 Mo). Réduisez-la avant de la charger.');
      return;
    }
    const lecteur = new FileReader();
    lecteur.onload = () => {
      logo = lecteur.result;
      MAGASIN.ecrire('logo', logo);
      afficher(app.current);
    };
    lecteur.readAsDataURL(f);
  });
  input.click();
}

/* ---------------------------------------------- Commentaires */
function rafraichirCompteurs() {
  document.querySelectorAll('[data-count]').forEach((n) => {
    const c = commentaires[n.dataset.count];
    n.textContent = c ? '1' : '';
    n.classList.toggle('on', !!c);
  });
  const total = Object.keys(commentaires).length;
  document.querySelectorAll('[data-total]').forEach((n) => {
    n.textContent = total ? total : '';
    n.classList.toggle('on', total > 0);
  });
}

function ouvrirCommentaire(cle) {
  const existant = commentaires[cle];
  const titre = nomFonction(cle);
  fermerVoile();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="voile" data-fermer>
      <div class="feuille" role="dialog" aria-label="Commentaire">
        <div class="feuille__poignee"></div>
        <p class="feuille__sur">Votre commentaire</p>
        <p class="feuille__titre">${titre}</p>
        <textarea class="feuille__zone" id="zoneCommentaire" rows="5"
          placeholder="Ce qu’il faut changer, ajouter ou retirer…">${existant ? existant.texte : ''}</textarea>
        <div class="feuille__actions">
          ${existant ? '<button class="btn btn--ghost" data-action="supprimerCommentaire">Supprimer</button>' : ''}
          <button class="btn btn--primary" data-action="enregistrerCommentaire" data-cle="${cle}">Enregistrer</button>
        </div>
      </div>
    </div>`);
  const zone = document.getElementById('zoneCommentaire');
  zone.focus();
  zone.selectionStart = zone.value.length;
  app.cleCourante = cle;
}

function enregistrerCommentaire() {
  const texte = document.getElementById('zoneCommentaire').value.trim();
  if (texte) {
    commentaires[app.cleCourante] = { texte, date: new Date().toISOString().slice(0, 10) };
  } else {
    delete commentaires[app.cleCourante];
  }
  MAGASIN.ecrire('commentaires', commentaires);
  fermerVoile();
  rafraichirCompteurs();
}

function supprimerCommentaire() {
  delete commentaires[app.cleCourante];
  MAGASIN.ecrire('commentaires', commentaires);
  fermerVoile();
  rafraichirCompteurs();
}

/* L'export produit un texte simple : lisible dans un courriel, dans
   un message, ou collé tel quel dans un ticket. */
function exporter() {
  const cles = Object.keys(commentaires);
  if (!cles.length) {
    alert('Aucun commentaire pour le moment.\n\nTouchez une fonctionnalité pour en écrire un.');
    return;
  }
  const lignes = [
    'COMMENTAIRES SUR LA MAQUETTE',
    'Kung-fu Waishi Analamahitsy',
    `Le ${new Date().toLocaleDateString('fr-FR')} · ${cles.length} commentaire${cles.length > 1 ? 's' : ''}`,
    ''
  ];
  cles.forEach((k) => {
    lignes.push('— ' + nomFonction(k), commentaires[k].texte, '');
  });
  const texte = lignes.join('\n');

  const blob = new Blob([texte], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'commentaires-waishi.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);

  if (navigator.clipboard) navigator.clipboard.writeText(texte).catch(() => {});
}

function fermerVoile() { document.querySelector('.voile')?.remove(); }

/* ---------------------------------------------- Menu sur téléphone */
function listeEcrans(id) {
  return `<div id="${id}">
    ${GROUPES.map(([titre, cles]) => `
      <p class="index__group">${titre}</p>
      ${cles.map((k) => `<button class="index__link" data-go="${k}">
          <span class="index__num">${(SCREENS[k].label.match(/^\d+/) || ['·'])[0]}</span>
          <span>${SCREENS[k].label.replace(/^\d+\s·\s/, '')}</span>
        </button>`).join('')}`).join('')}
  </div>`;
}

function ouvrirTiroir() { document.body.classList.add('tiroir-ouvert'); }
function fermerTiroir() { document.body.classList.remove('tiroir-ouvert'); }

/* ---------------------------------------------- Démarrage */
document.addEventListener('DOMContentLoaded', () => {
  app.el.index = document.getElementById('index');
  app.el.stage = document.getElementById('stage');

  const marque = `<div class="index__brand">
      <div class="index__mark">
        <i><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/>
          <path d="M9 12.2l2 2 4-4.4"/></svg></i>
        Kung-fu Waishi
      </div>
      <p class="index__sub">Analamahitsy · maquette ${Object.keys(SCREENS).length} écrans</p>
      <div class="index__outils">
        <button class="outil" data-action="logo">Logo du club</button>
        <button class="outil" data-action="exporter">Exporter <span data-total></span></button>
      </div>
    </div>`;

  app.el.index.innerHTML = marque + listeEcrans('listeBureau');

  /* Barre supérieure et tiroir : ils n'apparaissent que sur petit
     écran, où l'index latéral n'a pas la place d'exister. */
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <button class="tapicon" data-action="menu" aria-label="Liste des écrans">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <span class="topbar__titre" id="topbarTitre"></span>
      <button class="tapicon" data-action="exporter" aria-label="Exporter les commentaires">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/></svg>
        <span class="topbar__pastille" data-total></span>
      </button>
    </header>
    <div class="tiroir" id="tiroir">
      <div class="tiroir__panneau">
        <div class="tiroir__tete">
          <b>Écrans de la maquette</b>
          <button class="tapicon" data-action="fermerMenu" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
        <div class="tiroir__outils">
          <button class="outil" data-action="logo">Logo du club</button>
        </div>
        ${listeEcrans('listeMobile')}
      </div>
    </div>`);
  app.el.titre = document.getElementById('topbarTitre');

  /* Deux façons de poser le logo, sans développeur :
     — déposer le fichier dans `img/logo.png` : il vaut pour tout le
       monde et part avec le dépôt ;
     — ou le charger depuis la maquette : il reste sur cet appareil.
     Le fichier du dépôt gagne, sauf si un logo local a été choisi. */
  if (!logo) {
    const essai = new Image();
    essai.onload = () => { logo = 'img/logo.png'; appliquerLogo(); };
    essai.src = 'img/logo.png';
  }

  afficher('fonctionnalites');

  document.addEventListener('click', (e) => {
    if (e.target.matches('.voile[data-fermer]')) { fermerVoile(); return; }

    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'logo') choisirLogo();
      if (a === 'exporter') exporter();
      if (a === 'menu') ouvrirTiroir();
      if (a === 'fermerMenu') fermerTiroir();
      if (a === 'enregistrerCommentaire') enregistrerCommentaire();
      if (a === 'supprimerCommentaire') supprimerCommentaire();
      return;
    }

    /* Une ligne de fonctionnalité ouvre son commentaire ; l'icône
       d'écran à droite mène à l'écran correspondant. */
    const feat = e.target.closest('[data-feat]');
    if (feat) { ouvrirCommentaire(feat.dataset.feat); return; }

    const nav = e.target.closest('[data-go]');
    if (nav) afficher(nav.dataset.go);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { fermerVoile(); fermerTiroir(); return; }
    if (e.target.matches('textarea, input')) return;
    const i = ORDRE.indexOf(app.current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); afficher(ORDRE[(i + 1) % ORDRE.length]); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); afficher(ORDRE[(i - 1 + ORDRE.length) % ORDRE.length]); }
  });
});
