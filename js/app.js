/* ============================================================
   app.js — Navigation de la maquette.
   Uniquement ce qu'il faut pour parcourir les écrans devant le
   client : aucune logique applicative, la technologie n'est pas
   encore choisie.
   ============================================================ */

const GROUPES = [
  ['Entrée', ['connexion', 'accueil']],
  ['Étudiants', ['etudiants', 'profilVerrouille', 'profilOuvert']],
  ['Casier', ['casier', 'casierDetail', 'notifications']],
  ['Album', ['album', 'photo']],
  ['Le club', ['club']],
  ['Administration', ['admin']],
  ['Référence', ['charte']]
];

const app = { current: 'accueil', el: {} };

function afficher(cle) {
  const ecran = SCREENS[cle];
  if (!ecran) return;
  app.current = cle;

  if (ecran.wide) {
    app.el.stage.innerHTML = `<div class="wide">${ecran.html}</div>`;
  } else {
    app.el.stage.innerHTML =
      `<div class="device"><div class="device__screen">${ecran.html}</div></div>`;
  }
  app.el.stage.insertAdjacentHTML('beforeend',
    `<p class="stage__caption" id="caption"></p>`);

  document.getElementById('caption').innerHTML =
    `<b>${ecran.label.replace(/^\d+\s·\s/, '')}</b> — maquette, en attente de validation`;

  app.el.index.querySelectorAll('[data-go]').forEach((b) =>
    b.setAttribute('aria-current', String(b.dataset.go === cle)));

  app.el.stage.scrollTop = 0;
}

function construireIndex() {
  app.el.index.innerHTML = `
    <div class="index__brand">
      <div class="index__mark">
        <i><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/>
          <path d="M9 12.2l2 2 4-4.4"/></svg></i>
        Kung-fu Waishi
      </div>
      <p class="index__sub">Analamahitsy · maquette ${Object.keys(SCREENS).length} écrans</p>
    </div>
    ${GROUPES.map(([titre, cles]) => `
      <p class="index__group">${titre}</p>
      ${cles.map((k) => `<button class="index__link" data-go="${k}">
          <span class="index__num">${(SCREENS[k].label.match(/^\d+/) || ['·'])[0]}</span>
          <span>${SCREENS[k].label.replace(/^\d+\s·\s/, '')}</span>
        </button>`).join('')}`).join('')}`;
}

document.addEventListener('DOMContentLoaded', () => {
  app.el.index = document.getElementById('index');
  app.el.stage = document.getElementById('stage');

  construireIndex();
  afficher('accueil');

  /* Un seul écouteur : l'index et les écrans utilisent le même
     attribut `data-go`, donc les maquettes sont parcourables. */
  document.addEventListener('click', (e) => {
    const cible = e.target.closest('[data-go]');
    if (cible) afficher(cible.dataset.go);
  });

  document.addEventListener('keydown', (e) => {
    const cles = GROUPES.flatMap(([, k]) => k);
    const i = cles.indexOf(app.current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); afficher(cles[(i + 1) % cles.length]); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); afficher(cles[(i - 1 + cles.length) % cles.length]); }
  });
});
