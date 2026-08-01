import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDocumentsEmail } from "@/lib/email";
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bookingId = formData.get("bookingId") as string;
  const uploadedBy = formData.get("uploadedBy") as "client" | "expert";
  const documentType = formData.get("documentType") as string | null;
  if (!file || !bookingId) {
    return NextResponse.json({ error: "Fichier ou réservation manquant" }, { status: 400 });
  }
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .or(`client_id.eq.${user.id},expert_id.eq.${user.id}`)
    .single();
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }
  const filePath = `${bookingId}/${uploadedBy}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      booking_id: bookingId,
      uploaded_by: uploadedBy,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType || null,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (uploadedBy === "expert" && booking.status === "completed") {
    const { data: signedUrl } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);
    await sendDocumentsEmail({
      to: booking.client_email,
      expertName: "Votre expert",
      documentUrls: [{ name: file.name, url: signedUrl?.signedUrl || "" }],
    });
    await supabase.from("documents").update({ email_sent: true }).eq("id", doc.id);
  }
  return NextResponse.json({ document: doc });
}
