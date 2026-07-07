import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddSlotForm from "@/components/AddSlotForm";
import SendDocumentsForm from "@/components/SendDocumentsForm";
import CompleteBookingButton from "@/components/CompleteBookingButton";

export default async function ExpertDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: expert } = await supabase.from("experts").select("*").eq("id", user.id).single();

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

  const now = new Date();
  const completed = bookings?.filter((b) => b.status === "completed") || [];
  const upcoming = bookings?.filter((b) => new Date(`${b.date}T${b.start_time}`) > now && b.status === "confirmed") || [];
  const revenusReverses = completed.reduce((s, b) => s + Number(b.price), 0);
  const revenusSequestre = upcoming.reduce((s, b) => s + Number(b.price), 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace expert</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Tableau de bord</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-soft bg-verified/5 p-5">
          <p className="font-display text-3xl font-semibold text-verified">{revenusReverses} €</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-verified">Revenus reversés</p>
        </div>
        <div className="card-soft bg-seal/5 p-5">
          <p className="font-display text-3xl font-semibold text-seal">{revenusSequestre} €</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-seal">En séquestre</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{bookings?.length || 0}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Consultations</p>
        </div>
        <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
          <p className="font-display text-3xl font-semibold">{slots?.filter((s) => !s.is_booked).length || 0}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-muted">Créneaux libres</p>
        </div>
      </div>

      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Ajouter un créneau</h2>
      <div className="mt-3 card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
        <AddSlotForm expertId={user.id} />
      </div>

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
    </main>
  );
}
