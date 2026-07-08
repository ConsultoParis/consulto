import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddSlotForm from "@/components/AddSlotForm";
import SendDocumentsForm from "@/components/SendDocumentsForm";
import CompleteBookingButton from "@/components/CompleteBookingButton";
import CompleteExpertProfileForm from "@/components/CompleteExpertProfileForm";
import { Star, Calendar, Eye, Award, TrendingUp, Zap, PlusCircle, CheckCircle2, Wallet } from "lucide-react";

export default async function ExpertDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: expert } = await supabase.from("experts").select("*, profiles(full_name)").eq("id", user.id).single();

  if (!expert) {
    redirect("/devenir-expert");
  }

  if (expert.verification_status !== "verified") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="card-soft p-8" style={{ backgroundColor: "var(--card)" }}>
          <h1 className="font-display text-2xl font-medium">Candidature en cours de vérification</h1>
          <p className="mt-2 text-muted">
            Votre dossier est en cours d'examen. Vous recevrez un email dès que votre profil sera activé.
          </p>
        </div>
      </main>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles(full_name), documents(*)")
    .eq("expert_id", user.id)
    .order("date", { ascending: false });

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", user.id)
    .order("date", { ascending: true });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("expert_id", user.id)
    .order("created_at", { ascending: false });

  const now = new Date();
  const completed = bookings?.filter((b) => b.status === "completed") || [];
  const upcoming = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) > now && b.status === "confirmed") || [];
  const revenusReverses = completed.reduce((s, b) => s + Number(b.price), 0);
  const revenusSequestre = upcoming.reduce((s, b) => s + Number(b.price), 0);
  const freeSlots = slots?.filter((s) => !s.is_booked) || [];
  const hasNothingYet = (!bookings || bookings.length === 0) && freeSlots.length === 0;

  const avgRating = reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const satisfaction = avgRating ? Math.round((avgRating / 5) * 100) : null;

  const nextBooking = [...upcoming].sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))[0];

  const slotsByDate: Record<string, typeof freeSlots> = {};
  freeSlots.forEach((s) => {
    slotsByDate[s.date] = slotsByDate[s.date] || [];
    slotsByDate[s.date].push(s);
  });

  const badges: { label: string; icon: any; color: string }[] = [];
  if (avgRating && avgRating >= 4.7) badges.push({ label: "Top Expert", icon: Award, color: "#E07A3F" });
  if (completed.length >= 10) badges.push({ label: "Expert confirmé", icon: TrendingUp, color: "#3457A6" });
  if (freeSlots.length > 0) badges.push({ label: "Disponible", icon: Zap, color: "#1E8F6B" });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace expert</p>
          <h1 className="mt-3 font-display text-3xl font-medium">Tableau de bord</h1>
        </div>
        <Link
          href={`/experts/${expert.id}`}
          className="flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition hover:bg-ink/5"
        >
          <Eye className="h-3.5 w-3.5" /> Voir mon profil public
        </Link>
      </div>

      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px]"
                style={{ backgroundColor: `${b.color}15`, color: b.color }}
              >
                <Icon className="h-3 w-3" /> {b.label}
              </span>
            );
          })}
        </div>
      )}

      {hasNothingYet && (
        <div className="card-soft mt-8 p-8 text-center" style={{ backgroundColor: "var(--card)" }}>
          <PlusCircle className="mx-auto h-8 w-8" style={{ color: "#E07A3F" }} />
          <p className="mt-3 font-display text-xl font-medium">Ajoutez vos premiers créneaux</p>
          <p className="mt-2 text-sm text-muted">
            Vos disponibilités apparaissent immédiatement dans le registre — les clients pourront réserver dès aujourd'hui.
          </p>
        </div>
      )}

      {nextBooking && (
        <div className="card-soft mt-8 p-5" style={{ backgroundColor: "#1E8F6B0F", border: "1px solid #1E8F6B30" }}>
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "#1E8F6B" }}>
            <Calendar className="h-3.5 w-3.5" /> Prochain rendez-vous
          </p>
          <p className="mt-1 font-display text-lg font-medium">{nextBooking.profiles?.full_name}</p>
          <p className="text-sm text-muted">
            {new Date(nextBooking.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {nextBooking.start_time}
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-soft bg-verified/5 p-5">
          <p className="flex items-center gap-1 font-display text-3xl font-semibold text-verified">
            <Wallet className="h-5 w-5" /> {revenusReverses} €
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase text-verified">Revenus reversés</p>
        </div>
        <div className="card-soft bg-seal/5 p-5">
          <p className="font-display text-3xl font-semibold text-seal">{revenusSequestre} €</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-seal">En séquestre</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="flex items-center gap-1 font-display text-3xl font-semibold">
            {avgRating ? avgRating.toFixed(1) : "—"}
            {avgRating && <Star className="h-5 w-5 fill-current" style={{ color: "#E07A3F" }} />}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">{reviews?.length || 0} avis</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{satisfaction ? `${satisfaction}%` : "—"}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Satisfaction</p>
        </div>
      </div>

      {!expert.bio && (
        <div className="card-soft mt-8 p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-medium">Complétez votre profil</p>
          <p className="mt-1 text-sm text-muted">Ajoutez une présentation : c'est souvent la première chose que lit un client avant de réserver.</p>
          <CompleteExpertProfileForm expertId={expert.id} />
        </div>
      )}

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Ajouter un créneau</h2>
      <div className="mt-3 card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
        <AddSlotForm expertId={user.id} />
      </div>

      {freeSlots.length > 0 && (
        <>
          <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Mes créneaux disponibles</h2>
          <div className="mt-3 space-y-3">
            {Object.entries(slotsByDate).map(([date, daySlots]) => (
              <div key={date} className="card-soft p-4" style={{ backgroundColor: "var(--card)" }}>
                <p className="font-mono text-[11px] uppercase text-muted">
                  {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <span key={s.id} className="rounded-[3px] border border-ink/15 px-2.5 py-1 font-mono text-xs">
                      {s.start_time} · {s.duration_min} min
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Consultations</h2>
      <div className="mt-4 space-y-4">
        {bookings?.map((b: any) => {
          const isPast = new Date(`${b.date}T${b.start_time}`) <= now;
          const clientDocs = b.documents?.filter((d: any) => d.uploaded_by === "client") || [];
          const expertDocs = b.documents?.filter((d: any) => d.uploaded_by === "expert") || [];

          return (
            <div key={b.id} className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.profiles?.full_name}</p>
                  <p className="text-sm text-muted">
                    {new Date(b.date).toLocaleDateString("fr-FR")} à {b.start_time}
                  </p>
                </div>
                <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 font-mono text-[11px]">
                  {b.status === "completed" ? "Terminée" : isPast ? "À clôturer" : "À venir"}
                </span>
              </div>

              {clientDocs.length > 0 && (
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <p className="font-mono text-[11px] uppercase text-muted">
                    Pièces transmises par le client ({clientDocs.length})
                  </p>
                  <ul className="mt-1 text-sm text-muted">
                    {clientDocs.map((d: any) => (
                      <li key={d.id}>{d.file_name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isPast && b.status === "confirmed" && (
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <CompleteBookingButton bookingId={b.id} />
                </div>
              )}

              {b.status === "completed" && (
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <p className="font-mono text-[11px] uppercase text-muted">Envoyer des documents au client</p>
                  <p className="mt-1 text-xs text-muted">
                    Ajoutés à son espace 1Expert et envoyés par email à {b.client_email}.
                  </p>
                  <div className="mt-2">
                    <SendDocumentsForm bookingId={b.id} existing={expertDocs} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {(!bookings || bookings.length === 0) && (
          <p className="text-sm text-muted">Aucune consultation pour le moment.</p>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <>
          <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Derniers avis</h2>
          <div className="mt-4 space-y-3">
            {reviews.slice(0, 5).map((r: any) => (
              <div key={r.id} className="card-soft p-4" style={{ backgroundColor: "var(--card)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.profiles?.full_name}</span>
                  <span className="flex items-center gap-1 font-mono text-xs" style={{ color: "#E07A3F" }}>
                    <Star className="h-3 w-3 fill-current" /> {r.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Comment ça marche</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <PlusCircle className="h-5 w-5" style={{ color: "#3457A6" }} />
          <p className="mt-2 font-medium">1. Ajoutez des créneaux</p>
          <p className="mt-1 text-sm text-muted">Vos disponibilités sont visibles immédiatement par les clients.</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <Calendar className="h-5 w-5" style={{ color: "#D98A1F" }} />
          <p className="mt-2 font-medium">2. Recevez une réservation</p>
          <p className="mt-1 text-sm text-muted">Le paiement du client est conservé en séquestre.</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <CheckCircle2 className="h-5 w-5" style={{ color: "#1E8F6B" }} />
          <p className="mt-2 font-medium">3. Clôturez et soyez payé</p>
          <p className="mt-1 text-sm text-muted">Une fois la consultation marquée terminée, les fonds sont reversés.</p>
        </div>
      </div>
    </main>
  );
}
