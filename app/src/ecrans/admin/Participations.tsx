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
import { Avis, Bouton, Carte, Champ, Choix, Entete, Etat, Surtitre } from '../../ui/base';
import { useActualites, jourEtMois } from '../../services/casier';
import { ariary } from '../../services/participation';
import { useParticipations, usePointerVersement } from '../../services/admin';
import { attendu, reste, useInscrireEnEspeces, verse } from '../../services/validation';
import { useMembres } from '../../services/membres';
import { useSession } from '../../services/session';

export function AdminParticipations() {
  const aller = useNavigate();
  const { data: actus } = useActualites();
  const [sortie, setSortie] = useState<string | null>(null);
  const { data: liste, isPending, error } = useParticipations(sortie ?? undefined);
  const pointer = usePointerVersement();
  const moi = useSession((e) => e.profil);
  const { data: membres } = useMembres();
  const especes = useInscrireEnEspeces();

  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Le formulaire « payé en espèces ». Fermé par défaut : il n'est
     utile qu'au bord du tapis, et l'ouvrir d'office pousserait la
     liste — celle qu'on vient consulter — sous la ligne de flottaison. */
  const [ouvertEspeces, setOuvertEspeces] = useState(false);
  const [qui, setQui] = useState('');
  const [venus, setVenus] = useState('0');
  const [recuEspeces, setRecuEspeces] = useState('');
  const [noteEspeces, setNoteEspeces] = useState('');

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
  const actu = (actus ?? []).find((a) => a.id === sortie) ?? null;
  const prix = actu?.participation_ar ?? null;
  /* Inscrire quelqu'un DÉJÀ validé est réservé à l'auteur de la
     sortie — le serveur le vérifie (migration 0021). L'écran ne
     propose donc pas un bouton qui serait refusé. */
  const jeSuisAuteur = Boolean(actu && moi && actu.auteur_id === moi.id);

  const total = (liste ?? []).reduce((s, p) => s + verse(p.versements), 0);
  const places = (liste ?? []).reduce((s, p) => s + 1 + p.accompagnants, 0);
  const du = (liste ?? []).reduce((s, p) => s + attendu(prix, p.accompagnants), 0);
  const manque = Math.max(0, du - total);

  /* Ceux qui ne sont PAS encore inscrits : proposer quelqu'un qui
     l'est déjà mènerait droit au refus d'unicité de la base. */
  const dejaLa = new Set((liste ?? []).map((p) => p.membre?.numero).filter(Boolean));
  const inscriptibles = (membres ?? []).filter(
    (m) => m.actif !== false && !dejaLa.has(m.numero)
  );

  const inscrireEnEspeces = () => {
    const membre = (membres ?? []).find((m) => m.id === qui);
    if (!membre || !sortie) return;
    setAvis(null);
    especes.mutate(
      {
        actualiteId: sortie,
        profilId: membre.id,
        accompagnants: Number(venus) || 0,
        montantVerse: Number(recuEspeces) || 0,
        note: noteEspeces
      },
      {
        onSuccess: () => {
          setAvis({
            bon: true,
            texte: `${membre.nom} ${membre.prenom} est inscrit${
              Number(recuEspeces) > 0 ? ` et ${ariary(Number(recuEspeces))} sont pointés` : ''
            }.`
          });
          setQui('');
          setVenus('0');
          setRecuEspeces('');
          setNoteEspeces('');
          setOuvertEspeces(false);
        },
        onError: (e) => setAvis({ bon: false, texte: (e as Error).message })
      }
    );
  };

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
            /* Sur une sortie gratuite, « reste 0 Ar » n'apprend rien
               et occupe une case ; on montre alors ce qui a été reçu,
               qui reste vrai dans les deux cas. */
            prix ? [ariary(manque), 'reste dû'] : [ariary(total), 'reçu']
          ].map(([n, l]) => (
            <div key={l} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <p className="display" style={{ fontSize: 17, color: '#0F5132' }}>{n}</p>
              <p style={{ fontSize: 11, color: '#59685F', marginTop: 3 }}>{l}</p>
            </div>
          ))}
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* ------------------------------------------------------
            Inscrire quelqu'un qui a payé EN ESPÈCES.

            « Parfois un membre le paie en espèces, alors on peut
            valider directement la participation dans l'app sans que
            le membre envoie une invitation. »

            C'est le geste ordinaire du samedi matin : on tend un
            billet et on dit « inscris-moi ». Jusqu'ici l'application
            imposait au membre de sortir son téléphone, de s'inscrire,
            puis à l'organisateur de valider — trois gestes pour une
            phrase. L'inscription créée ici est DÉJÀ validée.
            ------------------------------------------------------ */}
        {jeSuisAuteur &&
          (ouvertEspeces ? (
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Surtitre>Inscrire un membre payé en espèces</Surtitre>

                <Choix
                  libelle="Le membre"
                  valeur={qui}
                  poser={setQui}
                  options={inscriptibles.map((m) => ({
                    valeur: m.id,
                    texte: `${m.nom} ${m.prenom} · ${m.numero}`
                  }))}
                  /* Dire POURQUOI la liste est courte évite de
                     chercher un nom qui n'y sera jamais. */
                  aide="Ceux qui sont déjà inscrits n’y figurent pas : pointez leur versement dans la liste ci-dessous."
                />

                <Champ
                  libelle="Accompagnants"
                  type="number"
                  valeur={venus}
                  poser={setVenus}
                  invite="0"
                />

                <Champ
                  libelle="Montant reçu en espèces"
                  type="number"
                  valeur={recuEspeces}
                  poser={setRecuEspeces}
                  invite={prix ? String(prix) : '5000'}
                  /* Zéro est permis, et ce n'est pas un oubli : c'est
                     le cas « il paiera petit à petit ». On l'inscrit
                     maintenant, on pointe les versements ensuite. */
                  aide={
                    prix
                      ? `Attendu : ${ariary(attendu(prix, Number(venus) || 0))}. Laissez vide s’il paiera plus tard.`
                      : 'Laissez vide s’il paiera plus tard.'
                  }
                />

                <Champ
                  libelle="Note"
                  valeur={noteEspeces}
                  poser={setNoteEspeces}
                  aide="Facultatif. « A donné 10 000 au dojo », par exemple."
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <Bouton desactive={!qui || especes.isPending} onClick={inscrireEnEspeces}>
                    {especes.isPending ? 'Enregistrement…' : 'Inscrire et pointer'}
                  </Bouton>
                  <Bouton genre="ghost" onClick={() => setOuvertEspeces(false)}>
                    Annuler
                  </Bouton>
                </div>
              </div>
            </Carte>
          ) : (
            <Bouton genre="ghost" onClick={() => setOuvertEspeces(true)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Icone nom="plus" taille={17} couleur="#0F5132" epaisseur={2} />
                Inscrire un membre payé en espèces
              </span>
            </Bouton>
          ))}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={(liste ?? []).length === 0}
          messageVide="Personne ne s’est encore inscrit."
        >
          {(liste ?? []).map((p) => {
            const recu = verse(p.versements);
            const reliquat = reste(prix, p.accompagnants, p.versements);
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
                    <span style={{ textAlign: 'right' }}>
                      <b
                        className="display"
                        style={{ display: 'block', fontSize: 15, color: '#0F5132' }}
                      >
                        {ariary(recu)}
                      </b>
                      {/* Le reliquat est ce qu'on vient chercher : il
                          ne s'affiche que si la sortie a un prix,
                          sans quoi il vaudrait « −30 000 Ar » pour
                          quelqu'un qui a donné sans qu'on demande. */}
                      {prix != null && prix > 0 && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: 12,
                            marginTop: 2,
                            fontWeight: 600,
                            color: reliquat > 0 ? '#8A3A12' : '#12613C'
                          }}
                        >
                          {reliquat > 0 ? `reste ${ariary(reliquat)}` : 'soldé'}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Le mot laissé en s'inscrivant. Il ne servirait à
                      rien que le membre puisse l'écrire si personne
                      ne le voyait. */}
                  {p.note && (
                    <p
                      style={{
                        fontSize: 12.5,
                        lineHeight: '18px',
                        color: '#3C4A42',
                        background: '#F5F8F6',
                        borderRadius: 10,
                        padding: '8px 10px'
                      }}
                    >
                      « {p.note} »
                    </p>
                  )}

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
                        /* L'invite propose le reliquat : c'est le
                           montant qu'on tape neuf fois sur dix. */
                        invite={reliquat > 0 ? String(reliquat) : '5000'}
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
