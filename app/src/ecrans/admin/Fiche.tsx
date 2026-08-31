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
import type { SaisieFiche } from '../../services/admin';

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

  function enregistrer() {
    if (!s.nom.trim() || !s.prenom.trim()) {
      setAvis({ bon: false, texte: 'Le nom et le prénom sont obligatoires.' });
      return;
    }
    setAvis(null);
    const action = modification ? modifier : creer;
    action.mutate(s, {
      onSuccess: () => {
        setAvis({
          bon: true,
          texte: modification ? 'Fiche enregistrée.' : 'Fiche créée. Le numéro a été attribué par le club.'
        });
        if (!modification) setS(VIDE);
      },
      onError: (e) =>
        setAvis({ bon: false, texte: `Refusé par le serveur : ${(e as Error).message}` })
    });
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

        <Bouton onClick={enregistrer} desactive={enCours}>
          {enCours ? 'Enregistrement…' : modification ? 'Enregistrer' : 'Créer la fiche'}
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
              Une fiche ne se supprime pas, elle se désactive : un élève qui revient retrouve
              son numéro, son grade et son historique.
              <br />
              <button
                className="link"
                style={{ marginTop: 8 }}
                onClick={() => id && desactiver.mutate({ profilId: id, actif: false })}
              >
                Désactiver cette fiche
              </button>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
