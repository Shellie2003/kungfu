/* ============================================================
   Mon assiduité.

   Le pendant, côté membre, de l'écran de pointage. Ce qu'il montre
   n'est pas décoratif : c'est le registre sur lequel le club
   s'appuie pour un passage de grade. Un élève doit pouvoir le
   consulter, et donc contester une séance manquante pendant qu'on
   s'en souvient encore.

   Ce que l'écran NE montre pas : la présence des autres. Les règles
   d'accès ne la transmettent pas — le club compte des mineurs, et
   savoir qui était absent mardi est une information sur la vie de
   quelqu'un d'autre.
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Carte, Entete, Etat, Surtitre } from '../ui/base';
import {
  LIBELLE,
  bilan,
  jourLong,
  teinteStatut,
  useMesPresences
} from '../services/presences';
import { useSession } from '../services/session';

export function MesPresences() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: presences, isPending, error } = useMesPresences(moi?.id);

  const b = bilan(presences ?? []);

  return (
    <>
      <Entete titre="Mon assiduité" retour={() => aller('/accueil')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <Carte pad={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            {(
              [
                ['Séances', b.total],
                ['Présent', b.present],
                ['En retard', b.retard],
                ['Excusé', b.excuse]
              ] as [string, number][]
            ).map(([titre, n]) => (
              <div key={titre} style={{ textAlign: 'center', flexGrow: 1 }}>
                <p className="display" style={{ fontSize: 22, color: '#0F5132' }}>
                  {n}
                </p>
                <p style={{ fontSize: 11.5, color: '#59685F', marginTop: 2 }}>{titre}</p>
              </div>
            ))}
          </div>
          <p className="aide" style={{ marginTop: 12 }}>
            Sur les douze derniers mois. C’est la période que le club regarde pour un passage
            de grade.
          </p>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les séances</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={(presences ?? []).length === 0}
            messageVide="Aucune séance pointée pour le moment."
          >
            <div className="list">
              {(presences ?? []).map((p) => {
                const [couleur, fond] = teinteStatut(p.statut);
                return (
                  <div key={p.id} className="listrow">
                    <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                      <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                        {jourLong(p.seance_le)}
                      </b>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                        {new Date(`${p.seance_le}T12:00:00`).getFullYear()}
                      </span>
                    </span>
                    <span className="tag" style={{ color: couleur, background: fond }}>
                      {LIBELLE[p.statut]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Etat>
        </div>

        <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}>
          Une séance manquante ? Signalez-la à un maître pendant qu’on s’en souvient : c’est
          l’encadrement qui pointe, et lui seul peut corriger.
        </p>
      </div>
    </>
  );
}
