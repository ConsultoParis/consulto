import Image from "next/image";
import { PROFESSION_COLORS, type Profession } from "@/lib/types";

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({
  name,
  profession,
  size = 44,
  photoUrl,
}: {
  name?: string | null;
  profession?: Profession | string;
  size?: number;
  photoUrl?: string | null;
}) {
  const color = profession && profession in PROFESSION_COLORS ? PROFESSION_COLORS[profession as Profession] : "#0A2540";

  if (photoUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, boxShadow: `0 0 0 2px ${color}40` }}
      >
        <Image src={photoUrl} alt={name || "Expert"} fill sizes={`${size}px`} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}18`,
        color,
        fontSize: size * 0.38,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
