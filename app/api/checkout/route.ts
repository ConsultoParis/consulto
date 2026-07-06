import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEscrowPayment } from "@/lib/stripe";

// POST /api/checkout — appelé quand le client valide sa réservation.
// Crée la réservation en base (status "confirmed", payment_status "pending")
// puis un PaymentIntent Stripe en mode séquestre (capture manuelle).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { slotId, expertId, mode, price, clientEmail, creditsUsed } = body;

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

  // 2. Crée le PaymentIntent Stripe (séquestre)
  const finalPrice = Math.max(0, price - (creditsUsed || 0));
  const paymentIntent = await createEscrowPayment({
    amountEuros: finalPrice,
    bookingId: slotId,
    clientEmail,
  });

  // 3. Crée la réservation en base
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      slot_id: slotId,
      client_id: user.id,
      expert_id: expertId,
      date: slot.date,
      start_time: slot.start_time,
      duration_min: slot.duration_min,
      mode,
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

  // 4. Marque le créneau comme réservé
  await supabase.from("availability_slots").update({ is_booked: true }).eq("id", slotId);

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
  });
}
