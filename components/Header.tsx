"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

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
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-parchment/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm text-parchment">
            C
          </div>
          <span className="font-display text-xl font-semibold">Consulto</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/experts" className="px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-seal">
            Trouver un expert
          </Link>
          <Link href="/devenir-expert" className="px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-seal">
            Devenir expert
          </Link>
          {user ? (
            <>
              <Link href="/dashboard/client" className="px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-seal">
                Mon espace
              </Link>
              <button onClick={handleLogout} className="px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-seal">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-seal">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="ml-1 rounded-full bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-parchment"
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
