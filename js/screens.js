/* ============================================================
   screens.js — GÉNÉRÉ par build-screens.mjs. Ne pas modifier ici :
   toute correction se fait dans build-screens.mjs puis
       node build-screens.mjs
   ============================================================ */

const SCREENS = {
  connexion: {
    label: "01 · Connexion",
    html: `
  <div class="phone phone--green" style="padding:0 24px">
    <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:28px;padding:60px 0">
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
        <div class="emblem emblem--lg"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg></div>
        <div>
          <p class="display" style="font-size:21px;color:#FFF;line-height:26px">Kung-fu Waishi</p>
          <p style="font-size:14px;color:var(--sur-vert);margin-top:4px">Analamahitsy</p>
        </div>
      </div>

      <div style="background:#FFF;border-radius:20px;padding:24px 20px;display:flex;flex-direction:column;gap:18px">
        <p style="font-size:17px;font-weight:700">Connexion membre</p>
        <label class="field"><span class="field__label">Numéro de membre</span>
          <span class="input">F04x042</span></label>
        <label class="field"><span class="field__label">Mot de passe</span>
          <span class="input" style="color:#8A978F;letter-spacing:.2em">••••••••</span></label>
        <button class="btn btn--primary" data-go="accueil">Entrer</button>
        <p style="font-size:13px;color:#59685F;text-align:center;line-height:19px">Première connexion ou mot de passe oublié ?<br><span style="color:#12613C;font-weight:600">Demandez au responsable du club.</span></p>
      </div>

      <p style="font-size:12px;color:#9BC0AC;text-align:center;line-height:18px">Chaque membre possède son propre compte.<br>Seule l’administration peut modifier les fiches.</p>
    </div>
  </div>`
  },
  accueil: {
    label: "02 · Accueil",
    html: `<div class="phone">
  
  <div class="hero">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="emblem"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg></div>
      <div style="flex-grow:1;min-width:0">
        <p class="display" style="font-size:17px;color:#FFF;letter-spacing:.02em;line-height:20px">KUNG-FU WAISHI</p>
        <p style="font-size:13px;color:var(--sur-vert);margin-top:2px">Analamahitsy · Antananarivo</p>
      </div>
      <button class="tapicon" data-go="notifications" aria-label="Notifications" style="position:relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot">3</span>
      </button>
    </div>

    <div class="hero__note">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7FD9A8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <div style="flex-grow:1">
        <p style="font-size:14px;font-weight:600;color:#FFF;line-height:19px">Sortie prévue samedi 22 novembre</p>
        <p style="font-size:12px;color:var(--sur-vert);margin-top:3px">Consultez le casier pour les détails.</p>
      </div>
    </div>
  </div>

  <div style="flex-grow:1;display:flex;flex-direction:column;gap:26px;padding:22px 20px 26px">
    <div class="card" style="padding:0;overflow:hidden">
      <div class="ph" style="height:168px">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/></svg>
        <p class="ph__label">Photo du club à fournir</p>
      </div>
      <div style="padding:18px">
        <p class="display" style="font-size:19px;line-height:24px">Kung-fu Waishi Analamahitsy</p>
        <p style="font-size:14px;line-height:22px;color:#59685F;margin-top:8px">Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière. Entraînements quatre fois par semaine à Analamahitsy.</p>
        <button class="linkrow" data-go="club">En savoir plus sur le club <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button>
      </div>
    </div>

    <div class="stats">
      <div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">64</p>
        <p style="font-size:11px;color:#59685F;margin-top:3px">membres</p>
      </div>
      <div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">4</p>
        <p style="font-size:11px;color:#59685F;margin-top:3px">séances / sem.</p>
      </div>
      <div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">2014</p>
        <p style="font-size:11px;color:#59685F;margin-top:3px">fondé en</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="rowhead"><h2 class="overline">Vaovao farany</h2><button class="link" data-go="casier">Tout le casier</button></div>
      <button class="card newsrow" data-go="casierDetail">
        <span class="datebox"><b>22</b><i>nov</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="tag" style="color:#12613C;background:#E8F1EC">Sortie</span>
          <span style="display:block;font-size:15px;font-weight:600;line-height:20px;margin-top:7px">Sortie au lac Mantasoa</span>
          <span style="display:block;font-size:13px;color:#59685F;line-height:18px;margin-top:4px">Départ 6h00 devant la salle.</span>
        </span>
      </button>
      <button class="card newsrow" data-go="casierDetail">
        <span class="datebox"><b>18</b><i>nov</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="tag" style="color:#B0530F;background:#FBEEE2">Changement d’horaire</span>
          <span style="display:block;font-size:15px;font-weight:600;line-height:20px;margin-top:7px">Séance du mercredi à 17h30</span>
          <span style="display:block;font-size:13px;color:#59685F;line-height:18px;margin-top:4px">Décalée d’une heure jusqu’à la fin décembre, en raison des travaux.</span>
        </span>
      </button>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  etudiants: {
    label: "03 · Étudiants",
    html: `<div class="phone">
  
  <div class="apphead">
    <span style="width:12px"></span>
    <h1 class="apphead__title">Étudiants</h1>
    <button class="tapicon" data-go="notifications" aria-label="Notifications"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg></button>
  </div>

  <div style="padding:16px 20px 0">
    <div class="searchbar"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><span>Rechercher un nom ou un prénom</span></div>
  </div>

  <div class="chips"><span class="chip chip--on">Tous</span><span class="chip">Blanche</span><span class="chip">Jaune</span><span class="chip">Orange</span><span class="chip">Verte</span></div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:12px">
    <p style="font-size:12px;color:#59685F">64 membres · classés par grade</p>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">RAKOTONDRABE</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Nirina</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#4E9C57"></i>Ceinture verte</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">RASOAMANANA</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Fanjaniaina</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#D8A93A"></i>Ceinture jaune</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">ANDRIANJAFY</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Tokiniaina</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#3E6E9C"></i>Ceinture bleue</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">RABEMANANJARA</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Hery</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#1E2320"></i>Ceinture noire</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">RAZAFIMAHATRATRA</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Miora</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#C97A32"></i>Ceinture orange</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
    <button class="card studentrow" data-go="profilVerrouille">
      <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <span style="flex-grow:1;min-width:0;text-align:left">
        <span style="display:block;font-size:15px;font-weight:700;line-height:19px">RANDRIAMAMPIONONA</span>
        <span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Toky</span>
        <span style="display:block;margin-top:7px"><span class="grade"><i style="background:#E7EDE9"></i>Ceinture blanche</span></span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </button>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  profilVerrouille: {
    label: "04 · Profil verrouillé",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="etudiants" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Profil</h1>
    
  </div>

  <div style="flex-grow:1;padding:24px 20px 28px;display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div style="width:132px;height:132px;border-radius:24px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <div>
        <p class="display" style="font-size:22px;line-height:26px">RAKOTONDRABE</p>
        <p class="display" style="font-size:20px;font-weight:500;color:#3C4A42;line-height:25px">Nirina</p>
        <div style="margin-top:12px"><span class="grade"><i style="background:#4E9C57"></i>Ceinture verte</span></div>
      </div>
    </div>

    <!-- La liste des champs masqués est montrée : l'utilisateur sait ce
         qu'il obtiendra en se connectant, plutôt qu'un mur nu. -->
    <div class="card" style="padding:22px 20px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
        <div class="tile"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg></div>
        <p style="font-size:16px;font-weight:700">Informations réservées</p>
        <p style="font-size:13px;line-height:19px;color:#59685F;max-width:250px">Connectez-vous avec votre compte de membre pour consulter cette fiche.</p>
      </div>
      <div class="masked">
        <div><span>Date de naissance</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>
        <div><span>Numéro de membre</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>
        <div><span>Début d’entraînement</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>
        <div><span>Biographie</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>
        <div><span>Contact</span><span class="masked__dots"><i></i><i></i><i></i><i></i></span></div>
      </div>
      <button class="btn btn--primary" data-go="profilOuvert">Se connecter</button>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  profilOuvert: {
    label: "05 · Profil ouvert",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="etudiants" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Profil</h1>
    <button class="tapicon" aria-label="Modifier"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/></svg></button>
  </div>

  <div style="flex-grow:1;padding:24px 20px 28px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;gap:16px;align-items:center">
      <div style="width:96px;height:96px;border-radius:20px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
      <div style="flex-grow:1;min-width:0">
        <p class="display" style="font-size:19px;line-height:23px">RAKOTONDRABE</p>
        <p class="display" style="font-size:17px;font-weight:500;color:#3C4A42;line-height:22px">Nirina</p>
        <div style="margin-top:9px"><span class="grade"><i style="background:#4E9C57"></i>Ceinture verte</span></div>
      </div>
    </div>

    <div class="banner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg><span>Fiche ouverte · session de Nirina</span></div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Informations personnelles</h2>
      <div class="card" style="padding:16px"><div class="deflist">
        <div><span>Nom</span><b>RAKOTONDRABE</b></div>
        <div><span>Prénom</span><b>Nirina</b></div>
        <div><span>Date de naissance</span><b>14 mars 2006</b></div>
        <div><span>Numéro de membre</span><b>F04x042</b></div>
        <div><span>Début d’entraînement</span><b>9 septembre 2019</b></div>
        <div><span>Grade</span><b>Ceinture verte</b></div>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px" data-feat="parents">
      <h2 class="overline">Parents ou tuteur</h2>
      <div class="card" style="padding:16px"><div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg></span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">RAKOTONDRABE Voahangy</p><p style="font-size:13px;color:#59685F">Mère · responsable légale</p></div>
          <a class="calltag" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/></svg> 034 22 118 40</a>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg></span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">RAKOTONDRABE Jean-Claude</p><p style="font-size:13px;color:#59685F">Père</p></div>
          <a class="calltag" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/></svg> 033 41 907 12</a>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm" style="background:#FBEEE2"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0530F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/></svg></span>
          <div style="flex-grow:1"><p style="font-size:14px;font-weight:600">À prévenir en urgence</p><p style="font-size:13px;color:#59685F">La mère, en priorité</p></div>
        </div>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Biographie</h2>
      <div class="card" style="padding:18px"><p style="font-size:14px;line-height:23px;color:#3C4A42">Entrée au club à treize ans. Régulière aux entraînements du mercredi et du samedi, elle prépare le passage à la ceinture bleue. A représenté le club à la démonstration d’Analamahitsy en 2024.</p></div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  casier: {
    label: "06 · Casier",
    html: `<div class="phone">
  
  <div class="apphead">
    <span style="width:12px"></span>
    <h1 class="apphead__title">Casier</h1>
    <button class="tapicon" data-go="notifications" aria-label="Notifications" style="position:relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot dot--plain"></span></button>
  </div>

  <div class="chips"><span class="chip chip--on">Tout</span><span class="chip">Sorties</span><span class="chip">Compétitions</span><span class="chip">Réunions</span></div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:12px">
    <button class="card newscard newscard--new" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:#12613C;background:#E8F1EC">Sortie</span>
        <span style="font-size:12px;color:#7C8B82">22 nov</span>
        <span style="margin-left:auto;font-size:11px;font-weight:700;color:#E4572E">NOUVEAU</span>
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">Sortie au lac Mantasoa</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">Départ 6h00 devant la salle. Prévoir le repas de midi et une tenue de rechange.</span>
    </button>
    <button class="card newscard" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:#B0530F;background:#FBEEE2">Changement d’horaire</span>
        <span style="font-size:12px;color:#7C8B82">18 nov</span>
        
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">Séance du mercredi à 17h30</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">Décalée d’une heure jusqu’à la fin décembre, en raison des travaux.</span>
    </button>
    <button class="card newscard" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:#12613C;background:#E8F1EC">Compétition</span>
        <span style="font-size:12px;color:#7C8B82">12 nov</span>
        
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">Tournoi régional d’Antananarivo</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">Huit membres du club sont sélectionnés. Réunion d’information vendredi.</span>
    </button>
    <button class="card newscard" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:#12613C;background:#E8F1EC">Réunion</span>
        <span style="font-size:12px;color:#7C8B82">05 nov</span>
        
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">Réunion des parents</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">Samedi 9h00 à la salle. Présentation du programme de l’année.</span>
    </button>
    <button class="card newscard" data-go="casierDetail">
      <span style="display:flex;align-items:center;gap:10px">
        <span class="tag" style="color:#12613C;background:#E8F1EC">Cérémonie</span>
        <span style="font-size:12px;color:#7C8B82">28 oct</span>
        
      </span>
      <span style="display:block;font-size:16px;font-weight:700;line-height:21px;text-align:left">Remise des grades</span>
      <span style="display:block;font-size:14px;line-height:21px;color:#59685F;text-align:left">Onze passages validés. Félicitations aux nouveaux gradés.</span>
    </button>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  casierDetail: {
    label: "07 · Une actualité",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="casier" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Sortie</h1>
    
  </div>

  <div style="flex-grow:1;display:flex;flex-direction:column">
    <div class="ph" style="height:190px">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <p class="ph__label">Photo à fournir</p>
    </div>

    <div style="padding:22px 20px 28px;display:flex;flex-direction:column;gap:20px">
      <div>
        <span class="tag" style="color:#12613C;background:#E8F1EC">Sortie</span>
        <h1 class="display" style="font-size:24px;line-height:30px;margin-top:12px">Sortie au lac Mantasoa</h1>
        <p style="font-size:13px;color:#7C8B82;margin-top:8px">Publié le 12 novembre par l’administration</p>
      </div>

      <div class="card" style="padding:16px"><div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
          <div><p style="font-size:14px;font-weight:600">Samedi 22 novembre</p><p style="font-size:13px;color:#59685F">Départ 6h00 · retour vers 18h00</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
          <div><p style="font-size:14px;font-weight:600">Devant la salle d’entraînement</p><p style="font-size:13px;color:#59685F">Analamahitsy</p></div>
        </div>
      </div></div>

      <p style="font-size:15px;line-height:25px;color:#3C4A42">La sortie annuelle est ouverte à tous les membres, quel que soit le grade. Le transport est organisé par le club. Chacun apporte son repas de midi et une tenue de rechange.</p>
      <p style="font-size:15px;line-height:25px;color:#3C4A42">Les mineurs doivent remettre une autorisation signée avant le mercredi 19 novembre.</p>
      <button class="btn btn--primary" data-go="participation">J’y participe</button>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  album: {
    label: "08 · Album photo",
    html: `<div class="phone">
  
  <div class="apphead">
    <span style="width:12px"></span>
    <h1 class="apphead__title">Album photo</h1>
    
  </div>
  <div class="chips"><span class="chip chip--on">Tout</span><span class="chip">Entraînements</span><span class="chip">Compétitions</span><span class="chip">Sorties</span></div>

  <div style="flex-grow:1;padding:14px 20px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead"><h2 class="overline">Compétitions</h2><span style="font-size:12px;color:#7C8B82">24 photos</span></div>
      <div class="grid3"><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead"><h2 class="overline">Entraînements</h2><span style="font-size:12px;color:#7C8B82">58 photos</span></div>
      <div class="grid3"><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Cérémonies</h2>
      <div class="grid3"><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button><button class="tilephoto" data-go="photo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CBCAA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></button></div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Album</span>
    </button>
  </nav>
</div>`
  },
  photo: {
    label: "09 · Photo en grand",
    html: `
  <div class="phone" style="background:#0B1712">
    <div style="padding:14px 12px;display:flex;align-items:center;gap:4px">
      <button class="tapicon" data-go="album" aria-label="Fermer"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <span style="flex-grow:1;font-size:14px;color:#C9D8D0;text-align:center">7 sur 24</span>
      <span style="width:44px"></span>
    </div>
    <div style="flex-grow:1;display:flex;align-items:center;justify-content:center;padding:0 12px">
      <div style="width:100%;aspect-ratio:3/4;border-radius:16px;background:#16261E;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#4E7360" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
        <p style="font-size:11px;font-weight:600;letter-spacing:.1em;color:#4E7360;text-transform:uppercase">Photo à fournir</p>
      </div>
    </div>
    <div style="padding:20px 20px 32px;display:flex;flex-direction:column;gap:6px">
      <p style="font-size:15px;font-weight:600;color:#FFF">Tournoi régional d’Antananarivo</p>
      <p style="font-size:13px;color:#9BB0A5">Compétitions · 12 novembre 2025</p>
    </div>
  </div>`
  },
  club: {
    label: "10 · Le Club",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="accueil" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Le Club</h1>
    
  </div>

  <div style="flex-grow:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:22px">
    <div style="background:#0F5132;border-radius:18px;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div class="emblem emblem--lg"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg></div>
      <div>
        <p class="display" style="font-size:20px;color:#FFF;line-height:25px">Kung-fu Waishi<br>Analamahitsy</p>
        <p style="font-size:13px;color:var(--sur-vert);margin-top:8px">Fondé en 2014 · Antananarivo</p>
      </div>
      <p style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#7FA893;text-transform:uppercase">Logo du club à fournir</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Présentation</h2>
      <div class="card" style="padding:18px"><p style="font-size:15px;line-height:25px;color:#3C4A42">Le club enseigne le Kung-fu Waishi à Analamahitsy depuis 2014. Il accueille enfants, adolescents et adultes, du débutant au gradé, autour d’une pratique régulière et d’un esprit d’entraide.</p></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Valeurs</h2>
      <div class="card valuerow">
        <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/></svg></span>
        <span><b style="display:block;font-size:15px;font-weight:600">Respect</b><span style="display:block;font-size:13px;color:#59685F;margin-top:2px;line-height:19px">Du maître, des partenaires, du lieu.</span></span>
      </div>
      <div class="card valuerow">
        <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/></svg></span>
        <span><b style="display:block;font-size:15px;font-weight:600">Constance</b><span style="display:block;font-size:13px;color:#59685F;margin-top:2px;line-height:19px">La progression vient de la régularité.</span></span>
      </div>
      <div class="card valuerow">
        <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/></svg></span>
        <span><b style="display:block;font-size:15px;font-weight:600">Entraide</b><span style="display:block;font-size:13px;color:#59685F;margin-top:2px;line-height:19px">Les anciens accompagnent les nouveaux.</span></span>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead"><h2 class="overline">Entraînements</h2><span class="modif">Modifiable par l’administration</span></div>
      <div class="card" style="padding:16px"><div class="deflist">
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Mardi</span><span style="flex-grow:1;color:#3C4A42">17h30 – 19h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Tous niveaux</b></div>
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Jeudi</span><span style="flex-grow:1;color:#3C4A42">17h30 – 19h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Tous niveaux</b></div>
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Vendredi</span><span style="flex-grow:1;color:#3C4A42">17h30 – 19h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Débutants</b></div>
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Samedi</span><span style="flex-grow:1;color:#3C4A42">09h00 – 11h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Gradés</b></div>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead"><h2 class="overline">Contact</h2><span class="modif">Modifiable par l’administration</span></div>
      <div class="card" style="padding:16px"><div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg></span>
          <div><p style="font-size:14px;font-weight:600">Idealy Itoerantsoa Santatra</p><p style="font-size:13px;color:#59685F">Responsable du club</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/></svg></span>
          <div><p style="font-size:14px;font-weight:600">[NUMÉRO À FOURNIR]</p><p style="font-size:13px;color:#59685F">Téléphone</p></div>
        </div>
        <div class="hr"></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="tile tile--sm"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
          <div><p style="font-size:14px;font-weight:600">[ADRESSE EXACTE À FOURNIR]</p><p style="font-size:13px;color:#59685F">Analamahitsy, Antananarivo</p></div>
        </div>
      </div></div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  notifications: {
    label: "11 · Notifications",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="accueil" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Notifications</h1>
    <button class="link" style="padding:0 14px">Tout lire</button>
  </div>

  <div style="flex-grow:1;padding:18px 20px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Aujourd’hui</h2>
      <button class="card notif notif--new" data-go="casierDetail">
        <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span style="display:flex;align-items:center;gap:8px"><b style="font-size:14px;font-weight:700">Sortie</b><i class="unread"></i></span>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">Nouvelle sortie prévue ce samedi. Consultez le casier pour voir les détails.</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">Il y a 2 h</span>
        </span>
      </button>
      <button class="card notif notif--new" data-go="casierDetail">
        <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span style="display:flex;align-items:center;gap:8px"><b style="font-size:14px;font-weight:700">Changement d’horaire</b><i class="unread"></i></span>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">La séance du mercredi passe à 17h30 jusqu’à fin décembre.</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">Il y a 5 h</span>
        </span>
      </button>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Plus tôt</h2>
      <button class="card notif" data-go="casierDetail">
        <span class="tile tile--sm" style="background:#F1F6F3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <b style="display:block;font-size:14px;font-weight:600;color:#3C4A42">Compétition</b>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">Huit membres sélectionnés pour le tournoi régional.</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">Hier</span>
        </span>
      </button>
      <button class="card notif" data-go="casierDetail">
        <span class="tile tile--sm" style="background:#F1F6F3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <b style="display:block;font-size:14px;font-weight:600;color:#3C4A42">Cérémonie</b>
          <span style="display:block;font-size:13px;line-height:19px;color:#59685F;margin-top:3px">Onze passages de grade validés le 28 octobre.</span>
          <span style="display:block;font-size:11px;color:#8A978F;margin-top:6px">Il y a 3 j</span>
        </span>
      </button>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  admin: {
    label: "12 · Administration",
    html: `
  <div class="phone">
    <div style="background:#0E2119;padding:20px 20px 24px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="tapicon" data-go="accueil" aria-label="Retour" style="margin-left:-10px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
        <div style="flex-grow:1">
          <p class="display" style="font-size:18px;font-weight:600;color:#FFF">Administration</p>
          <p style="font-size:12px;color:#9BB0A5;margin-top:2px">Idealy Itoerantsoa Santatra</p>
        </div>
      </div>
      <div class="stats">
        <div style="background:#1B3128;border-radius:12px;padding:13px 10px;text-align:center">
          <p class="display" style="font-size:20px;color:#FFF">64</p>
          <p style="font-size:11px;color:#9BB0A5;margin-top:2px">membres</p>
        </div>
        <div style="background:#1B3128;border-radius:12px;padding:13px 10px;text-align:center">
          <p class="display" style="font-size:20px;color:#FFF">12</p>
          <p style="font-size:11px;color:#9BB0A5;margin-top:2px">actualités</p>
        </div>
        <div style="background:#1B3128;border-radius:12px;padding:13px 10px;text-align:center">
          <p class="display" style="font-size:20px;color:#FFF">186</p>
          <p style="font-size:11px;color:#9BB0A5;margin-top:2px">photos</p>
        </div>
      </div>
    </div>

    <div style="flex-grow:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:22px">
      <div style="display:flex;flex-direction:column;gap:12px">
        <h2 class="overline">Membres</h2>
        <div class="list">
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Ajouter un étudiant</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Fiche, photo, grade, biographie</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Modifier une fiche</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Corriger ou compléter</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Changer un grade</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Après un passage validé</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Comptes et accès</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Créer, suspendre, réinitialiser</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <h2 class="overline">Publication</h2>
        <div class="list">
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Publier une actualité</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Sortie, compétition, réunion…</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Envoyer une notification</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Prévient tous les membres</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Créer un album</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Puis y ajouter des photos</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
          <div class="listrow">
            <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></span>
            <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Gérer les photos</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Ajouter, classer, supprimer</span></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <div class="warn">
        <i></i>
        <p>L’administration est le seul rôle autorisé à modifier une fiche. Les membres consultent, sans jamais pouvoir écrire.</p>
      </div>
    </div>
  </div>`
  },
  charte: {
    label: "13 · Charte graphique",
    wide: true,
    html: `
  <div class="sheet">
    <div style="display:flex;flex-direction:column;gap:8px">
      <h2 class="overline">Charte graphique</h2>
      <h1 class="display" style="font-size:32px;line-height:38px">Kung-fu Waishi Analamahitsy</h1>
      <p style="font-size:15px;line-height:24px;color:#59685F;max-width:520px">Vert dominant, blanc secondaire. Chaque couleur de texte a été mesurée sur son fond : le minimum retenu est 4,5:1, y compris pour les libellés de 11 px.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Couleurs</h2>
      <div class="swatches">
        <div class="swatch">
          <span class="swatch__chip" style="background:#0F5132"></span>
          <b>Vert profond</b><code>#0F5132</code>
          <span>Bandeaux, boutons</span><span>Blanc dessus : 9,4:1</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#12613C"></span>
          <b>Vert texte</b><code>#12613C</code>
          <span>Liens, libellés</span><span>Sur blanc : 7,5:1</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#E8F1EC"></span>
          <b>Vert clair</b><code>#E8F1EC</code>
          <span>Fonds teintés, pastilles</span><span>Vignettes de photo</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#F5F8F6"></span>
          <b>Fond d’écran</b><code>#F5F8F6</code>
          <span>Blanc tiré vers le vert</span><span>Sous les cartes</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#0E2119"></span>
          <b>Encre</b><code>#0E2119</code>
          <span>Texte principal</span><span>Sur blanc : 16,8:1</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#59685F"></span>
          <b>Secondaire</b><code>#59685F</code>
          <span>Texte de soutien</span><span>Sur blanc : 5,9:1</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#E4572E"></span>
          <b>Alerte</b><code>#E4572E</code>
          <span>Non-lu, urgence</span><span>Employé rarement</span>
        </div>
        <div class="swatch">
          <span class="swatch__chip" style="background:#E4EDE8"></span>
          <b>Filet</b><code>#E4EDE8</code>
          <span>Bordures, séparateurs</span><span>Jamais porteur de sens</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Typographie</h2>
      <div class="duo">
        <div class="card"><p class="display" style="font-size:30px">Archivo</p>
          <p style="font-size:13px;color:#59685F;margin-top:8px;line-height:20px">Titres, chiffres, sur-titres. Sportive et nette, elle porte l’identité sans bavardage.</p></div>
        <div class="card"><p style="font-size:30px;font-weight:600">Karla</p>
          <p style="font-size:13px;color:#59685F;margin-top:8px;line-height:20px">Corps de texte et libellés. Ouverte et lisible aux petites tailles, sur écran comme à l’impression.</p></div>
      </div>
      <div class="card" style="padding:20px"><div class="scale">
        <div><span>Titre · 24</span><span class="display" style="font-size:24px">Sortie au lac Mantasoa</span></div>
        <div><span>Section · 18</span><span class="display" style="font-size:18px;font-weight:600">Informations personnelles</span></div>
        <div><span>Corps · 15</span><span style="font-size:15px">Le club accueille enfants et adultes.</span></div>
        <div><span>Soutien · 13</span><span style="font-size:13px;color:#59685F">Départ 6h00 devant la salle.</span></div>
        <div><span>Sur-titre · 12</span><span class="overline">Vaovao farany</span></div>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Composants</h2>
      <div class="duo">
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Boutons · hauteur 48</p>
          <button class="btn btn--primary">Action principale</button><button class="btn btn--ghost">Action secondaire</button><button class="btn btn--soft">Action discrète</button>
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:12px;font-weight:700;color:#59685F">Filtres et grades</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip--on">Tous</span><span class="chip">Sorties</span><span class="chip">Compétitions</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="grade"><i style="background:#D8A93A"></i>Ceinture jaune</span><span class="grade"><i style="background:#4E9C57"></i>Ceinture verte</span></div>
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
            <div style="width:52px;height:52px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
            <span style="flex-grow:1"><b style="display:block;font-size:15px;font-weight:700;line-height:19px">RAKOTONDRABE</b><span style="display:block;font-size:14px;color:#3C4A42;line-height:19px">Nirina</span></span>
          </div>
          <p style="font-size:11px;line-height:17px;color:#59685F">Le portrait est un marque-place tant que les photos du club ne sont pas fournies.</p>
        </div>
      </div>
    </div>

    <p style="font-size:12px;line-height:19px;color:#59685F;border-top:1px solid #E4EDE8;padding-top:20px">Cibles tactiles : jamais moins de 44 px de haut. Rayons : 12 px sur les contrôles, 14 à 18 px sur les cartes. Grille d’espacement de 4 px.</p>
  </div>`
  },
  directionA: {
    label: "A · Lame",
    html: `
  <div class="phone dirA">
    <header class="dirA__head">
      <div class="dirA__glow"></div>
      <div class="dirA__top">
        <span class="emblem" style="width:40px;height:40px;border-radius:10px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg></span>
        <span style="flex-grow:1">
          <b class="dirA__name">WAISHI</b>
          <i class="dirA__place">Analamahitsy</i>
        </span>
        <button class="tapicon" data-go="notifications" style="position:relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot">3</span></button>
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
        <span class="dirA__go"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>
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

      <div class="rowhead" style="margin-top:6px"><h2 class="overline">Vaovao farany</h2><button class="link" data-go="casier">Tout voir</button></div>
      <button class="dirA__news" data-go="casierDetail">
        <span class="dirA__date">22<i>nov</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirA__newstag">Sortie</span>
          <span class="dirA__newstitle">Sortie au lac Mantasoa</span>
        </span>
      </button>
      <button class="dirA__news" data-go="casierDetail">
        <span class="dirA__date">18<i>nov</i></span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirA__newstag">Changement d’horaire</span>
          <span class="dirA__newstitle">Séance du mercredi à 17h30</span>
        </span>
      </button>
    </div>
    <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
  </div>`
  },
  directionB: {
    label: "B · Souffle",
    html: `
  <div class="phone dirB">
    <div class="dirB__aura"><i></i><i></i><i></i></div>

    <div class="dirB__content">
      <div class="dirB__top">
        <span style="flex-grow:1">
          <b class="dirB__hello">Kung-fu Waishi</b>
          <i class="dirB__place">Analamahitsy · Antananarivo</i>
        </span>
        <button class="dirB__bell" data-go="notifications"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot" style="border-color:#EAF3EE">3</span></button>
      </div>

      <button class="dirB__hero" data-go="casierDetail">
        <span class="dirB__pill">Prochaine sortie</span>
        <span class="dirB__herotitle">Lac<br>Mantasoa</span>
        <span class="dirB__herometa">Samedi 22 novembre · 6h00</span>
        <span class="dirB__cta">Voir les détails <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>
      </button>

      <div class="dirB__glassrow">
        <div class="dirB__glass">
          <b>64</b><span>membres</span>
        </div>
        <div class="dirB__glass">
          <b>4</b><span>séances</span>
        </div>
        <div class="dirB__glass">
          <b>186</b><span>photos</span>
        </div>
      </div>

      <div class="dirB__panel">
        <div class="rowhead"><h2 class="overline">Vaovao farany</h2><button class="link" data-go="casier">Tout voir</button></div>
        <button class="dirB__item" data-go="casierDetail">
          <span class="dirB__dot"></span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="dirB__itemtitle">Sortie au lac Mantasoa</span>
            <span class="dirB__itemmeta">Sortie · 22 nov</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </button>
        <button class="dirB__item" data-go="casierDetail">
          <span class="dirB__dot"></span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="dirB__itemtitle">Séance du mercredi à 17h30</span>
            <span class="dirB__itemmeta">Changement d’horaire · 18 nov</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </button>
        <button class="dirB__item" data-go="casierDetail">
          <span class="dirB__dot"></span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="dirB__itemtitle">Tournoi régional d’Antananarivo</span>
            <span class="dirB__itemmeta">Compétition · 12 nov</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
    <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
  </div>`
  },
  directionC: {
    label: "C · Tempo",
    html: `
  <div class="phone dirC">
    <div class="dirC__ticker"><span>SORTIE 22 NOV · LAC MANTASOA — SÉANCE MERCREDI 17H30 — TOURNOI RÉGIONAL : 8 SÉLECTIONNÉS — SORTIE 22 NOV · LAC MANTASOA — SÉANCE MERCREDI 17H30 — </span></div>

    <div class="dirC__top">
      <span style="flex-grow:1">
        <b class="dirC__brand">WAISHI</b>
        <i class="dirC__sub">Analamahitsy</i>
      </span>
      <button class="tapicon" data-go="notifications" style="position:relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot" style="border-color:#FFF">3</span></button>
    </div>

    <button class="dirC__poster" data-go="casierDetail">
      <span class="dirC__posterbg"><svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.6v5.2"/><path d="m5.5 10.8 6.5-1.5 6.5 1.5"/><path d="m12 12.8-3.6 7.6"/><path d="m12 12.8 3.6 7.6"/></svg></span>
      <span class="dirC__kicker">Samedi 22 novembre</span>
      <span class="dirC__big">LAC<br>MANTASOA</span>
      <span class="dirC__rule"></span>
      <span class="dirC__foot">Départ 6h00 · devant la salle <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FD9A8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>
    </button>

    <div class="dirC__figures">
      <div class="dirC__fig"><b>64</b><span>MEMBRES</span></div>
      <div class="dirC__fig"><b>3</b><span>SÉANCES</span></div>
      <div class="dirC__fig"><b>186</b><span>PHOTOS</span></div>
    </div>

    <div class="dirC__list">
      <div class="dirC__listhead"><b>VAOVAO FARANY</b><button class="link" data-go="casier">Tout voir</button></div>
      <button class="dirC__row" data-go="casierDetail">
        <span class="dirC__idx">01</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirC__rowtitle">Sortie au lac Mantasoa</span>
          <span class="dirC__rowmeta">SORTIE · 22 NOV</span>
        </span>
      </button>
      <button class="dirC__row" data-go="casierDetail">
        <span class="dirC__idx">02</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirC__rowtitle">Séance du mercredi à 17h30</span>
          <span class="dirC__rowmeta">CHANGEMENT D’HORAIRE · 18 NOV</span>
        </span>
      </button>
      <button class="dirC__row" data-go="casierDetail">
        <span class="dirC__idx">03</span>
        <span style="flex-grow:1;min-width:0;text-align:left">
          <span class="dirC__rowtitle">Tournoi régional d’Antananarivo</span>
          <span class="dirC__rowmeta">COMPÉTITION · 12 NOV</span>
        </span>
      </button>
    </div>
    <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
  </div>`
  },
  carte: {
    label: "14 · Carte de membre",
    html: `
  <div class="phone">
    <div class="apphead">
    <button class="tapicon" data-go="profilOuvert" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Carte de membre</h1>
    <button class="tapicon" aria-label="Partager"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/></svg></button>
  </div>
    <div style="flex-grow:1;padding:22px 20px 28px;display:flex;flex-direction:column;gap:20px">

      <div class="carte" data-feat="carte">
        <!-- Le cachet du club. L'emplacement reste vide tant que le
             fichier n'est pas déposé dans img/ : un emplacement vide
             est plus honnête qu'un faux tampon. -->
        <span class="cachet" aria-label="Cachet du club"><i>cachet<br>du club</i></span>
        <div class="carte__head">
          <span class="emblem" style="width:36px;height:36px;border-radius:10px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg></span>
          <span style="flex-grow:1">
            <b class="carte__org">KUNG-FU WAISHI</b>
            <i class="carte__kind">Carte de membre</i>
          </span>
        </div>

        <div class="carte__body">
          <div style="width:96px;height:120px;border-radius:14px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
          <div style="flex-grow:1;min-width:0;display:flex;flex-direction:column;gap:6px">
            <b class="carte__nom">RAKOTONDRABE</b>
            <span class="carte__prenom">Nirina</span>
            <span style="margin-top:2px"><span class="grade"><i style="background:#4E9C57"></i>Ceinture verte</span></span>
            <span class="carte__num">F04x042</span>
          </div>
        </div>

        <div class="carte__qr">
          <div class="carte__qrbox"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></div>
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
        <div class="listrow">
          <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg></span>
          <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Enregistrer en image</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Pour l’envoyer ou l’imprimer</span></span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </div>
        <div class="listrow">
          <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z"/></svg></span>
          <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Imprimer la carte</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">Format carte bancaire</span></span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </div>
        <div class="listrow">
          <span class="tile tile--sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg></span>
          <span style="flex-grow:1;min-width:0"><b style="display:block;font-size:15px;font-weight:600">Régénérer le code</b><span style="display:block;font-size:12px;color:#59685F;margin-top:1px">En cas de perte de la carte</span></span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A8B6AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
        </div>
      </div>

      <div class="warn">
        <i></i>
        <p>Le code affiché est un motif de démonstration : il ne contient aucune donnée et ne se scanne pas. Le vrai code, unique par membre, sera produit au développement une fois la maquette validée.</p>
      </div>
    </div>
  </div>`
  },
  participation: {
    label: "21 · Je participe",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="casierDetail" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Je participe</h1>
    
  </div>

  <div style="flex-grow:1;padding:18px 20px 24px;display:flex;flex-direction:column;gap:22px">
    <div class="card" style="display:flex;gap:13px;align-items:center;padding:14px 16px">
      <span class="datebox"><b>22</b><i>nov</i></span>
      <div>
        <p style="font-size:15px;font-weight:600;line-height:20px">Sortie au lac Mantasoa</p>
        <p style="font-size:13px;color:#59685F;margin-top:3px">Départ 6h00 devant la salle</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Qui vient</h2>
      <div class="card" style="padding:16px"><div style="display:flex;flex-direction:column;gap:14px">
        <label class="field"><span class="field__label">Prénom</span>
          <span class="input">Nirina</span></label>
        <label class="field"><span class="field__label">Numéro matricule</span>
          <span class="input input--fige">F04x042</span></label>
        <p class="aide">Les deux sont repris de votre fiche. Le matricule ne se modifie pas.</p>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="rowhead"><h2 class="overline">J’amène du monde</h2><span style="font-size:12px;color:#7C8B82">Conjoint, enfants</span></div>
      <div class="card" style="padding:16px"><div class="compteur">
        <button class="compteur__b" aria-label="Retirer une personne"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>
        <div class="compteur__v">
          <b>2</b>
          <span>personnes en plus</span>
        </div>
        <button class="compteur__b" aria-label="Ajouter une personne"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button>
      </div>
      <p class="aide" style="margin-top:12px">Trois places au total avec vous. Le club compte les places pour le transport.</p></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Ma participation</h2>
      <div class="card" style="padding:16px">
        <p style="font-size:13.5px;line-height:20px;color:#59685F">Vous pouvez envoyer en plusieurs fois. Choisissez le montant de cet envoi.</p>
        <div class="montants">
          <button class="montant">1 000<i>Ar</i></button>
          <button class="montant">2 000<i>Ar</i></button>
          <button class="montant montant--on">5 000<i>Ar</i></button>
          <button class="montant">10 000<i>Ar</i></button>
          <button class="montant montant--libre">Autre<i>montant</i></button>
        </div>

        <div class="ussd">
          <p class="ussd__lbl">Le code composé sur votre téléphone</p>
          <code class="ussd__code">#111*1*2*<b>0388010853</b>*5000#</code>
          <p class="ussd__nom">Santatra Nirina Antonio · MVola</p>
        </div>

        <button class="btn btn--primary">Ouvrir le clavier avec ce code</button>

        <div class="avert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A3A12" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4"/><path d="M12 16.3v.2"/></svg>
          <p>L’application ouvre le clavier, elle n’envoie pas l’argent : c’est vous qui appuyez sur appeler. Elle ne sait pas non plus si le transfert a réussi — c’est le club qui pointe ce qu’il a reçu.</p>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Ce que j’ai déjà envoyé</h2>
      <div class="list">
        <div class="listrow">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg>
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14.5px;font-weight:600">5 000 Ar</b>
            <span style="display:block;font-size:12.5px;color:#59685F;margin-top:1px">18 novembre · Pointé par le club</span>
          </span>
        </div>
        <div class="listrow">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg>
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14.5px;font-weight:600">5 000 Ar</b>
            <span style="display:block;font-size:12.5px;color:#59685F;margin-top:1px">12 novembre · Pointé par le club</span>
          </span>
        </div>
        <div class="listrow" style="background:#F5F8F6">
          <span style="flex-grow:1;font-size:13.5px;color:#59685F">Total reçu</span>
          <b class="display" style="font-size:16px;color:#0F5132">10 000 Ar</b>
        </div>
      </div>
    </div>

    <button class="btn btn--primary">Confirmer ma participation</button>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  motdepasse: {
    label: "22 · Changer le mot de passe",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="profilOuvert" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Mot de passe</h1>
    
  </div>

  <div style="flex-grow:1;padding:20px;display:flex;flex-direction:column;gap:22px">
    <div class="card" style="padding:18px"><div style="display:flex;flex-direction:column;gap:16px">
      <label class="field"><span class="field__label">Mot de passe actuel</span>
        <span class="input">••••••••</span></label>
      <label class="field"><span class="field__label">Nouveau mot de passe</span>
        <span class="input">••••••••••</span></label>
      <label class="field"><span class="field__label">Répéter le nouveau</span>
        <span class="input">••••••••••</span></label>
    </div></div>

    <button class="btn btn--primary">Enregistrer</button>

    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#E8F1EC;border-color:#C4D9CC">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="4"/><path d="M12 12h9"/><path d="M18 12v3.5"/><path d="M15 12v2.5"/></svg>
      <div>
        <p style="font-size:13.5px;font-weight:700;line-height:19px;color:#12613C">Mot de passe oublié</p>
        <p style="font-size:12.5px;line-height:18px;color:#12613C;margin-top:4px">Adressez-vous à l’administration du club : elle le réinitialise depuis son écran. Il n’y a pas d’envoi par courriel, puisque la connexion se fait au numéro matricule.</p>
      </div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  messages: {
    label: "16 · Messages",
    html: `<div class="phone">
  
  <div class="apphead">
    <span style="width:12px"></span>
    <h1 class="apphead__title">Messages</h1>
    <button class="tapicon" data-go="maitresVerrou" aria-label="Espace des maîtres"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="4"/><path d="M12 12h9"/><path d="M18 12v3.5"/><path d="M15 12v2.5"/></svg></button>
  </div>

  <div style="padding:14px 20px 0">
    <div class="searchbar">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <span style="color:#7C8B82;font-size:15px">Rechercher une conversation</span>
    </div>
  </div>

  <div style="flex-grow:1;padding:16px 20px 24px;display:flex;flex-direction:column;gap:18px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Salons du club</h2>
      <div class="list">
        <button class="listrow" data-go="salon">
          <span style="width:44px;height:44px;border-radius:14px;flex:none;background:#0F51321A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:15px;color:#0F5132">TO</span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">Tout le club</b>
              <i class="convrow__heure">14:20</i>
            </span>
            <span class="convrow__txt"><b>Fanja :</b> L’entraînement de mercredi est maintenu.</span>
          </span>
          <span class="pastille">3</span>
        </button>
        <button class="listrow" data-go="salon">
          <span style="width:44px;height:44px;border-radius:14px;flex:none;background:#4E9C571A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:15px;color:#4E9C57">CE</span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">Ceintures vertes</b>
              <i class="convrow__heure">11:05</i>
            </span>
            <span class="convrow__txt"><b>Tokiniaina :</b> Qui vient tôt samedi pour la mise en place ?</span>
          </span>
          <span class="pastille">1</span>
        </button>
        <button class="listrow" data-go="salon">
          <span style="width:44px;height:44px;border-radius:14px;flex:none;background:#B0530F1A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:15px;color:#B0530F">TO</span>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">Tournoi régional</b>
              <i class="convrow__heure">Hier</i>
            </span>
            <span class="convrow__txt"><b>Hery :</b> Rendez-vous 6h devant la salle.</span>
          </span>
          
        </button>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Conversations</h2>
      <div class="list">
        <button class="listrow" data-go="salon">
          <div style="width:44px;height:44px;border-radius:22px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">RASOAMANANA Fanjaniaina</b>
              <i class="convrow__heure">Hier</i>
            </span>
            <span class="convrow__txt">Merci pour la correction du taolu.</span>
          </span>
        </button>
        <button class="listrow" data-go="salon">
          <div style="width:44px;height:44px;border-radius:22px;background:#E8F1EC;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg>
</div>
          <span style="flex-grow:1;min-width:0;text-align:left">
            <span class="convrow__haut">
              <b class="convrow__nom">RAKOTOARISOA Lalaina</b>
              <i class="convrow__heure">Lun.</i>
            </span>
            <span class="convrow__txt">D’accord pour dimanche.</span>
          </span>
        </button>
      </div>
    </div>

    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#FFF7F2;border-color:#F2D8C6">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0530F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4"/><path d="M12 16.3v.2"/></svg>
      <div>
        <p style="font-size:13px;font-weight:700;line-height:18px">Signaler un message</p>
        <p style="font-size:12.5px;line-height:18px;color:#59685F;margin-top:4px">Un appui long sur un message le signale à l’administration. Le club compte des mineurs : la modération n’est pas une option.</p>
      </div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  salon: {
    label: "17 · Une conversation",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="messages" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <span style="width:36px;height:36px;border-radius:12px;flex:none;background:#0F51321A;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:13px;color:#0F5132">TC</span>
    <span style="flex-grow:1;min-width:0;margin-left:10px">
      <b style="display:block;font-family:var(--display);font-size:16px;font-weight:600;line-height:19px">Tout le club</b>
      <i style="display:block;font-size:11.5px;color:#59685F;font-style:normal;margin-top:1px">64 membres</i>
    </span>
  </div>

  <div class="fil">
    <p class="fil__jour">Aujourd’hui</p>
    <div class="bul bul--recu">
      <b class="bul__auteur">RAHARISOA Fanja</b>
      <p class="bul__txt">Bonsoir à tous. L’entraînement de mercredi est maintenu malgré les travaux.</p>
      <i class="bul__h">14:20</i>
    </div>
    <div class="bul bul--recu">
      <b class="bul__auteur">RAHARISOA Fanja</b>
      <p class="bul__txt">Rendez-vous à 17h30 comme d’habitude.</p>
      <i class="bul__h">14:20</i>
    </div>
    <div class="bul bul--envoye">
      <p class="bul__txt">Merci pour l’information.</p>
      <i class="bul__h">14:34 · lu</i>
    </div>
    <div class="bul bul--recu">
      <b class="bul__auteur">ANDRIANJAFY Tokiniaina</b>
      <p class="bul__txt">Est-ce qu’on travaille encore le taolu de la semaine dernière ?</p>
      <i class="bul__h">15:02</i>
    </div>
    <div class="bul bul--envoye">
      <p class="bul__txt">Oui, et on ajoute le passage en cercle.</p>
      <i class="bul__h">15:11 · lu</i>
    </div>
  </div>

  <div class="saisie">
    <span class="saisie__champ">Écrire un message…</span>
    <button class="saisie__env" aria-label="Envoyer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12 20 4.5 15 20l-3.5-6z"/><path d="m11.5 14 3.5-5"/></svg></button>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  maitresVerrou: {
    label: "18 · Espace des maîtres — verrouillé",
    html: `<div class="phone">
  
  <div class="apphead">
    <button class="tapicon" data-go="messages" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E2119" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <h1 class="apphead__title">Espace des maîtres</h1>
    
  </div>

  <div style="flex-grow:1;padding:34px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center">
    <div style="width:74px;height:74px;border-radius:24px;background:#0F5132;display:grid;place-items:center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
    </div>
    <div>
      <p class="display" style="font-size:20px;line-height:26px">Réservé aux maîtres</p>
      <p style="font-size:14px;line-height:21px;color:#59685F;margin-top:10px;max-width:290px">Votre compte n’a pas ce rôle. Cet espace n’apparaît pas dans la liste des salons et son contenu n’est pas transmis à votre téléphone.</p>
    </div>
    <div class="card" style="width:100%;text-align:left;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:11px;align-items:flex-start">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg>
        <div><p style="font-size:13.5px;font-weight:600;line-height:18px">Le rôle est posé sur le serveur</p>
        <p style="font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Pas dans l’application : la modifier ne donne rien.</p></div>
      </div>
      <div style="display:flex;gap:11px;align-items:flex-start">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg>
        <div><p style="font-size:13.5px;font-weight:600;line-height:18px">Le filtre est en base</p>
        <p style="font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Une requête d’un élève sur ces messages revient vide.</p></div>
      </div>
      <div style="display:flex;gap:11px;align-items:flex-start">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/><path d="M9 12.2l2 2 4-4.4"/></svg>
        <div><p style="font-size:13.5px;font-weight:600;line-height:18px">Seule l’administration accorde le rôle</p>
        <p style="font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Et peut le retirer à tout moment.</p></div>
      </div>
    </div>
    <button class="link" data-go="maitres">Voir l’écran tel que le voit un maître →</button>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  maitres: {
    label: "19 · Espace des maîtres",
    html: `<div class="phone">
  
  <div class="apphead apphead--sombre">
    <button class="tapicon" data-go="maitresVerrou" aria-label="Retour"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>
    <span style="flex-grow:1;min-width:0;margin-left:4px">
      <b style="display:block;font-family:var(--display);font-size:16px;font-weight:600;line-height:19px;color:#FFF">Espace des maîtres</b>
      <i style="display:block;font-size:11.5px;color:#9CC4AF;font-style:normal;margin-top:1px">4 personnes · confidentiel</i>
    </span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CC4AF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
  </div>

  <div style="flex-grow:1;display:flex;flex-direction:column;gap:20px;padding:18px 20px 24px">
    <div class="card" style="display:flex;gap:12px;align-items:flex-start;background:#E8F1EC;border-color:#C4D9CC">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16"/><path d="M9.5 9.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2"/><path d="M6.4 6.6C4.3 8 3 10 3 12c0 0 3.5 5.5 9 5.5 1.5 0 2.9-.4 4.1-1"/><path d="M9.8 6.8A9.6 9.6 0 0 1 12 6.5c5.5 0 9 5.5 9 5.5a15 15 0 0 1-2.6 3.1"/></svg>
      <p style="font-size:12.5px;line-height:18px;color:#12613C">Rien de ce qui est écrit ici n’apparaît dans les salons des élèves. Les captures d’écran, en revanche, restent possibles : la confidentialité tient aussi aux personnes.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Fil des maîtres</h2>
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
      <h2 class="overline">Ce que l’espace contient</h2>
      <div class="list">
        <div class="listrow">
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14px;font-weight:600;line-height:19px">Délibérations de passage de grade</b>
            <span style="display:block;font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Avant l’annonce publique</span>
          </span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
        </div>
        <div class="listrow">
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14px;font-weight:600;line-height:19px">Situations individuelles</b>
            <span style="display:block;font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Blessure, absence prolongée, difficulté familiale</span>
          </span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
        </div>
        <div class="listrow">
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14px;font-weight:600;line-height:19px">Signalements des élèves</b>
            <span style="display:block;font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Messages remontés par la modération</span>
          </span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
        </div>
        <div class="listrow">
          <span style="flex-grow:1;min-width:0">
            <b style="display:block;font-size:14px;font-weight:600;line-height:19px">Notes d’encadrement</b>
            <span style="display:block;font-size:12.5px;color:#59685F;line-height:17px;margin-top:2px">Répartition des groupes, remplacements</span>
          </span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
        </div>
      </div>
    </div>
  </div>
  <nav class="tabbar">
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="messages" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Messages</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
  </nav>
</div>`
  },
  fonctionnalites: {
    label: "00 · Fonctionnalités",
    html: `
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
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Accueil</h2>
        <div class="list">
          <button class="featrow" data-feat="acc-logo" data-screen="accueil">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Logo et nom du club</b>
              <span class="featrow__d">En haut de l’accueil et sur la carte de membre</span>
            </span>
            <span class="featrow__end" data-count="acc-logo"></span>
          </button>
          <button class="featrow" data-feat="acc-visuel" data-screen="accueil">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Photo du club</b>
              <span class="featrow__d">Grande image de présentation</span>
            </span>
            <span class="featrow__end" data-count="acc-visuel"></span>
          </button>
          <button class="featrow" data-feat="acc-presentation" data-screen="accueil">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Présentation courte</b>
              <span class="featrow__d">Deux ou trois phrases sur le club</span>
            </span>
            <span class="featrow__end" data-count="acc-presentation"></span>
          </button>
          <button class="featrow" data-feat="acc-vaovao" data-screen="accueil">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Dernières actualités</b>
              <span class="featrow__d">Les deux plus récentes, avec lien vers le casier</span>
            </span>
            <span class="featrow__end" data-count="acc-vaovao"></span>
          </button>
          <button class="featrow" data-feat="acc-notif" data-screen="accueil">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Pastille de notification</b>
              <span class="featrow__d">Nombre de nouveautés non lues</span>
            </span>
            <span class="featrow__end" data-count="acc-notif"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Étudiants</h2>
        <div class="list">
          <button class="featrow" data-feat="etu-liste" data-screen="etudiants">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Liste des étudiants</b>
              <span class="featrow__d">Photo, nom, prénom, grade</span>
            </span>
            <span class="featrow__end" data-count="etu-liste"></span>
          </button>
          <button class="featrow" data-feat="etu-recherche" data-screen="etudiants">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Recherche par nom ou prénom</b>
              <span class="featrow__d">Filtre immédiat sur la liste</span>
            </span>
            <span class="featrow__end" data-count="etu-recherche"></span>
          </button>
          <button class="featrow" data-feat="etu-filtre" data-screen="etudiants">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Filtres par grade</b>
              <span class="featrow__d">Blanche, jaune, orange, verte…</span>
            </span>
            <span class="featrow__end" data-count="etu-filtre"></span>
          </button>
          <button class="featrow" data-feat="etu-verrou" data-screen="profilVerrouille">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Fiche protégée</b>
              <span class="featrow__d">Nom et photo visibles, le reste après connexion</span>
            </span>
            <span class="featrow__end" data-count="etu-verrou"></span>
          </button>
          <button class="featrow" data-feat="etu-fiche" data-screen="profilOuvert">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Fiche complète</b>
              <span class="featrow__d">Naissance, numéro, début d’entraînement, grade</span>
            </span>
            <span class="featrow__end" data-count="etu-fiche"></span>
          </button>
          <button class="featrow" data-feat="parents" data-screen="profilOuvert">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Parents ou tuteur</b>
              <span class="featrow__d">Noms, lien de parenté, téléphones, contact d’urgence</span>
            </span>
            <span class="featrow__end" data-count="parents"></span>
          </button>
          <button class="featrow" data-feat="etu-bio" data-screen="profilOuvert">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Biographie</b>
              <span class="featrow__d">Quelques lignes sur le parcours</span>
            </span>
            <span class="featrow__end" data-count="etu-bio"></span>
          </button>
          <button class="featrow" data-feat="carte" data-screen="carte">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Carte de membre</b>
              <span class="featrow__d">Photo, numéro, grade et code de présence</span>
            </span>
            <span class="featrow__end" data-count="carte"></span>
          </button>
          <button class="featrow" data-feat="motdepasse" data-screen="motdepasse">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Changer son mot de passe</b>
              <span class="featrow__d">Depuis sa fiche ; réinitialisation par l’administration</span>
            </span>
            <span class="featrow__end" data-count="motdepasse"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Participation et contribution</h2>
        <div class="list">
          <button class="featrow" data-feat="part-inscription" data-screen="participation">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">S’inscrire à une sortie</b>
              <span class="featrow__d">Prénom et matricule repris de la fiche</span>
            </span>
            <span class="featrow__end" data-count="part-inscription"></span>
          </button>
          <button class="featrow" data-feat="part-accompagnants" data-screen="participation">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Amener du monde</b>
              <span class="featrow__d">Conjoint, enfants — le club compte les places</span>
            </span>
            <span class="featrow__end" data-count="part-accompagnants"></span>
          </button>
          <button class="featrow" data-feat="part-mvola" data-screen="participation">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Contribution par MVola</b>
              <span class="featrow__d">Le clavier s’ouvre avec le code déjà écrit</span>
            </span>
            <span class="featrow__end" data-count="part-mvola"></span>
          </button>
          <button class="featrow" data-feat="part-tranches" data-screen="participation">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Envoyer en plusieurs fois</b>
              <span class="featrow__d">Le total se cumule, le club pointe ce qu’il reçoit</span>
            </span>
            <span class="featrow__end" data-count="part-tranches"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Casier et notifications</h2>
        <div class="list">
          <button class="featrow" data-feat="cas-liste" data-screen="casier">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Casier des actualités</b>
              <span class="featrow__d">Sorties, compétitions, réunions, cérémonies</span>
            </span>
            <span class="featrow__end" data-count="cas-liste"></span>
          </button>
          <button class="featrow" data-feat="cas-filtre" data-screen="casier">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Filtres par catégorie</b>
              <span class="featrow__d">Pour retrouver un type d’annonce</span>
            </span>
            <span class="featrow__end" data-count="cas-filtre"></span>
          </button>
          <button class="featrow" data-feat="cas-detail" data-screen="casierDetail">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Détail d’une actualité</b>
              <span class="featrow__d">Date, lieu, texte, participation</span>
            </span>
            <span class="featrow__end" data-count="cas-detail"></span>
          </button>
          <button class="featrow" data-feat="not-centre" data-screen="notifications">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Centre de notifications</b>
              <span class="featrow__d">Lues et non lues, par date</span>
            </span>
            <span class="featrow__end" data-count="not-centre"></span>
          </button>
          <button class="featrow" data-feat="not-push" data-screen="notifications">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Notification sur le téléphone</b>
              <span class="featrow__d">Hors de l’application — à chiffrer</span>
            </span>
            <span class="featrow__end" data-count="not-push"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Album photo</h2>
        <div class="list">
          <button class="featrow" data-feat="alb-cat" data-screen="album">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Catégories d’album</b>
              <span class="featrow__d">Entraînements, compétitions, sorties, cérémonies</span>
            </span>
            <span class="featrow__end" data-count="alb-cat"></span>
          </button>
          <button class="featrow" data-feat="alb-grille" data-screen="album">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Grille de photos</b>
              <span class="featrow__d">Aperçu en vignettes</span>
            </span>
            <span class="featrow__end" data-count="alb-grille"></span>
          </button>
          <button class="featrow" data-feat="alb-grand" data-screen="photo">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Photo en grand</b>
              <span class="featrow__d">Plein écran avec légende</span>
            </span>
            <span class="featrow__end" data-count="alb-grand"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Messages</h2>
        <div class="list">
          <button class="featrow" data-feat="msg-club" data-screen="messages">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Salon de tout le club</b>
              <span class="featrow__d">Une annonce lue par les 64 membres</span>
            </span>
            <span class="featrow__end" data-count="msg-club"></span>
          </button>
          <button class="featrow" data-feat="msg-grade" data-screen="messages">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Salons par grade</b>
              <span class="featrow__d">Un fil par groupe de niveau</span>
            </span>
            <span class="featrow__end" data-count="msg-grade"></span>
          </button>
          <button class="featrow" data-feat="msg-evenement" data-screen="messages">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Salon par événement</b>
              <span class="featrow__d">Ouvert pour un tournoi, une sortie, puis archivé</span>
            </span>
            <span class="featrow__end" data-count="msg-evenement"></span>
          </button>
          <button class="featrow" data-feat="msg-direct" data-screen="salon">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Conversation à deux</b>
              <span class="featrow__d">Entre deux membres du club</span>
            </span>
            <span class="featrow__end" data-count="msg-direct"></span>
          </button>
          <button class="featrow" data-feat="msg-ecrire" data-screen="salon">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Écrire et recevoir en direct</b>
              <span class="featrow__d">Le message arrive sans rafraîchir</span>
            </span>
            <span class="featrow__end" data-count="msg-ecrire"></span>
          </button>
          <button class="featrow" data-feat="msg-signaler" data-screen="messages">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Signaler un message</b>
              <span class="featrow__d">Remonté à l’administration — le club compte des mineurs</span>
            </span>
            <span class="featrow__end" data-count="msg-signaler"></span>
          </button>
          <button class="featrow" data-feat="msg-qui" data-screen="messages">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Qui peut écrire à qui</b>
              <span class="featrow__d">À décider : élève vers élève, ou seulement vers un maître</span>
            </span>
            <span class="featrow__end" data-count="msg-qui"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Espace des maîtres</h2>
        <div class="list">
          <button class="featrow" data-feat="mt-espace" data-screen="maitres">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Espace réservé aux maîtres</b>
              <span class="featrow__d">Invisible pour les élèves, filtré côté serveur</span>
            </span>
            <span class="featrow__end" data-count="mt-espace"></span>
          </button>
          <button class="featrow" data-feat="mt-grades" data-screen="maitres">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Délibérations de passage de grade</b>
              <span class="featrow__d">Avant l’annonce publique</span>
            </span>
            <span class="featrow__end" data-count="mt-grades"></span>
          </button>
          <button class="featrow" data-feat="mt-situations" data-screen="maitres">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Situations individuelles</b>
              <span class="featrow__d">Blessure, absence, difficulté familiale</span>
            </span>
            <span class="featrow__end" data-count="mt-situations"></span>
          </button>
          <button class="featrow" data-feat="mt-signalements" data-screen="maitres">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Signalements reçus</b>
              <span class="featrow__d">Ce que la modération remonte</span>
            </span>
            <span class="featrow__end" data-count="mt-signalements"></span>
          </button>
          <button class="featrow" data-feat="mt-role" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Attribution du rôle de maître</b>
              <span class="featrow__d">Par l’administration seule</span>
            </span>
            <span class="featrow__end" data-count="mt-role"></span>
          </button>
          <button class="featrow" data-feat="mt-securite" data-screen="securite">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Comment la confidentialité est tenue</b>
              <span class="featrow__d">Rôles, filtre en base, journal des accès</span>
            </span>
            <span class="featrow__end" data-count="mt-securite"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Le club</h2>
        <div class="list">
          <button class="featrow" data-feat="clb-presentation" data-screen="club">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Présentation du club</b>
              <span class="featrow__d">Histoire et origine</span>
            </span>
            <span class="featrow__end" data-count="clb-presentation"></span>
          </button>
          <button class="featrow" data-feat="clb-valeurs" data-screen="club">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Valeurs</b>
              <span class="featrow__d">Trois principes affichés</span>
            </span>
            <span class="featrow__end" data-count="clb-valeurs"></span>
          </button>
          <button class="featrow" data-feat="clb-horaires" data-screen="club">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Horaires d’entraînement</b>
              <span class="featrow__d">Jours, heures, niveaux</span>
            </span>
            <span class="featrow__end" data-count="clb-horaires"></span>
          </button>
          <button class="featrow" data-feat="clb-contact" data-screen="club">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Contact et localisation</b>
              <span class="featrow__d">Responsable, téléphone, adresse</span>
            </span>
            <span class="featrow__end" data-count="clb-contact"></span>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <h2 class="overline">Administration</h2>
        <div class="list">
          <button class="featrow" data-feat="adm-ajout" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Ajouter un étudiant</b>
              <span class="featrow__d">Fiche, photo, grade, parents</span>
            </span>
            <span class="featrow__end" data-count="adm-ajout"></span>
          </button>
          <button class="featrow" data-feat="adm-modif" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Modifier une fiche</b>
              <span class="featrow__d">Corriger ou compléter</span>
            </span>
            <span class="featrow__end" data-count="adm-modif"></span>
          </button>
          <button class="featrow" data-feat="adm-grade" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Changer un grade</b>
              <span class="featrow__d">Après un passage validé</span>
            </span>
            <span class="featrow__end" data-count="adm-grade"></span>
          </button>
          <button class="featrow" data-feat="adm-comptes" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Comptes et accès</b>
              <span class="featrow__d">Créer, suspendre, réinitialiser</span>
            </span>
            <span class="featrow__end" data-count="adm-comptes"></span>
          </button>
          <button class="featrow" data-feat="adm-publier" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Publier une actualité</b>
              <span class="featrow__d">Et envoyer la notification</span>
            </span>
            <span class="featrow__end" data-count="adm-publier"></span>
          </button>
          <button class="featrow" data-feat="adm-album" data-screen="admin">
            <span style="flex-grow:1;min-width:0;text-align:left">
              <b class="featrow__t">Gérer les albums</b>
              <span class="featrow__d">Créer, ajouter et classer les photos</span>
            </span>
            <span class="featrow__end" data-count="adm-album"></span>
          </button>
        </div>
      </div>
    </div>
  </div>`
  },
  securite: {
    label: "20 · Sécurité et confidentialité",
    wide: true,
    html: `
  <div class="sheet">
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="overline">Note technique — messagerie et espace des maîtres</h2>
      <h1 class="display" style="font-size:30px;line-height:36px">Où se joue vraiment la confidentialité</h1>
      <p style="font-size:15px;line-height:24px;color:#59685F;max-width:620px">Le compte du club héberge les données — c’est la bonne décision, mais pour une autre raison que la sécurité : elle garantit que le club <b>reste propriétaire</b> de ses messages et de ses photos, quel que soit le prestataire. La confidentialité, elle, ne vient pas du compte : elle vient des <b>règles écrites dans la base</b>.</p>
    </div>

    <div class="sec__avert">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A3A12" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16"/><path d="M9.5 9.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2"/><path d="M6.4 6.6C4.3 8 3 10 3 12c0 0 3.5 5.5 9 5.5 1.5 0 2.9-.4 4.1-1"/><path d="M9.8 6.8A9.6 9.6 0 0 1 12 6.5c5.5 0 9 5.5 9 5.5a15 15 0 0 1-2.6 3.1"/></svg>
      <div>
        <p style="font-size:14px;font-weight:700;line-height:20px;color:#8A3A12">La clé publique de l’application est publique — c’est son nom</p>
        <p style="font-size:13.5px;line-height:21px;color:#7A4322;margin-top:5px">Elle est embarquée dans chaque téléphone et se lit en quelques minutes. Tout ce qui protège l’espace des maîtres tient donc aux règles posées sur les tables. Sans elles, n’importe quel élève lirait les délibérations de passage de grade. Avec elles, la requête revient vide.</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Les six tables</h2>
      <div class="sec__tables">
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>profils</b>
          <span>Une ligne par membre : nom, prénom, grade, rôle</span>
          <i>rôle : élève · maître · admin</i>
        </div>
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>salons</b>
          <span>Un fil de discussion : club, grade, événement, direct, maîtres</span>
          <i>type et titre</i>
        </div>
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>membres_salon</b>
          <span>Qui a le droit d’être dans quel salon</span>
          <i>la table qui décide de tout</i>
        </div>
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>messages</b>
          <span>Le texte, son auteur, son salon, sa date</span>
          <i>jamais lue sans passer par membres_salon</i>
        </div>
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>signalements</b>
          <span>Un message remonté à l’administration</span>
          <i>motif, auteur du signalement, suite donnée</i>
        </div>
        <div class="sec__table">
          <span class="sec__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg></span>
          <b>journal_acces</b>
          <span>Qui a ouvert l’espace des maîtres, et quand</span>
          <i>écrit par le serveur, non modifiable</i>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Les règles d’accès</h2>
      <p style="font-size:14px;line-height:22px;color:#59685F;max-width:620px">Elles sont posées une fois sur la base, et s’appliquent à toute requête, d’où qu’elle vienne — application, navigateur, outil de développement.</p>
      <div class="sec__regles">
        <div class="sec__regle">
          <b>Lire un message</b>
          <p class="sec__r">Autorisé si — et seulement si — je suis inscrit dans le salon.</p>
          <p class="sec__c">Un élève qui interroge directement la base sur les messages des maîtres reçoit une liste vide. Pas une erreur : rien.</p>
        </div>
        <div class="sec__regle">
          <b>Entrer dans un salon</b>
          <p class="sec__r">L’inscription est écrite par l’administration, jamais par l’application.</p>
          <p class="sec__c">Se déclarer maître depuis son téléphone ne produit rien : le rôle vit sur le serveur.</p>
        </div>
        <div class="sec__regle">
          <b>Écrire un message</b>
          <p class="sec__r">Autorisé dans mes salons, et l’auteur est forcé à mon identité.</p>
          <p class="sec__c">On ne peut pas écrire sous le nom d’un autre, même en trafiquant la requête.</p>
        </div>
        <div class="sec__regle">
          <b>Modifier un message</b>
          <p class="sec__r">L’auteur seul, et pendant quinze minutes.</p>
          <p class="sec__c">Passé ce délai, le fil devient une trace stable — utile en cas de litige.</p>
        </div>
        <div class="sec__regle">
          <b>Supprimer</b>
          <p class="sec__r">L’auteur ou l’administration. Le message reste marqué supprimé.</p>
          <p class="sec__c">Effacer une ligne ferait disparaître la preuve d’un signalement.</p>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Les trois rôles</h2>
      <div class="sec__roles">
        <div class="sec__role">
          <span class="sec__pastille" style="background:#12613C"></span>
          <b>Élève</b><i>64 personnes</i>
          <p>Lit et écrit dans ses salons. Voit la liste des membres, les actualités, l’album.</p>
        </div>
        <div class="sec__role">
          <span class="sec__pastille" style="background:#B0530F"></span>
          <b>Maître</b><i>4 personnes</i>
          <p>Tout ce que fait un élève, plus l’espace des maîtres et les signalements.</p>
        </div>
        <div class="sec__role">
          <span class="sec__pastille" style="background:#0E2119"></span>
          <b>Administration</b><i>1 ou 2 personnes</i>
          <p>Crée les comptes, accorde les rôles, publie, modère. Ne lit pas l’espace des maîtres sans y être inscrite.</p>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <h2 class="overline">Ce qui reste à décider</h2>
      <div class="sec__dec">
        <div class="sec__q">
          <b>Connexion par numéro de membre</b>
          <p>Le service d’authentification travaille par courriel ou par téléphone, pas par numéro de membre. Trois voies : un courriel réel par membre, un courriel construit à partir du numéro, ou un code par SMS — qui se paie à l’envoi, à Madagascar comme ailleurs.</p>
        </div>
        <div class="sec__q">
          <b>Les mineurs et la messagerie</b>
          <p>Un fil entre mineurs sans adulte est une responsabilité pour le club. Une piste : les conversations à deux ouvertes seulement vers un maître, les salons de groupe toujours visibles par un maître.</p>
        </div>
        <div class="sec__q">
          <b>Le coût</b>
          <p>L’offre gratuite suffit à 64 membres, mais un projet inactif sept jours est mis en pause et doit être relancé à la main. L’offre payante, environ 25 dollars par mois, supprime cette pause. À trancher avec le club.</p>
        </div>
        <div class="sec__q">
          <b>La conservation</b>
          <p>Combien de temps garde-t-on les messages ? Un an ? Sans réponse, ils s’accumulent indéfiniment, et l’espace payant arrive plus vite.</p>
        </div>
      </div>
    </div>

    <p style="font-size:13px;line-height:21px;color:#7C8B82;border-top:1px solid #E4EDE8;padding-top:20px">Rien de tout cela n’est développé : cette note décrit ce qui sera construit une fois la maquette validée. Elle est ici pour que la décision se prenne en connaissance de cause, pas après coup.</p>
  </div>`
  },
  impression: {
    label: "15 · Planche d’impression",
    wide: true,
    html: `
  <div class="sheet impr">
    <div class="impr__intro">
      <div style="display:flex;flex-direction:column;gap:8px">
        <h2 class="overline">Impression des cartes</h2>
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
        <div class="pc">
  <span class="pc__band" style="background:#4E9C57"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RAKOTONDRABE</b>
    <span class="pc__prenom">Nirina</span>
    <span class="pc__grade"><i style="background:#4E9C57"></i>Ceinture verte</span>
    <span class="pc__num">F04x042</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#D8A93A"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RASOAMANANA</b>
    <span class="pc__prenom">Fanjaniaina</span>
    <span class="pc__grade"><i style="background:#D8A93A"></i>Ceinture jaune</span>
    <span class="pc__num">F04x043</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#3E6E9C"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">ANDRIANJAFY</b>
    <span class="pc__prenom">Tokiniaina</span>
    <span class="pc__grade"><i style="background:#3E6E9C"></i>Ceinture bleue</span>
    <span class="pc__num">F04x044</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#1E2320"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RABEMANANJARA</b>
    <span class="pc__prenom">Hery</span>
    <span class="pc__grade"><i style="background:#1E2320"></i>Ceinture noire</span>
    <span class="pc__num">F04x045</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#C97A32"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RAZAFIMAHATRATRA</b>
    <span class="pc__prenom">Miora</span>
    <span class="pc__grade"><i style="background:#C97A32"></i>Ceinture orange</span>
    <span class="pc__num">F04x046</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#E7EDE9"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RANDRIAMAMPIONONA</b>
    <span class="pc__prenom">Toky</span>
    <span class="pc__grade"><i style="background:#E7EDE9"></i>Ceinture blanche</span>
    <span class="pc__num">F04x047</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#D8A93A"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RAHARISOA</b>
    <span class="pc__prenom">Fanja</span>
    <span class="pc__grade"><i style="background:#D8A93A"></i>Ceinture jaune</span>
    <span class="pc__num">F04x048</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#4E9C57"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">ANDRIAMBELO</b>
    <span class="pc__prenom">Rado</span>
    <span class="pc__grade"><i style="background:#4E9C57"></i>Ceinture verte</span>
    <span class="pc__num">F04x049</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#C97A32"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RAKOTOARISOA</b>
    <span class="pc__prenom">Lalaina</span>
    <span class="pc__grade"><i style="background:#C97A32"></i>Ceinture orange</span>
    <span class="pc__num">F04x050</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
        <div class="pc">
  <span class="pc__band" style="background:#E7EDE9"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RANDRIANASOLO</b>
    <span class="pc__prenom">Mamy</span>
    <span class="pc__grade"><i style="background:#E7EDE9"></i>Ceinture blanche</span>
    <span class="pc__num">F04x051</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
      </div>
      <span class="planche__pied">Kwoon Analamahitsy · planche de 10 cartes · maquette</span>
    </div></div>

    <div class="impr__zoom">
      <h2 class="overline">La carte en détail</h2>
      <div class="impr__duo">
        <div>
          <p class="impr__lab">Recto — grandeur réelle</p>
          <div class="pc">
  <span class="pc__band" style="background:#4E9C57"></span>
  <span class="pc__logo"><span class="emblem"></span></span>
  <span class="pc__org">KWOON ANALAMAHITSY</span>
  <span class="pc__photo" style="width:18mm">
  <svg viewBox="0 0 24 24" fill="none" stroke="#8FB3A0" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
  </svg></span>
  <span class="pc__id">
    <b class="pc__nom">RAKOTONDRABE</b>
    <span class="pc__prenom">Nirina</span>
    <span class="pc__grade"><i style="background:#4E9C57"></i>Ceinture verte</span>
    <span class="pc__num">F04x042</span>
  </span>
  <span class="pc__qr"><svg viewBox="-2 -2 25 25" width="128" height="128" shape-rendering="crispEdges" aria-label="Code QR de démonstration">
    <rect x="-2" y="-2" width="25" height="25" fill="#FFF"/>
    <g fill="#0E2119"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/><rect x="14" y="0" width="1" height="1"/><rect x="15" y="0" width="1" height="1"/><rect x="16" y="0" width="1" height="1"/><rect x="17" y="0" width="1" height="1"/><rect x="18" y="0" width="1" height="1"/><rect x="19" y="0" width="1" height="1"/><rect x="20" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="12" y="1" width="1" height="1"/><rect x="14" y="1" width="1" height="1"/><rect x="20" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/><rect x="12" y="2" width="1" height="1"/><rect x="14" y="2" width="1" height="1"/><rect x="16" y="2" width="1" height="1"/><rect x="17" y="2" width="1" height="1"/><rect x="18" y="2" width="1" height="1"/><rect x="20" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="14" y="3" width="1" height="1"/><rect x="16" y="3" width="1" height="1"/><rect x="17" y="3" width="1" height="1"/><rect x="18" y="3" width="1" height="1"/><rect x="20" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/><rect x="17" y="4" width="1" height="1"/><rect x="18" y="4" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="14" y="5" width="1" height="1"/><rect x="20" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="10" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="15" y="6" width="1" height="1"/><rect x="16" y="6" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="18" y="6" width="1" height="1"/><rect x="19" y="6" width="1" height="1"/><rect x="20" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="20" y="7" width="1" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="16" y="8" width="1" height="1"/><rect x="18" y="8" width="1" height="1"/><rect x="0" y="9" width="1" height="1"/><rect x="11" y="9" width="1" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="14" y="9" width="1" height="1"/><rect x="15" y="9" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="20" y="10" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="13" y="11" width="1" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="0" y="12" width="1" height="1"/><rect x="1" y="12" width="1" height="1"/><rect x="2" y="12" width="1" height="1"/><rect x="6" y="12" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="12" width="1" height="1"/><rect x="15" y="12" width="1" height="1"/><rect x="16" y="12" width="1" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="5" y="13" width="1" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="13" y="13" width="1" height="1"/><rect x="20" y="13" width="1" height="1"/><rect x="0" y="14" width="1" height="1"/><rect x="1" y="14" width="1" height="1"/><rect x="2" y="14" width="1" height="1"/><rect x="3" y="14" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="5" y="14" width="1" height="1"/><rect x="6" y="14" width="1" height="1"/><rect x="7" y="14" width="1" height="1"/><rect x="8" y="14" width="1" height="1"/><rect x="9" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="0" y="15" width="1" height="1"/><rect x="6" y="15" width="1" height="1"/><rect x="9" y="15" width="1" height="1"/><rect x="12" y="15" width="1" height="1"/><rect x="15" y="15" width="1" height="1"/><rect x="18" y="15" width="1" height="1"/><rect x="0" y="16" width="1" height="1"/><rect x="2" y="16" width="1" height="1"/><rect x="3" y="16" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/><rect x="6" y="16" width="1" height="1"/><rect x="8" y="16" width="1" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="16" y="16" width="1" height="1"/><rect x="19" y="16" width="1" height="1"/><rect x="20" y="16" width="1" height="1"/><rect x="0" y="17" width="1" height="1"/><rect x="2" y="17" width="1" height="1"/><rect x="3" y="17" width="1" height="1"/><rect x="4" y="17" width="1" height="1"/><rect x="6" y="17" width="1" height="1"/><rect x="10" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="18" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/><rect x="0" y="18" width="1" height="1"/><rect x="2" y="18" width="1" height="1"/><rect x="3" y="18" width="1" height="1"/><rect x="4" y="18" width="1" height="1"/><rect x="6" y="18" width="1" height="1"/><rect x="8" y="18" width="1" height="1"/><rect x="15" y="18" width="1" height="1"/><rect x="17" y="18" width="1" height="1"/><rect x="19" y="18" width="1" height="1"/><rect x="0" y="19" width="1" height="1"/><rect x="6" y="19" width="1" height="1"/><rect x="16" y="19" width="1" height="1"/><rect x="17" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/><rect x="19" y="19" width="1" height="1"/><rect x="20" y="19" width="1" height="1"/><rect x="0" y="20" width="1" height="1"/><rect x="1" y="20" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/><rect x="3" y="20" width="1" height="1"/><rect x="4" y="20" width="1" height="1"/><rect x="5" y="20" width="1" height="1"/><rect x="6" y="20" width="1" height="1"/><rect x="7" y="20" width="1" height="1"/><rect x="10" y="20" width="1" height="1"/><rect x="13" y="20" width="1" height="1"/><rect x="16" y="20" width="1" height="1"/><rect x="19" y="20" width="1" height="1"/></g>
  </svg></span>
</div>
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
  </div>`
  }
};
