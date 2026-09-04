/* ============================================================
   La carte de membre TELLE QU'ELLE S'IMPRIME.

   ------------------------------------------------------------
   POURQUOI UNE SECONDE CARTE, ALORS QU'IL Y EN A DÉJÀ UNE

   Parce que ce ne sont pas les mêmes proportions, et que cela s'est
   vu à l'impression.

   La carte de l'écran est verte, haute, avec un grand code QR et un
   pied de page : elle est faite pour être REGARDÉE sur un téléphone,
   et elle mesure 324 × 393 points. Une carte bancaire mesure
   85,6 × 54 mm, soit 324 × 204 points. Forcer la première dans les
   dimensions de la seconde coupait tout le bas — le code QR et le
   pied disparaissaient, et une carte de membre sans son code ne sert
   plus à rien.

   Ce gabarit-ci est celui que la PLANCHE de l'administration emploie
   depuis le début, et qui sort correctement dix fois par page A4. Il
   est dessiné en millimètres et en points typographiques, pas en
   pixels d'écran.

   ------------------------------------------------------------
   CE QUE L'EXTRACTION GAGNE

   Une seule définition de « à quoi ressemble une carte du club
   imprimée ». Avant, la planche avait la sienne et l'écran de la
   carte n'en avait aucune ; le membre qui imprimait sa carte
   obtenait donc autre chose que ce que l'administration imprimait
   pour lui. Maintenant, les deux chemins sortent le même carton.
   ============================================================ */
import type { Membre } from '../services/membres';

export function CarteImprimable({
  membre,
  nomClub,
  portrait,
  qr
}: {
  membre: Pick<Membre, 'nom' | 'prenom' | 'numero' | 'grade'>;
  nomClub: string;
  portrait: string | null;
  /* Le code QR en SVG. Il vient de la bibliothèque, pas d'une saisie :
     il n'y a aucun texte d'utilisateur à échapper là-dedans. */
  qr: string | undefined;
}) {
  const couleur = membre.grade?.couleur ?? '#0F5132';
  return (
    <div className="pc">
      <span className="pc__band" style={{ background: couleur }} />
      <span className="pc__logo">
        <span className="emblem" />
      </span>
      <span className="pc__org">{nomClub.toUpperCase()}</span>
      <span className="pc__photo">
        {portrait ? (
          <img
            src={portrait}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8FB3A0"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
          </svg>
        )}
      </span>
      <span className="pc__id">
        <b className="pc__nom">{membre.nom}</b>
        <span className="pc__prenom">{membre.prenom}</span>
        {membre.grade && (
          <span className="pc__grade">
            <i style={{ background: couleur }} />
            {membre.grade.nom}
          </span>
        )}
        <span className="pc__num">{membre.numero}</span>
      </span>
      <span className="pc__qr" dangerouslySetInnerHTML={{ __html: qr ?? '' }} />
    </div>
  );
}
