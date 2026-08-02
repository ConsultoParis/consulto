import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ expertId: string }> }) {
  const { expertId } = await params;
  const { reason } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (myProfile?.role !== "admin") {
    return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  }
  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: "Le motif du refus est requis" }, { status: 400 });
  }

  const admin = await createAdminClient();

  const { data: expert } = await admin
    .from("experts")
    .select("profiles!experts_id_fkey(full_name, email)")
    .eq("id", expertId)
    .single();

  await admin
    .from("experts")
    .update({ verification_status: "rejected", rejection_reason: reason })
    .eq("id", expertId);

  const expertEmail = (expert as any)?.profiles?.email;
  const expertName = (expert as any)?.profiles?.full_name || "cher candidat";

  if (expertEmail) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "contact@1expert.fr",
        to: expertEmail,
        subject: "Votre candidature 1Expert",
        html: `
          <p>Bonjour ${expertName},</p>
          <p>Après examen, nous ne sommes malheureusement pas en mesure de valider votre candidature en l'état, pour la raison suivante :</p>
          <blockquote style="border-left: 3px solid #3E8EF7; padding-left: 12px; color: #333;">${reason}</blockquote>
          <p>Vous pouvez corriger votre dossier et renvoyer une nouvelle candidature directement depuis votre espace expert sur 1Expert.fr.</p>
          <p>L'équipe 1Expert</p>
        `,
      });
    } catch (err) {
      console.error("Échec envoi email de refus:", err);
    }
  }

  return NextResponse.json({ success: true });
}
