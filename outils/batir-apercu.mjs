/* ============================================================
   Construit apercu/index.html — l'application, testable dans un
   navigateur, sans rien compiler ni installer.

     node outils/batir-apercu.mjs

   Ce ne sont pas des captures : ce sont les composants React
   Native du dossier app/, rendus par react-native-web. Le même
   code que celui qui partira sur Android. Un bouton touché ici
   est le bouton de l'application.

   Ce que l'aperçu ne montre pas
   -----------------------------
   Le rendu natif Android : lissage des polices, ombres
   (elevation), défilement à l'inertie. Pour cela il faut l'APK,
   ou Expo Go. L'aperçu sert à valider ce qu'on voit et
   l'enchaînement des écrans — c'est-à-dire l'essentiel du
   travail de relecture.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { assemblerPlusieurs } from './assembler.mjs';
import { policesWeb } from './polices-web.mjs';
import { ECRANS } from './ecrans.mjs';

/* Les mêmes fichiers que l'APK : l'aperçu montre les polices
   telles qu'elles seront sur le téléphone. */
const POLICES = policesWeb();

/* Le code QR, s'il a été produit. Incorporé en clair dans la page :
   un chemin relatif casserait si la page est ouverte depuis un
   fichier ou renvoyée par courriel. Produire le QR : node outils/qr.mjs */
const QR = existsSync('apercu/qr.svg') ? readFileSync('apercu/qr.svg', 'utf8') : null;

const script = await assemblerPlusieurs(ECRANS);



const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Kung-fu Waishi Analamahitsy — Aperçu de l’application</title>
<meta name="description" content="L’application du club, testable dans un navigateur.">
<meta name="theme-color" content="#0F5132">
<style>
${POLICES}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
body {
  font-family: 'Karla', system-ui, sans-serif;
  background: radial-gradient(120% 90% at 50% 0%, #17392A 0%, #0B1C13 70%);
  color: #C7DCD0;
  -webkit-font-smoothing: antialiased;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 18px; padding: 24px;
}
header { text-align: center; }
h1 {
  margin: 0; font-family: 'Archivo-Bold', sans-serif; font-size: 15px;
  letter-spacing: .12em; text-transform: uppercase; color: #FFF;
}
.sous { margin: 6px 0 0; font-size: 13px; color: #8FB3A0; }

#onglets { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
#onglets button {
  font: inherit; font-size: 13px; color: #B4CCC0; cursor: pointer;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px; padding: 8px 16px;
}
#onglets button[aria-current="true"] { background: #FFF; color: #0B1C13; border-color: #FFF; font-weight: 700; }

/* Le QR n'a de sens que sur un grand écran : on ne scanne pas le
   téléphone qu'on tient déjà dans la main. */
.qr { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 14px 18px; }
.qr svg { width: 96px; height: 96px; display: block; border-radius: 8px; background: #FFF; }
.qr p { margin: 0; font-size: 13px; line-height: 19px; color: #B4CCC0; max-width: 240px; }
.qr b { color: #FFF; }

/* Le cadre a exactement la taille de celui de la maquette : 370 x 780.
   Une largeur différente changerait tous les retours à la ligne, et
   l'aperçu ne montrerait plus ce qui a été validé. */
.cadre {
  width: 390px; flex: none; border-radius: 44px; padding: 10px; background: #060F0A;
  box-shadow: 0 40px 90px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.09);
}
#ecran {
  width: 370px; height: 780px; border-radius: 36px; overflow: hidden;
  background: #F5F8F6; display: flex; flex-direction: column;
}
footer { font-size: 12px; color: #6E9481; text-align: center; max-width: 460px; line-height: 18px; }

/* Sur un téléphone, le cadre disparaît : l'application prend tout. */
@media (max-width: 820px), (max-height: 900px) {
  body { justify-content: flex-start; gap: 12px; padding: 12px; }
  .qr { display: none; }
  .cadre { width: 100%; max-width: 420px; padding: 0; border-radius: 0; background: none; box-shadow: none; }
  #ecran { width: 100%; height: 78vh; border-radius: 18px; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
  <header>
    <h1>Kung-fu Waishi Analamahitsy</h1>
    <p class="sous">Aperçu de l’application — <b id="nom">…</b></p>
  </header>

  <nav id="onglets" aria-label="Écrans">
${ECRANS.map((e, i) => `    <button onclick="window.__aller(${i})">${e.titre}</button>`).join('\n')}
  </nav>

  <div class="cadre"><div id="ecran"></div></div>

${QR ? `  <div class="qr">
    ${QR.replace(/<\?xml[^>]*\?>/, '').trim()}
    <p><b>Ouvrir sur un téléphone.</b> Scannez avec l’appareil photo : l’aperçu s’ouvre dans le navigateur, rien à installer.</p>
  </div>` : ''}

  <footer>
    Ce ne sont pas des images : ce sont les composants de l’application, rendus dans votre
    navigateur. Le rendu natif Android — lissage, ombres, défilement — demande l’APK.<br>
    <a href="/" style="color:#8FB3A0">← La maquette validée, 26 écrans</a>
  </footer>

  <script>${script}</script>
</body>
</html>
`;

mkdirSync('apercu', { recursive: true });
writeFileSync('apercu/index.html', html);
console.log(`apercu/index.html — ${ECRANS.length} écran(s), ${Math.round(html.length / 1024)} Ko`);
