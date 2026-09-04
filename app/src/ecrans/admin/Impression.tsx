/* ============================================================
   Administration · La planche d'impression des cartes

   Écran 15 de la maquette, et une promesse écrite noir sur blanc
   dans l'application elle-même : la carte de membre annonce que
   « l'impression et l'enregistrement en image viendront avec l'écran
   d'administration, qui édite la planche de tout le club ».

   Ce qui change par rapport à la maquette, et c'est tout l'intérêt
   du développement : les cartes portent les VRAIS membres, leurs
   vrais portraits, et un code QR qui se scanne réellement. La
   maquette montrait dix élèves inventés et un motif décoratif.

   Le format ne se discute pas : 85,6 × 54 mm, celui d'une carte
   bancaire. Les étuis, porte-badges et cordons du commerce sont à
   cette taille, et la carte entre dans un portefeuille. Dix par page
   A4, en deux colonnes de cinq, avec des traits de coupe.
   ============================================================ */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Bouton, Carte, Entete, Etat, Puce, Surtitre } from '../../ui/base';
import { useGrades, useMembres } from '../../services/membres';
import type { Membre } from '../../services/membres';
import { useUrls } from '../../services/stockage';
import { useReglages } from '../../services/club';
import { SAIT_IMPRIMER } from '../../services/telechargement';
/* Le gabarit de la carte imprimée vit désormais à part : l'écran
   « Ma carte de membre » imprime EXACTEMENT le même carton, et deux
   définitions auraient fini par diverger. */
import { CarteImprimable } from '../../ui/CarteImprimable';

/* Dix par page : deux colonnes de cinq, comme la maquette. */
const PAR_PAGE = 10;

/* Les codes QR de la planche, engendrés une fois pour toutes.

   Ils sont produits ici plutôt que dans chaque carte : dix
   composants qui engendrent chacun le leur relanceraient le calcul à
   chaque rendu, et la planche clignoterait à chaque case cochée. */
function useCodes(numeros: string[]) {
  const [codes, setCodes] = useState<Record<string, string>>({});
  /* La clé de dépendance est la LISTE, pas le tableau : un tableau
     neuf à chaque rendu relancerait l'effet indéfiniment. */
  const cle = numeros.join('|');

  useEffect(() => {
    let vivant = true;
    const liste = cle ? cle.split('|') : [];
    Promise.all(
      liste.map((n) =>
        QRCode.toString(n, {
          type: 'svg',
          errorCorrectionLevel: 'M',
          margin: 0,
          color: { dark: '#0E2119', light: '#FFFFFF' }
        })
          .then((svg) => [n, svg] as const)
          .catch(() => [n, ''] as const)
      )
    ).then((paires) => {
      if (vivant) setCodes(Object.fromEntries(paires));
    });
    return () => {
      vivant = false;
    };
  }, [cle]);

  return codes;
}

