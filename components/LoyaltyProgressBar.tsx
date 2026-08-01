import { Gift } from "lucide-react";
import { LOYALTY_THRESHOLD } from "@/lib/loyalty";

export default function LoyaltyProgressBar({
  progressInCurrentTier,
  discountsAvailable,
}: {
  progressInCurrentTier: number;
  discountsAvailable: number;
}) {
  const percent = Math.min(100, Math.round((progressInCurrentTier / LOYALTY_THRESHOLD) * 100));
  const remaining = Math.max(0, LOYALTY_THRESHOLD - progressInCurrentTier);

  return (
    <div className="card-soft p-5" style={{ backgroundColor: "var(--card)" }}>
      <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        <Gift className="h-3.5 w-3.5" /> Programme fidélité
      </p>

      {discountsAvailable > 0 && (
        <p className="mt-2 rounded-[6px] px-3 py-2 text-sm font-medium" style={{ backgroundColor: "#1E8F6B15", color: "#1E8F6B" }}>
          {discountsAvailable} réduction{discountsAvailable > 1 ? "s" : ""} de -5% disponible{discountsAvailable > 1 ? "s" : ""} — applicable au moment de réserver
        </p>
      )}

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: "#3E8EF7" }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        Encore {remaining.toFixed(0)} € pour débloquer une nouvelle réduction de -5% (tous les {LOYALTY_THRESHOLD} € dépensés,
        valable sur une consultation, non cumulable).
      </p>
    </div>
  );
}
