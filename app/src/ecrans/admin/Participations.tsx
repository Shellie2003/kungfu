/* ============================================================
   Administration · Qui vient, et qui a versé

   L'écran « Je participe » montre au membre ce que le club a
   « pointé ». Personne ne pouvait le pointer : la colonne existait,
   la règle d'accès aussi, et l'écran manquait.

   Pourquoi c'est l'administration qui pointe, et jamais le membre :
   l'application ne parle pas à l'opérateur, elle ouvre le clavier
   avec le code MVola. Elle ne peut donc PAS savoir si le transfert a
   abouti. Laisser chacun déclarer son versement reviendrait à
   demander au club de croire sur parole — et c'est exactement le
   trou qu'un test de sécurité avait trouvé.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Carte, Champ, Entete, Etat, Surtitre } from '../../ui/base';
import { useActualites, jourEtMois } from '../../services/casier';
import { ariary } from '../../services/participation';
import { useParticipations, usePointerVersement } from '../../services/admin';

export function AdminParticipations() {
  const aller = useNavigate();
  const { data: actus } = useActualites();
  const [sortie, setSortie] = useState<string | null>(null);
  const { data: liste, isPending, error } = useParticipations(sortie ?? undefined);
  const pointer = usePointerVersement();

  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  /* --- Choisir la sortie --- */
  if (!sortie) {
    return (
      <>
        <Entete titre="Participations" retour={() => aller('/admin')} />
        <div
          style={{
            flexGrow: 1, padding: '18px 20px 28px',
            display: 'flex', flexDirection: 'column', gap: 12
          }}
        >
          <Surtitre>De quelle sortie</Surtitre>
          <div className="list">
            {(actus ?? []).map((a) => {
              const { jour, mois } = jourEtMois(a.date_evt ?? a.cree_le);
              return (
                <button key={a.id} className="listrow" onClick={() => setSortie(a.id)}>
                  <span className="datebox">
                    <b>{jour}</b>
                    <i>{mois}</i>
                  </span>
                  <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                    <b style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>{a.titre}</b>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                      {a.categorie}
                    </span>
                  </span>
                  <Icone nom="chev" taille={17} couleur="#A8B6AE" epaisseur={2} />
                </button>
              );
            })}
            {actus && actus.length === 0 && (
              <div className="listrow">
                <span style={{ fontSize: 13, color: '#59685F' }}>
                  Aucune actualité : publiez-en une d’abord.
                </span>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* --- Pointer --- */
  const total = (liste ?? []).reduce(
    (s, p) => s + p.versements.reduce((v, x) => v + x.montant, 0),
    0
  );
  const places = (liste ?? []).reduce((s, p) => s + 1 + p.accompagnants, 0);

  return (
    <>
      <Entete titre="Participations" retour={() => setSortie(null)} />

      <div
        style={{
          flexGrow: 1, padding: '18px 20px 28px',
          display: 'flex', flexDirection: 'column', gap: 20
        }}
      >
        <div className="stats">
          {[
            [String(liste?.length ?? 0), 'inscrits'],
            [String(places), 'places'],
            [ariary(total), 'reçu']
          ].map(([n, l]) => (
            <div key={l} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <p className="display" style={{ fontSize: 17, color: '#0F5132' }}>{n}</p>
              <p style={{ fontSize: 11, color: '#59685F', marginTop: 3 }}>{l}</p>
            </div>
          ))}
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={(liste ?? []).length === 0}
          messageVide="Personne ne s’est encore inscrit."
        >
          {(liste ?? []).map((p) => {
            const recu = p.versements.reduce((s, v) => s + v.montant, 0);
            return (
              <Carte key={p.id} pad={16}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flexGrow: 1, minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>
                        {p.membre ? `${p.membre.nom} ${p.membre.prenom}` : 'Membre inconnu'}
                      </b>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                        {p.membre?.numero}
                        {p.accompagnants > 0 && ` · +${p.accompagnants} accompagnant${p.accompagnants > 1 ? 's' : ''}`}
                      </span>
                    </span>
                    <b className="display" style={{ fontSize: 15, color: '#0F5132' }}>
                      {ariary(recu)}
                    </b>
                  </div>

                  {p.versements.length > 0 && (
                    <p style={{ fontSize: 12, color: '#7C8B82' }}>
                      {p.versements
                        .map((v) => `${ariary(v.montant)} le ${new Date(v.recu_le).toLocaleDateString('fr-FR')}`)
                        .join(' · ')}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                      <Champ
                        libelle={`Montant reçu de ${p.membre?.prenom ?? 'ce membre'}`}
                        type="number"
                        valeur={saisie[p.id] ?? ''}
                        poser={(v) => setSaisie((s) => ({ ...s, [p.id]: v }))}
                        invite="5000"
                      />
                    </div>
                    <button
                      className="btn btn--primary"
                      style={{ width: 'auto', padding: '0 18px' }}
                      disabled={!Number(saisie[p.id]) || pointer.isPending}
                      onClick={() =>
                        pointer.mutate(
                          { participationId: p.id, montant: Number(saisie[p.id]) },
                          {
                            onSuccess: () => {
                              setAvis({ bon: true, texte: 'Versement pointé.' });
                              setSaisie((s) => ({ ...s, [p.id]: '' }));
                            },
                            onError: (e) =>
                              setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
                          }
                        )
                      }
                    >
                      Pointer
                    </button>
                  </div>
                </div>
              </Carte>
            );
          })}
        </Etat>

        <div className="warn">
          <i />
          <p>
            On pointe ce qu’on a <b>reçu</b>, pas ce qui a été promis. L’application ne parle
            pas à l’opérateur : elle ouvre le clavier avec le code MVola, et ne sait pas si le
            transfert a abouti. C’est pour cela que seule l’administration inscrit un
            versement — un membre qui le ferait lui-même se pointerait à crédit.
          </p>
        </div>
      </div>
    </>
  );
}
