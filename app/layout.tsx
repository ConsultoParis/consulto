import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Consulto — L'expertise à portée de tous",
  description:
    "Avocats, experts-comptables, coachs, thérapeutes et médecins généralistes vérifiés. Consultation en 20-30 minutes, paiement sécurisé en séquestre.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