export function AdminImpression() {
  const aller = useNavigate();
  const { data: membres, isPending, error } = useMembres();
  const { data: grades } = useGrades();
  const { data: reglages } = useReglages();

  const [grade, setGrade] = useState<string | null>(null);
  /* Qui entre sur la planche. Tout le monde par défaut : le cas
     ordinaire est d'imprimer le club entier une fois par an. */
  const [exclus, setExclus] = useState<string[]>([]);

  const liste = useMemo(
    () =>
      (membres ?? []).filter(
        (m) => (!grade || m.grade?.nom === grade) && !exclus.includes(m.id)
      ),
    [membres, grade, exclus]
  );

  const portraits = useUrls('portraits', liste.map((m) => m.photo));
  const codes = useCodes(liste.map((m) => m.numero));
  const nomClub = reglages?.nom_club ?? 'Kung-fu Waishi';

  /* Les pages, de dix en dix. Une planche de soixante-quatre cartes
     sur une seule page A4 ne s'imprimerait pas : le navigateur la
     couperait où il veut, en plein milieu d'une carte. */
  const pages = useMemo(() => {
    const p: Membre[][] = [];
    for (let i = 0; i < liste.length; i += PAR_PAGE) p.push(liste.slice(i, i + PAR_PAGE));
    return p;
  }, [liste]);

  return (
    <>
      <div className="impression-chrome">
        <Entete titre="Planche d’impression" retour={() => aller('/admin')} />
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div className="impression-chrome" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Carte>
            <p style={{ fontSize: 13, lineHeight: '20px', color: '#59685F' }}>
              Format <b>85,6 × 54 mm</b>, celui d’une carte bancaire : les étuis et cordons du
              commerce sont à cette taille. Dix par page A4, avec des traits de coupe.
              <br />
              <br />
              Dans la boîte d’impression : format <b>A4</b>, marges <b>aucune</b>, et
              <b> imprimer les arrière-plans</b> coché — sinon les bandes de couleur de grade
              disparaissent.
            </p>
          </Carte>

          {(grades ?? []).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Surtitre>N’imprimer qu’un grade</Surtitre>
              <div className="chips">
                <Puce texte="Tous" actif={grade === null} onClick={() => setGrade(null)} />
                {(grades ?? []).map((g) => (
                  <Puce
                    key={g.id}
                    texte={g.nom}
                    actif={grade === g.nom}
                    onClick={() => setGrade(grade === g.nom ? null : g.nom)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rowhead">
            <Surtitre>
              {liste.length} carte{liste.length > 1 ? 's' : ''} · {pages.length} page
              {pages.length > 1 ? 's' : ''}
            </Surtitre>
            {exclus.length > 0 && (
              <button className="link" onClick={() => setExclus([])}>
                Remettre les {exclus.length} retirées
              </button>
            )}
          </div>

          {/* ⚠ CET ÉCRAN NE S'IMPRIME PAS DEPUIS LE TÉLÉPHONE.

              « window.print() » ouvre l'aperçu d'impression dans un
              navigateur ; dans l'APK il ne fait rien. La WebView
              d'Android n'imprime pas d'elle-même — il faut que
              l'application appelle « PrintManager », et la source
              Android de Capacitor n'en contient aucune trace. Le
              bouton était donc inerte sur le téléphone, sur l'écran
              dont l'impression EST tout l'objet.

              On ne le remplace pas par un pis-aller : une planche A4
              avec traits de coupe s'imprime sur une imprimante, donc
              depuis un ordinateur. L'écran le DIT, avec l'adresse à
              ouvrir — c'est plus utile qu'un bouton qui ment. */}
          {SAIT_IMPRIMER ? (
            <Bouton onClick={() => window.print()} desactive={liste.length === 0}>
              Imprimer ou enregistrer en PDF
            </Bouton>
          ) : (
            <div className="warn">
              <i />
              <p>
                L’impression se fait depuis un <b>ordinateur</b> : ouvrez la version web du
                club et revenez sur cet écran. Une planche A4 avec traits de coupe demande
                une imprimante, et le téléphone n’en pilote aucune.
              </p>
            </div>
          )}
        </div>

        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucune carte à imprimer."
        >
          <>
            {pages.map((page, i) => (
              <div className="planche-cadre" key={i}>
                <div className="planche">
                  <div className="planche__grille">
                    {page.map((m) => (
                      /* Un appui retire la carte de la planche : on
                         réimprime rarement le club entier, souvent
                         les trois nouveaux. */
                      <button
                        key={m.id}
                        onClick={() => setExclus((p) => [...p, m.id])}
                        aria-label={`Retirer ${m.nom} ${m.prenom} de la planche`}
                        style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <CarteImprimable
                          membre={m}
                          nomClub={nomClub}
                          portrait={m.photo ? portraits[m.photo] ?? null : null}
                          qr={codes[m.numero]}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="planche__pied">
                    {nomClub} · planche de {page.length} carte{page.length > 1 ? 's' : ''} ·
                    page {i + 1} sur {pages.length}
                  </span>
                </div>
              </div>
            ))}
          </>
        </Etat>

        <div className="impression-chrome warn">
          <i />
          <p>
            Un appui sur une carte la retire de la planche — utile pour ne réimprimer que les
            nouveaux. Rien n’est modifié en base : c’est la planche qui change, pas les fiches.
          </p>
        </div>
      </div>
    </>
  );
}
