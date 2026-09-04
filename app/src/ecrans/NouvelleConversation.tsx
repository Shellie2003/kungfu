/* ============================================================
   Commencer une conversation à deux.

   L'écran choisit la personne ; c'est la BASE qui décide si la
   conversation peut s'ouvrir. Reproduire ici la règle des mineurs
   la mettrait à deux endroits, et les deux finiraient par différer.
   L'écran se contente donc de montrer clairement le refus quand il
   vient.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Avis, Carte, Entete, Etat, Grade, Portrait } from '../ui/base';
import { useMembres } from '../services/membres';
import { useUrls } from '../services/stockage';
import { correspond } from '../services/texte';
import { useOuvrirDirect } from '../services/messagerie';
import { useSession } from '../services/session';

export function NouvelleConversation() {
  const aller = useNavigate();
  const moi = useSession((e) => e.profil);
  const { data: membres, isPending, error } = useMembres();
  const ouvrir = useOuvrirDirect();
  const portraits = useUrls('portraits', (membres ?? []).map((m) => m.photo));
  const [q, setQ] = useState('');
  const [refus, setRefus] = useState<string | null>(null);

  const liste = useMemo(
    () =>
      (membres ?? []).filter(
        (m) => m.id !== moi?.id && correspond(q, m.nom, m.prenom)
      ),
    [membres, q, moi]
  );

  return (
    <>
      <Entete titre="Nouvelle conversation" retour={() => aller('/messages')} />

      <div style={{ padding: '16px 20px 0' }}>
        <div className="searchbar">
          <Icone nom="search" taille={19} couleur="#7C8B82" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="À qui voulez-vous écrire"
            aria-label="À qui voulez-vous écrire"
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
        {refus && <Avis bon={false}>{refus}</Avis>}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Personne ne correspond."
        >
          {liste.map((m) => (
            <button
              key={m.id}
              className="card studentrow"
              disabled={ouvrir.isPending}
              onClick={() => {
                setRefus(null);
                ouvrir.mutate(m.id, {
                  onSuccess: (salonId) => aller(`/messages/${salonId}`),
                  /* Le message vient de la base — « une conversation
                     privée entre élèves demande que les deux soient
                     majeurs ». Le réécrire ici le ferait diverger de
                     la règle le jour où le club la change. */
                  onError: (e) => setRefus((e as Error).message)
                });
              }}
            >
              <Portrait taille={44} rayon={12} photo={m.photo ? portraits[m.photo] : null} />
              <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{m.nom}</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#3C4A42' }}>
                  {m.prenom}
                </span>
                {m.grade && (
                  <span style={{ display: 'block', marginTop: 6 }}>
                    <Grade nom={m.grade.nom} couleur={m.grade.couleur} />
                  </span>
                )}
              </span>
              <Icone nom="chat" taille={18} couleur="#A8B6AE" />
            </button>
          ))}
        </Etat>

        {/* ---- CE QUE CETTE CARTE DIT, ET POURQUOI ELLE A CHANGÉ ----

            Elle annonçait « entre élèves, la conversation privée
            demande que les deux soient majeurs ». Le club a tranché :
            chacun écrit à chacun.

            Le texte ne se contente donc pas de retirer la
            restriction, il dit ce qui protège MAINTENANT. Ce n'est
            plus la même chose : avant, la conversation n'existait
            pas ; maintenant elle existe et c'est le signalement qui
            veille. Un mur ne demande à personne d'être attentif ; un
            signalement, si — et le club compte des mineurs. */}
        <Carte style={{ background: 'var(--vert-clair)', borderColor: '#C4D9CC' }}>
          <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#12613C' }}>
            Vous pouvez écrire à n’importe quel membre du club. Ce que vous vous dites à
            deux n’est lu que par vous deux — pas même par l’administration. En cas de
            propos déplacés, l’appui long sur un message permet de le signaler aux maîtres.
          </p>
        </Carte>
      </div>
    </>
  );
}
