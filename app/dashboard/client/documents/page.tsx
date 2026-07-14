import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, FileText, Download } from "lucide-react";

export default async function ClientDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, date, experts(profiles(full_name)), documents(*)")
    .eq("client_id", user.id)
    .order("date", { ascending: false });

  const rows =
    bookings?.flatMap((b: any) =>
      (b.documents || [])
        .filter((d: any) => d.uploaded_by === "expert")
        .map((d: any) => ({ ...d, expertName: b.experts?.profiles?.full_name, bookingDate: b.date, bookingId: b.id }))
    ) || [];

  const withUrls = await Promise.all(
    rows.map(async (d: any) => {
      const { data } = await supabase.storage.from("documents").createSignedUrl(d.file_path, 3600);
      return { ...d, url: data?.signedUrl };
    })
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/dashboard/client" className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted">
        <ArrowLeft className="h-3.5 w-3.5" /> Retour à mon espace
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-seal">Espace client</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Mes documents</h1>
      <p className="mt-2 text-sm text-muted">Tous les documents transmis par vos experts, tous rendez-vous confondus.</p>

      {withUrls.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucun document reçu pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {withUrls.map((d: any) => (
            <div key={d.id} className="card-soft flex items-center justify-between p-4" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-5 w-5 shrink-0" style={{ color: "#3E8EF7" }} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.file_name}</p>
                  <p className="text-xs text-muted">
                    {d.expertName} · {new Date(d.bookingDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              {d.url && (
                
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all hover:border-[#3E8EF7] hover:shadow-[0_0_12px_-2px_rgba(62,142,247,0.5)]"
                  style={{ borderColor: "var(--border)" }}
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
