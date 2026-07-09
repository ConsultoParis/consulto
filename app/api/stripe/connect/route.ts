import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createExpertStripeAccount, createAccountOnboardingLink } from "@/lib/stripe";

// POST /api/stripe/connect — appelé quand l'expert clique sur
// "Connecter mon compte bancaire" depuis son tableau de bord.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: expert } = await supabase.from("experts").select("*, profiles(email)").eq("id", user.id).single();

  if (!expert) {
    return NextResponse.json({ error: "Profil expert introuvable" }, { status: 404 });
  }

  let accountId = expert.stripe_account_id as string | null;

  // Crée le compte Stripe Connect une seule fois, s'il n'existe pas déjà.
  if (!accountId) {
    const account = await createExpertStripeAccount(expert.profiles?.email || user.email || "");
    accountId = account.id;
    await supabase.from("experts").update({ stripe_account_id: accountId }).eq("id", user.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://1expert.fr";

  const link = await createAccountOnboardingLink({
    accountId,
    returnUrl: `${siteUrl}/dashboard/expert?stripe=success`,
    refreshUrl: `${siteUrl}/dashboard/expert?stripe=refresh`,
  });

  return NextResponse.json({ url: link.url });
}
