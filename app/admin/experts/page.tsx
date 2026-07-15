import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminExpertActions from "@/components/AdminExpertActions";
import { PROFESSION_LABELS } from "@/lib/types";
import { FileText } from "lucide-react";

export default async function AdminExpertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (myProfile?.role !== "admin") redirect("/");

  const { data: pending } = await supabase
    .from("experts")
    .select("*, profiles(full_name, email), expert_documents(*)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  const withUrls = await Promise.all(
    (pending || []).map(async (expert: any) => {
      const docs = await Promise.all(
        (expert.expert_documents || []).map(async (d: any) => {
          const { data } = await supabase.storage.from("expert-documents").createSignedUrl(d.file_path, 3600);
          return { ...d, url: data?.signedUrl };
        })
      );
      return { ...expert, docsWithUrls: docs };
    })
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Administration</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Candidatures en attente</h1>

      {withUrls.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucune candidature en attente pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {withUrls.map((expert: any) => (
            <div key={expert.id} className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{expert.profiles?.full_name}</p>
                  <p className="text-sm text-muted">{expert.profiles?.email}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase text-mutedmore">
                    {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]} · {expert.specialite}
                    {expert.ville ? ` · ${expert.ville}` : ""}
                  </p>
                </div>
                <AdminExpertActions expertId={expert.id} />
              </div>

              {expert.bio && <p className="mt-3 text-sm text-muted">{expert.bio}</p>}

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
                {expert.numero_barreau && <span>Barreau : {expert.numero_barreau}</span>}
                {expert.numero_notaire && <span>Notaire : {expert.numero_notaire}</span>}
                {expert.numero_rpps && <span>RPPS : {expert.numero_rpps}</span>}
                {expert.numero_ordre_medecins && <span>Ordre médecins : {expert.numero_ordre_medecins}</span>}
                {expert.numero_siret && <span>SIRET : {expert.numero_siret}</span>}
                {expert.numero_ordre_comptable && <span>Ordre comptable : {expert.numero_ordre_comptable}</span>}
                {expert.certification && <span>Certification : {expert.certification}</span>}
              </div>

              {expert.docsWithUrls.length > 0 && (
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <p className="font-mono text-[11px] uppercase text-muted">Justificatifs</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {expert.docsWithUrls.map((d: any) => (
                      
                        key={d.id}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-app px-3 py-1.5 text-xs transition hover:border-[#3E8EF7]"
                      >
                        <FileText className="h-3.5 w-3.5" /> {d.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
