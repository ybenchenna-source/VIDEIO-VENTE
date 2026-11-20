/**
 * Réglages de rendu. Toutes les options : https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
// WebGL logiciel : fonctionne aussi sur une machine sans carte graphique
Config.setChromiumOpenGlRenderer("angle");

// Navigateur personnalisé (facultatif) : export REMOTION_BROWSER=/chemin/vers/chrome-headless-shell
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
