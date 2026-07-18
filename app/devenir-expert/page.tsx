"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profession } from "@/lib/types";
import { Paperclip, X, Camera, Check, ArrowLeft, ArrowRight } from "lucide-react";
import CityAutocomplete from "@/components/CityAutocomplete";

const inputClass =
  "mt-1.5 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink";

const STEP_LABELS = ["Profil", "Offre", "Justificatif", "Terminé"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mt-6 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all"
                style={
                  isDone
                    ? { backgroundColor: "#1E8F6B", color: "#FFFFFF" }
                    : isActive
                    ? { backgroundColor: "#0A2540", color: "#F4F8FF", boxShadow: "0 0 0 4px rgba(62,142,247,0.2)" }
                    : { backgroundColor: "var(--input-bg)", color: "var(--text-quaternary)", border: "1px solid var(--border)" }
                }
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: isActive ? "#3E8EF7" : "var(--text-tertiary)" }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="mx-2 h-px flex-1" style={{ backgroundColor: isDone ? "#1E8F6B" : "var(--border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DevenirExpertPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [profession, setProfession] = useState<Profession | "">("");
  const [specialite, setSpecialite] = useState("");
  const [ville, setVille] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
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

  function validateStep(step: number): string {
    if (step === 0) {
      if (!profession) return "Choisissez une profession";
      if (!specialite.trim()) return "Indiquez votre spécialité";
      if (!ville.trim()) return "Indiquez votre ville";
    }
    if (step === 1) {
      if (!price || Number(price) <= 0) return "Indiquez un tarif par session";
    }
    if (step === 2) {
      if (profession === "avocat" && !numeroBarreau.trim()) return "N° au Barreau requis";
      if (profession === "notaire" && !numeroNotaire.trim()) return "N° de notaire / office notarial requis";
      if (profession === "garagiste" && !numeroSiret.trim()) return "N° SIRET requis";
      if (profession === "comptable" && !numeroOrdreComptable.trim()) return "N° d'inscription à l'Ordre des experts-comptables requis";
      if (profession === "medecin") {
        if (!/^\d{11}$/.test(numeroRpps.trim())) return "Le N° RPPS doit comporter 11 chiffres";
        if (!numeroOrdreMedecins.trim()) return "N° d'inscription à l'Ordre des médecins requis";
      }
    }
    if (step === 3) {
      if (documents.length === 0) return "Joignez au moins un justificatif";
    }
    return "";
  }

  function handleNext() {
    const validationError = validateStep(currentStep);
    if (validationError) return setError(validationError);
    setError("");
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setError("");
    setCurrentStep((s) => s - 1);
  }

  async function handleSubmit() {
    const validationError = validateStep(3);
    if (validationError) return setError(validationError);
    if (!userId) return setError("Vous devez être connecté pour candidater");

    setLoading(true);
    setError("");

    setUploadStep("Création du profil...");
    const { error: insertError } = await supabase.from("experts").insert({
      id: userId,
      profession,
      specialite,
      ville,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
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
        <a href="/inscription?role=expert" className="btn-primary mt-4 inline-block rounded-[3px] px-6 py-3 text-sm font-medium">
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

  const needsJustificatifStep = profession !== "" && profession !== "coiffeur";

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Candidature expert</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Rejoindre le registre</h1>
      <p className="mt-3 text-muted">Chaque profil est vérifié manuellement avant mise en ligne.</p>

      <div className="mt-6 rounded-[6px] border border-seal/40 bg-seal/5 p-5">
        <p className="text-sm text-muted">
          <strong>Pourquoi rejoindre 1Expert ?</strong> Aucun abonnement, aucun frais fixe — vous ne payez que 20% sur
          les consultations réalisées. Votre profil est visible immédiatement après validation, et le paiement est
          garanti par séquestre sécurisé.
        </p>
      </div>

      <StepIndicator current={currentStep} />

      <div className="mt-8 space-y-5">
        {currentStep === 0 && (
          <>
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

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Spécialité</label>
              {profession === "medecin" ? (
                <select className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)}>
                  <option value="">Sélectionnez une spécialité</option>
                  <option value="Médecin généraliste">Médecin généraliste</option>
                  <option value="Dermatologue">Dermatologue</option>
                  <option value="Psychiatre">Psychiatre</option>
                </select>
              ) : profession === "avocat" ? (
                <select className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)}>
                  <option value="">Sélectionnez une spécialité</option>
                  <option value="Droit du travail">Droit du travail</option>
                  <option value="Droit de la famille">Droit de la famille</option>
                  <option value="Droit immobilier / logement">Droit immobilier / logement</option>
                </select>
              ) : (
                <input className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)} />
              )}
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Ville ou code postal</label>
              <CityAutocomplete
                value={ville}
                onChange={(v) => {
                  setVille(v);
                  setCoords(null);
                }}
                onSelectCoords={(lat, lng) => setCoords({ lat, lng })}
                placeholder="Lyon, 69001, Paris..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted">Sélectionnez une suggestion pour activer la recherche "près de chez moi" des clients.</p>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Présentation</label>
              <textarea
                className={inputClass + " min-h-[100px]"}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Votre parcours, votre approche, en quelques phrases..."
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
          </>
        )}

        {currentStep === 2 && (
          <>
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
          </>
        )}

        {currentStep === 3 && (
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
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="btn-secondary flex items-center gap-1.5 rounded-[6px] px-5 py-3.5 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !needsJustificatifStep) {
                  const validationError = validateStep(1);
                  if (validationError) return setError(validationError);
                  setError("");
                  setCurrentStep(3);
                  return;
                }
                handleNext();
              }}
              className="btn-primary flex flex-1 items-center justify-center gap-1.5 rounded-[6px] py-3.5 text-sm font-medium"
            >
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1 rounded-[6px] py-3.5 text-sm font-medium"
            >
              {loading ? uploadStep || "Envoi..." : "Envoyer ma candidature"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
