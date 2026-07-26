import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripeFeatured } from "@/lib/stripe-featured";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: expert } = await supabase
    .from("experts")
    .select("featured_stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!expert?.featured_stripe_subscription_id) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }

  await stripeFeatured.subscriptions.update(expert.featured_stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await supabase
    .from("experts")
    .update({ featured_cancel_at_period_end: true })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
