/* La route va chercher les données et les donne à la vue. C'est le
   seul endroit qui connaît à la fois l'écran et le serveur. */
import React from 'react';
import { useRouter } from 'expo-router';
import Etudiants from '../../ecrans/Etudiants';
import { useMembres, useGrades } from '../../services/membres';

export default function Route() {
  const router = useRouter();
  const membres = useMembres();
  const grades = useGrades();

  /* Le club nomme ses filtres par le dernier mot du grade :
     « Ceinture verte » devient « Verte ». */
  const filtres = ['Tous', ...(grades.data ?? []).map((g) => {
    const mots = g.nom.split(' ');
    const dernier = mots[mots.length - 1] ?? g.nom;
    return dernier.charAt(0).toUpperCase() + dernier.slice(1);
  })];

  return (
    <Etudiants
      membres={membres.data ?? []}
      filtres={filtres}
      chargement={membres.isLoading || grades.isLoading}
      erreur={membres.error ? 'La liste n’a pas pu être chargée. Vérifiez le réseau.' : null}
      surMembre={(id) => router.push(`/(membre)/etudiants/${id}` as never)}
    />
  );
}
