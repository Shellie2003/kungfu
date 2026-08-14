/* ============================================================
   ui.js — Icônes + fabriques de composants
   Chaque fonction retourne une chaîne HTML. Elles constituent
   la bibliothèque partagée par tous les écrans.
   ============================================================ */

/* ---------------------------------------------- Icônes
   Trait de 1.6px, bouts arrondis, 24×24. Volontairement peu
   nombreuses : l'app privilégie le mot sur le pictogramme.

   Les tracés sont déclarés une seule fois dans un sprite <symbol>
   injecté au démarrage ; chaque usage n'émet plus qu'un <use>.
   Un écran comme Communauté portait 15 <svg> pour 3 dessins distincts.

   `I()` reste disponible pour les illustrations ponctuelles (états
   vides), qui ne sont pas des icônes réutilisables.               */
const I = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${extra}${d}</svg>`;

/* Marqueur : `P()` déclare un tracé de sprite au lieu d'un SVG complet. */
const P = (d) => ({ __path: d });

const icon = {
  home:     P('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>'),
  /* Pratiquant en garde — marque du dojo. */
  martial:  P('<circle cx="12" cy="4.8" r="2.2"/><path d="M12 7.4v5.2"/><path d="m5.5 10.6 6.5-1.4 6.5 1.4"/><path d="m12 12.6-3.6 7.4"/><path d="m12 12.6 3.6 7.4"/>'),
  community:P('<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19"/>'),
  temple:   P('<path d="M3 9h18"/><path d="M12 3 4 8h16z"/><path d="M5.5 9v10"/><path d="M18.5 9v10"/><path d="M3 19h18"/><path d="M10 19v-4a2 2 0 0 1 4 0v4"/>'),
  more:     P('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/>'),
  bell:     P('<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/>'),
  search:   P('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  back:     P('<path d="M15 5 8 12l7 7"/>'),
  chev:     P('<path d="m9 5 7 7-7 7"/>'),
  check:    P('<path d="m5 12.5 4.5 4.5L19 7"/>'),
  plus:     P('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  seal:     P('<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M9 12h6"/><path d="M12 9v6"/>'),
  calendar: P('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>'),
  clock:    P('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  users:    P('<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/>'),
  belt:     P('<path d="M3 10h18v4H3z"/><path d="M9 14v6l3-2 3 2v-6"/>'),
  box:      P('<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5 12 13l8-4.5"/><path d="M12 13v7"/>'),
  coin:     P('<ellipse cx="12" cy="7" rx="7.5" ry="3.2"/><path d="M4.5 7v10c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V7"/><path d="M4.5 12c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2"/>'),
  doc:      P('<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>'),
  gear:     P('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'),
  bed:      P('<path d="M3 18v-8"/><path d="M3 13h18v5"/><path d="M21 18v-4a3 3 0 0 0-3-3H8"/><circle cx="7" cy="10" r="2"/>'),
  bowl:     P('<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M12 11c0-2 2-2.5 2-4s-2-2-2-3.5"/><path d="M4 20h16"/>'),
  lotus:    P('<path d="M12 4c2 2.2 3 4.6 3 7-2 .6-4 .6-6 0 0-2.4 1-4.8 3-7z"/><path d="M5 9c2.7-.4 5 .6 6.6 2.6C10 14 7.5 14.6 5 14 3.9 12.5 3.9 10.5 5 9z"/><path d="M19 9c1.1 1.5 1.1 3.5 0 5-2.5.6-5 0-6.6-2.4C14 9.6 16.3 8.6 19 9z"/><path d="M4 15c2.4 3 5 4.5 8 4.5s5.6-1.5 8-4.5"/>'),
  flag:     P('<path d="M6 21V4"/><path d="M6 5h11l-2 3.5L17 12H6z"/>'),
  alert:    P('<path d="M12 4.5 21 19H3z"/><path d="M12 10v4"/><path d="M12 16.6v.4"/>'),
  qr:       P('<rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><path d="M14 14h2.5v2.5H14z"/><path d="M20 14v2M17.5 20H20v-2.5"/><path d="M14 20h1"/>'),
  logout:   P('<path d="M14 4H6v16h8"/><path d="m17 8 4 4-4 4"/><path d="M21 12h-9"/>'),
  eye:      P('<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>'),
  lock:     P('<rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'),
  sync:     P('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/>'),
  trend:    P('<path d="m4 16 5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/>'),
  filter:   P('<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>'),
  edit:     P('<path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/>'),
  megaphone:P('<path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/>'),
  book:     P('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5"/>'),
  x:        P('<path d="M6 6l12 12M18 6 6 18"/>'),
  send:     P('<path d="M12 20V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/>'),
  dots:     P('<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>'),
  sun:      P('<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2 7 7M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8"/>'),
  moon:     P('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>')
};

/* Le sprite est figé AVANT que `icon` ne soit réécrit : une fois les
   entrées remplacées par leurs références, les tracés ont disparu. */
const ICON_SPRITE = `<svg class="sprite" aria-hidden="true" focusable="false">
  ${Object.entries(icon).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round">${v.__path}</symbol>`).join('')}
</svg>`;

/* Chaque entrée de `icon` devient sa référence <use>. Les écrans
   continuent d'écrire `${icon.bell}` sans rien savoir du sprite. */
Object.keys(icon).forEach((k) => {
  icon[k] = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${k}"/></svg>`;
});

