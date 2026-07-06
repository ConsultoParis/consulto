import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, experts(*, profiles(full_name)), documents(*)")
    .eq("client_id", user.id)
    .order("date", { ascending: false });

  const { data: reviews } = await supabase.from("reviews").select("booking_id").eq("client_id", user.id);
  const reviewedBookingIds = new Set(reviews?.map((r) => r.booking_id));

  const now = new Date();
  const upcoming = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) > now && b.status === "confirmed") || [];
  const past = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) <= now || b.status === "completed") || [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace client</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Mes rendez-vous</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card-soft bg-card p-5">
          <p className="font-display text-3xl font-semibold">{upcoming.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-slate">Prochains RDV</p>
        </div>
        <div className="card-soft bg-card p-5">
          <p className="font-display text-3xl font-semibold">{past.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-slate">Consultations passées</p>
        </div>
      </div>

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Tous mes rendez-vous</h2>
      <div className="mt-4 space-y-4">
        {bookings?.map((b: any) => {
          const isPast = new Date(`${b.date}T${b.start_time}`) <= now;
          const clientDocs = b.documents?.filter((d: any) => d.uploaded_by === "client") || [];
          const expertDocs = b.documents?.filter((d: any) => d.uploaded_by === "expert") || [];

          return (
            <div key={b.id} className="card-soft bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.experts?.profiles?.full_name}</p>
                  <p className="text-sm text-slate">
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
                      <p className="font-mono text-[11px] uppercase text-slate">
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
                    <p className="text-sm text-slate">Vous avez déjà laissé un avis.</p>
                  ) : (
                    <ReviewForm bookingId={b.id} expertId={b.expert_id} />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {(!bookings || bookings.length === 0) && (
          <p className="text-sm text-slate">Aucun rendez-vous pour le moment.</p>
        )}
      </div>
    </main>
  );
}
