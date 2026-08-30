/* ============================================================
   icones.mjs — Le trait des icônes, et rien d'autre.

   Un seul dessin par icône, lu par la maquette ET par
   l'application. Les recopier dans app/ aurait marché le premier
   jour ; le jour où l'on corrige une flèche, l'une des deux
   garderait l'ancienne sans que personne le voie.
   ============================================================ */

export const ICON = {
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
