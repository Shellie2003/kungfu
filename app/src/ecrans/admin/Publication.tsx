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
import { useAlbums } from '../../services/club';
import { useUrl, useUrls } from '../../services/stockage';
import {
  useAjouterPhotos, useCreerAlbum, useLegender, useNotifierTous, usePublier,
  useSupprimerActualite, useSupprimerAlbum, useSupprimerPhoto, televerser
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
  /* Le CHEMIN de l'image dans le seau, pas son adresse : les seaux
     sont privés et l'adresse signée expire au bout d'une heure. */
  const [image, setImage] = useState<string | null>(null);
  const [envoiImage, setEnvoiImage] = useState(false);
  const apercu = useUrl('album', image);

  function envoyer(publiee: boolean) {
    if (!titre.trim() || !categorie.trim() || !texte.trim()) {
      setAvis({ bon: false, texte: 'Le titre, la catégorie et le texte sont obligatoires.' });
      return;
    }
    publier.mutate(
      { titre: titre.trim(), categorie: categorie.trim(), texte: texte.trim(),
        date_evt: date || null, lieu: lieu || null, image, publiee },
      {
        onSuccess: () => {
          setAvis({ bon: true, texte: publiee ? 'Publiée. Tout le club la voit.' : 'Enregistrée en brouillon.' });
          setTitre(''); setCategorie(''); setTexte(''); setDate(''); setLieu(''); setImage(null);
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

            {/* L'image part TOUT DE SUITE, avant l'enregistrement de
                l'actualité : l'envoi d'un fichier sur un réseau
                malgache prend le temps qu'il prend, et le mêler au
                bouton « Publier » ferait attendre sans rien montrer.
                Ce qui reste dans le formulaire, c'est son chemin. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {apercu ? (
                <img
                  src={apercu}
                  alt=""
                  style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
                />
              ) : (
                <Tuile icone="album" petite />
              )}
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600 }}>Image</p>
                <p style={{ fontSize: 12, color: '#59685F' }}>
                  {image ? 'Jointe à cette actualité.' : 'Facultative.'}
                </p>
              </div>
              {image && (
                <button className="link" style={{ color: '#B3341A' }} onClick={() => setImage(null)}>
                  Retirer
                </button>
              )}
              <label className="btn btn--ghost" style={{ width: 'auto', padding: '0 14px' }}>
                {envoiImage ? 'Envoi…' : image ? 'Changer' : 'Choisir'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setEnvoiImage(true);
                    try {
                      setImage(await televerser('album', f));
                      setAvis(null);
                    } catch (err) {
                      setAvis({ bon: false, texte: `Image refusée : ${(err as Error).message}` });
                    } finally {
                      setEnvoiImage(false);
                    }
                  }}
                />
              </label>
            </div>
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
  const legender = useLegender();
  const photos = useUrls('album', (albums ?? []).flatMap((a) => a.photos.map((p) => p.chemin)));
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  /* La légende de l'envoi en cours, par album : le club vide sa
     carte mémoire album par album, et une seule variable ferait
     partir la légende des compétitions sur les photos du dojo. */
  const [legendes, setLegendes] = useState<Record<string, string>>({});
  /* La photo ouverte, et le texte en cours de correction. */
  const [choisie, setChoisie] = useState<{ id: string; chemin: string } | null>(null);
  const [texteLegende, setTexteLegende] = useState('');
  /* Ce qui attend une confirmation. Une photo retirée ne revient
     pas — ni de l'album, ni du serveur. */
  const [aRetirer, setARetirer] = useState<
    { quoi: 'photo'; id: string; chemin: string } | { quoi: 'album'; id: string; titre: string } | null
  >(null);

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
                    onClick={() => setARetirer({ quoi: 'album', id: a.id, titre: a.titre })}
                  >
                    <Icone nom="x" taille={17} couleur="#B3341A" />
                  </button>
                </div>

                {a.photos.length > 0 && (
                  <div className="grid3" style={{ marginTop: 14 }}>
                    {a.photos.map((p) => {
                      const src = p.chemin ? photos[p.chemin] ?? null : null;
                      return (
                        <button
                          key={p.id}
                          className="tilephoto"
                          style={src ? { padding: 0, overflow: 'hidden', position: 'relative' } : undefined}
                          /* Un appui OUVRE la photo, il ne la détruit
                             plus. Un doigt qui glisse effaçait jusqu'ici
                             une photo de compétition, du serveur compris
                             et sans rien demander. */
                          aria-label={p.legende ?? 'Photo sans légende'}
                          onClick={() => {
                            setChoisie({ id: p.id, chemin: p.chemin });
                            setTexteLegende(p.legende ?? '');
                            setARetirer(null);
                          }}
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

                {/* La photo ouverte : sa légende se corrige, et c'est
                    d'ici seulement qu'elle se retire. */}
                {choisie && a.photos.some((p) => p.id === choisie.id) && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 14,
                      background: 'var(--vert-clair)',
                      border: '1px solid #C4D9CC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <Champ
                      libelle="Légende de cette photo"
                      valeur={texteLegende}
                      poser={setTexteLegende}
                      invite="Passage de grade de Hery, mars 2026"
                      aide="Elle s’affiche sous la photo en grand, et se lit à voix haute par un lecteur d’écran."
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Bouton
                        desactive={legender.isPending}
                        onClick={() =>
                          legender.mutate(
                            { id: choisie.id, legende: texteLegende },
                            {
                              onSuccess: () => {
                                setAvis({ bon: true, texte: 'Légende enregistrée.' });
                                setChoisie(null);
                              },
                              onError: (err) =>
                                setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                            }
                          )
                        }
                      >
                        {legender.isPending ? 'Enregistrement…' : 'Enregistrer la légende'}
                      </Bouton>
                      <Bouton genre="ghost" onClick={() => setChoisie(null)}>
                        Fermer
                      </Bouton>
                    </div>
                    <button
                      className="link"
                      style={{ color: '#B3341A' }}
                      onClick={() =>
                        setARetirer({ quoi: 'photo', id: choisie.id, chemin: choisie.chemin })
                      }
                    >
                      Retirer cette photo
                    </button>
                  </div>
                )}

                {/* Plusieurs fichiers d'un coup : le club rentre d'une
                    compétition avec vingt photos, pas avec une. Et une
                    légende commune, parce qu'elles viennent toutes du
                    même jour — en demander vingt reviendrait à n'en
                    obtenir aucune. */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Champ
                    libelle="Légende de cet envoi"
                    valeur={legendes[a.id] ?? ''}
                    poser={(v) => setLegendes((p) => ({ ...p, [a.id]: v }))}
                    invite="Championnat régional, mars 2026"
                    aide="Facultative, et commune aux photos envoyées ensemble. Chacune se corrige ensuite."
                  />
                  <label className="btn btn--ghost">
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
                          { albumId: a.id, fichiers, legende: legendes[a.id] },
                          {
                            onSuccess: () => {
                              setAvis({ bon: true, texte: `${fichiers.length} photo(s) ajoutée(s).` });
                              setLegendes((p) => ({ ...p, [a.id]: '' }));
                            },
                            onError: (err) =>
                              setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                          }
                        );
                      }}
                    />
                  </label>
                </div>
              </Carte>
            ))}
          </Etat>
        </div>

        {/* La confirmation, et non plus un avertissement écrit en bas
            de page que personne ne lit avant d'appuyer. Elle nomme ce
            qui va disparaître : « Retirer cette photo ? » ne dit pas
            laquelle, et l'on confirme alors sans savoir. */}
        {aRetirer && (
          <div className="warn">
            <i />
            <p>
              {aRetirer.quoi === 'album' ? (
                <>
                  Supprimer l’album <b>{aRetirer.titre}</b> ? Ses photos partent avec lui.
                </>
              ) : (
                <>Retirer cette photo de l’album et du serveur ?</>
              )}
              <br />
              Il n’y a pas de corbeille : c’est définitif.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Bouton
                onClick={() => {
                  if (aRetirer.quoi === 'album') {
                    supprimerAlbum.mutate(aRetirer.id, {
                      onSuccess: () => setAvis({ bon: true, texte: 'Album supprimé.' }),
                      onError: (err) =>
                        setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                    });
                  } else {
                    supprimerPhoto.mutate(
                      { id: aRetirer.id, chemin: aRetirer.chemin },
                      {
                        onSuccess: () => setAvis({ bon: true, texte: 'Photo retirée.' }),
                        onError: (err) =>
                          setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                      }
                    );
                    setChoisie(null);
                  }
                  setARetirer(null);
                }}
              >
                Oui, supprimer
              </Bouton>
              <Bouton genre="ghost" onClick={() => setARetirer(null)}>
                Annuler
              </Bouton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
