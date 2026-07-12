"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      return setError("Email ou mot de passe incorrect");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);
    router.push(profile?.role === "expert" ? "/dashboard/expert" : "/dashboard/client");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Mon compte</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Connexion</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Email</label>
          <input
            type="email"
            className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.fr"
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Mot de passe</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary rounded-[6px] py-3.5 text-sm font-medium"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="underline decoration-seal decoration-2 underline-offset-4">
            Inscrivez-vous
          </Link>
        </p>
      </form>
    </main>
  );
}
