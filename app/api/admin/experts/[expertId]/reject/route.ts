import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/admin/experts/[expertId]/reject — réservé aux administrateurs.
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

  await supabase.from("experts").update({ verification_status: "rejected" }).eq("id", expertId);

  return NextResponse.json({ success: true });
}
