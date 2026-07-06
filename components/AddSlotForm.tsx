"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddSlotForm({ expertId }: { expertId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<20 | 30>(20);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) return setError("Choisissez une date et une heure");
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("availability_slots").insert({
      expert_id: expertId,
      date,
      start_time: time,
      duration_min: duration,
    });

    setLoading(false);
    if (insertError) return setError(insertError.message);
    setTime("");
    router.refresh();
  }

  return (
    <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <div>
        <label className="font-mono text-[11px] uppercase text-slate">Date</label>
        <input
          type="date"
          className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label className="font-mono text-[11px] uppercase text-slate">Heure</label>
        <input
          type="time"
          className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div>
        <label className="font-mono text-[11px] uppercase text-slate">Durée</label>
        <select
          className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) as 20 | 30)}
        >
          <option value={20}>20 min</option>
          <option value={30}>30 min</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="rounded-[3px] bg-ink px-5 py-2.5 text-sm font-medium text-parchment">
        {loading ? "..." : "Ajouter"}
      </button>
      {error && <p className="col-span-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
