import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BookingChat from "@/components/BookingChat";
import VideoCall from "@/components/VideoCall";
import { Calendar, ArrowLeft } from "lucide-react";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, profiles(full_name), experts(*, profiles(full_name))")
    .eq("id", bookingId)
    .single();

  if (!booking) notFound();

  // Sécurité : seuls le client et l'expert concernés peuvent accéder à cette page.
  const isClient = booking.client_id === user.id;
  const isExpert = booking.expert_id === user.id;
  if (!isClient && !isExpert) notFound();

  const myName = isClient ? "Vous" : booking.experts?.profiles?.full_name || "Vous";
  const otherPartyName = isClient
    ? booking.experts?.profiles?.full_name || "l'expert"
    : booking.profiles?.full_name || "le client";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={isClient ? "/dashboard/client" : "/dashboard/expert"}
        className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Retour à mon espace
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-seal">Consultation</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Avec {otherPartyName}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
        <Calendar className="h-4 w-4" />
        {new Date(booking.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à{" "}
        {booking.start_time}
      </p>

      {booking.mode === "video" && (
        <div className="mt-8">
          <VideoCall bookingId={booking.id} displayName={myName} />
        </div>
      )}

      <div className="mt-8">
        <BookingChat bookingId={booking.id} userId={user.id} otherPartyName={otherPartyName} />
      </div>
    </main>
  );
}
