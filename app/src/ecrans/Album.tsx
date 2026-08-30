/* ============================================================
   08 · Album photo — et 09 · une photo en grand
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Entete, Etat, Puce, Surtitre } from '../ui/base';
import { useAlbums } from '../services/club';
import { useUrls } from '../services/stockage';

export function Album() {
  const aller = useNavigate();
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

  return (
    <>
      <Entete titre="Album photo" />

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
              </div>
            </div>
          ))}
        </Etat>
      </div>
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

  return (
    <div className="phone" style={{ background: '#0B1712' }}>
      <div style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="tapicon" onClick={() => aller('/album')} aria-label="Fermer">
          <Icone nom="x" taille={22} couleur="#FFF" epaisseur={2} />
        </button>
        <span style={{ flexGrow: 1, fontSize: 14, color: '#C9D8D0', textAlign: 'center' }}>
          {album ? `${rang + 1} sur ${album.photos.length}` : ''}
        </span>
        <span style={{ width: 44 }} />
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
      </div>
    </div>
  );
}
