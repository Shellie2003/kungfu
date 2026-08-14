/* ============================================================
   screens-core.js — Écrans 01 à 16 + séance
   Identité, accueils, module Arts martiaux
   ============================================================ */

const SCREENS = {};
const screen = (key, def) => { SCREENS[key] = def; };

/* ============================================================
   01. Splash — identité du monastère
   ============================================================ */
screen('splash', {
  label: '01 · Splash',
  chrome: false,
  render: () => `
  <div class="screen" style="justify-content:center;align-items:center;gap:var(--s-6);
       background:var(--surface-ink);color:var(--text-on-ink);text-align:center;padding:var(--gutter)">
    <div class="seal seal--lg stamp" style="width:96px;height:96px;font-size:40px">龍</div>
    <div class="stack gap-2" style="align-items:center">
      <h1 class="display" style="color:var(--gold-bright);letter-spacing:0.04em">LONG SHAN</h1>
      <p class="overline" style="color:var(--text-on-ink-dim)">${MONASTERY.subtitle}</p>
    </div>
    <div class="rule" style="width:160px;color:rgba(198,161,91,.35)"><i></i></div>
    <p class="sub" style="color:var(--text-on-ink-dim);font-family:var(--font-display);font-style:italic">
      « ${MONASTERY.maxim} »</p>
    <div class="row gap-2 dim" style="position:absolute;bottom:56px;font-size:12px">
      <span class="spin" style="width:14px;height:14px;display:block">${icon.sync}</span>
      Préparation de l’espace…
    </div>
  </div>`
});

/* ============================================================
   02. Connexion — inclut un état d'erreur de champ
   ============================================================ */
screen('login', {
  label: '02 · Connexion',
  chrome: false,
  render: () => `
  <div class="screen scroll" style="padding:var(--s-12) var(--gutter) var(--s-8)">
    <div class="stack gap-3" style="align-items:center;text-align:center">
      <div class="seal seal--md">龍</div>
      <h1 class="title mt-2">Long Shan</h1>
      <p class="sub">Entrez pour rejoindre le monastère.</p>
    </div>

    <div class="stack gap-4 mt-8">
      <label class="field">
        <span class="field__label">Identifiant</span>
        <input class="input" value="maitre.chen" autocomplete="username">
      </label>
      <div class="field field--error">
        <span class="field__label">Mot de passe</span>
        <div class="row gap-2">
          <input class="input" type="password" value="••••••••" autocomplete="current-password">
          <button class="iconbtn" aria-label="Afficher">${icon.eye}</button>
        </div>
        <span class="field__error">${icon.alert} Mot de passe incorrect. 2 essais restants.</span>
      </div>
      <button class="btn btn--primary btn--block" data-nav="homeMaster">Entrer</button>
      <button class="btn btn--ghost btn--block btn--sm">Mot de passe oublié</button>
    </div>

    <div class="rule mt-8"><i></i></div>
    <p class="caption mt-4" style="text-align:center">Choisir un espace de démonstration</p>
    <div class="stack gap-2 mt-3">
      ${[['homeMaster', 'Espace Maître', 'Maître Ravaka'],
         ['homeAdmin', 'Espace Administrateur', 'Intendance'],
         ['homeStudent', 'Espace Élève', 'Rakoto Andry']].map(([to, t, s]) => `
        <button class="card card--tap row gap-3" data-nav="${to}">
          <span class="seal seal--sm seal--ink">${icon.seal}</span>
          <span class="grow"><span class="item__title" style="display:block">${t}</span>
          <span class="item__sub" style="display:block">${s}</span></span>
          <span class="chevron">${icon.chev}</span>
        </button>`).join('')}
    </div>
  </div>`
});

/* ---------------------------------------------- Fragments partagés */

/** En-tête d'accueil : salutation, date, maxime. */
function homeHeader(name, meta) {
  return `<div class="pad" style="padding-top:var(--s-2)">
    <div class="between">
      <div class="grow">
        <p class="overline">${esc(MONASTERY.todayLabel)}</p>
        <h1 class="title mt-2">Bonjour, ${esc(name)}</h1>
      </div>
      <button class="iconbtn" data-nav="notifications" aria-label="Notifications">
        ${icon.bell}<i class="iconbtn__dot"></i></button>
      <button class="iconbtn" data-nav="search" aria-label="Rechercher">${icon.search}</button>
    </div>
    <p class="sub mt-3" style="font-family:var(--font-display);font-style:italic;color:var(--text-secondary)">
      ${esc(meta)}</p>
  </div>`;
}

