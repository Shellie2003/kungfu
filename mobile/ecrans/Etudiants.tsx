/* ============================================================
   Écran 03 · Étudiants

   Comme tous les écrans de ce dossier, la vue ne connaît ni le
   routage ni le serveur : elle reçoit ses données. C'est ce qui
   permet à outils/comparer.mjs de la rendre avec le jeu d'essai de
   la maquette, et à la route de la rendre avec la vraie requête.

   « Ito hoe classé par grade ito » — la liste est groupée par
   grade, du plus élevé au plus bas, avec un titre de section. Les
   filtres du haut permettent en plus de n'afficher qu'un grade.
   ============================================================ */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import {
  Entete, BarreRecherche, Chip, Grade, Portrait, Cloche, Chevron
} from '../composants/base';
import { couleurs, composants as C } from '../theme/tokens';
import { texte } from '../theme/typo';
import { Onglets } from '../composants/Onglets';

export type MembreAffiche = {
  id: string;
  nom: string;
  prenom: string;
  grade: { nom: string; couleur: string } | null;
};

export type Props = {
  membres: MembreAffiche[];
  /* Les libellés des filtres, dans l'ordre du club. « Tous » est
     ajouté ici : il n'a pas à exister en base. */
  filtres: string[];
  chargement?: boolean;
  erreur?: string | null;
  surMembre?: (id: string) => void;
};

export default function Etudiants({
  membres, filtres, chargement, erreur, surMembre
}: Props) {
  const [filtre, setFiltre] = React.useState('Tous');

  const visibles = React.useMemo(
    () => (filtre === 'Tous'
      ? membres
      /* Le filtre porte sur le dernier mot du grade — « Verte »
         pour « Ceinture verte » — parce que c'est ainsi que le club
         nomme ses filtres. */
      : membres.filter((m) => m.grade?.nom.toLowerCase().endsWith(filtre.toLowerCase()))),
    [membres, filtre]
  );

  return (
    <View style={s.ecran}>
      <Entete titre="Étudiants" droite={<View style={s.tapicon}><Cloche /></View>} />

      {/* padding:16px 20px 0 dans la maquette */}
      <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
        <BarreRecherche texte="Rechercher un nom ou un prénom" />
      </View>

      {/* .chips — rail horizontal : les filtres débordent volontairement,
          on les fait défiler plutôt que de les tasser.
          flexGrow:0 ET flexShrink:0 : dans une colonne, un ScrollView
          horizontal se laisse comprimer et le rail tombe de 53 à 22 px.
          Le même défaut existait dans la maquette. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={s.rail}
      >
        {filtres.map((f) => (
          <Chip key={f} texte={f} actif={f === filtre} onPress={() => setFiltre(f)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.corps}>
        {chargement ? (
          <View style={s.attente}><ActivityIndicator color={couleurs.vert} /></View>
        ) : erreur ? (
          <View style={s.erreur}><Text style={s.erreurTexte}>{erreur}</Text></View>
        ) : (
          <>
            <Text style={s.compte}>
              {visibles.length} membre{visibles.length > 1 ? 's' : ''} · classés par grade
            </Text>

            {visibles.map((m) => (
              <Pressable key={m.id} style={s.fiche} onPress={() => surMembre?.(m.id)}>
                <Portrait l={52} h={52} r={14} />
                <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Text style={s.nom} numberOfLines={1}>{m.nom}</Text>
                  <Text style={s.prenom} numberOfLines={1}>{m.prenom}</Text>
                  {m.grade ? (
                    <View style={{ marginTop: 7 }}>
                      <Grade nom={m.grade.nom} couleur={m.grade.couleur} />
                    </View>
                  ) : null}
                </View>
                <Chevron taille={18} couleur="#A8B6AE" />
              </Pressable>
            ))}

            {visibles.length === 0 ? (
              <Text style={s.vide}>Aucun membre à ce grade.</Text>
            ) : null}
          </>
        )}
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
  nom: { ...texte('texte', 700), fontSize: 15, lineHeight: 19, color: couleurs.encre },
  prenom: { ...texte('texte'), fontSize: 14, lineHeight: 19, color: '#3C4A42' },

  attente: { paddingVertical: 40, alignItems: 'center' },
  vide: { ...texte('texte'), fontSize: 14, color: couleurs.gris, textAlign: 'center', paddingVertical: 24 },
  erreur: {
    backgroundColor: '#FDF3EC', borderWidth: 1, borderColor: '#F0D6C2',
    borderRadius: 12, padding: 14
  },
  erreurTexte: { ...texte('texte'), fontSize: 13, lineHeight: 19, color: '#8A3A12' }
});
