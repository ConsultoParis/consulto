import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

export async function GET(req: NextRequest) {
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

    const { data: clientSubs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", b.client_id);

    for (const sub of clientSubs || []) {
      await sendPushNotification(sub, {
        title: "Rappel de rendez-vous",
        body: `Votre consultation avec ${expertName} a lieu le ${dateStr} à ${b.start_time}.`,
        url: `/consultation/${b.id}`,
      });
    }

    const { data: expertSubs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", b.expert_id);

    for (const sub of expertSubs || []) {
      await sendPushNotification(sub, {
        title: "Rappel de rendez-vous",
        body: `Votre consultation avec ${clientName} a lieu le ${dateStr} à ${b.start_time}.`,
        url: `/consultation/${b.id}`,
      });
    }

    await supabase.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
    sent++;
  }

  return NextResponse.json({ sent });
}
