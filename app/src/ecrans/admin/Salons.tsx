/* ============================================================
   Administration · Les salons de discussion

   Deux fonctionnalités validées à la livraison de la maquette —
   « salons par grade : un fil par groupe de niveau » et « salon par
   événement : ouvert pour un tournoi, une sortie, puis archivé » —
   et rien ne les créait. Le club n'avait que les salons posés à la
   main en base, et n'aurait jamais pu ouvrir un fil pour un tournoi
   sans passer par le développeur.

   Pourquoi cet écran n'est PAS une permission de plus : créer un
   salon et y inscrire quelqu'un sont réservés à l'administration
   depuis le premier jour — c'est ce qui empêche un élève de
   s'inscrire tout seul dans l'espace des maîtres. Cet écran est le
   chemin autorisé, et le serveur refuserait les mêmes gestes à un
   autre rôle.

   L'espace des maîtres ne se crée pas ici, et c'est délibéré : il
   est unique, il existe déjà, et offrir d'en ouvrir un second
   inviterait à se tromper d'endroit pour une délibération.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import {
  Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Grade, Puce, Surtitre
} from '../../ui/base';
import { useSalons } from '../../services/messagerie';
import { useGrades, useMembres } from '../../services/membres';
import {
  useCreerSalon, useInscrireAuSalon, useMembresSalon, useRetirerDuSalon
} from '../../services/admin';
import { correspond } from '../../services/texte';

/* Les couleurs que la maquette emploie pour les salons. Le club en
   choisit une : elle donne l'initiale colorée de la liste, et deux
   fils de la même teinte se confondent au premier coup d'œil. */
const COULEURS: [string, string][] = [
  ['#0F5132', 'Vert du club'],
  ['#B0530F', 'Orange'],
  ['#1D4E89', 'Bleu'],
  ['#6B3FA0', 'Violet'],
  ['#0B2B1D', 'Vert sombre']
];

/* Les types de salon, tels qu'on les dit. La colonne stocke des mots
   de base de données — « evenement », « maitres », sans accent ni
   majuscule — et cet écran les donnait à lire au club. */
const NOM_DU_TYPE: Record<string, string> = {
  club: 'Tout le club',
  grade: 'Un grade',
  evenement: 'Un événement',
  maitres: 'Espace des maîtres',
  direct: 'Conversation à deux'
};

