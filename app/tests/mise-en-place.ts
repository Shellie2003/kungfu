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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
