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
import { Entete, Grade, Portrait } from '../ui/base';
import { Icone } from '../ui/Icone';
import { dateFr, useFiche } from '../services/membres';
import { useUrl } from '../services/stockage';
import { useSession } from '../services/session';
import { useReglages } from '../services/club';

export function CarteMembre() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: fiche } = useFiche(moi?.id);
  const portraitUrl = useUrl('portraits', fiche?.photo);
  const { data: reglages } = useReglages();
  const [qr, setQr] = useState<string | null>(null);

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
          padding: '20px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div className="carte">
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
            <span className="emblem" style={{ width: 36, height: 36, borderRadius: 10 }}>
              <Icone nom="shieldCheck" taille={20} couleur="#0F5132" />
            </span>
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

        {/* La bande de couleur reprend le grade ; elle ne le dit pas
            seule — le nom du grade est écrit juste au-dessus. */}
        <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}>
          Cette carte se lit sur le téléphone. L’impression et l’enregistrement en image
          viendront avec l’écran d’administration, qui édite la planche de tout le club.
        </p>
      </div>
    </>
  );
}
