/* ============================================================
   Administration · Publier, notifier, albums et photos
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import {
  Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Surtitre, Tuile, Zone
} from '../../ui/base';
import { useActualites, teinte } from '../../services/casier';
import { urlPhoto, useAlbums } from '../../services/club';
import {
  useAjouterPhotos, useCreerAlbum, useNotifierTous, usePublier,
  useSupprimerActualite, useSupprimerAlbum, useSupprimerPhoto
} from '../../services/admin';

/* Les catégories que le club emploie déjà, plus celles qu'il
   inventera : le champ est libre, la liste n'est qu'un raccourci. */
const CATEGORIES = ['Sortie', 'Compétition', 'Réunion', 'Cérémonie', 'Changement d’horaire'];

/* ---------------------------------------------- Publier une actualité */
export function AdminPublier() {
  const aller = useNavigate();
  const { data: actus } = useActualites();
  const publier = usePublier();
  const supprimer = useSupprimerActualite();

  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [texte, setTexte] = useState('');
  const [date, setDate] = useState('');
  const [lieu, setLieu] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  function envoyer(publiee: boolean) {
    if (!titre.trim() || !categorie.trim() || !texte.trim()) {
      setAvis({ bon: false, texte: 'Le titre, la catégorie et le texte sont obligatoires.' });
      return;
    }
    publier.mutate(
      { titre: titre.trim(), categorie: categorie.trim(), texte: texte.trim(),
        date_evt: date || null, lieu: lieu || null, publiee },
      {
        onSuccess: () => {
          setAvis({ bon: true, texte: publiee ? 'Publiée. Tout le club la voit.' : 'Enregistrée en brouillon.' });
          setTitre(''); setCategorie(''); setTexte(''); setDate(''); setLieu('');
        },
        onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
      }
    );
  }

  return (
    <>
      <Entete titre="Publier une actualité" retour={() => aller('/admin')} />
      <div style={{ flexGrow: 1, padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Champ libelle="Titre" valeur={titre} poser={setTitre} obligatoire />
            <Choix
              libelle="Catégorie"
              valeur={categorie}
              poser={setCategorie}
              options={CATEGORIES.map((c) => ({ valeur: c, texte: c }))}
              aide="Elle donne la couleur de l’étiquette dans le casier."
            />
            <Champ libelle="Date de l’événement" type="date" valeur={date} poser={setDate} />
            <Champ libelle="Lieu" valeur={lieu} poser={setLieu} invite="Devant la salle" />
            <Zone
              libelle="Texte"
              valeur={texte}
              poser={setTexte}
              lignes={6}
              aide="Une ligne vide entre deux paragraphes : ils sont rendus tels quels."
            />
          </div>
        </Carte>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bouton onClick={() => envoyer(true)} desactive={publier.isPending}>
            {publier.isPending ? 'Envoi…' : 'Publier'}
          </Bouton>
          {/* Un brouillon n'est visible que de l'administration : la
              règle d'accès exclut « publiee = false » pour tous les
              autres. C'est ce qui permet de préparer sans annoncer. */}
          <Bouton genre="ghost" onClick={() => envoyer(false)} desactive={publier.isPending}>
            Enregistrer en brouillon
          </Bouton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Déjà au casier</Surtitre>
          <div className="list">
            {(actus ?? []).map((a) => {
              const [cc, cb] = teinte(a.categorie);
              return (
                <div key={a.id} className="listrow">
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <span className="tag" style={{ color: cc, background: cb }}>{a.categorie}</span>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 600, marginTop: 6 }}>
                      {a.titre}
                    </b>
                  </span>
                  <button
                    className="tapicon"
                    aria-label={`Supprimer ${a.titre}`}
                    onClick={() => supprimer.mutate(a.id)}
                  >
                    <Icone nom="x" taille={17} couleur="#B3341A" />
                  </button>
                </div>
              );
            })}
            {actus && actus.length === 0 && (
              <div className="listrow">
                <span style={{ fontSize: 13, color: '#59685F' }}>Le casier est vide.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------- Envoyer une notification */
export function AdminNotifier() {
  const aller = useNavigate();
  const notifier = useNotifierTous();
  const { data: actus } = useActualites();
  const [titre, setTitre] = useState('');
  const [texte, setTexte] = useState('');
  const [vers, setVers] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  return (
    <>
      <Entete titre="Envoyer une notification" retour={() => aller('/admin')} />
      <div style={{ flexGrow: 1, padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Champ libelle="Titre" valeur={titre} poser={setTitre} obligatoire />
            <Zone libelle="Message" valeur={texte} poser={setTexte} lignes={3} />
            <Choix
              libelle="Ouvre quel écran"
              valeur={vers}
              poser={setVers}
              options={(actus ?? []).map((a) => ({ valeur: `/casier/${a.id}`, texte: a.titre }))}
              aide="Facultatif. Sans cela, la notification se lit sans rien ouvrir."
            />
          </div>
        </Carte>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Bouton
          desactive={notifier.isPending || !titre.trim()}
          onClick={() =>
            notifier.mutate(
              { titre: titre.trim(), texte: texte.trim(), vers: vers || null },
              {
                onSuccess: () => {
                  setAvis({ bon: true, texte: 'Envoyée à tous les membres actifs.' });
                  setTitre(''); setTexte(''); setVers('');
                },
                onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
              }
            )
          }
        >
          {notifier.isPending ? 'Envoi…' : 'Prévenir tout le club'}
        </Bouton>

        <div className="warn">
          <i />
          <p>
            La notification apparaît dans l’application, pas sur l’écran verrouillé du
            téléphone : les notifications poussées demandent un service à part, qui n’est pas
            encore en place.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------- Albums et photos */
export function AdminAlbums() {
  const aller = useNavigate();
  const { data: albums, isPending, error } = useAlbums();
  const creer = useCreerAlbum();
  const supprimerAlbum = useSupprimerAlbum();
  const supprimerPhoto = useSupprimerPhoto();

  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const ajouter = useAjouterPhotos();
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  return (
    <>
      <Entete titre="Albums et photos" retour={() => aller('/admin')} />
      <div style={{ flexGrow: 1, padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Créer un album</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Champ libelle="Titre" valeur={titre} poser={setTitre} obligatoire />
              <Champ
                libelle="Catégorie"
                valeur={categorie}
                poser={setCategorie}
                invite="Compétitions, Entraînements, Cérémonies…"
              />
              <Bouton
                genre="ghost"
                desactive={!titre.trim() || !categorie.trim() || creer.isPending}
                onClick={() =>
                  creer.mutate(
                    { titre: titre.trim(), categorie: categorie.trim() },
                    { onSuccess: () => { setTitre(''); setCategorie(''); } }
                  )
                }
              >
                Créer
              </Bouton>
            </div>
          </Carte>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les albums</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={(albums ?? []).length === 0}
            messageVide="Aucun album."
          >
            {(albums ?? []).map((a) => (
              <Carte key={a.id} pad={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tuile icone="album" petite />
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{a.titre}</b>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                      {a.categorie} · {a.photos.length} photo{a.photos.length > 1 ? 's' : ''}
                    </span>
                  </span>
                  <button
                    className="tapicon"
                    aria-label={`Supprimer l’album ${a.titre}`}
                    onClick={() => supprimerAlbum.mutate(a.id)}
                  >
                    <Icone nom="x" taille={17} couleur="#B3341A" />
                  </button>
                </div>

                {a.photos.length > 0 && (
                  <div className="grid3" style={{ marginTop: 14 }}>
                    {a.photos.map((p) => {
                      const src = urlPhoto('album', p.chemin);
                      return (
                        <button
                          key={p.id}
                          className="tilephoto"
                          style={src ? { padding: 0, overflow: 'hidden', position: 'relative' } : undefined}
                          aria-label={`Retirer la photo ${p.legende ?? ''}`}
                          onClick={() => supprimerPhoto.mutate({ id: p.id, chemin: p.chemin })}
                        >
                          {src ? (
                            <img src={src} alt="" loading="lazy"
                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Icone nom="album" taille={22} couleur="#9CBCAA" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Plusieurs fichiers d'un coup : le club rentre d'une
                    compétition avec vingt photos, pas avec une. */}
                <label className="btn btn--ghost" style={{ marginTop: 14 }}>
                  <Icone nom="plus" taille={17} couleur="#12613C" epaisseur={2} />
                  {ajouter.isPending && ajouter.variables?.albumId === a.id
                    ? 'Envoi…'
                    : 'Ajouter des photos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      const fichiers = [...(e.target.files ?? [])];
                      if (!fichiers.length) return;
                      ajouter.mutate(
                        { albumId: a.id, fichiers },
                        {
                          onSuccess: () =>
                            setAvis({ bon: true, texte: `${fichiers.length} photo(s) ajoutée(s).` }),
                          onError: (err) =>
                            setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                        }
                      );
                    }}
                  />
                </label>
              </Carte>
            ))}
          </Etat>
        </div>

        <div className="warn">
          <i />
          <p>
            Un appui sur une photo la retire, de l’album et du serveur. Il n’y a pas de
            corbeille : c’est définitif.
          </p>
        </div>
      </div>
    </>
  );
}
