"use client";

import { useState } from "react";

export default function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-3 inline-flex items-center gap-2 rounded-[3px] border border-dashed border-ink/25 px-3 py-2 font-mono text-sm transition hover:bg-ink/5"
      style={{ backgroundColor: "var(--input-bg)" }}
    >
      {code}
      <span className="text-xs text-muted">{copied ? "Copié !" : "Copier"}</span>
    </button>
  );
}
