/* ============================================================
   Administration · Publier, notifier, albums et photos
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import {
  Avis, Bouton, Carte, Champ, ChoisirFichier, Choix, Entete, Etat, Surtitre, Tuile, Zone
} from '../../ui/base';
import { useActualites } from '../../services/casier';
import { proposees, teinter, useCategories } from '../../services/categories';
import { useAlbums } from '../../services/club';
import { useUrl, useUrls } from '../../services/stockage';
import {
  useAjouterPhotos, useCouverture, useCreerAlbum, useDeplacerPhoto, useLegender,
  useNotifierTous, usePublier, useSupprimerActualite, useSupprimerAlbum,
  useSupprimerPhoto, televerser
} from '../../services/admin';

/* La liste des catégories vivait ICI, écrite dans le code :
   « Sortie, Compétition, Réunion, Cérémonie, Changement d'horaire ».
   En ajouter une demandait une nouvelle version de l'APK, donc une
   construction, donc moi. Le club les tient maintenant lui-même —
   voir services/categories.ts et l'écran /admin/categories. */

/* ---------------------------------------------- Publier une actualité */
export function AdminPublier() {
  const aller = useNavigate();
  /* ---- ARRIVER DÉJÀ SUR LA BONNE ACTUALITÉ ----

     Le club a demandé de pouvoir modifier une actualité LÀ OÙ IL LA
     LIT. Le crayon de l'écran du casier mène ici avec l'identifiant
     dans l'adresse ; sans cela il faudrait retrouver l'annonce dans
     la liste du bas, ce qui est exactement le détour qu'on cherche à
     supprimer. */
  const [parametres] = useSearchParams();
  const demandee = parametres.get('a');
  const { data: actus } = useActualites();
  const { data: cats } = useCategories();
  const publier = usePublier();
  const supprimer = useSupprimerActualite();
  const notifier = useNotifierTous();

  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [texte, setTexte] = useState('');
  const [date, setDate] = useState('');
  const [lieu, setLieu] = useState('');
  /* La participation demandée. Chaîne vide = gratuit ou non fixé :
     l'écran ne réclame alors rien, et le membre ne voit aucun
     montant. */
  const [prix, setPrix] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Le CHEMIN de l'image dans le seau, pas son adresse : les seaux
     sont privés et l'adresse signée expire au bout d'une heure. */
  const [image, setImage] = useState<string | null>(null);
  const [envoiImage, setEnvoiImage] = useState(false);
  const apercu = useUrl('album', image);
  /* L'actualité en cours de modification. « null » = on en crée une
     neuve. Un seul formulaire pour les deux : deux écrans auraient
     divergé au premier champ ajouté. */
  const [edite, setEdite] = useState<string | null>(null);

  /* Charger l'actualité demandée dans l'adresse, UNE SEULE FOIS.

     « une seule fois » n'est pas une précaution de style : sans le
     verrou, chaque rafraîchissement de la liste — après un envoi, par
     exemple — reposerait les champs et effacerait ce qu'on est en
     train d'écrire. */
  const chargee = useRef(false);
  useEffect(() => {
    if (chargee.current || !demandee) return;
    const a = (actus ?? []).find((x) => x.id === demandee);
    if (!a) return;
    chargee.current = true;
    setEdite(a.id);
    setTitre(a.titre);
    setCategorie(a.categorie);
    setTexte(a.texte);
    setDate(a.date_evt ?? '');
    setLieu(a.lieu ?? '');
    setPrix(a.participation_ar != null ? String(a.participation_ar) : '');
    setImage(a.image);
  }, [actus, demandee]);
  /* Ce qui attend une confirmation de suppression. */
  const [aSupprimer, setASupprimer] = useState<{ id: string; titre: string } | null>(null);
  /* Prévenir les membres au moment de publier.

     La liste validée à la livraison ne fait qu'un seul geste des deux
     — « publier une actualité, ET envoyer la notification ». C'étaient
     deux écrans sans lien : on publiait, on oubliait de
     prévenir, et l'annonce dormait au casier.

     Coché par défaut pour une publication, JAMAIS pour un brouillon —
     prévenir de quelque chose que personne ne peut lire serait le
     comble. */
  const [prevenir, setPrevenir] = useState(true);

  function vider() {
    setTitre(''); setCategorie(''); setTexte(''); setDate(''); setLieu('');
    setPrix(''); setImage(null); setEdite(null);
  }

  function envoyer(publiee: boolean) {
    if (!titre.trim() || !categorie.trim() || !texte.trim()) {
      setAvis({ bon: false, texte: 'Le titre, la catégorie et le texte sont obligatoires.' });
      return;
    }
    publier.mutate(
      { id: edite ?? undefined,
        titre: titre.trim(), categorie: categorie.trim(), texte: texte.trim(),
        date_evt: date || null, lieu: lieu || null, image, publiee,
        /* Vide = gratuit ou non fixé. On n'envoie pas zéro : « zéro
           ariary » et « rien n'est demandé » ne sont pas la même
           chose, et l'écran du membre ne doit pas afficher
           « 0 Ar ». */
        participation_ar: prix.trim() ? Math.max(0, Math.round(Number(prix))) : null },
      {
        onSuccess: () => {
          const base = edite
            ? 'Modifiée. La version corrigée remplace l’ancienne.'
            : publiee
              ? 'Publiée. Tout le club la voit.'
              : 'Enregistrée en brouillon.';

          /* La notification part APRÈS l'enregistrement, et seulement
             s'il a réussi : prévenir d'une actualité que le serveur a
             refusée enverrait soixante-quatre membres au casier pour
             n'y rien trouver. */
          if (publiee && prevenir) {
            notifier.mutate(
              { titre: titre.trim(), texte: '', vers: '/casier' },
              {
                onSuccess: () =>
                  setAvis({ bon: true, texte: `${base} Les membres sont prévenus.` }),
                onError: (e) =>
                  setAvis({
                    bon: false,
                    texte: `${base} En revanche la notification n’est pas partie : ${(e as Error).message}`
                  })
              }
            );
          } else {
            setAvis({ bon: true, texte: base });
          }
          vider();
        },
        onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
      }
    );
  }

  return (
    <>
      <Entete
        titre={edite ? 'Modifier une actualité' : 'Publier une actualité'}
        retour={() => aller('/admin')}
      />
      <div style={{ flexGrow: 1, padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Sans ce bandeau, on ne saurait pas qu'on modifie plutôt
            qu'on crée : le formulaire est le même, et l'on
            publierait une seconde fois la même annonce en croyant en
            écrire une neuve. */}
        {edite && (
          <div className="banner">
            <Icone nom="edit" taille={16} couleur="#0F5132" />
            <span style={{ flexGrow: 1 }}>Modification d’une actualité déjà au casier</span>
            <button className="link" onClick={vider}>
              Annuler
            </button>
          </div>
        )}
        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Champ libelle="Titre" valeur={titre} poser={setTitre} obligatoire />
            <Choix
              libelle="Catégorie"
              valeur={categorie}
              poser={setCategorie}
              options={proposees(cats, 'actualite').map((c) => ({ valeur: c.nom, texte: c.nom }))}
              aide="Elle donne la couleur de l’étiquette dans le casier. La liste se modifie dans « Catégories »."
            />
            <Champ libelle="Date de l’événement" type="date" valeur={date} poser={setDate} />
            <Champ libelle="Lieu" valeur={lieu} poser={setLieu} invite="Devant la salle" />
            {/* LA PARTICIPATION DEMANDÉE.

                C'est elle qui donne un sens aux versements. Ils
                existaient depuis le premier jour ; sans montant
                attendu, « il a versé 30 000 » ne se comparait à rien,
                et l'application ne pouvait pas dire « il reste
                20 000 » — la seule chose que le club veut savoir en
                regardant sa liste.

                Laissée vide, elle ne réclame rien : un entraînement
                exceptionnel est gratuit, et le prix du taxi-brousse
                se connaît parfois la veille. */}
            <Champ
              libelle="Participation par personne"
              type="number"
              valeur={prix}
              poser={setPrix}
              invite="15000"
              aide="En ariary. Laissez vide si c’est gratuit, ou si le montant n’est pas encore fixé."
            />
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
              <ChoisirFichier
                libelle={envoiImage ? 'Envoi…' : image ? 'Changer' : 'Choisir'}
                desactive={envoiImage}
                style={{ width: 'auto', padding: '0 14px' }}
                onFichier={async ([f]) => {
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
            </div>
          </div>
        </Carte>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <label
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}
        >
          <input
            type="checkbox"
            checked={prevenir}
            onChange={(e) => setPrevenir(e.target.checked)}
          />
          Prévenir les membres — une notification par personne active
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bouton onClick={() => envoyer(true)} desactive={publier.isPending || notifier.isPending}>
            {publier.isPending ? 'Envoi…' : edite ? 'Enregistrer et publier' : 'Publier'}
          </Bouton>
          {/* Un brouillon n'est visible que de l'administration : la
              règle d'accès exclut « publiee = false » pour tous les
              autres. C'est ce qui permet de préparer sans annoncer —
              et, en modification, de RETIRER du casier une annonce
              publiée par erreur sans la détruire. */}
          <Bouton genre="ghost" onClick={() => envoyer(false)} desactive={publier.isPending}>
            {edite ? 'Enregistrer et remettre en brouillon' : 'Enregistrer en brouillon'}
          </Bouton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Déjà au casier</Surtitre>
          <div className="list">
            {(actus ?? []).map((a) => {
              const [cc, cb] = teinter(cats, a.categorie);
              return (
                <div key={a.id} className="listrow">
                  {/* Un appui charge l'actualité dans le formulaire.
                      Jusqu'ici, corriger une faute de frappe imposait
                      de supprimer et de tout réécrire — et les
                      inscriptions à une sortie, rattachées à la ligne
                      supprimée, partaient avec elle. */}
                  <button
                    style={{
                      flexGrow: 1,
                      minWidth: 0,
                      textAlign: 'left',
                      border: 0,
                      background: 'transparent',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                    aria-label={`Modifier ${a.titre}`}
                    onClick={() => {
                      setEdite(a.id);
                      setTitre(a.titre);
                      setCategorie(a.categorie);
                      setTexte(a.texte);
                      setDate(a.date_evt ?? '');
                      setLieu(a.lieu ?? '');
                      setImage(a.image);
                      setAvis(null);
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    <span className="tag" style={{ color: cc, background: cb }}>{a.categorie}</span>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 600, marginTop: 6 }}>
                      {a.titre}
                    </b>
                  </button>
                  <button
                    className="tapicon"
                    aria-label={`Supprimer ${a.titre}`}
                    onClick={() => setASupprimer({ id: a.id, titre: a.titre })}
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

        {/* Supprimer une actualité emporte les inscriptions à la
            sortie : la question nomme donc ce qui va disparaître, et
            rappelle qu'un simple retrait du casier se fait autrement. */}
        {aSupprimer && (
          <div className="warn">
            <i />
            <p>
              Supprimer <b>{aSupprimer.titre}</b> ? Les inscriptions et les versements
              rattachés partent avec elle.
              <br />
              Pour la retirer du casier sans rien perdre, ouvrez-la et enregistrez-la en
              brouillon.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Bouton
                onClick={() => {
                  supprimer.mutate(aSupprimer.id, {
                    onSuccess: () => setAvis({ bon: true, texte: 'Actualité supprimée.' }),
                    onError: (e) =>
                      setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
                  });
                  if (edite === aSupprimer.id) vider();
                  setASupprimer(null);
                }}
              >
                Oui, supprimer
              </Bouton>
              <Bouton genre="ghost" onClick={() => setASupprimer(null)}>
                Annuler
              </Bouton>
            </div>
          </div>
        )}
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
  const { data: cats } = useCategories();
  const creer = useCreerAlbum();
  const supprimerAlbum = useSupprimerAlbum();
  const supprimerPhoto = useSupprimerPhoto();

  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const ajouter = useAjouterPhotos();
  const legender = useLegender();
  const couverture = useCouverture();
  const deplacer = useDeplacerPhoto();
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
              {/* UNE LISTE, ET NON PLUS UN CHAMP LIBRE.

                  La catégorie se tapait à la main à chaque création,
                  avec pour seule aide un exemple dans l'invite.
                  « Compétition » et « Compétitions » devenaient donc
                  deux rubriques distinctes, et le filtre du haut de
                  l'écran Album en montrait autant que de fautes de
                  frappe — sans qu'aucune ne puisse être corrigée
                  ensuite, puisque rien ne les listait. */}
              <Choix
                libelle="Catégorie"
                valeur={categorie}
                poser={setCategorie}
                options={proposees(cats, 'album').map((c) => ({ valeur: c.nom, texte: c.nom }))}
                aide="La liste se modifie dans « Catégories »."
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
                  {/* La couverture, ou la première photo à défaut :
                      « presque toujours la bonne » est justement la
                      raison pour laquelle on peut en choisir une
                      autre. */}
                  {(() => {
                    const c = a.couverture ?? a.photos[0]?.chemin ?? null;
                    const src = c ? photos[c] ?? null : null;
                    return src ? (
                      <img
                        src={src}
                        alt=""
                        style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }}
                      />
                    ) : (
                      <Tuile icone="album" petite />
                    );
                  })()}
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
                    {/* Déplacer, et choisir la couverture. Les deux
                        n'ont de sens que sur une photo précise, donc
                        ici et pas ailleurs. */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {(() => {
                        const i = a.photos.findIndex((p) => p.id === choisie.id);
                        const echanger = (j: number) => {
                          const x = a.photos[i];
                          const y = a.photos[j];
                          if (x && y) deplacer.mutate({ a: x, b: y });
                        };
                        return (
                          <>
                            <Bouton
                              genre="ghost"
                              desactive={i <= 0 || deplacer.isPending}
                              onClick={() => echanger(i - 1)}
                            >
                              Avancer
                            </Bouton>
                            <Bouton
                              genre="ghost"
                              desactive={i < 0 || i >= a.photos.length - 1 || deplacer.isPending}
                              onClick={() => echanger(i + 1)}
                            >
                              Reculer
                            </Bouton>
                          </>
                        );
                      })()}
                    </div>

                    <button
                      className="link"
                      disabled={couverture.isPending}
                      onClick={() =>
                        couverture.mutate(
                          { albumId: a.id, chemin: choisie.chemin },
                          {
                            onSuccess: () =>
                              setAvis({ bon: true, texte: 'Couverture de l’album choisie.' })
                          }
                        )
                      }
                    >
                      {a.couverture === choisie.chemin
                        ? 'C’est déjà la couverture'
                        : 'Faire la couverture de l’album'}
                    </button>

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
                  {/* DEUX boutons, et non un seul.

                      Le club a cherché « prendre ou importer une
                      photo » et n'a trouvé qu'« Ajouter des photos »,
                      qui ouvre le sélecteur de fichiers : pour une
                      photo qu'on vient de prendre, il fallait sortir,
                      ouvrir l'appareil photo, revenir, retrouver
                      l'album et ressortir la photo de la galerie.

                      Un seul bouton ne pouvait pas faire les deux :
                      « capture » ouvre l'appareil photo ET ferme la
                      porte à la galerie. Les deux chemins existent
                      donc côte à côte, nommés par ce qu'ils font. */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <ChoisirFichier
                      appareil
                      libelle={
                        ajouter.isPending && ajouter.variables?.albumId === a.id
                          ? 'Envoi…'
                          : 'Prendre une photo'
                      }
                      desactive={ajouter.isPending}
                      onFichier={(fichiers) =>
                        ajouter.mutate(
                          { albumId: a.id, fichiers, legende: legendes[a.id] },
                          {
                            onSuccess: () => {
                              setAvis({ bon: true, texte: 'Photo ajoutée.' });
                              setLegendes((p) => ({ ...p, [a.id]: '' }));
                            },
                            onError: (err) =>
                              setAvis({ bon: false, texte: `Refusé : ${(err as Error).message}` })
                          }
                        )
                      }
                    />
                    <ChoisirFichier
                      multiple
                      libelle={
                        ajouter.isPending && ajouter.variables?.albumId === a.id
                          ? 'Envoi…'
                          : 'Importer des photos'
                      }
                      desactive={ajouter.isPending}
                      onFichier={(fichiers) =>
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
                        )
                      }
                    />
                  </div>
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
