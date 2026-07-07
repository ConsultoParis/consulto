"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/experts", label: "Trouver un expert" },
    { href: "/confiance", label: "Confiance" },
    { href: "/devenir-expert", label: "Devenir expert" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur transition-colors"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--header-bg)" }}
    >
      <div className="relative mx-auto max-w-6xl px-6 pb-3 pt-3">
        {/* Nav desktop — coin supérieur droit */}
        <nav className="hidden items-center justify-end gap-1 pb-2 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-[3px] px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition hover:opacity-70"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href={"/dashboard/client"}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
                style={{ borderColor: "var(--border)" }}
                title="Mon espace"
              >
                <UserIcon className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 font-mono text-xs uppercase tracking-[0.1em] underline decoration-[#E07A3F] decoration-2 underline-offset-4"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
              style={{ borderColor: "var(--border)" }}
              title="Connexion"
            >
              <UserIcon className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          )}
        </nav>

        {/* Icônes mobiles */}
        <div className="flex items-center justify-end gap-1.5 pb-2 md:hidden">
          <ThemeToggle />
          <Link
            href="/experts"
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
            title="Trouver un expert"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href={user ? "/dashboard/client" : "/connexion"}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
            title="Mon compte"
          >
            <UserIcon className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
            title="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Logo + wordmark, centrés */}
        <Link href="/" className="mx-auto flex items-center justify-center gap-2.5">
          <Image src="/logo-1expert-icon.png" alt="1Expert" width={44} height={40} className="h-10 w-auto sm:h-11" />
          <span className="font-display text-2xl font-semibold sm:text-3xl">1Expert</span>
        </Link>
      </div>

      {/* Overlay menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l"
            style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <span className="font-display text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--border)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-[3px] px-3.5 py-3 text-sm">
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button onClick={handleLogout} className="rounded-[3px] px-3.5 py-3 text-left text-sm">
                  Déconnexion
                </button>
              ) : (
                <Link href="/connexion" onClick={() => setMenuOpen(false)} className="rounded-[3px] px-3.5 py-3 text-sm">
                  Connexion
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
