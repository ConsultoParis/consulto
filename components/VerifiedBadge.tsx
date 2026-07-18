import { ShieldCheck } from "lucide-react";

export default function VerifiedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-mono font-medium"
      style={{
        backgroundColor: "#1E8F6B15",
        color: "#1E8F6B",
        padding: isSmall ? "3px 9px" : "5px 12px",
        fontSize: isSmall ? 10 : 11,
      }}
    >
      <ShieldCheck className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Identité vérifiée
    </span>
  );
}
