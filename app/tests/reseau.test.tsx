/* ============================================================
   Aucun test ne sort de la machine.

   Ce fichier ne vérifie pas une fonctionnalité de l'application : il
   vérifie une propriété de la SUITE elle-même. Il existe parce que
   son absence m'a coûté deux exécutions rouges et un diagnostic
   faux.

   L'histoire, écrite ici pour qu'elle ne se rejoue pas. La messagerie
   ouvre une WebSocket — le temps réel écoute les messages du salon
   affiché — et « brancherServeur » intercepte fetch, mais pas les
   sockets. Les tests tentaient donc une vraie connexion vers
   essai.supabase.co. Sans réseau, elle échouait sans bruit ; sur le
   coureur GitHub, elle allait plus loin et undici finissait par lever
   « The "event" argument must be an instance of Event ». Les 126
   tests passaient et vitest sortait quand même en échec.

   Le piège est là : le symptôme dépendait du RÉSEAU du coureur, donc
   il était intermittent. J'ai posé un faux WebSocket global,
   l'exécution suivante est passée, et j'ai annoncé le problème réglé.
   L'exécution d'après a rejoué la même erreur sur un commit qui
   contenait pourtant le correctif — realtime-js ne prend pas
   forcément le WebSocket de globalThis. La verte l'était par chance.

   D'où ces deux tests. Ils transforment une panne intermittente
   d'intégration continue en un échec local, immédiat et lisible.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { Salon } from '../src/ecrans/Salon';
import { socketsTentes } from './mise-en-place';
import { brancherServeur, poser, reinitialiser } from './serveur';
import { PROFIL_ELEVE, rendre } from './rendu';

const maintenant = new Date().toISOString();

const SALON = {
  id: 's1', type: 'club', titre: 'Tout le club', couleur: '#0F5132',
  dernier_le: maintenant, membres_salon: [{ lu_le: null }], messages: []
};

describe('la suite reste hors ligne', () => {
  beforeEach(() => {
    reinitialiser();
    brancherServeur();
    socketsTentes.length = 0;
  });

  test('afficher un salon n’ouvre AUCUNE socket', async () => {
    /* L'écran le plus exposé : c'est lui qui s'abonne au temps réel.
       S'il en ouvrait une, elle irait vers une adresse inventée, et
       ce qu'il s'y passerait dépendrait de la machine. */
    poser({
      salons: [SALON],
      messages: [{
        id: 'm1', texte: 'Bonsoir à tous.', cree_le: maintenant,
        supprime_le: null, auteur_id: 'p4',
        profils: { nom: 'RABEMANANJARA', prenom: 'Hery' }
      }]
    });
    rendre(<Salon />, { route: '/messages/s1', chemin: '/messages/:id', profil: PROFIL_ELEVE });

    await screen.findByText('Bonsoir à tous.');
    expect(socketsTentes).toEqual([]);
  });
});

/* Le second garde-fou — un fetch qui refuse tant que le serveur
   simulé n'est pas branché — se vérifie dans son PROPRE fichier :
   « brancherServeur » remplace le global une fois pour toutes, et un
   test placé ici après les précédents trouverait le serveur simulé
   encore en place. Voir tests/hors-ligne.test.ts. */
