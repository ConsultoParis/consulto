import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Crée un PaymentIntent avec capture manuelle : l'argent du client est
 * autorisé/débité immédiatement mais reste en séquestre chez Stripe.
 * Il faut appeler `stripe.paymentIntents.capture()` (voir releasePayment)
 * une fois la consultation terminée pour reverser les fonds à l'expert.
 */
export async function createEscrowPayment({
  amountEuros,
  bookingId,
  clientEmail,
}: {
  amountEuros: number;
  bookingId: string;
  clientEmail: string;
}) {
  return stripe.paymentIntents.create({
    amount: Math.round(amountEuros * 100), // Stripe travaille en centimes
    currency: "eur",
    capture_method: "manual", // <-- clé du séquestre : pas de capture immédiate
    receipt_email: clientEmail,
    metadata: { bookingId },
  });
}

/** Reverse les fonds à l'expert une fois la consultation terminée. */
export async function releasePayment(paymentIntentId: string) {
  return stripe.paymentIntents.capture(paymentIntentId);
}

/** Rembourse le client (annulation, litige, garantie satisfait/remboursé). */
export async function refundPayment(paymentIntentId: string) {
  return stripe.paymentIntents.cancel(paymentIntentId).catch(() =>
    // Si déjà capturé, on rembourse au lieu d'annuler
    stripe.refunds.create({ payment_intent: paymentIntentId })
  );
}
