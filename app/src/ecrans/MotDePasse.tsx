/* ============================================================
   22 · Changer le mot de passe
   ============================================================ */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Bouton, Carte, Entete } from '../ui/base';
import { supabase } from '../services/supabase';

/* Huit caractères, le minimum de Supabase. Exiger davantage ici
   sans le régler sur le serveur ne protégerait de rien : le contrôle
   qui compte est celui que l'application ne peut pas contourner. */
const MINIMUM = 8;

export function MotDePasse() {
  const aller = useNavigate();
  const [nouveau, setNouveau] = useState('');
  const [repete, setRepete] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (nouveau.length < MINIMUM) {
      setAvis({ bon: false, texte: `Le mot de passe doit faire au moins ${MINIMUM} caractères.` });
      return;
    }
    if (nouveau !== repete) {
      setAvis({ bon: false, texte: 'Les deux saisies ne sont pas identiques.' });
      return;
    }
    setEnCours(true);
    const { error } = await supabase.auth.updateUser({ password: nouveau });
    setEnCours(false);
    if (error) {
      setAvis({ bon: false, texte: 'Le changement a échoué. Réessayez, ou prévenez le club.' });
      return;
    }
    setAvis({ bon: true, texte: 'Mot de passe changé.' });
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

        {avis && (
          <p
            role="alert"
            style={{ fontSize: 13, lineHeight: '19px', color: avis.bon ? '#12613C' : '#B3341A' }}
          >
            {avis.texte}
          </p>
        )}

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
