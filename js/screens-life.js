/* ============================================================
   screens-life.js — Hubs + écrans 17 à 30 + états d'interface
   ============================================================ */

/* ============================================================
   Hub — Arts martiaux (« dojo numérique »)
   ============================================================ */
screen('martial', {
  label: '· Arts martiaux', tab: 'martial',
  render: () => `
  <div class="screen scroll">
    <div class="pad" style="padding-top:var(--s-2)">
      <p class="overline">Le dojo</p>
      <h1 class="display mt-2">Arts martiaux</h1>
    </div>

    <div class="section" style="margin-top:var(--s-5)">
      <div class="ink">
        <div class="between">
          <div>
            <p class="overline">Séance en cours</p>
            <p class="heading mt-2" style="color:var(--text-on-ink)">Kung-Fu intermédiaire</p>
            <p class="sub mt-1">16:00 · 21 présents sur 24</p>
          </div>
          <span class="seal seal--md halo">${icon.martial}</span>
        </div>
        <button class="btn btn--gold btn--block mt-5" data-nav="session">Reprendre</button>
      </div>
    </div>

    <div class="section">
      ${sectionHead('Pratique')}
      <div class="list list--card">
        ${[['Élèves', '48 inscrits · 3 groupes', 'students', icon.users],
           ['Maîtres', '1 grand maître · 3 maîtres', 'community', icon.belt],
           ['Groupes', 'Débutant · Intermédiaire · Avancé', 'trainings', icon.users],
           ['Entraînements', '4 séances cette semaine', 'trainings', icon.calendar],
           ['Présences', 'Appel de la séance en cours', 'attendance', icon.check]
          ].map(([t, s, to, ic]) => item({
            lead: `<span class="seal seal--sm seal--ink">${ic}</span>`,
            title: esc(t), sub: esc(s), to
          })).join('')}
      </div>
    </div>

    <div class="section" style="margin-bottom:var(--s-8)">
      ${sectionHead('Transmission')}
      <div class="list list--card">
        ${[['Grades', '7 niveaux · personnalisable', 'grades', icon.belt],
           ['Techniques', '12 techniques référencées', 'techniques', icon.martial],
           ['Formes', '4 formes traditionnelles', 'techniques', icon.book],
           ['Examens', 'Jaune → Orange dans 2 jours', 'exams', icon.flag],
           ['Progression', '3 élèves prêts', 'journey', icon.trend]
          ].map(([t, s, to, ic]) => item({
            lead: `<span class="seal seal--sm seal--ink">${ic}</span>`,
            title: esc(t), sub: esc(s), to
          })).join('')}
      </div>
    </div>
  </div>`
});

/* ============================================================
   17. Communauté
   ============================================================ */
