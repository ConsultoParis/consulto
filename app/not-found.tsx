import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Erreur 404</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Page introuvable</h1>
      <p className="mt-3 text-muted">Cette page n'existe pas ou plus.</p>
      <Link href="/" className="btn-primary mt-6 inline-block rounded-[6px] px-6 py-3 text-sm font-medium">
        Retour à l'accueil
      </Link>
    </main>
  );
}
