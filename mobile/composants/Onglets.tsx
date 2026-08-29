/* ============================================================
   .tabbar — la barre du bas, cinq onglets.

   Le libellé de l'onglet actif passe en 700 et prend le vert ;
   l'icône aussi. La couleur seule ne porte donc pas l'information,
   la graisse la double.
   ============================================================ */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { couleurs, composants as C } from '../theme/tokens';
import { texte } from '../theme/typo';

export type Cle = 'home' | 'students' | 'chat' | 'news' | 'album';

const ONGLETS: [Cle, string][] = [
  ['home', 'Accueil'],
  ['students', 'Étudiants'],
  ['chat', 'Messages'],
  ['news', 'Casier'],
  ['album', 'Album']
];

/* Les mêmes tracés que l'objet ICON de build-screens.mjs. */
function Icone({ nom, couleur, epais }: { nom: Cle; couleur: string; epais: number }) {
  const p = { fill: 'none', stroke: couleur, strokeWidth: epais, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      {nom === 'home' && <Path {...p} d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" />}
      {nom === 'students' && (
        <>
          <Circle {...p} cx="9" cy="9" r="3.2" />
          <Path {...p} d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <Circle {...p} cx="17" cy="8" r="2.4" />
          <Path {...p} d="M16 13.5a4.5 4.5 0 0 1 4.5 4.5" />
        </>
      )}
      {nom === 'chat' && <Path {...p} d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z" />}
      {nom === 'news' && (
        <>
          <Path {...p} d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5l-8 4H5a1 1 0 0 0-1 1z" />
          <Path {...p} d="M19 9.5a4 4 0 0 1 0 5" />
        </>
      )}
      {nom === 'album' && (
        <>
          <Rect {...p} x="3.5" y="5" width="17" height="14" rx="3" />
          <Circle {...p} cx="9" cy="10" r="1.6" />
          <Path {...p} d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5" />
        </>
      )}
    </Svg>
  );
}

export function Onglets({ actif, aller }: { actif: Cle; aller?: (c: Cle) => void }) {
  return (
    <View style={s.barre}>
      {ONGLETS.map(([cle, libelle]) => {
        const on = cle === actif;
        return (
          <Pressable key={cle} style={s.onglet} onPress={() => aller?.(cle)}>
            <Icone nom={cle} couleur={on ? couleurs.vert : couleurs.grisClair} epais={on ? 1.8 : 1.7} />
            <Text style={[s.libelle, on && s.libelleActif]} numberOfLines={1}>{libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  barre: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: couleurs.filet,
    paddingTop: C.onglets.padHaut,
    paddingHorizontal: C.onglets.padCotes,
    paddingBottom: C.onglets.padBas
  },
  /* grid-template-columns: repeat(5, minmax(0, 1fr)) — cinq colonnes
     égales. flex:1 avec minWidth:0 donne le même partage. */
  onglet: { flex: 1, minWidth: 0, alignItems: 'center', gap: 5, paddingVertical: 6, minHeight: 44 },
  libelle: { ...texte('texte'), fontSize: 10, color: couleurs.grisClair },
  /* La graisse se choisit par le NOM de la police, pas par
     fontWeight : sur Android, fontWeight ne sélectionne pas un
     fichier embarqué. */
  libelleActif: { ...texte('texte', 700), color: couleurs.vert }
});
