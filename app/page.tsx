import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS, type Expert } from "@/lib/types";

export const revalidate = 60; // régénère la page toutes les 60s (experts mis à jour)

export default async function HomePage() {
  const supabase = await createClient();

  const { data: experts } = await supabase
    .from("experts")
    .select("*, profiles(full_name, avatar_url)")
    .eq("verification_status", "verified")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(650px circle at 12% 10%, #F2A65A, transparent 60%), radial-gradient(550px circle at 88% 0%, #E0668A, transparent 55%), radial-gradient(600px circle at 55% 100%, #7A4B8C, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate">
            Registre d'experts vérifiés — France
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[38px] font-medium leading-[1.06] tracking-tight md:text-[62px]">
            Un vrai expert, en 20&nbsp;minutes, sans mauvaise surprise sur la facture.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate">
            Avocats, experts-comptables, coachs, thérapeutes et médecins généralistes — tous
            vérifiés, tous francophones, aucun abonnement caché.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/experts"
              className="rounded-[6px] bg-ink px-7 py-3.5 text-base font-semibold text-parchment shadow-md transition hover:-translate-y-0.5"
            >
              Trouver mon expert
            </Link>
            <Link
              href="/devenir-expert"
              className="font-mono text-xs uppercase tracking-[0.1em] text-slate underline decoration-seal decoration-2 underline-offset-4"
            >
              Proposer mes services en tant qu'expert
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTS VÉRIFIÉS */}
      <section className="border-b border-ink/10 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-medium">Des experts, pas des inconnus</h2>

          {!experts || experts.length === 0 ? (
            <p className="mt-6 text-sm text-slate">
              Les premiers experts vérifiés apparaîtront ici dès leur activation.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(experts as Expert[]).map((expert) => (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="card-soft overflow-hidden bg-card text-left"
                  style={{ borderTop: `3px solid ${PROFESSION_COLORS[expert.profession]}` }}
                >
                  <div className="p-5">
                    <p
                      className="font-mono text-[11px] uppercase tracking-[0.08em]"
                      style={{ color: PROFESSION_COLORS[expert.profession] }}
                    >
                      {PROFESSION_LABELS[expert.profession]}
                    </p>
                    <p className="mt-1 font-display text-lg font-medium">
                      {expert.profiles?.full_name}
                    </p>
                    <p className="text-sm text-slate">{expert.specialite}</p>
                    <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#E07A3F" }}>
                      {expert.price} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-medium">Cinq domaines, pas un de plus</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PROFESSION_LABELS) as Array<keyof typeof PROFESSION_LABELS>).map((key) => (
            <div
              key={key}
              className="card-soft bg-card p-6"
              style={{ borderTop: `3px solid ${PROFESSION_COLORS[key]}` }}
            >
              <h3 className="font-display text-xl font-medium">{PROFESSION_LABELS[key]}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
