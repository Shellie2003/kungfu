/* ============================================================
   app.js — Navigation, thème, overlays, micro-interactions
   ============================================================ */

const app = {
  current: 'splash',
  theme: 'light',
  el: {}
};

/* ---------------------------------------------- Navigation inférieure */
const TABS = [
  { key: 'home',      to: 'homeMaster', label: 'Accueil',  icon: icon.home },
  { key: 'martial',   to: 'martial',    label: 'Dojo',     icon: icon.martial },
  { key: 'seal' },
  { key: 'community', to: 'community',  label: 'Communauté', icon: icon.community },
  { key: 'temple',    to: 'temple',     label: 'Monastère', icon: icon.temple }
];

function renderTabbar(activeTab) {
  return `<nav class="tabbar" role="tablist">
    ${TABS.map((t) => t.key === 'seal'
      ? `<button class="tabbar__seal" data-action="sheet" aria-label="Actions rapides">${icon.seal}</button>`
      : `<button class="tabbar__btn" data-nav="${t.to}" role="tab"
              aria-current="${activeTab === t.key}">${t.icon}<span>${t.label}</span></button>`
    ).join('')}
  </nav>`;
}

/* ---------------------------------------------- Rendu d'un écran */
function navigate(key, { animate = true } = {}) {
  const def = SCREENS[key];
  if (!def) return;
  app.current = key;

  const chrome = def.chrome !== false;
  app.el.frame.innerHTML = `
    ${chrome ? statusbar() : ''}
    <main class="viewport">${def.render()}</main>
    ${def.tab ? renderTabbar(def.tab) : ''}
    ${chrome ? '<div class="homebar"></div>' : ''}`;

  if (animate) {
    const view = app.el.frame.querySelector('.viewport');
    view.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)' }
    );
  }

  app.el.frame.querySelector('.scroll')?.scrollTo(0, 0);
  syncIndex();
}

function statusbar() {
  return `<div class="statusbar">
    <span class="num">16:04</span>
    <div class="statusbar__glyphs"><i></i><i></i><i></i>
      <span style="margin-left:4px">Ⅴ</span><span class="statusbar__batt"></span></div>
  </div>`;
}

/* ---------------------------------------------- Index latéral */
function buildIndex() {
  const groups = [
    ['Identité', ['splash', 'login']],
    ['Accueils', ['homeMaster', 'homeAdmin', 'homeStudent']],
    ['Arts martiaux', ['martial', 'students', 'student', 'journey', 'grades', 'gradeDetail',
                       'techniques', 'trainings', 'session', 'attendance', 'exams', 'evaluate']],
    ['Communauté', ['community', 'member']],
    ['Vie du monastère', ['temple', 'planning', 'rooms', 'meals', 'stock', 'events']],
    ['Gestion', ['finance', 'dues', 'donations', 'documents']],
    ['Système', ['notifications', 'search', 'settings', 'users', 'permissions', 'states']]
  ];
  app.el.index.innerHTML = `
    <div class="index__brand">
      <div class="index__mark"><span>龍</span> Long Shan</div>
      <p class="index__sub">Système d’interface · 35 écrans</p>
    </div>
    ${groups.map(([g, keys]) => `
      <p class="index__group">${g}</p>
      ${keys.map((k) => `<button class="index__link" data-nav="${k}">
          <span class="index__num">${(SCREENS[k].label.match(/^\d+/) || ['·'])[0]}</span>
          <span class="grow truncate">${SCREENS[k].label.replace(/^[\d·]+\s·?\s?/, '')}</span>
        </button>`).join('')}`).join('')}`;
}

function syncIndex() {
  app.el.index.querySelectorAll('[data-nav]').forEach((b) => {
    b.setAttribute('aria-current', b.dataset.nav === app.current);
  });
  const label = SCREENS[app.current].label.replace(/^[\d·]+\s·?\s?/, '');
  app.el.caption.innerHTML = `<b>${label}</b> — mode ${app.theme === 'dark' ? 'sombre « Temple de nuit »' : 'clair'}`;
}

