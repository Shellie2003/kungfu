/* La route branche le service sur la vue. C'est le seul endroit
   qui connaît à la fois l'écran et le serveur. */
import React from 'react';
import Connexion from '../ecrans/Connexion';
import { seConnecter } from '../services/supabase';

export default function Route() {
  return <Connexion connecter={seConnecter} />;
}
