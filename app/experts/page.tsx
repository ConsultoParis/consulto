import Link from "next/link";
import Avatar from "@/components/Avatar";
import ExpertSearchForm from "@/components/ExpertSearchForm";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS, type Expert } from "@/lib/types";

export const revalidate = 30;

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ profession?: string; q?: string; specialite?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("experts")
    .select("*, profiles(full_name, avatar_url)")
    .eq("verification_status", "verified");

  if (params.profession) {
    query = query.eq("profession", params.profession);
  }

  if (params.specialite) {
    query = query.eq("specialite", params.specialite);
  }

  const { data: experts } = await query.order("created_at", { ascending: false });

  const filtered = params.q
    ? (experts as Expert[] | null)?.filter(
        (e) =>
          e.specialite.toLowerCase().includes(params.q!.toLowerCase()) ||
          e.profiles?.full_name.toLowerCase().includes(params.q!.toLowerCase())
      )
    : experts;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: "#3E8EF7" }}>Le registre</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Trouver un expert</h1>

      <ExpertSearchForm defaultQ={params.q} defaultProfession={params.profession} defaultSpecialite={params.specialite} />

      <p className="mt-6 font-mono text-xs text-mutedmore">
        {filtered?.length || 0} expert{(filtered?.length || 0) !== 1 ? "s" : ""} trouvé
        {(filtered?.length || 0) !== 1 ? "s" : ""}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((expert) => (
          <Link
            key={expert.id}
            href={`/experts/${expert.id}`}
            className="card-soft overflow-hidden text-left"
            style={{ backgroundColor: "var(--card)", borderTop: `3px solid ${PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS]}` }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={expert.profiles?.full_name} profession={expert.profession} size={40} />
                <div>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.08em]"
                    style={{ color: PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS] }}
                  >
                    {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
                  </p>
                  <p className="font-display text-lg font-medium">{expert.profiles?.full_name}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {expert.specialite} · {expert.experience_years} ans
              </p>
              <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#3E8EF7" }}>
                {expert.price} €
              </p>
            </div>
          </Link>
        ))}
        {filtered?.length === 0 && (
          <p className="col-span-full text-sm text-muted">Aucun expert ne correspond à cette recherche.</p>
        )}
      </div>
    </main>
  );
}
