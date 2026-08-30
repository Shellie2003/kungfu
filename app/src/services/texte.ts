/* ============================================================
   Les petites manipulations de texte, à un seul endroit.

   Elles étaient recopiées dans trois écrans — l'annuaire, le choix
   d'un membre par l'administration, la liste des comptes. Trois
   copies d'une même règle, c'est trois occasions de la corriger
   dans deux endroits sur trois.
   ============================================================ */

/* Les accents ne doivent pas empêcher de trouver quelqu'un :
   « Razafimahatratra » se cherche aussi bien sans eux, et un
   téléphone malgache ne pose pas toujours les accents.

   NFD sépare la lettre de son accent ; le remplacement retire les
   accents restés seuls. */
export const pliage = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Le filtre par grade n'a pas la place d'écrire « Ceinture verte »
   cinq fois de suite ; il garde la couleur seule, avec sa majuscule
   — sans quoi la puce affiche « verte », qui se lit comme une
   faute. */
export const courtGrade = (nom: string) => {
  const reste = nom.replace(/^Ceinture\s+/i, '');
  return reste.charAt(0).toUpperCase() + reste.slice(1);
};

/* Cherche un mot dans un ensemble de champs, accents et casse
   ignorés. Une requête vide accepte tout : un filtre de recherche
   ne doit pas vider la liste avant qu'on ait tapé. */
export const correspond = (requete: string, ...champs: (string | null | undefined)[]) => {
  const q = pliage(requete.trim());
  if (!q) return true;
  return pliage(champs.filter(Boolean).join(' ')).includes(q);
};
