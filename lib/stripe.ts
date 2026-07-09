import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Commission de la plateforme sur chaque consultation.
export const PLATFORM_FEE_PERCENT = 20;

/**
 * Crée un PaymentIntent avec capture manuelle : l'argent du client est
 * autorisé/débité immédiatement mais reste en séquestre chez Stripe.
 * Grâce à `transfer_data.destination`, une fois capturé, 80% du montant
 * part automatiquement vers le compte Stripe Connect de l'expert — les
 * 20% restants (application_fee_amount) restent sur le compte 1Expert.
 */
export async function createEscrowPayment({
  amountEuros,
  bookingId,
  clientEmail,
  expertStripeAccountId,
}: {
  amountEuros: number;
  bookingId: string;
  clientEmail: string;
  expertStripeAccountId: string;
}) {
  const amountCents = Math.round(amountEuros * 100);
  const applicationFeeCents = Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);

  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    capture_method: "manual", // <-- clé du séquestre : pas de capture immédiate
    receipt_email: clientEmail,
    metadata: { bookingId },
    application_fee_amount: applicationFeeCents,
    transfer_data: {
      destination: expertStripeAccountId,
    },
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

/**
 * Crée un compte Stripe Connect "Express" pour un expert qui n'en a pas
 * encore. Stripe s'occupe de toute la vérification d'identité (KYC).
 */
export async function createExpertStripeAccount(expertEmail: string) {
  return stripe.accounts.create({
    type: "express",
    country: "FR",
    email: expertEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
  });
}

/**
 * Génère le lien d'onboarding Stripe (formulaire d'identité + coordonnées
 * bancaires) vers lequel rediriger l'expert.
 */
export async function createAccountOnboardingLink({
  accountId,
  returnUrl,
  refreshUrl,
}: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}) {
  return stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}
