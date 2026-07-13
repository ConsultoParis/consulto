"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profession } from "@/lib/types";
import { Paperclip, X, Camera } from "lucide-react";

const inputClass =
  "mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink";

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
  const [numeroNotaire, setNumeroNotaire] = useState("");
  const [numeroRpps, setNumeroRpps] = useState("");
  const [numeroOrdreMedecins, setNumeroOrdreMedecins] = useState("");
  const [numeroSiret, setNumeroSiret] = useState("");
  const [numeroOrdreComptable, setNumeroOrdreComptable] = useState("");
  const [certification, setCertification] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setCheckingAuth(false);
    });
  }, [supabase]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setDocuments((d) => [...d, ...Array.from(fileList)]);
  }

  function removeDocument(index: number) {
    setDocuments((d) => d.filter((_, i) => i !== index));
  }

  function validate() {
    if (!profession) return "Choisissez une profession";
    if (!specialite.trim()) return "Indiquez votre spécialité";
    if (!price || Number(price) <= 0) return "Indiquez un tarif par session";
    if (profession === "avocat" && !numeroBarreau.trim()) return "N° au Barreau requis";
    if (profession === "notaire" && !numeroNotaire.trim()) return "N° de notaire / office notarial requis";
    if (profession === "garagiste" && !numeroSiret.trim()) return "N° SIRET requis";
    if (profession === "comptable" && !numeroOrdreComptable.trim()) return "N° d'inscription à l'Ordre des experts-comptables requis";
    if (profession === "medecin") {
      if (!/^\d{11}$/.test(numeroRpps.trim())) return "Le N° RPPS doit comporter 11 chiffres";
      if (!numeroOrdreMedecins.trim()) return "N° d'inscription à l'Ordre des médecins requis";
    }
    if (documents.length === 0) return "Joignez au moins un justificatif (carte professionnelle, diplôme, attestation d'inscription...)";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (!userId) return setError("Vous devez être connecté pour candidater");

    setLoading(true);
    setError("");

    setUploadStep("Création du profil...");
    const { error: insertError } = await supabase.from("experts").insert({
      id: userId,
      profession,
      specialite,
      bio,
      price: Number(price),
      numero_barreau: profession === "avocat" ? numeroBarreau : null,
      numero_notaire: profession === "notaire" ? numeroNotaire : null,
      numero_rpps: profession === "medecin" ? numeroRpps : null,
      numero_ordre_medecins: profession === "medecin" ? numeroOrdreMedecins : null,
      numero_siret: profession === "garagiste" ? numeroSiret : null,
      numero_ordre_comptable: profession === "comptable" ? numeroOrdreComptable : null,
      certification: profession === "coiffeur" ? certification : null,
      verification_status: "pending",
    });

    if (insertError) {
      setLoading(false);
      setUploadStep("");
      return setError(insertError.message);
    }

    setUploadStep("Envoi des justificatifs...");
    for (const file of documents) {
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("expert-documents").upload(filePath, file);

      if (uploadError) {
        setLoading(false);
        setUploadStep("");
        return setError(`Erreur lors de l'envoi de "${file.name}" : ${uploadError.message}`);
      }

      await supabase.from("expert_documents").insert({
        expert_id: userId,
        file_name: file.name,
        file_path: filePath,
      });
    }

    setLoading(false);
    setUploadStep("");
    setSubmitted(true);
  }

  if (checkingAuth) return null;

  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted">
          Créez d'abord un compte pour déposer votre candidature d'expert.
        </p>
        <a href="/inscription" className="btn-primary mt-4 inline-block rounded-[3px] px-6 py-3 text-sm font-medium">
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
          <p className="mt-2 text-muted">
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
      <p className="mt-3 text-muted">Chaque profil est vérifié manuellement avant mise en ligne.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Profession</label>
          <select
            className={inputClass}
            value={profession}
            onChange={(e) => setProfession(e.target.value as Profession)}
          >
            <option value="">Sélectionnez votre profession</option>
            <option value="avocat">Avocat</option>
            <option value="notaire">Notaire</option>
            <option value="medecin">Médecin généraliste</option>
            <option value="garagiste">Garagiste</option>
            <option value="coiffeur">Barber / Coiffeur</option>
            <option value="comptable">Expert-comptable</option>
          </select>
        </div>

        {profession === "medecin" && (
          <div className="rounded-[6px] border border-seal/40 bg-seal/5 p-5">
            <p className="text-sm text-muted">
              Conformément à la réglementation française sur la télémédecine, le N° RPPS et
              l'inscription à l'Ordre des médecins sont obligatoires et vérifiés avant activation.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">N° RPPS</label>
                <input
                  className={inputClass}
                  value={numeroRpps}
                  onChange={(e) => setNumeroRpps(e.target.value)}
                  placeholder="11 chiffres"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
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
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">N° au Barreau</label>
            <input className={inputClass} value={numeroBarreau} onChange={(e) => setNumeroBarreau(e.target.value)} />
          </div>
        )}

        {profession === "notaire" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              N° de notaire / office notarial
            </label>
            <input className={inputClass} value={numeroNotaire} onChange={(e) => setNumeroNotaire(e.target.value)} />
          </div>
        )}

        {profession === "garagiste" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">N° SIRET</label>
            <input className={inputClass} value={numeroSiret} onChange={(e) => setNumeroSiret(e.target.value)} />
          </div>
        )}

        {profession === "coiffeur" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Certification / diplôme (facultatif)
            </label>
            <input
              className={inputClass}
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              placeholder="CAP Coiffure, Brevet de maîtrise..."
            />
          </div>
        )}

        {profession === "comptable" && (
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              N° d'inscription à l'Ordre des experts-comptables
            </label>
            <input
              className={inputClass}
              value={numeroOrdreComptable}
              onChange={(e) => setNumeroOrdreComptable(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Spécialité</label>
          <input className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)} />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Présentation</label>
          <textarea
            className={inputClass + " min-h-[100px]"}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Tarif par session (€)</label>
          <input
            type="number"
            className={inputClass + " max-w-[160px]"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Pièces justificatives</label>
          <p className="mt-1 text-xs text-muted">
            Carte professionnelle, diplôme, attestation d'inscription... au moins un document.
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-app px-3.5 py-2 font-mono text-xs transition hover:bg-ink/5">
              <Paperclip className="h-3.5 w-3.5" /> Choisir un fichier
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-app px-3.5 py-2 font-mono text-xs transition hover:bg-ink/5">
              <Camera className="h-3.5 w-3.5" /> Prendre une photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>

          {documents.length > 0 && (
            <ul className="mt-3 space-y-2">
              {documents.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded-[3px] border border-app px-3 py-2 text-sm">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => removeDocument(i)} className="ml-2 shrink-0 text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-[6px] py-3.5 text-sm font-medium"
        >
          {loading ? uploadStep || "Envoi..." : "Envoyer ma candidature"}
        </button>
      </form>
    </main>
  );
}
