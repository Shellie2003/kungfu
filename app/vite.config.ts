import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

/* La version construite. Vercel donne le commit dans
   VERCEL_GIT_COMMIT_SHA ; l'atelier de construction de l'APK le pose
   dans VERSION_CONSTRUITE. À défaut — un « npm run dev » sur un
   poste — on ne prétend rien, et l'application le dit. */
const VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERSION_CONSTRUITE ?? '';

/* ------------------------------------------------------------
   LE NUMÉRO DE VERSION, ET POURQUOI IL EN FALLAIT UN SECOND.

   Celui du dessus est une empreinte de commit — « a3f9c21 ». Elle
   retrouve un état exact du code, et c'est ce qu'on veut pour
   déboguer.

   Elle est en revanche INUTILISABLE pour une mise à jour : entre
   « a3f9c21 » et « 7b2e004 », rien ne dit lequel est le plus récent.
   Un téléphone qui compare son empreinte à celle publiée sait
   seulement qu'elles diffèrent — donc il annoncerait une mise à jour
   même en revenant à une version plus ancienne.

   D'où ce second numéro, celui de package.json, qui AUGMENTE. C'est
   lui que l'application compare, et lui qu'on change à la main avant
   de publier. Voir LIVRER.md.
   ------------------------------------------------------------ */
const NUMERO = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
).version as string;

export default defineConfig({
  plugins: [react(), tailwind()],
  define: {
    __VERSION__: JSON.stringify(VERSION),
    __NUMERO__: JSON.stringify(NUMERO)
  },
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
