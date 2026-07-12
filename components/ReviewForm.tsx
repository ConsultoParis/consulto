"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ bookingId, expertId }: { bookingId: string; expertId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return setError("Sélectionnez une note");
    if (!comment.trim()) return setError("Un commentaire est requis");

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      expert_id: expertId,
      client_id: user!.id,
      rating,
      comment: comment.trim(),
    });

    setLoading(false);
    if (insertError) return setError(insertError.message);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Laisser un avis</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} className="text-2xl">
            {i <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        className="w-full rounded-[3px] border border-ink/15 px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre expérience..."
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary rounded-[3px] px-5 py-2.5 text-sm font-medium"
      >
        {loading ? "Envoi..." : "Publier l'avis"}
      </button>
    </form>
  );
}
