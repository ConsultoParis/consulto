import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Wallet, XCircle, Users, Award } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (myProfile?.role !== "admin") redirect("/");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: weekBookings } = await supabase
    .from("bookings")
    .select("*, experts(profiles(full_name))")
    .gte("created_at", weekAgo.toISOString());

  const { count: verifiedExpertCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: pendingExpertCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  const bookings = weekBookings || [];
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled_by_client" || b.status === "cancelled_by_expert");
  const grossRevenue = completed.reduce((s, b) => s + Number(b.price), 0);
  const commissionRevenue = grossRevenue * 0.2;
  const cancellationRate = bookings.length > 0 ? Math.round((cancelled.length / bookings.length) * 100) : 0;

  const expertCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  completed.forEach((b: any) => {
    const name = b.experts?.profiles?.full_name || "Expert inconnu";
    if (!expertCounts[b.expert_id]) expertCounts[b.expert_id] = { name, count: 0, revenue: 0 };
    expertCounts[b.expert_id].count += 1;
    expertCounts[b.expert_id].revenue += Number(b.price);
  });
  const topExperts = Object.values(expertCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Administration</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Analytics</h1>
      <p className="mt-2 text-sm text-muted">Vue des 7 derniers jours.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="flex items-center gap-1.5 font-display text-3xl font-semibold text-gradient">
            <TrendingUp className="h-5 w-5" /> {bookings.length}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Réservations (7j)</p>
        </div>
        <div className="card-soft bg-verified/5 p-5">
          <p className="flex items-center gap-1.5 font-display text-3xl font-semibold text-verified">
            <Wallet className="h-5 w-5" /> {commissionRevenue.toFixed(0)} €
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase text-verified">Commission (20%)</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "#fdecec" }}>
          <p className="flex items-center gap-1.5 font-display text-3xl font-semibold" style={{ color: "#b3261e" }}>
            <XCircle className="h-5 w-5" /> {cancellationRate}%
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase" style={{ color: "#b3261e" }}>Taux d'annulation</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="flex items-center gap-1.5 font-display text-3xl font-semibold">
            <Users className="h-5 w-5" style={{ color: "#3E8EF7" }} /> {verifiedExpertCount || 0}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">
            Experts actifs {pendingExpertCount ? `· ${pendingExpertCount} en attente` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-mono text-[11px] uppercase text-mutedmore">Chiffre d'affaires brut (7j)</p>
          <p className="mt-1 font-display text-2xl font-semibold" style={{ color: "#3E8EF7" }}>
            {grossRevenue.toFixed(0)} €
          </p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-mono text-[11px] uppercase text-mutedmore">Consultations terminées (7j)</p>
          <p className="mt-1 font-display text-2xl font-semibold">{completed.length}</p>
        </div>
      </div>

      <h2 className="mt-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        <Award className="h-3.5 w-3.5" /> Experts les plus actifs (7j)
      </h2>
      {topExperts.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Aucune consultation terminée cette semaine.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {topExperts.map((e, i) => (
            <div key={i} className="card-soft flex items-center justify-between p-4" style={{ backgroundColor: "var(--card)" }}>
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-sm text-muted">{e.count} consultation{e.count > 1 ? "s" : ""}</p>
              </div>
              <p className="font-display text-lg font-semibold" style={{ color: "#3E8EF7" }}>{e.revenue.toFixed(0)} €</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