export function AdminSalons() {
  const aller = useNavigate();
  const { data: salons, isPending, error } = useSalons();
  const { data: membres } = useMembres();
  const { data: grades } = useGrades();
  const creer = useCreerSalon();
  const inscrire = useInscrireAuSalon();
  const retirer = useRetirerDuSalon();

  /* ------------------------------------------------------------
     LES CONVERSATIONS À DEUX NE SONT PAS ADMINISTRÉES.

     Elles apparaissaient dans cette liste, deux rangées identiques
     intitulées « Conversation » avec un point d'interrogation en
     guise d'initiale — parce qu'un salon direct n'a pas de titre, et
     que le nom de l'autre personne vient d'une vue à laquelle
     l'administration n'a pas accès.

     Ce n'était pas seulement laid. Le bouton « Membres » ouvrait une
     liste vide, puisque la règle d'accès ne rend les membres d'un
     salon qu'à ceux qui en font partie. On proposait donc
     d'administrer ce qu'on ne peut ni voir ni modifier — et une liste
     de conversations privées affichée dans un écran d'administration
     se lit comme de la surveillance, même quand elle n'en est pas.

     ⚠ À SIGNALER AU CLUB, et non corrigé ici : la règle
     « l'administration ouvre les salons » de la migration 0003 est un
     « for all » sans restriction de type. Un administrateur peut donc
     constater qu'une conversation à deux EXISTE — jamais qui y
     participe, jamais ce qui s'y dit, les deux étant gardés par
     d'autres règles. Resserrer une règle d'accès est une décision de
     sécurité : elle se prend avec le club, pas au détour d'une
     correction d'écran. */
  const collectifs = (salons ?? []).filter((s) => s.type !== 'direct');

  const [type, setType] = useState<'grade' | 'evenement'>('evenement');
  const [titre, setTitre] = useState('');
  const [couleur, setCouleur] = useState('#0F5132');
  const [choisis, setChoisis] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Le salon dont on gère les membres, une fois créé. */
  const [ouvert, setOuvert] = useState<string | null>(null);
  const { data: dedans } = useMembresSalon(ouvert ?? undefined);

  const liste = useMemo(
    () => (membres ?? []).filter((m) => correspond(q, m.nom, m.prenom)),
    [membres, q]
  );

  const basculer = (id: string) =>
    setChoisis((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* Le raccourci qui fait gagner le plus de temps : un salon de
     grade se peuple d'un appui, sans cocher dix-sept lignes. */
  function tousDuGrade(nom: string) {
    /* On rapproche par le NOM du grade, et non par son identifiant :
       l'annuaire ne transmet pas l'identifiant du grade — il n'en a
       pas besoin pour afficher une étiquette — et l'ajouter au type
       partagé pour ce seul écran ferait payer une colonne de plus à
       chaque chargement des soixante-quatre fiches. */
    const ids = (membres ?? []).filter((m) => m.grade?.nom === nom).map((m) => m.id);
    setChoisis(ids);
    if (!titre.trim()) setTitre(nom);
    setType('grade');
  }

  function creerLe() {
    if (!titre.trim()) {
      setAvis({ bon: false, texte: 'Le titre du salon est obligatoire.' });
      return;
    }
    creer.mutate(
      { type, titre, couleur, membres: choisis },
      {
        onSuccess: () => {
          setAvis({
            bon: true,
            texte: `Salon créé avec ${choisis.length} membre${choisis.length > 1 ? 's' : ''}.`
          });
          setTitre('');
          setChoisis([]);
        },
        onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
      }
    );
  }

  return (
    <>
      <Entete titre="Les salons" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ouvrir un salon</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Choix
                libelle="Type"
                valeur={type}
                poser={(v) => setType(v as 'grade' | 'evenement')}
                options={[
                  { valeur: 'evenement', texte: 'Événement — un tournoi, une sortie' },
                  { valeur: 'grade', texte: 'Grade — un groupe de niveau' }
                ]}
                aide="Un salon d’événement se range dans l’archive une fois l’événement passé."
              />
              <Champ
                libelle="Titre"
                valeur={titre}
                poser={setTitre}
                obligatoire
                invite="Tournoi de Mahamasina, mars 2026"
              />
              <Choix
                libelle="Couleur"
                valeur={couleur}
                poser={setCouleur}
                options={COULEURS.map(([v, t]) => ({ valeur: v, texte: t }))}
                aide="Elle colore l’initiale du salon dans la liste."
              />
            </div>
          </Carte>
        </div>

        {/* Les raccourcis par grade. Cocher dix-sept lignes pour un
            salon de ceintures vertes serait le meilleur moyen que le
            club ne le fasse jamais. */}
        {(grades ?? []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Surtitre>Tout un grade d’un coup</Surtitre>
            <div className="chips">
              {(grades ?? []).map((g) => (
                <Puce
                  key={g.id}
                  texte={g.nom}
                  actif={false}
                  onClick={() => tousDuGrade(g.nom)}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>Qui en fait partie</Surtitre>
            <span style={{ fontSize: 12, color: '#7C8B82' }}>
              {choisis.length} choisi{choisis.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="searchbar">
            <Icone nom="search" taille={19} couleur="#7C8B82" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un nom"
              aria-label="Rechercher un nom"
              style={{
                flexGrow: 1, minWidth: 0, border: 0, background: 'transparent',
                fontSize: 15, color: 'var(--encre)'
              }}
            />
          </div>

          <div className="list">
            {liste.map((m) => (
              <label key={m.id} className="listrow" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={choisis.includes(m.id)}
                  onChange={() => basculer(m.id)}
                  aria-label={`${m.nom} ${m.prenom}`}
                />
                <span style={{ flexGrow: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                    {m.nom} {m.prenom}
                  </b>
                  {m.grade && (
                    <span style={{ display: 'block', marginTop: 4 }}>
                      <Grade nom={m.grade.nom} couleur={m.grade.couleur} />
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Bouton onClick={creerLe} desactive={creer.isPending}>
          {creer.isPending ? 'Création…' : 'Créer ce salon'}
        </Bouton>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les salons ouverts</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={collectifs.length === 0}
            messageVide="Aucun salon."
          >
            <div className="list">
              {collectifs.map((s) => (
                <div key={s.id} className="listrow">
                  <span
                    style={{
                      width: 30, height: 30, borderRadius: 10, flex: 'none',
                      background: `${s.couleur ?? '#0F5132'}1A`,
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12,
                      color: s.couleur ?? '#0F5132'
                    }}
                  >
                    {(s.titre ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                      {s.titre ?? 'Conversation'}
                    </b>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                      {/* Le type EN FRANÇAIS. L'écran affichait la
                          valeur de la colonne : « evenement »,
                          « maitres », sans accent ni majuscule. Ce
                          sont des mots de base de données, et on les
                          donnait à lire au club. */}
                      {NOM_DU_TYPE[s.type] ?? s.type}
                    </span>
                  </span>
                  <button
                    className="link"
                    onClick={() => setOuvert(ouvert === s.id ? null : s.id)}
                  >
                    {ouvert === s.id ? 'Fermer' : 'Membres'}
                  </button>
                </div>
              ))}
            </div>
          </Etat>
        </div>

        {/* Les membres d'un salon existant : en ajouter, en retirer.
            Un salon d'événement se peuple souvent en deux fois — les
            inscrits du premier jour, puis les retardataires. */}
        {ouvert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Membres de ce salon</Surtitre>
            <div className="list">
              {(dedans ?? []).map((d) => (
                <div key={d.profil_id} className="listrow">
                  <span style={{ flexGrow: 1, minWidth: 0, fontSize: 14 }}>
                    {d.membre ? `${d.membre.nom} ${d.membre.prenom}` : d.profil_id}
                  </span>
                  <button
                    className="tapicon"
                    aria-label={`Retirer ${d.membre?.nom ?? 'ce membre'} du salon`}
                    onClick={() => retirer.mutate({ salonId: ouvert, profilId: d.profil_id })}
                  >
                    <Icone nom="x" taille={17} couleur="#B3341A" />
                  </button>
                </div>
              ))}
              {(dedans ?? []).length === 0 && (
                <div className="listrow">
                  <span style={{ fontSize: 13, color: '#59685F' }}>
                    Personne pour l’instant.
                  </span>
                </div>
              )}
            </div>
            <Bouton
              genre="ghost"
              desactive={!choisis.length || inscrire.isPending}
              onClick={() =>
                inscrire.mutate(
                  { salonId: ouvert, profilIds: choisis },
                  {
                    onSuccess: () => {
                      setAvis({ bon: true, texte: 'Membres ajoutés à ce salon.' });
                      setChoisis([]);
                    },
                    onError: (e) =>
                      setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
                  }
                )
              }
            >
              Ajouter les {choisis.length} membres cochés
            </Bouton>
          </div>
        )}

        <div className="warn">
          <i />
          <p>
            L’espace des maîtres ne s’ouvre pas ici : il est unique et existe déjà. En
            proposer un second inviterait à se tromper d’endroit pour une délibération.
          </p>
        </div>
      </div>
    </>
  );
}
