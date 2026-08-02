"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
export default function AdminExpertActions({ expertId }: { expertId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");

  async function handleVerify() {
    setLoading("verify");
    setError("");
    const res = await fetch(`/api/admin/experts/${expertId}/verify`, { method: "POST" });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      return setError(data.error || "Une erreur est survenue");
    }
    router.refresh();
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("Merci d'indiquer le motif du refus");
      return;
    }
    setLoading("reject");
    setError("");
    const res = await fetch(`/api/admin/experts/${expertId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      return setError(data.error || "Une erreur est survenue");
    }
    router.refresh();
  }

  return (
    <div>
      {!showRejectForm ? (
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={loading !== null}
            className="flex items-center gap-1.5 rounded-[3px] px-3.5 py-2 text-xs font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#1E8F6B" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> {loading === "verify" ? "..." : "Valider"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading !== null}
            className="flex items-center gap-1.5 rounded-[3px] border border-red-700/30 px-3.5 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" /> Rejeter
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs">
          <textarea
            className="w-full rounded-[3px] border border-red-700/30 px-3 py-2 text-sm outline-none"
            style={{ minHeight: 70 }}
            placeholder="Motif du refus (envoyé au candidat par email)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="flex items-center gap-1.5 rounded-[3px] bg-red-700 px-3.5 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {loading === "reject" ? "..." : "Confirmer le refus"}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setReason("");
                setError("");
              }}
              className="rounded-[3px] border border-app px-3.5 py-2 text-xs font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
