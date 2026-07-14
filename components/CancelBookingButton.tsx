"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({
  bookingId,
  isClient,
  appointmentDate,
  appointmentTime,
}: {
  bookingId: string;
  isClient: boolean;
  appointmentDate: string;
  appointmentTime: string;
}) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { refunded: boolean }>(null);

  const hoursUntil = (new Date(`${appointmentDate}T${appointmentTime}`).getTime() - Date.now()) / (1000 * 60 * 60);
  const lateClientCancellation = isClient && hoursUntil < 48;

  async function doCancel() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Une erreur est survenue");
    setDone({ refunded: data.refunded });
    setShowWarning(false);
    router.refresh();
  }

  function handleClick() {
    setShowWarning(true);
  }

  if (done) {
    return (
      <p className="text-sm text-muted">
        Rendez-vous annulé. {done.refunded ? "Vous avez été intégralement remboursé." : "Aucun remboursement (annulation à moins de 48h)."}
      </p>
    );
  }

  if (!showWarning) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="rounded-[3px] border border-red-700/30 px-3.5 py-2 text-xs font-medium text-red-700 transition hover:bg-red-700/5"
      >
        Annuler le rendez-vous
      </button>
    );
  }

  return (
    <div className="rounded-[6px] border border-red-700/30 bg-red-700/5 p-4">
      {lateClientCancellation ? (
        <p className="text-sm">
          Ce rendez-vous a lieu dans moins de 48h. Si vous annulez maintenant,{" "}
          <strong>la session vous sera quand même facturée intégralement</strong>, sans remboursement.
        </p>
      ) : (
        <p className="text-sm">Confirmer l'annulation ? Le paiement sera intégralement remboursé.</p>
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={doCancel}
          disabled={loading}
          className="rounded-[3px] bg-red-700 px-3.5 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "..." : lateClientCancellation ? "Oui, annuler quand même" : "Confirmer l'annulation"}
        </button>
        <button
          type="button"
          onClick={() => setShowWarning(false)}
          disabled={loading}
          className="rounded-[3px] border border-app px-3.5 py-2 text-xs font-medium"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
