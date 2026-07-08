"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompleteExpertProfileForm({ expertId }: { expertId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.trim()) return setError("Écrivez une courte présentation");
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.from("experts").update({ bio: bio.trim() }).eq("id", expertId);

    setLoading(false);
    if (updateError) return setError(updateError.message);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        className="w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
        style={{ minHeight: 90 }}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Votre parcours, votre approche, en quelques phrases..."
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-[3px] bg-ink px-5 py-2.5 text-sm font-medium text-parchment disabled:opacity-50"
      >
        {loading ? "..." : "Enregistrer"}
      </button>
    </form>
  );
}