/** Composition « Monastère aujourd'hui » — asymétrique, un seul bloc. */
function monasteryPulse() {
  const s = MONASTERY.stats;
  return `<div class="section" style="margin-top:var(--s-6)">
    <div class="ink rise">
      <p class="overline">Monastère aujourd’hui</p>
      <div class="between mt-4" style="align-items:flex-end">
        <div>
          <p class="num" style="font-size:52px;line-height:52px;font-family:var(--font-display)">${s.present}</p>
          <p class="sub mt-2">Élèves présents</p>
        </div>
        ${ring(s.attendance, { size: 84, stroke: 5, color: 'var(--gold-bright)',
          label: `<span class="num" style="font-size:19px;font-family:var(--font-display);color:var(--gold-bright)">${s.attendance}%</span>
                  <span class="caption" style="color:var(--text-on-ink-dim)">semaine</span>` })}
      </div>
      <div class="rule mt-5" style="color:rgba(198,161,91,.25)"><i></i></div>
      <div class="row mt-4" style="gap:var(--s-6)">
        <div><span class="num heading" style="color:var(--text-on-ink)">${s.residents}</span>
          <span class="sub"> Résidents</span></div>
        <div style="width:1px;align-self:stretch;background:rgba(198,161,91,.22)"></div>
        <div><span class="num heading" style="color:var(--gold-bright)">${s.exams}</span>
          <span class="sub"> Examens à venir</span></div>
      </div>
    </div>
  </div>`;
}

/** Bloc dominant « Prochaine activité » — surface papier + sceau. */
function nextActivity(s) {
  return `<div class="section">
    ${sectionHead('Prochaine activité')}
    <div class="card card--paper rise" style="padding:var(--s-5)">
      <div class="row gap-4">
        <span class="seal seal--md">${icon.martial}</span>
        <div class="grow">
          <p class="heading">${esc(s.title)}</p>
          <p class="sub mt-1">${esc(s.group)}</p>
        </div>
      </div>
      <div class="between mt-5" style="align-items:flex-end">
        <div>
          <p class="num display" style="font-size:44px;line-height:44px">${s.time}</p>
          <p class="caption mt-2">${esc(s.dur)} · ${esc(s.place)}</p>
        </div>
        <div class="stack gap-2" style="align-items:flex-end">
          <span class="avatarstack">
            ${['p1', 'p2', 'p6', 'p7'].map((id) => avatar(person(id), 'xs', { one: true })).join('')}
          </span>
          <span class="caption">${s.count} participants</span>
        </div>
      </div>
      <button class="btn btn--primary btn--block mt-5" data-nav="session">Ouvrir la séance</button>
    </div>
  </div>`;
}

/** Timeline de la journée. */
function dayTimeline(limit = null) {
  const rows = limit ? TODAY.slice(0, limit) : TODAY;
  return `<div class="section">
    ${sectionHead('Déroulé de la journée', limit ? { label: 'Tout voir', to: 'planning' } : null)}
    <div class="timeline">${rows.map((t) => tlRow(t)).join('')}</div>
  </div>`;
}

/* ============================================================
   03. Accueil Maître
   ============================================================ */
screen('homeMaster', {
  label: '03 · Accueil maître', tab: 'home',
  render: () => `
  <div class="screen scroll">
    ${homeHeader('Maître Chen', MONASTERY.maxim)}

    <!-- Les chiffres et les visages forment un seul ensemble : le bloc
         d'encre donne l'état du monastère, le rail donne qui le compose. -->
    ${monasteryPulse()}
    ${railBlock({
      overline: 'Qui est là aujourd’hui',
      action: { label: 'Communauté', to: 'community' },
      filters: RAIL_FILTERS,
      id: 'members',
      cards: memberRailCards('present')
    })}

    ${nextActivity(SESSIONS[0])}

    ${railBlock({
      overline: 'Vos séances du jour',
      action: { label: 'Planning', to: 'trainings' },
      cards: [SESSIONS[0], SESSIONS[1], SESSIONS[2]].map(sessionCard).join('')
    })}

    <div class="section">
      ${sectionHead('À suivre')}
      <div class="stack gap-3">
        <button class="card card--tap row gap-3" data-nav="exams">
          <span class="seal seal--sm seal--gold">${icon.belt}</span>
          <span class="grow">
            <span class="item__title" style="display:block">3 élèves prêts pour l’examen</span>
            <span class="item__sub" style="display:block">Jaune → Orange · 15 août</span>
          </span>
          <span class="chevron">${icon.chev}</span>
        </button>
        <button class="card card--tap row gap-3" data-nav="students"
                style="border-color:color-mix(in srgb, var(--accent) 34%, transparent)">
          <span class="seal seal--sm">${icon.alert}</span>
          <span class="grow">
            <span class="item__title" style="display:block">2 élèves absents depuis 3 séances</span>
            <span class="item__sub" style="display:block">Rabe Jean · Randria Paul</span>
          </span>
          <span class="chevron">${icon.chev}</span>
        </button>
      </div>
    </div>

    ${dayTimeline(5)}

    <div class="section" style="margin-bottom:var(--s-8)">
      ${sectionHead('Actions rapides')}
      <div class="row wrap gap-2">
        ${[['Présence', 'attendance'], ['Évaluer', 'evaluate'],
           ['Progression', 'journey'], ['Annonce', null]].map(([l, to]) => `
          <button class="btn btn--outline btn--sm" ${to ? `data-nav="${to}"` : 'data-action="toast"'}>${l}</button>`).join('')}
      </div>
    </div>
  </div>`
});

/* ============================================================
   04. Accueil Administrateur
   ============================================================ */
