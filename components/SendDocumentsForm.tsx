"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profession } from "@/lib/types";

const DOCUMENT_TYPES: Record<Profession, string[]> = {
  avocat: ["Consultation écrite", "Modèle de contrat", "Note juridique", "Autre"],
  notaire: ["Projet d'acte", "Attestation", "Devis", "Autre"],
  medecin: ["Ordonnance", "Arrêt de travail", "Compte-rendu de consultation", "Autre"],
  garagiste: ["Devis", "Facture", "Diagnostic", "Autre"],
  coiffeur: ["Devis", "Autre"],
  comptable: ["Bilan", "Déclaration", "Conseil écrit", "Autre"],
};

export default function SendDocumentsForm({
  bookingId,
  existing,
  profession,
}: {
  bookingId: string;
  existing: { id: string; file_name: string; document_type?: string | null }[];
  profession?: Profession;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const typeOptions = profession ? DOCUMENT_TYPES[profession] : [];

  async function handleSend() {
    if (files.length === 0) return;
    setStatus("sending");
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", bookingId);
      formData.append("uploadedBy", "expert");
      if (documentType) formData.append("documentType", documentType);
      await fetch("/api/documents", { method: "POST", body: formData });
    }
    setStatus("sent");
    setFiles([]);
    setDocumentType("");
    router.refresh();
  }

  return (
    <div>
      {existing.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm text-muted">
          {existing.map((d) => (
            <li key={d.id}>
              {d.document_type && (
                <span className="mr-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ backgroundColor: "#3E8EF715", color: "#3E8EF7" }}>
                  {d.document_type}
                </span>
              )}
              {d.file_name}
            </li>
          ))}
        </ul>
      )}

      {typeOptions.length > 0 && (
        <div className="mb-2">
          <label className="font-mono text-[11px] uppercase text-muted">Type de document (optionnel)</label>
          <select
            className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">Non précisé</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="cursor-pointer rounded-full border border-ink/15 px-3.5 py-2 font-mono text-xs">
        Choisir un fichier
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files || [])])}
        />
      </label>
      {files.length > 0 && (
        <>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
          <button
            onClick={handleSend}
            disabled={status === "sending"}
            className="btn-primary mt-2 rounded-[3px] px-4 py-2 text-sm font-medium"
          >
            {status === "sending" ? "Envoi..." : `Envoyer ${files.length} document(s) au client`}
          </button>
        </>
      )}
      {status === "sent" && <p className="mt-2 text-sm text-verified">Documents envoyés au client.</p>}
    </div>
  );
}
