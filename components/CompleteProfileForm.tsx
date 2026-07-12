"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompleteProfileForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return setError("Indiquez un numéro de téléphone");
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.from("profiles").update({ phone: phone.trim() }).eq("id", userId);

    setLoading(false);
    if (updateError) return setError(updateError.message);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        className="flex-1 rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="06 12 34 56 78"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary rounded-[3px] px-5 py-2.5 text-sm font-medium"
      >
        {loading ? "..." : "Enregistrer"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
