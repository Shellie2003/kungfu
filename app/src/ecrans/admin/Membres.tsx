/* ============================================================
   Administration · Choisir un membre, et changer un grade

   Deux écrans qui partagent la même liste : « à qui ? » est la
   première question des deux. Le choix de la cible est donc écrit
   une fois.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Entete, Etat, Grade, Portrait, Surtitre } from '../../ui/base';
import { useGrades, useMembres } from '../../services/membres';
import type { Membre } from '../../services/membres';
import { urlPhoto } from '../../services/club';
import { useChangerGrade } from '../../services/admin';

const pliage = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* La liste avec sa recherche, réutilisée par les deux écrans. */
function Annuaire({
  action,
  suffixe
}: {
  action: (m: Membre) => void;
  suffixe?: (m: Membre) => React.ReactNode;
}) {
  const { data: membres, isPending, error } = useMembres();
  const [q, setQ] = useState('');

  const liste = useMemo(() => {
    const r = pliage(q.trim());
    return (membres ?? []).filter((m) => !r || pliage(`${m.nom} ${m.prenom}`).includes(r));
  }, [membres, q]);

  return (
    <>
      <div style={{ padding: '16px 20px 0' }}>
        <div className="searchbar">
          <Icone nom="search" taille={19} couleur="#7C8B82" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom ou un prénom"
            aria-label="Rechercher un nom ou un prénom"
            style={{
              flexGrow: 1, minWidth: 0, border: 0, background: 'transparent',
              fontSize: 15, color: 'var(--encre)'
            }}
          />
        </div>
      </div>

      <div
        style={{
          flexGrow: 1, padding: '14px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 12
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucun membre ne correspond."
        >
          {liste.map((m) => (
            <button key={m.id} className="card studentrow" onClick={() => action(m)}>
              <Portrait taille={44} rayon={12} photo={urlPhoto('portraits', m.photo)} />
              <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{m.nom}</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#3C4A42' }}>
                  {m.prenom} · {m.numero}
                </span>
                {m.grade && (
                  <span style={{ display: 'block', marginTop: 6 }}>
                    <Grade nom={m.grade.nom} couleur={m.grade.couleur} />
                  </span>
                )}
              </span>
              {suffixe?.(m) ?? <Icone nom="chev" taille={18} couleur="#A8B6AE" epaisseur={2} />}
            </button>
          ))}
        </Etat>
      </div>
    </>
  );
}

/* ---------------------------------------------- Modifier une fiche */
export function AdminChoisirFiche() {
  const aller = useNavigate();
  return (
    <>
      <Entete titre="Modifier une fiche" retour={() => aller('/admin')} />
      <Annuaire action={(m) => aller(`/admin/fiche/${m.id}`)} />
    </>
  );
}

/* ---------------------------------------------- Changer un grade */
export function AdminGrade() {
  const aller = useNavigate();
  const { data: grades } = useGrades();
  const changer = useChangerGrade();
  const [cible, setCible] = useState<Membre | null>(null);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  if (!cible) {
    return (
      <>
        <Entete titre="Changer un grade" retour={() => aller('/admin')} />
        <Annuaire action={setCible} />
      </>
    );
  }

  return (
    <>
      <Entete titre="Changer un grade" retour={() => setCible(null)} />
      <div
        style={{
          flexGrow: 1, padding: '20px 20px 28px',
          display: 'flex', flexDirection: 'column', gap: 22
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Portrait taille={64} rayon={16} photo={urlPhoto('portraits', cible.photo)} />
          <div>
            <p className="display" style={{ fontSize: 17, lineHeight: '21px' }}>{cible.nom}</p>
            <p style={{ fontSize: 14, color: '#3C4A42' }}>{cible.prenom}</p>
            <div style={{ marginTop: 8 }}>
              {cible.grade && <Grade nom={cible.grade.nom} couleur={cible.grade.couleur} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Nouveau grade</Surtitre>
          <div className="list">
            {(grades ?? []).map((g) => {
              const actuel = cible.grade?.nom === g.nom;
              return (
                <button
                  key={g.id}
                  className="listrow"
                  disabled={actuel || changer.isPending}
                  style={actuel ? { background: '#F5F8F6' } : undefined}
                  onClick={() =>
                    changer.mutate(
                      { profilId: cible.id, gradeId: g.id },
                      {
                        onSuccess: () => {
                          setAvis({ bon: true, texte: `Grade changé : ${g.nom}.` });
                          setCible({ ...cible, grade: { nom: g.nom, couleur: g.couleur, rang: g.rang } });
                        },
                        onError: (e) =>
                          setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
                      }
                    )
                  }
                >
                  <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                    <Grade nom={g.nom} couleur={g.couleur} />
                  </span>
                  {actuel ? (
                    <span style={{ fontSize: 12, color: '#7C8B82' }}>actuel</span>
                  ) : (
                    <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <div className="warn">
          <i />
          <p>
            Le grade ne se change que d’ici. Un élève qui corrige sa propre fiche ne peut pas
            s’attribuer une ceinture : un déclencheur de la base le refuse, quelle que soit
            l’application employée.
          </p>
        </div>
      </div>
    </>
  );
}
