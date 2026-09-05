/* ============================================================
   Glisser d'une image à l'autre.

   « Dans l'album je veux qu'on puisse défiler l'image de droite vers
   la gauche comme un carrousel, et c'est pareil si quelqu'un envoie
   plusieurs images à la fois. »

   ------------------------------------------------------------
   CE QUE CES TESTS TIENNENT, ET CE QU'ILS NE PEUVENT PAS TENIR

   Ils tiennent la DÉCISION : à partir de quel mouvement on change
   d'image, et surtout dans quels cas on ne change pas. C'est là que
   sont les défauts — un doigt qui descend pour lire une légende ne
   doit pas tourner la page, et deux doigts qui s'écartent pour
   agrandir non plus.

   Ils ne tiennent pas la sensation du geste, qui ne se mesure que
   sur un vrai téléphone. jsdom n'a ni inertie ni pixels.
   ============================================================ */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Album, Photo } from '../src/ecrans/Album';
import { useGlisser } from '../src/ui/glisser';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { rendre, PROFIL_ELEVE } from './rendu';

const ALBUM = {
  id: 'al1',
  titre: 'Compétitions',
  categorie: 'Compétitions',
  cree_le: '2026-01-01T00:00:00Z',
  couverture: null,
  photos: [
    { id: 'p1', chemin: 'album/1.jpg', legende: 'Première', rang: 0 },
    { id: 'p2', chemin: 'album/2.jpg', legende: 'Deuxième', rang: 1 },
    { id: 'p3', chemin: 'album/3.jpg', legende: 'Troisième', rang: 2 }
  ]
};

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

/* ------------------------------------------------------------
   Le geste, isolé.

   Un composant minuscule qui ne fait qu'annoncer ce qu'il a compris.
   On mesure ainsi la RÈGLE sans traverser un écran entier.
   ------------------------------------------------------------ */
function Bac({ gauche, droite }: { gauche?: () => void; droite?: () => void }) {
  const { gestes, decalage, enGeste } = useGlisser({ versLaGauche: gauche, versLaDroite: droite });
  return (
    <div
      data-testid="bac"
      style={{ width: 300, height: 300 }}
      data-decalage={String(Math.round(decalage))}
      data-engeste={String(enGeste)}
      {...gestes}
    >
      image
    </div>
  );
}

const glisser = (
  el: HTMLElement,
  { de, a, y = 0, id = 1 }: { de: number; a: number; y?: number; id?: number }
) => {
  fireEvent.pointerDown(el, { clientX: de, clientY: 0, pointerId: id, isPrimary: true });
  fireEvent.pointerUp(el, { clientX: a, clientY: y, pointerId: id, isPrimary: true });
};

