/* ============================================================
   06 · Casier — et 07 · une actualité
   ============================================================ */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete, Etat, Puce, Filet } from '../ui/base';
import {
  categories,
  dateLongue,
  jourEtMois,
  useActualite,
  useActualites,
  useNotifications
} from '../services/casier';
import { teinter, useCategories } from '../services/categories';
import { useUrl } from '../services/stockage';
import { estAdmin, useSession } from '../services/session';
import { useParticipation } from '../services/participation';

/* Aujourd'hui à minuit : une sortie qui a lieu AUJOURD'HUI accepte
   encore les inscriptions. Comparer à l'instant présent fermerait
   l'inscription d'une sortie du matin dès qu'il est midi. */
const aujourdhui = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function Casier() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: actus, isPending, error } = useActualites();
  const { data: notifs } = useNotifications();
  /* Les couleurs viennent de la base, comme les catégories
     elles-mêmes : elles étaient écrites dans le code, et une seule
     l'était vraiment — tout le reste tombait sur le vert du club. */
  const { data: cats } = useCategories();
  const [filtre, setFiltre] = useState<string | null>(null);

  const nonlues = (notifs ?? []).filter((n) => !n.lue_le).length;
  const liste = (actus ?? []).filter((a) => !filtre || a.categorie === filtre);

  return (
    <>
      <Entete
        titre="Casier"
        action={
          <>
            {/* Publier là où l'on regarde. Le club a cherché ce
                bouton ici : le casier est l'endroit où l'on constate
                qu'une annonce manque, et il fallait jusqu'ici
                ressortir, ouvrir l'administration et retrouver
                l'écran de publication.

                Ce n'est pas une permission de plus — le serveur
                refuse déjà ce que le rôle n'autorise pas — c'est un
                raccourci, et il n'apparaît qu'à qui peut s'en
                servir. */}
            {estAdmin(moi) && (
              <button
                className="tapicon"
                onClick={() => aller('/admin/publier')}
                aria-label="Publier une actualité"
              >
                <Icone nom="plus" taille={22} couleur="#0E2119" epaisseur={2} />
              </button>
            )}
            <button
              className="tapicon"
              onClick={() => aller('/notifications')}
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <Icone nom="bell" taille={22} couleur="#0E2119" />
              {nonlues > 0 && <span className="dot dot--plain" />}
            </button>
          </>
        }
      />

      <div className="chips">
        <Puce texte="Tout" actif={filtre === null} onClick={() => setFiltre(null)} />
        {categories(actus ?? []).map((c) => (
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
          gap: 12
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Rien dans le casier pour le moment."
        >
          {liste.map((a, i) => {
            const [cc, cb] = teinter(cats, a.categorie);
            const { jour, mois } = jourEtMois(a.date_evt ?? a.cree_le);
            /* « Nouveau » se mérite : moins de sept jours. Marquer la
               première de la liste l'aurait toujours marquée, même un
               an après la dernière publication. */
            const neuf = Date.now() - new Date(a.cree_le).getTime() < 7 * 86400000;
            return (
              <button
                key={a.id}
                className={`card newscard${i === 0 && neuf ? ' newscard--new' : ''}`}
                onClick={() => aller(`/casier/${a.id}`)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag" style={{ color: cc, background: cb }}>
                    {a.categorie}
                  </span>
                  <span style={{ fontSize: 12, color: '#7C8B82' }}>
                    {jour} {mois}
                  </span>
                  {neuf && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#E4572E'
                      }}
                    >
                      NOUVEAU
                    </span>
                  )}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: '21px',
                    textAlign: 'left'
                  }}
                >
                  {a.titre}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 14,
                    lineHeight: '21px',
                    color: '#59685F',
                    textAlign: 'left'
                  }}
                >
                  {a.texte}
                </span>
              </button>
            );
          })}
        </Etat>
      </div>
    </>
  );
}

