"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendDocumentsForm({
  bookingId,
  existing,
}: {
  bookingId: string;
  existing: { id: string; file_name: string }[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSend() {
    if (files.length === 0) return;
    setStatus("sending");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", bookingId);
      formData.append("uploadedBy", "expert");
      await fetch("/api/documents", { method: "POST", body: formData });
    }

    setStatus("sent");
    setFiles([]);
    router.refresh();
  }

  return (
    <div>
      {existing.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm text-slate">
          {existing.map((d) => (
            <li key={d.id}>{d.file_name}</li>
          ))}
        </ul>
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
          <ul className="mt-2 space-y-1 text-sm text-slate">
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
          <button
            onClick={handleSend}
            disabled={status === "sending"}
            className="mt-2 rounded-[3px] bg-ink px-4 py-2 text-sm font-medium text-parchment disabled:opacity-50"
          >
            {status === "sending" ? "Envoi..." : `Envoyer ${files.length} document(s) au client`}
          </button>
        </>
      )}

      {status === "sent" && <p className="mt-2 text-sm text-verified">Documents envoyés au client.</p>}
    </div>
  );
}
