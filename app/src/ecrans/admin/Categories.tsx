/* ============================================================
   Administration · Les catégories

   « Je veux que les catégories soient éditables, pas en dur ou en
   lecture uniquement. »

   Elles ne l'étaient nulle part. Celles des ACTUALITÉS étaient une
   liste de cinq noms écrite dans l'écran de publication : en ajouter
   une demandait une nouvelle version de l'APK, donc une
   construction, donc moi. Celles des ALBUMS n'existaient pas du
   tout — la catégorie se tapait à la main à chaque création, si bien
   que « Compétition » et « Compétitions » devenaient deux rubriques,
   et que le filtre de l'écran Album en montrait autant que de fautes
   de frappe.

   Cet écran est le jumeau de celui des grades, et pour la même
   raison : la liste appartient au club, pas au code.

   Une catégorie ne se SUPPRIME pas. Des actualités la portent, et
   l'effacer laisserait leur étiquette sans couleur. Elle se retire
   des listes de choix et reste sur ce qui l'emploie — exactement ce
   que fait un grade.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Filet, Surtitre } from '../../ui/base';
import { eclaircir, useCategories } from '../../services/categories';
import type { Genre } from '../../services/categories';
import {
  useActiverCategorie,
  useCreerCategorie,
  useModifierCategorie
} from '../../services/admin';

const GENRES: { valeur: Genre; texte: string }[] = [
  { valeur: 'actualite', texte: 'Actualités (le casier)' },
  { valeur: 'album', texte: 'Albums photo' }
];

/* Le vert du club : une catégorie neuve part de la couleur de la
   maison, et le club la change s'il le veut. */
const DEPART = { genre: 'actualite' as Genre, nom: '', couleur: '#12613C', rang: 0 };

