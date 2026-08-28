/* ============================================================
   build-screens.mjs — Source de vérité des écrans de la maquette

       node build-screens.mjs      →  écrit js/screens.js

   Les écrans partagent une seule coquille : même barre de navigation,
   mêmes en-têtes, mêmes composants. On corrige le gabarit, pas treize
   copies. C'est une maquette de présentation : aucune logique
   applicative, uniquement la mise en page soumise à validation.
   ============================================================ */
import { writeFileSync, mkdirSync } from 'node:fs';

/* ---------------------------------------------- Briques communes */

const ICON = {
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
  users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/>',
  news: '<path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/>',
  album: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/>',
  shield: '<path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/>',
  shieldCheck: '<path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  phone: '<path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  martial: '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/>',
  chat: '<path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/>',
  send: '<path d="M4.5 12 20 4.5 15 20l-3.5-6z"/><path d="m11.5 14 3.5-5"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9"/><path d="M18 12v3.5"/><path d="M15 12v2.5"/>',
  eyeOff: '<path d="M4 4l16 16"/><path d="M9.5 9.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2"/><path d="M6.4 6.6C4.3 8 3 10 3 12c0 0 3.5 5.5 9 5.5 1.5 0 2.9-.4 4.1-1"/><path d="M9.8 6.8A9.6 9.6 0 0 1 12 6.5c5.5 0 9 5.5 9 5.5a15 15 0 0 1-2.6 3.1"/>',
  base: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
  flag: '<path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4"/><path d="M12 16.3v.2"/>',
  moins: '<path d="M5 12h14"/>'
};

const svg = (n, s, c, w = 1.7) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

/* Portrait provisoire : silhouette au trait sur fond teinté. Un
   marque-place assumé vaut mieux qu'une fausse photo. */
const portrait = (w, h, r = 12) => `<div style="width:${w}px;height:${h}px;border-radius:${r}px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="${Math.round(w * 0.5)}" height="${Math.round(w * 0.5)}" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>`;

/* Cinq onglets, pas six : au-delà, les libellés se tronquent sur un
   téléphone. Les messages entrent donc à la place du Club, qui se
   consulte une ou deux fois par an et reste accessible depuis
   l'accueil. */
const TABS = [
  ['home', 'Accueil', 'home', 'accueil'],
  ['students', 'Étudiants', 'users', 'etudiants'],
  ['chat', 'Messages', 'chat', 'messages'],
  ['news', 'Casier', 'news', 'casier'],
  ['album', 'Album', 'album', 'album']
];

const tabbar = (active) => `<nav class="tabbar">
    ${TABS.map(([key, label, ic, to]) => {
      const on = key === active;
      return `<button class="tabbar__item" data-go="${to}"${on ? ' aria-current="page"' : ''}>
      ${svg(ic, 23, on ? '#0F5132' : '#7C8B82', on ? 1.8 : 1.7)}
      <span style="font-size:10px;${on ? 'font-weight:700;color:#0F5132' : 'color:#7C8B82'}">${label}</span>
    </button>`;
    }).join('\n    ')}
  </nav>`;

const header = (title, { back = null, action = '' } = {}) => `<div class="apphead">
    ${back
      ? `<button class="tapicon" data-go="${back}" aria-label="Retour">${svg('back', 22, '#0E2119', 2)}</button>`
      : '<span style="width:12px"></span>'}
    <h1 class="apphead__title">${title}</h1>
    ${action}
  </div>`;

const overline = (t) => `<h2 class="overline">${t}</h2>`;
const card = (inner, pad = 18) => `<div class="card" style="padding:${pad}px">${inner}</div>`;
const chip = (t, on) => `<span class="chip${on ? ' chip--on' : ''}">${t}</span>`;

const btn = (t, kind = 'primary', to = null) =>
  `<button class="btn btn--${kind}"${to ? ` data-go="${to}"` : ''}>${t}</button>`;

const grade = (g, c) => `<span class="grade"><i style="background:${c}"></i>${g}</span>`;

const STUDENTS = [
  ['RAKOTONDRABE', 'Nirina', 'Ceinture verte', '#4E9C57'],
  ['RASOAMANANA', 'Fanjaniaina', 'Ceinture jaune', '#D8A93A'],
  ['ANDRIANJAFY', 'Tokiniaina', 'Ceinture bleue', '#3E6E9C'],
  ['RABEMANANJARA', 'Hery', 'Ceinture noire', '#1E2320'],
  ['RAZAFIMAHATRATRA', 'Miora', 'Ceinture orange', '#C97A32'],
  ['RANDRIAMAMPIONONA', 'Toky', 'Ceinture blanche', '#E7EDE9']
];

const NEWS = [
  ['22 nov', 'Sortie', '#12613C', '#E8F1EC', 'Sortie au lac Mantasoa', 'Départ 6h00 devant la salle. Prévoir le repas de midi et une tenue de rechange.'],
  ['18 nov', 'Changement d’horaire', '#B0530F', '#FBEEE2', 'Séance du mercredi à 17h30', 'Décalée d’une heure jusqu’à la fin décembre, en raison des travaux.'],
  ['12 nov', 'Compétition', '#12613C', '#E8F1EC', 'Tournoi régional d’Antananarivo', 'Huit membres du club sont sélectionnés. Réunion d’information vendredi.'],
  ['05 nov', 'Réunion', '#12613C', '#E8F1EC', 'Réunion des parents', 'Samedi 9h00 à la salle. Présentation du programme de l’année.'],
  ['28 oct', 'Cérémonie', '#12613C', '#E8F1EC', 'Remise des grades', 'Onze passages validés. Félicitations aux nouveaux gradés.']
];

/* ---------------------------------------------- Les écrans */
const S = {};
const screen = (key, label, def) => { S[key] = { label, ...def }; };

/* --- 01 Connexion --- */
screen('connexion', '01 · Connexion', { full: `
  <div class="phone phone--green" style="padding:0 24px">
    <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:28px;padding:60px 0">
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
        <div class="emblem emblem--lg">${svg('shieldCheck', 38, '#0F5132')}</div>
        <div>
          <p class="display" style="font-size:21px;color:#FFF;line-height:26px">Kung-fu Waishi</p>
          <p style="font-size:14px;color:#B9D4C6;margin-top:4px">Analamahitsy</p>
        </div>
      </div>

      <div style="background:#FFF;border-radius:20px;padding:24px 20px;display:flex;flex-direction:column;gap:18px">
        <p style="font-size:17px;font-weight:700">Connexion membre</p>
        <label class="field"><span class="field__label">Numéro de membre</span>
          <span class="input">F04x042</span></label>
        <label class="field"><span class="field__label">Mot de passe</span>
          <span class="input" style="color:#8A978F;letter-spacing:.2em">••••••••</span></label>
        ${btn('Entrer', 'primary', 'accueil')}
        <p style="font-size:13px;color:#59685F;text-align:center;line-height:19px">Première connexion ou mot de passe oublié ?<br><span style="color:#12613C;font-weight:600">Demandez au responsable du club.</span></p>
      </div>

      <p style="font-size:12px;color:#9BC0AC;text-align:center;line-height:18px">Chaque membre possède son propre compte.<br>Seule l’administration peut modifier les fiches.</p>
    </div>
  </div>` });

/* --- 02 Accueil --- */
screen('accueil', '02 · Accueil', { tab: 'home', body: `
  <div class="hero">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="emblem">${svg('shieldCheck', 26, '#0F5132')}</div>
      <div style="flex-grow:1;min-width:0">
        <p class="display" style="font-size:17px;color:#FFF;letter-spacing:.02em;line-height:20px">KUNG-FU WAISHI</p>
        <p style="font-size:13px;color:#B9D4C6;margin-top:2px">Analamahitsy · Antananarivo</p>
      </div>
      <button class="tapicon" data-go="notifications" aria-label="Notifications" style="position:relative">
        ${svg('bell', 22, '#FFF')}<span class="dot">3</span>
      </button>
    </div>

    <div class="hero__note">
      ${svg('news', 20, '#7FD9A8')}
      <div style="flex-grow:1">
        <p style="font-size:14px;font-weight:600;color:#FFF;line-height:19px">Sortie prévue samedi 22 novembre</p>
        <p style="font-size:12px;color:#B9D4C6;margin-top:3px">Consultez le casier pour les détails.</p>
      </div>
    </div>
  </div>

  <div style="flex-grow:1;display:flex;flex-direction:column;gap:26px;padding:22px 20px 26px">
    <div class="card" style="padding:0;overflow:hidden">
      <div class="ph" style="height:168px">
        ${svg('martial', 52, '#8FB3A0', 1.4)}
        <p class="ph__label">Photo du club à fournir</p>
      </div>
      <div style="padding:18px">
        <p class="display" style="font-size:19px;line-height:24px">Kung-fu Waishi Analamahitsy</p>
        <p style="font-size:14px;line-height:22px;color:#59685F;margin-top:8px">Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière. Entraînements quatre fois par semaine à Analamahitsy.</p>
        <button class="linkrow" data-go="club">En savoir plus sur le club ${svg('chev', 16, '#12613C', 2)}</button>
      </div>
    </div>

    <div class="stats">
      ${[['64', 'membres'], ['4', 'séances / sem.'], ['2014', 'fondé en']].map(([n, l]) =>
        `<div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">${n}</p>
        <p style="font-size:11px;color:#59685F;margin-top:3px">${l}</p>
      </div>`).join('\n      ')}
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="rowhead">${overline('Vaovao farany')}<button class="link" data-go="casier">Tout le casier</button></div>
      ${NEWS.slice(0, 2).map(([date, cat, cc, cb, title, text]) => `<button class="card newsrow" data-go="casierDetail">
        <span class="datebox"><b>${date.split(' ')[0]}</b><i>${date.split(' ')[1]}</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="tag" style="color:${cc};background:${cb}">${cat}</span>
          <span style="display:block;font-size:15px;font-weight:600;line-height:20px;margin-top:7px">${title}</span>
          <span style="display:block;font-size:13px;color:#59685F;line-height:18px;margin-top:4px">${text.split('.')[0]}.</span>
        </span>
      </button>`).join('\n      ')}
    </div>
  </div>` });

