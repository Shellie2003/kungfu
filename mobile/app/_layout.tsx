/* ============================================================
   La racine : polices, session, et le cache des requêtes.

   Rien ne s'affiche tant que les polices ne sont pas chargées.
   Sans cela l'application ouvre en police système puis saute sur
   Archivo et Karla — et tous les textes bougent sous les yeux.
   ============================================================ */
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEcouteSession } from '../services/session';
import { couleurs } from '../theme/tokens';
import { CLES_POLICES } from '../theme/typo';

/* Les mêmes fichiers que css/fonts.css de la maquette, extraits par
   outils/extraire-polices.py : c'est ce qui garantit que
   l'application s'affiche comme ce qui a été validé, y compris sans
   connexion.

   Une famille par graisse, et non fontWeight : voir theme/typo.ts.
   Les clés doivent correspondre exactement à ce que nomPolice()
   compose — d'où le contrôle plus bas, qui échoue au démarrage
   plutôt que d'afficher silencieusement une police de secours. */
const POLICES = {
  'Archivo': require('../assets/polices/Archivo.ttf'),
  'Archivo-Medium': require('../assets/polices/Archivo-Medium.ttf'),
  'Archivo-SemiBold': require('../assets/polices/Archivo-SemiBold.ttf'),
  'Archivo-Bold': require('../assets/polices/Archivo-Bold.ttf'),
  'Karla': require('../assets/polices/Karla.ttf'),
  'Karla-Medium': require('../assets/polices/Karla-Medium.ttf'),
  'Karla-SemiBold': require('../assets/polices/Karla-SemiBold.ttf'),
  'Karla-Bold': require('../assets/polices/Karla-Bold.ttf')
};

const manquantes = CLES_POLICES.filter((c) => !(c in POLICES));
if (manquantes.length) {
  throw new Error(
    'Polices déclarées dans theme/typo.ts mais absentes de app/_layout.tsx : ' +
    manquantes.join(', ')
  );
}

const requetes = new QueryClient({
  defaultOptions: {
    queries: {
      /* Antananarivo : le réseau coupe. On garde en cache plutôt
         que de rejouer la requête à chaque retour sur l'écran. */
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2
    }
  }
});

export default function Racine() {
  const [pretes] = useFonts(POLICES);
  useEcouteSession();

  if (!pretes) return null;

  return (
    <QueryClientProvider client={requetes}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={couleurs.vert} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="connexion" />
          <Stack.Screen name="(membre)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
