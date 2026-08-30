/* ============================================================
   La modération — les signalements remontés aux maîtres.

   Le signalement s'enregistrait déjà, et personne ne le lisait.
   C'était le pire des deux mondes : l'application promettait une
   modération à des parents dont les enfants sont mineurs, et la
   promesse tombait dans un trou.

   Qui y accède : les maîtres et l'administration. Ce n'est pas cet
   écran qui le décide — la règle « je vois mes signalements » de la
   base rend à un élève ses propres signalements et rien d'autre. Un
   élève qui atteindrait cette adresse verrait donc les siens, ce
   qui est exact et sans danger.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Avis, Carte, Entete, Etat, Puce, Surtitre } from '../ui/base';
import { depuis } from '../services/casier';
import { useClasser, useMasquerMessage, useSignalements } from '../services/moderation';
import { useSession } from '../services/session';

export function Moderation() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const [traites, setTraites] = useState(false);
  const { data: liste, isPending, error } = useSignalements(traites);
  const masquer = useMasquerMessage();
  const classer = useClasser();
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  const echec = (e: unknown) =>
    setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` });

  return (
    <>
      <Entete titre="Signalements" retour={() => aller('/messages')} />

      <div className="chips">
        <Puce texte="À traiter" actif={!traites} onClick={() => setTraites(false)} />
        <Puce texte="Traités" actif={traites} onClick={() => setTraites(true)} />
      </div>

      <div
        style={{
          flexGrow: 1, padding: '14px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 16
        }}
      >
        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={(liste ?? []).length === 0}
          messageVide={traites ? 'Aucun signalement traité.' : 'Aucun signalement en attente.'}
        >
          {(liste ?? []).map((s) => (
            <Carte key={s.id} pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icone nom="flag" taille={18} couleur="#B0530F" />
                  <span style={{ flexGrow: 1, fontSize: 13, fontWeight: 700 }}>
                    Signalé par {s.auteur ? `${s.auteur.nom} ${s.auteur.prenom}` : 'un membre'}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#8A978F' }}>{depuis(s.cree_le)}</span>
                </div>

                <p style={{ fontSize: 13.5, lineHeight: '19px', color: '#59685F' }}>
                  Motif : {s.motif}
                </p>

                {/* Le message en cause, tel qu'il est. Le résumer ou
                    le tronquer obligerait à ouvrir le salon pour
                    juger, et l'on jugerait donc rarement. */}
                <div
                  className="bul bul--recu"
                  style={{ maxWidth: '100%', alignSelf: 'stretch' }}
                >
                  {s.message?.auteur && (
                    <b className="bul__auteur">
                      {s.message.auteur.nom} {s.message.auteur.prenom}
                    </b>
                  )}
                  <p className="bul__txt">
                    {s.message?.supprime_le
                      ? 'Message déjà retiré.'
                      : (s.message?.texte ?? 'Message introuvable.')}
                  </p>
                </div>

                {s.traite_le ? (
                  <p style={{ fontSize: 12.5, color: '#12613C' }}>
                    Traité {depuis(s.traite_le)}
                    {s.suite ? ` · ${s.suite}` : ''}
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn--ghost"
                      style={{ flex: 1 }}
                      disabled={classer.isPending}
                      onClick={() =>
                        moi &&
                        classer.mutate(
                          { id: s.id, parId: moi.id, suite: 'Classé sans suite' },
                          {
                            onSuccess: () => setAvis({ bon: true, texte: 'Classé sans suite.' }),
                            onError: echec
                          }
                        )
                      }
                    >
                      Classer sans suite
                    </button>
                    <button
                      className="btn btn--primary"
                      style={{ flex: 1 }}
                      disabled={masquer.isPending || !s.message || Boolean(s.message.supprime_le)}
                      onClick={() =>
                        moi &&
                        s.message &&
                        masquer.mutate(
                          { messageId: s.message.id, signalementId: s.id, parId: moi.id },
                          {
                            onSuccess: () =>
                              setAvis({ bon: true, texte: 'Message retiré du fil.' }),
                            onError: echec
                          }
                        )
                      }
                    >
                      Retirer le message
                    </button>
                  </div>
                )}
              </div>
            </Carte>
          ))}
        </Etat>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ce que « retirer » fait</Surtitre>
          <Carte style={{ background: 'var(--vert-clair)', borderColor: '#C4D9CC' }}>
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#12613C' }}>
              Le message disparaît du fil, remplacé par « Message retiré ». Il n’est pas
              effacé de la base : le club garde de quoi expliquer sa décision à un parent, et
              de quoi revenir dessus si le signalement était abusif.
            </p>
          </Carte>
        </div>
      </div>
    </>
  );
}
