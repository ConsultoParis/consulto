import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripeFeatured, FEATURED_PRICE_ID } from "@/lib/stripe-featured";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: expert } = await supabase
    .from("experts")
    .select("id, is_featured, featured_stripe_customer_id, profiles(full_name, email)")
    .eq("id", user.id)
    .single();

  if (!expert) {
    return NextResponse.json({ error: "Profil expert introuvable" }, { status: 404 });
  }

  if (expert.is_featured) {
    return NextResponse.json({ error: "Vous êtes déjà abonné au Profil en vedette" }, { status: 409 });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://1expert.fr";

  const session = await stripeFeatured.checkout.sessions.create({
    mode: "subscription",
    customer: expert.featured_stripe_customer_id || undefined,
    customer_email: expert.featured_stripe_customer_id ? undefined : (expert as any).profiles?.email,
    line_items: [{ price: FEATURED_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/dashboard/expert?featured=success`,
    cancel_url: `${origin}/dashboard/expert?featured=cancelled`,
    metadata: { expert_id: expert.id },
    subscription_data: { metadata: { expert_id: expert.id } },
  });

  return NextResponse.json({ url: session.url });
}
