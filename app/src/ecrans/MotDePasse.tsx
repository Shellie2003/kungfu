/* ============================================================
   22 · Changer le mot de passe
   ============================================================ */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Avis, Bouton, Carte, Entete } from '../ui/base';
import { seConnecter, supabase } from '../services/supabase';
import { useSession } from '../services/session';

/* Huit caractères, le minimum de Supabase. Exiger davantage ici
   sans le régler sur le serveur ne protégerait de rien : le contrôle
   qui compte est celui que l'application ne peut pas contourner. */
const MINIMUM = 8;

export function MotDePasse() {
  const aller = useNavigate();
  const profil = useSession((e) => e.profil);
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [repete, setRepete] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (!actuel) {
      setAvis({ bon: false, texte: 'Entrez votre mot de passe actuel.' });
      return;
    }
    if (nouveau.length < MINIMUM) {
      setAvis({ bon: false, texte: `Le mot de passe doit faire au moins ${MINIMUM} caractères.` });
      return;
    }
    if (nouveau !== repete) {
      setAvis({ bon: false, texte: 'Les deux saisies ne sont pas identiques.' });
      return;
    }
    setEnCours(true);

    /* Le mot de passe actuel est VÉRIFIÉ, pas seulement demandé.
       Supabase ne le contrôle pas de lui-même : updateUser accepte
       n'importe quel nouveau mot de passe dès qu'une session est
       ouverte. Un téléphone laissé déverrouillé quelques minutes
       suffirait donc à s'emparer du compte. On se reconnecte avec
       ce qui a été saisi ; si cela échoue, on s'arrête là. */
    if (profil) {
      const controle = await seConnecter(profil.numero, actuel);
      if (!controle.ok) {
        setEnCours(false);
        setAvis({ bon: false, texte: 'Le mot de passe actuel est incorrect.' });
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: nouveau });
    setEnCours(false);
    if (error) {
      setAvis({ bon: false, texte: 'Le changement a échoué. Réessayez, ou prévenez le club.' });
      return;
    }
    setAvis({ bon: true, texte: 'Mot de passe changé.' });
    setActuel('');
    setNouveau('');
    setRepete('');
  }

  return (
    <>
      <Entete titre="Mot de passe" retour={() => aller(-1)} />

      <form
        onSubmit={envoyer}
        style={{ flexGrow: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 22 }}
      >
        <Carte>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label className="field">
              <span className="field__label">Mot de passe actuel</span>
              <input
                className="input"
                type="password"
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="field">
              <span className="field__label">Nouveau mot de passe</span>
              <input
                className="input"
                type="password"
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="field">
              <span className="field__label">Répéter le nouveau</span>
              <input
                className="input"
                type="password"
                value={repete}
                onChange={(e) => setRepete(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>
        </Carte>

        {/* « Avis » distingue le succès de l'échec : role="status"
            pour l'un, role="alert" pour l'autre. Tout annoncer comme
            une alerte fait entendre « Mot de passe changé » sur le
            ton d'une erreur. */}
        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        <Bouton type="submit" desactive={enCours}>
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </Bouton>

        <Carte
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            background: '#E8F1EC',
            borderColor: '#C4D9CC'
          }}
        >
          <Icone nom="key" taille={19} couleur="#0F5132" />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, lineHeight: '19px', color: '#12613C' }}>
              Mot de passe oublié
            </p>
            <p
              style={{
                fontSize: 12.5,
                lineHeight: '18px',
                color: '#12613C',
                marginTop: 4
              }}
            >
              Adressez-vous à l’administration du club : elle le réinitialise depuis son écran.
              Il n’y a pas d’envoi par courriel, puisque la connexion se fait au numéro
              matricule.
            </p>
          </div>
        </Carte>
      </form>
    </>
  );
}
