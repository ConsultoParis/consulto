import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEscrowPayment } from "@/lib/stripe";

// POST /api/checkout — appelé quand le client valide sa réservation.
// Crée la réservation en base (status "confirmed", payment_status "pending")
// puis un PaymentIntent Stripe en mode séquestre (capture manuelle), réparti
// automatiquement entre l'expert (80%) et 1Expert (20% de commission).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { slotId, expertId, mode, clientEmail, creditsUsed } = body;

  // 1. Vérifie que le créneau est toujours disponible
  const { data: slot } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", slotId)
    .eq("is_booked", false)
    .single();

  if (!slot) {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
  }

  // 2. Vérifie que l'expert a bien connecté son compte de paiement
  const { data: expert } = await supabase
    .from("experts")
    .select("price, stripe_account_id, stripe_charges_enabled")
    .eq("id", expertId)
    .single();

  if (!expert?.stripe_account_id || !expert.stripe_charges_enabled) {
    return NextResponse.json(
      { error: "Cet expert n'a pas encore activé la réception des paiements. Réessayez plus tard." },
      { status: 409 }
    );
  }

  // Le prix et le mode sont déterminés par le serveur à partir du créneau,
  // jamais fait confiance à ce que le navigateur envoie — évite toute
  // manipulation du prix. Les créneaux de 5 min sont le "Devis rapide"
  // à prix fixe (5€), obligatoirement en visio.
  const isQuickQuote = slot.duration_min === 5;
  const price = isQuickQuote ? 5 : Number(expert.price);
  const finalMode = isQuickQuote ? "video" : mode;

  // 3. Crée le PaymentIntent Stripe (séquestre, réparti 80/20)
  const finalPrice = Math.max(0, price - (creditsUsed || 0));
  const paymentIntent = await createEscrowPayment({
    amountEuros: finalPrice,
    bookingId: slotId,
    clientEmail,
    expertStripeAccountId: expert.stripe_account_id,
  });

  // 4. Crée la réservation en base
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      slot_id: slotId,
      client_id: user.id,
      expert_id: expertId,
      date: slot.date,
      start_time: slot.start_time,
      duration_min: slot.duration_min,
      mode: finalMode,
      price: finalPrice,
      credits_used: creditsUsed || 0,
      stripe_payment_intent_id: paymentIntent.id,
      payment_status: "pending",
      client_email: clientEmail,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5. Marque le créneau comme réservé
  await supabase.from("availability_slots").update({ is_booked: true }).eq("id", slotId);

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
  });
}
