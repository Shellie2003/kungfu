import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mg.analamahitsy.waishi',
  appName: 'Kung-fu Waishi',
  webDir: 'dist',
  android: {
    /* Le fond derrière la page pendant le chargement : le vert du
       club plutôt qu'un flash blanc. */
    backgroundColor: '#0F5132'
  },
  server: {
    /* androidScheme https : sans cela le stockage local et les
       requêtes réseau se comportent différemment de la version web,
       et l'on déboguerait deux fois. */
    androidScheme: 'https'
  }
};

export default config;
