import type { SupabaseClient } from "@supabase/supabase-js";

export const LOYALTY_THRESHOLD = 100;
export const LOYALTY_DISCOUNT_RATE = 0.05;

export async function getLoyaltyStatus(supabase: SupabaseClient, clientId: string) {
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("price")
    .eq("client_id", clientId)
    .eq("status", "completed");

  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_discounts_used")
    .eq("id", clientId)
    .single();

  const totalSpend = (completedBookings || []).reduce((s, b) => s + Number(b.price), 0);
  const discountsEarned = Math.floor(totalSpend / LOYALTY_THRESHOLD);
  const discountsUsed = profile?.loyalty_discounts_used || 0;
  const discountsAvailable = Math.max(0, discountsEarned - discountsUsed);
  const progressInCurrentTier = totalSpend % LOYALTY_THRESHOLD;

  return { totalSpend, discountsEarned, discountsUsed, discountsAvailable, progressInCurrentTier };
}
