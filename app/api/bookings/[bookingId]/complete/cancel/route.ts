import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refundPayment } from "@/lib/stripe";
import { sendCancellationEmail } from "@/lib/email";

// POST /api/bookings/[bookingId]/cancel
// Annule une réservation. Règle de remboursement :
// - L'expert annule → remboursement intégral du client, toujours.
// - Le client annule plus de 48h avant le rendez-vous → remboursé.
// - Le client annule à moins de 48h → aucun remboursement (facturé).
// Cette règle est appliquée ici, côté serveur, jamais fait confiance au client.
export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
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
    .select("*, profiles(full_name), experts(*, profiles(full_name, email))")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  const isClient = booking.client_id === user.id;
  const isExpert = booking.expert_id === user.id;
  if (!isClient && !isExpert) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (booking.status === "completed" || booking.status.startsWith("cancelled")) {
    return NextResponse.json({ error: "Cette réservation ne peut plus être annulée" }, { status: 409 });
  }

  const appointmentTime = new Date(`${booking.date}T${booking.start_time}`);
  const hoursUntil = (appointmentTime.getTime() - Date.now()) / (1000 * 60 * 60);

  // L'expert annule -> toujours remboursé. Le client annule -> remboursé
  // seulement si c'est plus de 48h avant le rendez-vous.
  const shouldRefund = isExpert || hoursUntil >= 48;

  if (shouldRefund && booking.stripe_payment_intent_id && booking.payment_status !== "refunded") {
    await refundPayment(booking.stripe_payment_intent_id);
  }

  await supabase
    .from("bookings")
    .update({
      status: isClient ? "cancelled_by_client" : "cancelled_by_expert",
      refunded: shouldRefund,
      payment_status: shouldRefund ? "refunded" : booking.payment_status,
    })
    .eq("id", bookingId);

  // Libère le créneau pour qu'il redevienne réservable
  await supabase.from("availability_slots").update({ is_booked: false }).eq("id", booking.slot_id);

  // Notifie l'autre partie
  const otherPartyName = isClient
    ? booking.experts?.profiles?.full_name || "l'expert"
    : booking.profiles?.full_name || "le client";

  const dateStr = new Date(booking.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  const notifyEmail = isClient ? booking.experts?.profiles?.email : booking.client_email;

  if (notifyEmail) {
    await sendCancellationEmail({
      to: notifyEmail,
      otherPartyName,
      date: dateStr,
      time: booking.start_time,
      refunded: shouldRefund,
    });
  }

  return NextResponse.json({ success: true, refunded: shouldRefund });
}
