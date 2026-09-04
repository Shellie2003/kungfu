/* ============================================================
   01 · Connexion

   L'écran ne sait ni router ni parler au serveur : il reçoit
   « connecter » et rend le résultat. C'est ce qui permet de le
   regarder isolément, et ce qui a rattrapé une erreur du côté
   React Native — un écran qui importait le service tirait avec lui
   tout le coffre du téléphone et ne s'affichait plus.
   ============================================================ */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Emblem } from '../ui/Emblem';
import type { ResultatConnexion } from '../services/supabase';

export function Connexion({
  connecter,
  /* Absent presque toujours, et c'est voulu : le club n'a qu'UNE
     fondation. Le lien n'apparaît que si la base répond que la porte
     est encore ouverte — l'écran ne décide pas, il affiche. */
  fonder
}: {
  connecter: (matricule: string, motDePasse: string) => Promise<ResultatConnexion>;
  fonder?: () => void;
}) {
  const [matricule, setMatricule] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (enCours) return;
    setEnCours(true);
    setErreur(null);
    const r = await connecter(matricule, motDePasse);
    if (!r.ok) {
      setErreur(r.message);
      setEnCours(false);
    }
    /* Si c'est réussi, on ne relâche pas « enCours » : l'écoute de
       session remplace l'écran. Le relâcher ferait clignoter le
       bouton juste avant qu'il disparaisse. */
  }

  return (
    /* L'écran de connexion n'a ni barre de titre ni onglets : c'est le
       seul rembourrage qui le sépare de l'encoche et de la barre de
       gestes. */
    <div
      className="phone phone--green"
      style={{
        padding:
          'env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
          padding: '60px 0'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center'
          }}
        >
          <Emblem grand taille={38} />
          <div>
            <p className="display" style={{ fontSize: 21, color: '#FFF', lineHeight: '26px' }}>
              Kung-fu Waishi
            </p>
            <p style={{ fontSize: 14, color: 'var(--sur-vert)', marginTop: 4 }}>Analamahitsy</p>
          </div>
        </div>

        <form
          onSubmit={envoyer}
          style={{
            background: '#FFF',
            borderRadius: 20,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}
        >
          <p style={{ fontSize: 17, fontWeight: 700 }}>Connexion membre</p>

          <label className="field">
            <span className="field__label">Numéro de membre</span>
            <input
              className="input"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="F04x042"
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="username"
              inputMode="text"
              disabled={enCours}
            />
          </label>

          <label className="field">
            <span className="field__label">Mot de passe</span>
            <input
              className="input"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              disabled={enCours}
            />
          </label>

          {/* Le message d'erreur est annoncé aux lecteurs d'écran :
              sans « role », un aveugle voit le bouton ne rien faire. */}
          {erreur && (
            <p role="alert" style={{ fontSize: 13, lineHeight: '19px', color: '#B3341A' }}>
              {erreur}
            </p>
          )}

          <button className="btn btn--primary" type="submit" disabled={enCours}>
            {enCours ? 'Connexion…' : 'Entrer'}
          </button>

          {/* LE PREMIER JOUR DU CLUB, ET LUI SEUL.

              « Demandez au responsable » n'a pas de sens tant qu'il
              n'y a pas de responsable : c'est exactement la situation
              de quelqu'un qui vient d'installer l'application sur une
              base vide. Les deux messages sont donc exclusifs. */}
          {fonder ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#59685F', lineHeight: '19px' }}>
                Ce club n’a pas encore d’administrateur.
              </p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={fonder}
                disabled={enCours}
                style={{ marginTop: 10 }}
              >
                Créer le compte du club
              </button>
            </div>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: '#59685F',
                textAlign: 'center',
                lineHeight: '19px'
              }}
            >
              Première connexion ou mot de passe oublié ?
              <br />
              <span style={{ color: '#12613C', fontWeight: 600 }}>
                Demandez au responsable du club.
              </span>
            </p>
          )}
        </form>

        <p
          style={{
            fontSize: 12,
            color: '#9BC0AC',
            textAlign: 'center',
            lineHeight: '18px'
          }}
        >
          Chaque membre possède son propre compte.
          <br />
          Seule l’administration peut modifier les fiches.
        </p>
      </div>
    </div>
  );
}
