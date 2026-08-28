/* ============================================================
   Les briques communes, en regard de la maquette.

   Chaque composant porte en commentaire la règle CSS qu'il
   reprend. Quand la maquette change, on sait quoi corriger ici —
   et outils/comparer.mjs mesure l'écart plutôt que de le supposer.

   Trois pièges de React Native que ce fichier traite une fois
   pour toutes, et qu'on n'a donc pas à retraiter dans les écrans :
     · la direction par défaut est la colonne, pas la ligne ;
     · tout texte doit être dans <Text>, il n'hérite pas du parent ;
     · une ombre CSS n'existe pas : c'est elevation sur Android.
   ============================================================ */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import { couleurs, polices, rayons, composants as C } from '../theme/tokens';

/* ---------------------------------------------- Typographie
   Les tailles et interlignes sont ceux de la maquette, relevés
   écran par écran. En React Native lineHeight est un nombre de
   pixels — ce qui tombe bien, la feuille les écrit déjà ainsi. */
export const T = StyleSheet.create({
  titreEcran: { fontFamily: polices.titre, fontSize: 18, fontWeight: '600', color: couleurs.encre },
  surTitre: {
    fontFamily: polices.titre, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.44, textTransform: 'uppercase', color: couleurs.gris
  },
  corps: { fontFamily: polices.texte, fontSize: 15, lineHeight: 22, color: couleurs.encre },
  soutien: { fontFamily: polices.texte, fontSize: 13, lineHeight: 18, color: couleurs.gris },
  nom: { fontFamily: polices.texte, fontSize: 15, fontWeight: '600', lineHeight: 20, color: couleurs.encre },
  lien: { fontFamily: polices.texte, fontSize: 13, fontWeight: '600', color: couleurs.vertTexte }
});

/* ---------------------------------------------- .card */
export function Carte({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.carte, style]}>{children}</View>;
}

/* ---------------------------------------------- .list + .listrow
   La séparation entre lignes est portée par la ligne suivante,
   comme « .listrow + .listrow » dans la feuille : un filet sous la
   dernière ligne doublerait la bordure de la liste. */
export function Liste({ children }: { children: React.ReactNode }) {
  const lignes = React.Children.toArray(children);
  return (
    <View style={s.liste}>
      {lignes.map((l, i) => (
        <View key={i} style={i > 0 ? s.filetHaut : undefined}>{l}</View>
      ))}
    </View>
  );
}

export function Ligne(
  { children, onPress, eleve }:
  { children: React.ReactNode; onPress?: () => void; eleve?: boolean }
) {
  const contenu = <View style={eleve ? s.ligneEleve : s.ligne}>{children}</View>;
  return onPress ? <Pressable onPress={onPress}>{contenu}</Pressable> : contenu;
}

/* ---------------------------------------------- .chip */
export function Chip({ texte, actif, onPress }: { texte: string; actif?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, actif && s.chipActif]}>
      <Text style={[s.chipTexte, actif && s.chipTexteActif]}>{texte}</Text>
    </Pressable>
  );
}

/* ---------------------------------------------- .grade
   La pastille de couleur ne porte jamais l'information seule : le
   nom du grade est toujours écrit à côté. C'est ce qui rend la
   liste lisible par une personne daltonienne. */
export function Grade({ nom, couleur }: { nom: string; couleur: string }) {
  return (
    <View style={s.grade}>
      <View style={[s.gradePastille, { backgroundColor: couleur }]} />
      <Text style={s.gradeTexte}>{nom}</Text>
    </View>
  );
}

/* ---------------------------------------------- .btn */
export function Bouton(
  { texte, genre = 'primary', onPress }:
  { texte: string; genre?: 'primary' | 'ghost'; onPress?: () => void }
) {
  const fantome = genre === 'ghost';
  return (
    <Pressable onPress={onPress} style={[s.btn, fantome ? s.btnFantome : s.btnPlein]}>
      <Text style={[s.btnTexte, fantome && s.btnTexteFantome]}>{texte}</Text>
    </Pressable>
  );
}

/* ---------------------------------------------- .apphead */
export function Entete(
  { titre, gauche, droite }:
  { titre: string; gauche?: React.ReactNode; droite?: React.ReactNode }
) {
  return (
    <View style={s.entete}>
      {gauche ?? <View style={{ width: 12 }} />}
      <Text style={[T.titreEcran, { flexGrow: 1, flexShrink: 1 }]} numberOfLines={1}>{titre}</Text>
      {droite}
    </View>
  );
}

/* ---------------------------------------------- .searchbar */
export function BarreRecherche({ texte }: { texte: string }) {
  return (
    <View style={s.recherche}>
      <Loupe />
      <Text style={s.rechercheTexte}>{texte}</Text>
    </View>
  );
}

/* ---------------------------------------------- Portrait provisoire
   Le même marque-place assumé que la maquette : une silhouette au
   trait sur fond teinté. Une fausse photo serait pire. */
