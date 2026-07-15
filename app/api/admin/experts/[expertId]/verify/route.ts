import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendExpertWelcomeEmail } from "@/lib/email";

// POST /api/admin/experts/[expertId]/verify — réservé aux administrateurs.
// Valide le profil de l'expert et lui envoie automatiquement un email de
// bienvenue avec des conseils pour bien démarrer.
export async function POST(req: NextRequest, { params }: { params: Promise<{ expertId: string }> }) {
  const { expertId } = await params;
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

  const { data: expert } = await supabase
    .from("experts")
    .select("*, profiles(full_name, email)")
    .eq("id", expertId)
    .single();

  if (!expert) {
    return NextResponse.json({ error: "Expert introuvable" }, { status: 404 });
  }

  await supabase.from("experts").update({ verification_status: "verified" }).eq("id", expertId);

  if (expert.profiles?.email) {
    await sendExpertWelcomeEmail({
      to: expert.profiles.email,
      expertName: expert.profiles.full_name || "cher expert",
    });
  }

  return NextResponse.json({ success: true });
}
