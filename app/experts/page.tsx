import Link from "next/link";
import Avatar from "@/components/Avatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import ExpertSearchForm from "@/components/ExpertSearchForm";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS, type Expert } from "@/lib/types";
import { distanceKm } from "@/lib/geo";
import { MapPin, Star } from "lucide-react";

export const revalidate = 30;

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ profession?: string; q?: string; specialite?: string; ville?: string; lat?: string; lng?: string; tri?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("experts")
    .select("*, profiles(full_name, avatar_url), reviews(rating)")
    .eq("verification_status", "verified");

  if (params.profession) {
    query = query.eq("profession", params.profession);
  }

  if (params.specialite) {
    query = query.eq("specialite", params.specialite);
  }

  const { data: expertsRaw } = await query.order("created_at", { ascending: false });

  let experts = (expertsRaw as any[] | null) || [];

  if (params.q) {
    experts = experts.filter(
      (e) =>
        e.specialite.toLowerCase().includes(params.q!.toLowerCase()) ||
        e.profiles?.full_name.toLowerCase().includes(params.q!.toLowerCase())
    );
  }

  const searchLat = params.lat ? parseFloat(params.lat) : null;
  const searchLng = params.lng ? parseFloat(params.lng) : null;
  const hasLocation = searchLat !== null && searchLng !== null && !isNaN(searchLat) && !isNaN(searchLng);

  const withDistance = experts.map((e: any) => {
    const ratings = (e.reviews || []).map((r: any) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : null;
    return {
      ...e,
      avgRating,
      reviewCount: ratings.length,
      distance: hasLocation && e.lat && e.lng ? distanceKm(searchLat!, searchLng!, e.lat, e.lng) : null,
    };
  });

  let sorted = [...withDistance];

  if (params.tri === "prix_asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (params.tri === "prix_desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (params.tri === "note") {
    sorted.sort((a, b) => {
      if (a.avgRating === null) return 1;
      if (b.avgRating === null) return -1;
      return b.avgRating - a.avgRating;
    });
  } else if (hasLocation) {
    sorted.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: "#3E8EF7" }}>Le registre</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Trouver un expert</h1>

      <ExpertSearchForm
        defaultQ={params.q}
        defaultProfession={params.profession}
        defaultSpecialite={params.specialite}
        defaultVille={params.ville}
        defaultTri={params.tri}
      />

      <p className="mt-6 font-mono text-xs text-mutedmore">
        {sorted.length} expert{sorted.length !== 1 ? "s" : ""} trouvé{sorted.length !== 1 ? "s" : ""}
        {hasLocation ? " · trié par proximité" : ""}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((expert: any) => (
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

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <VerifiedBadge size="sm" />
                {expert.avgRating !== null && (
                  <span className="flex items-center gap-1 font-mono text-xs text-muted">
                    <Star className="h-3 w-3 fill-current" style={{ color: "#3E8EF7" }} />
                    {expert.avgRating.toFixed(1)} ({expert.reviewCount})
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-muted">
                {expert.specialite} · {expert.experience_years} ans
              </p>
              {expert.ville && (
                <p className="mt-1 flex items-center gap-1 text-xs text-mutedmore">
                  <MapPin className="h-3 w-3" />
                  {expert.ville}
                  {expert.distance !== null && expert.distance !== undefined && ` · à ${Math.round(expert.distance)} km`}
                </p>
              )}
              <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#3E8EF7" }}>
                {expert.price} €
              </p>
            </div>
          </Link>
        ))}
        {sorted.length === 0 && (
          <p className="col-span-full text-sm text-muted">Aucun expert ne correspond à cette recherche.</p>
        )}
      </div>
    </main>
  );
}
