"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function StripeConnectButton({ chargesEnabled }: { chargesEnabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Une erreur est survenue");
    window.location.href = data.url;
  }

  if (chargesEnabled) {
    return (
      <p className="flex items-center gap-2 text-sm" style={{ color: "#1E8F6B" }}>
        <CheckCircle2 className="h-4 w-4" /> Compte bancaire connecté — vous pouvez recevoir des paiements.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Connectez votre compte bancaire pour pouvoir recevoir vos paiements (80% de chaque consultation, versés
        automatiquement une fois la session clôturée).
      </p>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="mt-3 flex items-center gap-2 rounded-[3px] bg-ink px-5 py-2.5 text-sm font-medium text-parchment disabled:opacity-50"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Redirection..." : "Connecter mon compte bancaire"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
