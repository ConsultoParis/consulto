"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOublie() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        setLoading(false);
        return setError(checkData.error || "Une erreur est survenue");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      setLoading(false);
      if (resetError) return setError(resetError.message);
      setStep("code");
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Une erreur inattendue est survenue. Réessayez.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) return setError("Saisissez le code reçu par email");
    if (password.length < 6) return setError("6 caractères minimum");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas");
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "recovery",
      });
      if (verifyError) {
        setLoading(false);
        return setError("Code invalide ou expiré. Vérifiez le code reçu par email.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (updateError) return setError(updateError.message);

      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Une erreur inattendue est survenue. Réessayez.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Mon compte</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Mot de passe oublié</h1>

      {success ? (
        <div className="card-soft mt-8 p-6" style={{ backgroundColor: "var(--card)" }}>
          <p className="text-sm text-verified">Mot de passe mis à jour — redirection vers la connexion...</p>
        </div>
      ) : step === "email" ? (
        <form onSubmit={handleSendCode} className="mt-8 space-y-5">
          <p className="text-sm text-muted">
            Indiquez l'adresse email associée à votre compte, nous vous enverrons un code à 6 chiffres.
          </p>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Email</label>
            <input
              type="email"
              required
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.fr"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary rounded-[6px] py-3.5 text-sm font-medium"
          >
            {loading ? "Envoi..." : "Envoyer le code"}
          </button>
          <p className="text-center text-sm text-muted">
            <Link href="/connexion" className="underline decoration-seal decoration-2 underline-offset-4">
              Retour à la connexion
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
          <p className="text-sm text-muted">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le ci-dessous avec votre
            nouveau mot de passe.
          </p>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Code reçu par email</label>
            <input
              type="text"
              inputMode="numeric"
              required
              className="mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-center text-2xl tracking-[0.3em] outline-none focus:border-ink"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
            />
          </div>
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
            {loading ? "Validation..." : "Valider le nouveau mot de passe"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-center font-mono text-xs uppercase tracking-[0.1em] text-muted underline decoration-seal decoration-2 underline-offset-4"
          >
            Renvoyer un code
          </button>
        </form>
      )}
    </main>
  );
}
