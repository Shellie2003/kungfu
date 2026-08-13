/* ============================================================
   ui.js — Icônes + fabriques de composants
   Chaque fonction retourne une chaîne HTML. Elles constituent
   la bibliothèque partagée par tous les écrans.
   ============================================================ */

/* ---------------------------------------------- Icônes
   Trait de 1.6px, bouts arrondis, 24×24. Volontairement peu
   nombreuses : l'app privilégie le mot sur le pictogramme.     */
const I = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${extra}${d}</svg>`;

const icon = {
  home:     I('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>'),
  /* Pratiquant en garde — marque du dojo. */
  martial:  I('<circle cx="12" cy="4.8" r="2.2"/><path d="M12 7.4v5.2"/><path d="m5.5 10.6 6.5-1.4 6.5 1.4"/><path d="m12 12.6-3.6 7.4"/><path d="m12 12.6 3.6 7.4"/>'),
  community:I('<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19"/>'),
  temple:   I('<path d="M3 9h18"/><path d="M12 3 4 8h16z"/><path d="M5.5 9v10"/><path d="M18.5 9v10"/><path d="M3 19h18"/><path d="M10 19v-4a2 2 0 0 1 4 0v4"/>'),
  more:     I('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/>'),
  bell:     I('<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/>'),
  search:   I('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  back:     I('<path d="M15 5 8 12l7 7"/>'),
  chev:     I('<path d="m9 5 7 7-7 7"/>'),
  check:    I('<path d="m5 12.5 4.5 4.5L19 7"/>'),
  plus:     I('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  seal:     I('<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M9 12h6"/><path d="M12 9v6"/>'),
  calendar: I('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>'),
  clock:    I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  users:    I('<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/>'),
  belt:     I('<path d="M3 10h18v4H3z"/><path d="M9 14v6l3-2 3 2v-6"/>'),
  box:      I('<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5 12 13l8-4.5"/><path d="M12 13v7"/>'),
  coin:     I('<ellipse cx="12" cy="7" rx="7.5" ry="3.2"/><path d="M4.5 7v10c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V7"/><path d="M4.5 12c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2"/>'),
  doc:      I('<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>'),
  gear:     I('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'),
  bed:      I('<path d="M3 18v-8"/><path d="M3 13h18v5"/><path d="M21 18v-4a3 3 0 0 0-3-3H8"/><circle cx="7" cy="10" r="2"/>'),
  bowl:     I('<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M12 11c0-2 2-2.5 2-4s-2-2-2-3.5"/><path d="M4 20h16"/>'),
  lotus:    I('<path d="M12 4c2 2.2 3 4.6 3 7-2 .6-4 .6-6 0 0-2.4 1-4.8 3-7z"/><path d="M5 9c2.7-.4 5 .6 6.6 2.6C10 14 7.5 14.6 5 14 3.9 12.5 3.9 10.5 5 9z"/><path d="M19 9c1.1 1.5 1.1 3.5 0 5-2.5.6-5 0-6.6-2.4C14 9.6 16.3 8.6 19 9z"/><path d="M4 15c2.4 3 5 4.5 8 4.5s5.6-1.5 8-4.5"/>'),
  flag:     I('<path d="M6 21V4"/><path d="M6 5h11l-2 3.5L17 12H6z"/>'),
  alert:    I('<path d="M12 4.5 21 19H3z"/><path d="M12 10v4"/><path d="M12 16.6v.4"/>'),
  qr:       I('<rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><path d="M14 14h2.5v2.5H14z"/><path d="M20 14v2M17.5 20H20v-2.5"/><path d="M14 20h1"/>'),
  logout:   I('<path d="M14 4H6v16h8"/><path d="m17 8 4 4-4 4"/><path d="M21 12h-9"/>'),
  eye:      I('<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>'),
  lock:     I('<rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'),
  sync:     I('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/>'),
  trend:    I('<path d="m4 16 5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/>'),
  filter:   I('<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>'),
  edit:     I('<path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/>'),
  megaphone:I('<path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/>'),
  book:     I('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5"/>'),
  x:        I('<path d="M6 6l12 12M18 6 6 18"/>'),
  dots:     I('<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>'),
  sun:      I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2 7 7M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8"/>'),
  moon:     I('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>')
};

/* ---------------------------------------------- Utilitaires */
const initials = (name) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const money = (n) => n.toLocaleString('fr-FR').replace(/ |,/g, ' ') + ' Ar';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------------------------------------- Composants */

/** Barre d'application. `back` = clé d'écran de retour, ou null. */
function appbar({ title = '', back = null, actions = '', flush = false } = {}) {
  return `<header class="appbar${flush ? ' appbar--flush' : ''}">
    ${back
      ? `<button class="iconbtn" data-nav="${back}" aria-label="Retour">${icon.back}</button>`
      : '<span style="width:44px"></span>'}
    <h1 class="appbar__title">${esc(title)}</h1>
    <div class="row">${actions || '<span style="width:44px"></span>'}</div>
  </header>`;
}

/** Sur-titre + titre de section, avec action optionnelle à droite. */
function sectionHead(overline, action = null) {
  return `<div class="section__head">
    <p class="overline">${esc(overline)}</p>
    ${action ? `<button class="section__action" data-nav="${action.to}">${esc(action.label)}</button>` : ''}
  </div>`;
}

/** `one: true` n'affiche qu'une initiale — utilisé dans les piles
    d'avatars, où le chevauchement masquerait la seconde lettre. */
function avatar(person, size = 'sm', { one = false } = {}) {
  const ring = person.beltColor ? ` style="--ring:${person.beltColor}"` : '';
  const cls = person.beltColor ? ' avatar--ringed' : '';
  const label = one ? initials(person.name)[0] : initials(person.name);
  return `<span class="avatar avatar--${size}${cls}"${ring}>${label}</span>`;
}

function belt(person) {
  if (!person.belt) return '';
  return `<span class="belt"><i class="belt__disc" style="--belt:${person.beltColor}"></i>
    <span class="belt__label">${esc(person.belt)}</span></span>`;
}

/** Anneau de progression. size en px, value 0–100. */
function ring(value, { size = 92, stroke = 6, label = null, color = 'var(--gold)' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return `<div class="ring-wrap" style="width:${size}px;height:${size}px">
    <svg class="ring" width="${size}" height="${size}" style="--circ:${c}">
      <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
      <circle class="ring__value" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
              stroke-dasharray="${c}" stroke-dashoffset="${off}" style="stroke:${color}"/>
    </svg>
    <div class="ring-wrap__label">${label ?? `<span class="num heading">${value}%</span>`}</div>
  </div>`;
}

function bar(value, variant = '') {
  return `<div class="bar"><div class="bar__fill ${variant}" style="width:${value}%"></div></div>`;
}

/** Ligne de liste générique. */
function item({ lead = '', title, sub = '', end = '', to = null, extra = '' }) {
  const tag = to ? 'button' : 'div';
  return `<${tag} class="item" ${to ? `data-nav="${to}"` : ''} ${extra}>
    ${lead}
    <span class="grow">
      <span class="item__title" style="display:block">${title}</span>
      ${sub ? `<span class="item__sub" style="display:block">${sub}</span>` : ''}
    </span>
    <span class="item__end">${end}${to ? `<span class="chevron">${icon.chev}</span>` : ''}</span>
  </${tag}>`;
}

/** Étape de timeline. state: done | now | next | locked | milestone */
function tlRow({ time = '', title, meta = '', state = 'next', to = null }) {
  const tag = to ? 'button' : 'div';
  return `<${tag} class="tl tl--${state}" ${to ? `data-nav="${to}"` : ''}
      style="${to ? 'text-align:left;width:100%' : ''}">
    <span class="tl__time num">${esc(time)}</span>
    <span class="tl__rail"><i class="tl__node"></i></span>
    <span class="tl__body">
      <span class="tl__title" style="display:block">${esc(title)}</span>
      ${meta ? `<span class="tl__meta" style="display:block">${esc(meta)}</span>` : ''}
    </span>
  </${tag}>`;
}

function badge(text, variant = '') {
  return `<span class="badge ${variant ? 'badge--' + variant : ''}">${esc(text)}</span>`;
}

/** État vide illustré : temple minimaliste au trait. */
function empty(message, quote) {
  return `<div class="empty">
    <div class="empty__art">${I(`
      <path d="M3 20h18" stroke-width="1.2"/>
      <path d="M12 4 5 8.5h14z" stroke-width="1.2"/>
      <path d="M6.5 8.5V20M17.5 8.5V20" stroke-width="1.2"/>
      <path d="M4 11.5h16" stroke-width="1.2"/>
      <path d="M10 20v-4.5a2 2 0 0 1 4 0V20" stroke-width="1.2"/>
      <path d="M12 2v2" stroke-width="1.2"/>`)}</div>
    <p class="body">${esc(message)}</p>
    <p class="empty__quote">« ${esc(quote)} »</p>
  </div>`;
}

/** Squelette de chargement générique pour une liste. */
function loadingList(n = 4) {
  return `<div class="stack gap-3 pad">${Array.from({ length: n }, () => `
    <div class="card row gap-3">
      <div class="skel" style="width:48px;height:48px;border-radius:34%"></div>
      <div class="grow stack gap-2">
        <div class="skel" style="height:12px;width:58%"></div>
        <div class="skel" style="height:10px;width:36%"></div>
      </div>
    </div>`).join('')}</div>`;
}

/** Bloc d'erreur avec action de reprise. */
function errorState(message, retryLabel = 'Réessayer') {
  return `<div class="empty">
    <div class="empty__art" style="color:var(--accent)">${icon.alert}</div>
    <p class="heading">Connexion interrompue</p>
    <p class="sub" style="max-width:250px">${esc(message)}</p>
    <button class="btn btn--outline btn--sm mt-3" data-action="retry">${icon.sync}${esc(retryLabel)}</button>
  </div>`;
}
