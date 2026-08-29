/* ============================================================
   Les cinq onglets.

   La barre est celle de la maquette, mesurée au pixel — d'où
   tabBar, qui remplace celle d'Expo Router au lieu de la
   configurer. Configurer celle d'Expo Router donnerait « presque
   pareil », c'est-à-dire pas pareil.
   ============================================================ */
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Onglets, type Cle } from '../../composants/Onglets';
import { useSession } from '../../services/session';

const VERS: Record<Cle, string> = {
  home: '/(membre)/accueil',
  students: '/(membre)/etudiants',
  chat: '/(membre)/messages',
  news: '/(membre)/casier',
  album: '/(membre)/album'
};

export default function Membre() {
  const { session, chargement } = useSession();
  if (chargement) return null;
  /* Le garde-fou d'interface. Il ne protège rien par lui-même :
     ce sont les règles d'accès de la base qui protègent. Il évite
     seulement d'afficher un écran vide à qui n'est pas connecté. */
  if (!session) return <Redirect href="/connexion" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <Onglets
          actif={(state.routeNames[state.index] ?? 'accueil') as never}
          aller={(cle) => navigation.navigate(VERS[cle].split('/').pop() as never)}
        />
      )}
    >
      <Tabs.Screen name="accueil" />
      <Tabs.Screen name="etudiants" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="casier" />
      <Tabs.Screen name="album" />
    </Tabs>
  );
}