screen('homeAdmin', {
  label: '04 · Accueil admin', tab: 'home',
  render: () => `
  <div class="screen scroll">
    ${homeHeader('Intendance', 'Ce qui est bien rangé se trouve sans chercher.')}

    <div class="section" style="margin-top:var(--s-6)">
      <div class="ink rise">
        <p class="overline">Solde du mois</p>
        <p class="num display mt-3" style="color:var(--gold-bright)">2 110 000 <span style="font-size:20px">Ar</span></p>
        <div class="row gap-5 mt-5">
          <div><p class="caption">Revenus</p><p class="num heading" style="color:var(--text-on-ink)">4 850 000</p></div>
          <div style="width:1px;align-self:stretch;background:rgba(198,161,91,.22)"></div>
          <div><p class="caption">Dépenses</p><p class="num heading" style="color:var(--text-on-ink)">2 740 000</p></div>
        </div>
        <button class="btn btn--gold btn--block mt-5" data-nav="finance">Voir les finances</button>
      </div>
    </div>

    <div class="section">
      ${sectionHead('À traiter aujourd’hui')}
      <div class="list list--card">
        ${item({ lead: `<span class="seal seal--sm">${icon.alert}</span>`,
          title: '2 stocks sous le seuil', sub: 'Huile · Légumineuses', to: 'stock' })}
        ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.bowl}</span>`,
          title: 'Déjeuner à confirmer', sub: '62 personnes prévues', to: 'meals' })}
        ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.bed}</span>`,
          title: 'Chambre B204 en entretien', sub: 'Depuis 4 jours', to: 'rooms' })}
        ${item({ lead: `<span class="seal seal--sm seal--gold">${icon.coin}</span>`,
          title: '4 cotisations en retard', sub: `${DUES_SUMMARY.pending.toLocaleString('fr-FR').replace(/,/g, ' ')} Ar attendus`, to: 'dues' })}
      </div>
    </div>

    ${railBlock({
      overline: 'Résidents et personnel',
      action: { label: 'Communauté', to: 'community' },
      cards: PEOPLE.filter((p) => ['Moine', 'Personnel', 'Visiteur'].includes(p.role))
        .map((p) => memberCard(p)).join('') + moreCard('Toute la communauté', 'community')
    })}

    <div class="section">
      ${sectionHead('Occupation', { label: 'Chambres', to: 'rooms' })}
      <div class="card">
        <div class="between"><p class="body">Places occupées</p>
          <p class="num heading">17 <span class="sub">/ 26</span></p></div>
        ${bar(65, 'bar__fill--wood')}
        <p class="caption mt-3">9 places disponibles · 1 chambre en entretien</p>
      </div>
    </div>

    <div class="section" style="margin-bottom:var(--s-8)">
      ${sectionHead('Prochain événement', { label: 'Tout voir', to: 'events' })}
      <button class="card card--tap card--paper" data-nav="events">
        <div class="between">
          <div><p class="overline">Cérémonie</p>
            <p class="heading mt-2">Cérémonie des ceintures</p>
            <p class="sub mt-1">15 août · 17:00 · Grande salle</p></div>
          <span class="seal seal--sm seal--gold">${icon.belt}</span>
        </div>
      </button>
    </div>
  </div>`
});

/* ============================================================
   05. Accueil Élève — volontairement plus simple
   ============================================================ */