/* ---------------------------------------------- Thème */
/* Le thème est porté par le conteneur `.workbench`, pas par la racine :
   la page peut ainsi être intégrée dans un hôte qui impose son propre
   `data-theme` sans que l'application en soit affectée. */
function setTheme(next) {
  app.theme = next;
  (document.getElementById('root') || document.documentElement)
    .setAttribute('data-theme', next);
  document.querySelectorAll('[data-theme-btn]').forEach((b) =>
    b.setAttribute('aria-pressed', b.dataset.themeBtn === next));
  document.querySelectorAll('[data-action="theme"]').forEach((s) =>
    s.setAttribute('aria-checked', next === 'dark'));
  syncIndex();
}

/* ---------------------------------------------- Overlays */
function closeOverlay() {
  app.el.frame.querySelector('.scrim')?.remove();
}

function openSheet() {
  closeOverlay();
  const html = `<div class="scrim" data-close>
    <div class="sheet" role="dialog" aria-label="Actions rapides">
      <div class="sheet__grip"></div>
      <p class="overline">Actions rapides</p>
      <div class="row wrap gap-2 mt-4">
        ${[['Prendre les présences', 'attendance'], ['Nouvelle séance', null],
           ['Évaluer un élève', 'evaluate'], ['Annonce', null]].map(([l, to]) =>
          `<button class="btn btn--outline btn--sm" ${to ? `data-nav="${to}"` : 'data-action="toast"'}>${l}</button>`).join('')}
      </div>
      <div class="rule mt-5"><i></i></div>
      <p class="overline mt-5">Autres espaces</p>
      <div class="list mt-3">
        ${[['Ressources & stocks', 'stock', icon.box],
           ['Finances', 'finance', icon.coin],
           ['Cotisations', 'dues', icon.users],
           ['Documents', 'documents', icon.doc],
           ['Notifications', 'notifications', icon.bell],
           ['Recherche globale', 'search', icon.search],
           ['Paramètres', 'settings', icon.gear]].map(([l, to, ic]) => `
          <button class="item" data-nav="${to}">
            <span class="seal seal--sm seal--ink">${ic}</span>
            <span class="grow item__title">${l}</span>
            <span class="chevron">${icon.chev}</span>
          </button>`).join('')}
      </div>
    </div></div>`;
  app.el.frame.insertAdjacentHTML('beforeend', html);
}

/** Cérémonie de validation d'un grade — animation lente, une seule fois. */
function openGradeDialog() {
  closeOverlay();
  app.el.frame.insertAdjacentHTML('beforeend', `
    <div class="scrim dialog-wrap" data-close>
      <div class="dialog" role="alertdialog">
        <div class="stamp" style="display:grid;place-items:center">
          <span class="seal seal--lg seal--gold">${icon.belt}</span>
        </div>
        <p class="overline overline--gold mt-5">Grade validé</p>
        <h2 class="title mt-2">Ceinture orange</h2>
        <p class="sub mt-2">Rakoto Andry · moyenne ${examAverage().toFixed(1).replace('.', ',')}/20</p>
        <div class="rule mt-5"><i></i></div>
        <p class="caption mt-4">Un certificat a été généré et ajouté aux documents.</p>
        <button class="btn btn--primary btn--block mt-5" data-close-btn>Fermer</button>
        <button class="btn btn--ghost btn--block btn--sm mt-2" data-nav="documents">Voir le certificat</button>
      </div>
    </div>`);
}

function toast(message = 'Enregistré.') {
  app.el.frame.querySelector('.toast')?.remove();
  app.el.frame.insertAdjacentHTML('beforeend',
    `<div class="toast" role="status">${icon.check}<span>${message}</span></div>`);
  setTimeout(() => app.el.frame.querySelector('.toast')?.remove(), 2600);
}

