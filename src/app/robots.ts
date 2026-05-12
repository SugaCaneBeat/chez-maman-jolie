import type { MetadataRoute } from "next";

const SITE_URL = "https://www.chezmamanjolie.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/image", "/_next/static/media/"],
        disallow: [
          "/api/",
          "/admin/",
          "/checkout/",
          "/commande/",
          "/*?utm_*",
          "/*?fbclid=*",
          "/*?gclid=*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
