import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

/* La barre d'état d'Android.

   L'accueil et la connexion posent du vert sombre tout en haut de
   l'écran ; sans cela, l'heure et la batterie s'y écrivent en noir
   et deviennent illisibles. Les icônes passent donc en clair, et le
   fond de la barre prend le vert du club pour qu'il n'y ait pas de
   liseré blanc au-dessus.

   Le module n'existe que dans l'application empaquetée : dans un
   navigateur l'import échoue, et il n'y a rien à faire — le
   navigateur a sa propre barre. */
import('@capacitor/status-bar')
  .then(({ StatusBar, Style }) =>
    Promise.all([
      StatusBar.setStyle({ style: Style.Dark }),
      StatusBar.setBackgroundColor({ color: '#0F5132' })
    ])
  )
  .catch(() => undefined);

const racine = document.getElementById('racine');
if (!racine) throw new Error('#racine introuvable dans index.html');
createRoot(racine).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
