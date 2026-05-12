import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = "https://www.chezmamanjolie.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chez Maman Jolie | Restaurant & Traiteur Africain à Paris 11ème",
    template: "%s | Chez Maman Jolie",
  },
  description:
    "Cuisine africaine authentique à Paris 11ème : pondu, yassa, mafé, mikaté. Livraison du lundi au samedi à Paris et petite couronne, traiteur événementiel. Commande WhatsApp.",
  applicationName: "Chez Maman Jolie",
  authors: [{ name: "Chez Maman Jolie" }],
  generator: "Next.js",
  keywords: [
    "restaurant africain Paris",
    "traiteur africain Paris",
    "cuisine congolaise",
    "cuisine sénégalaise",
    "pondu Paris",
    "yassa Paris",
    "mafé Paris",
    "livraison cuisine africaine",
    "Paris 11ème",
  ],
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Chez Maman Jolie",
    title: "Chez Maman Jolie | Restaurant & Traiteur Africain à Paris",
    description:
      "Saveurs authentiques du Congo, du Sénégal et d'Afrique de l'Ouest. Livraison du lundi au samedi à Paris, traiteur événementiel. Commande facile par WhatsApp.",
    // images : générées automatiquement via src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Chez Maman Jolie | Restaurant Africain Paris 11",
    description:
      "Cuisine africaine authentique : pondu, yassa, mafé. Livraison Paris 6j/7, traiteur événementiel.",
    // images : générées automatiquement via src/app/twitter-image.tsx
  },
  /* icons:
   * - icon       : détecté automatiquement via src/app/icon.svg
   * - apple icon : pointe vers le même SVG (supporté iOS 12+)
   */
  icons: {
    apple: { url: "/icon.svg", type: "image/svg+xml" },
  },
  category: "restaurant",
  other: {
    "geo.region": "FR-75",
    "geo.placename": "Paris 11ème",
    "geo.position": "48.8634;2.3789",
    ICBM: "48.8634, 2.3789",
    "restaurant:contact_info:phone_number": "+33753873213",
    "restaurant:contact_info:locality": "Paris",
    "restaurant:contact_info:region": "Île-de-France",
    "restaurant:contact_info:country_name": "France",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8B4513",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://qczjisuztjekkjgnqnpl.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://qczjisuztjekkjgnqnpl.supabase.co"
        />
        <link rel="preconnect" href="https://wa.me" />
      </head>
      <body>{children}</body>
    </html>
  );
}
