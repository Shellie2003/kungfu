/* ============================================================
   Administration · Les inscriptions à valider

   « Pour la participation d'une sortie, ajouter un écran pour
   visualiser les participations en attente d'une validation, et
   seul l'admin qui a créé la sortie qui peut le voir et valider. »

   ------------------------------------------------------------
   POURQUOI L'AUTEUR, ET PAS « L'ADMINISTRATION »

   La demande est explicite, et elle a du sens : celui qui organise
   la sortie sait combien de places il reste dans le taxi-brousse,
   qui a déjà versé, et qui il attend. Un autre administrateur
   validerait sans savoir.

   Ce qui le fait respecter n'est PAS cet écran — c'est une règle
   d'accès et un déclencheur, dans la migration 0020. L'écran ne fait
   que ne pas proposer ce qui serait refusé.

   ------------------------------------------------------------
   GROUPÉ PAR SORTIE

   Une liste à plat de trente inscriptions ne dit rien : on valide
   une sortie, pas une ligne. Regroupées, on voit d'un coup d'œil
   « douze pour le lac, deux pour le championnat », et l'on décide
   avec le nombre sous les yeux — c'est justement le nombre qui
   décide, quand il y a un taxi-brousse à remplir.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Champ, Entete, Etat, Surtitre } from '../../ui/base';
import { useAValider, useTrancher } from '../../services/validation';
import type { EnAttente } from '../../services/validation';
import { ariary } from '../../services/participation';
import { dateLongue } from '../../services/casier';

export function AdminAValider() {
  const aller = useNavigate();
  const { data: liste, isPending, error } = useAValider();
  const trancher = useTrancher();

  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* L'inscription qu'on s'apprête à refuser, et le motif en cours de
     saisie. Refuser sans rien dire laisse quelqu'un sans réponse au
     bord du tapis ; on propose donc d'écrire pourquoi, sans
     l'exiger. */
  const [refus, setRefus] = useState<{ id: string; qui: string } | null>(null);
  const [motif, setMotif] = useState('');

  /* Groupées par sortie, dans l'ordre où elles se sont inscrites. */
  const parSortie = new Map<string, { titre: string; date: string | null; gens: EnAttente[] }>();
  for (const p of liste ?? []) {
    const cle = p.actualite_id;
    if (!parSortie.has(cle)) {
      parSortie.set(cle, {
        titre: p.sortie?.titre ?? 'Sortie',
        date: p.sortie?.date_evt ?? null,
        gens: []
      });
    }
    parSortie.get(cle)!.gens.push(p);
  }

  const decider = (id: string, qui: string, accepter: boolean, motifRefus?: string) => {
    setAvis(null);
    trancher.mutate(
      { id, accepter, motif: motifRefus },
      {
        onSuccess: () => {
          setRefus(null);
          setMotif('');
          setAvis({
            bon: true,
            texte: accepter ? `${qui} est inscrit.` : `L’inscription de ${qui} est refusée.`
          });
        },
        onError: (e) => setAvis({ bon: false, texte: (e as Error).message })
      }
    );
  };

  return (
    <>
      <Entete titre="Inscriptions à valider" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={(liste ?? []).length === 0}
          /* Le message dit POURQUOI c'est vide, ce qui n'est pas la
             même chose que « rien à afficher » : un administrateur
             qui n'a créé aucune sortie verrait sinon un écran mort et
             croirait à une panne. */
          messageVide="Aucune inscription en attente sur les sorties que vous avez créées."
        >
          {[...parSortie.entries()].map(([id, sortie]) => (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="rowhead">
                <Surtitre>{sortie.titre}</Surtitre>
                <span style={{ fontSize: 12, color: '#7C8B82' }}>
                  {sortie.gens.length} en attente
                </span>
              </div>

              {sortie.date && (
                <p style={{ fontSize: 12.5, color: '#59685F', marginTop: -6 }}>
                  {dateLongue(sortie.date)}
                </p>
              )}

              {sortie.gens.map((p) => {
                const qui = p.membre ? `${p.membre.nom} ${p.membre.prenom}` : 'Membre inconnu';
                return (
                  <Carte key={p.id} pad={16}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700 }}>{qui}</p>
                        <p style={{ fontSize: 12.5, color: '#59685F', marginTop: 2 }}>
                          {p.membre?.numero}
                        </p>
                      </div>

                      <div className="deflist">
                        {p.accompagnants > 0 && (
                          <div>
                            <span
                              style={{ width: 130, flex: 'none', color: '#0E2119', fontWeight: 600 }}
                            >
                              Accompagnants
                            </span>
                            <span style={{ flexGrow: 1 }}>{p.accompagnants}</span>
                          </div>
                        )}
                        {p.montant_promis != null && (
                          <div>
                            <span
                              style={{ width: 130, flex: 'none', color: '#0E2119', fontWeight: 600 }}
                            >
                              Promis
                            </span>
                            <span style={{ flexGrow: 1 }}>{ariary(p.montant_promis)}</span>
                          </div>
                        )}
                      </div>

                      {/* Le mot laissé en s'inscrivant. C'est souvent
                          lui qui décide — « je viens avec ma sœur qui
                          n'est pas membre » demande une place de
                          plus. */}
                      {p.note && (
                        <p
                          style={{
                            fontSize: 13.5,
                            lineHeight: '19px',
                            color: '#3C4A42',
                            background: '#F1F6F3',
                            borderRadius: 10,
                            padding: '10px 12px'
                          }}
                        >
                          {p.note}
                        </p>
                      )}

                      {refus?.id === p.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <Champ
                            libelle="Motif du refus"
                            valeur={motif}
                            poser={setMotif}
                            aide="Facultatif, et lu par le membre. Un refus sans raison ne s’explique pas au bord du tapis."
                          />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Bouton
                              genre="ghost"
                              desactive={trancher.isPending}
                              onClick={() => decider(p.id, qui, false, motif)}
                            >
                              {trancher.isPending ? 'Envoi…' : 'Confirmer le refus'}
                            </Bouton>
                            <Bouton
                              onClick={() => {
                                setRefus(null);
                                setMotif('');
                              }}
                            >
                              Annuler
                            </Bouton>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Bouton
                            desactive={trancher.isPending}
                            onClick={() => decider(p.id, qui, true)}
                          >
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                            >
                              <Icone nom="shieldCheck" taille={17} couleur="#FFF" />
                              Valider
                            </span>
                          </Bouton>
                          <Bouton
                            genre="ghost"
                            desactive={trancher.isPending}
                            onClick={() => {
                              setRefus({ id: p.id, qui });
                              setMotif('');
                              setAvis(null);
                            }}
                          >
                            Refuser
                          </Bouton>
                        </div>
                      )}
                    </div>
                  </Carte>
                );
              })}
            </div>
          ))}
        </Etat>

        <div className="warn">
          <i />
          <p>
            Vous ne voyez ici que les sorties que <b>vous</b> avez publiées. C’est une règle du
            serveur, pas de cet écran : un autre administrateur ne peut ni les voir ni les
            valider, parce que c’est vous qui savez combien de places il reste.
          </p>
        </div>
      </div>
    </>
  );
}
