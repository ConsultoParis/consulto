"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setLoading(false);

    if (confirmError) {
      setError(confirmError.message || "Le paiement a échoué, réessayez.");
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-[6px] bg-ink py-3.5 text-sm font-medium text-parchment disabled:opacity-50"
      >
        {loading ? "Traitement..." : "Payer et confirmer"}
      </button>
      <p className="text-center text-xs text-slate">
        Paiement conservé en séquestre jusqu'à la fin de la consultation.
      </p>
    </form>
  );
}
