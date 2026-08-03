"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function CompleteExpertProfileForm({ expertId, currentBio }: { expertId: string; currentBio?: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [bio, setBio] = useState(currentBio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.trim()) return setError("Écrivez une courte biographie");
    setLoading(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await supabase.from("experts").update({ bio: bio.trim() }).eq("id", expertId);
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setSaved(true);
    router.refresh();
  }
  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        className="w-full rounded-[6px] border-2 px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#3E8EF7]"
        style={{ minHeight: 100, backgroundColor: "var(--input-bg)", borderColor: "var(--border)" }}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Votre parcours, votre approche, en quelques phrases..."
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="text-sm text-verified">Biographie enregistrée.</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary rounded-[3px] px-5 py-2.5 text-sm font-medium"
      >
        {loading ? "..." : "Enregistrer"}
      </button>
    </form>
  );
}
