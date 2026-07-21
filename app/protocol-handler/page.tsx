import { redirect } from "next/navigation";

export default async function ProtocolHandlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (q) {
    try {
      const decoded = decodeURIComponent(q);
      const match = decoded.match(/experts\/([a-zA-Z0-9-]+)/);
      if (match) {
        redirect(`/experts/${match[1]}`);
      }
    } catch {
      // lien mal formé, on retombe sur l'accueil ci-dessous
    }
  }

  redirect("/");
}
