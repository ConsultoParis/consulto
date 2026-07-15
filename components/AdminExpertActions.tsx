"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AdminExpertActions({ expertId }: { expertId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function handle(action: "verify" | "reject") {
    setLoading(action);
    setError("");
    const res = await fetch(`/api/admin/experts/${expertId}/${action}`, { method: "POST" });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      return setError(data.error || "Une erreur est survenue");
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={() => handle("verify")}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-[3px] px-3.5 py-2 text-xs font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "#1E8F6B" }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> {loading === "verify" ? "..." : "Valider"}
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-[3px] border border-red-700/30 px-3.5 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
        >
          <XCircle className="h-3.5 w-3.5" /> {loading === "reject" ? "..." : "Rejeter"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
