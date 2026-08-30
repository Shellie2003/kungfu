/* ============================================================
   Administration · Le club — horaires et renseignements

   « Ny maître responsable koa moa zany mety hiova, dia à modifier
   daholo » : le responsable change, le téléphone change, l'adresse
   change, les jours d'entraînement changent.

   Sans cet écran, chacun de ces changements passait par le tableau
   de bord Supabase — c'est-à-dire par moi. Le club doit pouvoir le
   faire seul, sinon il ne le fera pas et l'application affichera
   pendant deux ans le numéro de quelqu'un qui a quitté le club.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Surtitre, Tuile } from '../../ui/base';
import { heure, nomDuJour, useHoraires, useReglages } from '../../services/club';
import {
  televerser, useAjouterHoraire, useEnregistrerReglages, useRetirerHoraire
} from '../../services/admin';
import { useUrl } from '../../services/stockage';

/* Les réglages que l'écran propose, dans l'ordre où on les lit.
   La table est en clé/valeur : en ajouter un ne demande pas de
   migration, seulement une ligne ici. */
const REGLAGES: [cle: string, libelle: string, aide?: string][] = [
  /* Le nom du club était écrit DANS le code, sur l'accueil et sur la
     carte de membre. Or « le nom officiel » est l'une des décisions
     que le club n'a pas encore tranchées : le figer obligeait à une
     nouvelle version le jour où il tranche. */
  ['nom_club', 'Nom du club', 'Sur l’accueil et sur la carte de membre.'],
  ['lieu_club', 'Quartier ou commune', 'Sur la carte de membre, sous « Club ».'],
  ['responsable', 'Responsable du club'],
  ['telephone', 'Téléphone', 'Celui qu’on affiche aux membres.'],
  ['adresse', 'Adresse', 'Où se trouve la salle.'],
  ['fondation', 'Année de fondation'],
  ['presentation_courte', 'Présentation courte', 'Deux ou trois phrases, sur l’accueil.'],
  ['presentation', 'Présentation longue', 'Sur l’écran du Club.'],
  ['mvola_numero', 'Numéro MVola', 'Celui qui reçoit les participations.'],
  ['mvola_nom', 'Nom du titulaire MVola', 'Affiché sous le code, pour vérification.']
];

/* La photo du club n'est pas un champ de texte : elle s'envoie. Elle
   figure quand même dans les réglages enregistrés — d'où cette
   entrée à part, pour que l'« upsert » lui donne un libellé lisible
   dans le tableau de bord comme les autres. */
const PHOTO: [cle: string, libelle: string] = ['photo_club', 'Photo du club'];

const JOURS = [1, 2, 3, 4, 5, 6, 7];
const NIVEAUX = ['Tous niveaux', 'Débutants', 'Gradés'];

