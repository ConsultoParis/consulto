import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";
import CancelBookingButton from "@/components/CancelBookingButton";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import ReferralCode from "@/components/ReferralCode";
import NotificationButton from "@/components/NotificationButton";
import LoyaltyProgressBar from "@/components/LoyaltyProgressBar";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { PROFESSION_LABELS, PROFESSION_COLORS } from "@/lib/types";
import { Search, Calendar, MessageCircle, Heart, Wallet, Gift, FileText, Download } from "lucide-react";
export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, experts(*, profiles(full_name)), documents(*)")
    .eq("client_id", user.id)
    .order("date", { ascending: false });
  const { data: reviews } = await supabase.from("reviews").select("booking_id").eq("client_id", user.id);
  const reviewedBookingIds = new Set(reviews?.map((r) => r.booking_id));
  const { data: favorites } = await supabase
    .from("favorites")
    .select("expert_id, experts(*, profiles(full_name))")
    .eq("client_id", user.id);
  const { data: recommended } = await supabase
    .from("experts")
    .select("*, profiles(full_name)")
    .eq("verification_status", "verified")
    .order("created_at", { ascending: false })
    .limit(4);
  const loyalty = await getLoyaltyStatus(supabase, user.id);
  const now = new Date();
  const upcoming = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) > now && b.status === "confirmed") || [];
  const past = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) <= now || b.status === "completed") || [];
  const hasNoBookings = !bookings || bookings.length === 0;
  const referralCode = profile?.referral_code || `1EXPERT-${user.id.slice(0, 6).toUpperCase()}`;
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace client</p>
          <h1 className="mt-3 font-display text-3xl font-medium">Mes rendez-vous</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <NotificationButton />
          <Link
            href="/dashboard/client/documents"
            className="flex items-center gap-1.5 rounded-[3px] border border-app px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition hover:bg-ink/5"
          >
            <FileText className="h-3.5 w-3.5" /> Mes documents
          </Link>
        </div>
      </div>
      {has
