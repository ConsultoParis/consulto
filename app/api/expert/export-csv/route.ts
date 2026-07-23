import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string) {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles(full_name)")
    .eq("expert_id", user.id)
    .order("date", { ascending: false });

  const rows = [
    ["Date", "Heure", "Client", "Statut", "Prix total (€)", "Votre part (80%, €)"].join(";"),
  ];

  (bookings || []).forEach((b: any) => {
    const statusLabel =
      b.status === "completed"
        ? "Terminée — payée"
        : b.status === "confirmed"
        ? "À venir"
        : b.status === "cancelled_by_client"
        ? "Annulée (client)"
        : "Annulée (expert)";
    const yourShare = b.status === "completed" ? (Number(b.price) * 0.8).toFixed(2) : "0.00";
    rows.push(
      [
        b.date,
        b.start_time,
        csvEscape(b.profiles?.full_name || "Client"),
        statusLabel,
        Number(b.price).toFixed(2),
        yourShare,
      ].join(";")
    );
  });

  const csv = "\uFEFF" + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="1expert-revenus-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
