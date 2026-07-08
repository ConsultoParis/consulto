import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import ReferralCode from "@/components/ReferralCode";
import { PROFESSION_LABELS, PROFESSION_COLORS } from "@/lib/types";
import { Search, Calendar, MessageCircle, Heart, Wallet, Gift } from "lucide-react";

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

  const now = new Date();
  const upcoming = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) > now && b.status === "confirmed") || [];
  const past = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) <= now || b.status === "completed") || [];
  const hasNoBookings = !bookings || bookings.length === 0;

  const referralCode = profile?.referral_code || `1EXPERT-${user.id.slice(0, 6).toUpperCase()}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace client</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Mes rendez-vous</h1>

      {/* 1. État vide avec bouton d'action */}
      {hasNoBookings && (
        <div className="card-soft mt-8 p-8 text-center" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-xl font-medium">Vous n'avez pas encore de rendez-vous</p>
          <p className="mt-2 text-sm text-muted">
            Trouvez un professionnel vérifié et réservez une consultation en quelques minutes.
          </p>
          <Link
            href="/experts"
            className="mt-5 inline-block rounded-[6px] px-7 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ backgroundColor: "#3B1F35", color: "#FBEEE0" }}
          >
            Trouver mon expert
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{upcoming.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Prochains RDV</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{past.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Consultations passées</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{favorites?.length || 0}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Favoris</p>
        </div>
        {/* 3. Crédits fidélité */}
        <div className="card-soft p-5" style={{ backgroundColor: "#E07A3F0F" }}>
          <p className="flex items-center gap-1 font-display text-3xl font-semibold" style={{ color: "#E07A3F" }}>
            {Number(profile?.credits_balance || 0).toFixed(0)} €
          </p>
          <p className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase" style={{ color: "#E07A3F" }}>
            <Wallet className="h-3 w-3" /> Crédits fidélité
          </p>
        </div>
      </div>

      {/* 7. Compléter mon profil */}
      {profile && !profile.phone && (
        <div className="card-soft mt-8 p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-medium">Complétez votre profil</p>
          <p className="mt-1 text-sm text-muted">Ajoutez votre numéro de téléphone pour faciliter le contact avec les experts.</p>
          <CompleteProfileForm userId={user.id} />
        </div>
      )}

      {/* 2. Mes favoris */}
      {favorites && favorites.length > 0 && (
        <>
          <h2 className="mt-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <Heart className="h-3.5 w-3.5" /> Mes favoris
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {favorites.map((f: any) => (
              <Link
                key={f.expert_id}
                href={`/experts/${f.expert_id}`}
                className="card-soft flex items-center justify-between p-4"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div>
                  <p className="font-medium">{f.experts?.profiles?.full_name}</p>
                  <p className="text-sm text-muted">
                    {PROFESSION_LABELS[f.experts?.profession as keyof typeof PROFESSION_LABELS]} · {f.experts?.specialite}
                  </p>
                </div>
                <Heart className="h-4 w-4 shrink-0 fill-current" style={{ color: "#E07A3F" }} />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 4. Experts recommandés */}
      {recommended && recommended.length > 0 && (
        <>
          <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Experts à découvrir</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((expert: any) => (
              <Link
                key={expert.id}
                href={`/experts/${expert.id}`}
                className="card-soft overflow-hidden p-5 text-left"
                style={{ backgroundColor: "var(--card)", borderTop: `3px solid ${PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS]}` }}
              >
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.08em]"
                  style={{ color: PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS] }}
                >
                  {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
                </p>
                <p className="mt-1 font-display text-lg font-medium">{expert.profiles?.full_name}</p>
                <p className="text-sm text-muted">{expert.specialite}</p>
                <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#E07A3F" }}>
                  {expert.price} €
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 5. Parrainage */}
      <div className="card-soft mt-10 p-5" style={{ backgroundColor: "var(--card)" }}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          <Gift className="h-4 w-4" /> Parrainage
        </h3>
        <p className="mt-2 text-sm text-muted">
          Partagez votre code : votre filleul reçoit 10 € offerts sur sa première session, vous recevez 10 € de crédit dès qu'il en profite.
        </p>
        <ReferralCode code={referralCode} />
      </div>

      {/* 9. Comment ça marche */}
      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Comment ça marche</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <Search className="h-5 w-5" style={{ color: "#3457A6" }} />
          <p className="mt-2 font-medium">1. Choisissez un expert</p>
          <p className="mt-1 text-sm text-muted">Parcourez les profils vérifiés selon votre besoin.</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <Calendar className="h-5 w-5" style={{ color: "#D98A1F" }} />
          <p className="mt-2 font-medium">2. Réservez un créneau</p>
          <p className="mt-1 text-sm text-muted">20 à 30 minutes, au prix affiché, sans surprise.</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <MessageCircle className="h-5 w-5" style={{ color: "#1E8F6B" }} />
          <p className="mt-2 font-medium">3. Consultez</p>
          <p className="mt-1 text-sm text-muted">En visio, par tchat ou en physique, selon votre choix.</p>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {!hasNoBookings && (
        <>
          <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Tous mes rendez-vous</h2>
          <div className="mt-4 space-y-4">
            {bookings?.map((b: any) => {
              const isPast = new Date(`${b.date}T${b.start_time}`) <= now;
              const clientDocs = b.documents?.filter((d: any) => d.uploaded_by === "client") || [];
              const expertDocs = b.documents?.filter((d: any) => d.uploaded_by === "expert") || [];

              return (
                <div key={b.id} className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{b.experts?.profiles?.full_name}</p>
                      <p className="text-sm text-muted">
                        {new Date(b.date).toLocaleDateString("fr-FR")} à {b.start_time}
                      </p>
                    </div>
                    <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 font-mono text-[11px]">
                      {b.status === "completed" || isPast ? "Terminé" : "À venir"}
                    </span>
                  </div>

                  {(clientDocs.length > 0 || expertDocs.length > 0) && (
                    <div className="mt-3 grid grid-cols-1 gap-4 border-t border-ink/10 pt-3 sm:grid-cols-2">
                      {clientDocs.length > 0 && (
                        <div>
                          <p className="font-mono text-[11px] uppercase text-muted">
                            Vos pièces transmises ({clientDocs.length})
                          </p>
                        </div>
                      )}
                      {expertDocs.length > 0 && (
                        <div>
                          <p className="font-mono text-[11px] uppercase text-verified">
                            Documents de l'expert ({expertDocs.length})
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {isPast && b.status !== "cancelled_by_client" && b.status !== "cancelled_by_expert" && (
                    <div className="mt-4 border-t border-ink/10 pt-4">
                      {reviewedBookingIds.has(b.id) ? (
                        <p className="text-sm text-muted">Vous avez déjà laissé un avis.</p>
                      ) : (
                        <ReviewForm bookingId={b.id} expertId={b.expert_id} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
