/* ============================================================
   Le point d'entrée : on redirige selon la session.

   Aucun écran ici. Tant que la session n'est pas connue, on
   n'affiche rien — rediriger trop tôt renverrait à la connexion
   un membre déjà connecté, à chaque ouverture.
   ============================================================ */
import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '../services/session';

export default function Entree() {
  const { session, chargement } = useSession();
  if (chargement) return null;
  return <Redirect href={session ? '/(membre)/accueil' : '/connexion'} />;
}
