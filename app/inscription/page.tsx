"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [role, setRole] = useState<"client" | "expert" | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("role") === "expert") {
      setRole("expert");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) return setError("Choisissez si vous êtes client ou expert");
    if (!fullName.trim()) return setError("Indiquez votre nom");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères");

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role,
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setLoading(false);
      return setError(authError.message);
    }

    if (!authData.user) {
      setLoading(false);
      return setError("Une erreur est survenue, réessayez.");
    }

    setLoading(false);

    if (role === "expert") {
      router.push("/devenir-expert");
    } else {
      router.push("/dashboard/client");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Créer un compte</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Rejoindre 1Expert</h1>

      {!role ? (
        <div className="mt-8 space-y-3">
          <button
            onClick={() => setRole("client")}
            className="btn-primary w-full rounded-[6px] py-3.5 text-sm font-medium"
          >
            Je suis client
          </button>
          <button
            onClick={() => setRole("expert")}
            className="w-full rounded-[6px] border border-ink/20 py-3.5 text-sm font-medium transition hover:bg-ink/5"
          >
            Je suis expert
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
          >
            ← Retour
          </button>

          {role === "expert" && (
            <div className="rounded-[6px] border border-seal/40 bg-seal/5 p-4">
              <p className="text-sm text-muted">
                Vous créez un compte <strong>expert</strong> — vous serez redirigé vers le formulaire de
                candidature juste après.
              </p>
            </div>
          )}

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Nom complet
            </label>
            <input
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Camille Dubois"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Email
            </label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.fr"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Mot de passe
            </label>
            <input
              type="password"
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-[6px] py-3.5 text-sm font-medium"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>
      )}
    </main>
  );
}
