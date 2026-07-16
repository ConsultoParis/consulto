"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profession } from "@/lib/types";

const WEEKDAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

// Nombre de semaines à l'avance pour lesquelles on crée le créneau récurrent.
const RECURRING_WEEKS = 10;

export default function AddSlotForm({ expertId, profession }: { expertId: string; profession?: Profession }) {
  const router = useRouter();
  const supabase = createClient();

  const [recurrenceType, setRecurrenceType] = useState<"unique" | "recurrent">("unique");

  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState(1);

  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<5 | 20 | 30>(20);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function nextDateForWeekday(targetWeekday: number): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const diff = (targetWeekday - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    return d;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!time) return setError("Choisissez une heure");
    setError("");
    setSuccess("");
    setLoading(true);

    if (recurrenceType === "unique") {
      if (!date) {
        setLoading(false);
        return setError("Choisissez une date");
      }
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
      return;
    }

    const firstDate = nextDateForWeekday(weekday);
    const rows = Array.from({ length: RECURRING_WEEKS }, (_, i) => {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + i * 7);
      return {
        expert_id: expertId,
        date: d.toISOString().slice(0, 10),
        start_time: time,
        duration_min: duration,
      };
    });

    const { error: insertError } = await supabase.from("availability_slots").insert(rows);
    setLoading(false);
    if (insertError) return setError(insertError.message);
    setSuccess(`${RECURRING_WEEKS} créneaux ajoutés (chaque ${WEEKDAYS.find((w) => w.value === weekday)?.label.toLowerCase()} à ${time}).`);
    setTime("");
    router.refresh();
  }

  return (
    <form onSubmit={handleAdd} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRecurrenceType("unique")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
            recurrenceType === "unique" ? "btn-primary" : "border border-app hover:border-[#3E8EF7]"
          }`}
        >
          Créneau unique
        </button>
        <button
          type="button"
          onClick={() => setRecurrenceType("recurrent")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
            recurrenceType === "recurrent" ? "btn-primary" : "border border-app hover:border-[#3E8EF7]"
          }`}
        >
          Toutes les semaines
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        {recurrenceType === "unique" ? (
          <div>
            <label className="font-mono text-[11px] uppercase text-muted">Date</label>
            <input
              type="date"
              className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="font-mono text-[11px] uppercase text-muted">Jour de la semaine</label>
            <select
              className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
            >
              {WEEKDAYS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="font-mono text-[11px] uppercase text-muted">Heure</label>
          <input
            type="time"
            className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase text-muted">Durée</label>
          <select
            className="mt-1.5 w-full rounded-[3px] border border-ink/15 px-3 py-2 text-sm"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) as 5 | 20 | 30)}
          >
            {profession === "coiffeur" && <option value={5}>5 min — Devis rapide (5 €, visio)</option>}
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary rounded-[3px] px-5 py-2.5 text-sm font-medium">
          {loading ? "..." : "Ajouter"}
        </button>
      </div>

      {recurrenceType === "recurrent" && (
        <p className="text-xs text-muted">
          Un créneau sera créé chaque {WEEKDAYS.find((w) => w.value === weekday)?.label.toLowerCase()} à l'heure choisie,
          pour les {RECURRING_WEEKS} prochaines semaines.
        </p>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-verified">{success}</p>}
    </form>
  );
}
