import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "1Expert — L'expertise à portée de tous",
  description:
    "Avocats, notaires, médecins généralistes, garagistes et barbers/coiffeurs vérifiés. Consultation en 20-30 minutes, paiement sécurisé en séquestre.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('1expert-theme');
                if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