/* ---------------------------------------------- Portraits générés
   Le monastère n'a pas de photothèque : chaque personne reçoit un
   portrait déterministe — fond dégradé teinté par son grade, sceau
   circulaire en filigrane, initiales gravées. Deux personnes n'ont
   jamais le même cadrage, mais une même personne a toujours le sien. */
/* Mélange deux couleurs hexadécimales. Sert à garantir un minimum de
   chaleur au fond : une ceinture noire teinterait le portrait en aplat
   noir, indistinguable d'un autre. */
function mixHex(a, b, t) {
  const v = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2]
    .map((i) => Math.round(v(a, i) * (1 - t) + v(b, i) * t).toString(16).padStart(2, '0'))
    .join('');
}

function portraitSVG(p, { seed = null } = {}) {
  const key = seed ?? [...p.id + p.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const tint = mixHex(p.beltColor || '#8a6349', '#c6a15b', 0.38);
  const cx = 30 + (key % 7) * 6;          // décalage du sceau
  const cy = 26 + (key % 5) * 5;
  const rot = -12 + (key % 9) * 3;        // inclinaison des traits
  const id = `pg${p.id}`;
  return `<svg class="portrait__svg" viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice"
       aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="${tint}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#1d1a17" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="120" height="150" fill="#2a231d"/>
    <rect width="120" height="150" fill="url(#${id})"/>
    <g stroke="#c6a15b" fill="none" opacity="0.28">
      <circle cx="${cx}" cy="${cy}" r="26"/>
      <circle cx="${cx}" cy="${cy}" r="20" opacity="0.5"/>
    </g>
    <g stroke="#f2ece1" opacity="0.10" stroke-width="1"
       transform="rotate(${rot} 60 75)">
      <path d="M-20 40h160M-20 62h160M-20 84h160M-20 106h160"/>
    </g>
    <text x="60" y="96" text-anchor="middle"
          font-family="Iowan Old Style, Palatino, Georgia, serif"
          font-size="52" fill="#f2ece1" opacity="0.92">${initials(p.name)}</text>
  </svg>`;
}

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

/* ---------------------------------------------- Rails (carousels) */

/** Fiche membre d'un rail : portrait plein cadre en couches empilées. */
function memberCard(p, { to = 'member' } = {}) {
  const teacher = p.role.includes('Maître');
  const foot = p.role === 'Élève'
    ? `<span class="mcard__foot">${bar(p.progress)}</span>`
    : '';
  return `<button class="mcard ${teacher ? 'mcard--ink' : ''}" data-nav="${to}">
    <span class="mcard__media">${portraitSVG(p)}</span>
    <span class="mcard__scrim"></span>
    <span class="mcard__rank">
      ${p.beltColor ? `<i class="belt__disc" style="--belt:${p.beltColor};width:8px;height:8px"></i>` : ''}
      ${esc(p.beltName || p.role)}
    </span>
    <span class="mcard__info">
      <span class="mcard__name">${esc(p.name)}</span>
      <span class="mcard__meta">${esc(p.level)}${p.resident ? ' · Résident' : ''}</span>
      ${foot}
    </span>
  </button>`;
}

/** Carte « voir la liste complète », toujours en fin de rail. */
function moreCard(label, to) {
  return `<button class="mcard mcard--more" data-nav="${to}">
    <span class="chevron">${icon.chev}</span>
    <span class="mcard__meta">${esc(label)}</span>
  </button>`;
}

/** Fiche séance d'un rail. */
function sessionCard(s) {
  const state = s.state === 'now' ? 'scard--now' : s.state === 'done' ? 'scard--done' : '';
  return `<button class="scard ${state}" data-nav="session">
    <span class="between">
      <span class="scard__time num">${s.time}</span>
      ${s.state === 'now' ? badge('En cours', 'accent')
        : s.state === 'done' ? badge('Terminé', 'positive') : badge(s.dur, 'outline')}
    </span>
    <span>
      <span class="item__title" style="display:block">${esc(s.title)}</span>
      <span class="item__sub" style="display:block">${esc(s.master)} · ${esc(s.place)}</span>
    </span>
    <span class="between">
      <span class="avatarstack">${['p1', 'p2', 'p6'].map((id) => avatar(person(id), 'xs', { one: true })).join('')}</span>
      <span class="caption">${s.count} élèves</span>
    </span>
  </button>`;
}

/** Bloc rail complet : titre, filtres optionnels, piste défilante. */
function railBlock({ overline, action = null, filters = null, cards, id = null }) {
  return `<section class="railblock${filters ? ' railblock--filtered' : ''}">
    <div class="section__head">
      <p class="overline">${esc(overline)}</p>
      ${action ? `<button class="section__action" data-nav="${action.to}">${esc(action.label)}</button>` : ''}
    </div>
    ${filters ? `<div class="filters" data-rail-filters="${id}">
      ${filters.map((f, i) => `<button class="filter" data-rail-key="${f.key}"
          aria-pressed="${i === 0}">${esc(f.label)}</button>`).join('')}
    </div>` : ''}
    <div class="rail" ${id ? `data-rail="${id}"` : ''}>${cards}</div>
  </section>`;
}

/* La communauté se lit dans son ordre propre : enseignants, moines,
   élèves, puis le reste. C'est la hiérarchie du monastère, pas un tri
   alphabétique. */
const ROLE_RANK = { 'Grand Maître': 0, 'Maître': 1, 'Moine': 2, 'Élève': 3, 'Personnel': 4 };
const byRank = (a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9);

/* Un rail n'est pas une liste : au-delà d'une dizaine de cartes, plus
   personne ne fait défiler jusqu'au bout, et chaque portrait coûte un
   rendu. On plafonne, la carte de fin annonçant le reste — c'est aussi
   ce qui permet au rail de tenir avec les 48 élèves réels du monastère. */
const RAIL_MAX = 10;

/** Contenu du rail des membres pour un filtre donné. */
function memberRailCards(key) {
  const f = RAIL_FILTERS.find((x) => x.key === key) || RAIL_FILTERS[0];
  const list = PEOPLE.filter(f.match).sort(byRank);
  if (!list.length) {
    return `<div class="card card--sunken" style="width:100%;text-align:center">
      <p class="sub">Personne dans ce groupe aujourd’hui.</p></div>`;
  }
  const shown = list.slice(0, RAIL_MAX);
  const rest = list.length - shown.length;
  const students = f.key === 'eleves';
  return shown.map((p) => memberCard(p)).join('')
    + moreCard(rest > 0 ? `+ ${rest} autre${rest > 1 ? 's' : ''}`
                        : students ? 'Tous les élèves' : 'Toute la communauté',
               students ? 'students' : 'community');
}

/* ---------------------------------------------- Messagerie */

/** Emblème d'une conversation : sceau pour un canal, portrait sinon. */
function convEmblem(c, size = 'md') {
  /* Le sceau garde sa taille : c'est un emblème, pas un portrait.
     Seuls les avatars suivent la taille demandée. */
  if (c.kind === 'annonce') return `<span class="seal seal--sm">${icon.megaphone}</span>`;
  if (c.kind === 'group') return `<span class="seal seal--sm seal--ink">${icon.users}</span>`;
  return avatar(person(c.with), size);
}

/** Ligne de la liste des conversations. */
function convRow(c) {
  const author = c.kind === 'direct' ? '' : `${person(c.from).name.split(' ')[0]} : `;
  return item({
    lead: convEmblem(c),
    title: `${esc(c.title)}${c.pinned ? ' <span class="dim" style="font-weight:400">· épinglé</span>' : ''}`,
    sub: esc(author + c.last),
    end: `<span class="stack" style="align-items:flex-end;gap:5px">
            <span class="caption">${esc(c.time)}</span>
            ${c.unread ? `<span class="unread">${c.unread}</span>` : ''}
          </span>`,
    to: `chat:${c.id}`
  });
}

/** Bulle de message. `prev` sert à regrouper les envois consécutifs. */
function messageBubble(m, conv, prev) {
  if (m.day) return `<div class="daysep"><span>${esc(m.day)}</span></div>`;
  const mine = m.from === ME;
  const start = !prev || prev.day || prev.from !== m.from;
  /* L'auteur n'est nommé que dans les canaux collectifs : en tête-à-tête
     il est déjà dans le titre de l'écran. */
  const showAuthor = start && !mine && conv.kind !== 'direct';
  return `<div class="msg ${mine ? 'msg--mine' : ''} ${start ? 'msg--start' : ''}">
    ${showAuthor ? `<span class="msg__author">${esc(person(m.from).name)}</span>` : ''}
    <div class="msg__bubble">${esc(m.text)}</div>
    <span class="msg__meta">${esc(m.time)}${mine && m.read ? ` ${icon.check} lu` : ''}</span>
  </div>`;
}

/* ---------------------------------------------- Recherche globale
   L'écran de recherche affichait des résultats écrits en dur. L'index
   est désormais construit à partir des mêmes données que le reste de
   l'application : ce qui est trouvable correspond à ce qui existe. */
function buildSearchIndex() {
  const ix = [];
  PEOPLE.forEach((p) => ix.push({
    label: p.name, kind: p.role, group: 'Personnes', to: p.role === 'Élève' ? 'student' : 'member',
    terms: `${p.name} ${p.role} ${p.level} ${p.beltName || ''} ${p.room || ''}`
  }));
  BELTS.forEach((b) => ix.push({
    label: `Ceinture ${b.name.toLowerCase()}`, kind: 'Grade', group: 'Grades',
    to: 'gradeDetail', terms: `ceinture ${b.name} grade`
  }));
  TECHNIQUES.forEach((t) => ix.push({
    label: t.name, kind: `Technique · ${t.fr}`, group: 'Technique',
    to: 'techniques', terms: `${t.name} ${t.fr} ${t.cat}`
  }));
  FORMS.forEach((f) => ix.push({
    label: f.name, kind: `Forme · ${f.fr}`, group: 'Technique',
    to: 'techniques', terms: `${f.name} ${f.fr} forme`
  }));
  SESSIONS.forEach((s) => ix.push({
    label: s.title, kind: `Séance · ${s.time}`, group: 'Séances',
    to: 'session', terms: `${s.title} ${s.group} ${s.master} ${s.place} entrainement`
  }));
  EVENTS.forEach((e) => ix.push({
    label: e.title, kind: `${e.type} · ${e.date}`, group: 'Événements',
    to: 'events', terms: `${e.title} ${e.type} ${e.place} evenement`
  }));
  DOCS.forEach((d) => ix.push({
    label: d.name, kind: `${d.type} · ${d.date}`, group: 'Documents',
    to: 'documents', terms: `${d.name} ${d.type} document`
  }));
  BUILDINGS.forEach((b) => b.rooms.forEach((r) => ix.push({
    label: `Chambre ${r.id}`, kind: `${b.name} · ${r.taken}/${r.cap}`, group: 'Chambres',
    to: 'rooms', terms: `chambre ${r.id} ${b.name} ${r.state}`
  })));
  STOCK.forEach((c) => c.items.forEach((it) => ix.push({
    label: it.n, kind: `${c.cat} · ${it.q} ${it.u}`, group: 'Ressources',
    to: 'stock', terms: `${it.n} ${c.cat} stock`
  })));
  DONATIONS.list.forEach((d) => ix.push({
    label: d.who, kind: `Don · ${money(d.amount)}`, group: 'Finances',
    to: 'donations', terms: `${d.who} don ${d.dest}`
  }));
  return ix;
}

const SEARCH_IX = buildSearchIndex();

/* Accents ignorés : « maitre » doit trouver « Maître ».
   Le pliage se fait caractère par caractère afin de préserver la
   longueur de la chaîne : `mark()` découpe le libellé d'origine aux
   indices trouvés dans sa version pliée, et un NFD sur la chaîne
   entière décalerait ces indices (é devenant e + accent). */
const norm = (s) => [...String(s)].map((c) => {
  const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return (base || c).toLowerCase();
}).join('');

function searchQuery(q, scope = 'Tout') {
  const n = norm(q).trim();
  if (!n) return [];
  const words = n.split(/\s+/);
  return SEARCH_IX
    .filter((e) => scope === 'Tout' || e.group === scope)
    .map((e) => {
      const hay = norm(e.terms);
      if (!words.every((w) => hay.includes(w))) return null;
      /* Un début de libellé prime sur une occurrence en milieu de mot. */
      return { e, score: norm(e.label).startsWith(words[0]) ? 0 : 1 };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, 40)
    .map((r) => r.e);
}

/** Met en évidence la portion trouvée, sans casser l'échappement. */
function mark(label, q) {
  const n = norm(q).trim().split(/\s+/)[0];
  if (!n) return esc(label);
  const i = norm(label).indexOf(n);
  if (i < 0) return esc(label);
  return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + n.length))
    + '</mark>' + esc(label.slice(i + n.length));
}

