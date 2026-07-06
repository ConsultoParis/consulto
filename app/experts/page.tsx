import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS, type Expert, type Profession } from "@/lib/types";

export const revalidate = 30;

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ profession?: string; q?: string }>;
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
      <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: "#E07A3F" }}>Le registre</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Trouver un expert</h1>

      <form className="mt-8 flex flex-col gap-4 sm:flex-row" method="get">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Nom, spécialité..."
          className="flex-1 rounded-[3px] border px-4 py-2.5 text-[15px] outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--input-bg)", color: "var(--text)" }}
        />
        <select
          name="profession"
          defaultValue={params.profession || ""}
          className="rounded-[3px] border px-4 py-2.5 text-[15px] outline-none sm:w-64"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--input-bg)", color: "var(--text)" }}
        >
          <option value="">Toutes les professions</option>
          {(Object.keys(PROFESSION_LABELS) as Profession[]).map((p) => (
            <option key={p} value={p}>
              {PROFESSION_LABELS[p]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-[3px] bg-ink px-6 py-2.5 text-sm font-medium text-parchment">
          Rechercher
        </button>
      </form>

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
              <p
                className="font-mono text-[11px] uppercase tracking-[0.08em]"
                style={{ color: PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS] }}
              >
                {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
              </p>
              <p className="mt-1 font-display text-lg font-medium">{expert.profiles?.full_name}</p>
              <p className="text-sm text-muted">
                {expert.specialite} · {expert.experience_years} ans
              </p>
              <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#E07A3F" }}>
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