/* --- 03 Étudiants --- */
screen('etudiants', '03 · Étudiants', { tab: 'students', body: `
  ${header('Étudiants', { action: `<button class="tapicon" data-go="notifications" aria-label="Notifications">${svg('bell', 22, '#0E2119')}</button>` })}

  <div style="padding:16px 20px 0">
    <div class="searchbar">${svg('search', 19, '#7C8B82')}<span>Rechercher un nom ou un prénom</span></div>
  </div>

  <div class="chips">${chip('Tous', true)}${chip('Blanche')}${chip('Jaune')}${chip('Orange')}${chip('Verte')}</div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:12px">
    <p style="font-size:12px;color:#59685F">64 membres · classés par grade</p>
    ${STUDENTS.map(([nom, prenom, g, c]) => `<button class="card studentrow" data-go="profilVerrouille">
      ${portrait(52, 52, 14)}
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">${nom}</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">${prenom}</span>
        <span style="display:block;margin-top:7px">${grade(g, c)}</span>
      </span>
      ${svg('chev', 18, '#A8B6AE', 2)}
    </button>`).join('\n    ')}
  </div>` });

/* --- 04 Profil verrouillé --- */
screen('profilVerrouille', '04 · Profil verrouillé', { tab: 'students', body: `
  ${header('Profil', { back: 'etudiants' })}

  <div style="flex-grow:1;padding:24px 20px 28px;display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      ${portrait(132, 132, 24)}
      <div>
        <p class="display" style="font-size:22px;line-height:26px">RAKOTONDRABE</p>
        <p class="display" style="font-size:20px;font-weight:500;color:#3C4A42;line-height:25px">Nirina</p>
        <div style="margin-top:12px">${grade('Ceinture verte', '#4E9C57')}</div>
      </div>
    </div>

    <!-- La liste des champs masqués est montrée : l'utilisateur sait ce
         qu'il obtiendra en se connectant, plutôt qu'un mur nu. -->
    <div class="card" style="padding:22px 20px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
        <div class="tile">${svg('lock', 22, '#0F5132')}</div>
        <p style="font-size:16px;font-weight:700">Informations réservées</p>
        <p style="font-size:13px;line-height:19px;color:#59685F;max-width:250px">Connectez-vous avec votre compte de membre pour consulter cette fiche.</p>
      </div>
      <div class="masked">
        ${['Date de naissance', 'Numéro de membre', 'Début d’entraînement', 'Biographie', 'Contact'].map((f) =>
          `<div><span>${f}</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>`).join('\n        ')}
      </div>
      ${btn('Se connecter', 'primary', 'profilOuvert')}
    </div>
  </div>` });

