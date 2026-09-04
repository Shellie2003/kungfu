/* ============================================================
   Administration · Les grades du club

   Ils vivaient en base et ne se modifiaient que par le tableau de
   bord Supabase — c'est-à-dire par le développeur. Un club qui
   renomme une ceinture, en ajoute une, ou corrige une couleur
   devait écrire à quelqu'un et attendre. Autant dire que cela ne se
   serait pas fait, et que l'application aurait affiché pendant deux
   ans une liste inexacte.

   Un grade ne se SUPPRIME pas : des fiches y sont rattachées, et le
   détruire casserait leur historique. Il se désactive, comme une
   fiche d'élève — il disparaît des listes de choix et reste sur les
   fiches qui le portent.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Champ, Entete, Etat, Filet, Grade, Surtitre } from '../../ui/base';
import { useGrades } from '../../services/membres';
import {
  useActiverGrade,
  useCreerGrade,
  useModifierGrade
} from '../../services/admin';

/* Une couleur par défaut qui n'est celle d'aucune ceinture : le
   club la remplace, et l'oubli se voit. */
const NEUTRE = '#7C8B82';

const VIDE = { nom: '', couleur: NEUTRE, rang: 0 };

export function AdminGrades() {
  const aller = useNavigate();
  /* « tous » : les désactivés compris. Sans eux, un grade retiré par
     erreur deviendrait irrécupérable depuis l'application. */
  const { data: grades, isPending, error } = useGrades(true);
  const creer = useCreerGrade();
  const modifier = useModifierGrade();
  const activer = useActiverGrade();

  const [edite, setEdite] = useState<string | null>(null);
  const [s, setS] = useState(VIDE);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  /* Le rang par défaut place le nouveau grade APRÈS le dernier : on
     ajoute presque toujours une ceinture plus haute, et proposer 0
     obligerait à renuméroter toute la liste. */
  useEffect(() => {
    if (edite || !grades?.length) return;
    setS((p) => (p.rang === 0 ? { ...p, rang: Math.max(...grades.map((g) => g.rang)) + 1 } : p));
  }, [grades, edite]);

  function vider() {
    setEdite(null);
    setS({ ...VIDE, rang: grades?.length ? Math.max(...grades.map((g) => g.rang)) + 1 : 0 });
  }

  function enregistrer() {
    if (!s.nom.trim()) {
      setAvis({ bon: false, texte: 'Le nom du grade est obligatoire.' });
      return;
    }
    const suite = {
      onSuccess: () => {
        setAvis({ bon: true, texte: edite ? 'Grade modifié.' : 'Grade créé.' });
        vider();
      },
      onError: (e: unknown) =>
        setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
    };
    if (edite) modifier.mutate({ id: edite, ...s }, suite);
    else creer.mutate(s, suite);
  }

  const enCours = creer.isPending || modifier.isPending;

  return (
    <>
      <Entete
        titre={edite ? 'Modifier un grade' : 'Les grades du club'}
        retour={() => aller('/admin')}
      />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {edite && (
          <div className="banner">
            <Icone nom="edit" taille={16} couleur="#0F5132" />
            <span style={{ flexGrow: 1 }}>Modification d’un grade existant</span>
            <button className="link" onClick={vider}>
              Annuler
            </button>
          </div>
        )}

        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Champ
              libelle="Nom"
              valeur={s.nom}
              poser={(v) => setS((p) => ({ ...p, nom: v }))}
              obligatoire
              invite="Ceinture verte"
            />

            {/* Un sélecteur de couleur natif plutôt qu'une liste :
                les écoles n'emploient pas les mêmes teintes, et une
                liste figée obligerait à revenir au tableau de bord
                dès la première nuance. */}
            <label className="field">
              <span className="field__label">Couleur</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  value={s.couleur}
                  onChange={(e) => setS((p) => ({ ...p, couleur: e.target.value }))}
                  aria-label="Couleur"
                  style={{
                    width: 52,
                    height: 38,
                    padding: 2,
                    border: '1px solid var(--filet)',
                    borderRadius: 10,
                    background: '#FFF'
                  }}
                />
                {/* L'aperçu, tel qu'il apparaîtra sur une fiche : une
                    couleur seule ne dit pas ce qu'elle donnera. */}
                <Grade nom={s.nom || 'Aperçu'} couleur={s.couleur} />
              </span>
            </label>

            <Champ
              libelle="Rang"
              type="number"
              valeur={String(s.rang)}
              poser={(v) => setS((p) => ({ ...p, rang: Number(v) || 0 }))}
              aide="De la ceinture la plus basse à la plus haute. Il ordonne le filtre de l’annuaire."
            />

            {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

            <Bouton onClick={enregistrer} desactive={enCours}>
              {enCours ? 'Enregistrement…' : edite ? 'Enregistrer' : 'Créer ce grade'}
            </Bouton>
          </div>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les grades</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={(grades ?? []).length === 0}
            messageVide="Aucun grade. Créez-en un ci-dessus."
          >
            <div className="list">
              {(grades ?? []).map((g) => (
                <div key={g.id} className="listrow" style={{ opacity: g.actif ? 1 : 0.55 }}>
                  {/* ---- « MODIFIER » S'ÉCRIT, IL NE SE DEVINE PAS ----

                      La rangée était DÉJÀ un bouton, et l'appuyer
                      remplissait le formulaire du haut. Rien ne le
                      disait : ni chevron, ni libellé, rien qu'un
                      « aria-label » — c'est-à-dire une indication
                      réservée aux lecteurs d'écran, invisible à qui
                      regarde. À côté d'un « Retirer » bien visible,
                      la liste se lisait donc comme une liste où l'on
                      ne peut que supprimer.

                      Le mot est maintenant écrit. C'est la différence
                      entre une fonctionnalité qui existe et une
                      fonctionnalité qu'on trouve. */}
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <Grade nom={g.nom} couleur={g.couleur} />
                    <span
                      style={{ display: 'block', fontSize: 12, color: '#59685F', marginTop: 6 }}
                    >
                      Rang {g.rang}
                      {g.actif === false ? ' · retiré des listes' : ''}
                    </span>
                  </span>
                  <button
                    className="link"
                    aria-label={`Modifier ${g.nom}`}
                    onClick={() => {
                      setEdite(g.id);
                      setS({ nom: g.nom, couleur: g.couleur, rang: g.rang });
                      setAvis(null);
                      /* ⚠ ET ON REMONTE AU FORMULAIRE.

                         Il est en haut de l'écran ; la ceinture noire
                         est en bas. On appuyait sur « modifier », le
                         formulaire se remplissait hors du champ de
                         vision, et il ne se passait RIEN de visible —
                         ce qui se lit comme un bouton cassé. */
                      document
                        .querySelector('.phone')
                        ?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    className="link"
                    style={{ color: g.actif === false ? undefined : '#8A3B12' }}
                    aria-label={
                      g.actif === false
                        ? `Remettre ${g.nom} dans les listes`
                        : `Retirer ${g.nom} des listes`
                    }
                    onClick={() => activer.mutate({ id: g.id, actif: g.actif === false })}
                  >
                    {g.actif === false ? 'Remettre' : 'Retirer'}
                  </button>
                </div>
              ))}
            </div>
          </Etat>
        </div>

        <Filet />

        <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}>
          Un grade retiré disparaît des listes de choix et reste sur les fiches qui le
          portent : l’historique d’un élève ne se réécrit pas parce que le club a changé sa
          progression. Il se remet en place d’un appui.
        </p>
      </div>
    </>
  );
}
