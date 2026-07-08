import Link from "next/link";
import Avatar from "@/components/Avatar";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS } from "@/lib/types";

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: expert } = await supabase
    .from("experts")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .eq("verification_status", "verified")
    .single();

  if (!expert) notFound();

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", id)
    .eq("is_booked", false)
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("expert_id", id)
    .order("created_at", { ascending: false });

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const color = PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-start gap-5">
        <Avatar name={expert.profiles?.full_name} profession={expert.profession} size={72} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color }}>
            {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium">{expert.profiles?.full_name}</h1>
          <p className="mt-1 text-muted">
            {expert.specialite} · {expert.experience_years} ans d'expérience
          </p>
          {avgRating && (
            <p className="mt-2 font-mono text-sm text-muted">
              ★ {avgRating.toFixed(1)} · {reviews!.length} avis
            </p>
          )}
        </div>
        <div className="card-soft p-5 text-center" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-2xl font-medium">{expert.price} €</p>
          <p className="font-mono text-[11px] text-mutedmore">par session</p>
          <Link
            href={`/booking/${expert.id}`}
            className="mt-3 block rounded-[3px] bg-ink px-5 py-2.5 text-sm font-medium text-parchment"
          >
            Réserver
          </Link>
        </div>
      </div>

      {expert.bio && <p className="mt-8 leading-relaxed text-muted">{expert.bio}</p>}

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-mutedmore">
        Créneaux disponibles ({slots?.length || 0})
      </h2>
      {!slots || slots.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Aucun créneau disponible actuellement.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {slots.map((slot) => (
            <Link
              key={slot.id}
              href={`/booking/${expert.id}?slot=${slot.id}`}
              className="flex items-center justify-between rounded-[3px] border px-4 py-3 transition"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-bg)" }}
            >
              <span>
                <span className="block text-sm capitalize">
                  {new Date(slot.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <span className="font-mono text-xs text-muted">
                  {slot.start_time} · {slot.duration_min} min
                </span>
              </span>
              <span className="font-mono text-xs" style={{ color: "#E07A3F" }}>Choisir →</span>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-mutedmore">
        Avis certifiés ({reviews?.length || 0})
      </h2>
      {!reviews || reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Aucun avis pour le moment.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card-soft p-4" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.profiles?.full_name}</span>
                <span className="font-mono text-xs" style={{ color: "#E07A3F" }}>★ {r.rating}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
