/* ============================================================
   Marque-place d'un écran pas encore porté.

   Nommer ce qui manque vaut mieux qu'une page blanche : on voit
   d'un coup d'œil où on en est, et depuis quel écran de la
   maquette le portage doit se faire.
   ============================================================ */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { couleurs } from '../theme/tokens';
import { texte } from '../theme/typo';

export function APorter({ titre, maquette }: { titre: string; maquette: string }) {
  return (
    <View style={s.ecran}>
      <Text style={s.titre}>{titre}</Text>
      <Text style={s.texte}>
        Écran pas encore porté. La maquette validée est {maquette}.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  ecran: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, backgroundColor: couleurs.fond },
  titre: { ...texte('titre', 700), fontSize: 19,  color: couleurs.encre },
  texte: { ...texte('texte'), fontSize: 14, lineHeight: 21, color: couleurs.gris, textAlign: 'center' }
});
