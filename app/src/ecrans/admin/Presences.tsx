/* ============================================================
   Administration · Pointer les présences

   Ce que le code QR de la carte promettait depuis le premier jour.

   Deux façons de pointer, et la seconde n'est pas un pis-aller
   qu'on ajoute par acquit de conscience : la caméra ne marche pas
   toujours. Autorisation refusée, téléphone sans lecteur de codes,
   carte oubliée à la maison, élève qui n'a pas de téléphone et donc
   pas de carte à l'écran. La saisie du matricule est le chemin qui
   marche TOUJOURS, et c'est pour cela qu'elle est visible d'emblée
   plutôt que cachée derrière « en cas de problème ».
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Surtitre } from '../../ui/base';
import { heure, nomDuJour, useHoraires } from '../../services/club';
import {
  LIBELLE,
  aujourdhui,
  jourLong,
  teinteStatut,
  useDepointer,
  usePointer,
  usePresencesDuJour
} from '../../services/presences';
import type { Statut } from '../../services/presences';

/* ------------------------------------------------------------
   Le lecteur de codes.

   BarcodeDetector est fourni par le moteur du navigateur : rien à
   télécharger, rien à embarquer dans l'APK. Il n'existe pas partout,
   d'où le repli — et l'écran le DIT au lieu de laisser un rectangle
   noir sans explication.

   La caméra est demandée « environment » : celle de derrière. Sur un
   téléphone, la caméra de face obligerait à retourner la carte vers
   soi et à lire à l'envers.
   ------------------------------------------------------------ */
type Lecteur = { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };

function Scanner({ onCode, actif }: { onCode: (code: string) => void; actif: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [cherche, setCherche] = useState(false);

  useEffect(() => {
    if (!actif) return;
    let vivant = true;
    let flux: MediaStream | null = null;
    let minuterie: number | undefined;

    const Detecteur = (
      globalThis as unknown as { BarcodeDetector?: new (o: unknown) => Lecteur }
    ).BarcodeDetector;

    if (!Detecteur || !navigator.mediaDevices?.getUserMedia) {
      setErreur(
        'Ce téléphone ne sait pas lire les codes QR depuis l’application. ' +
          'Saisissez le matricule à la main, juste en dessous.'
      );
      return;
    }

    const lecteur = new Detecteur({ formats: ['qr_code'] });

    (async () => {
      try {
        flux = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (!vivant) {
          flux.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = flux;
          await video.current.play();
        }
        setCherche(true);

        /* Une lecture toutes les 400 ms. Plus souvent réchauffe le
           téléphone sans rien lire de plus ; moins souvent donne
           l'impression que le scanner ne marche pas. */
        const lire = async () => {
          if (!vivant || !video.current) return;
          try {
            const trouves = await lecteur.detect(video.current);
            const premier = trouves[0];
            if (premier?.rawValue) onCode(premier.rawValue);
          } catch {
            /* Une image illisible n'est pas une erreur : on réessaie
               à la suivante. */
          }
          minuterie = window.setTimeout(lire, 400);
        };
        void lire();
      } catch {
        setErreur(
          'La caméra n’est pas accessible. Autorisez-la dans les réglages du téléphone, ' +
            'ou saisissez le matricule à la main.'
        );
      }
    })();

    return () => {
      vivant = false;
      if (minuterie) window.clearTimeout(minuterie);
      flux?.getTracks().forEach((t) => t.stop());
    };
  }, [actif, onCode]);

  if (!actif) return null;

  if (erreur) {
    return (
      <Carte style={{ background: '#FBEEE2', borderColor: '#EBD3BC' }}>
        <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#8A4310' }}>{erreur}</p>
      </Carte>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0B1712',
        aspectRatio: '4/3'
      }}
    >
      <video
        ref={video}
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* La mire : elle dit où présenter la carte. Sans elle, on
          promène le téléphone au hasard. */}
      <div
        style={{
          position: 'absolute',
          inset: '18%',
          border: '2px solid rgba(255,255,255,.85)',
          borderRadius: 12
        }}
      />
      <p
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 10,
          textAlign: 'center',
          fontSize: 12,
          color: '#D8E6DE'
        }}
      >
        {cherche ? 'Présentez le code de la carte' : 'Ouverture de la caméra…'}
      </p>
    </div>
  );
}

