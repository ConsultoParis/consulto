"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<"client" | "expert" | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) return setError("Choisissez si vous êtes client ou expert");
    if (!fullName.trim()) return setError("Indiquez votre nom");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères");

    setLoading(true);

    // 1. Crée le compte d'authentification Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

    // 2. Crée le profil associé (déclenché ici plutôt que par trigger SQL,
    //    pour rester simple à ce stade du projet)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      role,
      full_name: fullName,
      email,
    });

    if (profileError) {
      setLoading(false);
      return setError(profileError.message);
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
            className="w-full rounded-[6px] bg-ink py-3.5 text-sm font-medium text-parchment transition hover:opacity-90"
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
            className="font-mono text-xs uppercase tracking-[0.1em] text-slate"
          >
            ← Retour
          </button>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
              Nom complet
            </label>
            <input
              className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Camille Dubois"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
              Email
            </label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.fr"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
              Mot de passe
            </label>
            <input
              type="password"
              className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[6px] bg-ink py-3.5 text-sm font-medium text-parchment transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          {role === "expert" && (
            <p className="text-xs text-slate">
              Vous serez ensuite redirigé vers le formulaire de candidature
              expert (justificatifs professionnels selon votre métier).
            </p>
          )}
        </form>
      )}
    </main>
  );
}
