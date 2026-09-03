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
import { useMembres } from '../../services/membres';
import { correspond } from '../../services/texte';
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

  const [cherche, setCherche] = useState('');

  const { data: horaires } = useHoraires();
  const { data: presences, isPending, error } = usePresencesDuJour(jour);
  /* L'ANNUAIRE, qui est ce qui fait la feuille. Les présences disent
     seulement qui a été pointé ; la liste des élèves dit qui devrait
     l'être, et c'est elle qui permet de voir qui MANQUE. */
  const { data: membres } = useMembres();
  const pointer = usePointer();
  const depointer = useDepointer();

  /* Un membre retiré du club n'a pas à figurer sur la feuille : il ne
     vient plus. Il reste dans l'annuaire pour l'administration, pas
     ici. */
  const actifs = (membres ?? []).filter((m) => m.actif !== false);

  /* Le pointage de chacun, s'il existe. Une carte plutôt qu'une
     recherche dans un tableau : soixante-quatre membres fois
     soixante-quatre présences ferait quatre mille comparaisons à
     chaque frappe dans la recherche. */
  const parProfil = new Map((presences ?? []).map((p) => [p.membre?.id ?? '', p]));

  const feuille = actifs
    .filter((m) => correspond(cherche, m.nom, m.prenom, m.numero))
    .map((membre) => ({ membre, presence: parProfil.get(membre.id) ?? null }));

  const pointes = (presences ?? []).length;
  /* L'annuaire n'est pas encore arrivé : la feuille serait vide, ce
     qui ferait croire qu'il n'y a aucun membre. */
  const sansMembres = membres === undefined;

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

        {/* ============================================================
            LA FICHE DE PRÉSENCE.

            « On crée une fiche de présence, tous les élèves sont
            absents par défaut, on scanne ou on clique pour valider la
            présence (parfois un élève oublie sa carte). »

            Cet écran ne montrait que les membres DÉJÀ POINTÉS. Pour
            savoir qui manquait, il fallait comparer de tête avec
            l'annuaire — soixante-quatre noms — et un élève sans sa
            carte n'avait aucun moyen d'être marqué présent autrement
            qu'en dictant son matricule.

            La feuille part donc de l'ANNUAIRE et non des présences :
            tout le monde y figure, absent tant que personne ne l'a
            pointé. C'est ainsi qu'une feuille de présence a toujours
            fonctionné sur le papier, et c'est ce qui permet de voir
            d'un coup d'œil qui manque.

            Le scanner et la saisie du matricule restent au-dessus :
            trois chemins vers le même geste, et chacun sert un cas
            réel — la carte présentée, la carte oubliée, la carte
            illisible.
            ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>{jourLong(jour)}</Surtitre>
            <span style={{ fontSize: 12, color: '#7C8B82' }}>
              {pointes} présent{pointes > 1 ? 's' : ''} sur {(membres ?? []).length}
            </span>
          </div>

          {/* La recherche : soixante-quatre noms font quatre écrans de
              défilement, et l'on pointe pendant que les élèves
              arrivent. Sans elle, trouver un nom prend plus de temps
              que de le taper. */}
          <div className="searchbar">
            <Icone nom="search" taille={19} couleur="#7C8B82" />
            <input
              value={cherche}
              onChange={(e) => setCherche(e.target.value)}
              placeholder="Chercher un nom"
              aria-label="Chercher un nom"
              style={{
                flexGrow: 1, minWidth: 0, border: 0, background: 'transparent',
                font: 'inherit', outline: 'none'
              }}
            />
          </div>

          <Etat
            chargement={isPending || sansMembres}
            erreur={error}
            vide={feuille.length === 0}
            messageVide={
              cherche.trim()
                ? 'Aucun membre ne correspond.'
                : 'Aucun membre actif dans l’annuaire.'
            }
          >
            <div className="list">
              {feuille.map(({ membre, presence }) => {
                const [couleur, fond] = presence
                  ? teinteStatut(presence.statut)
                  : ['#8A978F', '#F1F6F3'];
                return (
                  /* TOUTE LA RANGÉE EST LA CIBLE.

                     Elle ne l'était pas : il fallait viser la petite
                     icône à droite. Sur une fiche de présence on
                     pointe soixante noms à la suite, debout, un
                     téléphone dans une main — et l'on visait un
                     carré de quarante-quatre pixels soixante fois.
                     C'est le geste le plus répété de l'application,
                     et c'était le plus étroit.

                     La rangée devient donc un bouton, l'icône reste
                     comme repère visuel de ce qui va se passer. */
                  <button
                    key={membre.id}
                    className="listrow"
                    style={presence ? undefined : { opacity: 0.72 }}
                    disabled={pointer.isPending || depointer.isPending}
                    aria-pressed={Boolean(presence)}
                    aria-label={
                      presence
                        ? `Retirer le pointage de ${membre.nom} ${membre.prenom}`
                        : `Pointer ${membre.nom} ${membre.prenom}`
                    }
                    onClick={() =>
                      presence ? depointer.mutate(presence.id) : pointerCe(membre.numero)
                    }
                  >
                    <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                      <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                        {membre.nom} {membre.prenom}
                      </b>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                        {membre.numero}
                      </span>
                    </span>

                    <span className="tag" style={{ color: couleur, background: fond }}>
                      {presence ? LIBELLE[presence.statut] : 'Absent'}
                    </span>

                    {/* UN SEUL APPUI. Pointer si absent, retirer le
                        pointage si déjà là — c'est le même geste que
                        cocher et décocher une case sur du papier, et
                        il n'y a rien d'autre à apprendre.

                        Le statut choisi en haut de l'écran s'applique :
                        « présent », « en retard » ou « excusé ».

                        L'icône n'est plus un bouton : la rangée l'est.
                        Elle est donc cachée aux lecteurs d'écran, qui
                        lisent déjà le nom, l'état et l'action dans le
                        libellé de la rangée. */}
                    <span className="tapicon" aria-hidden="true">
                      <Icone
                        nom={presence ? 'x' : 'shieldCheck'}
                        taille={19}
                        couleur={presence ? '#B3341A' : '#12613C'}
                        epaisseur={2}
                      />
                    </span>
                  </button>
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
