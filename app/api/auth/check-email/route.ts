import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.trim()) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Email non enregistré" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
