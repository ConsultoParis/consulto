export default function ResponseTimeBadge({ minutes }: { minutes: number | null | undefined }) {
  if (!minutes) return null;

  const label = minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-medium"
      style={{ backgroundColor: "#1E93A615", color: "#1E93A6" }}
    >
      Répond en {label} (tchat)
    </span>
  );
}