/* --- 05 Profil ouvert --- */
screen('profilOuvert', '05 · Profil ouvert', { tab: 'students', body: `
  ${header('Profil', { back: 'etudiants', action: `<button class="tapicon" aria-label="Modifier">${svg('edit', 21, '#0E2119')}</button>` })}

  <div style="flex-grow:1;padding:24px 20px 28px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;gap:16px;align-items:center">
      ${portrait(96, 96, 20)}
      <div style="flex-grow:1;min-width:0">
        <p class="display" style="font-size:19px;line-height:23px">RAKOTONDRABE</p>
        <p class="display" style="font-size:17px;font-weight:500;color:#3C4A42;line-height:22px">Nirina</p>
        <div style="margin-top:9px">${grade('Ceinture verte', '#4E9C57')}</div>
      </div>
    </div>

    <div class="banner">${svg('lock', 16, '#0F5132')}<span>Fiche ouverte · session de Nirina</span></div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Informations personnelles')}
      ${card(`<div class="deflist">
        ${[['Nom', 'RAKOTONDRABE'], ['Prénom', 'Nirina'], ['Date de naissance', '14 mars 2006'], ['Numéro de membre', 'F04x042'], ['Début d’entraînement', '9 septembre 2019'], ['Grade', 'Ceinture verte']]
          .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('\n        ')}
      </div>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px" data-feat="parents">
      ${overline('Parents ou tuteur')}
      ${card(`<div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm">${svg('users', 17, '#0F5132')}</span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">RAKOTONDRABE Voahangy</p><p style="font-size:13px;color:#59685F">Mère · responsable légale</p></div>
          <a class="calltag" href="#">${svg('phone', 15, '#0F5132')} 034 22 118 40</a>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm">${svg('users', 17, '#0F5132')}</span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">RAKOTONDRABE Jean-Claude</p><p style="font-size:13px;color:#59685F">Père</p></div>
          <a class="calltag" href="#">${svg('phone', 15, '#0F5132')} 033 41 907 12</a>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm" style="background:#FBEEE2">${svg('phone', 17, '#B0530F')}</span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">À prévenir en urgence</p><p style="font-size:13px;color:#59685F">La mère, en priorité</p></div>
        </div>
      </div>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Biographie')}
      ${card(`<p style="font-size:14px;line-height:23px;color:#3C4A42">Entrée au club à treize ans. Régulière aux entraînements du mercredi et du samedi, elle prépare le passage à la ceinture bleue. A représenté le club à la démonstration d’Analamahitsy en 2024.</p>`)}
    </div>
  </div>` });

/* --- 06 Casier --- */
screen('casier', '06 · Casier', { tab: 'news', body: `
  ${header('Casier', { action: `<button class="tapicon" data-go="notifications" aria-label="Notifications" style="position:relative">${svg('bell', 22, '#0E2119')}<span class="dot dot--plain"></span></button>` })}

  <div class="chips">${chip('Tout', true)}${chip('Sorties')}${chip('Compétitions')}${chip('Réunions')}</div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:12px">
    ${NEWS.map(([date, cat, cc, cb, title, text], i) => `<button class="card newscard${i === 0 ? ' newscard--new' : ''}" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:${cc};background:${cb}">${cat}</span>
        <span style="font-size:12px;color:#7C8B82">${date}</span>
        ${i === 0 ? '<span style="margin-left:auto;font-size:11px;font-weight:700;color:#E4572E">NOUVEAU</span>' : ''}
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">${title}</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">${text}</span>
    </button>`).join('\n    ')}
  </div>` });

/* --- 07 Une actualité --- */
screen('casierDetail', '07 · Une actualité', { tab: 'news', body: `
  ${header('Sortie', { back: 'casier' })}

  <div style="flex-grow:1;display:flex;flex-direction:column">
    <div class="ph" style="height:190px">
      ${svg('album', 46, '#8FB3A0', 1.3)}
      <p class="ph__label">Photo à fournir</p>
    </div>

    <div style="padding:22px 20px 28px;display:flex;flex-direction:column;gap:20px">
      <div>
        <span class="tag" style="color:#12613C;background:#E8F1EC">Sortie</span>
        <h1 class="display" style="font-size:24px;line-height:30px;margin-top:12px">Sortie au lac Mantasoa</h1>
        <p style="font-size:13px;color:#7C8B82;margin-top:8px">Publié le 12 novembre par l’administration</p>
      </div>

      ${card(`<div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          ${svg('calendar', 19, '#0F5132')}
          <div><p style="font-size:14px;font-weight:600">Samedi 22 novembre</p><p style="font-size:13px;color:#59685F">Départ 6h00 · retour vers 18h00</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          ${svg('pin', 19, '#0F5132')}
          <div><p style="font-size:14px;font-weight:600">Devant la salle d’entraînement</p><p style="font-size:13px;color:#59685F">Analamahitsy</p></div>
        </div>
      </div>`, 16)}

      <p style="font-size:15px;line-height:25px;color:#3C4A42">La sortie annuelle est ouverte à tous les membres, quel que soit le grade. Le transport est organisé par le club. Chacun apporte son repas de midi et une tenue de rechange.</p>
      <p style="font-size:15px;line-height:25px;color:#3C4A42">Les mineurs doivent remettre une autorisation signée avant le mercredi 19 novembre.</p>
      ${btn('J’y participe', 'primary', 'participation')}
    </div>
  </div>` });

/* --- 08 Album photo --- */
const grid = (n) => `<div class="grid3">${Array.from({ length: n }, () =>
  `<button class="tilephoto" data-go="photo">${svg('album', 24, '#9CBCAA', 1.3)}</button>`).join('')}</div>`;

screen('album', '08 · Album photo', { tab: 'album', body: `
  ${header('Album photo')}
  <div class="chips">${chip('Tout', true)}${chip('Entraînements')}${chip('Compétitions')}${chip('Sorties')}</div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead">${overline('Compétitions')}<span style="font-size:12px;color:#7C8B82">24 photos</span></div>
      ${grid(6)}
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead">${overline('Entraînements')}<span style="font-size:12px;color:#7C8B82">58 photos</span></div>
      ${grid(3)}
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Cérémonies')}
      ${grid(3)}
    </div>
  </div>` });

/* --- 09 Photo en grand --- */
screen('photo', '09 · Photo en grand', { full: `
  <div class="phone" style="background:#0B1712">
    <div style="padding:14px 12px;display:flex;align-items:center;gap:4px">
      <button class="tapicon" data-go="album" aria-label="Fermer">${svg('x', 22, '#FFF', 2)}</button>
      <span style="flex-grow:1;font-size:14px;color:#C9D8D0;text-align:center">7 sur 24</span>
      <span style="width:44px"></span>
    </div>
    <div style="flex-grow:1;display:flex;align-items:center;justify-content:center;padding:0 12px">
      <div style="width:100%;aspect-ratio:3/4;border-radius:16px;background:#16261E;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
        ${svg('album', 54, '#4E7360', 1.2)}
        <p style="font-size:11px;font-weight:600;letter-spacing:.1em;color:#4E7360;text-transform:uppercase">Photo à fournir</p>
      </div>
    </div>
    <div style="padding:20px 20px 32px;display:flex;flex-direction:column;gap:6px">
      <p style="font-size:15px;font-weight:600;color:#FFF">Tournoi régional d’Antananarivo</p>
      <p style="font-size:13px;color:#9BB0A5">Compétitions · 12 novembre 2025</p>
    </div>
  </div>` });

/* --- 10 Le Club --- */
screen('club', '10 · Le Club', { tab: 'home', body: `
  ${header('Le Club', { back: 'accueil' })}

  <div style="flex-grow:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:22px">
    <div style="background:#0F5132;border-radius:18px;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div class="emblem emblem--lg">${svg('shield', 34, '#0F5132')}</div>
      <div>
        <p class="display" style="font-size:20px;color:#FFF;line-height:25px">Kung-fu Waishi<br>Analamahitsy</p>
        <p style="font-size:13px;color:#B9D4C6;margin-top:8px">Fondé en 2014 · Antananarivo</p>
      </div>
      <p style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#7FA893;text-transform:uppercase">Logo du club à fournir</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Présentation')}
      ${card(`<p style="font-size:15px;line-height:25px;color:#3C4A42">Le club enseigne le Kung-fu Waishi à Analamahitsy depuis 2014. Il accueille enfants, adolescents et adultes, du débutant au gradé, autour d’une pratique régulière et d’un esprit d’entraide.</p>`)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Valeurs')}
      ${[['Respect', 'Du maître, des partenaires, du lieu.'], ['Constance', 'La progression vient de la régularité.'], ['Entraide', 'Les anciens accompagnent les nouveaux.']]
        .map(([t, d]) => `<div class="card valuerow">
        <span class="tile tile--sm">${svg('martial', 18, '#0F5132')}</span>
        <span><b style="display:block;font-size:15px;font-weight:600">${t}</b><span style="display:block;font-size:13px;color:#59685F;margin-top:2px;line-height:19px">${d}</span></span>
      </div>`).join('\n      ')}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead">${overline('Entraînements')}<span class="modif">Modifiable par l’administration</span></div>
      ${card(`<div class="deflist">
        ${[['Mardi', '17h30 – 19h00', 'Tous niveaux'], ['Jeudi', '17h30 – 19h00', 'Tous niveaux'], ['Vendredi', '17h30 – 19h00', 'Débutants'], ['Samedi', '09h00 – 11h00', 'Gradés']]
          .map(([j, h, n]) => `<div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">${j}</span><span style="flex-grow:1;color:#3C4A42">${h}</span><b style="font-size:12px;color:#7C8B82;font-weight:400">${n}</b></div>`).join('\n        ')}
      </div>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead">${overline('Contact')}<span class="modif">Modifiable par l’administration</span></div>
      ${card(`<div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm">${svg('users', 17, '#0F5132')}</span>
          <div><p style="font-size:14px;font-weight:600">Idealy Itoerantsoa Santatra</p><p style="font-size:13px;color:#59685F">Responsable du club</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm">${svg('phone', 17, '#0F5132')}</span>
          <div><p style="font-size:14px;font-weight:600">[NUMÉRO À FOURNIR]</p><p style="font-size:13px;color:#59685F">Téléphone</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm">${svg('pin', 17, '#0F5132')}</span>
          <div><p style="font-size:14px;font-weight:600">[ADRESSE EXACTE À FOURNIR]</p><p style="font-size:13px;color:#59685F">Analamahitsy, Antananarivo</p></div>
        </div>
      </div>`, 16)}
    </div>
  </div>` });

/* --- 11 Notifications --- */
screen('notifications', '11 · Notifications', { tab: 'home', body: `
  ${header('Notifications', { back: 'accueil', action: `<button class="link" style="padding:0 14px">Tout lire</button>` })}

  <div style="flex-grow:1;padding:18px 20px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Aujourd’hui')}
      ${[['Sortie', 'Nouvelle sortie prévue ce samedi. Consultez le casier pour voir les détails.', 'Il y a 2 h'],
         ['Changement d’horaire', 'La séance du mercredi passe à 17h30 jusqu’à fin décembre.', 'Il y a 5 h']]
        .map(([t, d, time]) => `<button class="card notif notif--new" data-go="casierDetail">
        <span class="tile tile--sm">${svg('news', 18, '#0F5132')}</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span style="display:flex;align-items:center;gap:8px"><b style="font-size:14px;font-weight:700">${t}</b><i class="unread"></i></span>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">${d}</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">${time}</span>
        </span>
      </button>`).join('\n      ')}
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Plus tôt')}
      ${[['Compétition', 'Huit membres sélectionnés pour le tournoi régional.', 'Hier'],
         ['Cérémonie', 'Onze passages de grade validés le 28 octobre.', 'Il y a 3 j']]
        .map(([t, d, time]) => `<button class="card notif" data-go="casierDetail">
        <span class="tile tile--sm" style="background:#F1F6F3">${svg('news', 18, '#7C8B82')}</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <b style="display:block;font-size:14px;font-weight:600;color:#3C4A42">${t}</b>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">${d}</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">${time}</span>
        </span>
      </button>`).join('\n      ')}
    </div>
  </div>` });

/* --- 12 Administration --- */
screen('admin', '12 · Administration', { full: `
  <div class="phone">
    <div style="background:#0E2119;padding:20px 20px 24px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="tapicon" data-go="accueil" aria-label="Retour" style="margin-left:-10px">${svg('back', 22, '#FFF', 2)}</button>
        <div style="flex-grow:1">
          <p class="display" style="font-size:18px;font-weight:600;color:#FFF">Administration</p>
          <p style="font-size:12px;color:#9BB0A5;margin-top:2px">Idealy Itoerantsoa Santatra</p>
        </div>
      </div>
      <div class="stats">
        ${[['64', 'membres'], ['12', 'actualités'], ['186', 'photos']].map(([n, l]) =>
          `<div style="background:#1B3128;border-radius:12px;padding:13px 10px;text-align:center">
          <p class="display" style="font-size:20px;color:#FFF">${n}</p>
          <p style="font-size:11px;color:#9BB0A5;margin-top:2px">${l}</p>
        </div>`).join('\n        ')}
      </div>
    </div>

    <div style="flex-grow:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:22px">
      <div style="display:flex;flex-direction:column;gap:12px">
        ${overline('Membres')}
        <div class="list">
          ${[['Ajouter un étudiant', 'Fiche, photo, grade, biographie', 'plus'], ['Modifier une fiche', 'Corriger ou compléter', 'edit'], ['Changer un grade', 'Après un passage validé', 'edit'], ['Comptes et accès', 'Créer, suspendre, réinitialiser', 'lock']]
            .map(([t, d, ic]) => `<div class="listrow">
            <span class="tile tile--sm">${svg(ic, 18, '#0F5132')}</span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">${t}</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">${d}</span></span>
            ${svg('chev', 17, '#A8B6AE', 2)}
          </div>`).join('\n          ')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        ${overline('Publication')}
        <div class="list">
          ${[['Publier une actualité', 'Sortie, compétition, réunion…', 'news'], ['Envoyer une notification', 'Prévient tous les membres', 'bell'], ['Créer un album', 'Puis y ajouter des photos', 'album'], ['Gérer les photos', 'Ajouter, classer, supprimer', 'album']]
            .map(([t, d, ic]) => `<div class="listrow">
            <span class="tile tile--sm">${svg(ic, 18, '#0F5132')}</span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">${t}</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">${d}</span></span>
            ${svg('chev', 17, '#A8B6AE', 2)}
          </div>`).join('\n          ')}
        </div>
      </div>

      <div class="warn">
        <i></i>
        <p>L’administration est le seul rôle autorisé à modifier une fiche. Les membres consultent, sans jamais pouvoir écrire.</p>
      </div>
    </div>
  </div>` });

/* --- 13 Charte graphique (hors cadre téléphone) --- */
screen('charte', '13 · Charte graphique', { wide: true, full: `
  <div class="sheet">
    <div style="display:flex;flex-direction:column;gap:8px">
      ${overline('Charte graphique')}
      <h1 class="display" style="font-size:32px;line-height:38px">Kung-fu Waishi Analamahitsy</h1>
      <p style="font-size:15px;line-height:24px;color:#59685F;max-width:520px">Vert dominant, blanc secondaire. Chaque couleur de texte a été mesurée sur son fond : le minimum retenu est 4,5:1, y compris pour les libellés de 11 px.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Couleurs')}
      <div class="swatches">
        ${[['#0F5132', 'Vert profond', 'Bandeaux, boutons', 'Blanc dessus : 9,4:1'],
           ['#12613C', 'Vert texte', 'Liens, libellés', 'Sur blanc : 7,5:1'],
           ['#E8F1EC', 'Vert clair', 'Fonds teintés, pastilles', 'Vignettes de photo'],
           ['#F5F8F6', 'Fond d’écran', 'Blanc tiré vers le vert', 'Sous les cartes'],
           ['#0E2119', 'Encre', 'Texte principal', 'Sur blanc : 16,8:1'],
           ['#59685F', 'Secondaire', 'Texte de soutien', 'Sur blanc : 5,9:1'],
           ['#E4572E', 'Alerte', 'Non-lu, urgence', 'Employé rarement'],
           ['#E4EDE8', 'Filet', 'Bordures, séparateurs', 'Jamais porteur de sens']]
          .map(([hex, n, u, c]) => `<div class="swatch">
          <span class="swatch__chip" style="background:${hex}"></span>
          <b>${n}</b><code>${hex}</code>
          <span>${u}</span><span>${c}</span>
        </div>`).join('\n        ')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Typographie')}
      <div class="duo">
        <div class="card"><p class="display" style="font-size:30px">Archivo</p>
          <p style="font-size:13px;color:#59685F;margin-top:8px;line-height:20px">Titres, chiffres, sur-titres. Sportive et nette, elle porte l’identité sans bavardage.</p></div>
        <div class="card"><p style="font-size:30px;font-weight:600">Karla</p>
          <p style="font-size:13px;color:#59685F;margin-top:8px;line-height:20px">Corps de texte et libellés. Ouverte et lisible aux petites tailles, sur écran comme à l’impression.</p></div>
      </div>
      ${card(`<div class="scale">
        ${[['Titre · 24', '<span class="display" style="font-size:24px">Sortie au lac Mantasoa</span>'],
           ['Section · 18', '<span class="display" style="font-size:18px;font-weight:600">Informations personnelles</span>'],
           ['Corps · 15', '<span style="font-size:15px">Le club accueille enfants et adultes.</span>'],
           ['Soutien · 13', '<span style="font-size:13px;color:#59685F">Départ 6h00 devant la salle.</span>'],
           ['Sur-titre · 12', '<span class="overline">Vaovao farany</span>']]
          .map(([k, v]) => `<div><span>${k}</span>${v}</div>`).join('\n        ')}
      </div>`, 20)}
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Composants')}
      <div class="duo">
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Boutons · hauteur 48</p>
          ${btn('Action principale')}${btn('Action secondaire', 'ghost')}${btn('Action discrète', 'soft')}
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Filtres et grades</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${chip('Tous', true)}${chip('Sorties')}${chip('Compétitions')}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${grade('Ceinture jaune', '#D8A93A')}${grade('Ceinture verte', '#4E9C57')}</div>
          <p style="font-size:11px;line-height:17px;color:#59685F">Le grade est toujours écrit à côté de sa pastille : la couleur seule ne porte jamais l’information.</p>
        </div>
      </div>
      <div class="duo">
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Champ de saisie</p>
          <label class="field"><span class="field__label">Numéro de membre</span><span class="input">F04x042</span></label>
          <label class="field"><span class="field__label">Actif</span><span class="input input--on">Rakotondrabe</span></label>
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Fiche membre</p>
          <div class="card studentrow" style="box-shadow:none">
            ${portrait(52, 52, 14)}
            <span style="flex-grow:1"><b style="display:block;font-size:15px;font-weight:700;line-height:19px">RAKOTONDRABE</b><span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Nirina</span></span>
          </div>
          <p style="font-size:11px;line-height:17px;color:#59685F">Le portrait est un marque-place tant que les photos du club ne sont pas fournies.</p>
        </div>
      </div>
    </div>

    <p style="font-size:12px;line-height:19px;color:#59685F;border-top:1px solid #E4EDE8;padding-top:20px">Cibles tactiles : jamais moins de 44 px de haut. Rayons : 12 px sur les contrôles, 14 à 18 px sur les cartes. Grille d’espacement de 4 px.</p>
  </div>` });


/* ============================================================
   TROIS DIRECTIONS VISUELLES — à choisir
   Le vert et le blanc sont acquis. Ce qui change : la géométrie,
   la profondeur, le rapport au mouvement. Chaque direction est
   poussée franchement, pour que le choix soit lisible.
   ============================================================ */

/* --- A · LAME — géométrie diagonale, tranchante, sportive ------- */
screen('directionA', 'A · Lame', { full: `
  <div class="phone dirA">
    <header class="dirA__head">
      <div class="dirA__glow"></div>
      <div class="dirA__top">
        <span class="emblem" style="width:40px;height:40px;border-radius:10px">${svg('shieldCheck', 22, '#0F5132')}</span>
        <span style="flex-grow:1">
          <b class="dirA__name">WAISHI</b>
          <i class="dirA__place">Analamahitsy</i>
        </span>
        <button class="tapicon" data-go="notifications" style="position:relative">${svg('bell', 22, '#FFF')}<span class="dot">3</span></button>
      </div>

      <div class="dirA__count">
        <span class="dirA__num">64</span>
        <span class="dirA__lbl">membres<br>actifs</span>
      </div>
      <div class="dirA__strokes"><i></i><i></i><i></i></div>
    </header>

    <div class="dirA__body">
      <button class="dirA__next" data-go="casierDetail">
        <span class="dirA__tag">Prochaine sortie</span>
        <span class="dirA__title">Lac Mantasoa</span>
        <span class="dirA__meta">Samedi 22 nov · départ 6h00</span>
        <span class="dirA__go">${svg('chev', 18, '#0F5132', 2.4)}</span>
      </button>

      <div class="dirA__row">
        <button class="dirA__cut" data-go="etudiants">
          <span class="dirA__cutnum">3</span>
          <span class="dirA__cutlbl">séances<br>par semaine</span>
        </button>
        <button class="dirA__cut dirA__cut--dark" data-go="album">
          <span class="dirA__cutnum">186</span>
          <span class="dirA__cutlbl">photos<br>au club</span>
        </button>
      </div>

      <div class="rowhead" style="margin-top:6px">${overline('Vaovao farany')}<button class="link" data-go="casier">Tout voir</button></div>
      ${NEWS.slice(0, 2).map(([date, cat, cc, cb, title, text]) => `<button class="dirA__news" data-go="casierDetail">
        <span class="dirA__date">${date.split(' ')[0]}<i>${date.split(' ')[1]}</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirA__newstag">${cat}</span>
          <span class="dirA__newstitle">${title}</span>
        </span>
      </button>`).join('\n      ')}
    </div>
    ${tabbar('home')}
  </div>` });

/* --- B · SOUFFLE — profondeur, verre dépoli, respiration -------- */
screen('directionB', 'B · Souffle', { full: `
  <div class="phone dirB">
    <div class="dirB__aura"><i></i><i></i><i></i></div>

    <div class="dirB__content">
      <div class="dirB__top">
        <span style="flex-grow:1">
          <b class="dirB__hello">Kung-fu Waishi</b>
          <i class="dirB__place">Analamahitsy · Antananarivo</i>
        </span>
        <button class="dirB__bell" data-go="notifications">${svg('bell', 21, '#0F5132')}<span class="dot" style="border-color:#EAF3EE">3</span></button>
      </div>

      <button class="dirB__hero" data-go="casierDetail">
        <span class="dirB__pill">Prochaine sortie</span>
        <span class="dirB__herotitle">Lac<br>Mantasoa</span>
        <span class="dirB__herometa">Samedi 22 novembre · 6h00</span>
        <span class="dirB__cta">Voir les détails ${svg('chev', 15, '#0F5132', 2.4)}</span>
      </button>

      <div class="dirB__glassrow">
        ${[['64', 'membres'], ['4', 'séances'], ['186', 'photos']].map(([n, l]) => `<div class="dirB__glass">
          <b>${n}</b><span>${l}</span>
        </div>`).join('\n        ')}
      </div>

      <div class="dirB__panel">
        <div class="rowhead">${overline('Vaovao farany')}<button class="link" data-go="casier">Tout voir</button></div>
        ${NEWS.slice(0, 3).map(([date, cat, cc, cb, title]) => `<button class="dirB__item" data-go="casierDetail">
          <span class="dirB__dot"></span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="dirB__itemtitle">${title}</span>
            <span class="dirB__itemmeta">${cat} · ${date}</span>
          </span>
          ${svg('chev', 16, '#8FB3A0', 2)}
        </button>`).join('\n        ')}
      </div>
    </div>
    ${tabbar('home')}
  </div>` });

/* --- C · TEMPO — typographie massive, contraste, bandeau vivant - */
screen('directionC', 'C · Tempo', { full: `
  <div class="phone dirC">
    <div class="dirC__ticker"><span>SORTIE 22 NOV · LAC MANTASOA — SÉANCE MERCREDI 17H30 — TOURNOI RÉGIONAL : 8 SÉLECTIONNÉS — SORTIE 22 NOV · LAC MANTASOA — SÉANCE MERCREDI 17H30 — </span></div>

    <div class="dirC__top">
      <span style="flex-grow:1">
        <b class="dirC__brand">WAISHI</b>
        <i class="dirC__sub">Analamahitsy</i>
      </span>
      <button class="tapicon" data-go="notifications" style="position:relative">${svg('bell', 22, '#0E2119')}<span class="dot" style="border-color:#FFF">3</span></button>
    </div>

    <button class="dirC__poster" data-go="casierDetail">
      <span class="dirC__posterbg">${svg('martial', 200, 'rgba(255,255,255,.10)', 1)}</span>
      <span class="dirC__kicker">Samedi 22 novembre</span>
      <span class="dirC__big">LAC<br>MANTASOA</span>
      <span class="dirC__rule"></span>
      <span class="dirC__foot">Départ 6h00 · devant la salle ${svg('chev', 16, '#7FD9A8', 2.4)}</span>
    </button>

    <div class="dirC__figures">
      ${[['64', 'MEMBRES'], ['3', 'SÉANCES'], ['186', 'PHOTOS']].map(([n, l]) => `<div class="dirC__fig"><b>${n}</b><span>${l}</span></div>`).join('\n      ')}
    </div>

    <div class="dirC__list">
      <div class="dirC__listhead"><b>VAOVAO FARANY</b><button class="link" data-go="casier">Tout voir</button></div>
      ${NEWS.slice(0, 3).map(([date, cat, cc, cb, title], i) => `<button class="dirC__row" data-go="casierDetail">
        <span class="dirC__idx">0${i + 1}</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirC__rowtitle">${title}</span>
          <span class="dirC__rowmeta">${cat.toUpperCase()} · ${date.toUpperCase()}</span>
        </span>
      </button>`).join('\n      ')}
    </div>
    ${tabbar('home')}
  </div>` });


/* --- Carte de membre — le QR est un motif de démonstration ------ */
const faux_qr = () => {
  /* Motif déterministe : trois repères d'angle et un damier stable.
     Il n'encode rien — le vrai code sera produit au développement. */
  const N = 21, cells = [];
  const repere = (r, c) => (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on;
    if (repere(r, c)) {
      const dr = r < 7 ? r : r - 14, dc = c < 7 ? c : c - 14;
      const d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
      on = d !== 2;
    } else if (r === 6 || c === 6) { on = (r + c) % 2 === 0; }
    else { on = ((r * 7 + c * 13 + ((r * c) % 5)) % 3) === 0; }
    if (on) cells.push(`<rect x="${c}" y="${r}" width="1" height="1"/>`);
  }
  return `<svg viewBox="-2 -2 ${N + 4} ${N + 4}" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="${N + 4}" height="${N + 4}" fill="#FFF"/>
    <g fill="#0E2119">${cells.join('')}</g>
  </svg>`;
};

screen('carte', '14 · Carte de membre', { full: `
  <div class="phone">
    ${header('Carte de membre', { back: 'profilOuvert', action: `<button class="tapicon" aria-label="Partager">${svg('edit', 21, '#0E2119')}</button>` })}
    <div style="flex-grow:1;padding:22px 20px 28px;display:flex;flex-direction:column;gap:20px">

      <div class="carte" data-feat="carte">
        <!-- Le cachet du club. L'emplacement reste vide tant que le
             fichier n'est pas déposé dans img/ : un emplacement vide
             est plus honnête qu'un faux tampon. -->
        <span class="cachet" aria-label="Cachet du club"><i>cachet<br>du club</i></span>
        <div class="carte__head">
          <span class="emblem" style="width:36px;height:36px;border-radius:10px">${svg('shieldCheck', 20, '#0F5132')}</span>
          <span style="flex-grow:1">
            <b class="carte__org">KUNG-FU WAISHI</b>
            <i class="carte__kind">Carte de membre</i>
          </span>
        </div>

        <div class="carte__body">
          ${portrait(96, 120, 14)}
          <div style="flex-grow:1;min-width:0;display:flex;flex-direction:column;gap:6px">
            <b class="carte__nom">RAKOTONDRABE</b>
            <span class="carte__prenom">Nirina</span>
            <span style="margin-top:2px">${grade('Ceinture verte', '#4E9C57')}</span>
            <span class="carte__num">F04x042</span>
          </div>
        </div>

        <div class="carte__qr">
          <div class="carte__qrbox">${faux_qr()}</div>
          <div style="flex-grow:1">
            <p class="carte__qrtitle">Code de membre</p>
            <p class="carte__qrtext">Présenté à l’entraînement pour pointer la présence.</p>
            <p class="carte__faux">Motif de démonstration — ne se scanne pas</p>
          </div>
        </div>

        <div class="carte__foot">
          <span>Membre depuis<br><b>9 septembre 2019</b></span>
          <span style="text-align:right">Valide jusqu’au<br><b>31 décembre 2026</b></span>
        </div>
        <div class="carte__band" style="background:#4E9C57"></div>
      </div>

      <div class="list">
        ${[['Enregistrer en image', 'Pour l’envoyer ou l’imprimer', 'album'],
           ['Imprimer la carte', 'Format carte bancaire', 'edit'],
           ['Régénérer le code', 'En cas de perte de la carte', 'lock']]
          .map(([t, d, ic]) => `<div class="listrow">
          <span class="tile tile--sm">${svg(ic, 18, '#0F5132')}</span>
          <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">${t}</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">${d}</span></span>
          ${svg('chev', 17, '#A8B6AE', 2)}
        </div>`).join('\n        ')}
      </div>

      <div class="warn">
        <i></i>
        <p>Le code affiché est un motif de démonstration : il ne contient aucune donnée et ne se scanne pas. Le vrai code, unique par membre, sera produit au développement une fois la maquette validée.</p>
      </div>
    </div>
  </div>` });


/* ============================================================
   Liste des fonctionnalités — support des commentaires du client
   Chaque ligne porte un `data-feat` : c'est la clé sous laquelle
   le commentaire est enregistré, puis exporté pour le développeur.
   ============================================================ */
/* ============================================================
   Participation à une actualité, et contribution MVola
   ------------------------------------------------------------
   Le code USSD est composé à partir du montant choisi. Le bouton
   ouvre le clavier du téléphone avec le code déjà écrit : c'est le
   membre qui appuie sur appeler. L'application ne parle pas à
   l'opérateur et ne peut donc pas savoir si le transfert a abouti —
   la maquette le dit à l'écran plutôt que de le laisser croire.
   ============================================================ */
const MONTANTS = [1000, 2000, 5000, 10000];

screen('participation', '21 · Je participe', { tab: 'news', body: `
  ${header('Je participe', { back: 'casierDetail' })}

  <div style="flex-grow:1;padding:18px 20px 24px;display:flex;flex-direction:column;gap:22px">
    <div class="card" style="display:flex;gap:13px;align-items:center;padding:14px 16px">
      <span class="datebox"><b>22</b><i>nov</i></span>
      <div>
        <p style="font-size:15px;font-weight:600;line-height:20px">Sortie au lac Mantasoa</p>
        <p style="font-size:13px;color:#59685F;margin-top:3px">Départ 6h00 devant la salle</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Qui vient')}
      ${card(`<div style="display:flex;flex-direction:column;gap:14px">
        <label class="field"><span class="field__label">Prénom</span>
          <span class="input">Nirina</span></label>
        <label class="field"><span class="field__label">Numéro matricule</span>
          <span class="input input--fige">F04x042</span></label>
        <p class="aide">Les deux sont repris de votre fiche. Le matricule ne se modifie pas.</p>
      </div>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead">${overline('J’amène du monde')}<span style="font-size:12px;color:#7C8B82">Conjoint, enfants</span></div>
      ${card(`<div class="compteur">
        <button class="compteur__b" aria-label="Retirer une personne">${svg('moins', 20, '#0F5132', 2)}</button>
        <div class="compteur__v">
          <b>2</b>
          <span>personnes en plus</span>
        </div>
        <button class="compteur__b" aria-label="Ajouter une personne">${svg('plus', 20, '#0F5132', 2)}</button>
      </div>
      <p class="aide" style="margin-top:12px">Trois places au total avec vous. Le club compte les places pour le transport.</p>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Ma participation')}
      ${card(`
        <p style="font-size:13.5px;line-height:20px;color:#59685F">Vous pouvez envoyer en plusieurs fois. Choisissez le montant de cet envoi.</p>
        <div class="montants">
          ${MONTANTS.map((m, i) => `<button class="montant${i === 2 ? ' montant--on' : ''}">${m.toLocaleString('fr-FR').replace(/ | /g, ' ')}<i>Ar</i></button>`).join('\n          ')}
          <button class="montant montant--libre">Autre<i>montant</i></button>
        </div>

        <div class="ussd">
          <p class="ussd__lbl">Le code composé sur votre téléphone</p>
          <code class="ussd__code">#111*1*2*<b>0388010853</b>*5000#</code>
          <p class="ussd__nom">Santatra Nirina Antonio · MVola</p>
        </div>

        ${btn('Ouvrir le clavier avec ce code')}

        <div class="avert">
          ${svg('flag', 18, '#8A3A12')}
          <p>L’application ouvre le clavier, elle n’envoie pas l’argent : c’est vous qui appuyez sur appeler. Elle ne sait pas non plus si le transfert a réussi — c’est le club qui pointe ce qu’il a reçu.</p>
        </div>
      `, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Ce que j’ai déjà envoyé')}
      <div class="list">
        ${[['5 000 Ar', '18 novembre', 'Pointé par le club'], ['5 000 Ar', '12 novembre', 'Pointé par le club']]
          .map(([m, d, e]) => `<div class="listrow">
          ${svg('shieldCheck', 19, '#12613C')}
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14.5px;font-weight:600">${m}</b>
            <span style="display:block;font-size:12.5px;color:#59685F;margin-top:1px">${d} · ${e}</span>
          </span>
        </div>`).join('\n        ')}
        <div class="listrow" style="background:#F5F8F6">
          <span style="flex-grow:1;font-size:13.5px;color:#59685F">Total reçu</span>
          <b class="display" style="font-size:16px;color:#0F5132">10 000 Ar</b>
        </div>
      </div>
    </div>

    ${btn('Confirmer ma participation')}
  </div>` });

/* --- 22 Changement de mot de passe --- */
screen('motdepasse', '22 · Changer le mot de passe', { tab: 'students', body: `
  ${header('Mot de passe', { back: 'profilOuvert' })}

  <div style="flex-grow:1;padding:20px;display:flex;flex-direction:column;gap:22px">
    ${card(`<div style="display:flex;flex-direction:column;gap:16px">
      <label class="field"><span class="field__label">Mot de passe actuel</span>
        <span class="input">••••••••</span></label>
      <label class="field"><span class="field__label">Nouveau mot de passe</span>
        <span class="input">••••••••••</span></label>
      <label class="field"><span class="field__label">Répéter le nouveau</span>
        <span class="input">••••••••••</span></label>
    </div>`, 18)}

    ${btn('Enregistrer')}

    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#E8F1EC;border-color:#C4D9CC">
      ${svg('key', 19, '#0F5132')}
      <div>
        <p style="font-size:13.5px;font-weight:700;line-height:19px;color:#12613C">Mot de passe oublié</p>
        <p style="font-size:12.5px;line-height:18px;color:#12613C;margin-top:4px">Adressez-vous à l’administration du club : elle le réinitialise depuis son écran. Il n’y a pas d’envoi par courriel, puisque la connexion se fait au numéro matricule.</p>
      </div>
    </div>
  </div>` });

/* ============================================================
   Messagerie et espace des maîtres
   ============================================================ */

const SALONS = [
  ['club', 'Tout le club', 'RAHARISOA Fanja', 'L’entraînement de mercredi est maintenu.', '14:20', 3, '#0F5132'],
  ['grade', 'Ceintures vertes', 'ANDRIANJAFY Tokiniaina', 'Qui vient tôt samedi pour la mise en place ?', '11:05', 1, '#4E9C57'],
  ['compet', 'Tournoi régional', 'RABEMANANJARA Hery', 'Rendez-vous 6h devant la salle.', 'Hier', 0, '#B0530F'],
  ['direct', 'RASOAMANANA Fanjaniaina', null, 'Merci pour la correction du taolu.', 'Hier', 0, '#3E6E9C'],
  ['direct2', 'RAKOTOARISOA Lalaina', null, 'D’accord pour dimanche.', 'Lun.', 0, '#6E5AA6']
];

const salonAvatar = (nom, couleur, direct) => direct
  ? portrait(44, 44, 22)
  : `<span style="width:44px;height:44px;border-radius:14px;flex:none;background:${couleur}1A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:15px;color:${couleur}">${nom.slice(0, 2).toUpperCase()}</span>`;

screen('messages', '16 · Messages', { tab: 'chat', body: `
  ${header('Messages', { action: `<button class="tapicon" data-go="maitresVerrou" aria-label="Espace des maîtres">${svg('key', 21, '#0E2119')}</button>` })}

  <div style="padding:14px 20px 0">
    <div class="searchbar">
      ${svg('search', 19, '#7C8B82')}
      <span style="color:#7C8B82;font-size:15px">Rechercher une conversation</span>
    </div>
  </div>

  <div style="flex-grow:1;padding:16px 20px 24px;display:flex;flex-direction:column;gap:18px">
    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Salons du club')}
      <div class="list">
        ${SALONS.slice(0, 3).map(([id, nom, auteur, texte, heure, nonlus, couleur]) =>
          `<button class="listrow" data-go="salon">
          ${salonAvatar(nom, couleur, false)}
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">${nom}</b>
              <i class="convrow__heure">${heure}</i>
            </span>
            <span class="convrow__txt">${auteur ? `<b>${auteur.split(' ')[1]} :</b> ` : ''}${texte}</span>
          </span>
          ${nonlus ? `<span class="pastille">${nonlus}</span>` : ''}
        </button>`).join('\n        ')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Conversations')}
      <div class="list">
        ${SALONS.slice(3).map(([id, nom, auteur, texte, heure, nonlus, couleur]) =>
          `<button class="listrow" data-go="salon">
          ${salonAvatar(nom, couleur, true)}
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">${nom}</b>
              <i class="convrow__heure">${heure}</i>
            </span>
            <span class="convrow__txt">${texte}</span>
          </span>
        </button>`).join('\n        ')}
      </div>
    </div>

    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#FFF7F2;border-color:#F2D8C6">
      ${svg('flag', 20, '#B0530F')}
      <div>
        <p style="font-size:13px;font-weight:700;line-height:18px">Signaler un message</p>
        <p style="font-size:12.5px;line-height:18px;color:#59685F;margin-top:4px">Un appui long sur un message le signale à l’administration. Le club compte des mineurs : la modération n’est pas une option.</p>
      </div>
    </div>
  </div>` });

/* --- 17 Une conversation --- */
const MESSAGES = [
  ['recu', 'RAHARISOA Fanja', 'Ceinture jaune', 'Bonsoir à tous. L’entraînement de mercredi est maintenu malgré les travaux.', '14:20'],
  ['recu', 'RAHARISOA Fanja', 'Ceinture jaune', 'Rendez-vous à 17h30 comme d’habitude.', '14:20'],
  ['envoye', null, null, 'Merci pour l’information.', '14:34'],
  ['recu', 'ANDRIANJAFY Tokiniaina', 'Ceinture bleue', 'Est-ce qu’on travaille encore le taolu de la semaine dernière ?', '15:02'],
  ['envoye', null, null, 'Oui, et on ajoute le passage en cercle.', '15:11']
];

screen('salon', '17 · Une conversation', { tab: 'chat', body: `
  <div class="apphead">
    <button class="tapicon" data-go="messages" aria-label="Retour">${svg('back', 22, '#0E2119', 2)}</button>
    <span style="width:36px;height:36px;border-radius:12px;flex:none;background:#0F51321A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:13px;color:#0F5132">TC</span>
    <span style="flex-grow:1;min-width:0;margin-left:10px">
      <b style="display:block;font-family:var(--display);font-size:16px;font-weight:600;line-height:19px">Tout le club</b>
      <i style="display:block;font-size:11.5px;color:#59685F;font-style:normal;margin-top:1px">64 membres</i>
    </span>
  </div>

  <div class="fil">
    <p class="fil__jour">Aujourd’hui</p>
    ${MESSAGES.map(([sens, auteur, gr, texte, heure]) => sens === 'recu'
      ? `<div class="bul bul--recu">
      <b class="bul__auteur">${auteur}</b>
      <p class="bul__txt">${texte}</p>
      <i class="bul__h">${heure}</i>
    </div>`
      : `<div class="bul bul--envoye">
      <p class="bul__txt">${texte}</p>
      <i class="bul__h">${heure} · lu</i>
    </div>`).join('\n    ')}
  </div>

  <div class="saisie">
    <span class="saisie__champ">Écrire un message…</span>
    <button class="saisie__env" aria-label="Envoyer">${svg('send', 20, '#FFF', 1.8)}</button>
  </div>` });

/* --- 18 Espace des maîtres, verrouillé --- */
screen('maitresVerrou', '18 · Espace des maîtres — verrouillé', { tab: 'chat', body: `
  ${header('Espace des maîtres', { back: 'messages' })}

  <div style="flex-grow:1;padding:34px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center">
    <div style="width:74px;height:74px;border-radius:24px;background:#0F5132;display:grid;place-items:center">
      ${svg('lock', 32, '#FFF', 1.8)}
    </div>
    <div>
      <p class="display" style="font-size:20px;line-height:26px">Réservé aux maîtres</p>
      <p style="font-size:14px;line-height:21px;color:#59685F;margin-top:10px;max-width:290px">Votre compte n’a pas ce rôle. Cet espace n’apparaît pas dans la liste des salons et son contenu n’est pas transmis à votre téléphone.</p>
    </div>
    <div class="card" style="width:100%;text-align:left;display:flex;flex-direction:column;gap:12px">
      ${[
        ['Le rôle est posé sur le serveur', 'Pas dans l’application : la modifier ne donne rien.'],
        ['Le filtre est en base', 'Une requête d’un élève sur ces messages revient vide.'],
        ['Seule l’administration accorde le rôle', 'Et peut le retirer à tout moment.']
      ].map(([t, d]) => `<div style="display:flex;gap:11px;align-items:flex-start">
        ${svg('shieldCheck', 19, '#12613C')}
        <div><p style="font-size:13.5px;font-weight:600;line-height:18px">${t}</p>
        <p style="font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">${d}</p></div>
      </div>`).join('\n      ')}
    </div>
    <button class="link" data-go="maitres">Voir l’écran tel que le voit un maître →</button>
  </div>` });

/* --- 19 Espace des maîtres, ouvert --- */
screen('maitres', '19 · Espace des maîtres', { tab: 'chat', body: `
  <div class="apphead apphead--sombre">
    <button class="tapicon" data-go="maitresVerrou" aria-label="Retour">${svg('back', 22, '#FFF', 2)}</button>
    <span style="flex-grow:1;min-width:0;margin-left:4px">
      <b style="display:block;font-family:var(--display);font-size:16px;font-weight:600;line-height:19px;color:#FFF">Espace des maîtres</b>
      <i style="display:block;font-size:11.5px;color:#9CC4AF;font-style:normal;margin-top:1px">4 personnes · confidentiel</i>
    </span>
    ${svg('lock', 20, '#9CC4AF')}
  </div>

  <div style="flex-grow:1;display:flex;flex-direction:column;gap:20px;padding:18px 20px 24px">
    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#E8F1EC;border-color:#C4D9CC">
      ${svg('eyeOff', 20, '#0F5132')}
      <p style="font-size:12.5px;line-height:18px;color:#12613C">Rien de ce qui est écrit ici n’apparaît dans les salons des élèves. Les captures d’écran, en revanche, restent possibles : la confidentialité tient aussi aux personnes.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Fil des maîtres')}
      <div class="fil fil--incruste">
        <div class="bul bul--recu">
          <b class="bul__auteur">RABEMANANJARA Hery</b>
          <p class="bul__txt">Passage de grade de décembre : je propose de reporter deux candidats, ils ne sont pas prêts sur les déplacements.</p>
          <i class="bul__h">09:12</i>
        </div>
        <div class="bul bul--envoye">
          <p class="bul__txt">D’accord. On en parle vendredi avant la séance.</p>
          <i class="bul__h">09:40 · lu</i>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Ce que l’espace contient')}
      <div class="list">
        ${[
          ['Délibérations de passage de grade', 'Avant l’annonce publique'],
          ['Situations individuelles', 'Blessure, absence prolongée, difficulté familiale'],
          ['Signalements des élèves', 'Messages remontés par la modération'],
          ['Notes d’encadrement', 'Répartition des groupes, remplacements']
        ].map(([t, d]) => `<div class="listrow">
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14px;font-weight:600;line-height:19px">${t}</b>
            <span style="display:block;font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">${d}</span>
          </span>
          ${svg('lock', 17, '#7C8B82')}
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>` });

const FEATURES = [
  ['Accueil', [
    ['acc-logo', 'Logo et nom du club', 'En haut de l’accueil et sur la carte de membre', 'accueil'],
    ['acc-visuel', 'Photo du club', 'Grande image de présentation', 'accueil'],
    ['acc-presentation', 'Présentation courte', 'Deux ou trois phrases sur le club', 'accueil'],
    ['acc-vaovao', 'Dernières actualités', 'Les deux plus récentes, avec lien vers le casier', 'accueil'],
    ['acc-notif', 'Pastille de notification', 'Nombre de nouveautés non lues', 'accueil']
  ]],
  ['Étudiants', [
    ['etu-liste', 'Liste des étudiants', 'Photo, nom, prénom, grade', 'etudiants'],
    ['etu-recherche', 'Recherche par nom ou prénom', 'Filtre immédiat sur la liste', 'etudiants'],
    ['etu-filtre', 'Filtres par grade', 'Blanche, jaune, orange, verte…', 'etudiants'],
    ['etu-verrou', 'Fiche protégée', 'Nom et photo visibles, le reste après connexion', 'profilVerrouille'],
    ['etu-fiche', 'Fiche complète', 'Naissance, numéro, début d’entraînement, grade', 'profilOuvert'],
    ['parents', 'Parents ou tuteur', 'Noms, lien de parenté, téléphones, contact d’urgence', 'profilOuvert'],
    ['etu-bio', 'Biographie', 'Quelques lignes sur le parcours', 'profilOuvert'],
    ['carte', 'Carte de membre', 'Photo, numéro, grade et code de présence', 'carte'],
    ['motdepasse', 'Changer son mot de passe', 'Depuis sa fiche ; réinitialisation par l’administration', 'motdepasse']
  ]],
  ['Participation et contribution', [
    ['part-inscription', 'S’inscrire à une sortie', 'Prénom et matricule repris de la fiche', 'participation'],
    ['part-accompagnants', 'Amener du monde', 'Conjoint, enfants — le club compte les places', 'participation'],
    ['part-mvola', 'Contribution par MVola', 'Le clavier s’ouvre avec le code déjà écrit', 'participation'],
    ['part-tranches', 'Envoyer en plusieurs fois', 'Le total se cumule, le club pointe ce qu’il reçoit', 'participation']
  ]],
  ['Casier et notifications', [
    ['cas-liste', 'Casier des actualités', 'Sorties, compétitions, réunions, cérémonies', 'casier'],
    ['cas-filtre', 'Filtres par catégorie', 'Pour retrouver un type d’annonce', 'casier'],
    ['cas-detail', 'Détail d’une actualité', 'Date, lieu, texte, participation', 'casierDetail'],
    ['not-centre', 'Centre de notifications', 'Lues et non lues, par date', 'notifications'],
    ['not-push', 'Notification sur le téléphone', 'Hors de l’application — à chiffrer', 'notifications']
  ]],
  ['Album photo', [
    ['alb-cat', 'Catégories d’album', 'Entraînements, compétitions, sorties, cérémonies', 'album'],
    ['alb-grille', 'Grille de photos', 'Aperçu en vignettes', 'album'],
    ['alb-grand', 'Photo en grand', 'Plein écran avec légende', 'photo']
  ]],
  ['Messages', [
    ['msg-club', 'Salon de tout le club', 'Une annonce lue par les 64 membres', 'messages'],
    ['msg-grade', 'Salons par grade', 'Un fil par groupe de niveau', 'messages'],
    ['msg-evenement', 'Salon par événement', 'Ouvert pour un tournoi, une sortie, puis archivé', 'messages'],
    ['msg-direct', 'Conversation à deux', 'Entre deux membres du club', 'salon'],
    ['msg-ecrire', 'Écrire et recevoir en direct', 'Le message arrive sans rafraîchir', 'salon'],
    ['msg-signaler', 'Signaler un message', 'Remonté à l’administration — le club compte des mineurs', 'messages'],
    ['msg-qui', 'Qui peut écrire à qui', 'À décider : élève vers élève, ou seulement vers un maître', 'messages']
  ]],
  ['Espace des maîtres', [
    ['mt-espace', 'Espace réservé aux maîtres', 'Invisible pour les élèves, filtré côté serveur', 'maitres'],
    ['mt-grades', 'Délibérations de passage de grade', 'Avant l’annonce publique', 'maitres'],
    ['mt-situations', 'Situations individuelles', 'Blessure, absence, difficulté familiale', 'maitres'],
    ['mt-signalements', 'Signalements reçus', 'Ce que la modération remonte', 'maitres'],
    ['mt-role', 'Attribution du rôle de maître', 'Par l’administration seule', 'admin'],
    ['mt-securite', 'Comment la confidentialité est tenue', 'Rôles, filtre en base, journal des accès', 'securite']
  ]],
  ['Le club', [
    ['clb-presentation', 'Présentation du club', 'Histoire et origine', 'club'],
    ['clb-valeurs', 'Valeurs', 'Trois principes affichés', 'club'],
    ['clb-horaires', 'Horaires d’entraînement', 'Jours, heures, niveaux', 'club'],
    ['clb-contact', 'Contact et localisation', 'Responsable, téléphone, adresse', 'club']
  ]],
  ['Administration', [
    ['adm-ajout', 'Ajouter un étudiant', 'Fiche, photo, grade, parents', 'admin'],
    ['adm-modif', 'Modifier une fiche', 'Corriger ou compléter', 'admin'],
    ['adm-grade', 'Changer un grade', 'Après un passage validé', 'admin'],
    ['adm-comptes', 'Comptes et accès', 'Créer, suspendre, réinitialiser', 'admin'],
    ['adm-publier', 'Publier une actualité', 'Et envoyer la notification', 'admin'],
    ['adm-album', 'Gérer les albums', 'Créer, ajouter et classer les photos', 'admin']
  ]]
];

screen('fonctionnalites', '00 · Fonctionnalités', { full: `
  <div class="phone">
    <div class="apphead">
      <span style="width:12px"></span>
      <h1 class="apphead__title">Fonctionnalités</h1>
      <button class="link" style="padding:0 14px" data-action="exporter">Exporter</button>
    </div>

    <div class="featintro">
      <p><b>Donnez votre avis point par point.</b> Touchez une ligne pour écrire un commentaire : ce que vous voulez changer, ajouter ou retirer.</p>
      <p class="featintro__note">Vos commentaires restent sur votre appareil. Le bouton <b>Exporter</b> les rassemble pour me les envoyer.</p>
    </div>

    <div style="flex-grow:1;padding:4px 20px 28px;display:flex;flex-direction:column;gap:22px">
      ${FEATURES.map(([groupe, lignes]) => `<div style="display:flex;flex-direction:column;gap:10px">
        ${overline(groupe)}
        <div class="list">
          ${lignes.map(([id, titre, desc, ecran]) => `<button class="featrow" data-feat="${id}" data-screen="${ecran}">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">${titre}</b>
              <span class="featrow__d">${desc}</span>
            </span>
            <span class="featrow__end" data-count="${id}"></span>
          </button>`).join('\n          ')}
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>` });


/* ============================================================
   Sécurité et confidentialité — la note technique
   Elle répond à une question du client : comment tenir la
   confidentialité de l'espace des maîtres avec Supabase.
   ============================================================ */

const TABLES = [
  ['profils', 'Une ligne par membre : nom, prénom, grade, rôle', 'rôle : élève · maître · admin'],
  ['salons', 'Un fil de discussion : club, grade, événement, direct, maîtres', 'type et titre'],
  ['membres_salon', 'Qui a le droit d’être dans quel salon', 'la table qui décide de tout'],
  ['messages', 'Le texte, son auteur, son salon, sa date', 'jamais lue sans passer par membres_salon'],
  ['signalements', 'Un message remonté à l’administration', 'motif, auteur du signalement, suite donnée'],
  ['journal_acces', 'Qui a ouvert l’espace des maîtres, et quand', 'écrit par le serveur, non modifiable']
];

const REGLES = [
  ['Lire un message', 'Autorisé si — et seulement si — je suis inscrit dans le salon.',
    'Un élève qui interroge directement la base sur les messages des maîtres reçoit une liste vide. Pas une erreur : rien.'],
  ['Entrer dans un salon', 'L’inscription est écrite par l’administration, jamais par l’application.',
    'Se déclarer maître depuis son téléphone ne produit rien : le rôle vit sur le serveur.'],
  ['Écrire un message', 'Autorisé dans mes salons, et l’auteur est forcé à mon identité.',
    'On ne peut pas écrire sous le nom d’un autre, même en trafiquant la requête.'],
  ['Modifier un message', 'L’auteur seul, et pendant quinze minutes.',
    'Passé ce délai, le fil devient une trace stable — utile en cas de litige.'],
  ['Supprimer', 'L’auteur ou l’administration. Le message reste marqué supprimé.',
    'Effacer une ligne ferait disparaître la preuve d’un signalement.']
];

screen('securite', '20 · Sécurité et confidentialité', { wide: true, full: `
  <div class="sheet">
    <div style="display:flex;flex-direction:column;gap:10px">
      ${overline('Note technique — messagerie et espace des maîtres')}
      <h1 class="display" style="font-size:30px;line-height:36px">Où se joue vraiment la confidentialité</h1>
      <p style="font-size:15px;line-height:24px;color:#59685F;max-width:620px">Le compte du club héberge les données — c’est la bonne décision, mais pour une autre raison que la sécurité : elle garantit que le club <b>reste propriétaire</b> de ses messages et de ses photos, quel que soit le prestataire. La confidentialité, elle, ne vient pas du compte : elle vient des <b>règles écrites dans la base</b>.</p>
    </div>

    <div class="sec__avert">
      ${svg('eyeOff', 22, '#8A3A12')}
      <div>
        <p style="font-size:14px;font-weight:700;line-height:20px;color:#8A3A12">La clé publique de l’application est publique — c’est son nom</p>
        <p style="font-size:13.5px;line-height:21px;color:#7A4322;margin-top:5px">Elle est embarquée dans chaque téléphone et se lit en quelques minutes. Tout ce qui protège l’espace des maîtres tient donc aux règles posées sur les tables. Sans elles, n’importe quel élève lirait les délibérations de passage de grade. Avec elles, la requête revient vide.</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Les six tables')}
      <div class="sec__tables">
        ${TABLES.map(([n, r, d]) => `<div class="sec__table">
          <span class="sec__ic">${svg('base', 18, '#12613C')}</span>
          <b>${n}</b>
          <span>${r}</span>
          <i>${d}</i>
        </div>`).join('\n        ')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Les règles d’accès')}
      <p style="font-size:14px;line-height:22px;color:#59685F;max-width:620px">Elles sont posées une fois sur la base, et s’appliquent à toute requête, d’où qu’elle vienne — application, navigateur, outil de développement.</p>
      <div class="sec__regles">
        ${REGLES.map(([q, r, c]) => `<div class="sec__regle">
          <b>${q}</b>
          <p class="sec__r">${r}</p>
          <p class="sec__c">${c}</p>
        </div>`).join('\n        ')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Les trois rôles')}
      <div class="sec__roles">
        ${[
          ['Élève', '#12613C', 'Lit et écrit dans ses salons. Voit la liste des membres, les actualités, l’album.', '64 personnes'],
          ['Maître', '#B0530F', 'Tout ce que fait un élève, plus l’espace des maîtres et les signalements.', '4 personnes'],
          ['Administration', '#0E2119', 'Crée les comptes, accorde les rôles, publie, modère. Ne lit pas l’espace des maîtres sans y être inscrite.', '1 ou 2 personnes']
        ].map(([n, c, d, q]) => `<div class="sec__role">
          <span class="sec__pastille" style="background:${c}"></span>
          <b>${n}</b><i>${q}</i>
          <p>${d}</p>
        </div>`).join('\n        ')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${overline('Ce qui reste à décider')}
      <div class="sec__dec">
        ${[
          ['Connexion par numéro de membre', 'Le service d’authentification travaille par courriel ou par téléphone, pas par numéro de membre. Trois voies : un courriel réel par membre, un courriel construit à partir du numéro, ou un code par SMS — qui se paie à l’envoi, à Madagascar comme ailleurs.'],
          ['Les mineurs et la messagerie', 'Un fil entre mineurs sans adulte est une responsabilité pour le club. Une piste : les conversations à deux ouvertes seulement vers un maître, les salons de groupe toujours visibles par un maître.'],
          ['Le coût', 'L’offre gratuite suffit à 64 membres, mais un projet inactif sept jours est mis en pause et doit être relancé à la main. L’offre payante, environ 25 dollars par mois, supprime cette pause. À trancher avec le club.'],
          ['La conservation', 'Combien de temps garde-t-on les messages ? Un an ? Sans réponse, ils s’accumulent indéfiniment, et l’espace payant arrive plus vite.']
        ].map(([t, d]) => `<div class="sec__q">
          <b>${t}</b>
          <p>${d}</p>
        </div>`).join('\n        ')}
      </div>
    </div>

    <p style="font-size:13px;line-height:21px;color:#7C8B82;border-top:1px solid #E4EDE8;padding-top:20px">Rien de tout cela n’est développé : cette note décrit ce qui sera construit une fois la maquette validée. Elle est ici pour que la décision se prenne en connaissance de cause, pas après coup.</p>
  </div>` });


/* ============================================================
   Planche d'impression A4
   Format retenu : 85,6 x 54 mm, celui d'une carte bancaire. Les
   étuis, porte-badges et cordons du commerce sont à cette taille, et
   la carte entre dans un portefeuille. Dix par page A4, en deux
   colonnes de cinq, avec des traits de coupe.
   ============================================================ */
const ELEVES_PLANCHE = [
  ['RAKOTONDRABE', 'Nirina', 'Ceinture verte', '#4E9C57', 'F04x042'],
  ['RASOAMANANA', 'Fanjaniaina', 'Ceinture jaune', '#D8A93A', 'F04x043'],
  ['ANDRIANJAFY', 'Tokiniaina', 'Ceinture bleue', '#3E6E9C', 'F04x044'],
  ['RABEMANANJARA', 'Hery', 'Ceinture noire', '#1E2320', 'F04x045'],
  ['RAZAFIMAHATRATRA', 'Miora', 'Ceinture orange', '#C97A32', 'F04x046'],
  ['RANDRIAMAMPIONONA', 'Toky', 'Ceinture blanche', '#E7EDE9', 'F04x047'],
  ['RAHARISOA', 'Fanja', 'Ceinture jaune', '#D8A93A', 'F04x048'],
  ['ANDRIAMBELO', 'Rado', 'Ceinture verte', '#4E9C57', 'F04x049'],
  ['RAKOTOARISOA', 'Lalaina', 'Ceinture orange', '#C97A32', 'F04x050'],
  ['RANDRIANASOLO', 'Mamy', 'Ceinture blanche', '#E7EDE9', 'F04x051']
];

/* Le portrait de la planche est plus petit : on redéfinit sa taille
   en millimètres, l'impression ne raisonne pas en pixels. */
const portrait_mm = (l) => `<span class="pc__photo" style="width:${l}mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>`;

const carte_imprimee = ([nom, prenom, gr, col, num]) => `<div class="pc">
  <span class="pc__band" style="background:${col}"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  ${portrait_mm(18)}
  <span class="pc__id">
    <b class="pc__nom">${nom}</b>
    <span class="pc__prenom">${prenom}</span>
    <span class="pc__grade"><i style="background:${col}"></i>${gr}</span>
    <span class="pc__num">${num}</span>
  </span>
  <span class="pc__qr">${faux_qr()}</span>
</div>`;

screen('impression', '15 · Planche d’impression', { wide: true, full: `
  <div class="sheet impr">
    <div class="impr__intro">
      <div style="display:flex;flex-direction:column;gap:8px">
        ${overline('Impression des cartes')}
        <h1 class="display" style="font-size:28px;line-height:34px">Dix cartes par page A4</h1>
        <p style="font-size:15px;line-height:24px;color:#59685F;max-width:560px">Format <b>85,6 × 54 mm</b>, celui d’une carte bancaire : les étuis, porte-badges et cordons du commerce sont à cette taille, et la carte entre dans un portefeuille. Deux colonnes de cinq, avec des traits de coupe.</p>
      </div>
      <div class="impr__actions">
        <button class="btn btn--primary" data-action="imprimer" style="width:auto;padding:0 20px">Imprimer ou enregistrer en PDF</button>
        <p class="impr__note">La page ci-dessous s’imprime seule : l’index, le menu et cette explication ne partent pas à l’impression.</p>
      </div>
    </div>

    <div class="planche-cadre"><div class="planche">
      <div class="planche__grille">
        ${ELEVES_PLANCHE.map(carte_imprimee).join('\n        ')}
      </div>
      <span class="planche__pied">Kwoon Analamahitsy · planche de 10 cartes · maquette</span>
    </div></div>

    <div class="impr__zoom">
      ${overline('La carte en détail')}
      <div class="impr__duo">
        <div>
          <p class="impr__lab">Recto — grandeur réelle</p>
          ${carte_imprimee(ELEVES_PLANCHE[0])}
        </div>
        <div>
          <p class="impr__lab">Verso — proposition</p>
          <div class="pc pc--verso">
            <span class="pc__band" style="background:#0F5132"></span>
            <span class="pcv__titre">Kwoon Analamahitsy</span>
            <span class="pcv__txt">Cette carte est personnelle. Elle est présentée à chaque entraînement pour pointer la présence.</span>
            <span class="pcv__txt">Perte ou vol : prévenir le responsable du club, la carte sera remplacée et le code renouvelé.</span>
            <span class="pcv__contact">[TÉLÉPHONE DU CLUB] · Analamahitsy, Antananarivo</span>
          </div>
        </div>
      </div>
      <p style="font-size:13px;line-height:21px;color:#59685F;max-width:560px">Le verso reste à décider : on peut y mettre le règlement, les horaires, ou le laisser vide pour imprimer en recto seul — c’est deux fois moins cher.</p>
    </div>
  </div>` });

/* ---------------------------------------------- Écriture */
const wrap = (def) => def.full
  ? def.full
  : `<div class="phone">\n  ${def.body}\n  ${tabbar(def.tab)}\n</div>`;

const out = `/* ============================================================
   screens.js — GÉNÉRÉ par build-screens.mjs. Ne pas modifier ici :
   toute correction se fait dans build-screens.mjs puis
       node build-screens.mjs
   ============================================================ */

const SCREENS = {
${Object.entries(S).map(([key, def]) =>
  `  ${key}: {\n    label: ${JSON.stringify(def.label)},${def.wide ? '\n    wide: true,' : ''}\n    html: \`${wrap(def).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`\n  }`).join(',\n')}
};
`;

mkdirSync('js', { recursive: true });
writeFileSync('js/screens.js', out);
console.log(`js/screens.js — ${Object.keys(S).length} écrans, ${(Buffer.byteLength(out) / 1024).toFixed(0)} Ko`);
