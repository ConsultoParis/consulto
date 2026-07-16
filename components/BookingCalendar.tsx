"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
}: {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  function fmt(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function goPrev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-base font-medium capitalize">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={goNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border transition hover:border-[#3E8EF7]"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase text-mutedmore">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = fmt(date);
          const isPast = date < today;
          const hasSlots = availableDates.has(key);
          const isSelected = selectedDate === key;
          return (
            <button
              key={i}
              type="button"
              disabled={isPast || !hasSlots}
              onClick={() => onSelectDate(key)}
              className="flex aspect-square items-center justify-center rounded-[6px] text-sm transition-all disabled:cursor-not-allowed disabled:opacity-30"
              style={
                isSelected
                  ? { backgroundColor: "#0A2540", color: "#F4F8FF", fontWeight: 600 }
                  : hasSlots
                  ? { backgroundColor: "#1E8F6B1f", color: "#1E8F6B", fontWeight: 600 }
                  : { color: "var(--text)" }
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-mutedmore">
        <span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: "#1E8F6B1f" }} />
        Jour avec créneaux disponibles
      </div>
    </div>
  );
}
