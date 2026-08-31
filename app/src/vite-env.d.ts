/// <reference types="vite/client" />

/* La version construite, injectée par vite.config.ts au moment de
   la construction. Déclarée ici pour que le typage la connaisse :
   sans cela, « __VERSION__ » est un nom inconnu et le contrôle de
   types échoue là où la construction, elle, réussirait. */
declare const __VERSION__: string;
