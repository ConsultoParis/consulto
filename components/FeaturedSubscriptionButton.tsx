"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function FeaturedSubscriptionButton({
  isFeatured,
  featuredUntil,
  cancelAtPeriodEnd,
}: {
  isFeatured: boolean;
  featuredUntil: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/expert/featured/checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error || "Une erreur est survenue");
    }
    window.location.href = data.url;
  }

  async function handleCancel() {
    if (!confirm("Votre profil restera en vedette jusqu'à la fin de la période déjà payée, sans remboursement. Confirmer l'annulation ?")) {
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/expert/featured/cancel", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Une erreur est survenue");
    window.location.reload();
  }

  const untilDate = featuredUntil
    ? new Date(featuredUntil).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (isFeatured) {
    return (
      <div className="card-soft p-5" style={{ backgroundColor: "#3E8EF70F", border: "1px solid #3E8EF730" }}>
        <p className="flex items-center gap-1.5 font-medium" style={{ color: "#3E8EF7" }}>
          <Sparkles className="h-4 w-4" /> Profil en vedette actif
        </p>
        {cancelAtPeriodEnd ? (
          <p className="mt-1 text-sm text-muted">
            Abonnement annulé — votre profil reste en vedette jusqu'au <strong>{untilDate}</strong>, puis ne sera pas reconduit.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Renouvellement automatique le <strong>{untilDate}</strong> — 4,99 €/mois.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        {!cancelAtPeriodEnd && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-secondary mt-3 rounded-[6px] px-4 py-2 text-xs font-medium"
          >
            {loading ? "..." : "Annuler l'abonnement"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
      <p className="flex items-center gap-1.5 font-medium">
        <Sparkles className="h-4 w-4" style={{ color: "#3E8EF7" }} /> Profil en vedette
      </p>
      <p className="mt-1 text-sm text-muted">
        Mettez votre profil en avant dans les résultats de recherche pour 4,99 €/mois. Sans engagement,
        annulable à tout moment (l'accès reste actif jusqu'à la fin de la période déjà payée).
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="btn-primary mt-3 rounded-[6px] px-4 py-2 text-xs font-medium"
      >
        {loading ? "..." : "Activer pour 4,99 €/mois"}
      </button>
    </div>
  );
}