export function Portrait({ l, h, r = 12 }: { l: number; h: number; r?: number }) {
  return (
    <View style={[s.portrait, { width: l, height: h, borderRadius: r }]}>
      <Silhouette taille={Math.round(l * 0.5)} />
    </View>
  );
}

/* ------------------------------------------------------------
   Les icônes.

   react-native-svg rend le même tracé que la maquette. Les deux
   ci-dessous suffisent à l'écran Étudiants ; les autres suivront
   le même moule, repris de l'objet ICON de build-screens.mjs.
   ------------------------------------------------------------ */
import Svg, { Path, Circle } from 'react-native-svg';

export function Loupe({ taille = 19, couleur = couleurs.grisClair }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none"
         stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 4 4" />
    </Svg>
  );
}

export function Cloche({ taille = 22, couleur = couleurs.encre }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none"
         stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9" />
      <Path d="M10 18a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function Chevron({ taille = 18, couleur = couleurs.grisClair }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none"
         stroke={couleur} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

function Silhouette({ taille }: { taille: number }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none"
         stroke="#8FB3A0" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8.5" r="3.6" />
      <Path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Svg>
  );
}

const s = StyleSheet.create({
  carte: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: couleurs.filet,
    borderRadius: rayons.carte, padding: 18
  },
  liste: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: couleurs.filet,
    borderRadius: rayons.liste, overflow: 'hidden'
  },
  filetHaut: { borderTopWidth: 1, borderTopColor: '#EDF3F0' },
  ligne: {
    flexDirection: 'row', alignItems: 'center', gap: C.ligne.ecart,
    paddingVertical: C.ligne.padVertical, paddingHorizontal: C.ligne.padHorizontal
  },
  ligneEleve: {
    flexDirection: 'row', alignItems: 'center', gap: C.ligneEleve.ecart,
    paddingVertical: C.ligneEleve.padVertical, paddingHorizontal: C.ligneEleve.padHorizontal
  },

  chip: {
    paddingVertical: C.chip.padVertical, paddingHorizontal: C.chip.padHorizontal, borderRadius: 999,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: couleurs.bord
  },
  chipActif: { backgroundColor: couleurs.vert, borderColor: couleurs.vert },
  chipTexte: {
    fontFamily: polices.texte, fontSize: C.chip.taille,
    /* Interligne posé, jamais laissé aux métriques de la police :
       c'est ce qui rend la hauteur du chip identique partout. */
    lineHeight: C.chip.interligne, color: couleurs.gris
  },
  /* .chip--on passe aussi en 600 : sans cela l'onglet actif s'affine. */
  chipTexteActif: { color: '#FFF', fontWeight: '600' },

  grade: {
    flexDirection: 'row', alignItems: 'center', gap: C.grade.ecart, alignSelf: 'flex-start',
    paddingVertical: C.grade.padVertical, paddingHorizontal: C.grade.padHorizontal, borderRadius: 999,
    backgroundColor: C.grade.fond, borderWidth: 1, borderColor: couleurs.bord
  },
  gradePastille: {
    width: C.grade.pastille, height: C.grade.pastille, borderRadius: C.grade.pastille / 2,
    /* box-shadow inset de la feuille : en React Native, une bordure
       intérieure de 1 px donne le même liseré sur les pastilles
       claires — sans lui, la ceinture blanche disparaît sur le fond. */
    borderWidth: 1, borderColor: 'rgba(0,0,0,.18)'
  },
  gradeTexte: { fontFamily: polices.texte, fontSize: C.grade.taille, fontWeight: '600', color: couleurs.encre },

  btn: {
    minHeight: C.bouton.hauteur, borderRadius: C.bouton.rayon,
    alignItems: 'center', justifyContent: 'center'
  },
  btnPlein: { backgroundColor: couleurs.vert },
  btnFantome: { borderWidth: 1, borderColor: '#C4D4CB', backgroundColor: '#FFF' },
  btnTexte: { fontFamily: polices.texte, fontSize: C.bouton.taille, fontWeight: C.bouton.graisse, color: '#FFF' },
  btnTexteFantome: { color: couleurs.vertTexte },

  entete: {
    flexDirection: 'row', alignItems: 'center', gap: C.entete.ecart,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: couleurs.filet,
    paddingTop: C.entete.padHaut, paddingBottom: C.entete.padBas, paddingHorizontal: C.entete.padCotes
  },

  recherche: {
    flexDirection: 'row', alignItems: 'center', gap: C.recherche.ecart, minHeight: C.recherche.hauteur,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: couleurs.bord,
    borderRadius: C.recherche.rayon, paddingHorizontal: C.recherche.padHorizontal
  },
  rechercheTexte: { fontFamily: polices.texte, fontSize: C.recherche.taille, color: C.recherche.couleur },

  portrait: {
    backgroundColor: couleurs.vertClair, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden'
  }
});