screen('community', {
  label: '17 · Communauté', tab: 'community',
  render: () => {
    const groups = [
      ['Maîtres', PEOPLE.filter((p) => p.role.includes('Maître'))],
      ['Moines', PEOPLE.filter((p) => p.role === 'Moine')],
      ['Élèves', STUDENTS.slice(0, 4)],
      ['Personnel', PEOPLE.filter((p) => p.role === 'Personnel')],
      ['Visiteurs & anciens', PEOPLE.filter((p) => ['Visiteur', 'Ancien élève', 'Donateur'].includes(p.role))]
    ];
    return `
    <div class="screen">
      <div class="pad" style="padding-top:var(--s-2)">
        <div class="between">
          <div><p class="overline">${PEOPLE.length + 51} personnes</p>
            <h1 class="display mt-2">Communauté</h1></div>
          <button class="iconbtn" data-nav="messages" aria-label="Messages">
            ${icon.megaphone}<i class="iconbtn__dot"></i></button>
          <button class="iconbtn" data-nav="search" aria-label="Rechercher">${icon.search}</button>
        </div>
      </div>
      <div class="filters">
        ${['Tous', 'Élèves', 'Moines', 'Maîtres', 'Personnel', 'Résidents'].map((f, i) =>
          `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
      </div>
      <div class="scroll">
        ${groups.map(([label, list]) => `
          <div class="section" style="margin-top:var(--s-6)">
            ${sectionHead(`${label} — ${list.length}`)}
            <div class="list list--card">
              ${list.map((p) => item({
                lead: avatar(p, 'md'),
                title: esc(p.name),
                sub: `${esc(p.level)}${p.resident ? ' · Résident' : ''}`,
                end: p.belt ? `<i class="belt__disc" style="--belt:${p.beltColor}"></i>` : '',
                to: 'member'
              })).join('')}
            </div>
          </div>`).join('')}
        <div style="height:var(--s-8)"></div>
      </div>
      <button class="fab" data-nav="newStudent" aria-label="Admettre un membre">${icon.plus}</button>
    </div>`;
  }
});

/* ============================================================
   Messages — liste des conversations
   ============================================================ */
screen('messages', {
  label: '· Messages', tab: 'community',
  render: () => {
    const unread = CONVERSATIONS.reduce((a, c) => a + c.unread, 0);
    const next = silenceNext();
    return `
    <div class="screen">
      ${appbar({ title: 'Messages', back: 'community',
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Nouvelle conversation">${icon.plus}</button>` })}
      <div class="filters">
        ${['Tous', 'Non lus', 'Canaux', 'Directs'].map((f, i) =>
          `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
      </div>
      <div class="scroll">
        <p class="caption pad">${CONVERSATIONS.length} conversations · ${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}</p>

        <div class="section" style="margin-top:var(--s-4)">
          <div class="list list--card">
            ${CONVERSATIONS.filter((c) => c.kind !== 'direct').map(convRow).join('')}
          </div>
        </div>

        <div class="section" style="margin-bottom:var(--s-6)">
          ${sectionHead('Échanges directs')}
          <div class="list list--card">
            ${CONVERSATIONS.filter((c) => c.kind === 'direct').map(convRow).join('')}
          </div>
        </div>

        ${next ? `<div class="section" style="margin-bottom:var(--s-8)">
          <div class="card card--sunken row gap-3">
            <span class="notice__icon">${icon.lotus}</span>
            <span class="notice__text grow">Le monastère observe le silence à partir de
              <b>${next.at}</b> — ${esc(next.label.toLowerCase())}.</span>
          </div>
        </div>` : ''}
      </div>
    </div>`;
  }
});

/* ============================================================
   Conversation
   ============================================================ */
screen('chat', {
  label: '· Conversation',
  render: (convId = 'c4') => {
    const c = CONVERSATIONS.find((x) => x.id === convId) || CONVERSATIONS[0];
    const msgs = MESSAGES[c.id] || [];
    const silent = silenceNow();
    const next = silenceNext();
    const sub = c.kind === 'direct'
      ? `${person(c.with).level}${person(c.with).beltName ? ' · ceinture ' + person(c.with).beltName.toLowerCase() : ''}`
      : `${c.people} membres`;

    return `
    <div class="screen">
      <header class="appbar">
        <button class="iconbtn" data-nav="messages" aria-label="Retour">${icon.back}</button>
        <button class="grow row gap-3" data-nav="${c.kind === 'direct' ? 'member' : 'community'}"
                style="text-align:left;min-width:0">
          ${convEmblem(c, 'sm')}
          <span class="grow" style="min-width:0">
            <span class="item__title truncate" style="display:block">${esc(c.title)}</span>
            <span class="item__sub" style="display:block">${esc(sub)}</span>
          </span>
        </button>
        <button class="iconbtn" data-action="sheet" aria-label="Options">${icon.dots}</button>
      </header>

      <div class="scroll" data-thread-scroll>
        <div class="thread" data-thread="${c.id}">
          ${msgs.map((m, i) => messageBubble(m, c, msgs[i - 1])).join('')}
        </div>
      </div>

      ${c.kind === 'annonce' ? `<div class="notice">
        <span class="notice__icon">${icon.megaphone}</span>
        <span class="notice__text grow">Canal d’annonces — lu par <b>${c.people} membres</b>.
          Seuls les maîtres peuvent y écrire.</span>
      </div>` : ''}

      ${silent
        ? `<div class="notice">
             <span class="notice__icon">${icon.lotus}</span>
             <span class="notice__text grow"><b>${esc(silent.label)}</b> — le monastère
               observe le silence jusqu’à ${esc(silent.until)}. Votre message pourra être
               envoyé à la reprise.</span>
           </div>`
        : `<form class="composer" data-send="${c.id}">
             <textarea class="composer__input" rows="1" data-composer
                       placeholder="Écrire à ${esc(c.kind === 'direct' ? c.title.split(' ')[0] : c.title)}…"
                       aria-label="Votre message"></textarea>
             <button class="composer__send" type="submit" aria-label="Envoyer">${icon.send}</button>
           </form>
           ${next ? `<p class="caption pad" style="padding-bottom:8px;text-align:center">
             Silence à ${next.at} · ${esc(next.label.toLowerCase())}</p>` : ''}`}
    </div>`;
  }
});

/* ============================================================
   18. Profil membre
   ============================================================ */
screen('member', {
  label: '18 · Profil membre',
  render: () => {
    const p = person('p9');
    return `
    <div class="screen">
      ${appbar({ title: '', back: 'community', flush: true,
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Options">${icon.dots}</button>` })}
      <div class="scroll">
        <div class="pad stack gap-4" style="align-items:center;text-align:center">
          <span class="avatar avatar--lg avatar--ringed" style="--ring:${p.beltColor}">${initials(p.name)}</span>
          <div><h1 class="title">${esc(p.name)}</h1>
            <div class="row gap-2 mt-2" style="justify-content:center">
              ${badge(p.role, 'gold')}${badge('Résident', 'outline')}
            </div></div>
        </div>

        <div class="section" style="margin-top:var(--s-6)">
          <button class="btn btn--primary btn--block" data-nav="chat:c7">
            ${icon.megaphone}Envoyer un message</button>
        </div>

        <div class="section">
          <div class="card">
            <div class="row" style="justify-content:space-around">
              <div style="text-align:center"><p class="num heading">7 ans</p><p class="caption mt-1">au monastère</p></div>
              <div style="width:1px;align-self:stretch;background:var(--line)"></div>
              <div style="text-align:center"><p class="num heading">${p.sessions}</p><p class="caption mt-1">séances</p></div>
              <div style="width:1px;align-self:stretch;background:var(--line)"></div>
              <div style="text-align:center"><p class="num heading">${p.attendance}%</p><p class="caption mt-1">présence</p></div>
            </div>
          </div>
        </div>

        <div class="section">
          ${sectionHead('Informations')}
          <div class="list list--card">
            ${item({ title: 'Grade', end: `<span class="sub">${p.beltName}</span>` })}
            ${item({ title: 'Chambre', end: `<span class="sub">${p.room}</span>`, to: 'rooms' })}
            ${item({ title: 'Entré le', end: `<span class="sub">1ᵉʳ février 2019</span>` })}
            ${item({ title: 'Responsabilité', end: `<span class="sub">Jardin & réfectoire</span>` })}
            ${item({ title: 'Téléphone', end: `<span class="sub">${esc(p.phone)}</span>` })}
          </div>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          ${sectionHead('Documents liés', { label: 'Tout voir', to: 'documents' })}
          <div class="list list--card">
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.doc}</span>`,
              title: 'Attestation de résidence', sub: 'PDF · 142 Ko', to: 'documents' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.qr}</span>`,
              title: 'Carte de membre', sub: 'VM-0009 · code de présence', to: 'card:p9' })}
          </div>
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   Hub — Vie du monastère
   ============================================================ */
screen('temple', {
  label: '· Vie du monastère', tab: 'temple',
  render: () => `
  <div class="screen scroll">
    <div class="pad" style="padding-top:var(--s-2)">
      <p class="overline">${esc(MONASTERY.todayLabel)}</p>
      <h1 class="display mt-2">Vie du monastère</h1>
    </div>

    <div class="section" style="margin-top:var(--s-5)">
      <div class="card card--paper">
        <div class="between">
          <div><p class="overline">Maintenant</p>
            <p class="heading mt-2">Kung-Fu intermédiaire</p>
            <p class="sub mt-1">Cour d’honneur · jusqu’à 17:30</p></div>
          <p class="num display" style="font-size:30px">16:00</p>
        </div>
      </div>
    </div>

    ${dayTimeline(5)}

    <div class="section">
      ${sectionHead('Gérer')}
      <div class="list list--card">
        ${[['Planning quotidien', 'Rythme du monastère', 'planning', icon.calendar],
           ['Chambres', '17 places occupées sur 26', 'rooms', icon.bed],
           ['Repas', '62 couverts aujourd’hui', 'meals', icon.bowl],
           ['Stocks', '2 alertes de seuil', 'stock', icon.box],
           ['Événements', '5 à venir', 'events', icon.flag],
           ['Travaux & tâches', '6 tâches du jour', 'planning', icon.temple]
          ].map(([t, s, to, ic]) => item({
            lead: `<span class="seal seal--sm seal--ink">${ic}</span>`,
            title: esc(t), sub: esc(s), to
          })).join('')}
      </div>
    </div>
    <div style="height:var(--s-8)"></div>
  </div>`
});

/* ============================================================
   19. Chambres
   ============================================================ */
screen('rooms', {
  label: '19 · Chambres',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Chambres', back: 'temple',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Attribuer">${icon.plus}</button>` })}
    <div class="scroll">
      <div class="pad">
        <div class="ink between">
          <div><p class="overline">Occupation</p>
            <p class="title mt-2" style="color:var(--text-on-ink)">17 <span class="sub">/ 26 places</span></p></div>
          ${ring(65, { size: 66, stroke: 5, color: 'var(--gold-bright)',
            label: `<span class="num sub" style="color:var(--gold-bright)">65%</span>` })}
        </div>
      </div>
      ${BUILDINGS.map((b) => `
        <div class="section">
          ${sectionHead(b.name)}
          <div class="stack gap-3">
            ${b.rooms.map((r) => {
              const full = r.taken >= r.cap;
              const free = r.taken === 0;
              const variant = r.state === 'Entretien' ? 'warning' : full ? 'danger' : free ? 'positive' : '';
              return `<button class="card card--tap" data-action="sheet">
                <div class="between">
                  <div class="row gap-3">
                    <span class="seal seal--sm seal--ink" style="font-size:13px">${r.id}</span>
                    <span class="stack gap-1">
                      <span class="item__title">${r.taken} / ${r.cap} places</span>
                      <span class="item__sub">${r.cap - r.taken} disponible${r.cap - r.taken > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                  ${badge(r.state, variant)}
                </div>
                <div class="gauge mt-4">
                  ${Array.from({ length: r.cap }, (_, i) =>
                    `<i class="${i < r.taken ? 'on' : ''}"></i>`).join('')}
                </div>
              </button>`;
            }).join('')}
          </div>
        </div>`).join('')}
      <div style="height:var(--s-8)"></div>
    </div>
  </div>`
});

/* ============================================================
   20. Repas
   ============================================================ */
screen('meals', {
  label: '20 · Repas',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Repas', back: 'temple',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Menu">${icon.edit}</button>` })}
    <div class="filters">
      ${['Aujourd’hui', 'Demain', 'Semaine'].map((f, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
    </div>
    <div class="scroll">
      ${MEALS.map((m, i) => `
        <div class="section" style="margin-top:${i === 0 ? '0' : 'var(--s-6)'}">
          <div class="card ${i === 1 ? 'card--paper' : ''}">
            <div class="between">
              <div>
                <p class="overline">${esc(m.time)}</p>
                <p class="title mt-2">${esc(m.name)}</p>
              </div>
              <div style="text-align:right">
                <p class="num heading">${m.people}</p>
                <p class="caption">personnes</p>
              </div>
            </div>
            <p class="sub mt-4">${esc(m.menu)}</p>
            <div class="rule mt-4"><i></i></div>
            <div class="row wrap gap-2 mt-4">
              ${m.items.map((it) => `
                <span class="badge badge--outline">${esc(it.n)} · <b class="num">${esc(it.q)}</b></span>`).join('')}
            </div>
            ${i === 1 ? `<button class="btn btn--primary btn--block mt-5" data-action="toast">Confirmer le service</button>` : ''}
          </div>
        </div>`).join('')}
      <div class="section" style="margin-bottom:var(--s-8)">
        <div class="card card--sunken row gap-3">
          <span class="seal seal--sm">${icon.alert}</span>
          <span class="grow sub">Le stock d’huile (4 L) ne couvre pas la semaine.</span>
          <button class="btn btn--sm btn--outline" data-nav="stock">Stocks</button>
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   21. Stocks
   ============================================================ */
screen('stock', {
  label: '21 · Stocks',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Ressources', back: 'temple',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Entrée de stock">${icon.plus}</button>` })}
    <div class="scroll">
      <div class="pad">
        <div class="card row gap-3" style="border-color:color-mix(in srgb, var(--accent) 34%, transparent)">
          <span class="seal seal--sm">${icon.alert}</span>
          <span class="grow"><span class="item__title" style="display:block">2 articles sous le seuil</span>
            <span class="item__sub" style="display:block">Huile · Légumineuses · Gants</span></span>
        </div>
      </div>
      ${STOCK.map((c) => `
        <div class="section">
          ${sectionHead(c.cat)}
          <div class="list list--card">
            ${c.items.map((it) => {
              const pct = Math.min(100, Math.round((it.q / (it.min * 2)) * 100));
              const low = it.q < it.min;
              return item({
                title: esc(it.n),
                sub: low ? `Sous le seuil de ${it.min} ${it.u}` : `Seuil : ${it.min} ${it.u}`,
                end: `<span class="stack" style="align-items:flex-end;gap:5px">
                        <span class="num heading">${it.q} <span class="sub" style="font-size:12px">${it.u}</span></span>
                        <span class="gauge ${low ? 'gauge--low' : ''}" style="width:52px">
                          ${Array.from({ length: 6 }, (_, i) =>
                            `<i class="${i < Math.round(pct / 100 * 6) ? 'on' : ''}"></i>`).join('')}
                        </span></span>`,
                extra: low ? 'style="background:var(--danger-soft)"' : ''
              });
            }).join('')}
          </div>
        </div>`).join('')}
      <div style="height:var(--s-8)"></div>
    </div>
  </div>`
});

/* ============================================================
   22. Finances
   ============================================================ */
screen('finance', {
  label: '22 · Finances',
  render: () => {
    const max = Math.max(...FINANCE.months.map((m) => Math.max(m.in, m.out)));
    return `
    <div class="screen">
      ${appbar({ title: 'Finances', back: 'temple',
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Exporter">${icon.doc}</button>` })}
      <div class="scroll">
        <div class="pad">
          <div class="ink">
            <p class="overline">Solde · août 2026</p>
            <p class="num display mt-3" style="color:var(--gold-bright)">2 110 000 <span style="font-size:18px">Ar</span></p>
            <div class="row gap-5 mt-5">
              <div><p class="caption">Revenus</p>
                <p class="num heading" style="color:var(--text-on-ink)">4 850 000</p></div>
              <div style="width:1px;align-self:stretch;background:rgba(198,161,91,.22)"></div>
              <div><p class="caption">Dépenses</p>
                <p class="num heading" style="color:var(--text-on-ink)">2 740 000</p></div>
            </div>
          </div>
        </div>

        <div class="section">
          ${sectionHead('Six derniers mois')}
          <div class="card">
            <div class="chart">
              ${FINANCE.months.map((m) => `
                <div class="chart__col">
                  <div class="chart__stack" style="flex-direction:row;align-items:flex-end;gap:3px">
                    <div class="chart__seg chart__seg--in"  style="height:${m.in / max * 100}%"></div>
                    <div class="chart__seg chart__seg--out" style="height:${m.out / max * 100}%"></div>
                  </div>
                  <span class="chart__label">${m.m}</span>
                </div>`).join('')}
            </div>
            <div class="legend mt-4">
              <span><i style="background:var(--wood)"></i>Revenus</span>
              <span><i style="background:var(--accent)"></i>Dépenses</span>
              <span class="dim">en millions d’Ariary</span>
            </div>
          </div>
        </div>

        <div class="section">
          ${sectionHead('Revenus')}
          <div class="card stack gap-4">
            ${FINANCE.incomeLines.map((l) => `
              <div>
                <div class="between"><span class="body">${esc(l.n)}</span>
                  <span class="num sub">${money(l.v)}</span></div>
                <div class="mt-2">${bar(l.v / FINANCE.income * 100, 'bar__fill--wood')}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="section">
          ${sectionHead('Dépenses')}
          <div class="card stack gap-4">
            ${FINANCE.expenseLines.map((l) => `
              <div>
                <div class="between"><span class="body">${esc(l.n)}</span>
                  <span class="num sub">${money(l.v)}</span></div>
                <div class="mt-2">${bar(l.v / FINANCE.expense * 100, 'bar__fill--accent')}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          <div class="list list--card">
            ${item({ lead: `<span class="seal seal--sm seal--gold">${icon.coin}</span>`,
              title: 'Dons', sub: '12 850 000 Ar collectés', to: 'donations' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.users}</span>`,
              title: 'Cotisations', sub: `${DUES_SUMMARY.rate}% recouvrés · 4 en retard`, to: 'dues' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.doc}</span>`,
              title: 'Rapports financiers', sub: 'Juillet 2026 disponible', to: 'documents' })}
          </div>
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   23. Dons
   ============================================================ */
screen('donations', {
  label: '23 · Dons',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Dons', back: 'finance' })}
    <div class="scroll">
      <div class="pad">
        <div class="ink" style="text-align:center">
          <p class="overline">Total des dons</p>
          <p class="num display mt-3" style="color:var(--gold-bright)">12 850 000 <span style="font-size:18px">Ar</span></p>
          <div class="rule mt-5" style="color:rgba(198,161,91,.25)"><i></i></div>
          <p class="sub mt-4">Ce mois · <span class="num" style="color:var(--text-on-ink)">2 400 000 Ar</span></p>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Derniers dons')}
        <div class="list list--card">
          ${DONATIONS.list.map((d) => item({
            lead: `<span class="avatar avatar--sm">${initials(d.who)}</span>`,
            title: esc(d.who), sub: `${esc(d.date)} · ${esc(d.dest)}`,
            end: `<span class="num heading" style="color:var(--gold-text)">${d.amount.toLocaleString('fr-FR').replace(/,/g, ' ')}</span>`
          })).join('')}
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Enregistrer un don')}
        <div class="card stack gap-4">
          <label class="field"><span class="field__label">Donateur</span>
            <input class="input" placeholder="Nom du donateur"></label>
          <label class="field"><span class="field__label">Montant (Ar)</span>
            <input class="input" placeholder="0" inputmode="numeric"></label>
          <label class="field"><span class="field__label">Date</span>
            <input class="input" value="13 août 2026"></label>
          <div class="field"><span class="field__label">Destination</span>
            <div class="row wrap gap-2">
              ${['Général', 'Nourriture', 'Construction', 'Formation', 'Temple'].map((d, i) =>
                `<button class="filter" aria-pressed="${i === 0}">${d}</button>`).join('')}
            </div>
          </div>
          <button class="btn btn--gold btn--block" data-action="toast">Enregistrer le don</button>
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   24. Événements
   ============================================================ */
screen('events', {
  label: '24 · Événements',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Événements', back: 'temple' })}
    <div class="filters">
      ${['À venir', 'Cérémonies', 'Compétitions', 'Retraites', 'Passés'].map((f, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
    </div>
    <div class="scroll">
      <div class="section" style="margin-top:0">
        <div class="stack gap-3">
          ${EVENTS.map((e, i) => `
            <button class="card card--tap ${i === 0 ? 'card--paper' : ''}" data-action="sheet">
              <div class="row gap-4">
                <span class="stack" style="width:54px;text-align:center">
                  <span class="num heading">${e.date.split(' ')[0]}</span>
                  <span class="caption">${e.date.split(' ')[1]}</span>
                </span>
                <span class="grow stack gap-1">
                  <span class="overline">${esc(e.type)}</span>
                  <span class="item__title">${esc(e.title)}</span>
                  <span class="item__sub">${esc(e.time)} · ${esc(e.place)}</span>
                </span>
                ${badge(e.state, e.state === 'Confirmé' ? 'positive'
                  : e.state === 'Brouillon' ? '' : 'warning')}
              </div>
              ${e.people ? `<div class="row gap-3 mt-4" style="padding-left:70px">
                <span class="avatarstack">${['p3', 'p8', 'p1'].map((id) => avatar(person(id), 'xs', { one: true })).join('')}</span>
                <span class="caption">${e.people} participants · budget ${money(e.budget)}</span>
              </div>` : ''}
            </button>`).join('')}
        </div>
      </div>
      <div style="height:var(--s-8)"></div>
    </div>
    <button class="fab" data-action="sheet" aria-label="Créer un événement">${icon.plus}</button>
  </div>`
});

/* ============================================================
   25. Documents
   ============================================================ */
screen('documents', {
  label: '25 · Documents',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Documents', back: 'temple' })}
    <div class="pad">
      <div class="searchbar">${icon.search}<input placeholder="Rechercher un document"></div>
    </div>
    <div class="filters">
      ${['Tous', 'Certificats', 'Attestations', 'Reçus', 'Rapports', 'Fiches'].map((f, i) =>
        `<button class="filter" aria-pressed="${i === 0}">${f}</button>`).join('')}
    </div>
    <div class="scroll">
      <div class="section" style="margin-top:0;margin-bottom:var(--s-8)">
        <div class="list list--card">
          ${DOCS.map((d) => item({
            lead: `<span class="seal seal--sm seal--ink">${icon.doc}</span>`,
            title: esc(d.name), sub: `${esc(d.type)} · ${esc(d.date)} · ${esc(d.size)}`,
            to: 'documents'
          })).join('')}
        </div>
      </div>
    </div>
    <button class="fab" data-action="sheet" aria-label="Ajouter un document">${icon.plus}</button>
  </div>`
});

/* ============================================================
   26. Notifications
   ============================================================ */
screen('notifications', {
  label: '26 · Notifications',
  render: () => {
    const kindIcon = { alert: icon.alert, martial: icon.martial, users: icon.users,
                       calendar: icon.calendar, coin: icon.coin, temple: icon.temple };
    return `
    <div class="screen">
      ${appbar({ title: 'Notifications', back: 'homeMaster',
        actions: `<button class="iconbtn" data-action="toast" aria-label="Tout marquer comme lu">${icon.check}</button>` })}
      <div class="scroll pad">
        <p class="overline mt-2">Aujourd’hui</p>
        <div class="stack">
          ${NOTIFS.filter((n) => n.unread).map((n) => `
            <button class="notif notif--unread" data-nav="${n.to}">
              <span class="notif__icon" style="${n.kind === 'alert'
                ? 'background:var(--danger-soft);color:var(--danger)' : ''}">${kindIcon[n.kind]}</span>
              <span class="grow">
                <span class="notif__title" style="display:block">${esc(n.title)}</span>
                <span class="notif__time" style="display:block">${esc(n.time)}</span>
              </span>
            </button>`).join('')}
        </div>
        <p class="overline mt-6">Plus tôt</p>
        <div class="stack">
          ${NOTIFS.filter((n) => !n.unread).map((n) => `
            <button class="notif" data-nav="${n.to}">
              <span class="notif__icon">${kindIcon[n.kind]}</span>
              <span class="grow">
                <span class="notif__title muted" style="display:block">${esc(n.title)}</span>
                <span class="notif__time" style="display:block">${esc(n.time)}</span>
              </span>
            </button>`).join('')}
        </div>
        <div style="height:var(--s-8)"></div>
      </div>
    </div>`;
  }
});

/* ============================================================
   27. Recherche globale
   ============================================================ */
/* La recherche est réellement fonctionnelle : elle interroge un index
   construit sur les données de l'application (personnes, grades,
   techniques, séances, événements, documents, chambres, ressources,
   dons) et se met à jour à chaque frappe. */
const searchState = { q: '', scope: 'Tout' };

screen('search', {
  label: '27 · Recherche',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Recherche', back: 'homeMaster' })}
    <div class="pad">
      <div class="searchbar">${icon.search}
        <input value="${esc(searchState.q)}" autocomplete="off" autocapitalize="off"
               spellcheck="false" data-search-input
               placeholder="Une personne, un grade, une chambre…"
               aria-label="Rechercher dans le monastère">
        <button class="iconbtn" data-action="searchClear" aria-label="Effacer la recherche">${icon.x}</button>
      </div>
    </div>
    <div class="filters" data-search-scope>
      ${['Tout', 'Personnes', 'Grades', 'Technique', 'Séances', 'Chambres',
         'Ressources', 'Documents', 'Événements', 'Finances'].map((f) =>
        `<button class="filter" data-scope="${f}"
           aria-pressed="${searchState.scope === f}">${f}</button>`).join('')}
    </div>
    <div class="scroll" data-search-results>
      ${searchResults(searchState.q, searchState.scope)}
    </div>
  </div>`
});

/* ============================================================
   Carte de membre — portrait, identité, code de présence
   ============================================================ */
screen('card', {
  label: '· Carte de membre',
  render: (id = 'p1') => {
    const p = person(id) || person('p1');
    const token = memberToken(p);
    const belt = p.beltColor || 'var(--line-strong)';
    return `
    <div class="screen">
      ${appbar({ title: 'Carte de membre', back: p.role === 'Élève' ? 'student' : 'member',
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Options">${icon.dots}</button>` })}
      <div class="scroll">
        <div class="pad">
          <div class="idcard rise">
            <div class="idcard__head">
              <span class="idcard__mark">VM</span>
              <span class="grow">
                <span class="idcard__org" style="display:block">VATO MASINA</span>
                <span class="idcard__kind" style="display:block">Carte de membre</span>
              </span>
            </div>

            <div class="idcard__portrait">${portraitSVG(p)}</div>

            <div class="idcard__id">
              <p class="idcard__name">${esc(p.name)}</p>
              <p class="idcard__role">${esc(p.role)} · ${esc(p.level)}${
                p.beltName ? ` · ceinture ${p.beltName.toLowerCase()}` : ''}</p>
              <p class="idcard__num">${memberNumber(p)}</p>
            </div>

            <div class="idcard__qr">${qrSVG(token, { size: 120 })}</div>

            <div class="idcard__foot">
              <span class="idcard__valid">Valide jusqu’au<br><b>31 décembre 2026</b></span>
              <span class="idcard__valid" style="text-align:right">Émise le<br><b>13 août 2026</b></span>
            </div>
            <div class="idcard__band" style="--belt:${belt}"></div>
          </div>
        </div>

        <div class="section">
          ${sectionHead('Utiliser cette carte')}
          <div class="list list--card">
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.qr}</span>`,
              title: 'Pointer une présence', sub: 'Le maître scanne le code en début de séance',
              to: 'attendance' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.doc}</span>`,
              title: 'Enregistrer en PDF', sub: 'Format badge, prêt à imprimer',
              extra: 'data-action="toast"' })}
            ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.sync}</span>`,
              title: 'Régénérer le code', sub: 'En cas de perte ou de vol de la carte',
              extra: 'data-action="toast"' })}
          </div>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          ${sectionHead('Contenu du code')}
          <div class="card card--sunken">
            <p class="num sub" style="word-break:break-all">${esc(token)}</p>
            <div class="rule mt-4"><i></i></div>
            <p class="caption mt-4">Organisation · numéro de membre · année · contrôle.
              La somme de contrôle repère une carte modifiée à la main ; elle
              n’empêche pas une contrefaçon délibérée, ce qui demanderait une
              signature délivrée par le serveur.</p>
          </div>
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   Nouvel élève — formulaire d'admission
   ============================================================ */
screen('newStudent', {
  label: '· Nouvel élève',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Nouvel élève', back: 'students' })}
    <form class="scroll" data-newstudent novalidate>
      <p class="caption pad">L’admission crée la fiche, la carte de membre et son
        code de présence. Les champs marqués d’un point sont requis.</p>

      <div class="section" style="margin-top:var(--s-5)">
        ${sectionHead('Identité')}
        <div class="card stack gap-4">
          <label class="field" data-field="name">
            <span class="field__label">Nom et prénoms ·</span>
            <input class="input" name="name" autocomplete="name"
                   placeholder="Rakotoarisoa Nirina">
          </label>
          <label class="field" data-field="phone">
            <span class="field__label">Téléphone ·</span>
            <input class="input" name="phone" inputmode="tel" placeholder="034 12 345 67">
          </label>
          <label class="field">
            <span class="field__label">Date de naissance</span>
            <input class="input" name="birth" placeholder="12 mars 2008">
          </label>
          <label class="field">
            <span class="field__label">Quartier</span>
            <input class="input" name="area" placeholder="Analakely, Antananarivo">
          </label>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Pratique')}
        <div class="card stack gap-5">
          <div class="field" data-field="group">
            <span class="field__label">Groupe ·</span>
            <div class="row wrap gap-2" data-choice="group">
              ${GROUPS.slice(0, 3).map((g) => `<button type="button" class="filter"
                 data-value="${esc(g.name)}" aria-pressed="false">${esc(g.name.replace('Groupe ', ''))}</button>`).join('')}
            </div>
          </div>
          <div class="field">
            <span class="field__label">Grade de départ</span>
            <div class="row wrap gap-2" data-choice="belt">
              ${BELTS.slice(0, 3).map((b, i) => `<button type="button" class="filter"
                 data-value="${b.id}" aria-pressed="${i === 0}">
                 <i class="belt__disc" style="--belt:${b.color};display:inline-block;vertical-align:-1px"></i>
                 ${b.name}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Séjour')}
        <div class="list list--card">
          <div class="item">
            <span class="seal seal--sm seal--ink">${icon.bed}</span>
            <span class="grow">
              <span class="item__title" style="display:block">Résident au monastère</span>
              <span class="item__sub" style="display:block">Cotisation réduite, hébergement facturé à part</span>
            </span>
            <button type="button" class="switch" role="switch" aria-checked="false"
                    aria-label="Résident au monastère" data-action="toggle" data-resident></button>
          </div>
          ${item({ title: 'Date d’entrée', end: '<span class="sub">13 août 2026</span>' })}
          ${item({ title: 'Cotisation mensuelle',
            end: '<span class="num sub" data-fee>25 000 Ar</span>' })}
        </div>
      </div>

      <div class="section">
        ${sectionHead('Contact d’urgence')}
        <div class="card stack gap-4">
          <label class="field">
            <span class="field__label">Nom</span>
            <input class="input" name="kin" placeholder="Parent ou tuteur">
          </label>
          <label class="field">
            <span class="field__label">Téléphone</span>
            <input class="input" name="kinPhone" inputmode="tel" placeholder="033 00 000 00">
          </label>
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        <div class="card card--sunken row gap-3">
          <span class="seal seal--sm seal--ink">${icon.qr}</span>
          <span class="notice__text grow">Le portrait et le code de présence sont
            générés à la validation. La carte pourra être imprimée ensuite.</span>
        </div>
        <button class="btn btn--gold btn--block mt-4" type="submit">Admettre l’élève</button>
        <button class="btn btn--ghost btn--block btn--sm mt-2" type="button"
                data-nav="students">Annuler</button>
      </div>
    </form>
  </div>`
});

/* ============================================================
   Cotisations — suivi des paiements des élèves
   La spec prévoyait « Mes paiements » côté élève et le suivi des
   cotisations côté intendance sans qu'aucun écran ne le porte.
   ============================================================ */
screen('dues', {
  label: '· Cotisations',
  render: () => {
    const late = DUES.filter((d) => d.late).sort((a, b) => b.late - a.late);
    const ok = DUES.filter((d) => !d.late);
    return `
    <div class="screen">
      ${appbar({ title: 'Cotisations', back: 'finance',
        actions: `<button class="iconbtn" data-action="sheet" aria-label="Encaisser">${icon.plus}</button>` })}
      <div class="scroll">
        <div class="pad">
          <div class="ink">
            <p class="overline">Août 2026</p>
            <p class="num display mt-3" style="color:var(--gold-bright)">
              ${DUES_SUMMARY.collected.toLocaleString('fr-FR').replace(/,/g, ' ')}
              <span style="font-size:18px">Ar</span></p>
            <p class="sub mt-2">encaissés sur ${DUES_SUMMARY.expected.toLocaleString('fr-FR').replace(/,/g, ' ')} Ar attendus</p>
            <div class="mt-4">${bar(DUES_SUMMARY.rate, 'bar__fill--positive')}</div>
            <div class="row gap-5 mt-5">
              <div><p class="caption">Taux de recouvrement</p>
                <p class="num heading" style="color:var(--text-on-ink)">${DUES_SUMMARY.rate}%</p></div>
              <div style="width:1px;align-self:stretch;background:rgba(198,161,91,.22)"></div>
              <div><p class="caption">En attente</p>
                <p class="num heading" style="color:var(--text-on-ink)">${DUES_SUMMARY.pending.toLocaleString('fr-FR').replace(/,/g, ' ')}</p></div>
            </div>
          </div>
        </div>

        <div class="section">
          ${sectionHead(`En retard — ${late.length}`)}
          <div class="list list--card">
            ${late.map((d) => {
              const p = person(d.id);
              return item({
                lead: avatar(p, 'md'),
                title: esc(p.name),
                sub: `${d.late} mois · depuis le ${d.last}`,
                end: `<span class="stack" style="align-items:flex-end;gap:4px">
                        <span class="num sub" style="color:var(--danger)">${d.due.toLocaleString('fr-FR').replace(/,/g, ' ')} Ar</span>
                        ${badge(d.status, d.status === 'Critique' ? 'danger' : 'warning')}
                      </span>`,
                to: 'student'
              });
            }).join('')}
          </div>
          <button class="btn btn--outline btn--block mt-4" data-action="toast">
            ${icon.megaphone}Envoyer un rappel groupé</button>
        </div>

        <div class="section" style="margin-bottom:var(--s-8)">
          ${sectionHead(`À jour — ${ok.length}`)}
          <div class="list list--card">
            ${ok.map((d) => {
              const p = person(d.id);
              return item({
                lead: avatar(p, 'md'), title: esc(p.name),
                sub: `${d.fee.toLocaleString('fr-FR').replace(/,/g, ' ')} Ar / mois · réglé ${d.last}`,
                end: badge('À jour', 'positive'), to: 'student'
              });
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }
});

/* ============================================================
   28. Paramètres
   ============================================================ */
screen('settings', {
  label: '28 · Paramètres',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Paramètres', back: 'homeMaster' })}
    <div class="scroll">
      <div class="pad">
        <div class="card row gap-3">
          ${avatar(person('p11'), 'md')}
          <div class="grow"><p class="item__title">Maître Fidy</p>
            <p class="item__sub">Grand Maître · accès complet</p></div>
          <span class="chevron">${icon.chev}</span>
        </div>
      </div>

      <div class="section">
        ${sectionHead('Apparence')}
        <div class="list list--card">
          <div class="item">
            <span class="seal seal--sm seal--ink">${icon.moon}</span>
            <span class="grow"><span class="item__title" style="display:block">Temple de nuit</span>
              <span class="item__sub" style="display:block">Mode sombre</span></span>
            <button class="switch" role="switch" aria-checked="false" aria-label="Mode sombre « Temple de nuit »" data-action="theme"></button>
          </div>
          ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.eye}</span>`,
            title: 'Taille du texte', end: `<span class="sub">Standard</span>`, to: 'settings' })}
        </div>
      </div>

      <div class="section">
        ${sectionHead('Monastère')}
        <div class="list list--card">
          ${item({ title: 'Identité du monastère', sub: 'Nom, lieu, emblème', to: 'settings' })}
          ${item({ title: 'Système de grades', sub: '7 niveaux configurés', to: 'grades' })}
          ${item({ title: 'Rythme quotidien', sub: '8 moments définis', to: 'planning' })}
          ${item({ title: 'Devise & format', end: `<span class="sub">Ariary (Ar)</span>` })}
        </div>
      </div>

      <div class="section">
        ${sectionHead('Administration')}
        <div class="list list--card">
          ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.users}</span>`,
            title: 'Utilisateurs', sub: '63 comptes actifs', to: 'users' })}
          ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.lock}</span>`,
            title: 'Rôles & permissions', sub: '7 rôles définis', to: 'permissions' })}
          ${item({ lead: `<span class="seal seal--sm seal--ink">${icon.sync}</span>`,
            title: 'Synchronisation', sub: 'Dernière : il y a 4 min', to: 'states' })}
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        <button class="btn btn--danger btn--block" data-nav="login">${icon.logout}Quitter la session</button>
        <p class="caption mt-4" style="text-align:center">Vato Masina · version 1.0.0</p>
      </div>
    </div>
  </div>`
});

/* ============================================================
   29. Gestion des utilisateurs
   ============================================================ */
screen('users', {
  label: '29 · Utilisateurs',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Utilisateurs', back: 'settings',
      actions: `<button class="iconbtn" data-action="sheet" aria-label="Inviter">${icon.plus}</button>` })}
    <div class="pad">
      <div class="searchbar">${icon.search}<input placeholder="Rechercher un compte"></div>
    </div>
    <div class="scroll">
      <div class="section" style="margin-top:var(--s-5)">
        ${sectionHead('Comptes actifs — 63')}
        <div class="list list--card">
          ${[['p11', 'Grand Maître', 'gold'], ['p12', 'Maître', 'gold'],
             ['p14', 'Gestionnaire', ''], ['p13', 'Personnel', ''],
             ['p1', 'Élève', ''], ['p3', 'Élève', '']].map(([id, role, v]) => {
            const p = person(id);
            return item({ lead: avatar(p, 'md'), title: esc(p.name),
              sub: `Dernière connexion : aujourd’hui`,
              end: badge(role, v), to: 'permissions' });
          }).join('')}
        </div>
      </div>
      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('En attente')}
        <div class="list list--card">
          ${item({ lead: `<span class="avatar avatar--md">RN</span>`,
            title: 'Rina Nomena', sub: 'Invitation envoyée le 11 août',
            end: badge('En attente', 'warning') })}
        </div>
      </div>
    </div>
  </div>`
});

/* ============================================================
   30. Gestion des permissions
   ============================================================ */
screen('permissions', {
  label: '30 · Permissions',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'Permissions', back: 'settings' })}
    <div class="scroll">
      <div class="section" style="margin-top:var(--s-4)">
        ${sectionHead('Rôles')}
        <div class="list list--card">
          ${ROLES.map((r) => item({
            title: esc(r.name), sub: esc(r.scope),
            end: `<span class="num sub">${r.people}</span>`, to: 'permissions'
          })).join('')}
        </div>
      </div>

      <div class="section">
        <div class="card card--paper between">
          <div><p class="overline overline--gold">Rôle sélectionné</p>
            <p class="heading mt-2">Maître</p>
            <p class="caption mt-1">3 personnes · 11 permissions accordées</p></div>
          <span class="seal seal--sm seal--gold">${icon.lock}</span>
        </div>
      </div>

      ${PERMISSIONS.map((g) => `
        <div class="section">
          ${sectionHead(g.group)}
          <div class="list list--card">
            ${g.items.map((it) => `
              <div class="item">
                <span class="grow"><span class="item__title">${esc(it.n)}</span></span>
                <button class="switch" role="switch" aria-checked="${it.on}" aria-label="${esc(it.n)}" data-action="toggle"></button>
              </div>`).join('')}
          </div>
        </div>`).join('')}

      <div class="section" style="margin-bottom:var(--s-8)">
        <button class="btn btn--primary btn--block" data-action="toast">Enregistrer les permissions</button>
      </div>
    </div>
  </div>`
});

/* ============================================================
   États de l'interface — chargement, vide, erreur
   Référence pour l'implémentation Flutter.
   ============================================================ */
screen('states', {
  label: '· États d’interface',
  render: () => `
  <div class="screen">
    ${appbar({ title: 'États d’interface', back: 'settings' })}
    <div class="scroll">
      <div class="section" style="margin-top:0">
        ${sectionHead('Chargement')}
        <div style="margin:0 calc(-1 * var(--gutter))">${loadingList(3)}</div>
      </div>

      <div class="section">
        ${sectionHead('Synchronisation en cours')}
        <div class="card row gap-3">
          <span class="spin" style="width:20px;height:20px;display:block;color:var(--gold-text)">${icon.sync}</span>
          <span class="grow"><span class="item__title" style="display:block">Mise à jour des présences</span>
            <span class="item__sub" style="display:block">3 séances en attente d’envoi</span></span>
        </div>
      </div>

      <div class="section">
        ${sectionHead('État vide')}
        <div class="card" style="padding:0">
          ${empty('Aucun entraînement aujourd’hui.', 'Le calme précède toujours le mouvement.')}
        </div>
      </div>

      <div class="section" style="margin-bottom:var(--s-8)">
        ${sectionHead('Erreur')}
        <div class="card" style="padding:0">
          ${errorState('Le monastère est hors ligne. Vos données seront envoyées au retour du réseau.')}
        </div>
      </div>
    </div>
  </div>`
});
