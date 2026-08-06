"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ReinitialiserMotDePasseInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkLink() {
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setLinkError("Ce lien est invalide ou a expiré. Refaites une demande de réinitialisation.");
          return;
        }
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setReady(true);
        }
      });
      return () => listener.subscription.unsubscribe();
    }
    checkLink();
  }, [searchParams, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("6 caractères minimum");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setSuccess(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Mon compte</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Nouveau mot de passe</h1>

      {success ? (
        <div className="card-soft mt-8 p-6" style={{ backgroundColor: "var(--card)" }}>
          <p className="text-sm text-verified">Mot de passe mis à jour — redirection vers la connexion...</p>
        </div>
      ) : linkError ? (
        <div className="card-soft mt-8 p-6" style={{ backgroundColor: "var(--card)" }}>
          <p className="text-sm text-red-700">{linkError}</p>
          <a href="/mot-de-passe-oublie" className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.1em] underline decoration-seal decoration-2 underline-offset-4">Refaire une demande</a>
        </div>
      ) : !ready ? (
        <p className="mt-8 text-sm text-muted">Vérification du lien en cours...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Nouveau mot de passe</label>
            <input
              type="password"
              required
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary rounded-[6px] py-3.5 text-sm font-medium"
          >
            {loading ? "Enregistrement..." : "Valider le nouveau mot de passe"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function ReinitialiserMotDePasse() {
  return (
    <Suspense fallback={null}>
      <ReinitialiserMotDePasseInner />
    </Suspense>
  );
}
