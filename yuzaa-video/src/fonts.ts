import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Polices de la marque (copiées depuis le site yuzaa, fichiers variables)
export const fontsReady = Promise.all([
  loadFont({
    family: "Bricolage Grotesque",
    url: staticFile("fonts/bricolage-grotesque-latin.woff2"),
    weight: "200 800",
  }),
  loadFont({
    family: "DM Sans",
    url: staticFile("fonts/dm-sans-latin.woff2"),
    weight: "100 1000",
  }),
]);
