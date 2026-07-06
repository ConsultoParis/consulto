import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email";

// POST /api/webhooks/stripe — appelé automatiquement par Stripe.
// À configurer dans le Dashboard Stripe > Developers > Webhooks
// URL : https://consulto.fr/api/webhooks/stripe
// Événements à écouter : payment_intent.amount_capturable_updated, payment_intent.canceled
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Le paiement a été autorisé et est maintenant en séquestre
  if (event.type === "payment_intent.amount_capturable_updated") {
    const paymentIntent = event.data.object;

    const { data: booking } = await supabase
      .from("bookings")
      .update({ payment_status: "held" })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("*, experts(*, profiles(full_name))")
      .single();

    if (booking) {
      await sendReceiptEmail({
        to: booking.client_email,
        expertName: booking.experts?.profiles?.full_name || "votre expert",
        date: booking.date,
        time: booking.start_time,
        price: booking.price,
      });
    }
  }

  return NextResponse.json({ received: true });
}
