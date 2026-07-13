"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import LogoAnimated from "@/components/LogoAnimated";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/experts", label: "Trouver un expert" },
  { href: "/devenir-expert", label: "Devenir expert" },
  { href: "/blog", label: "Blog" },
];

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

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur transition-colors"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--header-bg)" }}
      >
        <div className="divider-silver pointer-events-none absolute bottom-0 left-0 w-full" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo animé */}
          <LogoAnimated size="sm" />

          {/* Icônes, visibles sur toutes les tailles d'écran */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/experts"
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:scale-105 hover:border-[#3E8EF7] hover:shadow-[0_0_12px_-2px_rgba(62,142,247,0.5)]"
              style={{ borderColor: "var(--border)" }}
              title="Trouver un expert"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href={user ? "/dashboard/client" : "/connexion"}
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:scale-105 hover:border-[#3E8EF7] hover:shadow-[0_0_12px_-2px_rgba(62,142,247,0.5)]"
              style={{ borderColor: "var(--border)" }}
              title="Mon compte"
            >
              <UserIcon className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:scale-105 hover:border-[#3E8EF7] hover:shadow-[0_0_12px_-2px_rgba(62,142,247,0.5)]"
              style={{ borderColor: "var(--border)" }}
              title="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay menu — en dehors du <header> pour ne pas être affecté par son flou */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l"
            style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--border)", boxShadow: "-12px 0 40px -12px rgba(10,37,64,0.35)" }}
          >
            <div className="divider-silver pointer-events-none absolute left-0 top-0 w-full" />
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <span className="font-display text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:scale-105 hover:border-[#3E8EF7] hover:shadow-[0_0_12px_-2px_rgba(62,142,247,0.5)]"
                style={{ borderColor: "var(--border)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-[3px] px-3.5 py-3 text-sm transition-colors hover:bg-[#3E8EF7]/10"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: "#3E8EF7" }}
                  />
                  {l.label}
                </Link>
              ))}
              <div className="mt-auto pt-4">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-[3px] border px-3.5 py-3 text-left text-sm transition-colors hover:bg-[#3E8EF7]/10"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Déconnexion
                  </button>
                ) : (
                  <Link
                    href="/connexion"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary block w-full rounded-[3px] px-3.5 py-3 text-center text-sm font-medium"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
