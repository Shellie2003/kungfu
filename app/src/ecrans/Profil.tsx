/* ============================================================
   04 et 05 · Profil, verrouillé ou ouvert

   Un seul écran, pas deux. Ce qui décide, c'est ce que le serveur a
   rendu : si les informations privées sont là, on les montre ; si
   elles ne le sont pas, on montre le verrou.

   Écrire deux écrans et choisir dans l'application aurait fait
   croire que c'est l'application qui protège. Elle ne protège rien :
   elle affiche ce qu'elle a reçu, et elle n'a rien reçu d'autre.
   ============================================================ */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete, Grade, Portrait, Surtitre, Filet, Tuile } from '../ui/base';
import { dateFr, useFiche } from '../services/membres';
import { useUrl } from '../services/stockage';
import { estAdmin, estMaitre, useSession } from '../services/session';
import { seDeconnecter } from '../services/supabase';

const MASQUES = [
  'Date de naissance',
  'Numéro de membre',
  'Début d’entraînement',
  'Biographie',
  'Contact'
];

export function Profil() {
  const { id } = useParams();
  const aller = useNavigate();
  const { data: fiche, isPending } = useFiche(id);
  const moi = useSession((e) => e.profil);
  const portraitUrl = useUrl('portraits', fiche?.photo);
  /* Déclaré AVANT les retours anticipés : un hook ne se saute pas
     selon l'état du chargement — React compte les appels, et en
     sauter un décale tous les suivants. */
  const [partir, setPartir] = useState(false);

  if (isPending) {
    return (
      <>
        <Entete titre="Profil" retour={() => aller(-1)} />
        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
          Chargement…
        </div>
      </>
    );
  }

  if (!fiche) {
    return (
      <>
        <Entete titre="Profil" retour={() => aller('/etudiants')} />
        <div style={{ padding: 20 }}>
          <Carte>
            <p style={{ fontSize: 13.5, lineHeight: '20px', color: '#59685F' }}>
              Cette fiche n’est pas accessible.
            </p>
          </Carte>
        </div>
      </>
    );
  }

  const estMoi = moi?.id === fiche.id;

  /* ⚠ Ce qui décide de montrer le VERROU, et pourquoi le premier
     jet était faux.

     Il regardait si des informations privées étaient arrivées : « si
     le serveur m'a rendu quelque chose, j'ouvre ». L'intention était
     bonne — ne pas laisser l'application décider de ce qu'elle a le
     droit de voir — mais elle confondait deux choses très
     différentes :

       « on ne me les a pas données »   → le verrou a du sens
       « il n'y en a pas »              → le verrou est un mensonge

     Une administration qui ouvrait la fiche d'un élève sans date de
     naissance, sans tuteur et sans biographie — le cas ORDINAIRE
     d'une fiche qu'on vient de créer — lisait « informations
     réservées ». Elle y avait accès. Il n'y avait rien.

     Le rôle sert donc à choisir le TEXTE, jamais à décider ce qui
     s'affiche : l'écran ne montre toujours que ce que le serveur a
     rendu. Un élève qui modifierait l'application pour se déclarer
     maître verrait la même chose — c'est-à-dire rien de plus. */
  const aDroit = estMoi || estMaitre(moi);
  const aQuelqueChose = Boolean(fiche.prive || fiche.tuteurs.length > 0 || fiche.biographie);
  const ouverte = aDroit || aQuelqueChose;

  /* ---------------------------------------------- Verrouillé */
  if (!ouverte) {
    return (
      <>
        <Entete titre="Profil" retour={() => aller('/etudiants')} />
        <div
          style={{
            flexGrow: 1,
            padding: '24px 20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              textAlign: 'center'
            }}
          >
            <Portrait taille={132} rayon={24} photo={portraitUrl} />
            <div>
              <p className="display" style={{ fontSize: 22, lineHeight: '26px' }}>
                {fiche.nom}
              </p>
              <p
                className="display"
                style={{ fontSize: 20, fontWeight: 500, color: '#3C4A42', lineHeight: '25px' }}
              >
                {fiche.prenom}
              </p>
              {fiche.grade && (
                <div style={{ marginTop: 12 }}>
                  <Grade nom={fiche.grade.nom} couleur={fiche.grade.couleur} />
                </div>
              )}
            </div>
          </div>

          {/* La liste des champs masqués est montrée : on sait ce
              qu'on obtiendrait, plutôt qu'un mur nu. */}
          <Carte pad={22} style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'center'
                }}
              >
                <div className="tile">
                  <Icone nom="lock" taille={22} couleur="#0F5132" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>Informations réservées</p>
                <p
                  style={{ fontSize: 13, lineHeight: '19px', color: '#59685F', maxWidth: 250 }}
                >
                  Ces renseignements ne sont visibles que par l’intéressé et par
                  l’encadrement du club.
                </p>
              </div>
              <div className="masked">
                {MASQUES.map((f) => (
                  <div key={f}>
                    <span>{f}</span>
                    <span className="masked__dots">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Carte>
        </div>
      </>
    );
  }

  /* ---------------------------------------------- Ouvert */
  const urgence = fiche.tuteurs.find((t) => t.urgence);

  return (
    <>
      <Entete
        titre="Profil"
        retour={() => aller('/etudiants')}
        action={
          /* Depuis sa propre fiche, on change son mot de passe.
             Depuis celle d'un autre, l'administration la corrige —
             sans quoi il fallait ressortir, ouvrir l'écran
             d'administration et retrouver la personne dans une
             seconde liste. */
          estMoi ? (
            <button
              className="tapicon"
              onClick={() => aller('/motdepasse')}
              aria-label="Changer le mot de passe"
            >
              <Icone nom="key" taille={21} couleur="#0E2119" />
            </button>
          ) : estAdmin(moi) ? (
            <button
              className="tapicon"
              onClick={() => aller(`/admin/fiche/${fiche.id}`)}
              aria-label="Modifier cette fiche"
            >
              <Icone nom="edit" taille={21} couleur="#0E2119" />
            </button>
          ) : undefined
        }
      />

      <div
        style={{
          flexGrow: 1,
          padding: '24px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Portrait taille={96} rayon={20} photo={portraitUrl} />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <p className="display" style={{ fontSize: 19, lineHeight: '23px' }}>
              {fiche.nom}
            </p>
            <p
              className="display"
              style={{ fontSize: 17, fontWeight: 500, color: '#3C4A42', lineHeight: '22px' }}
            >
              {fiche.prenom}
            </p>
            {fiche.grade && (
              <div style={{ marginTop: 9 }}>
                <Grade nom={fiche.grade.nom} couleur={fiche.grade.couleur} />
              </div>
            )}
          </div>
        </div>

        {estMoi && (
          <div className="banner">
            <Icone nom="lock" taille={16} couleur="#0F5132" />
            <span>Fiche ouverte · session de {fiche.prenom}</span>
          </div>
        )}

        {/* Le cas « j'ai le droit, mais il n'y a rien » : le dire,
            plutôt que de laisser une carte à moitié vide dont on ne
            sait pas si elle est cachée ou incomplète. */}
        {aDroit && !aQuelqueChose && (
          <div className="banner">
            <Icone nom="edit" taille={16} couleur="#0F5132" />
            <span>Aucune information privée n’a encore été saisie sur cette fiche.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Informations personnelles</Surtitre>
          <Carte pad={16}>
            <div className="deflist">
              {(
                [
                  ['Nom', fiche.nom],
                  ['Prénom', fiche.prenom],
                  ['Date de naissance', dateFr(fiche.prive?.date_naissance ?? null)],
                  ['Numéro de membre', fiche.numero],
                  ['Début d’entraînement', dateFr(fiche.debut)],
                  ['Grade', fiche.grade?.nom ?? null]
                ] as [string, string | null][]
              )
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
            </div>
          </Carte>
        </div>

        {fiche.tuteurs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Parents ou tuteur</Surtitre>
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fiche.tuteurs.map((t, i) => (
                  <div key={t.id}>
                    {i > 0 && <div style={{ marginBottom: 14 }}><Filet /></div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Tuile icone="users" petite />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{t.nom}</p>
                        <p style={{ fontSize: 13, color: '#59685F' }}>
                          {t.lien}
                          {t.urgence ? ' · responsable légale' : ''}
                        </p>
                      </div>
                      {t.telephone && (
                        <a className="calltag" href={`tel:${t.telephone.replace(/\s+/g, '')}`}>
                          <Icone nom="phone" taille={15} couleur="#0F5132" /> {t.telephone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {urgence && (
                  <>
                    <Filet />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Tuile icone="phone" petite fond="#FBEEE2" couleur="#B0530F" />
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>À prévenir en urgence</p>
                        <p style={{ fontSize: 13, color: '#59685F' }}>{urgence.nom}, en priorité</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Carte>
          </div>
        )}

        {fiche.biographie && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Biographie</Surtitre>
            <Carte>
              <p style={{ fontSize: 14, lineHeight: '23px', color: '#3C4A42' }}>
                {fiche.biographie}
              </p>
            </Carte>
          </div>
        )}

        {/* ---------------------------------------------- Se déconnecter

            « seDeconnecter » existait dans le code depuis le premier
            jour et RIEN ne l'appelait : il n'y avait aucun moyen de
            quitter sa session. Sur un téléphone partagé — et le club
            en a — cela veut dire que le suivant hérite du compte du
            précédent, avec ses conversations et, pour un maître, son
            espace confidentiel.

            Sur SA propre fiche, et nulle part ailleurs : c'est là
            qu'on va pour ce qui nous concerne, et le mot de passe s'y
            change déjà.

            La confirmation n'est pas une politesse : sur un réseau
            malgache, se reconnecter demande de retrouver son
            matricule et son mot de passe, et un appui malheureux
            coûterait une séance entière. */}
        {estMoi && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Cette session</Surtitre>
            {partir ? (
              <div className="warn">
                <i />
                <p>
                  Se déconnecter de ce téléphone ? Il faudra le matricule{' '}
                  <b>{fiche.numero}</b> et le mot de passe pour revenir.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <Bouton
                    onClick={() => {
                      /* On ne redirige pas à la main : la racine
                         regarde la session, et l'écran de connexion
                         reprend la place dès qu'elle disparaît. Une
                         redirection en plus laisserait un écran de
                         profil vide s'afficher une fraction de
                         seconde. */
                      void seDeconnecter();
                    }}
                  >
                    Oui, me déconnecter
                  </Bouton>
                  <Bouton genre="ghost" onClick={() => setPartir(false)}>
                    Annuler
                  </Bouton>
                </div>
              </div>
            ) : (
              <Bouton genre="ghost" onClick={() => setPartir(true)}>
                Se déconnecter
              </Bouton>
            )}
          </div>
        )}
      </div>
    </>
  );
}