/* ---------------------------------------------- L'écran */
export function AdminPresences() {
  const aller = useNavigate();
  const [jour, setJour] = useState(aujourdhui());
  const [horaireId, setHoraireId] = useState('');
  const [statut, setStatut] = useState<Statut>('present');
  const [matricule, setMatricule] = useState('');
  const [camera, setCamera] = useState(false);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  const { data: horaires } = useHoraires();
  const { data: presences, isPending, error } = usePresencesDuJour(jour);
  const pointer = usePointer();
  const depointer = useDepointer();

  /* Le dernier code lu, et l'instant où il l'a été. Le scanner relit
     la même carte quatre fois par seconde tant qu'elle est devant
     l'objectif : sans ce garde-fou, une seule carte présentée
     déclencherait des dizaines d'appels. La base est idempotente et
     n'en souffrirait pas, mais le réseau du club, si. */
  const dernier = useRef<{ code: string; quand: number }>({ code: '', quand: 0 });

  function pointerCe(code: string, sourceCamera = false) {
    const propre = code.trim();
    if (!propre) return;
    if (sourceCamera) {
      const maintenant = Date.now();
      if (dernier.current.code === propre && maintenant - dernier.current.quand < 4000) return;
      dernier.current = { code: propre, quand: maintenant };
    }
    pointer.mutate(
      { matricule: propre, horaireId: horaireId || null, statut },
      {
        onSuccess: () => {
          setAvis({ bon: true, texte: `${propre.toUpperCase()} · ${LIBELLE[statut]}` });
          setMatricule('');
        },
        /* Le message vient de la base — « aucun membre ne porte le
           matricule », « ce membre n'est plus actif ». Le réécrire
           ici le ferait diverger le jour où la règle change. */
        onError: (e) => setAvis({ bon: false, texte: (e as Error).message })
      }
    );
  }

  /* Les créneaux du jour choisi seulement : proposer ceux du mardi
     alors qu'on pointe un samedi invite à se tromper. */
  const jourSemaine = (() => {
    const d = new Date(`${jour}T12:00:00`);
    const n = d.getDay();
    return n === 0 ? 7 : n; // dimanche = 7, comme en base
  })();
  const creneaux = (horaires ?? []).filter((h) => h.jour === jourSemaine);

  return (
    <>
      <Entete titre="Pointer les présences" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Champ libelle="Séance du" type="date" valeur={jour} poser={setJour} />
            {creneaux.length > 0 ? (
              <Choix
                libelle="Créneau"
                valeur={horaireId}
                poser={setHoraireId}
                options={creneaux.map((h) => ({
                  valeur: h.id,
                  texte: `${heure(h.debut)} – ${heure(h.fin)} · ${h.niveau ?? 'Tous niveaux'}`
                }))}
                aide="Facultatif. Un stage ou une compétition n’a pas de créneau."
              />
            ) : (
              <p className="aide">
                Aucun créneau déclaré le {nomDuJour(jourSemaine).toLowerCase()} : la séance sera
                enregistrée sans créneau.
              </p>
            )}
            <Choix
              libelle="À enregistrer comme"
              valeur={statut}
              poser={(v) => setStatut(v as Statut)}
              options={(['present', 'retard', 'excuse'] as Statut[]).map((s) => ({
                valeur: s,
                texte: LIBELLE[s]
              }))}
              aide="Une absence ne s’enregistre pas : elle est l’absence de ligne."
            />
          </div>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Pointer</Surtitre>

          <Bouton genre={camera ? 'ghost' : 'primary'} onClick={() => setCamera((c) => !c)}>
            {camera ? 'Fermer la caméra' : 'Scanner une carte'}
          </Bouton>

          <Scanner actif={camera} onCode={(c) => pointerCe(c, true)} />

          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Champ
                libelle="Matricule"
                valeur={matricule}
                poser={setMatricule}
                invite="F04x042"
                aide="Le chemin qui marche toujours : carte oubliée, caméra refusée, élève sans téléphone."
              />
              <Bouton
                genre="ghost"
                desactive={!matricule.trim() || pointer.isPending}
                onClick={() => pointerCe(matricule)}
              >
                {pointer.isPending ? 'Enregistrement…' : 'Pointer ce matricule'}
              </Bouton>
            </div>
          </Carte>

          {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>{jourLong(jour)}</Surtitre>
            <span style={{ fontSize: 12, color: '#7C8B82' }}>
              {(presences ?? []).length} pointé{(presences ?? []).length > 1 ? 's' : ''}
            </span>
          </div>

          <Etat
            chargement={isPending}
            erreur={error}
            vide={(presences ?? []).length === 0}
            messageVide="Personne n’est encore pointé ce jour-là."
          >
            <div className="list">
              {(presences ?? []).map((p) => {
                const [couleur, fond] = teinteStatut(p.statut);
                return (
                  <div key={p.id} className="listrow">
                    <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                      <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                        {p.membre ? `${p.membre.nom} ${p.membre.prenom}` : 'Membre inconnu'}
                      </b>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                        {p.membre?.numero}
                      </span>
                    </span>
                    <span className="tag" style={{ color: couleur, background: fond }}>
                      {LIBELLE[p.statut]}
                    </span>
                    <button
                      className="tapicon"
                      aria-label={`Retirer le pointage de ${p.membre?.nom ?? 'ce membre'}`}
                      onClick={() => depointer.mutate(p.id)}
                    >
                      <Icone nom="x" taille={17} couleur="#B3341A" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Etat>
        </div>

        <div className="warn">
          <i />
          <p>
            Le code QR de la carte encode le matricule, qui est déjà écrit dessus en toutes
            lettres. Il sert à pointer une présence, jamais à ouvrir une session : une carte
            photographiée ne donne accès à rien.
          </p>
        </div>
      </div>
    </>
  );
}
