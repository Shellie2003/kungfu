/* ============================================================
   03 · Étudiants

   L'annuaire. Recherche et filtre par grade se font ici, sur la
   liste déjà reçue : soixante-quatre fiches tiennent en mémoire, et
   une requête à chaque lettre tapée rendrait l'écran inutilisable
   sur un réseau lent — ce qui est la situation ordinaire.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Entete, Etat, Grade, Portrait, Puce } from '../ui/base';
import { useGrades, useMembres } from '../services/membres';
import { useNotifications } from '../services/casier';
import { urlPhoto } from '../services/club';

/* Les accents ne doivent pas empêcher de trouver quelqu'un :
   « Razafimahatratra » se cherche aussi bien sans eux. */
const pliage = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* Le filtre n'a pas la place d'\u00e9crire \u00ab Ceinture verte \u00bb cinq fois
   de suite ; il garde la couleur seule, avec sa majuscule \u2014 sans
   quoi la puce affiche \u00ab verte \u00bb, qui se lit comme une faute. */
const courtGrade = (nom: string) => {
  const reste = nom.replace(/^Ceinture\s+/i, '');
  return reste.charAt(0).toUpperCase() + reste.slice(1);
};

export function Etudiants() {
  const aller = useNavigate();
  const { data: membres, isPending, error } = useMembres();
  const { data: grades } = useGrades();
  const { data: notifs } = useNotifications();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<string | null>(null);

  const nonlues = (notifs ?? []).filter((n) => !n.lue_le).length;

  const liste = useMemo(() => {
    const q = pliage(recherche.trim());
    return (membres ?? []).filter((m) => {
      if (filtre && m.grade?.nom !== filtre) return false;
      if (!q) return true;
      return pliage(`${m.nom} ${m.prenom}`).includes(q);
    });
  }, [membres, recherche, filtre]);

  return (
    <>
      <Entete
        titre="Étudiants"
        action={
          <button
            className="tapicon"
            onClick={() => aller('/notifications')}
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <Icone nom="bell" taille={22} couleur="#0E2119" />
            {nonlues > 0 && <span className="dot dot--plain" />}
          </button>
        }
      />

      <div style={{ padding: '16px 20px 0' }}>
        <div className="searchbar">
          <Icone nom="search" taille={19} couleur="#7C8B82" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un nom ou un prénom"
            aria-label="Rechercher un nom ou un prénom"
            style={{
              flexGrow: 1,
              minWidth: 0,
              border: 0,
              background: 'transparent',
              fontSize: 15,
              color: 'var(--encre)'
            }}
          />
        </div>
      </div>

      {/* Les grades viennent de la base : le club en ajoute un, le
          filtre le connaît sans nouvelle version de l'application. */}
      <div className="chips">
        <Puce texte="Tous" actif={filtre === null} onClick={() => setFiltre(null)} />
        {(grades ?? []).map((g) => (
          <Puce
            key={g.id}
            texte={courtGrade(g.nom)}
            actif={filtre === g.nom}
            onClick={() => setFiltre(filtre === g.nom ? null : g.nom)}
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
        <p style={{ fontSize: 12, color: '#59685F' }}>
          {liste.length} membre{liste.length > 1 ? 's' : ''} · classés par grade
        </p>

        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucun membre ne correspond."
        >
          {liste.map((m) => (
            <button
              key={m.id}
              className="card studentrow"
              onClick={() => aller(`/etudiants/${m.id}`)}
            >
              <Portrait taille={52} rayon={14} photo={urlPhoto('portraits', m.photo)} />
              <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                <span
                  style={{ display: 'block', fontSize: 15, fontWeight: 700, lineHeight: '19px' }}
                >
                  {m.nom}
                </span>
                <span
                  style={{ display: 'block', fontSize: 14, color: '#3C4A42', lineHeight: '19px' }}
                >
                  {m.prenom}
                </span>
                {m.grade && (
                  <span style={{ display: 'block', marginTop: 7 }}>
                    <Grade nom={m.grade.nom} couleur={m.grade.couleur} />
                  </span>
                )}
              </span>
              <Icone nom="chev" taille={18} couleur="#A8B6AE" epaisseur={2} />
            </button>
          ))}
        </Etat>
      </div>
    </>
  );
}