screen('homeStudent', {
  label: '05 · Accueil élève', tab: 'home',
  render: () => {
    const p = person('p1');
    return `
    <div class="screen scroll">
      ${homeHeader('Andry', 'Chaque séance vaut mieux qu’une promesse.')}

      <div class="section" style="margin-top:var(--s-6)">
        <div class="ink rise" style="text-align:center">
          <div class="stack gap-4" style="align-items:center">
            ${ring(p.progress, { size: 132, stroke: 7, color: 'var(--gold-bright)',
              label: `<span class="stack" style="align-items:center;gap:2px">
                <span class="num" style="font-size:34px;font-family:var(--font-display);color:var(--gold-bright)">${p.progress}%</span>
                <span class="caption" style="color:var(--text-on-ink-dim)">progression</span></span>` })}
            <div>
              <p class="title" style="color:var(--text-on-ink)">${esc(p.name)}</p>
              <div class="row gap-2 mt-2" style="justify-content:center">
                <span class="belt"><i class="belt__disc" style="--belt:${p.beltColor}"></i>
                  <span class="belt__label" style="color:var(--gold-bright)">Ceinture jaune</span></span>
              </div>
            </div>
          </div>
          <div class="rule mt-5" style="color:rgba(198,161,91,.25)"><i></i></div>
          <div class="row mt-4" style="justify-content:space-around">
            <div><p class="num heading" style="color:var(--text-on-ink)">${p.sessions}</p><p class="caption">séances</p></div>
            <div><p class="num heading" style="color:var(--text-on-ink)">${p.attendance}%</p><p class="caption">présence</p></div>
            <div><p class="num heading" style="color:var(--text-on-ink)">${p.techniques}</p><p class="caption">techniques</p></div>
          </div>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Prochain entraînement')}
        <div class="card card--paper">
          <div class="between">
            <div><p class="heading">Kung-Fu intermédiaire</p>
              <p class="sub mt-1">Aujourd’hui · Cour d’honneur</p></div>
            <p class="num display" style="font-size:32px">16:00</p>
          </div>
          <button class="btn btn--accent btn--block mt-4" data-action="toast">Confirmer ma présence</button>
        </div>
      </div>

      ${railBlock({
        overline: 'Mon groupe',
        action: { label: 'Voir tout', to: 'students' },
        cards: [person('p12')].concat(
          STUDENTS.filter((s) => s.level === 'Intermédiaire')
        ).map((p) => memberCard(p)).join('')
      })}

      <div class="section">
        ${sectionHead('Prochaine étape')}
        <button class="card card--tap row gap-3" data-nav="journey">
          <span class="seal seal--sm seal--gold">${icon.flag}</span>
          <span class="grow"><span class="item__title" style="display:block">Examen Jaune → Orange</span>
            <span class="item__sub" style="display:block">Dans 2 jours · 4 techniques à revoir</span></span>
          <span class="chevron">${icon.chev}</span>
        </button>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        <div class="stack gap-2">
          ${[['Mon programme', 'techniques'], ['Mon parcours', 'journey'],
             ['Mes présences', 'attendance'], ['Mes paiements', 'dues']].map(([l, to]) => `
            <button class="card card--tap card--flat between" data-nav="${to}">
              <span class="item__title">${l}</span><span class="chevron">${icon.chev}</span>
            </button>`).join('')}
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   06. Planning quotidien
   ============================================================ */
screen('planning', {
  label: '06 · Planning', tab: 'temple',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Planning', back: 'homeMaster',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Ajouter">${icon.plus}</button>` })}
    <div class="pad">
      <div class="segmented"><button aria-pressed="true">Jour</button>
        <button aria-pressed="false">Semaine</button><button aria-pressed="false">Mois</button></div>
    </div>
    <div class="filters">
      ${['Jeu 13', 'Ven 14', 'Sam 15', 'Dim 16', 'Lun 17'].map((d, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${d}</button>`).join('')}
    </div>
    <div class="scroll">
      <div class="section" style="margin-top:0">
        <div class="timeline">${TODAY.map((t) => tlRow({ ...t, to: t.to || null })).join('')}</div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Demain')}
        <div class="timeline">
          ${tlRow({ time: '05:30', title: 'Méditation', meta: 'Salle du Silence', state: 'locked' })}
          ${tlRow({ time: '07:00', title: 'Formes traditionnelles', meta: 'Tous niveaux · 31 élèves', state: 'locked' })}
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   07. Liste des élèves
   ============================================================ */
screen('students', {
  label: '07 · Élèves', tab: 'martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Élèves', back: 'martial',
      actions: `<button class="iconbtn" data-nav="search" aria-label="Rechercher">${icon.search}</button>` })}
    <div class="filters">
      ${['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Absents'].map((f, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
    </div>
    <div class="scroll">
      <p class="caption pad">${STUDENTS.length} élèves · triés par progression</p>
      <div class="section" style="margin-top:var(--s-3);margin-bottom:var(--s-8)">
        <div class="list list--card">
          ${[...STUDENTS].sort((a, b) => b.progress - a.progress).map((p) => item({
            lead: avatar(p, 'md'),
            title: esc(p.name),
            sub: `${p.beltName} · ${p.sessions} séances`,
            end: `<span class="stack" style="align-items:flex-end;gap:4px">
                    <span class="num sub">${p.progress}%</span>
                    <span style="width:44px">${bar(p.progress)}</span></span>`,
            to: 'student'
          })).join('')}
        </div>
      </div>
    </div>
    <button class="fab" data-action="sheet" aria-label="Ajouter un élève">${icon.plus}</button>
  </div>`
});

/* ============================================================
   08. Profil élève
   ============================================================ */
screen('student', {
  label: '08 · Profil élève',
  render: () => {
    const p = person('p1');
    return `
    <div class="screen">
      ${appbar({ title: '', back: 'students', flush: true,
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Options">${icon.dots}</button>` })}
      <div class="scroll">
        <div class="pad stack gap-4" style="align-items:center;text-align:center">
          <span class="avatar avatar--lg avatar--ringed" style="--ring:${p.beltColor}">${initials(p.name)}</span>
          <div>
            <h1 class="title">${esc(p.name)}</h1>
            <div class="row gap-2 mt-2" style="justify-content:center">
              ${badge(p.role)}${badge(p.level, 'outline')}
            </div>
          </div>
        </div>

        <div class="section" style="margin-top:var(--s-6)">
          <div class="card card--paper">
            <div class="between">
              <div>
                <p class="overline overline--gold">Grade actuel</p>
                <p class="title mt-2">Ceinture jaune</p>
                <p class="caption mt-1">Obtenue le 12 mars 2026</p>
              </div>
              ${ring(p.progress, { size: 72, stroke: 5,
                label: `<span class="num" style="font-size:16px;font-family:var(--font-display)">${p.progress}%</span>` })}
            </div>
            <div class="rule mt-5"><i></i></div>
            <p class="sub mt-4">Progression vers la <b>ceinture orange</b></p>
            <div class="mt-2">${bar(p.progress)}</div>
          </div>
        </div>

        <div class="section">
          ${sectionHead('Assiduité')}
          <div class="card">
            <div class="between">
              <div><p class="num display" style="font-size:34px">${p.attendance}%</p>
                <p class="caption">présence sur 12 semaines</p></div>
              <div class="chart" style="width:150px;height:64px">
                ${[80, 92, 75, 100, 87, 90, 83].map((v) => `
                  <div class="chart__col"><div class="chart__stack">
                    <div class="chart__seg chart__seg--in" style="height:${v}%"></div></div></div>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="row gap-3">
            <div class="card grow" style="text-align:center">
              <p class="num title">${p.sessions}</p><p class="caption mt-1">entraînements</p></div>
            <div class="card grow" style="text-align:center">
              <p class="num title">${p.techniques}</p><p class="caption mt-1">techniques maîtrisées</p></div>
          </div>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          <div class="list list--card">
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.flag}</span>`,
              title: 'Parcours martial', sub: '6 étapes · prochaine dans 2 jours', to: 'journey' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.martial}</span>`,
              title: 'Techniques', sub: '7 maîtrisées · 5 à travailler', to: 'techniques' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.calendar}</span>`,
              title: 'Présences', sub: '42 séances suivies', to: 'attendance' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.coin}</span>`,
              title: 'Cotisations', sub: 'À jour · 25 000 Ar / mois', to: 'finance' })}
          </div>
          <button class="btn btn--gold btn--block mt-4" data-nav="evaluate">Évaluer cet élève</button>
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   09. Parcours martial
   ============================================================ */
screen('journey', {
  label: '09 · Parcours martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Parcours martial', back: 'student' })}
    <div class="scroll">
      <div class="pad">
        <div class="ink">
          <p class="overline">Rakoto Andry</p>
          <p class="title mt-3" style="color:var(--text-on-ink)">2 ans, 5 mois au monastère</p>
          <p class="sub mt-2">42 entraînements · 1 grade obtenu · 1 examen à venir</p>
        </div>
      </div>
      <div class="section">
        <div class="timeline">
          ${JOURNEY.map((s) => tlRow({ ...s, to: 'gradeDetail' })).join('')}
        </div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        <div class="card card--sunken" style="text-align:center">
          <p class="sub" style="font-family:var(--font-display);font-style:italic">
            « Le chemin se mesure en pas, non en promesses. »</p>
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   10. Grades
   ============================================================ */
screen('grades', {
  label: '10 · Grades', tab: 'martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Grades', back: 'martial',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Personnaliser">${icon.gear}</button>` })}
    <div class="scroll">
      <p class="sub pad">Système de grades du monastère — 7 niveaux, personnalisable.</p>
      <div class="section" style="margin-top:var(--s-5);margin-bottom:var(--s-8)">
        <div class="timeline">
          ${BELTS.map((b, i) => {
            const state = i < 1 ? 'done' : i === 1 ? 'milestone' : i === 2 ? 'now' : 'locked';
            const counts = [6, 18, 12, 7, 3, 1, 1][i];
            return `<button class="tl tl--${state}" data-nav="gradeDetail" style="text-align:left;width:100%">
              <span class="tl__time"><i class="belt__disc" style="--belt:${b.color};width:14px;height:14px;display:inline-block"></i></span>
              <span class="tl__rail"><i class="tl__node"></i></span>
              <span class="tl__body">
                <span class="tl__title" style="display:block">${b.name}</span>
                <span class="tl__meta" style="display:block">${counts} élèves · ${3 + i * 2} techniques requises</span>
              </span></button>`;
          }).join('')}
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   11. Détail d'un grade
   ============================================================ */
