/* ============================================================
   Le carrousel de l'accueil.

   « Je veux que cette carte devienne un carrousel auto-animé, pour
   plus de visionnage de l'info et d'image. »

   Trois décisions, et chacune vient d'une contrainte réelle :

   1. Un VRAI défilement horizontal, avec accroche — pas une pile
      d'images qu'un minuteur fait apparaître. Le doigt doit pouvoir
      prendre la main à tout instant, et le navigateur fait cela
      mieux que nous : inertie, rebond, clavier, lecteur d'écran.
      L'animation ne fait que déplacer ce défilement.

   2. Elle S'ARRÊTE dès qu'on touche, et ne repart pas. Un carrousel
      qui reprend la main pendant qu'on regarde une photo est une
      brimade ; ici, on regarde encore plus souvent qu'on ne balaie.

   3. Elle ne démarre pas du tout si la personne a demandé moins
      d'animation, ou si l'onglet n'est pas au premier plan — un
      minuteur qui tourne dans un onglet caché ne montre rien à
      personne et vide la batterie.

   Une seule vue ⇒ aucun minuteur, aucun point : c'est une photo,
   pas un carrousel. C'est ce qui permet à l'accueil de rester
   IDENTIQUE à la maquette tant que le club n'a fourni qu'une image.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';

export type Vue = {
  /* L'adresse signée de l'image. « null » = l'emplacement se montre
     vide plutôt que cassé : une image d'illustration prise ailleurs
     ferait plus joli et serait un mensonge. */
  src: string | null;
  legende?: string | null;
  /* Ce que fait un appui. Absent : la vue ne se touche pas. */
  onClick?: () => void;
  cle: string;
};

const DELAI = 4500;

export function Carrousel({
  vues,
  vide,
  nomAccessible = 'Photos du club'
}: {
  vues: Vue[];
  /* Ce qu'on montre quand il n'y a RIEN — l'emplacement de la
     maquette, ou le bouton qui propose de le remplir. */
  vide: React.ReactNode;
  nomAccessible?: string;
}) {
  const piste = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);
  /* Posé dès le premier geste, jamais retiré : voir la décision 2. */
  const [manuel, setManuel] = useState(false);

  /* Quelle vue est à l'écran. On le LIT du défilement plutôt que de
     le déduire du minuteur : sinon, un balayage à la main
     désynchronise les points de ce qu'on voit. */
  useEffect(() => {
    const el = piste.current;
    if (!el) return;
    let attente = 0;
    const regarder = () => {
      cancelAnimationFrame(attente);
      attente = requestAnimationFrame(() => {
        const largeur = el.clientWidth || 1;
        setActif(Math.round(el.scrollLeft / largeur));
      });
    };
    el.addEventListener('scroll', regarder, { passive: true });
    return () => {
      cancelAnimationFrame(attente);
      el.removeEventListener('scroll', regarder);
    };
  }, [vues.length]);

  useEffect(() => {
    if (manuel || vues.length < 2) return;
    /* La préférence système d'abord : elle prime sur notre envie de
       montrer des choses. */
    const sobre = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (sobre?.matches) return;

    const minuteur = window.setInterval(() => {
      const el = piste.current;
      if (!el || document.visibilityState !== 'visible') return;
      const largeur = el.clientWidth || 1;
      const suivante = (Math.round(el.scrollLeft / largeur) + 1) % vues.length;
      el.scrollTo({ left: suivante * largeur, behavior: 'smooth' });
    }, DELAI);

    return () => window.clearInterval(minuteur);
  }, [manuel, vues.length]);

  if (vues.length === 0) return <>{vide}</>;

  const arreter = () => setManuel(true);

  return (
    <div>
      <div
        ref={piste}
        className="carrousel"
        /* « group » et non « region » : une région demande un nom
           dans le plan du document et alourdit la navigation pour
           une bande d'images. */
        role="group"
        aria-roledescription="carrousel"
        aria-label={nomAccessible}
        onPointerDown={arreter}
        onKeyDown={arreter}
        onWheel={arreter}
      >
        {vues.map((v, i) => {
          const dedans = (
            <>
              {v.src ? (
                <img
                  src={v.src}
                  alt=""
                  /* La première compte : c'est celle qu'on voit en
                     arrivant. Les suivantes attendent d'être
                     approchées — sur un réseau malgache, charger huit
                     photos pour en montrer une est une dépense. */
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--vert-clair)' }} />
              )}
              {v.legende && <span className="carrousel__legende">{v.legende}</span>}
            </>
          );

          return v.onClick ? (
            <button
              key={v.cle}
              type="button"
              className="carrousel__vue"
              onClick={v.onClick}
              aria-label={v.legende ?? `Image ${i + 1} sur ${vues.length}`}
              style={{ padding: 0, border: 0, background: 'none', textAlign: 'left' }}
            >
              {dedans}
            </button>
          ) : (
            <div
              key={v.cle}
              className="carrousel__vue"
              aria-label={`Image ${i + 1} sur ${vues.length}`}
            >
              {dedans}
            </div>
          );
        })}
      </div>

      {/* Les points ne sont pas décoratifs : sans eux, on ne sait pas
          qu'il y a autre chose à voir, et le carrousel se réduit à
          une image qui change toute seule sans qu'on comprenne
          pourquoi. Ils ne sont pas cliquables — la piste se balaie —
          d'où « aria-hidden » : ce qu'ils disent, le compte des vues
          le dit déjà à un lecteur d'écran. */}
      {vues.length > 1 && (
        <div className="carrousel__points" aria-hidden="true">
          {vues.map((v, i) => (
            <span
              key={v.cle}
              className={`carrousel__point${i === actif ? ' carrousel__point--actif' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
