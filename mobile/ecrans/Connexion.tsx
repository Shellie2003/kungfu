/* ============================================================
   Écran 01 · Connexion

   Le membre saisit son numéro matricule — F04x042 — et son mot de
   passe. L'adresse envoyée au service d'authentification est
   composée à partir du numéro : voir services/supabase.ts.

   La vue ne connaît NI le routage NI le serveur.

   La redirection après une connexion réussie est faite par
   app/index.tsx, qui écoute la session. Et la fonction qui
   authentifie arrive en paramètre : c'est la route qui branche
   services/supabase. Sans cela, rendre cet écran seul — dans
   l'aperçu web ou dans la comparaison — chargerait
   expo-secure-store, un module natif qui n'existe pas dans un
   navigateur, et l'écran resterait blanc.
   ============================================================ */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Champ, Bouton } from '../composants/base';
import { couleurs } from '../theme/tokens';
import { texte } from '../theme/typo';

export type Resultat = { ok: true } | { ok: false; message: string };
export type Connecter = (matricule: string, motDePasse: string) => Promise<Resultat>;

/* Le logo du club, produit depuis img/logo.jpg par
   outils/images-app.mjs. */
const LOGO = require('../assets/logo.png');

export default function Connexion({ connecter }: { connecter: Connecter }) {
  const [numero, setNumero] = React.useState('');
  const [motDePasse, setMotDePasse] = React.useState('');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, setEnCours] = React.useState(false);

  async function entrer() {
    if (enCours) return;
    setErreur(null);
    setEnCours(true);
    const r = await connecter(numero, motDePasse);
    setEnCours(false);
    if (!r.ok) setErreur(r.message);
    /* En cas de succès on ne navigue pas : l'écoute de session
       change l'état, et la racine redirige. Naviguer ici ferait
       deux sources de vérité pour une seule question. */
  }

  return (
    <KeyboardAvoidingView
      style={s.ecran}
      /* Sans cela, le clavier recouvre le champ mot de passe sur
         les téléphones à petit écran. */
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.corps} keyboardShouldPersistTaps="handled">
        <View style={s.marque}>
          <View style={s.emblem}>
            <Image source={LOGO} style={s.logo} accessibilityIgnoresInvertColors />
          </View>
          <View>
            <Text style={s.nom}>Kung-fu Waishi</Text>
            <Text style={s.lieu}>Analamahitsy</Text>
          </View>
        </View>

        <View style={s.carte}>
          <Text style={s.titre}>Connexion membre</Text>

          <Champ
            libelle="Numéro de membre"
            valeur={numero}
            surSaisie={setNumero}
            auto="characters"
            retour="next"
          />
          <Champ
            libelle="Mot de passe"
            valeur={motDePasse}
            surSaisie={setMotDePasse}
            secret
            retour="done"
          />

          {erreur ? (
            <View style={s.erreur} accessibilityLiveRegion="polite">
              <Text style={s.erreurTexte}>{erreur}</Text>
            </View>
          ) : null}

          {enCours
            ? <View style={s.attente}><ActivityIndicator color={couleurs.vert} /></View>
            : <Bouton texte="Entrer" onPress={entrer} />}

          <Text style={s.aide}>
            Première connexion ou mot de passe oublié ?{'\n'}
            <Text style={s.aideFort}>Demandez au responsable du club.</Text>
          </Text>
        </View>

        <Text style={s.pied}>
          Chaque membre possède son propre compte.{'\n'}
          Seule l’administration peut modifier les fiches.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  /* .phone--green : le fond vert plein */
  ecran: { flex: 1, backgroundColor: couleurs.vert },
  corps: {
    flexGrow: 1, justifyContent: 'center', gap: 28,
    paddingHorizontal: 24, paddingVertical: 60
  },

  marque: { alignItems: 'center', gap: 16 },
  /* .emblem--lg : 72 x 72, rayon 20 */
  /* .emblem--lg devient .emblem--img dès qu'un logo est posé : le
     logo du club est un disque, on l'affiche rond et à fond perdu,
     sinon son cercle flotte dans un carré blanc. */
  emblem: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  logo: { width: '100%', height: '100%', resizeMode: 'cover' },
  nom: {
    ...texte('titre', 700), fontSize: 21, 
    lineHeight: 26, color: '#FFF', textAlign: 'center'
  },
  lieu: { ...texte('texte'), fontSize: 14, color: couleurs.surVertDoux, marginTop: 4, textAlign: 'center' },

  carte: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, paddingHorizontal: 20, gap: 18 },
  titre: { ...texte('texte', 700), fontSize: 17,  color: couleurs.encre },

  /* L'erreur est écrite, pas seulement colorée : un liseré rouge
     seul ne dit rien à qui ne distingue pas le rouge. */
  erreur: { backgroundColor: '#FDF3EC', borderWidth: 1, borderColor: '#F0D6C2', borderRadius: 12, padding: 12 },
  erreurTexte: { ...texte('texte'), fontSize: 13, lineHeight: 19, color: '#8A3A12' },

  attente: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },

  aide: { ...texte('texte'), fontSize: 13, lineHeight: 19, color: couleurs.gris, textAlign: 'center' },
  aideFort: { ...texte('texte', 600), color: couleurs.vertTexte },

  pied: { ...texte('texte'), fontSize: 12, lineHeight: 18, color: '#9BC0AC', textAlign: 'center' }
});
