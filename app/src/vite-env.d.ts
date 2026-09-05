/// <reference types="vite/client" />

/* La version construite, injectée par vite.config.ts au moment de
   la construction. Déclarée ici pour que le typage la connaisse :
   sans cela, « __VERSION__ » est un nom inconnu et le contrôle de
   types échoue là où la construction, elle, réussirait. */
declare const __VERSION__: string;

/* Le numéro de version de package.json — « 1.1.0 ». C'est LUI que
   l'application compare pour savoir s'il existe plus récent : une
   empreinte de commit ne se compare pas, un numéro si. */
declare const __NUMERO__: string;