describe('le geste', () => {
  test('vers la gauche, on va à la suivante', () => {
    /* On tourne la page d'un livre : le doigt part à gauche, la page
       suivante arrive. */
    const gauche = vi.fn();
    const droite = vi.fn();
    render(<Bac gauche={gauche} droite={droite} />);

    glisser(screen.getByTestId('bac'), { de: 200, a: 60 });
    expect(gauche).toHaveBeenCalledTimes(1);
    expect(droite).not.toHaveBeenCalled();
  });

  test('vers la droite, on revient à la précédente', () => {
    const gauche = vi.fn();
    const droite = vi.fn();
    render(<Bac gauche={gauche} droite={droite} />);

    glisser(screen.getByTestId('bac'), { de: 60, a: 200 });
    expect(droite).toHaveBeenCalledTimes(1);
  });

  test('un doigt qui tremble ne tourne pas la page', () => {
    /* Vingt pixels, c'est un appui, pas un glissement. Sans seuil,
       toucher l'image pour la regarder la ferait défiler. */
    const gauche = vi.fn();
    render(<Bac gauche={gauche} droite={vi.fn()} />);

    glisser(screen.getByTestId('bac'), { de: 200, a: 180 });
    expect(gauche).not.toHaveBeenCalled();
  });

  test('un mouvement VERTICAL ne change pas d’image', () => {
    /* LE CAS QUI COMPTE. On descend pour lire la légende ou pour
       faire défiler la page ; si le moindre écart horizontal
       comptait, la photo changerait sous les yeux au milieu de la
       lecture. */
    const gauche = vi.fn();
    const droite = vi.fn();
    render(<Bac gauche={gauche} droite={droite} />);

    /* Soixante pixels à gauche, mais deux cents vers le bas : c'est
       un défilement. */
    glisser(screen.getByTestId('bac'), { de: 200, a: 140, y: 200 });
    expect(gauche).not.toHaveBeenCalled();
    expect(droite).not.toHaveBeenCalled();
  });

  test('DEUX doigts, c’est un zoom — jamais un glissement', () => {
    /* Le zoom à deux doigts vient d'être rendu à l'application, et
       c'est sur une photo qu'on s'en sert. Sans cette garde, écarter
       les doigts pour agrandir passerait à l'image suivante. */
    const gauche = vi.fn();
    render(<Bac gauche={gauche} droite={vi.fn()} />);
    const el = screen.getByTestId('bac');

    fireEvent.pointerDown(el, { clientX: 200, clientY: 0, pointerId: 1, isPrimary: true });
    fireEvent.pointerDown(el, { clientX: 210, clientY: 0, pointerId: 2, isPrimary: false });
    fireEvent.pointerUp(el, { clientX: 40, clientY: 0, pointerId: 1, isPrimary: true });

    expect(gauche).not.toHaveBeenCalled();
  });
});

