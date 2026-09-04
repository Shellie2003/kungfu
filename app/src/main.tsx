import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

/* ⚠ LA BARRE D'ÉTAT N'EST PLUS RÉGLÉE ICI.

   Elle l'était, une fois pour toutes au démarrage : icônes claires,
   fond vert du club. Sur Android 14 et avant, cela marchait.

   Depuis Android 15, « setBackgroundColor » ne fait plus RIEN — on
   l'a lu dans la source du greffon, « shouldSetStatusBarColor » rend
   faux dès l'API 35. La barre laisse alors voir la page : sur
   l'accueil, dont le haut est vert, des icônes claires se lisent ;
   sur tous les autres écrans, dont la barre de titre est BLANCHE,
   elles deviennent invisibles. L'heure et la batterie disparaissent.

   Le style suit donc l'écran, et se pose à chaque navigation. Voir
   services/barreDetat.ts, et « AccorderLaBarre » dans App.tsx. */

const racine = document.getElementById('racine');
if (!racine) throw new Error('#racine introuvable dans index.html');
createRoot(racine).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
