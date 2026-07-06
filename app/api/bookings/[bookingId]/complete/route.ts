import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { releasePayment } from "@/lib/stripe";

// POST /api/bookings/[bookingId]/complete
// Appelé par l'expert une fois la consultation terminée.
// Déclenche la capture du paiement Stripe : les fonds retenus en séquestre
// sont alors reversés (le webhook Stripe côté Connect gérerait le split
// réel vers le compte de l'expert — à mettre en place selon le modèle de
// commission choisi).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("expert_id", user.id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  if (booking.stripe_payment_intent_id) {
    await releasePayment(booking.stripe_payment_intent_id);
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "completed", payment_status: "released" })
    .eq("id", bookingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