export function AdminCategories() {
  const aller = useNavigate();
  const { data: cats, isPending, error } = useCategories();
  const creer = useCreerCategorie();
  const modifier = useModifierCategorie();
  const activer = useActiverCategorie();

  const [edite, setEdite] = useState<string | null>(null);
  const [s, setS] = useState(DEPART);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  /* Le rang par défaut place la nouvelle catégorie APRÈS la dernière
     de son genre. Proposer 0 obligerait à renuméroter la liste
     entière à chaque ajout. */
  useEffect(() => {
    /* ⚠ « !cats » ET NON « cats ?? [] ».

       Sans cette ligne, le premier rendu — celui où la liste n'est
       pas encore arrivée — trouvait zéro catégorie, proposait le
       rang 1, et l'effet ne repassait plus jamais : la condition
       « rang === 0 » n'était plus vraie. Toute catégorie créée
       partait donc au rang 1, quel que soit le contenu de la liste,
       et se plaçait en tête du filtre.

       On attend d'avoir la liste avant de proposer quoi que ce
       soit. */
    if (edite || !cats) return;
    const memeGenre = cats.filter((c) => c.genre === s.genre);
    const suivant = memeGenre.length ? Math.max(...memeGenre.map((c) => c.rang)) + 1 : 1;
    setS((p) => (p.rang === 0 ? { ...p, rang: suivant } : p));
  }, [cats, edite, s.genre]);

  function vider() {
    setEdite(null);
    setS({ ...DEPART, rang: 0 });
  }

  function enregistrer() {
    if (!s.nom.trim()) {
      setAvis({ bon: false, texte: 'Le nom de la catégorie est obligatoire.' });
      return;
    }
    const suite = {
      onSuccess: () => {
        setAvis({ bon: true, texte: edite ? 'Catégorie modifiée.' : 'Catégorie créée.' });
        vider();
      },
      onError: (e: unknown) =>
        setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
    };
    if (edite) modifier.mutate({ id: edite, ...s }, suite);
    else creer.mutate(s, suite);
  }

  const enCours = creer.isPending || modifier.isPending;
  const [trait, fond] = [s.couleur, eclaircir(s.couleur)];

  return (
    <>
      <Entete
        titre={edite ? 'Modifier une catégorie' : 'Les catégories'}
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
            <span style={{ flexGrow: 1 }}>Modification d’une catégorie existante</span>
            <button className="link" onClick={vider}>
              Annuler
            </button>
          </div>
        )}

        <Carte pad={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Le genre ne se change PAS après coup : une catégorie
                d'actualité renommée en catégorie d'album laisserait
                les actualités qui la portent sans rubrique dans leur
                propre filtre. On crée l'autre, on retire celle-ci. */}
            <Choix
              libelle="Où elle sert"
              valeur={s.genre}
              poser={(v) => setS((p) => ({ ...p, genre: v as Genre, rang: 0 }))}
              options={GENRES}
              fige={Boolean(edite)}
              aide={
                edite
                  ? 'Il ne se change pas : les actualités déjà publiées y sont rattachées par leur nom.'
                  : 'Les deux listes sont distinctes : le casier et l’album ne parlent pas des mêmes choses.'
              }
            />

            <Champ
              libelle="Nom"
              valeur={s.nom}
              poser={(v) => setS((p) => ({ ...p, nom: v }))}
              obligatoire
              invite={s.genre === 'album' ? 'Compétitions' : 'Sortie'}
            />

            {/* Une SEULE couleur demandée : celle du trait. Le fond
                s'en déduit en la mélangeant à du blanc. Demander les
                deux serait demander au club de faire notre travail,
                et le meilleur moyen d'obtenir du rouge sur du bleu. */}
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
                {/* L'aperçu, tel qu'il apparaîtra dans le casier :
                    une couleur seule ne dit pas ce qu'elle donnera
                    sur une étiquette. */}
                <span className="tag" style={{ color: trait, background: fond }}>
                  {s.nom || 'Aperçu'}
                </span>
              </span>
            </label>

            <Champ
              libelle="Rang"
              type="number"
              valeur={String(s.rang)}
              poser={(v) => setS((p) => ({ ...p, rang: Number(v) || 0 }))}
              aide="Il ordonne les puces de filtre en haut de l’écran."
            />

            {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

            <Bouton onClick={enregistrer} desactive={enCours}>
              {enCours ? 'Enregistrement…' : edite ? 'Enregistrer' : 'Créer cette catégorie'}
            </Bouton>
          </div>
        </Carte>

        <Etat
          chargement={isPending}
          erreur={error}
          vide={(cats ?? []).length === 0}
          messageVide="Aucune catégorie. Créez-en une ci-dessus."
        >
          {GENRES.map(({ valeur, texte }) => {
            const liste = (cats ?? []).filter((c) => c.genre === valeur);
            if (!liste.length) return null;
            return (
              <div key={valeur} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Surtitre>{texte}</Surtitre>
                <div className="list">
                  {liste.map((c) => (
                    <div key={c.id} className="listrow" style={{ opacity: c.actif ? 1 : 0.55 }}>
                      <button
                        aria-label={`Modifier ${c.nom}`}
                        style={{
                          flexGrow: 1,
                          minWidth: 0,
                          textAlign: 'left',
                          border: 0,
                          background: 'transparent',
                          padding: 0,
                          font: 'inherit',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setEdite(c.id);
                          setS({
                            genre: c.genre,
                            nom: c.nom,
                            couleur: c.couleur,
                            rang: c.rang
                          });
                          setAvis(null);
                        }}
                      >
                        <span
                          className="tag"
                          style={{ color: c.couleur, background: eclaircir(c.couleur) }}
                        >
                          {c.nom}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 12,
                            color: '#59685F',
                            marginTop: 6
                          }}
                        >
                          Rang {c.rang}
                          {c.actif === false ? ' · retirée des listes' : ''}
                        </span>
                      </button>
                      <button
                        className="link"
                        onClick={() => activer.mutate({ id: c.id, actif: c.actif === false })}
                      >
                        {c.actif === false ? 'Remettre' : 'Retirer'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Etat>

        <Filet />

        <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#59685F' }}>
          Une catégorie retirée disparaît des listes de choix et reste sur les actualités et
          les albums qui la portent : une publication ne change pas de rubrique parce que le
          club a réorganisé les siennes. Elle se remet en place d’un appui.
        </p>
      </div>
    </>
  );
}
