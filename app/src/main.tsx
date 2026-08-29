import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

const racine = document.getElementById('racine');
if (!racine) throw new Error('#racine introuvable dans index.html');
createRoot(racine).render(<React.StrictMode><App /></React.StrictMode>);
