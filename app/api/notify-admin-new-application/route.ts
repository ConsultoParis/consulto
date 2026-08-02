import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { expertId } = await req.json();
  if (!expertId) {
    return NextResponse.json({ error: "expertId manquant" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data: expert } = await admin
    .from("experts")
    .select("profession, specialite, ville, profiles!experts_id_fkey(full_name, email)")
    .eq("id", expertId)
    .single();

  if (!expert) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  const professionLabel = PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS] || expert.profession;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://1expert.fr";

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "contact@1expert.fr",
      to: "contact@1expert.fr",
      subject: `Nouvelle candidature expert — ${(expert as any).profiles?.full_name || "candidat"}`,
      html: `
        <p>Une nouvelle candidature expert vient d'être déposée sur 1Expert.</p>
        <ul>
          <li><strong>Nom :</strong> ${(expert as any).profiles?.full_name || "—"}</li>
          <li><strong>Email :</strong> ${(expert as any).profiles?.email || "—"}</li>
          <li><strong>Profession :</strong> ${professionLabel}</li>
          <li><strong>Spécialité :</strong> ${expert.specialite || "—"}</li>
          <li><strong>Ville :</strong> ${expert.ville || "—"}</li>
        </ul>
        <p><a href="${siteUrl}/admin/experts">Voir et valider la candidature →</a></p>
      `,
    });
  } catch (err) {
    console.error("Échec envoi email notification admin:", err);
  }

  return NextResponse.json({ success: true });
}
