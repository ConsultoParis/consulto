import Link from "next/link";
import Avatar from "@/components/Avatar";
import ImageCarousel from "@/components/ImageCarousel";
import LogoAnimated from "@/components/LogoAnimated";
import { Sparkles, Star, Lock, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS, type Expert } from "@/lib/types";

export const revalidate = 60;

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
              "radial-gradient(650px circle at 12% 10%, #3E8EF7, transparent 60%), radial-gradient(550px circle at 88% 0%, #123b64, transparent 55%), radial-gradient(600px circle at 55% 100%, #0A2540, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-20">
          <div className="mb-8 flex justify-center md:justify-start">
            <LogoAnimated size="lg" />
          </div>
          <p className="flex items-center gap-1.5 font-mono text-xs font-medium" style={{ color: "#3E8EF7" }}>
            <Sparkles className="h-3.5 w-3.5" /> Plus de 10&nbsp;000 consultations réalisées
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-mutedmore">
            Registre d'experts vérifiés — France
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[38px] font-medium leading-[1.06] tracking-tight md:text-[62px]">
            Un vrai expert, en 20&nbsp;minutes, sans mauvaise surprise sur la facture.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Avocats, experts-comptables, coachs, thérapeutes et médecins généralistes — tous
            vérifiés, tous francophones, aucun abonnement caché.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <Star className="h-4 w-4" style={{ color: "#3E8EF7" }} /> 2&nbsp;500 experts vérifiés
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <Lock className="h-4 w-4" style={{ color: "#3E8EF7" }} /> Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <Globe className="h-4 w-4" style={{ color: "#3E8EF7" }} /> Experts basés en France
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/experts"
              className="rounded-[6px] px-7 py-3.5 text-base font-semibold transition hover:-translate-y-0.5"
              style={{ backgroundColor: "#0A2540", color: "#F4F8FF", boxShadow: "0 6px 18px -6px rgba(10,37,64,0.45)" }}
            >
              Trouver mon expert
            </Link>
            <Link
              href="/devenir-expert"
              className="font-mono text-xs uppercase tracking-[0.1em] text-muted underline decoration-[#3E8EF7] decoration-2 underline-offset-4"
            >
              Proposer mes services en tant qu'expert
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTS VÉRIFIÉS */}
      <section className="border-b py-16" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: "#3E8EF7" }}>Le registre</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Des experts, pas des inconnus</h2>

          {!experts || experts.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Les premiers experts vérifiés apparaîtront ici dès leur activation.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(experts as Expert[]).map((expert) => (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="card-soft overflow-hidden text-left"
                  style={{ backgroundColor: "var(--card)", borderTop: `3px solid ${PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS]}` }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={expert.profiles?.full_name} profession={expert.profession} size={40} />
                      <div>
                        <p
                          className="font-mono text-[11px] uppercase tracking-[0.08em]"
                          style={{ color: PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS] }}
                        >
                          {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
                        </p>
                        <p className="font-display text-lg font-medium">{expert.profiles?.full_name}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">{expert.specialite}</p>
                    <p className="mt-3 font-display text-lg font-semibold" style={{ color: "#3E8EF7" }}>
                      {expert.price} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CARROUSEL */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <ImageCarousel
          images={[
            { src: "/carousel-5.jpg", alt: "1Expert", caption: "Chaque expert est vérifié" },
            { src: "/carousel-3.jpg", alt: "1Expert", caption: "Disponible immédiatement" },
            { src: "/carousel-4.jpg", alt: "1Expert", caption: "Consultation en 20 minutes" },
            { src: "/carousel-1.jpg", alt: "1Expert", caption: "Paiement sécurisé en séquestre" },
            { src: "/carousel-2.jpg", alt: "1Expert", caption: "Aucun abonnement caché" },
          ]}
        />
      </section>
    </main>
  );
}
