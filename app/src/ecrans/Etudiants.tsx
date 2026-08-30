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
import { useUrls } from '../services/stockage';
import { correspond, courtGrade } from '../services/texte';

export function Etudiants() {
  const aller = useNavigate();
  const { data: membres, isPending, error } = useMembres();
  const { data: grades } = useGrades();
  const { data: notifs } = useNotifications();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<string | null>(null);

  const nonlues = (notifs ?? []).filter((n) => !n.lue_le).length;
  /* Les soixante-quatre portraits en UN appel. Une adresse signée
     par photo ferait soixante-quatre allers-retours sur un réseau
     malgache — plusieurs secondes d'écran vide. */
  const portraits = useUrls('portraits', (membres ?? []).map((m) => m.photo));

  const liste = useMemo(
    () =>
      (membres ?? []).filter(
        (m) =>
          (!filtre || m.grade?.nom === filtre) && correspond(recherche, m.nom, m.prenom)
      ),
    [membres, recherche, filtre]
  );

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
              <Portrait taille={52} rayon={14} photo={m.photo ? portraits[m.photo] : null} />
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
