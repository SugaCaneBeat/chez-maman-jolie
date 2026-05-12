import type { MetadataRoute } from "next";

const SITE_URL = "https://www.chezmamanjolie.com";

/**
 * Sitemap minimal — n'inclut que les URLs qui existent réellement aujourd'hui.
 * Au fur et à mesure que les pages thématiques (cuisine-congolaise, traiteur,
 * fiches plats…) seront créées, il suffira de les ajouter ici.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
