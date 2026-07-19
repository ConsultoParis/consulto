import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://1expert.fr";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/experts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/devenir-expert`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/confiance`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const supabase = await createClient();

  const { data: experts } = await supabase
    .from("experts")
    .select("id")
    .eq("verification_status", "verified");

  const expertRoutes: MetadataRoute.Sitemap = (experts || []).map((e) => ({
    url: `${base}/experts/${e.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const { data: posts } = await supabase.from("blog_posts").select("slug").eq("published", true);

  const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...expertRoutes, ...blogRoutes];
}
