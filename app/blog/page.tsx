import Link from "next/link";
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
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Blog</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Conseils écrits par nos experts</h1>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts?.map((post: any) => {
          const profession = post.experts?.profession;
          const color = profession ? PROFESSION_COLORS[profession as keyof typeof PROFESSION_COLORS] : "#3B1F35";
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card-soft overflow-hidden bg-card p-6 text-left"
              style={{ borderTop: `3px solid ${color}` }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color }}>
                {profession ? PROFESSION_LABELS[profession as keyof typeof PROFESSION_LABELS] : ""} · {post.read_minutes} min
              </p>
              <h3 className="mt-2 font-display text-lg font-medium leading-snug">{post.title}</h3>
              <p className="mt-2 text-sm text-slate">{post.excerpt}</p>
              <p className="mt-4 font-mono text-[11px] text-slate">{post.experts?.profiles?.full_name}</p>
            </Link>
          );
        })}
        {(!posts || posts.length === 0) && (
          <p className="col-span-full text-sm text-slate">Aucun article publié pour le moment.</p>
        )}
      </div>
    </main>
  );
}
