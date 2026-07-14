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
  const [ville, setVille] = useState("");
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
    if (!ville.trim()) return "Indiquez votre ville";
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
      ville,
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