/* ---------------------------------------------- 07 · Une actualité */
export function Actualite() {
  const { id } = useParams();
  const aller = useNavigate();
  const { data: a, isPending } = useActualite(id);
  const { data: cats } = useCategories();
  const moi = useSession((e) => e.profil);
  /* Ai-je déjà dit que je viens ? L'écran l'ignorait complètement :
     « J'y participe » s'affichait à l'identique qu'on soit inscrit ou
     non, et l'on ne savait plus si l'on s'était inscrit — donc on
     recommençait. */
  const { data: participation } = useParticipation(id, moi?.id);
  /* Appelé avant le retour anticipé : un hook ne se saute pas selon
     l'état du chargement. */
  const illustration = useUrl('album', a?.image);

  if (isPending || !a) {
    return (
      <>
        <Entete titre="Actualité" retour={() => aller('/casier')} />
        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#59685F' }}>
          {isPending ? 'Chargement…' : 'Cette actualité n’est plus disponible.'}
        </div>
      </>
    );
  }

  const [cc, cb] = teinter(cats, a.categorie);

  return (
    <>
      <Entete
        titre={a.categorie}
        retour={() => aller('/casier')}
        /* MODIFIER LÀ OÙ L'ON LIT.

           Corriger une faute dans une annonce demandait de ressortir,
           d'ouvrir l'administration, d'ouvrir « Publier une
           actualité », puis de retrouver l'annonce dans la liste du
           bas. Quatre appuis pour une virgule — donc une virgule qui
           reste.

           Le crayon n'apparaît qu'à qui peut écrire : le serveur
           refuse déjà le reste, et proposer ce qui sera refusé laisse
           la personne se demander si le fautif est elle. */
        action={
          estAdmin(moi) ? (
            <button
              className="tapicon"
              onClick={() => aller(`/admin/publier?a=${a.id}`)}
              aria-label="Modifier cette actualité"
            >
              <Icone nom="edit" taille={21} couleur="#0E2119" />
            </button>
          ) : undefined
        }
      />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* L'image de l'actualité, quand il y en a une. Sinon
            l'emplacement reste, et le dit : un bandeau vide est plus
            honnête qu'une image d'illustration prise ailleurs. */}
        {illustration ? (
          <img
            src={illustration}
            alt=""
            style={{ height: 190, width: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="ph" style={{ height: 190 }}>
            <Icone nom="album" taille={46} couleur="#8FB3A0" epaisseur={1.3} />
            <p className="ph__label">Photo à fournir</p>
          </div>
        )}

        <div
          style={{
            padding: '22px 20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          <div>
            <span className="tag" style={{ color: cc, background: cb }}>
              {a.categorie}
            </span>
            <h1 className="display" style={{ fontSize: 24, lineHeight: '30px', marginTop: 12 }}>
              {a.titre}
            </h1>
            <p style={{ fontSize: 13, color: '#7C8B82', marginTop: 8 }}>
              Publié le {jourEtMois(a.cree_le).jour} {jourEtMois(a.cree_le).mois} par{' '}
              {a.auteur ? `${a.auteur.nom} ${a.auteur.prenom}` : 'l’administration'}
            </p>
          </div>

          {(a.date_evt || a.lieu) && (
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {a.date_evt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icone nom="calendar" taille={19} couleur="#0F5132" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{dateLongue(a.date_evt)}</p>
                    </div>
                  </div>
                )}
                {a.date_evt && a.lieu && <Filet />}
                {a.lieu && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icone nom="pin" taille={19} couleur="#0F5132" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{a.lieu}</p>
                      <p style={{ fontSize: 13, color: '#59685F' }}>Analamahitsy</p>
                    </div>
                  </div>
                )}
              </div>
            </Carte>
          )}

          {/* Le texte du club arrive tel qu'il l'a écrit, sauts de
              ligne compris : les reformater serait le réécrire. */}
          {a.texte.split(/\n{2,}/).map((paragraphe, i) => (
            <p key={i} style={{ fontSize: 15, lineHeight: '25px', color: '#3C4A42' }}>
              {paragraphe}
            </p>
          ))}

          {/* ---- « J'Y PARTICIPE » N'A PAS TOUJOURS DE SENS ----

              Le bouton s'affichait sur TOUTE actualité, y compris un
              changement d'horaire ou une réunion annoncée. On ne
              participe pas à un changement d'horaire : l'écran de
              participation demandait alors des accompagnants et une
              promesse de versement pour une information qui n'attend
              aucune réponse.

              Le repère, c'est la DATE de l'événement : une actualité
              qui n'en porte pas n'est pas un événement, c'est une
              annonce. C'est le même champ que l'écran affiche déjà
              plus haut, et il est déjà rempli par le club quand il
              s'agit d'une sortie ou d'une compétition.

              Une date PASSÉE ferme aussi : s'inscrire à une sortie
              d'il y a trois mois ne veut rien dire, et le club
              recevrait des promesses de versement pour un événement
              qui a eu lieu. */}
          {a.date_evt && new Date(a.date_evt) >= aujourdhui() ? (
            participation ? (
              /* DÉJÀ INSCRIT — et l'écran dit OÙ EN EST la demande.

                 Une validation que seul l'organisateur connaît n'est
                 pas une validation, c'est une décision privée. On
                 s'inscrit à une sortie et l'on veut savoir si l'on
                 part : sans cela, il faut aller le demander de vive
                 voix, ce qui est exactement ce que l'application
                 devrait éviter. */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {participation.refuse_le ? (
                  <div className="warn">
                    <i />
                    <p>
                      <b>Votre inscription n’a pas été retenue.</b>
                      {participation.motif ? ` ${participation.motif}` : ''}
                    </p>
                  </div>
                ) : participation.valide_le ? (
                  <div
                    className="banner"
                    style={{ background: '#E8F1EC', borderColor: '#B9D3C4' }}
                  >
                    <Icone nom="shieldCheck" taille={17} couleur="#0F5132" />
                    <span style={{ flexGrow: 1 }}>Votre inscription est validée.</span>
                  </div>
                ) : (
                  <div className="banner">
                    <Icone nom="calendar" taille={17} couleur="#0F5132" />
                    <span style={{ flexGrow: 1 }}>
                      Inscription envoyée — en attente de validation.
                    </span>
                  </div>
                )}
                <Bouton
                  genre="ghost"
                  onClick={() => aller(`/casier/${a.id}/participer`)}
                >
                  Modifier mon inscription
                </Bouton>
              </div>
            ) : (
              <Bouton onClick={() => aller(`/casier/${a.id}/participer`)}>J’y participe</Bouton>
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
