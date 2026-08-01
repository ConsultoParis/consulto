import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEscrowPayment } from "@/lib/stripe";
import { getLoyaltyStatus, LOYALTY_DISCOUNT_RATE } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { slotId, expertId, mode, clientEmail, clientNote, creditsUsed, useLoyaltyDiscount } = body;

  const { data: slot } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", slotId)
    .eq("is_booked", false)
    .single();

  if (!slot) {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
  }

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

  const isQuickQuote = slot.duration_min === 5;
  const price = isQuickQuote ? 5 : Number(expert.price);
  const allowedModes: string[] = isQuickQuote ? ["video"] : slot.available_modes || [];

  if (!allowedModes.includes(mode)) {
    return NextResponse.json({ error: "Ce mode de consultation n'est pas disponible pour ce créneau" }, { status: 400 });
  }

  let loyaltyDiscountApplied = false;
  let priceAfterLoyalty = price;
  if (useLoyaltyDiscount && !isQuickQuote) {
    const loyalty = await getLoyaltyStatus(supabase, user.id);
    if (loyalty.discountsAvailable > 0) {
      priceAfterLoyalty = Math.round(price * (1 - LOYALTY_DISCOUNT_RATE) * 100) / 100;
      loyaltyDiscountApplied = true;
    }
  }

  const finalPrice = Math.max(0, priceAfterLoyalty - (creditsUsed || 0));

  const paymentIntent = await createEscrowPayment({
    amountEuros: finalPrice,
    bookingId: slotId,
    clientEmail,
    expertStripeAccountId: expert.stripe_account_id,
  });

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
      client_note: clientNote || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (loyaltyDiscountApplied) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_discounts_used")
      .eq("id", user.id)
      .single();
    await supabase
      .from("profiles")
      .update({ loyalty_discounts_used: (profile?.loyalty_discounts_used || 0) + 1 })
      .eq("id", user.id);
  }

  await supabase.from("availability_slots").update({ is_booked: true }).eq("id", slotId);

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
  });
}
