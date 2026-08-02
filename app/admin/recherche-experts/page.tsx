import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS } from "@/lib/types";
import { Search, BarChart3, ClipboardList } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: "Vérifié", color: "#1E8F6B", bg: "#1E8F6B15" },
  pending: { label: "En attente", color: "#D98A1F", bg: "#D98A1F15" },
  rejected: { label: "Refusé", color: "#B3261E", bg: "#B3261E15" },
};

export default async function AdminRechercheExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (myProfile?.role !== "admin") redirect("/");

  const admin = await createAdminClient();

  let query = admin
    .from("experts")
    .select("*, profiles!experts_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  if (params.statut && params.statut !== "tous") {
    query = query.eq("verification_status", params.statut);
  }

  const { data: expertsRaw } = await query;
  let experts = expertsRaw || [];

  if (params.q) {
    const q = params.q.toLowerCase();
    experts = experts.filter((e: any) => {
      const name = e.profiles?.full_name?.toLowerCase() || "";
      const email = e.profiles?.email?.toLowerCase() || "";
      const specialite = e.specialite?.toLowerCase() || "";
      const professionLabel = (PROFESSION_LABELS[e.profession as keyof typeof PROFESSION_LABELS] || "").toLowerCase();
      return name.includes(q) || email.includes(q) || specialite.includes(q) || professionLabel.includes(q);
    });
  }

  const statusFilters = [
    { key: "tous", label: "Tous" },
    { key: "verified", label: "Vérifiés" },
    { key: "pending", label: "En attente" },
    { key: "rejected", label: "Refusés" },
  ];

  const buildUrl = (statut: string) => {
    const p = new URLSearchParams();
    if (params.q) p.set("q", params.q);
    if (statut !== "tous") p.set("statut", statut);
    return `/admin/recherche-experts?${p.toString()}`;
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Administration</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Rechercher un expert</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/analytics" className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition" style={{ borderColor: "var(--border)" }}><BarChart3 className="h-3.5 w-3.5" /> Analytics</Link>
        <Link href="/admin/experts" className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition" style={{ borderColor: "var(--border)" }}><ClipboardList className="h-3.5 w-3.5" /> Candidatures en attente</Link>
        <Link href="/admin/recherche-experts" className="rounded-full px-3.5 py-1.5 font-mono text-xs transition" style={{ backgroundColor: "#0A2540", color: "#F4F8FF" }}>Rechercher un expert (tous statuts)</Link>
      </div>

      <form method="GET" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Nom, email, spécialité, profession..."
          className="w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
        />
        {params.statut && <input type="hidden" name="statut" value={params.statut} />}
        <button type="submit" className="btn-primary flex items-center gap-1.5 rounded-[6px] px-5 py-2.5 text-sm font-medium">
          <Search className="h-4 w-4" /> Chercher
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const isActive = (params.statut || "tous") === f.key;
          return (
            <Link
              key={f.key}
              href={buildUrl(f.key)}
              className="rounded-full px-3.5 py-1.5 font-mono text-xs transition"
              style={
                isActive
                  ? { backgroundColor: "#0A2540", color: "#F4F8FF" }
                  : { border: "1px solid var(--border)", color: "var(--text)" }
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-6 font-mono text-xs text-mutedmore">
        {experts.length} expert{experts.length !== 1 ? "s" : ""} trouvé{experts.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-4 space-y-3">
        {experts.map((expert: any) => {
          const statusInfo = STATUS_LABELS[expert.verification_status] || { label: expert.verification_status, color: "#666", bg: "#6661" };
          return (
            <div key={expert.id} className="card-soft flex flex-wrap items-center justify-between gap-3 p-4" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex items-center gap-3">
                {expert.photo_url && (
                  <img src={expert.photo_url} alt="" className="h-12 w-12 rounded-[6px] object-cover" style={{ border: "1px solid var(--border)" }} />
                )}
                <div>
                  <p className="font-medium">{expert.profiles?.full_name || "—"}</p>
                  <p className="text-sm text-muted">{expert.profiles?.email}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase text-mutedmore">
                    {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS] || expert.profession} · {expert.specialite}
                    {expert.ville ? ` · ${expert.ville}` : ""}
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 font-mono text-[11px] font-medium"
                style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
          );
        })}
        {experts.length === 0 && <p className="text-sm text-muted">Aucun résultat.</p>}
      </div>
    </main>
  );
}
