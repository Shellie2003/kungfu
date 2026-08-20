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
  martial: '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/>'
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

const TABS = [
  ['home', 'Accueil', 'home', 'accueil'],
  ['students', 'Étudiants', 'users', 'etudiants'],
  ['news', 'Casier', 'news', 'casier'],
  ['album', 'Album', 'album', 'album'],
  ['club', 'Le Club', 'shield', 'club']
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
          <span class="input">WA-0042</span></label>
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
        <p style="font-size:14px;line-height:22px;color:#59685F;margin-top:8px">Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière. Entraînements trois fois par semaine à Analamahitsy.</p>
        <button class="linkrow" data-go="club">En savoir plus sur le club ${svg('chev', 16, '#12613C', 2)}</button>
      </div>
    </div>

    <div class="stats">
      ${[['64', 'membres'], ['3', 'séances / sem.'], ['2014', 'fondé en']].map(([n, l]) =>
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
        ${[['Nom', 'RAKOTONDRABE'], ['Prénom', 'Nirina'], ['Date de naissance', '14 mars 2006'], ['Numéro de membre', 'WA-0042'], ['Début d’entraînement', '9 septembre 2019'], ['Grade', 'Ceinture verte']]
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
      ${btn('J’y participe')}
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
screen('club', '10 · Le Club', { tab: 'club', body: `
  ${header('Le Club')}

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
      ${overline('Entraînements')}
      ${card(`<div class="deflist">
        ${[['Lundi', '17h30 – 19h00', 'Tous niveaux'], ['Mercredi', '17h30 – 19h00', 'Débutants'], ['Samedi', '09h00 – 11h00', 'Gradés']]
          .map(([j, h, n]) => `<div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">${j}</span><span style="flex-grow:1;color:#3C4A42">${h}</span><b style="font-size:12px;color:#7C8B82;font-weight:400">${n}</b></div>`).join('\n        ')}
      </div>`, 16)}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${overline('Contact')}
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
          <label class="field"><span class="field__label">Numéro de membre</span><span class="input">WA-0042</span></label>
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
        ${[['64', 'membres'], ['3', 'séances'], ['186', 'photos']].map(([n, l]) => `<div class="dirB__glass">
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
            <span class="carte__num">WA-0042</span>
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
    ['carte', 'Carte de membre', 'Photo, numéro, grade et code de présence', 'carte']
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
