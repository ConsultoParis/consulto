"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("1expert-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("1expert-cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t p-4" style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted">
          Nous utilisons des cookies nécessaires au bon fonctionnement du site (connexion, réservation, paiement sécurisé).{" "}
          <Link href="/confiance" className="underline decoration-[#3E8EF7] decoration-2 underline-offset-4">
            En savoir plus
          </Link>
        </p>
        <button onClick={accept} className="btn-primary shrink-0 rounded-[6px] px-5 py-2.5 text-sm font-medium">
          J'ai compris
        </button>
      </div>
    </div>
  );
}