/* ---------------------------------------------- Présences : recalcul en direct */
function updateRoll() {
  const boxes = [...app.el.frame.querySelectorAll('[data-roll-id]')];
  if (!boxes.length) return;
  const present = boxes.filter((b) => b.getAttribute('aria-checked') === 'true').length;
  const rate = Math.round((present / boxes.length) * 100);
  app.el.frame.querySelector('[data-roll-count]').textContent = present;
  app.el.frame.querySelector('[data-roll-rate]').textContent = rate + '%';
  app.el.frame.querySelector('[data-roll-bar] .bar__fill').style.width = rate + '%';
}

/* ---------------------------------------------- Recherche globale */
function refreshSearch() {
  const box = app.el.frame.querySelector('[data-search-results]');
  if (!box) return;
  box.innerHTML = searchResults(searchState.q, searchState.scope);
  box.scrollTop = 0;
}

/* ---------------------------------------------- Évaluation : pas-à-pas */
function bumpScore(i, delta) {
  const s = examState.scores[i];
  const next = Math.max(0, Math.min(20, s.score + delta));
  if (next === s.score) return;
  s.score = next;

  /* Seule la ligne touchée et le bandeau de moyenne sont redessinés :
     redessiner l'écran entier ferait perdre le focus et la position. */
  app.el.frame.querySelector(`[data-score-value="${i}"]`).innerHTML =
    `${s.score}<span class="sub">/20</span>`;
  app.el.frame.querySelector(`[data-score-bar="${i}"]`).innerHTML =
    bar(s.score * 5, s.score >= 16 ? 'bar__fill--positive' : s.score < 10 ? 'bar__fill--accent' : '');
  app.el.frame.querySelector('[data-exam-verdict]').outerHTML = examVerdict();
}

/* ---------------------------------------------- Appel : filtre par nom */
function filterRoll(q) {
  const n = norm(q).trim();
  app.el.frame.querySelectorAll('[data-roll-id]').forEach((row) => {
    const name = row.querySelector('.check__name').textContent;
    row.hidden = n ? !norm(name).includes(n) : false;
  });
  const visible = [...app.el.frame.querySelectorAll('[data-roll-id]')].filter((r) => !r.hidden);
  const note = app.el.frame.querySelector('[data-roll-empty]');
  if (note) note.hidden = visible.length > 0;
}

/* ---------------------------------------------- Écoute globale */
function onClick(e) {
  const t = e.target;

  /* Fermeture d'overlay */
  if (t.matches('.scrim[data-close]') || t.closest('[data-close-btn]')) {
    closeOverlay();
    if (!t.closest('[data-nav]')) return;
  }

  const nav = t.closest('[data-nav]');
  if (nav) { closeOverlay(); navigate(nav.dataset.nav); return; }

  const act = t.closest('[data-action]');
  if (!act) return;

  switch (act.dataset.action) {
    case 'sheet': openSheet(); break;
    case 'toast': toast('Enregistré.'); break;
    case 'validateGrade': openGradeDialog(); break;
    case 'retry': toast('Reconnexion…'); break;

    case 'theme':
      setTheme(app.theme === 'dark' ? 'light' : 'dark');
      break;

    case 'toggle': {
      const on = act.getAttribute('aria-checked') === 'true';
      act.setAttribute('aria-checked', String(!on));
      break;
    }

    case 'searchClear': {
      searchState.q = '';
      const input = app.el.frame.querySelector('[data-search-input]');
      if (input) { input.value = ''; input.focus(); }
      refreshSearch();
      break;
    }

    case 'scoreReset':
      examState.scores = EXAM_SCORES.map((s) => ({ ...s }));
      navigate('evaluate', { animate: false });
      toast('Notes réinitialisées.');
      break;

    case 'rollAll': {
      app.el.frame.querySelectorAll('[data-roll-id]').forEach((b) =>
        b.setAttribute('aria-checked', 'true'));
      updateRoll();
      toast('Tous les élèves marqués présents.');
      break;
    }
  }
}

