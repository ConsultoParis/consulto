"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profession } from "@/lib/types";

const inputClass =
  "mt-1.5 w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink";

export default function DevenirExpertPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [profession, setProfession] = useState<Profession | "">("");
  const [specialite, setSpecialite] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [numeroBarreau, setNumeroBarreau] = useState("");
  const [numeroOrdreComptable, setNumeroOrdreComptable] = useState("");
  const [numeroAdeli, setNumeroAdeli] = useState("");
  const [numeroRpps, setNumeroRpps] = useState("");
  const [numeroOrdreMedecins, setNumeroOrdreMedecins] = useState("");
  const [certification, setCertification] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setCheckingAuth(false);
    });
  }, [supabase]);

  function validate() {
    if (!profession) return "Choisissez une profession";
    if (!specialite.trim()) return "Indiquez votre spécialité";
    if (!price || Number(price) <= 0) return "Indiquez un tarif par session";
    if (profession === "avocat" && !numeroBarreau.trim()) return "N° au Barreau requis";
    if (profession === "comptable" && !numeroOrdreComptable.trim()) return "N° d'inscription à l'Ordre requis";
    if (profession === "therapeute" && !numeroAdeli.trim()) return "N° ADELI requis";
    if (profession === "medecin") {
      if (!/^\d{11}$/.test(numeroRpps.trim())) return "Le N° RPPS doit comporter 11 chiffres";
      if (!numeroOrdreMedecins.trim()) return "N° d'inscription à l'Ordre des médecins requis";
    }
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (!userId) return setError("Vous devez être connecté pour candidater");

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("experts").insert({
      id: userId,
      profession,
      specialite,
      bio,
      price: Number(price),
      numero_barreau: profession === "avocat" ? numeroBarreau : null,
      numero_ordre_comptable: profession === "comptable" ? numeroOrdreComptable : null,
      numero_adeli: profession === "therapeute" ? numeroAdeli : null,
      numero_rpps: profession === "medecin" ? numeroRpps : null,
      numero_ordre_medecins: profession === "medecin" ? numeroOrdreMedecins : null,
      certification: profession === "coach" ? certification : null,
      verification_status: "pending",
    });

    setLoading(false);
    if (insertError) return setError(insertError.message);
    setSubmitted(true);
  }

  if (checkingAuth) return null;

  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-slate">
          Créez d'abord un compte pour déposer votre candidature d'expert.
        </p>
        <a href="/inscription" className="mt-4 inline-block rounded-[3px] bg-ink px-6 py-3 text-sm font-medium text-parchment">
          Créer mon compte
        </a>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="card-soft bg-verified/5 p-8">
          <h1 className="font-display text-2xl font-medium">Candidature enregistrée</h1>
          <p className="mt-2 text-slate">
            Votre dossier et vos justificatifs professionnels seront vérifiés manuellement avant
            l'activation de votre profil. Vous recevrez un email dès que c'est fait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Candidature expert</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Rejoindre le registre</h1>
      <p className="mt-3 text-slate">Chaque profil est vérifié manuellement avant mise en ligne.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Profession</label>
          <select
            className={inputClass}
            value={profession}
            onChange={(e) => setProfession(e.target.value as Profession)}
          >
            <option value="">Sélectionnez votre profession</option>
            <option value="avocat">Avocat</option>
            <option value="comptable">Expert-comptable</option>
            <option value="coach">Coach</option>
            <option value="therapeute">Thérapeute</option>
            <option value="medecin">Médecin généraliste</option>
          </select>
        </div>

        {profession === "medecin" && (
          <div className="rounded-[6px] border border-seal/40 bg-seal/5 p-5">
            <p className="text-sm text-slate">
              Conformément à la réglementation française sur la télémédecine, le N° RPPS et
              l'inscription à l'Ordre des médecins sont obligatoires et vérifiés avant activation.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">N° RPPS</label>
                <input
                  className={inputClass}
                  value={numeroRpps}
                  onChange={(e) => setNumeroRpps(e.target.value)}
                  placeholder="11 chiffres"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
                  N° Ordre des médecins
                </label>
                <input
                  className={inputClass}
                  value={numeroOrdreMedecins}
                  onChange={(e) => setNumeroOrdreMedecins(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {profession === "avocat" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">N° au Barreau</label>
            <input className={inputClass} value={numeroBarreau} onChange={(e) => setNumeroBarreau(e.target.value)} />
          </div>
        )}

        {profession === "comptable" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
              N° d'inscription à l'Ordre des experts-comptables
            </label>
            <input
              className={inputClass}
              value={numeroOrdreComptable}
              onChange={(e) => setNumeroOrdreComptable(e.target.value)}
            />
          </div>
        )}

        {profession === "therapeute" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">N° ADELI</label>
            <input className={inputClass} value={numeroAdeli} onChange={(e) => setNumeroAdeli(e.target.value)} />
          </div>
        )}

        {profession === "coach" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
              Certification (facultatif)
            </label>
            <input className={inputClass} value={certification} onChange={(e) => setCertification(e.target.value)} />
          </div>
        )}

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Spécialité</label>
          <input className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)} />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Présentation</label>
          <textarea
            className={inputClass + " min-h-[100px]"}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Tarif par session (€)</label>
          <input
            type="number"
            className={inputClass + " max-w-[160px]"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[6px] bg-ink py-3.5 text-sm font-medium text-parchment disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Envoyer ma candidature"}
        </button>
      </form>
    </main>
  );
}
