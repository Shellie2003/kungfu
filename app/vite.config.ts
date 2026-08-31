import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

/* La version construite. Vercel donne le commit dans
   VERCEL_GIT_COMMIT_SHA ; l'atelier de construction de l'APK le pose
   dans VERSION_CONSTRUITE. À défaut — un « npm run dev » sur un
   poste — on ne prétend rien, et l'application le dit. */
const VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERSION_CONSTRUITE ?? '';

export default defineConfig({
  plugins: [react(), tailwind()],
  define: { __VERSION__: JSON.stringify(VERSION) },
  /* La maquette vit à la racine du dépôt, hors de app/. On autorise
     Vite à la lire : c'est elle la source du design, et la recopier
     ici garantirait qu'un jour l'une changera sans l'autre. */
  server: { fs: { allow: [new URL('..', import.meta.url).pathname] } },
  build: {
    outDir: 'dist',
    /* Capacitor sert les fichiers depuis le système de fichiers de
       l'application : les chemins absolus ne résoudraient pas. */
    assetsDir: 'assets',
    sourcemap: false
  },
  base: ''
});