function searchResults(q, scope = 'Tout') {
  if (!q.trim()) {
    return `<div class="section" style="margin-top:var(--s-6)">
      ${sectionHead('Recherches fréquentes')}
      <div class="row wrap gap-2">
        ${['Rakoto', 'Ceinture orange', 'A101', 'Riz', 'Daka', 'Examen'].map((t) =>
          `<button class="badge badge--outline suggest" data-search="${esc(t)}">${t}</button>`).join('')}
      </div>
    </div>`;
  }
  const res = searchQuery(q, scope);
  if (!res.length) {
    return `<div class="section">${empty(
      `Rien ne correspond à « ${q} ».`,
      'Cherche d’abord, le nom viendra ensuite.')}</div>`;
  }
  const groups = {};
  res.forEach((r) => (groups[r.group] ??= []).push(r));
  return `<p class="caption pad mt-4">${res.length} résultat${res.length > 1 ? 's' : ''} pour « ${esc(q)} »</p>
    ${Object.entries(groups).map(([g, list]) => `
      <div class="section" style="margin-top:var(--s-5)">
        ${sectionHead(`${g} — ${list.length}`)}
        <div class="list list--card">
          ${list.map((r) => item({
            lead: `<span class="avatar avatar--sm">${initials(r.label)}</span>`,
            title: mark(r.label, q), sub: esc(r.kind), to: r.to
          })).join('')}
        </div>
      </div>`).join('')}
    <div style="height:var(--s-8)"></div>`;
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
