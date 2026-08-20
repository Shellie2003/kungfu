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
          <p style="font-size:14px;color:#B9D4C6;margin-top:4px">Analamahitsy</p>
        </div>
      </div>

      <div style="background:#FFF;border-radius:20px;padding:24px 20px;display:flex;flex-direction:column;gap:18px">
        <p style="font-size:17px;font-weight:700">Connexion membre</p>
        <label class="field"><span class="field__label">Numéro de membre</span>
          <span class="input">WA-0042</span></label>
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
        <p style="font-size:13px;color:#B9D4C6;margin-top:2px">Analamahitsy · Antananarivo</p>
      </div>
      <button class="tapicon" data-go="notifications" aria-label="Notifications" style="position:relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9"/><path d="M10 18a2 2 0 0 0 4 0"/></svg><span class="dot">3</span>
      </button>
    </div>

    <div class="hero__note">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7FD9A8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <div style="flex-grow:1">
        <p style="font-size:14px;font-weight:600;color:#FFF;line-height:19px">Sortie prévue samedi 22 novembre</p>
        <p style="font-size:12px;color:#B9D4C6;margin-top:3px">Consultez le casier pour les détails.</p>
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
        <p style="font-size:14px;line-height:22px;color:#59685F;margin-top:8px">Un club ouvert à tous les âges, où la discipline se transmet par la pratique régulière. Entraînements trois fois par semaine à Analamahitsy.</p>
        <button class="linkrow" data-go="club">En savoir plus sur le club <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12613C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button>
      </div>
    </div>

    <div class="stats">
      <div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">64</p>
        <p style="font-size:11px;color:#59685F;margin-top:3px">membres</p>
      </div>
      <div class="card" style="padding:14px 12px;text-align:center">
        <p class="display" style="font-size:22px;color:#0F5132">3</p>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
        <div><span>Numéro de membre</span><b>WA-0042</b></div>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <button class="tabbar__item" data-go="casier" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
      <button class="btn btn--primary">J’y participe</button>
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
    <button class="tabbar__item" data-go="casier" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <span style="width:12px"></span>
    <h1 class="apphead__title">Le Club</h1>
    
  </div>

  <div style="flex-grow:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:22px">
    <div style="background:#0F5132;border-radius:18px;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div class="emblem emblem--lg"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg></div>
      <div>
        <p class="display" style="font-size:20px;color:#FFF;line-height:25px">Kung-fu Waishi<br>Analamahitsy</p>
        <p style="font-size:13px;color:#B9D4C6;margin-top:8px">Fondé en 2014 · Antananarivo</p>
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
      <h2 class="overline">Entraînements</h2>
      <div class="card" style="padding:16px"><div class="deflist">
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Lundi</span><span style="flex-grow:1;color:#3C4A42">17h30 – 19h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Tous niveaux</b></div>
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Mercredi</span><span style="flex-grow:1;color:#3C4A42">17h30 – 19h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Débutants</b></div>
        <div><span style="width:74px;flex:none;color:#0E2119;font-weight:600">Samedi</span><span style="flex-grow:1;color:#3C4A42">09h00 – 11h00</span><b style="font-size:12px;color:#7C8B82;font-weight:400">Gradés</b></div>
      </div></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <h2 class="overline">Contact</h2>
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
    <button class="tabbar__item" data-go="accueil">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Accueil</span>
    </button>
    <button class="tabbar__item" data-go="etudiants">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="8" r="2.4"/><path d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Étudiants</span>
    </button>
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club" aria-current="page">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0F5132" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;font-weight:700;color:#0F5132">Le Club</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
          <label class="field"><span class="field__label">Numéro de membre</span><span class="input">WA-0042</span></label>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
          <b>3</b><span>séances</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
    <button class="tabbar__item" data-go="casier">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Casier</span>
    </button>
    <button class="tabbar__item" data-go="album">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5"/></svg>
      <span style="font-size:10px;color:#7C8B82">Album</span>
    </button>
    <button class="tabbar__item" data-go="club">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#7C8B82" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5v-5z"/></svg>
      <span style="font-size:10px;color:#7C8B82">Le Club</span>
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
            <span class="carte__num">WA-0042</span>
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
    <span class="pc__num">WA-0042</span>
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
    <span class="pc__num">WA-0043</span>
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
    <span class="pc__num">WA-0044</span>
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
    <span class="pc__num">WA-0045</span>
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
    <span class="pc__num">WA-0046</span>
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
    <span class="pc__num">WA-0047</span>
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
    <span class="pc__num">WA-0048</span>
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
    <span class="pc__num">WA-0049</span>
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
    <span class="pc__num">WA-0050</span>
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
    <span class="pc__num">WA-0051</span>
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
    <span class="pc__num">WA-0042</span>
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
