/* ============================================================
   21 · Je participe
   ============================================================ */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete, Surtitre } from '../ui/base';
import { jourEtMois, useActualite } from '../services/casier';
import { useReglages } from '../services/club';
import { useSession } from '../services/session';
import { ariary, codeMvola, useInscrire, useParticipation } from '../services/participation';

const MONTANTS = [1000, 2000, 5000, 10000];

export function Participation() {
  const { id } = useParams();
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: actu } = useActualite(id);
  const { data: reglages } = useReglages();
  const { data: participation } = useParticipation(id, moi?.id);
  const inscrire = useInscrire(id);

  const [accompagnants, setAccompagnants] = useState<number | null>(null);
  const [montant, setMontant] = useState<number | null>(5000);
  const [avis, setAvis] = useState<string | null>(null);

  /* Tant qu'on n'a rien touché, on montre ce que la base sait déjà :
     revenir sur l'écran ne doit pas donner l'impression d'être
     revenu au point de départ. */
  const venus = accompagnants ?? participation?.accompagnants ?? 0;
  const numeroMvola = reglages?.mvola_numero;
  const nomMvola = reglages?.mvola_nom;
  const recu = (participation?.versements ?? []).reduce((s, v) => s + v.montant, 0);

  const { jour, mois } = jourEtMois(actu?.date_evt ?? actu?.cree_le ?? new Date().toISOString());

  return (
    <>
      <Entete titre="Je participe" retour={() => aller(-1)} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <Carte
          pad={14}
          style={{ display: 'flex', gap: 13, alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}
        >
          <span className="datebox">
            <b>{jour}</b>
            <i>{mois}</i>
          </span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, lineHeight: '20px' }}>
              {actu?.titre ?? '…'}
            </p>
            {actu?.lieu && (
              <p style={{ fontSize: 13, color: '#59685F', marginTop: 3 }}>{actu.lieu}</p>
            )}
          </div>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Qui vient</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field">
                <span className="field__label">Prénom</span>
                <span className="input input--fige">{moi?.prenom ?? '—'}</span>
              </label>
              <label className="field">
                <span className="field__label">Numéro matricule</span>
                <span className="input input--fige">{moi?.numero ?? '—'}</span>
              </label>
              <p className="aide">
                Les deux sont repris de votre fiche. Le matricule ne se modifie pas.
              </p>
            </div>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>J’amène du monde</Surtitre>
            <span style={{ fontSize: 12, color: '#7C8B82' }}>Conjoint, enfants</span>
          </div>
          <Carte pad={16}>
            <div className="compteur">
              <button
                className="compteur__b"
                aria-label="Retirer une personne"
                onClick={() => setAccompagnants(Math.max(0, venus - 1))}
                disabled={venus === 0}
              >
                <Icone nom="moins" taille={20} couleur="#0F5132" epaisseur={2} />
              </button>
              <div className="compteur__v" aria-live="polite">
                <b>{venus}</b>
                <span>personne{venus > 1 ? 's' : ''} en plus</span>
              </div>
              <button
                className="compteur__b"
                aria-label="Ajouter une personne"
                onClick={() => setAccompagnants(Math.min(20, venus + 1))}
                disabled={venus >= 20}
              >
                <Icone nom="plus" taille={20} couleur="#0F5132" epaisseur={2} />
              </button>
            </div>
            <p className="aide" style={{ marginTop: 12 }}>
              {venus + 1} place{venus > 0 ? 's' : ''} au total avec vous. Le club compte les
              places pour le transport.
            </p>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ma participation</Surtitre>
          <Carte pad={16}>
            <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#59685F' }}>
              Vous pouvez envoyer en plusieurs fois. Choisissez le montant de cet envoi.
            </p>
            <div className="montants">
              {MONTANTS.map((m) => (
                <button
                  key={m}
                  className={montant === m ? 'montant montant--on' : 'montant'}
                  onClick={() => setMontant(m)}
                  aria-pressed={montant === m}
                >
                  {m.toLocaleString('fr-FR').replace(/ | /g, ' ')}
                  <i>Ar</i>
                </button>
              ))}
              <button
                className="montant montant--libre"
                onClick={() => {
                  const saisi = window.prompt('Montant en ariary');
                  const n = Number(saisi?.replace(/\D/g, ''));
                  if (n > 0) setMontant(n);
                }}
              >
                Autre
                <i>montant</i>
              </button>
            </div>

            {numeroMvola && montant ? (
              <>
                <div className="ussd">
                  <p className="ussd__lbl">Le code composé sur votre téléphone</p>
                  {/* Le numéro est mis en évidence pour qu'on le
                      vérifie d'un coup d'œil avant d'appeler. */}
                  <code className="ussd__code">
                    #111*1*2*<b>{numeroMvola}</b>*{montant}#
                  </code>
                  {nomMvola && <p className="ussd__nom">{nomMvola} · MVola</p>}
                </div>

                <div style={{ marginTop: 14 }}>
                  <Bouton
                    onClick={() => {
                      /* tel: avec un code USSD ouvre le clavier
                         pré-rempli ; Android ne le compose jamais
                         seul, et c'est bien ainsi. */
                      window.location.href = `tel:${encodeURIComponent(codeMvola(numeroMvola, montant))}`;
                    }}
                  >
                    Ouvrir le clavier avec ce code
                  </Bouton>
                </div>
              </>
            ) : (
              <div className="ussd">
                <p className="ussd__lbl">Numéro MVola</p>
                <p style={{ fontSize: 13, color: '#59685F', marginTop: 6, lineHeight: '19px' }}>
                  Le numéro du club n’est pas encore renseigné. L’administration le pose depuis
                  ses réglages.
                </p>
              </div>
            )}

            <div className="avert" style={{ marginTop: 14 }}>
              <Icone nom="flag" taille={18} couleur="#8A3A12" />
              <p>
                L’application ouvre le clavier, elle n’envoie pas l’argent : c’est vous qui
                appuyez sur appeler. Elle ne sait pas non plus si le transfert a réussi — c’est
                le club qui pointe ce qu’il a reçu.
              </p>
            </div>
          </Carte>
        </div>

        {participation && participation.versements.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Ce que j’ai déjà envoyé</Surtitre>
            <div className="list">
              {participation.versements.map((v) => (
                <div key={v.id} className="listrow">
                  <Icone nom="shieldCheck" taille={19} couleur="#12613C" />
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>
                      {ariary(v.montant)}
                    </b>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        color: '#59685F',
                        marginTop: 1
                      }}
                    >
                      {new Date(v.recu_le).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}{' '}
                      · Pointé par le club
                    </span>
                  </span>
                </div>
              ))}
              <div className="listrow" style={{ background: '#F5F8F6' }}>
                <span style={{ flexGrow: 1, fontSize: 13.5, color: '#59685F' }}>Total reçu</span>
                <b className="display" style={{ fontSize: 16, color: '#0F5132' }}>
                  {ariary(recu)}
                </b>
              </div>
            </div>
          </div>
        )}

        {avis && (
          <p role="status" style={{ fontSize: 13, color: '#12613C' }}>
            {avis}
          </p>
        )}

        <Bouton
          genre={participation ? 'ghost' : 'primary'}
          desactive={!moi || inscrire.isPending}
          onClick={() =>
            moi &&
            inscrire.mutate(
              { profilId: moi.id, accompagnants: venus, montantPromis: montant },
              {
                onSuccess: () => setAvis('Votre participation est enregistrée.'),
                onError: () =>
                  setAvis('L’enregistrement a échoué. Réessayez une fois le réseau revenu.')
              }
            )
          }
        >
          {participation ? 'Mettre à jour ma participation' : 'Confirmer ma participation'}
        </Bouton>
      </div>
    </>
  );
}
