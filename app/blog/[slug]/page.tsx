import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_LABELS } from "@/lib/types";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, experts(profession, profiles(full_name))")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const profession = post.experts?.profession;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-seal">
        {profession ? PROFESSION_LABELS[profession as keyof typeof PROFESSION_LABELS] : ""} · {post.read_minutes} min de lecture
      </p>
      <h1 className="mt-2 font-display text-3xl font-medium leading-tight">{post.title}</h1>
      <p className="mt-4 text-sm text-slate">Par {post.experts?.profiles?.full_name}</p>

      <div className="mt-8 space-y-4 leading-relaxed text-slate whitespace-pre-line">{post.content}</div>
    </main>
  );
}
