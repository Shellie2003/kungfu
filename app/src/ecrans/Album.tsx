/* ============================================================
   08 · Album photo — et 09 · une photo en grand
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Avis, ChoisirFichier, Entete, Etat, Feuille, Puce, Surtitre, Zone } from '../ui/base';
import { useAlbums } from '../services/club';
import { useUrls } from '../services/stockage';
import { useAjouterPhotos } from '../services/admin';
import { Anneau } from '../ui/Anneau';
import { BarreReactions } from '../ui/Visionneuse';
import { enregistrer } from '../services/telechargement';
import { estMaitre, useSession } from '../services/session';

export function Album() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: albums, isPending, error } = useAlbums();
  /* Toutes les photos de tous les albums en UN appel : les adresses
     sont signées, et une par une ferait autant d'allers-retours que
     de vignettes. */
  const photos = useUrls('album', (albums ?? []).flatMap((a) => a.photos.map((p) => p.chemin)));
  const [filtre, setFiltre] = useState<string | null>(null);

  const cats = useMemo(
    () => [...new Set((albums ?? []).map((a) => a.categorie))].sort((a, b) => a.localeCompare(b, 'fr')),
    [albums]
  );
  const liste = (albums ?? []).filter((a) => !filtre || a.categorie === filtre);

  /* ---- Ajouter des photos SANS quitter l'album ----

     « Dans l'album, il n'y a pas de fonctionnalité d'ajout (capture
     ou import de l'image) comme prévu. »

     Elle existait — dans l'écran d'administration, à trois appuis
     d'ici : ouvrir l'administration, ouvrir les albums, choisir
     l'album. Le bouton de cet écran n'y menait que. C'est la même
     remarque que pour la photo du club, et elle a la même réponse :
     on ajoute une photo là où on la regarde.

     La légende est celle de l'ENVOI, commune aux vingt photos qui
     rentrent d'une compétition. En exiger une par photo aurait pour
     seul effet qu'il n'y en aurait aucune ; chacune se corrige
     ensuite dans l'écran d'administration. */
  const ajouter = useAjouterPhotos();
  const [cible, setCible] = useState<{ id: string; titre: string } | null>(null);
  const [legende, setLegende] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Combien de photos sont parties, sur combien. Vingt photos, c'est
     une à deux minutes sur la ligne d'Antananarivo : sans repère, on
     appuie une seconde fois et l'on envoie tout deux fois. */
  const [avancement, setAvancement] = useState<{ finies: number; total: number } | null>(null);

  const envoyer = (fichiers: File[]) => {
    if (!cible || !fichiers.length) return;
    setAvis(null);
    setAvancement({ finies: 0, total: fichiers.length });
    ajouter.mutate(
      {
        albumId: cible.id,
        fichiers,
        legende,
        progres: (finies, total) => setAvancement({ finies, total })
      },
      {
        onSuccess: () => {
          setCible(null);
          setLegende('');
          setAvancement(null);
          setAvis({
            bon: true,
            texte: `${fichiers.length} photo${fichiers.length > 1 ? 's' : ''} ajoutée${fichiers.length > 1 ? 's' : ''}.`
          });
        },
        /* La feuille RESTE ouverte sur un refus : la refermer
           emporterait la légende qui vient d'être écrite, et
           laisserait croire que c'est passé. */
        onError: (e) => {
          setAvancement(null);
          setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` });
        }
      }
    );
  };

  return (
    <>
      <Entete
        titre="Album photo"
        /* CRÉER un album — pas y ajouter des photos.

           Ce bouton s'appelait « Ajouter des photos » et menait à
           l'écran d'administration : il fallait ensuite y retrouver
           l'album, et le club a conclu, à juste titre, que l'ajout
           n'existait pas. Ajouter une photo se fait maintenant sur
           la vignette « + » de l'album concerné, plus bas.

           Reste ici ce que cet écran ne sait pas faire : créer un
           album neuf, avec son titre et sa catégorie. Le libellé le
           dit désormais.

           Ce n'est pas une permission de plus : la route et le
           serveur refusent déjà tout ce que le rôle n'autorise pas.
           C'est un raccourci, et il n'apparaît qu'à qui peut s'en
           servir. */
        action={
          estMaitre(moi) ? (
            <button
              className="tapicon"
              onClick={() => aller('/admin/albums')}
              aria-label="Créer un album"
            >
              <Icone nom="plus" taille={22} couleur="#0E2119" epaisseur={2} />
            </button>
          ) : undefined
        }
      />

      <div className="chips">
        <Puce texte="Tout" actif={filtre === null} onClick={() => setFiltre(null)} />
        {cats.map((c) => (
          <Puce
            key={c}
            texte={c}
            actif={filtre === c}
            onClick={() => setFiltre(filtre === c ? null : c)}
          />
        ))}
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: '14px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucun album pour le moment."
        >
          {liste.map((album) => (
            <div key={album.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="rowhead">
                {/* La couverture choisie par le club, à défaut la
                    première photo. Elle donne un visage à l'album
                    dans une liste où tous les titres se ressemblent —
                    « Compétitions 2025 », « Compétitions 2026 ». */}
                {(() => {
                  const c = album.couverture ?? album.photos[0]?.chemin ?? null;
                  const src = c ? photos[c] ?? null : null;
                  return src ? (
                    <img
                      src={src}
                      alt=""
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        objectFit: 'cover',
                        marginRight: 10
                      }}
                    />
                  ) : null;
                })()}
                <Surtitre>{album.titre}</Surtitre>
                <span style={{ fontSize: 12, color: '#7C8B82' }}>
                  {album.photos.length} photo{album.photos.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid3">
                {album.photos.map((p, i) => {
                  const src = p.chemin ? photos[p.chemin] ?? null : null;
                  return (
                    <button
                      key={p.id}
                      className="tilephoto"
                      onClick={() => aller(`/album/${album.id}/${i}`)}
                      aria-label={p.legende ?? `Photo ${i + 1} de ${album.titre}`}
                      style={src ? { padding: 0, overflow: 'hidden' } : undefined}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Icone nom="album" taille={24} couleur="#9CBCAA" epaisseur={1.3} />
                      )}
                    </button>
                  );
                })}

                {/* LA TUILE « + », À LA FIN DE LA GRILLE.

                    À la fin et non en tête : la grille commence par
                    ce que le club a déjà mis, et l'ajout se propose
                    après. Elle a la taille d'une vignette et prend
                    la place d'une case vide — l'écran ne se décale
                    pas, et la comparaison à la maquette le vérifie.

                    Elle n'apparaît qu'à l'encadrement, parce que
                    c'est ce que permet la migration 0013. Un « + »
                    montré à un élève mènerait à un refus du serveur,
                    et il ne saurait pas si le fautif est lui. */}
                {estMaitre(moi) && (
                  <button
                    className="tilephoto"
                    aria-label={`Ajouter des photos à ${album.titre}`}
                    onClick={() => {
                      setCible({ id: album.id, titre: album.titre });
                      setLegende('');
                      setAvis(null);
                    }}
                  >
                    <Icone nom="plus" taille={24} couleur="#12613C" epaisseur={2} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Etat>

        {avis && !cible && <Avis bon={avis.bon}>{avis.texte}</Avis>}
      </div>

      {cible && (
        <Feuille sur={cible.titre} titre="Ajouter des photos" fermer={() => setCible(null)}>
          <Zone
            libelle="Légende (facultative)"
            lignes={2}
            aide="La même pour toutes les photos de cet envoi. Chacune se corrige ensuite."
            valeur={legende}
            poser={setLegende}
          />
          {/* Deux chemins et non un seul : « capture » ouvre
              l'appareil photo ET ferme la porte à la galerie. Un
              bouton unique ne peut pas faire les deux. */}
          <ChoisirFichier
            appareil
            libelle="Prendre une photo"
            desactive={ajouter.isPending}
            onFichier={envoyer}
          />
          <ChoisirFichier
            multiple
            libelle="Importer depuis la galerie"
            desactive={ajouter.isPending}
            onFichier={envoyer}
          />
          {/* L'ANNEAU PLUTÔT QUE « Envoi en cours… ».

              Le mot ne distingue pas « c'est parti » de « c'est
              bloqué depuis une minute ». L'anneau suit les photos
              réellement écrites : quand le réseau s'arrête, il
              s'arrête. C'est l'information qu'on veut. */}
          {ajouter.isPending && avancement && (
            <Anneau
              part={avancement.total ? avancement.finies / avancement.total : null}
              libelle={
                avancement.total > 1
                  ? `${avancement.finies} sur ${avancement.total} photos`
                  : 'la photo'
              }
            />
          )}
          {avis && !avis.bon && <Avis bon={false}>{avis.texte}</Avis>}
          <button className="link" onClick={() => setCible(null)}>
            Annuler
          </button>
        </Feuille>
      )}
    </>
  );
}

/* ---------------------------------------------- 09 · Photo en grand

   Fond sombre, hors du gabarit clair : c'est le seul écran où
   l'image compte plus que le cadre. */
export function Photo() {
  const { id, index } = useParams();
  const aller = useNavigate();
  const { data: albums } = useAlbums();
  const album = (albums ?? []).find((a) => a.id === id);
  /* Une seule photo demandée ici, mais par la même mécanique donc le
     même cache : arriver depuis la grille n'en redemande aucune. */
  const photos = useUrls('album', album?.photos.map((p) => p.chemin) ?? []);
  const rang = Number(index ?? 0);
  const photo = album?.photos[rang];
  const src = photo?.chemin ? photos[photo.chemin] ?? null : null;

  /* ENREGISTRER LA PHOTO. Le même chemin que les documents de la
     messagerie : sur le téléphone on rapatrie le fichier et on
     l'écrit dans « Documents », sur le web le navigateur l'ouvre. Un
     lien « download » ne ferait rien dans une WebView Android — ce
     projet a déjà corrigé ce défaut une fois. */
  const [etat, setEtat] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const prendre = async () => {
    if (!src) return;
    setEnCours(true);
    setEtat(null);
    const r = await enregistrer(src, photo?.chemin?.split('/').pop() ?? 'photo.jpg');
    setEnCours(false);
    setEtat(
      r.fait === 'enregistre'
        ? `Enregistré dans « ${r.ou} »`
        : r.fait === 'ouvert'
          ? 'Ouvert dans un onglet'
          : `Échec : ${r.pourquoi}`
    );
  };

  return (
    <div className="phone" style={{ background: '#0B1712' }}>
      <div style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="tapicon" onClick={() => aller('/album')} aria-label="Fermer">
          <Icone nom="x" taille={22} couleur="#FFF" epaisseur={2} />
        </button>
        <span style={{ flexGrow: 1, fontSize: 14, color: '#C9D8D0', textAlign: 'center' }}>
          {album ? `${rang + 1} sur ${album.photos.length}` : ''}
        </span>
        {enCours ? (
          <Anneau part={null} taille={26} epaisseur={3} />
        ) : (
          <button
            className="link"
            style={{ color: '#FFF', padding: '0 6px' }}
            disabled={!src}
            onClick={() => void prendre()}
          >
            Enregistrer
          </button>
        )}
      </div>

      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 12px'
        }}
      >
        {src ? (
          <img
            src={src}
            alt={photo?.legende ?? ''}
            style={{ width: '100%', borderRadius: 16, objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '3/4',
              borderRadius: 16,
              background: '#16261E',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <Icone nom="album" taille={54} couleur="#4E7360" epaisseur={1.2} />
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.1em',
                color: '#4E7360',
                textTransform: 'uppercase'
              }}
            >
              Photo à fournir
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          padding: '20px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: '#FFF' }}>
          {photo?.legende ?? album?.titre ?? ''}
        </p>
        <p style={{ fontSize: 13, color: '#9BB0A5' }}>{album?.categorie ?? ''}</p>

        {etat && (
          <p
            role="status"
            style={{
              fontSize: 12.5,
              color: etat.startsWith('Échec') ? '#FFB4A2' : '#C9D8D0'
            }}
          >
            {etat}
          </p>
        )}

        {/* Les réactions du club sur ses propres photos. Le même
            composant que la visionneuse des conversations : les
            recopier ici les aurait fait diverger à la première
            correction. */}
        <div style={{ marginTop: 6 }}>
          <BarreReactions genre="photo" sujet={photo?.id ?? null} />
        </div>
      </div>
    </div>
  );
}
