/* ============================================================
   Ce qui est posé avant chaque fichier de test.
   ============================================================ */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

/* Les variables d'environnement que services/supabase.ts exige au
   chargement. Sans elles, il lève une erreur au premier import et
   AUCUN test ne démarre — ce qui est le comportement voulu de
   l'application, mais pas ici.

   Les valeurs sont fausses : aucun test ne doit joindre le réseau.
   Les appels sont interceptés, voir tests/serveur.ts. */
beforeAll(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://essai.supabase.co');
  vi.stubEnv('VITE_SUPABASE_CLE', 'sb_publishable_essai');
});

/* jsdom n'implémente pas ces deux-là, et les écrans s'en servent :
   le fil de messages défile vers le bas, la messagerie écoute le
   temps réel. Sans ces bouchons, le test échoue sur une absence de
   fonction plutôt que sur le comportement mesuré. */
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
  window.scrollTo = vi.fn();
  if (!globalThis.crypto?.randomUUID) {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: () => '00000000-0000-4000-8000-000000000000'
    });
  }
});

/* ------------------------------------------------------------
   Aucun test ne sort de la machine.

   « brancherServeur » intercepte fetch, mais PAS les WebSockets — et
   la messagerie en ouvre une : le temps réel écoute les messages du
   salon affiché. Le test tentait donc une vraie connexion vers
   essai.supabase.co.

   Ici, elle échouait sans bruit, faute de réseau. Sur le coureur
   GitHub, elle allait plus loin et undici finissait par lever
   « The "event" argument must be an instance of Event. Received an
   instance of Event » — deux classes Event de mondes différents,
   celle de jsdom et celle de Node. Les 126 tests passaient, et
   vitest sortait quand même en échec sur cette erreur non
   rattrapée.

   Un faux socket règle les deux : plus de réseau, et un
   comportement identique sur toutes les machines. Ce que cela ne
   couvre pas — que le temps réel fonctionne vraiment — ne se vérifie
   de toute façon que sur un téléphone, avec deux appareils.
   ------------------------------------------------------------ */
/* Le registre des sorties tentées. Il ne sert pas à faire marcher
   les tests : il sert à les faire ÉCHOUER ici plutôt que sur le
   coureur GitHub, où le même défaut ne s'est manifesté qu'une fois
   sur deux. Un test lit ce registre — voir tests/reseau.test.tsx. */
export const socketsTentes: string[] = [];

class FauxWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = FauxWebSocket.CONNECTING;
  url: string;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: (() => void) | null = null;

  constructor(url: string | URL) {
    this.url = String(url);
    socketsTentes.push(this.url);
  }
  send() {}
  close() {
    this.readyState = FauxWebSocket.CLOSED;
    this.onclose?.();
  }
  addEventListener() {}
  removeEventListener() {}
}

beforeAll(async () => {
  vi.stubGlobal('WebSocket', FauxWebSocket);

  /* Et un fetch qui REFUSE, posé avant tout. « brancherServeur »
     l'écrase dans les fichiers qui simulent le serveur ; celui qui
     oublierait de l'appeler tomberait sinon sur le vrai réseau, et
     son test dépendrait de la connexion de la machine qui le lance —
     vert ici, rouge sur le coureur, ou l'inverse. Mieux vaut une
     erreur qui nomme l'adresse demandée. */
  vi.stubGlobal('fetch', async () => {
    throw new Error(
      'Un test a tenté de joindre le réseau sans serveur simulé. ' +
        'Appelez brancherServeur() dans un beforeEach.'
    );
  });

  /* Le faux WebSocket global NE SUFFIT PAS, et cela m'a coûté une
     exécution rouge pour l'apprendre : realtime-js ne prend pas
     forcément celui de globalThis — sur le coureur GitHub il tombait
     sur celui d'undici, et le remplacement n'y changeait rien. Le
     symptôme était intermittent, ce qui est pire : une exécution
     passait, la suivante échouait sur le même code.

     On coupe donc à la source. Le client Supabase est chargé ICI,
     après que les variables d'environnement sont posées — il les
     exige au chargement — et ses méthodes de temps réel sont
     remplacées. Aucune bibliothèque n'a plus l'occasion d'ouvrir
     quoi que ce soit.

     Ce que cela ne couvre pas — que le temps réel fonctionne — ne se
     vérifie de toute façon que sur un téléphone, avec deux
     appareils. */
  const { supabase } = await import('../src/services/supabase');
  const canalMuet = {
    on: () => canalMuet,
    subscribe: () => canalMuet,
    unsubscribe: async () => 'ok' as const
  };
  supabase.channel = (() => canalMuet) as unknown as typeof supabase.channel;
  supabase.removeChannel = (async () => 'ok') as unknown as typeof supabase.removeChannel;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
