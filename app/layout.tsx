import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://1expert.fr"),
  title: "1Expert — Avocats, notaires, médecins, garagistes, coiffeurs et experts-comptables vérifiés",
  description:
    "Avocats, notaires, médecins généralistes, garagistes, barbers/coiffeurs et experts-comptables vérifiés. Consultation en 20-30 minutes, paiement sécurisé en séquestre.",
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
      </body>
    </html>
  );
}
