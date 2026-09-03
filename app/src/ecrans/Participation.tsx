/* ============================================================
   21 · Je participe
   ============================================================ */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete, Surtitre, Zone } from '../ui/base';
import { jourEtMois, useActualite } from '../services/casier';
import { useReglages } from '../services/club';
import { useSession } from '../services/session';
import {
  GABARIT_USSD,
  ariary,
  codeMvola,
  useInscrire,
  useParticipation
} from '../services/participation';
import { attendu, reste } from '../services/validation';
import { enLettres } from '../services/texte';

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
  /* Le mot laissé au club. « null » tant qu'on n'a rien tapé, pour
     que la note déjà enregistrée reste celle qui s'affiche. */
  const [note, setNote] = useState<string | null>(null);
  const [montant, setMontant] = useState<number | null>(5000);
  const [avis, setAvis] = useState<string | null>(null);
  /* Le code corrigé à la main. « null » tant qu'on n'y a pas touché,
     pour que le code SUIVE le montant choisi — un code figé au
     premier rendu enverrait cinq mille ariary après qu'on a choisi
     dix mille, et personne ne s'en apercevrait. */
  const [ussdSaisi, setUssdSaisi] = useState<string | null>(null);

  /* Tant qu'on n'a rien touché, on montre ce que la base sait déjà :
     revenir sur l'écran ne doit pas donner l'impression d'être
     revenu au point de départ. */
  const venus = accompagnants ?? participation?.accompagnants ?? 0;
  const numeroMvola = reglages?.mvola_numero;
  const nomMvola = reglages?.mvola_nom;
  const recu = (participation?.versements ?? []).reduce((s, v) => s + v.montant, 0);

  /* Le montant FIXÉ par celui qui a publié la sortie. Il change tout
     pour le membre : jusqu'ici l'écran proposait quatre montants ronds
     et personne ne savait combien il fallait donner — on demandait au
     maître le samedi. Le total suit les accompagnants, parce que c'est
     par place qu'on paie le taxi-brousse. */
  const prix = actu?.participation_ar ?? null;
  const du = attendu(prix, venus);
  const reliquat = reste(prix, venus, participation?.versements);

  /* Le code tel qu'il se compose, gabarit du club compris. Le club le
     pose une fois dans ses réglages ; à défaut, celui de MVola. */
  const codeAuto =
    numeroMvola && montant
      ? codeMvola(numeroMvola, montant, reglages?.ussd_gabarit || GABARIT_USSD)
      : '';
  const ussd = ussdSaisi ?? codeAuto;
  const setUssd = (v: string | null) => setUssdSaisi(v);

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
            {/* « Trois places au total » et non « 3 places » : sous
                dix, dans une phrase, un nombre s'écrit en lettres.
                C'est ce que la maquette faisait, et la comparaison
                l'a redit — le chiffre reste au compteur juste
                au-dessus, où il se lit d'un coup d'œil. */}
            <p className="aide" style={{ marginTop: 12 }}>
              {enLettres(venus + 1, { majuscule: true, feminin: true })} place
              {venus > 0 ? 's' : ''} au total avec vous. Le club compte les places pour le
              transport.
            </p>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ma participation</Surtitre>
          <Carte pad={16}>
            {du > 0 && (
              <div
                style={{
                  background: '#F1F6F3',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ flexGrow: 1, fontSize: 13, color: '#59685F' }}>
                    Demandé · {ariary(prix!)} × {venus + 1} place{venus > 0 ? 's' : ''}
                  </span>
                  <b style={{ fontSize: 13.5, color: '#0E2119' }}>{ariary(du)}</b>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ flexGrow: 1, fontSize: 13, color: '#59685F' }}>Déjà envoyé</span>
                  <b style={{ fontSize: 13.5, color: '#0E2119' }}>{ariary(recu)}</b>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ flexGrow: 1, fontSize: 13, color: '#59685F' }}>Reste</span>
                  <b
                    className="display"
                    style={{ fontSize: 15, color: reliquat > 0 ? '#8A3A12' : '#12613C' }}
                  >
                    {reliquat > 0 ? ariary(reliquat) : 'Soldé'}
                  </b>
                </div>
              </div>
            )}

            <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#59685F' }}>
              Vous pouvez envoyer en plusieurs fois. Choisissez le montant de cet envoi.
            </p>
            <div className="montants">
              {/* Le reliquat en premier : c'est le montant qu'on
                  voulait envoyer neuf fois sur dix, et le chercher
                  parmi quatre sommes rondes qui ne tombent pas juste
                  était le vrai défaut de cet écran. */}
              {reliquat > 0 && (
                <button
                  className={montant === reliquat ? 'montant montant--on' : 'montant'}
                  onClick={() => setMontant(reliquat)}
                  aria-pressed={montant === reliquat}
                  aria-label={`Tout le reste, ${ariary(reliquat)}`}
                >
                  {reliquat.toLocaleString('fr-FR').replace(/ | /g, ' ')}
                  <i>tout le reste</i>
                </button>
              )}
              {MONTANTS.map((m) => (
                <button
                  key={m}
                  className={montant === m ? 'montant montant--on' : 'montant'}
                  onClick={() => setMontant(m)}
                  aria-pressed={montant === m}
                  /* Sans libellé, le nom lu est « 10 000Ar » d'un seul
                     tenant : le nombre et son unité sont deux nœuds
                     collés, et une voix de synthèse les prononce
                     ainsi. */
                  aria-label={ariary(m)}
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
                  {/* ---- LE CODE EST MODIFIABLE ----

                      Il était écrit dans la page, en dur. Or les menus
                      d'un opérateur changent : MVola a déjà renuméroté
                      les siens, Orange Money et Airtel Money ont les
                      leurs, et un club en déplacement peut se voir
                      demander autre chose. Un code figé ferait
                      attendre une mise à jour sur le Play Store pour
                      un chiffre.

                      Le club pose le gabarit une fois dans ses
                      réglages ; ici, chacun peut encore corriger le
                      code avant de l'envoyer au clavier. Le champ est
                      en « tel » : le clavier du téléphone s'ouvre avec
                      les chiffres, l'étoile et le dièse, et non avec
                      des lettres. */}
                  <input
                    className="ussd__code"
                    type="tel"
                    inputMode="tel"
                    aria-label="Code USSD à composer"
                    value={ussd}
                    onChange={(e) => setUssd(e.target.value)}
                    style={{
                      width: '100%', border: 0, background: 'transparent',
                      padding: 0, font: 'inherit', color: 'inherit'
                    }}
                  />
                  {nomMvola && <p className="ussd__nom">{nomMvola} · MVola</p>}
                  {/* Corrigé à la main, il ne suit plus le montant :
                      le dire évite d'envoyer mille ariary en croyant
                      en envoyer dix mille. */}
                  {ussd !== codeAuto && (
                    <p className="ussd__nom" style={{ color: '#8A3A12' }}>
                      Code modifié à la main. Il ne suivra plus le montant choisi
                      au-dessus —{' '}
                      <button
                        className="link"
                        style={{ fontSize: 12 }}
                        onClick={() => setUssd(null)}
                      >
                        rétablir
                      </button>
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  <Bouton
                    desactive={!ussd.trim()}
                    onClick={() => {
                      /* tel: avec un code USSD ouvre le clavier
                         pré-rempli ; Android ne le compose JAMAIS
                         seul, et c'est bien ainsi — une application
                         qui déclencherait un transfert d'argent sans
                         qu'on ait rien confirmé serait exactement ce
                         qu'on ne veut pas. */
                      window.location.href = `tel:${encodeURIComponent(ussd.trim())}`;
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

        {/* Ce que le club ne peut pas deviner : « j'arrive après le
            travail », « je viens avec ma sœur qui n'est pas membre ».
            La colonne existait et rien ne l'écrivait — cela se disait
            donc de vive voix, et se perdait. */}
        <Zone
          libelle="Un mot pour le club"
          valeur={note ?? participation?.note ?? ''}
          poser={setNote}
          lignes={3}
          aide="Facultatif. Lu par l’administration sur la liste des inscrits."
        />

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
              {
                profilId: moi.id,
                accompagnants: venus,
                montantPromis: montant,
                note: note ?? participation?.note ?? null
              },
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
