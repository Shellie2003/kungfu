/* ============================================================
   L'anneau de progression.

   « Ajouter un cercle de progression pour les imports ou envois de
   document (photo, PDF, etc.) »

   Ce qu'il remplace : le mot « Envoi… ». Ce mot ne distingue pas
   « c'est parti, patiente » de « c'est bloqué depuis une minute ».
   Sur la ligne d'Antananarivo, une photo met cinq à quinze secondes,
   et pendant ce temps on appuie une seconde fois — donc on envoie
   deux fois la même photo.

   ------------------------------------------------------------
   IL DIT LA VÉRITÉ, OU IL NE DIT RIEN

   L'anneau suit les octets réellement partis du téléphone
   (XMLHttpRequest, voir services/envoi.ts). Quand le réseau
   s'arrête, l'anneau s'arrête : c'est précisément l'information
   qu'on veut, et c'est ce qu'une animation qui tourne toute seule
   ne dira jamais.

   Un cas mérite d'être traité à part, et c'est le dernier :
   « onprogress » raconte ce qui a QUITTÉ le téléphone, pas ce que le
   serveur a ÉCRIT. L'anneau atteint donc 100 % un instant avant la
   fin réelle. Passé ce point, on ne montre pas un succès — on montre
   un anneau plein qui tourne, jusqu'à la réponse. Annoncer une
   réussite que le serveur n'a pas confirmée est le défaut que ce
   projet a payé plusieurs fois.

   ------------------------------------------------------------
   DEUX CERCLES, PAS DE BIBLIOTHÈQUE

   Un cercle gris pour le tour complet, un cercle vert par-dessus
   dont on découpe le trait avec « stroke-dasharray ». C'est la
   méthode la plus ancienne et la plus sûre : aucune dépendance,
   aucun calcul de chemin, et cela s'affiche identiquement dans la
   WebView d'un Android 9.

   « prefers-reduced-motion » est respecté pour la rotation de
   l'attente ; la progression, elle, n'est pas une animation
   décorative : c'est une information, et elle reste.
   ============================================================ */

export function Anneau({
  part,
  taille = 44,
  epaisseur = 4,
  libelle
}: {
  /* De 0 à 1 pendant l'envoi. « null » = tout est parti, on attend
     la réponse du serveur. */
  part: number | null;
  taille?: number;
  epaisseur?: number;
  /* Ce qu'on envoie, pour qui n'a pas l'anneau sous les yeux :
     « Photo de Nirina », « reglement.pdf ». */
  libelle?: string;
}) {
  const r = (taille - epaisseur) / 2;
  const tour = 2 * Math.PI * r;
  const attente = part === null;
  const fraction = attente ? 1 : Math.min(1, Math.max(0, part));
  const pourcent = Math.round(fraction * 100);

  return (
    <span
      /* « progressbar » et non une image décorative : un lecteur
         d'écran annonce alors « 40 % », ce qui est exactement ce que
         voit celui qui regarde. En attente, on omet « valuenow » —
         c'est ainsi qu'on dit « en cours, durée inconnue ». */
      role="progressbar"
      aria-label={libelle ? `Envoi de ${libelle}` : 'Envoi en cours'}
      aria-valuemin={0}
      aria-valuemax={100}
      {...(attente ? {} : { 'aria-valuenow': pourcent })}
      aria-valuetext={attente ? 'Enregistrement sur le serveur…' : `${pourcent} %`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <svg
        width={taille}
        height={taille}
        viewBox={`0 0 ${taille} ${taille}`}
        aria-hidden="true"
        className={attente ? 'anneau anneau--attente' : 'anneau'}
      >
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={r}
          fill="none"
          stroke="#DCE7E0"
          strokeWidth={epaisseur}
        />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={r}
          fill="none"
          stroke="#12613C"
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={tour}
          /* Le trait démarre en haut : sans la rotation, un quart de
             tour commencerait à trois heures, ce que personne ne lit
             comme « le début ». */
          strokeDashoffset={tour * (1 - fraction)}
          transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
          style={{ transition: 'stroke-dashoffset .2s linear' }}
        />
      </svg>
      <span style={{ fontSize: 12.5, color: '#59685F', minWidth: 0 }}>
        {attente ? 'Enregistrement…' : `${pourcent} %`}
        {libelle && (
          <b
            style={{
              display: 'block',
              fontWeight: 400,
              fontSize: 12,
              color: '#7C8B82',
              overflowWrap: 'anywhere'
            }}
          >
            {libelle}
          </b>
        )}
      </span>
    </span>
  );
}