export function AdminClub() {
  const aller = useNavigate();
  const { data: reglages } = useReglages();
  const { data: horaires, isPending, error } = useHoraires();
  const enregistrer = useEnregistrerReglages();
  const ajouter = useAjouterHoraire();
  const retirer = useRetirerHoraire();

  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  const [neuf, setNeuf] = useState({
    jour: '', debut: '17:30', fin: '19:00', niveau: 'Tous niveaux', lieu: ''
  });
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const apercuPhoto = useUrl('album', valeurs.photo_club || null);

  /* Les valeurs arrivent après le premier rendu. Sans cet effet, les
     champs resteraient vides alors que les réglages sont là — et
     enregistrer effacerait tout. */
  useEffect(() => {
    if (reglages) setValeurs(reglages);
  }, [reglages]);

  return (
    <>
      <Entete titre="Le club" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1, padding: '18px 20px 28px',
          display: 'flex', flexDirection: 'column', gap: 22
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Entraînements</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={(horaires ?? []).length === 0}
            messageVide="Aucun horaire. Ajoutez-en un ci-dessous."
          >
            <div className="list">
              {(horaires ?? []).map((h) => (
                <div key={h.id} className="listrow">
                  <span style={{ width: 74, flex: 'none', fontWeight: 600, fontSize: 14 }}>
                    {nomDuJour(h.jour)}
                  </span>
                  <span style={{ flexGrow: 1, fontSize: 14, color: '#3C4A42' }}>
                    {heure(h.debut)} – {heure(h.fin)}
                  </span>
                  <span style={{ fontSize: 12, color: '#7C8B82' }}>
                    {h.niveau}
                    {h.lieu ? ` · ${h.lieu}` : ''}
                  </span>
                  <button
                    className="tapicon"
                    aria-label={`Retirer la séance du ${nomDuJour(h.jour)}`}
                    onClick={() => retirer.mutate(h.id)}
                  >
                    <Icone nom="x" taille={17} couleur="#B3341A" />
                  </button>
                </div>
              ))}
            </div>
          </Etat>

          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Choix
                libelle="Jour"
                valeur={neuf.jour}
                poser={(v) => setNeuf((p) => ({ ...p, jour: v }))}
                options={JOURS.map((j) => ({ valeur: String(j), texte: nomDuJour(j) }))}
              />
              <Champ
                libelle="Début"
                valeur={neuf.debut}
                poser={(v) => setNeuf((p) => ({ ...p, debut: v }))}
                invite="17:30"
                aide="Sur vingt-quatre heures, avec deux points."
              />
              <Champ
                libelle="Fin"
                valeur={neuf.fin}
                poser={(v) => setNeuf((p) => ({ ...p, fin: v }))}
                invite="19:00"
              />
              <Choix
                libelle="Niveau"
                valeur={neuf.niveau}
                poser={(v) => setNeuf((p) => ({ ...p, niveau: v }))}
                options={NIVEAUX.map((n) => ({ valeur: n, texte: n }))}
              />
              {/* Le lieu était AFFICHÉ par l'écran du club et n'était
                  envoyé par personne : il restait donc vide pour
                  toujours, et un créneau au dojo ne se distinguait pas
                  d'un créneau au gymnase. */}
              <Champ
                libelle="Lieu"
                valeur={neuf.lieu}
                poser={(v) => setNeuf((p) => ({ ...p, lieu: v }))}
                invite="Dojo d’Analamahitsy"
                aide="Facultatif. Utile quand le club emploie plusieurs salles."
              />
              <Bouton
                genre="ghost"
                desactive={!neuf.jour || ajouter.isPending}
                onClick={() =>
                  ajouter.mutate(
                    {
                      jour: Number(neuf.jour),
                      debut: `${neuf.debut}:00`,
                      fin: `${neuf.fin}:00`,
                      niveau: neuf.niveau,
                      lieu: neuf.lieu
                    },
                    {
                      onSuccess: () => {
                        setAvis({ bon: true, texte: 'Séance ajoutée.' });
                        setNeuf((p) => ({ ...p, jour: '' }));
                      },
                      onError: (e) =>
                        setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
                    }
                  )
                }
              >
                Ajouter cette séance
              </Bouton>
            </div>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Renseignements</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REGLAGES.map(([cle, libelle, aide]) => (
                <Champ
                  key={cle}
                  libelle={libelle}
                  aide={aide}
                  valeur={valeurs[cle] ?? ''}
                  poser={(v) => setValeurs((p) => ({ ...p, [cle]: v }))}
                />
              ))}

              {/* La photo du club, sur l'accueil. Elle figurait dans
                  la liste validée à la livraison — « photo du club :
                  grande image de présentation » — et l'accueil
                  affichait « Photo du club à fournir » sans que rien
                  ne permette de la fournir.

                  Elle part TOUT DE SUITE dans le seau, comme l'image
                  d'une actualité ; ce qui va dans le réglage est son
                  chemin, jamais son adresse — les seaux sont privés et
                  l'adresse signée expire au bout d'une heure. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {apercuPhoto ? (
                  <img
                    src={apercuPhoto}
                    alt=""
                    style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
                  />
                ) : (
                  <Tuile icone="martial" petite />
                )}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600 }}>Photo du club</p>
                  <p style={{ fontSize: 12, color: '#59685F' }}>
                    {valeurs.photo_club ? 'Affichée sur l’accueil.' : 'L’accueil est vide sans elle.'}
                  </p>
                </div>
                {valeurs.photo_club && (
                  <button
                    className="link"
                    style={{ color: '#B3341A' }}
                    onClick={() => setValeurs((p) => ({ ...p, photo_club: '' }))}
                  >
                    Retirer
                  </button>
                )}
                <label className="btn btn--ghost" style={{ width: 'auto', padding: '0 14px' }}>
                  {envoiPhoto ? 'Envoi…' : valeurs.photo_club ? 'Changer' : 'Choisir'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setEnvoiPhoto(true);
                      try {
                        const chemin = await televerser('album', f);
                        setValeurs((p) => ({ ...p, photo_club: chemin }));
                        setAvis({
                          bon: true,
                          texte: 'Photo envoyée. Enregistrez pour qu’elle apparaisse.'
                        });
                      } catch (err) {
                        setAvis({ bon: false, texte: `Photo refusée : ${(err as Error).message}` });
                      } finally {
                        setEnvoiPhoto(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </Carte>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Bouton
          desactive={enregistrer.isPending}
          onClick={() =>
            /* Le libellé part avec la valeur : « upsert » écrit la
               ligne entière, et il est obligatoire en base. L'omettre
               ferait échouer l'insertion d'un réglage neuf ; y mettre
               la clé technique écraserait le libellé lisible que voit
               l'administration. C'est donc celui de cet écran qui
               fait foi. */
            enregistrer.mutate(
              [...REGLAGES, PHOTO].map(([cle, libelle]) => ({
                cle,
                libelle,
                valeur: valeurs[cle] ?? ''
              })),
              {
                onSuccess: () => setAvis({ bon: true, texte: 'Renseignements enregistrés.' }),
                onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
              }
            )
          }
        >
          {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer les renseignements'}
        </Bouton>

        <div className="warn">
          <i />
          <p>
            Ces renseignements s’affichent tels quels aux membres, sur l’accueil et l’écran du
            Club. Le numéro MVola sert à composer le code de participation : une erreur
            enverrait l’argent du club chez quelqu’un d’autre.
          </p>
        </div>
      </div>
    </>
  );
}
