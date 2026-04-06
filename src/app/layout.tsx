import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Chez Maman Jolie — Cuisine Africaine Authentique",
  description:
    "Restaurant traiteur spécialisé en cuisine africaine authentique. Congo, Sénégal, Afrique de l'Ouest. Livraison & traiteur événementiel.",
  keywords: [
    "cuisine africaine",
    "traiteur",
    "restaurant",
    "livraison",
    "Congo",
    "Sénégal",
  ],
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
      <body>{children}</body>
    </html>
  );
}
