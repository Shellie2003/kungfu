/* ============================================================
   14 · Carte de membre

   Une différence avec la maquette, et c'est le développement qui la
   permet : le code QR n'est plus un motif de démonstration. Il
   encode réellement le numéro de membre, et se scanne.

   Ce qu'il encode est public par nature — le matricule figure déjà
   sur la carte en toutes lettres. Il n'y a donc rien à protéger
   dans ce code : il sert à pointer une présence, pas à ouvrir une
   session. Y mettre un jeton d'accès aurait fait d'une carte
   photographiée un moyen d'entrer dans le compte.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Avis, Entete, Grade, Portrait, Tuile } from '../ui/base';
import { Icone } from '../ui/Icone';
import { Emblem } from '../ui/Emblem';
import { dateFr, useFiche } from '../services/membres';
import { useUrl } from '../services/stockage';
import { useSession } from '../services/session';
import { useReglages } from '../services/club';
import { charger, dessinerCarte, nomFichierCarte } from '../services/carteImage';
import { SAIT_IMPRIMER, enregistrer } from '../services/telechargement';
import { CarteImprimable } from '../ui/CarteImprimable';

export function CarteMembre() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: fiche } = useFiche(moi?.id);
  const portraitUrl = useUrl('portraits', fiche?.photo);
  const { data: reglages } = useReglages();
  const [qr, setQr] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  /* Enregistrer la carte en image.

     Le code QR est REDESSINÉ en PNG plutôt que repris du SVG affiché
     à l'écran : un SVG ne se peint pas sur une toile sans passer par
     une image, et une image construite depuis un SVG « salit » la
     toile dans certaines WebView — « toDataURL » lève alors une
     erreur de sécurité, après le dessin, quand tout paraissait
     marcher. On demande donc directement un PNG à la bibliothèque. */
  async function enregistrerLaCarte() {
    if (!fiche) return;
    setOccupe(true);
    setAvis(null);
    try {
      const [imageQr, imagePortrait] = await Promise.all([
        QRCode.toDataURL(fiche.numero, {
          errorCorrectionLevel: 'M',
          margin: 0,
          width: 380,
          color: { dark: '#0E2119', light: '#FFFFFF' }
        }).then(charger),
        charger(portraitUrl)
      ]);

      const toile = dessinerCarte({
        nomClub: reglages?.nom_club ?? 'Kung-fu Waishi',
        nom: fiche.nom,
        prenom: fiche.prenom,
        grade: fiche.grade?.nom ?? null,
        couleurGrade: fiche.grade?.couleur ?? '#0F5132',
        numero: fiche.numero,
        depuis: dateFr(fiche.debut),
        lieuClub: reglages?.lieu_club ?? 'Analamahitsy',
        qr: imageQr,
        portrait: imagePortrait
      });

      const resultat = await enregistrer(
        toile.toDataURL('image/png'),
        nomFichierCarte(fiche.numero)
      );
      setAvis(
        resultat.fait === 'refuse'
          ? { bon: false, texte: resultat.pourquoi }
          : {
              bon: true,
              texte:
                resultat.fait === 'enregistre'
                  ? `Carte enregistrée dans ${resultat.ou}.`
                  : 'Carte ouverte : votre navigateur propose de l’enregistrer.'
            }
      );
    } catch (e) {
      setAvis({ bon: false, texte: (e as Error).message });
    } finally {
      setOccupe(false);
    }
  }

  useEffect(() => {
    if (!fiche?.numero) return;
    /* Correction d'erreur au niveau M : une carte se froisse, se
       salit et se photographie de travers. */
    QRCode.toString(fiche.numero, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 0,
      color: { dark: '#0E2119', light: '#FFFFFF' }
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [fiche?.numero]);

  if (!fiche) {
    return (
      <>
        <Entete titre="Carte de membre" retour={() => aller(-1)} />
        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
          Chargement…
        </div>
      </>
    );
  }

  const couleur = fiche.grade?.couleur ?? '#0F5132';

  return (
    <>
      <Entete titre="Carte de membre" retour={() => aller(-1)} />

      <div
        style={{
          flexGrow: 1,
          /* 22 en haut, comme la maquette. Deux pixels : invisibles
             à l'œil, mesurés par le banc, et c'est justement le
             genre d'écart qui s'accumule sans que personne ne le
             voie passer. */
          padding: '22px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {/* ------------------------------------------------------
            CE QUI S'IMPRIME, ET CE QUI SE REGARDE.

            Imprimer cette page sortait la carte étirée sur toute la
            largeur d'une A4 — donc PAS au format d'une carte
            bancaire, alors que le bouton le promet — accompagnée des
            deux boutons d'écran, du paragraphe d'explication et du
            fond gris de l'application.

            Forcer la carte verte au format 85,6 × 54 mm ne suffisait
            pas : mesurée, elle demande 393 points de haut pour 204
            disponibles, et le bas se coupait — le code QR et le pied
            disparaissaient. Une carte de membre sans son code ne sert
            plus à rien.

            La carte verte est donc faite pour l'ÉCRAN et y reste ; le
            papier reçoit le gabarit de la planche d'administration,
            dessiné en millimètres et déjà éprouvé. Le membre qui
            imprime sa carte obtient exactement le carton que le club
            lui aurait imprimé.
            ------------------------------------------------------ */}
        <div className="carte impression-chrome">
          {/* Le cachet du club. L'emplacement reste vide tant que le
              fichier n'est pas déposé dans img/ : un emplacement vide
              est plus honnête qu'un faux tampon. */}
          <span className="cachet" aria-label="Cachet du club">
            <i>
              cachet
              <br />
              du club
            </i>
          </span>

          <div className="carte__head">
            <Emblem taille={20} style={{ width: 36, height: 36, borderRadius: 10 }} />
            <span style={{ flexGrow: 1 }}>
              {/* Le nom du club vient d'un réglage : « le nom
                  officiel » est une décision que le club n'a pas
                  encore tranchée, et le figer dans le code
                  obligerait à une nouvelle version le jour où il
                  tranche. */}
              <b className="carte__org">
                {(reglages?.nom_club ?? 'Kung-fu Waishi').toUpperCase()}
              </b>
              <i className="carte__kind">Carte de membre</i>
            </span>
          </div>

          <div className="carte__body">
            <Portrait
              taille={96}
              hauteur={120}
              rayon={14}
              photo={portraitUrl}
            />
            <div
              style={{
                flexGrow: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <b className="carte__nom">{fiche.nom}</b>
              <span className="carte__prenom">{fiche.prenom}</span>
              {fiche.grade && (
                <span style={{ marginTop: 2 }}>
                  <Grade nom={fiche.grade.nom} couleur={fiche.grade.couleur} />
                </span>
              )}
              <span className="carte__num">{fiche.numero}</span>
            </div>
          </div>

          <div className="carte__qr">
            <div
              className="carte__qrbox"
              /* Le SVG vient de la bibliothèque de codes QR, pas
                 d'une saisie : il n'y a pas de texte d'utilisateur
                 à échapper ici. */
              dangerouslySetInnerHTML={{ __html: qr ?? '' }}
            />
            <div style={{ flexGrow: 1 }}>
              <p className="carte__qrtitle">Code de membre</p>
              <p className="carte__qrtext">
                Présenté à l’entraînement pour pointer la présence.
              </p>
            </div>
          </div>

          <div className="carte__foot">
            <span>
              Membre depuis
              <br />
              <b>{dateFr(fiche.debut) ?? '—'}</b>
            </span>
            {/* La maquette annonçait une date de validité. Il n'y en a
                pas en base, et en inventer une ferait refuser la
                carte le jour où elle passerait. Le club, lui, est
                vrai et n'est écrit nulle part ailleurs sur la carte. */}
            <span style={{ textAlign: 'right' }}>
              Club
              <br />
              <b>{reglages?.lieu_club ?? 'Analamahitsy'}</b>
            </span>
          </div>
          <div className="carte__band" style={{ background: couleur }} />
        </div>

        {/* ------------------------------------------------------
            CE QUE LA MAQUETTE PROMETTAIT, ET QUI N'EXISTAIT PAS.

            Elle annonçait trois actions sous la carte : enregistrer
            en image, imprimer, régénérer le code. Aucune n'avait été
            faite, et l'écran se contentait d'un paragraphe expliquant
            que l'administration, elle, savait imprimer.

            Deux des trois sont ici. La troisième — « régénérer le
            code » — ne l'est pas, et ne le sera pas : ce code encode
            le MATRICULE, qui figure déjà en toutes lettres sur la
            carte. Il n'y a rien à régénérer, et un bouton qui
            prétendrait le faire laisserait croire qu'une carte perdue
            se révoque. Elle ne se révoque pas parce qu'il n'y a rien
            à révoquer.
            ------------------------------------------------------ */}
        {/* Hors de l'écran, présent pour l'imprimante. « aria-hidden »
            parce qu'un lecteur d'écran lirait sinon deux fois le même
            nom, le même grade et le même matricule. */}
        <div className="aImprimer" aria-hidden="true">
          <CarteImprimable
            membre={fiche}
            nomClub={reglages?.nom_club ?? 'Kung-fu Waishi'}
            portrait={portraitUrl}
            qr={qr ?? undefined}
          />
        </div>

        {/* « impression-chrome » : le décor de l'ÉCRAN, qui ne part
            pas sur le papier. La convention existait déjà pour la
            planche d'administration ; elle sert ici pour la même
            raison. */}
        <div className="list impression-chrome">
          <button
            className="listrow"
            onClick={() => void enregistrerLaCarte()}
            disabled={occupe}
          >
            <Tuile icone="album" petite />
            <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
              <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                {occupe ? 'Préparation…' : 'Enregistrer en image'}
              </b>
              <span style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}>
                Pour l’envoyer ou l’imprimer
              </span>
            </span>
            <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
          </button>

          {/* ⚠ IMPRIMER : LE WEB SAIT, L'APK NON.

              « window.print() » ouvre l'aperçu d'impression dans un
              navigateur. Dans l'APK il ne fait RIEN — la WebView
              d'Android n'imprime pas d'elle-même, il faut que
              l'application appelle « PrintManager », et la source
              Android de Capacitor n'en contient aucune trace. Le
              bouton était donc inerte sur le téléphone : le doigt
              tape, l'écran ne bouge pas.

              C'est le MÊME défaut que le lien « download » de la
              messagerie, au même endroit du même moteur, et il fallait
              le traiter deux fois.

              Sur le téléphone, le chemin qui EXISTE est celui du
              dessus : on enregistre l'image, et Android imprime
              depuis sa visionneuse. La ligne le dit au lieu de
              disparaître — sans quoi on chercherait où imprimer. */}
          {SAIT_IMPRIMER ? (
            <button className="listrow" onClick={() => window.print()}>
              <Tuile icone="edit" petite />
              <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                  Imprimer la carte
                </b>
                <span style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}>
                  Format carte bancaire
                </span>
              </span>
              <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
            </button>
          ) : (
            <div className="listrow">
              <Tuile icone="edit" petite fond="#F1F6F3" couleur="#7C8B82" />
              <span style={{ flexGrow: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                  Imprimer la carte
                </b>
                <span style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 1 }}>
                  Enregistrez-la ci-dessus, puis imprimez depuis la galerie du téléphone.
                </span>
              </span>
            </div>
          )}
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* La promesse d'hier est tenue : l'écran d'administration
            « Imprimer les cartes » édite la planche du club entier,
            dix par page A4. Laisser « viendront » aurait fait de
            cette ligne un mensonge de plus. */}
        <p
          className="impression-chrome"
          style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}
        >
          Cette carte se lit sur le téléphone. L’administration l’imprime sur carton depuis
          l’écran « Imprimer les cartes » — dix par page A4, au format d’une carte bancaire.
        </p>
      </div>
    </>
  );
}
