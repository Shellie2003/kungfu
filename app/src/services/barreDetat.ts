/* ============================================================
   La barre d'état d'Android — l'heure, la batterie, le réseau.

   ------------------------------------------------------------
   CE QUI A CHANGÉ SOUS NOS PIEDS, ET QU'IL A FALLU LIRE POUR LE
   SAVOIR

   L'application posait deux réglages au démarrage, une fois pour
   toutes : icônes en CLAIR, et fond de la barre en vert du club. Sur
   Android 14 et avant, cela marche — la barre est peinte en vert, les
   icônes blanches s'y lisent, et c'est fini.

   Depuis Android 15, non. On l'a lu dans la source du greffon, et
   non deviné : « shouldSetStatusBarColor » rend FAUX dès que
   l'appareil est en API 35 ou plus, sauf si l'application refuse
   explicitement le plein écran ; en API 36 il rend faux tout court.
   « setBackgroundColor » ne fait donc plus RIEN, en silence.

   Conséquence : la barre laisse voir la page. Sur l'accueil, dont le
   haut est vert, des icônes claires se lisent. Sur tous les autres
   écrans, dont la barre de titre est BLANCHE, des icônes claires
   deviennent invisibles — l'heure et la batterie disparaissent.

   ------------------------------------------------------------
   CE QU'ON FAIT À LA PLACE, ET POURQUOI PAS UNE LISTE D'ÉCRANS

   On MESURE la couleur réellement peinte tout en haut de la page, et
   l'on choisit les icônes selon sa luminance. Une liste d'écrans
   sombres aurait marché aujourd'hui et se serait périmée au premier
   écran ajouté — c'est exactement ce qui vient d'arriver à la liste
   des sections de l'écran d'administration. Ici, un nouvel écran à
   bandeau sombre obtient les bonnes icônes sans que personne y
   pense.

   ------------------------------------------------------------
   CE QUE CE FICHIER NE FAIT PAS

   Il ne touche pas au FOND de la barre : sur Android 15 on ne peut
   plus, et sur Android 14 le fond de la page fait déjà l'affaire
   puisque la marge de sécurité laisse la place. Un seul comportement
   pour toutes les versions vaut mieux que deux à tenir.
   ============================================================ */

/* Le seuil de luminance : au-dessus, le fond est clair et il faut des
   icônes SOMBRES. C'est celui qu'emploie le greffon lui-même dans
   « setBackgroundColor » — autant décider comme lui. */
const CLAIR = 0.5;

/* La luminance perçue d'une couleur « rgb(r, g, b) », telle que la
   définit le WCAG. Le vert et le rouge ne pèsent pas pareil dans ce
   que l'œil appelle « clair ». */
function luminance(couleur: string): number | null {
  const m = couleur.match(/rgba?\(([^)]+)\)/);
  if (!m?.[1]) return null;
  const [r, v, b, a] = m[1].split(',').map((x) => Number(x.trim()));
  if (r === undefined || v === undefined || b === undefined) return null;
  /* Transparent : la couleur n'est pas celle-là, c'est celle de
     dessous. On rend « null » plutôt que de compter du noir. */
  if (a !== undefined && a < 0.5) return null;
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);
}

/* La couleur peinte tout en haut de l'écran. On descend l'arbre
   depuis le premier élément qui touche le bord supérieur, en sautant
   ce qui est transparent — c'est ce que l'œil voit derrière la barre
   d'état. */
export function couleurDuHaut(): string | null {
  const sous = document.elementsFromPoint(window.innerWidth / 2, 2);
  for (const e of sous) {
    const fond = getComputedStyle(e).backgroundColor;
    if (luminance(fond) !== null) return fond;
  }
  return null;
}

/* « Le haut de l'écran est-il clair ? » — donc « faut-il des icônes
   sombres ? ». Nul si l'on n'a pas su décider : l'appelant garde
   alors ce qu'il avait, plutôt que de faire clignoter la barre. */
export function hautEstClair(): boolean | null {
  const c = couleurDuHaut();
  if (!c) return null;
  const l = luminance(c);
  return l === null ? null : l > CLAIR;
}

/* ------------------------------------------------------------
   Poser le style, si l'on est bien dans l'APK.

   Le greffon n'existe pas sur le web : l'import échoue, et il n'y a
   rien à faire — le navigateur a sa propre barre, qu'il gère seul.

   « Light » et « Dark » se lisent à l'envers de ce qu'on croit dans
   ce greffon : « Light » signifie un FOND clair, donc du contenu
   sombre. C'est la convention d'Apple, reprise par Capacitor, et
   elle a déjà fait poser l'inverse à plus d'un.
   ------------------------------------------------------------ */
let dernier: boolean | null = null;

export async function accorderLaBarre(): Promise<void> {
  const clair = hautEstClair();
  if (clair === null || clair === dernier) return;
  dernier = clair;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: clair ? Style.Light : Style.Dark });
  } catch {
    /* Sur le web, il n'y a pas de barre à accorder. */
  }
}

/* Exportée pour les tests : sans cela, deux essais de suite
   partageraient la mémoire du dernier réglage et le second ne
   ferait rien. */
export function oublierLaBarre(): void {
  dernier = null;
}
