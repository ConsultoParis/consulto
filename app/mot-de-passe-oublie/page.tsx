"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOublie() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");

    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        setStatus("idle");
        setError(checkData.error || "Une erreur est survenue");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });

      if (resetError) {
        setStatus("idle");
        setError(resetError.message);
        return;
      }

      setStatus("sent");
    } catch (err: any) {
      setStatus("idle");
      setError(err?.message || "Une erreur inattendue est survenue. Réessayez.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Mon compte</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Mot de passe oublié</h1>

      {status === "sent" ? (
        <div className="card-soft mt-8 p-6" style={{ backgroundColor: "var(--card)" }}>
          <p className="text-sm text-muted">
            Un email vient de vous être envoyé à <strong>{email}</strong> avec un lien pour choisir
            un nouveau mot de passe.
          </p>
          <Link href="/connexion" className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.1em] underline decoration-seal decoration-2 underline-offset-4">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <p className="text-sm text-muted">
            Indiquez l'adresse email associée à votre compte, nous vous enverrons un lien pour
            choisir un nouveau mot de passe.
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
            disabled={status === "sending"}
            className="w-full btn-primary rounded-[6px] py-3.5 text-sm font-medium"
          >
            {status === "sending" ? "Envoi..." : "Envoyer le lien"}
          </button>
          <p className="text-center text-sm text-muted">
            <Link href="/connexion" className="underline decoration-seal decoration-2 underline-offset-4">
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