/* Interactions au sein d'un écran (cases, onglets, filtres, segments) */
function onScreenClick(e) {
  const step = e.target.closest('[data-score]');
  if (step) { bumpScore(+step.dataset.score, +step.dataset.delta); return; }

  const chip = e.target.closest('[data-search]');
  if (chip) {
    searchState.q = chip.dataset.search;
    const input = app.el.frame.querySelector('[data-search-input]');
    if (input) input.value = searchState.q;
    refreshSearch();
    return;
  }

  const scope = e.target.closest('[data-scope]');
  if (scope) {
    searchState.scope = scope.dataset.scope;
    scope.parentElement.querySelectorAll('.filter').forEach((x) =>
      x.setAttribute('aria-pressed', String(x === scope)));
    refreshSearch();
    return;
  }

  const check = e.target.closest('[data-roll-id]');
  if (check) {
    check.setAttribute('aria-checked',
      String(check.getAttribute('aria-checked') !== 'true'));
    updateRoll();
    return;
  }
  const tab = e.target.closest('.tab');
  if (tab) {
    tab.parentElement.querySelectorAll('.tab').forEach((x) =>
      x.setAttribute('aria-selected', String(x === tab)));
    return;
  }
  const filter = e.target.closest('.filter');
  if (filter) {
    filter.parentElement.querySelectorAll('.filter').forEach((x) =>
      x.setAttribute('aria-pressed', String(x === filter)));

    /* Filtre de rail : on redessine la piste et on la ramène au début,
       sinon la position de défilement précédente survit au changement. */
    const railId = filter.parentElement.dataset.railFilters;
    if (railId && filter.dataset.railKey) {
      const rail = app.el.frame.querySelector(`[data-rail="${railId}"]`);
      if (rail) {
        rail.innerHTML = memberRailCards(filter.dataset.railKey);
        rail.scrollTo({ left: 0, behavior: 'smooth' });
        rail.querySelectorAll('.mcard').forEach((c, i) => {
          c.style.animation = `rise var(--d-base) var(--e-out) both ${i * 40}ms`;
        });
      }
    }
    return;
  }
  const seg = e.target.closest('.segmented button');
  if (seg) {
    seg.parentElement.querySelectorAll('button').forEach((x) =>
      x.setAttribute('aria-pressed', String(x === seg)));
  }
}

/* ---------------------------------------------- Démarrage */
function boot() {
  app.el.frame = document.getElementById('frame');
  app.el.index = document.getElementById('index');
  app.el.caption = document.getElementById('caption');

  /* Le sprite vit hors du cadre : `navigate()` remplace tout le contenu
     de #frame, il serait détruit à la première navigation. */
  document.body.insertAdjacentHTML('afterbegin', ICON_SPRITE);

  buildIndex();
  setTheme('light');
  navigate('splash', { animate: false });

  document.addEventListener('click', onClick);
  app.el.frame.addEventListener('click', onScreenClick);

  /* Saisie : recherche globale et filtre d'appel réagissent à la frappe. */
  app.el.frame.addEventListener('input', (e) => {
    if (e.target.matches('[data-search-input]')) {
      searchState.q = e.target.value;
      refreshSearch();
    } else if (e.target.matches('[data-roll-search]')) {
      filterRoll(e.target.value);
    }
  });

  document.querySelectorAll('[data-theme-btn]').forEach((b) =>
    b.addEventListener('click', () => setTheme(b.dataset.themeBtn)));

  /* Le splash cède la place à la connexion après un temps de respiration. */
  setTimeout(() => { if (app.current === 'splash') navigate('login'); }, 2200);

  /* Navigation au clavier entre les écrans de l'index. */
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    const keys = [...app.el.index.querySelectorAll('[data-nav]')].map((b) => b.dataset.nav);
    const i = keys.indexOf(app.current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault(); navigate(keys[(i + 1) % keys.length]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault(); navigate(keys[(i - 1 + keys.length) % keys.length]);
    } else if (e.key === 'Escape') { closeOverlay(); }
  });
}

document.addEventListener('DOMContentLoaded', boot);
