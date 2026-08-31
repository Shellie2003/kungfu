/* ============================================================
   La configuration des tests.

   Séparée de vite.config.ts à dessein : celle-ci charge le greffon
   Tailwind, qui n'a rien à faire dans un test — il lit css/app.css
   et ses polices en base64 à chaque fichier, ce qui triple la durée
   pour un rendu que jsdom n'affiche de toute façon pas.

   Ce que les tests couvrent, et ce qu'ils ne couvrent pas :

   — la LOGIQUE : dates, matricules, teintes, codes USSD. Une erreur
     y est invisible à l'écran et se découvre sur le téléphone du
     club. C'est là que les tests unitaires paient.

   — le COMPORTEMENT des écrans, avec un serveur simulé : ce qui
     s'affiche selon ce que le serveur rend, ce qui est envoyé quand
     on appuie. C'est l'intégration.

   — PAS le rendu visuel : jsdom ne met pas en page. La ressemblance
     à la maquette se mesure dans un vrai navigateur, par
     outils/comparer-app.mjs.

   — PAS les règles d'accès : elles ont leur propre test, dans
     supabase/tests/, exécuté sur un vrai PostgreSQL. Les simuler ici
     donnerait l'illusion de les vérifier.
   ============================================================ */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  /* La maquette vit à la racine du dépôt, hors de app/, et
     l'application la LIT — css/app.css, icones.mjs, et le logo du
     club dans img/. vite.config.ts l'autorise déjà ; il fallait le
     dire ici aussi, sinon le serveur de test refuse le fichier
     (« Denied ID …/img/logo.jpg ») et le test échoue là où la
     construction, elle, réussit. */
  server: { fs: { allow: [new URL('..', import.meta.url).pathname] } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/mise-en-place.ts'],
    /* Les feuilles de style ne sont pas chargées : jsdom ne les
       applique pas, et css/app.css embarque les polices en base64. */
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      /* Les écrans sont couverts par les tests d'intégration, mais
         leur JSX gonfle le pourcentage sans rien dire. Ce qui compte
         est la couverture des services et des utilitaires. */
      exclude: ['src/main.tsx', 'src/**/*.d.ts']
    }
  }
});
