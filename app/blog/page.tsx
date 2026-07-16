import Link from "next/link";
import Avatar from "@/components/Avatar";
import ImageCarousel from "@/components/ImageCarousel";
import PresentationVideo from "@/components/PresentationVideo";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS, PROFESSION_COLORS } from "@/lib/types";

export const revalidate = 300;

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*, experts(profession, profiles(full_name))")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(500px circle at 95% 0%, #123b64, transparent 55%), radial-gradient(450px circle at 5% 30%, #3E8EF7, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Blog</p>
          <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">Conseils écrits par nos experts</h1>
          <p className="mt-3 max-w-xl text-muted">Des conseils concrets, écrits par les professionnels vérifiés du registre.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pb-10">
        <PresentationVideo />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <ImageCarousel
          images={[
            { src: "/carousel-1.jpg", alt: "1Expert", caption: "Paiement sécurisé en séquestre" },
            { src: "/carousel-2.jpg", alt: "1Expert", caption: "Aucun abonnement caché" },
            { src: "/carousel-5.jpg", alt: "1Expert", caption: "Chaque expert est vérifié" },
          ]}
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts?.map((post: any) => {
            const profession = post.experts?.profession;
            const color = profession ? PROFESSION_COLORS[profession as keyof typeof PROFESSION_COLORS] : "#0A2540";
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card-soft overflow-hidden p-6 text-left"
                style={{ backgroundColor: "var(--card)", borderTop: `3px solid ${color}` }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color }}>
                  {profession ? PROFESSION_LABELS[profession as keyof typeof PROFESSION_LABELS] : ""} · {post.read_minutes} min
                </p>
                <h3 className="mt-2 font-display text-lg font-medium leading-snug">{post.title}</h3>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Avatar name={post.experts?.profiles?.full_name} profession={profession} size={28} />
                  <p className="font-mono text-[11px] text-muted">{post.experts?.profiles?.full_name}</p>
                </div>
              </Link>
            );
          })}
          {(!posts || posts.length === 0) && (
            <p className="col-span-full text-sm text-muted">Aucun article publié pour le moment.</p>
          )}
        </div>
      </div>
    </main>
  );
}