screen('gradeDetail', {
  label: '11 · Détail grade',
  render: () => `
  <div class="screen">
    ${appbar({ title: '', back: 'grades', flush: true })}
    <div class="scroll">
      <div class="pad stack gap-4" style="align-items:center;text-align:center">
        <span class="seal seal--lg" style="background:${beltOf('orange').color}">${icon.belt}</span>
        <div>
          <p class="overline overline--gold">Grade 3 sur 7</p>
          <h1 class="title mt-2">Ceinture orange</h1>
          <p class="sub mt-1">Durée moyenne : 10 mois</p>
        </div>
      </div>

      <div class="section">
        <div class="card card--paper">
          <div class="between"><p class="overline">Votre progression</p>
            <span class="num heading">66%</span></div>
          <div class="mt-3">${bar(66)}</div>
          <p class="caption mt-3">4 techniques et 1 forme restantes avant le passage.</p>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Conditions de passage')}
        <div class="list list--card">
          ${[['Techniques requises', '9 techniques', 66, 'techniques'],
             ['Formes', 'Lian Huan Quan', 80, 'techniques'],
             ['Niveau de combat', 'Assaut souple, 3 reprises', 50, null],
             ['Discipline', 'Aucun manquement sur 6 mois', 100, null],
             ['Théorie', '12 principes fondamentaux', 45, null],
             ['Assiduité', 'Minimum 80 % sur 6 mois', 87, null]].map(([t, s, v, to]) => item({
            title: esc(t), sub: esc(s), to,
            end: `<span class="stack" style="align-items:flex-end;gap:4px">
                    <span class="num sub">${v}%</span>
                    <span style="width:44px">${bar(v, v === 100 ? 'bar__fill--positive' : '')}</span></span>`
          })).join('')}
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Élèves à ce grade')}
        <div class="row gap-3">
          <span class="avatarstack">${['p6', 'p7'].map((id) => avatar(person(id), 'sm')).join('')}</span>
          <span class="sub">12 élèves portent ce grade</span>
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   12. Techniques (et formes)
   ============================================================ */
screen('techniques', {
  label: '12 · Techniques', tab: 'martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Techniques', back: 'martial' })}
    <div class="tabs">
      <button class="tab" aria-selected="true">Techniques</button>
      <button class="tab" aria-selected="false">Formes</button>
      <button class="tab" aria-selected="false">Théorie</button>
    </div>
    <div class="filters">
      ${['Toutes', 'Position', 'Frappe', 'Jambe', 'Contrôle'].map((f, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
    </div>
    <div class="scroll">
      <div class="section" style="margin-top:0">
        ${sectionHead('Maîtrisées — 7')}
        <div class="list list--card">
          ${TECHNIQUES.filter((t) => t.mastered).map((t) => item({
            lead: `<span class="seal seal--sm seal--ink" style="font-size:12px">${t.name[0]}</span>`,
            title: `${esc(t.name)} <span class="dim" style="font-weight:400">· ${esc(t.fr)}</span>`,
            sub: `${esc(t.cat)} · ceinture ${beltOf(t.belt).name.toLowerCase()}`,
            end: `<span style="color:var(--positive);width:18px;height:18px;display:block">${icon.check}</span>`
          })).join('')}
        </div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('À travailler — 5')}
        <div class="list list--card">
          ${TECHNIQUES.filter((t) => !t.mastered).map((t) => item({
            lead: `<span class="avatar avatar--sm" style="font-size:12px">${t.name[0]}</span>`,
            title: `${esc(t.name)} <span class="dim" style="font-weight:400">· ${esc(t.fr)}</span>`,
            sub: `${esc(t.cat)} · ceinture ${beltOf(t.belt).name.toLowerCase()}`,
            to: 'gradeDetail'
          })).join('')}
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   13. Entraînements
   ============================================================ */
screen('trainings', {
  label: '13 · Entraînements', tab: 'martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Entraînements', back: 'martial',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Filtrer">${icon.filter}</button>` })}
    <div class="scroll">
      <div class="section" style="margin-top:var(--s-4)">
        ${sectionHead('Aujourd’hui')}
        <div class="stack gap-3">
          ${SESSIONS.filter((s) => !s.day).map((s) => `
            <button class="card card--tap" data-nav="session">
              <div class="row gap-4">
                <span class="stack" style="width:52px">
                  <span class="num heading">${s.time}</span>
                  <span class="caption">${s.dur}</span>
                </span>
                <span class="grow stack gap-1">
                  <span class="row gap-2">
                    <span class="item__title">${esc(s.title)}</span>
                    ${s.state === 'now' ? badge('En cours', 'accent') : ''}
                    ${s.state === 'done' ? badge('Terminé', 'positive') : ''}
                  </span>
                  <span class="item__sub">${esc(s.master)} · ${esc(s.place)}</span>
                </span>
                <span class="stack" style="align-items:flex-end">
                  <span class="num heading">${s.count}</span>
                  <span class="caption">élèves</span>
                </span>
              </div>
            </button>`).join('')}
        </div>
      </div>
      <div class="section">
        ${sectionHead('Groupes')}
        <div class="list list--card">
          ${GROUPS.map((g) => item({
            lead: `<span class="seal seal--sm seal--ink">${icon.users}</span>`,
            title: esc(g.name), sub: esc(g.slots),
            end: `<span class="num sub">${g.members}</span>`, to: 'students'
          })).join('')}
        </div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Demain')}
        <div class="list list--card">
          ${item({ lead: `<span class="stack" style="width:44px"><span class="num heading">07:00</span></span>`,
            title: 'Formes traditionnelles', sub: 'Tous niveaux · Terrasse nord',
            end: `<span class="num sub">31</span>`, to: 'session' })}
        </div>
      </div>
    </div>
    <button class="fab" data-action="sheet" aria-label="Créer une séance">${icon.plus}</button>
  </div>`
});

/* ============================================================
   Séance (ouverte depuis l'accueil / la timeline)
   ============================================================ */
screen('session', {
  label: '· Détail séance',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Séance', back: 'trainings',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Options">${icon.dots}</button>` })}
    <div class="scroll">
      <div class="pad">
        <div class="ink">
          <p class="overline">En cours</p>
          <p class="title mt-3" style="color:var(--text-on-ink)">Kung-Fu intermédiaire</p>
          <p class="sub mt-2">16:00 – 17:30 · Cour d’honneur · Maître Ravaka</p>
          <div class="row mt-5 gap-5">
            <div><p class="num heading" style="color:var(--gold-bright)">21</p><p class="caption">présents</p></div>
            <div><p class="num heading" style="color:var(--text-on-ink)">3</p><p class="caption">absents</p></div>
            <div><p class="num heading" style="color:var(--text-on-ink)">88%</p><p class="caption">taux</p></div>
          </div>
        </div>
      </div>
      <div class="section">
        ${sectionHead('Programme de la séance')}
        <div class="timeline">
          ${tlRow({ time: '16:00', title: 'Échauffement', meta: '15 min', state: 'done' })}
          ${tlRow({ time: '16:15', title: 'Positions fondamentales', meta: 'Ma Bu · Gong Bu · Xie Bu', state: 'done' })}
          ${tlRow({ time: '16:35', title: 'Forme Wu Bu Quan', meta: '18 mouvements', state: 'now' })}
          ${tlRow({ time: '17:05', title: 'Assauts souples', meta: '3 reprises', state: 'next' })}
          ${tlRow({ time: '17:25', title: 'Retour au calme', meta: '5 min', state: 'locked' })}
        </div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        <div class="row gap-3">
          <button class="btn btn--primary grow" data-nav="attendance">Présences</button>
          <button class="btn btn--outline grow" data-nav="evaluate">Évaluer</button>
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   14. Présence — interface la plus rapide de l'app
   ============================================================ */
