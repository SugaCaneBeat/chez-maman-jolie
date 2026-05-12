import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "qczjisuztjekkjgnqnpl.supabase.co",
      },
    ],
  },
  async headers() {
    /* Forcer les navigateurs à toujours revérifier la home :
     * tant que le menu / les horaires bougent souvent, on évite
     * que le cache navigateur garde une copie périmée.
     * Vercel CDN garde son revalidate=10 côté serveur. */
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
