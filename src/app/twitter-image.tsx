/* Twitter Card réutilise exactement la même image qu'Open Graph.
 * Turbopack n'accepte pas le re-export pour les champs de config
 * de route — on les redéfinit donc en littéraux ici. */
import OpenGraphImage from "./opengraph-image";

export const runtime = "edge";
export const alt =
  "Plats traditionnels africains servis Chez Maman Jolie — Paris 11";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpenGraphImage;
