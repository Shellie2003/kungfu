/* ============================================================
   01b · Fondation — le tout premier compte du club.

   Cet écran n'apparaît QU'UNE FOIS dans la vie du club, et pour une
   seule personne : celui qui installe l'application. Après lui,
   l'inscription est fermée et cet écran n'existe plus — la migration
   0024 le verrouille dans la base, pas ici.

   ------------------------------------------------------------
   POURQUOI IL EXISTE

   Tout compte est créé par l'administration depuis l'application.
   C'est vrai des soixante-quatre membres, et c'est circulaire pour
   le premier : personne ne peut créer le compte de celui qui crée
   les comptes. Il fallait ouvrir le tableau de bord Supabase et
   écrire du SQL à la main.

   ------------------------------------------------------------
   CE QUE L'ÉCRAN NE FAIT PAS

   Il ne demande PAS le numéro de membre : c'est la base qui
   l'attribue, comme pour tous les autres, et elle le renvoie
   ensuite. Le demander ici laisserait choisir « F04x999 » à quelqu'un
   qui n'a pas de raison de savoir ce que le club met derrière ce
   numéro.

   Il ne demande pas non plus de courriel : le club se connecte par
   matricule. L'adresse est composée à partir du numéro et n'est
   jamais affichée — c'est un identifiant, pas un moyen de contact.
   ============================================================ */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Emblem } from '../ui/Emblem';
import { MINIMUM_MOT_DE_PASSE, useFonder } from '../services/fondation';
import type { ResultatConnexion } from '../services/supabase';

export function Fondation({
  connecter,
  revenir
}: {
  connecter: (matricule: string, motDePasse: string) => Promise<ResultatConnexion>;
  revenir: () => void;
}) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  /* Le numéro attribué par la base. Sa présence fait basculer
     l'écran : le formulaire disparaît, la confirmation le remplace. */
  const [numero, setNumero] = useState<string | null>(null);
  const [entree, setEntree] = useState(false);

  const fonder = useFonder();

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (fonder.isPending) return;
    setErreur(null);

    /* Les trois contrôles se font aussi sur le serveur. Ici, ils
       évitent un aller-retour pour une faute qu'on voit tout de
       suite ; là-bas, ils décident. */
    if (!nom.trim() || !prenom.trim()) {
      setErreur('Entrez votre nom et votre prénom.');
      return;
    }
    if (motDePasse.length < MINIMUM_MOT_DE_PASSE) {
      setErreur(`Le mot de passe doit faire au moins ${MINIMUM_MOT_DE_PASSE} caractères.`);
      return;
    }
    /* La confirmation n'est pas une formalité : ce mot de passe ne se
       réinitialise par personne. Il n'y a pas encore d'administration
       pour le faire — c'est justement celle qu'on est en train de
       créer. Une faute de frappe ici enfermerait le club dehors. */
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne sont pas identiques.');
      return;
    }

    const r = await fonder.mutateAsync({
      nom: nom.trim(),
      prenom: prenom.trim(),
      motDePasse
    });
    if (r.ok) setNumero(r.numero);
    else setErreur(r.message);
  }

  async function entrer() {
    if (!numero || entree) return;
    setEntree(true);
    const r = await connecter(numero, motDePasse);
    if (!r.ok) {
      /* Le compte EXISTE — la fondation a réussi. Seule la connexion
         a échoué, et c'est presque toujours le réseau. On renvoie
         donc vers l'écran de connexion ordinaire plutôt que de
         laisser croire qu'il faut recommencer. */
      setErreur(r.message);
      setEntree(false);
    }
  }

  return (
    <div
      className="phone phone--green"
      style={{
        padding: 'env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px)'
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

        {numero ? (
          /* ---------------------------------------------- C'est fait.

             Le numéro passe avant tout le reste, en grand : c'est la
             seule chose de cet écran qu'il faut retenir, et il ne
             sera plus jamais affiché ainsi. */
          <div
            style={{
              background: '#FFF',
              borderRadius: 20,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 700 }}>Le club est créé</p>

            <div>
              <p style={{ fontSize: 13, color: '#59685F' }}>Votre numéro de membre</p>
              <p
                className="display"
                style={{ fontSize: 30, color: '#12613C', marginTop: 6, letterSpacing: 1 }}
              >
                {numero}
              </p>
            </div>

            <p style={{ fontSize: 13, lineHeight: '19px', color: '#59685F' }}>
              Notez-le : c’est avec ce numéro, et non avec votre nom, que vous vous
              connecterez. Votre mot de passe ne peut être réinitialisé par personne
              d’autre que vous.
            </p>

            {erreur && (
              <p role="alert" style={{ fontSize: 13, lineHeight: '19px', color: '#B3341A' }}>
                {erreur}
              </p>
            )}

            <button className="btn btn--primary" onClick={entrer} disabled={entree}>
              {entree ? 'Connexion…' : 'Entrer dans l’application'}
            </button>
          </div>
        ) : (
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
            <div>
              <p style={{ fontSize: 17, fontWeight: 700 }}>Créer le compte du club</p>
              <p style={{ fontSize: 13, lineHeight: '19px', color: '#59685F', marginTop: 6 }}>
                Ce premier compte est celui du responsable : il crée tous les autres.
                Une fois créé, cette page disparaît définitivement.
              </p>
            </div>

            <label className="field">
              <span className="field__label">Nom</span>
              <input
                className="input"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoCapitalize="characters"
                autoCorrect="off"
                disabled={fonder.isPending}
              />
            </label>

            <label className="field">
              <span className="field__label">Prénom</span>
              <input
                className="input"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoCapitalize="words"
                autoCorrect="off"
                disabled={fonder.isPending}
              />
            </label>

            <label className="field">
              <span className="field__label">Mot de passe</span>
              <input
                className="input"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="new-password"
                disabled={fonder.isPending}
              />
            </label>

            <label className="field">
              <span className="field__label">Confirmer le mot de passe</span>
              <input
                className="input"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="new-password"
                disabled={fonder.isPending}
              />
            </label>

            {erreur && (
              <p role="alert" style={{ fontSize: 13, lineHeight: '19px', color: '#B3341A' }}>
                {erreur}
              </p>
            )}

            <button className="btn btn--primary" type="submit" disabled={fonder.isPending}>
              {fonder.isPending ? 'Création…' : 'Créer le compte'}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={revenir}
              disabled={fonder.isPending}
            >
              J’ai déjà un compte
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
