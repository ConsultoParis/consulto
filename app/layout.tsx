import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import CookieConsent from "@/components/CookieConsent";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: "#0A2540",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://1expert.fr"),
  title: "1Expert — Avocats, notaires, médecins, garagistes, coiffeurs et experts-comptables vérifiés",
  description:
    "Avocats, notaires, médecins généralistes, garagistes, barbers/coiffeurs et experts-comptables vérifiés. Consultation en 20-30 minutes, paiement sécurisé en séquestre.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "1Expert",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "1Expert — Des experts vérifiés, en 20 minutes",
    description:
      "Avocats, notaires, médecins généralistes, garagistes, barbers/coiffeurs et experts-comptables vérifiés. Paiement sécurisé en séquestre.",
    url: "https://1expert.fr",
    siteName: "1Expert",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1Expert — Des experts vérifiés, en 20 minutes",
    description: "Avocats, notaires, médecins, garagistes, coiffeurs et experts-comptables vérifiés.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
        <Footer />
        <ChatWidget />
        <CookieConsent />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
