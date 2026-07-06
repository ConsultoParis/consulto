"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    // Cette route déclenche : status -> "completed", capture du paiement
    // Stripe (versement des fonds retenus en séquestre à l'expert).
    await fetch(`/api/bookings/${bookingId}/complete`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="rounded-[3px] bg-verified px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "..." : "Marquer la consultation comme terminée"}
    </button>
  );
}
