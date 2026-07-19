import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/", "/consultation/", "/booking/"],
    },
    sitemap: "https://1expert.fr/sitemap.xml",
  };
}
