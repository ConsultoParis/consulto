import { NextRequest, NextResponse } from "next/server";
import { stripeFeatured } from "@/lib/stripe-featured";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripeFeatured.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_FEATURED_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.metadata?.expert_id) {
      const subscription = await stripeFeatured.subscriptions.retrieve(session.subscription as string);
      await supabase
        .from("experts")
        .update({
          is_featured: true,
          featured_stripe_subscription_id: subscription.id,
          featured_stripe_customer_id: session.customer as string,
          featured_until: new Date(subscription.current_period_end * 1000).toISOString(),
          featured_cancel_at_period_end: false,
        })
        .eq("id", session.metadata.expert_id);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const expertId = subscription.metadata?.expert_id;
    if (expertId) {
      await supabase
        .from("experts")
        .update({
          featured_until: new Date(subscription.current_period_end * 1000).toISOString(),
          featured_cancel_at_period_end: subscription.cancel_at_period_end,
          is_featured: subscription.status === "active" || subscription.status === "trialing",
        })
        .eq("id", expertId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const expertId = subscription.metadata?.expert_id;
    if (expertId) {
      await supabase
        .from("experts")
        .update({
          is_featured: false,
          featured_cancel_at_period_end: false,
          featured_stripe_subscription_id: null,
        })
        .eq("id", expertId);
    }
  }

  return NextResponse.json({ received: true });
}
