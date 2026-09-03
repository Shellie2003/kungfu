/* ============================================================
   Administration · Ajouter un étudiant, et modifier une fiche

   Un seul écran pour les deux : c'est le même formulaire, avec ou
   sans valeurs de départ. Deux écrans auraient divergé au premier
   champ ajouté.

   Ce que ce formulaire n'écrit PAS, et c'est délibéré : le numéro
   de membre, attribué par la base, et le grade, qui a son propre
   écran. Un déclencheur de la base les fige de toute façon — les
   envoyer ferait échouer la mise à jour entière.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import {
  Avis,
  Bouton,
  Carte,
  Champ,
  Choix,
  Entete,
  Filet,
  Portrait,
  Surtitre,
  ChoisirFichier,
  Tuile,
  Zone
} from '../../ui/base';
import { useFiche, useGrades } from '../../services/membres';
import { useUrl } from '../../services/stockage';
import {
  useAjouterTuteur,
  useChangerPortrait,
  useCreerFiche,
  useDesactiver,
  useModifierFiche,
  useRetirerTuteur
} from '../../services/admin';
import type { Inscription, SaisieFiche } from '../../services/admin';
import { televerser } from '../../services/admin';
import { estSuper, useSession } from '../../services/session';
import type { Role } from '../../services/session';
import { Anneau } from '../../ui/Anneau';

const VIDE: SaisieFiche = {
  nom: '', prenom: '', grade_id: null, debut: null, biographie: null,
  date_naissance: null, telephone: null, adresse: null, notes: null
};

export function AdminFiche() {
  const { id } = useParams();
  const aller = useNavigate();
  const modification = Boolean(id);

  const { data: fiche } = useFiche(id);
  const portraitUrl = useUrl('portraits', fiche?.photo);
  const { data: grades } = useGrades();
  const creer = useCreerFiche();
  const modifier = useModifierFiche(id);
  const portrait = useChangerPortrait();
  const desactiver = useDesactiver();
  const ajouterTuteur = useAjouterTuteur(id);
  const retirerTuteur = useRetirerTuteur();

  const [s, setS] = useState<SaisieFiche>(VIDE);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  const [tuteur, setTuteur] = useState({ nom: '', lien: '', telephone: '', urgence: false });

  /* ---- La photo, DÈS L'INSCRIPTION ----
     Elle ne se posait qu'après coup : il fallait créer la fiche,
     ressortir, la rouvrir, puis choisir la photo. Trois écrans pour
     une chose qu'on a sous la main au moment où l'on inscrit
     quelqu'un — donc une chose qu'on ne faisait pas. */
  const [photo, setPhoto] = useState<{ chemin: string; apercu: string } | null>(null);
  const [envoiPhoto, setEnvoiPhoto] = useState<number | null>(null);

  /* Ce que le serveur vient d'engendrer. Montré UNE FOIS : le mot de
     passe n'est stocké nulle part en clair, ici pas plus qu'ailleurs. */
  const [acces, setAcces] = useState<Inscription | null>(null);

  const moi = useSession((e) => e.profil);
  const superAdmin = estSuper(moi);

  /* Les valeurs de départ arrivent après le premier rendu : la fiche
     se lit sur le serveur. Sans cet effet, le formulaire resterait
     vide alors que les données sont là. */
  useEffect(() => {
    if (!fiche) return;
    setS({
      nom: fiche.nom,
      prenom: fiche.prenom,
      grade_id: null,
      debut: fiche.debut,
      biographie: fiche.biographie,
      date_naissance: fiche.prive?.date_naissance ?? null,
      telephone: fiche.prive?.telephone ?? null,
      adresse: fiche.prive?.adresse ?? null,
      notes: fiche.prive?.notes ?? null
    });
  }, [fiche]);

  const poser = (champ: keyof SaisieFiche) => (v: string) =>
    setS((p) => ({ ...p, [champ]: v || null }));

  const enCours = creer.isPending || modifier.isPending;

  const poserPhoto = async (fichier: File) => {
    setEnvoiPhoto(0);
    setAvis(null);
    try {
      /* « portrait » et non « fil » : cette image finit IMPRIMÉE sur
         une carte de membre, où le visage occupe deux centimètres.
         Le réglage la ménage — voir services/images.ts. */
      const chemin = await televerser('portraits', fichier, 'portrait', (p) =>
        setEnvoiPhoto(p)
      );
      setPhoto({ chemin, apercu: URL.createObjectURL(fichier) });
    } catch (e) {
      setAvis({ bon: false, texte: `Photo refusée : ${(e as Error).message}` });
    } finally {
      setEnvoiPhoto(null);
    }
  };

  function enregistrer() {
    if (!s.nom.trim() || !s.prenom.trim()) {
      setAvis({ bon: false, texte: 'Le nom et le prénom sont obligatoires.' });
      return;
    }
    setAvis(null);
    setAcces(null);

    if (modification) {
      modifier.mutate(s, {
        onSuccess: () => setAvis({ bon: true, texte: 'Fiche enregistrée.' }),
        onError: (e: unknown) =>
          setAvis({ bon: false, texte: `Refusé par le serveur : ${(e as Error).message}` })
      });
      return;
    }

    creer.mutate(
      { ...s, photo: photo?.chemin ?? null },
      {
        onSuccess: (r) => {
          /* Les identifiants prennent la place de l'avis : ils
             comptent plus qu'un « fiche créée » que personne ne lit,
             et ils ne repasseront pas. */
          setAcces(r);
          setS(VIDE);
          setPhoto(null);
        },
        onError: (e: unknown) =>
          setAvis({ bon: false, texte: `Refusé par le serveur : ${(e as Error).message}` })
      }
    );
  }

  return (
    <>
      <Entete
        titre={modification ? 'Modifier une fiche' : 'Ajouter un étudiant'}
        retour={() => aller('/admin')}
      />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {modification && fiche && (
          <Carte pad={16}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Portrait taille={64} rayon={16} photo={portraitUrl} />
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700 }}>{fiche.numero}</p>
                <p style={{ fontSize: 13, color: '#59685F', marginTop: 2 }}>
                  {fiche.grade?.nom ?? 'Sans grade'}
                </p>
              </div>
              {/* Le portrait s'envoie séparément du reste : une photo
                  part tout de suite, le formulaire attend le bouton. */}
              <ChoisirFichier
                libelle={portrait.isPending ? 'Envoi…' : 'Photo'}
                desactive={portrait.isPending}
                style={{ width: 'auto', padding: '0 14px' }}
                onFichier={([f]) => {
                  if (f && id) portrait.mutate({ profilId: id, fichier: f });
                }}
              />
            </div>
          </Carte>
        )}

        {/* ---- LA PHOTO À L'INSCRIPTION ----

            Elle ne se posait qu'APRÈS : créer la fiche, ressortir, la
            rouvrir, choisir la photo. Trois écrans pour une chose
            qu'on a sous la main au moment précis où l'on inscrit
            quelqu'un — donc une chose qu'on ne faisait pas, et
            soixante-quatre silhouettes grises dans l'annuaire.

            Deux chemins, comme partout ailleurs : « capture » ouvre
            l'appareil photo ET ferme la porte à la galerie, un bouton
            unique ne peut pas faire les deux.

            La photo part TOUT DE SUITE dans le seau ; ce que la fiche
            recevra est son chemin. C'est ce qui permet de la voir
            avant d'enregistrer, et de la remplacer si elle est
            floue. */}
        {!modification && (
          <Carte pad={16}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Portrait taille={64} rayon={16} photo={photo?.apercu ?? null} />
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Photo du membre</p>
                <p style={{ fontSize: 12.5, color: '#59685F', marginTop: 2 }}>
                  {photo
                    ? 'Elle partira avec la fiche.'
                    : 'Facultative. Elle s’affiche dans l’annuaire et sur la carte.'}
                </p>
                {envoiPhoto !== null && (
                  <div style={{ marginTop: 8 }}>
                    <Anneau part={envoiPhoto} taille={26} epaisseur={3} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <ChoisirFichier
                appareil
                libelle="Prendre une photo"
                desactive={envoiPhoto !== null}
                onFichier={([f]) => f && void poserPhoto(f)}
              />
              <ChoisirFichier
                libelle="Importer"
                desactive={envoiPhoto !== null}
                onFichier={([f]) => f && void poserPhoto(f)}
              />
            </div>
          </Carte>
        )}

        {/* ---- LE RÔLE, DÉCIDÉ À L'INSCRIPTION ----

            « Le super admin décide quel est le rôle d'une personne dès
            l'inscription. »

            Le choix ne s'affiche qu'à lui, et ce n'est PAS ce qui
            protège : un déclencheur de la base refuse à tout autre
            d'inscrire un membre qui ne soit pas élève (migration
            0016). L'écran ne fait que ne pas proposer ce qui serait
            refusé — montrer un choix qui mène à une erreur laisse la
            personne se demander si le fautif est elle.

            Un administrateur ordinaire continue d'inscrire des
            membres : ils sont élèves, ce qui est le cas de soixante et
            un des soixante-quatre. */}
        {!modification && superAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Rôle dans le club</Surtitre>
            <Carte pad={16}>
              <Choix
                libelle="Rôle"
                valeur={s.role ?? 'eleve'}
                poser={(v) => setS((p) => ({ ...p, role: v as Role }))}
                options={[
                  { valeur: 'eleve', texte: 'Élève' },
                  { valeur: 'maitre', texte: 'Maître — encadre, tient l’image du club' },
                  { valeur: 'admin', texte: 'Administration — gère tout le club' }
                ]}
                aide="Il se change ensuite, mais toujours par un super administrateur."
              />
            </Carte>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>État civil</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Champ
                libelle="Nom"
                valeur={s.nom}
                poser={(v) => setS((p) => ({ ...p, nom: v }))}
                obligatoire
                aide="Écrit en capitales, comme sur la carte de membre."
              />
              <Champ
                libelle="Prénom"
                valeur={s.prenom}
                poser={(v) => setS((p) => ({ ...p, prenom: v }))}
                obligatoire
              />
              <Champ
                libelle="Début d’entraînement"
                type="date"
                valeur={s.debut ?? ''}
                poser={poser('debut')}
              />
              {!modification && grades && (
                <Choix
                  libelle="Grade"
                  valeur={s.grade_id ?? ''}
                  poser={(v) => setS((p) => ({ ...p, grade_id: v }))}
                  options={grades.map((g) => ({ valeur: g.id, texte: g.nom }))}
                  aide="Se change ensuite par l’écran « Changer un grade »."
                />
              )}
            </div>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Informations privées</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Ces trois-là vivent dans une table séparée, et c'est
                  ce qui protège les mineurs : une règle d'accès porte
                  sur une ligne, jamais sur une colonne. */}
              <Champ
                libelle="Date de naissance"
                type="date"
                valeur={s.date_naissance ?? ''}
                poser={poser('date_naissance')}
              />
              <Champ
                libelle="Téléphone"
                type="tel"
                valeur={s.telephone ?? ''}
                poser={poser('telephone')}
              />
              <Champ libelle="Adresse" valeur={s.adresse ?? ''} poser={poser('adresse')} />
              <p className="aide">
                Visibles seulement par l’intéressé et par l’encadrement. Elles ne figurent pas
                à l’annuaire.
              </p>
              <Filet />
              {/* La note interne. Elle passe par la même table privée
                  que le reste, donc par la même règle d'accès — mais
                  l'écran de profil ne l'affiche NULLE PART, pas même
                  à l'intéressé. C'est une note de l'encadrement sur
                  quelqu'un, pas une information le concernant qu'on
                  lui rendrait. */}
              <Zone
                libelle="Note de l’encadrement"
                valeur={s.notes ?? ''}
                poser={poser('notes')}
                lignes={3}
                aide="Interne aux maîtres et à l’administration. Ce que vous écrivez ici, écrivez-le en sachant qu’un parent peut un jour demander à le lire."
              />
            </div>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Biographie</Surtitre>
          <Carte pad={16}>
            <Zone
              libelle="Quelques lignes"
              valeur={s.biographie ?? ''}
              poser={poser('biographie')}
              aide="Facultative. Apparaît sur la fiche ouverte."
            />
          </Carte>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* ---- LES IDENTIFIANTS, MONTRÉS UNE SEULE FOIS ----

            Ils étaient à créer dans un second écran, après coup. On
            l'oubliait : la fiche existait, le membre ne pouvait pas se
            connecter, et personne ne s'en apercevait avant qu'il
            essaie un samedi matin.

            Le mot de passe n'est stocké nulle part en clair — ni ici,
            ni en base, ni dans un journal. Il ne repassera donc pas,
            et l'écran le dit avant qu'on quitte la page. */}
        {acces && (
          <Carte pad={16} style={{ background: '#E8F1EC', borderColor: '#B9D3C4' }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Membre inscrit</p>
            <div className="deflist" style={{ marginTop: 12 }}>
              <div>
                <span style={{ width: 110, flex: 'none', color: '#0E2119', fontWeight: 600 }}>
                  Matricule
                </span>
                <span style={{ flexGrow: 1, fontWeight: 700 }}>{acces.numero}</span>
              </div>
              {acces.motDePasse && (
                <div>
                  <span style={{ width: 110, flex: 'none', color: '#0E2119', fontWeight: 600 }}>
                    Mot de passe
                  </span>
                  <span
                    style={{ flexGrow: 1, fontWeight: 700, fontFamily: 'monospace', fontSize: 16 }}
                  >
                    {acces.motDePasse}
                  </span>
                </div>
              )}
            </div>

            {acces.motDePasse ? (
              <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#3C4A42', marginTop: 12 }}>
                Notez-le et remettez-le au membre <b>maintenant</b> : il ne s’affichera plus.
                Personne ne peut le retrouver, pas même en base — il s’y trouve chiffré. En cas
                d’oubli, l’administration en engendre un nouveau depuis « Comptes et accès ».
              </p>
            ) : (
              <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#8A3B12', marginTop: 12 }}>
                <b>La fiche est créée, mais le compte de connexion n’a pas pu l’être</b>
                {acces.souci ? ` : ${acces.souci}` : '.'} La saisie n’est pas perdue. Ouvrez
                « Comptes et accès » pour créer l’accès de {acces.numero}.
              </p>
            )}
          </Carte>
        )}

        <Bouton onClick={enregistrer} desactive={enCours}>
          {enCours
            ? 'Enregistrement…'
            : modification
              ? 'Enregistrer'
              : 'Inscrire ce membre'}
        </Bouton>

        {/* Les tuteurs ne se saisissent qu'une fois la fiche créée :
            ils s'y rattachent, et il n'y a rien à quoi les rattacher
            tant qu'elle n'existe pas. */}
        {modification && fiche && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Parents ou tuteur</Surtitre>
            {fiche.tuteurs.length > 0 && (
              <div className="list">
                {fiche.tuteurs.map((t) => (
                  <div key={t.id} className="listrow">
                    <Tuile icone="users" petite />
                    <span style={{ flexGrow: 1, minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{t.nom}</b>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                        {t.lien}
                        {t.urgence ? ' · à prévenir en urgence' : ''}
                        {t.telephone ? ` · ${t.telephone}` : ''}
                      </span>
                    </span>
                    <button
                      className="tapicon"
                      aria-label={`Retirer ${t.nom}`}
                      onClick={() => retirerTuteur.mutate(t.id)}
                    >
                      <Icone nom="x" taille={17} couleur="#B3341A" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Champ
                  libelle="Nom du tuteur"
                  valeur={tuteur.nom}
                  poser={(v) => setTuteur((p) => ({ ...p, nom: v }))}
                />
                <Champ
                  libelle="Lien"
                  valeur={tuteur.lien}
                  poser={(v) => setTuteur((p) => ({ ...p, lien: v }))}
                  invite="Mère, Père, Oncle…"
                />
                <Champ
                  libelle="Téléphone"
                  type="tel"
                  valeur={tuteur.telephone}
                  poser={(v) => setTuteur((p) => ({ ...p, telephone: v }))}
                />
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}
                >
                  <input
                    type="checkbox"
                    checked={tuteur.urgence}
                    onChange={(e) => setTuteur((p) => ({ ...p, urgence: e.target.checked }))}
                  />
                  À prévenir en priorité en cas d’urgence
                </label>
                <Filet />
                <Bouton
                  genre="ghost"
                  desactive={!tuteur.nom.trim() || !tuteur.lien.trim() || ajouterTuteur.isPending}
                  onClick={() =>
                    ajouterTuteur.mutate(
                      { ...tuteur, telephone: tuteur.telephone || null },
                      { onSuccess: () => setTuteur({ nom: '', lien: '', telephone: '', urgence: false }) }
                    )
                  }
                >
                  Ajouter ce tuteur
                </Bouton>
              </div>
            </Carte>
          </div>
        )}

        {modification && fiche && (
          <div className="warn">
            <i />
            <p>
              {/* ⚠ CE BOUTON NE SAVAIT QUE DÉSACTIVER.

                  Il disait « Désactiver cette fiche » quel que soit
                  l'état du membre, et n'envoyait jamais que
                  « actif: false ». Un élève retiré du club ne pouvait
                  donc PAS revenir : la fonction de réactivation
                  existait dans les services, aucun écran ne
                  l'appelait, et la seule issue était le tableau de
                  bord Supabase — c'est-à-dire moi.

                  Et le texte promettait précisément le contraire :
                  « un élève qui revient retrouve son numéro, son
                  grade et son historique ». Il le retrouvait, à
                  condition que quelqu'un puisse le réactiver. */}
              {fiche.actif === false ? (
                <>
                  Cette fiche est <b>retirée du club</b>. Le membre n’apparaît plus dans
                  l’annuaire des élèves et ne peut plus se connecter. Son numéro, son grade et
                  son historique sont intacts.
                  <br />
                  <button
                    className="link"
                    style={{ marginTop: 8 }}
                    onClick={() => id && desactiver.mutate({ profilId: id, actif: true })}
                  >
                    Réintégrer ce membre
                  </button>
                </>
              ) : (
                <>
                  Une fiche ne se supprime pas, elle se désactive : un élève qui revient
                  retrouve son numéro, son grade et son historique.
                  <br />
                  <button
                    className="link"
                    style={{ marginTop: 8 }}
                    onClick={() => id && desactiver.mutate({ profilId: id, actif: false })}
                  >
                    Retirer ce membre du club
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
