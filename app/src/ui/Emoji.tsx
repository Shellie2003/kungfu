/* ============================================================
   Les emoji.

   Demande du club. Le clavier d'Android en propose déjà, mais pas
   celui de la version web sur un ordinateur, et surtout : le clavier
   emoji d'Android s'ouvre à la place du clavier de texte, ce qui
   oblige à basculer deux fois pour écrire « bravo 👏 ».

   Le choix est délibérément COURT. Un sélecteur complet — mille
   cinq cents caractères, une recherche, des catégories — pèse
   plusieurs centaines de kilooctets et ferait payer à chaque
   ouverture de l'application ce dont on se sert trois fois par
   semaine. Ceux-ci sont ceux d'une conversation de club :
   l'encouragement, l'accord, l'horaire, la présence.

   Aucune bibliothèque : ce sont des caractères, pas des images.
   ============================================================ */
import { useEffect, useRef } from 'react';

export const EMOJI = [
  '👍', '👏', '🙏', '💪', '🔥', '🎉', '❤️', '😊',
  '😂', '😉', '🤔', '😅', '😢', '😮', '🥋', '🏆',
  '⏰', '📅', '📍', '✅', '❌', '❓', '❗', '☔'
];

export function ChoixEmoji({
  onChoisir,
  onFermer
}: {
  onChoisir: (e: string) => void;
  onFermer: () => void;
}) {
  const boite = useRef<HTMLDivElement>(null);

  /* Échap ferme, et un appui hors de la boîte aussi. Sans cela, la
     seule sortie serait de choisir un emoji dont on ne veut pas. */
  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    const dehors = (e: MouseEvent) => {
      if (boite.current && !boite.current.contains(e.target as Node)) onFermer();
    };
    document.addEventListener('keydown', auClavier);
    /* En phase de capture, et au tour suivant : sans cela, le clic
       qui vient d'OUVRIR la boîte la refermerait aussitôt. */
    const t = window.setTimeout(() => document.addEventListener('mousedown', dehors), 0);
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.removeEventListener('mousedown', dehors);
      window.clearTimeout(t);
    };
  }, [onFermer]);

  return (
    <div
      ref={boite}
      role="dialog"
      aria-label="Choisir un emoji"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: 8,
        right: 8,
        background: '#FFF',
        border: '1px solid var(--bord)',
        borderRadius: 16,
        padding: 10,
        boxShadow: '0 8px 24px rgba(6, 20, 13, .16)',
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 4,
        zIndex: 20
      }}
    >
      {EMOJI.map((e) => (
        <button
          key={e}
          type="button"
          /* Le nom accessible EST l'emoji : un lecteur d'écran le
             décrit déjà correctement (« pouce en l'air »), et
             inventer nos propres libellés les traduirait mal. */
          aria-label={e}
          onClick={() => onChoisir(e)}
          style={{
            fontSize: 22,
            lineHeight: '34px',
            height: 34,
            borderRadius: 8,
            border: 0,
            background: 'transparent',
            cursor: 'pointer'
          }}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