describe('l’album', () => {
  test('la grille mène à la photo choisie', async () => {
    poser({ albums: [ALBUM] });
    rendre(<Album />, { route: '/album', profil: PROFIL_ELEVE });

    /* « Compétitions » apparaît deux fois — la puce de filtre et le
       titre de la section — d'où le compte de photos, qui lui est
       unique. */
    expect(await screen.findByText('3 photos')).toBeInTheDocument();
  });

  test('les flèches n’apparaissent qu’où il y a quelque chose à voir', async () => {
    /* Sur la première photo, pas de « précédente » : une flèche qui
       ne fait rien se lit comme une panne. */
    poser({ albums: [ALBUM] });
    rendre(<Photo />, { route: '/album/al1/0', chemin: '/album/:id/:index', profil: PROFIL_ELEVE });

    expect(await screen.findByText('1 sur 3')).toBeInTheDocument();
    expect(screen.queryByLabelText('Photo précédente')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Photo suivante')).toBeInTheDocument();
  });

  test('au milieu, les deux flèches sont là', async () => {
    poser({ albums: [ALBUM] });
    rendre(<Photo />, { route: '/album/al1/1', chemin: '/album/:id/:index', profil: PROFIL_ELEVE });

    expect(await screen.findByText('2 sur 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Photo précédente')).toBeInTheDocument();
    expect(screen.getByLabelText('Photo suivante')).toBeInTheDocument();
  });

  test('la dernière photo n’en propose pas de suivante — la liste ne boucle pas', async () => {
    /* Revenir à la première après la dernière ferait perdre le
       compte : « 3 sur 3 » n'aurait plus de sens si l'on peut tourner
       indéfiniment, et l'on ne saurait plus si l'on a tout vu. */
    poser({ albums: [ALBUM] });
    rendre(<Photo />, { route: '/album/al1/2', chemin: '/album/:id/:index', profil: PROFIL_ELEVE });

    expect(await screen.findByText('3 sur 3')).toBeInTheDocument();
    expect(screen.queryByLabelText('Photo suivante')).not.toBeInTheDocument();
  });

  test('la flèche mène à la photo suivante', async () => {
    poser({ albums: [ALBUM] });
    rendre(<Photo />, { route: '/album/al1/0', chemin: '/album/:id/:index', profil: PROFIL_ELEVE });

    await userEvent.click(await screen.findByLabelText('Photo suivante'));
    expect(await screen.findByText('2 sur 3')).toBeInTheDocument();
  });
});

/* ============================================================
   ⚠ CE QUI MANQUAIT : LE GESTE NE RÉPONDAIT PAS.

   « Je veux une animation de glissement entre les photos, car ce
   qui est présent est trop sec. »

   Il l'était pour une raison précise, et les essais ci-dessus ne
   pouvaient pas la voir : ils vérifiaient la DÉCISION — à partir de
   quel mouvement on change d'image — et elle était juste. Ce qui
   manquait, c'est tout ce qui se passe AVANT la décision : rien ne
   bougeait tant que le doigt était posé. L'image restait immobile,
   puis était remplacée d'un coup.

   Un essai qui ne regarde que le résultat d'un geste ne peut pas
   dire que le geste était mort. Ceux-ci regardent le PENDANT.
   ============================================================ */
describe('l’image suit le doigt', () => {
  const poser = (el: HTMLElement, x: number) =>
    fireEvent.pointerDown(el, { clientX: x, clientY: 0, pointerId: 1, isPrimary: true });
  const bouger = (el: HTMLElement, x: number, y = 0) =>
    fireEvent.pointerMove(el, { clientX: x, clientY: y, pointerId: 1, isPrimary: true });

  test('elle se déplace pendant le geste, et pas seulement à la fin', () => {
    render(<Bac gauche={vi.fn()} droite={vi.fn()} />);
    const bac = screen.getByTestId('bac');

    expect(bac.dataset.decalage).toBe('0');
    poser(bac, 200);
    bouger(bac, 160);

    expect(bac.dataset.engeste).toBe('true');
    expect(Number(bac.dataset.decalage)).toBeLessThan(0);
  });

  test('un effleurement ne fait rien bouger', () => {
    /* Sous huit pixels, c'est la main qui tremble. Suivre dès le
       premier pixel ferait frémir l'image à chaque appui. */
    render(<Bac gauche={vi.fn()} droite={vi.fn()} />);
    const bac = screen.getByTestId('bac');

    poser(bac, 200);
    bouger(bac, 195);
    expect(bac.dataset.decalage).toBe('0');
    expect(bac.dataset.engeste).toBe('false');
  });

  test('⚠ un doigt qui DESCEND ne déplace pas l’image de côté', () => {
    /* Le même cas que pour la décision, mais pendant le geste : on
       descend pour lire la légende. Sans cette garde, la photo
       partirait de travers sous les yeux au milieu de la lecture —
       et cela se verrait bien avant que la page ne tourne. */
    render(<Bac gauche={vi.fn()} droite={vi.fn()} />);
    const bac = screen.getByTestId('bac');

    poser(bac, 200);
    bouger(bac, 180, 200);
    expect(bac.dataset.decalage).toBe('0');
  });

  test('l’image revient en place si l’on n’est pas allé assez loin', () => {
    render(<Bac gauche={vi.fn()} droite={vi.fn()} />);
    const bac = screen.getByTestId('bac');

    poser(bac, 200);
    bouger(bac, 170);
    expect(Number(bac.dataset.decalage)).not.toBe(0);

    fireEvent.pointerUp(bac, { clientX: 170, clientY: 0, pointerId: 1, isPrimary: true });
    /* Retour à zéro : c'est ce mouvement de retour qui dit « pas
       assez loin » sans un mot. */
    expect(bac.dataset.decalage).toBe('0');
    expect(bac.dataset.engeste).toBe('false');
  });

  test('sur la DERNIÈRE image, le geste résiste au lieu de suivre', () => {
    /* Il n'y a rien à montrer de ce côté. Suivre le doigt
       normalement promettrait une image qui n'arrivera jamais ;
       ne rien faire du tout donnerait un écran mort. La résistance
       répond, et dit qu'on est au bout. */
    render(<Bac gauche={undefined} droite={vi.fn()} />);
    const bac = screen.getByTestId('bac');

    poser(bac, 200);
    bouger(bac, 100);
    const dur = Math.abs(Number(bac.dataset.decalage));

    expect(dur).toBeGreaterThan(0);
    expect(dur).toBeLessThan(100 * 0.5);
  });
});