screen('attendance', {
  label: '14 · Présence',
  render: () => {
    const present = ROLL.filter((r) => r.present).length;
    const rate = Math.round((present / ROLL.length) * 100);
    return `
    <div class="screen">
      ${appbar({ title: 'Présence', back: 'session',
        actions: `<button class="iconbtn" data-action="sheet" aria-label="QR Code">${icon.qr}</button>` })}
      <div class="pad">
        <div class="card card--paper">
          <div class="between">
            <div><p class="overline">Kung-Fu intermédiaire · 16:00</p>
              <p class="title mt-2"><span class="num" data-roll-count>${present}</span>
                <span class="sub"> / ${ROLL.length} présents</span></p></div>
            <p class="num display" style="font-size:30px;color:var(--gold-text)" data-roll-rate>${rate}%</p>
          </div>
          <div class="mt-4" data-roll-bar>${bar(rate, 'bar__fill--positive')}</div>
        </div>
      </div>
      <!-- Avec 48 élèves inscrits, faire défiler pour trouver un nom
           coûte plus cher que de le taper : l'appel se filtre. -->
      <div class="pad mt-4">
        <div class="searchbar">${icon.search}
          <input data-roll-search autocomplete="off" placeholder="Filtrer par nom"
                 aria-label="Filtrer la liste d’appel">
        </div>
      </div>

      <div class="section" style="margin-top:var(--s-5)">
        <div class="between mb-2" style="margin-bottom:var(--s-3)">
          <p class="overline">Appel</p>
          <button class="section__action" data-action="rollAll">Tout cocher</button>
        </div>
        <div class="list list--card" data-roll>
          ${ROLL.map((r) => {
            const p = person(r.id);
            return `<button class="check" role="checkbox" aria-checked="${r.present}" data-roll-id="${r.id}">
              <span class="check__box">${icon.check}</span>
              ${avatar(p, 'sm')}
              <span class="grow">
                <span class="check__name item__title" style="display:block">${esc(p.name)}</span>
                <span class="item__sub" style="display:block">${p.beltName} · ${p.attendance}% de présence</span>
              </span>
            </button>`;
          }).join('')}
        </div>
        <p class="caption mt-4" style="text-align:center" data-roll-empty hidden>
          Aucun élève ne correspond à ce nom.</p>
      </div>
      <div class="section mt-4" style="margin-bottom:var(--s-8)">
        <div class="card card--sunken row gap-3">
          <span class="seal seal--sm seal--ink">${icon.qr}</span>
          <span class="grow"><span class="item__title" style="display:block">Code de séance</span>
            <span class="item__sub" style="display:block">Les élèves peuvent scanner pour s’enregistrer</span></span>
          <span class="num heading" style="letter-spacing:.12em">7 4 2 9</span>
        </div>
        <button class="btn btn--primary btn--block mt-4" data-action="toast">Valider l’appel</button>
      </div>
    </div>`;
  }
});

