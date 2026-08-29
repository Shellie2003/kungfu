/* ============================================================
   Écran 03 · Étudiants

   Porté depuis la maquette. Les valeurs qui ne viennent pas des
   jetons sont annotées avec leur origine dans build-screens.mjs,
   pour qu'un écart se retrouve sans relire les deux fichiers.

   Ce que outils/comparer.mjs vérifie sur cet écran : que le rendu
   ne s'écarte pas de la maquette de plus du seuil accepté.
   ============================================================ */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import {
  Entete, BarreRecherche, Chip, Grade, Portrait, Cloche, Chevron
} from '../composants/base';
import { couleurs, composants as C } from '../theme/tokens';
import { texte } from '../theme/typo';
import { Onglets } from '../composants/Onglets';

/* Le jeu d'essai de la maquette. Il sera remplacé par la requête
   Supabase ; il reste ici pour que la comparaison porte sur les
   mêmes données des deux côtés. */
type Eleve = readonly [nom: string, prenom: string, grade: string, couleur: string];

export const ELEVES: readonly Eleve[] = [
  ['RAKOTONDRABE', 'Nirina', 'Ceinture verte', '#4E9C57'],
  ['RASOAMANANA', 'Fanjaniaina', 'Ceinture jaune', '#D8A93A'],
  ['ANDRIANJAFY', 'Tokiniaina', 'Ceinture bleue', '#3E6E9C'],
  ['RABEMANANJARA', 'Hery', 'Ceinture noire', '#1E2320'],
  ['RAZAFIMAHATRATRA', 'Miora', 'Ceinture orange', '#C97A32'],
  ['RANDRIAMAMPIONONA', 'Toky', 'Ceinture blanche', '#E7EDE9']
];

const FILTRES = ['Tous', 'Blanche', 'Jaune', 'Orange', 'Verte'];

export default function Etudiants() {
  const [filtre, setFiltre] = React.useState('Tous');

  return (
    <View style={s.ecran}>
      <Entete
        titre="Étudiants"
        droite={<View style={s.tapicon}><Cloche /></View>}
      />

      {/* padding:16px 20px 0 dans la maquette */}
      <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
        <BarreRecherche texte="Rechercher un nom ou un prénom" />
      </View>

      {/* .chips — rail horizontal : les filtres débordent volontairement,
          on les fait défiler plutôt que de les tasser. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        /* flexGrow:0 ET flexShrink:0 : dans une colonne, un
           ScrollView horizontal se laisse comprimer par défaut et le
           rail tombe de 53 à 22 px. Le même défaut existait dans la
           maquette, corrigé par .phone > * { flex-shrink: 0 }. */
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={s.rail}
      >
        {FILTRES.map((f) => (
          <Chip key={f} texte={f} actif={f === filtre} onPress={() => setFiltre(f)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.corps}>
        <Text style={s.compte}>64 membres · classés par grade</Text>

        {ELEVES.map(([nom, prenom, grade, coul]) => (
          <Pressable key={nom} style={s.fiche}>
            <Portrait l={52} h={52} r={14} />
            <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
              <Text style={s.nom} numberOfLines={1}>{nom}</Text>
              <Text style={s.prenom} numberOfLines={1}>{prenom}</Text>
              <View style={{ marginTop: 7 }}>
                <Grade nom={grade} couleur={coul} />
              </View>
            </View>
            <Chevron taille={18} couleur="#A8B6AE" />
          </Pressable>
        ))}
      </ScrollView>

      <Onglets actif="students" />
    </View>
  );
}

const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },

  tapicon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  /* .chips : padding 14px 20px 4px, gap 8 */
  rail: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 4, gap: C.chip.ecart },

  /* padding:14px 20px 24px, gap 12 */
  corps: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },

  compte: { ...texte('texte'), fontSize: 12, color: couleurs.gris },

  /* .card.studentrow — la carte et la ligne cumulées */
  fiche: {
    flexDirection: 'row', alignItems: 'center', gap: C.ligneEleve.ecart,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: couleurs.filet, borderRadius: 16,
    paddingVertical: C.ligneEleve.padVertical, paddingHorizontal: C.ligneEleve.padHorizontal
  },
  nom: { ...texte('texte', 700), fontSize: 15,  lineHeight: 19, color: couleurs.encre },
  prenom: { ...texte('texte'), fontSize: 14, lineHeight: 19, color: '#3C4A42' }
});
