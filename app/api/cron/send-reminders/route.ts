import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email";

// GET /api/cron/send-reminders — appelé automatiquement par Vercel Cron
// (voir vercel.json). Envoie un rappel par email au client ET à l'expert
// pour chaque rendez-vous confirmé ayant lieu dans les 24 prochaines heures,
// et qui n'a pas encore reçu de rappel.
export async function GET(req: NextRequest) {
  // Sécurise l'endpoint : seul Vercel Cron (avec le bon secret) peut l'appeler.
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles(full_name), experts(*, profiles(full_name, email))")
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .gte("date", now.toISOString().slice(0, 10))
    .lte("date", in24h.toISOString().slice(0, 10));

  let sent = 0;

  for (const b of bookings || []) {
    const appointmentTime = new Date(`${b.date}T${b.start_time}`);
    if (appointmentTime < now || appointmentTime > in24h) continue;

    const dateStr = appointmentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const expertName = b.experts?.profiles?.full_name || "votre expert";
    const clientName = b.profiles?.full_name || "votre client";
    const expertEmail = b.experts?.profiles?.email;

    if (b.client_email) {
      await sendReminderEmail({
        to: b.client_email,
        otherPartyName: expertName,
        date: dateStr,
        time: b.start_time,
        bookingId: b.id,
      });
    }

    if (expertEmail) {
      await sendReminderEmail({
        to: expertEmail,
        otherPartyName: clientName,
        date: dateStr,
        time: b.start_time,
        bookingId: b.id,
      });
    }

    await supabase.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
    sent++;
  }

  return NextResponse.json({ sent });
}