/* ============================================================
   15. Examens
   ============================================================ */
screen('exams', {
  label: '15 · Examens', tab: 'martial',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Examens', back: 'martial',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Créer">${icon.plus}</button>` })}
    <div class="scroll">
      <div class="pad" style="padding-top:var(--s-2)">
        <div class="ink">
          <p class="overline">Prochain examen · dans 2 jours</p>
          <div class="row gap-3 mt-4" style="align-items:center">
            <span class="belt__disc" style="--belt:${beltOf('jaune').color};width:18px;height:18px"></span>
            <span class="title" style="color:var(--text-on-ink)">Jaune</span>
            <span class="dim">→</span>
            <span class="belt__disc" style="--belt:${beltOf('orange').color};width:18px;height:18px"></span>
            <span class="title" style="color:var(--gold-bright)">Orange</span>
          </div>
          <p class="sub mt-3">${EXAM.date} · ${EXAM.time} · ${EXAM.place}</p>
          <div class="rule mt-5" style="color:rgba(198,161,91,.25)"><i></i></div>
          <div class="between mt-4">
            <div class="row gap-3">
              <span class="avatarstack">${['p1', 'p2', 'p6'].map((id) => avatar(person(id), 'xs', { one: true })).join('')}</span>
              <span class="sub">${EXAM.candidates} candidats</span>
            </div>
            <span class="sub">Jury : 2 maîtres</span>
          </div>
          <button class="btn btn--gold btn--block mt-5" data-nav="evaluate">Préparer l’évaluation</button>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Épreuves')}
        <div class="list list--card">
          ${EXAM.trials.map((t) => item({
            title: esc(t.name), sub: `Coefficient ${t.weight} %`,
            end: `<span class="chevron">${icon.chev}</span>`
          })).join('')}
        </div>
      </div>

      <div class="section">
        ${sectionHead('Candidats')}
        <div class="list list--card">
          ${['p1', 'p2', 'p6'].map((id) => {
            const p = person(id);
            const ready = p.progress >= 74;
            return item({
              lead: avatar(p, 'sm'), title: esc(p.name),
              sub: `Progression ${p.progress}%`,
              end: ready ? badge('Prêt', 'positive') : badge('À revoir', 'warning'),
              to: 'evaluate'
            });
          }).join('')}
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Historique')}
        <div class="list list--card">
          ${item({ title: 'Blanc → Jaune', sub: '12 mars 2026 · 11 candidats',
            end: badge('9 reçus', 'positive') })}
          ${item({ title: 'Orange → Vert', sub: '4 déc. 2025 · 6 candidats',
            end: badge('5 reçus', 'positive') })}
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   16. Évaluation d'un élève
   ============================================================ */
/* L'évaluation était figée : les notes s'affichaient sans pouvoir être
   saisies. Chaque épreuve porte désormais un pas-à-pas, et la moyenne
   comme le verdict se recalculent à chaque appui. */
const examState = { scores: EXAM_SCORES.map((s) => ({ ...s })) };

function examAverage() {
  const t = examState.scores.reduce((a, b) => a + b.score, 0);
  return t / examState.scores.length;
}

/** Bloc note + pas-à-pas, redessiné seul lors d'un changement. */
function scoreRow(s, i) {
  return `<div class="score" data-score-row="${i}">
    <div class="between">
      <span class="body">${esc(s.name)}</span>
      <span class="row gap-2">
        <button class="stepper" data-score="${i}" data-delta="-1"
                aria-label="Diminuer la note de ${esc(s.name)}">−</button>
        <span class="num heading" style="min-width:52px;text-align:center"
              data-score-value="${i}">${s.score}<span class="sub">/20</span></span>
        <button class="stepper" data-score="${i}" data-delta="1"
                aria-label="Augmenter la note de ${esc(s.name)}">+</button>
      </span>
    </div>
    <div class="mt-2" data-score-bar="${i}">${bar(s.score * 5, s.score >= 16 ? 'bar__fill--positive' : s.score < 10 ? 'bar__fill--accent' : '')}</div>
  </div>`;
}

/** Bandeau de moyenne : verdict porté par le texte, pas par la seule couleur. */
function examVerdict() {
  const avg = examAverage();
  const pass = avg >= 12;
  return `<div class="ink between" data-exam-verdict>
    <div><p class="overline">Moyenne générale</p>
      <p class="caption mt-2" style="color:var(--text-on-ink-dim)">Seuil de réussite : 12/20</p>
      <p class="mt-3">${badge(pass ? 'Grade acquis' : 'Sous le seuil', pass ? 'positive' : 'danger')}</p></div>
    <p class="num display" style="color:${pass ? 'var(--gold-bright)' : 'var(--accent-text)'}">${avg.toFixed(1).replace(".", ",")}</p>
  </div>`;
}

screen('evaluate', {
  label: '16 · Évaluation',
  render: () => {
    const p = person('p1');
    return `
    <div class="screen">
      ${appbar({ title: 'Évaluation', back: 'exams',
        actions: `<button class="iconbtn" data-action="scoreReset" aria-label="Réinitialiser les notes">${icon.sync}</button>` })}
      <div class="scroll">
        <div class="pad row gap-3">
          ${avatar(p, 'md')}
          <div class="grow"><p class="heading">${esc(p.name)}</p>
            <p class="sub">Jaune → Orange · Candidat 1 sur 14</p></div>
        </div>

        <div class="section" style="margin-top:var(--s-5)">
          ${sectionHead('Notes par épreuve')}
          <div class="card stack gap-5">
            ${examState.scores.map(scoreRow).join('')}
          </div>
        </div>

        <div class="section">${examVerdict()}</div>

        <div class="section">
          <label class="field">
            <span class="field__label">Observation du maître</span>
            <textarea class="input" rows="3" style="resize:none">Discipline exemplaire. Doit affermir les appuis dans la forme.</textarea>
          </label>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          <button class="btn btn--gold btn--block" data-action="validateGrade">Valider le grade</button>
          <button class="btn btn--ghost btn--block mt-2 btn--sm" data-action="toast">Ajourner le candidat</button>
        </div>
      </div>
    </div>`;
  }
});
