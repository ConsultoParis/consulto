import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Zap } from "lucide-react";
import { PROFESSION_LABELS, PROFESSION_COLORS } from "@/lib/types";

export default async function UrgentTodayWidget() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("expert_id, start_time, experts(id, profession, specialite, price, profiles(full_name), verification_status)")
    .eq("date", today)
    .eq("is_booked", false)
    .order("start_time", { ascending: true });

  const seen = new Set<string>();
  const results: any[] = [];
  for (const s of slots || []) {
    const expert = (s as any).experts;
    if (!expert || expert.verification_status !== "verified") continue;
    if (seen.has(expert.id)) continue;
    seen.add(expert.id);
    results.push({ ...expert, start_time: s.start_time });
    if (results.length >= 6) break;
  }

  if (results.length === 0) return null;

  return (
    <section style={{ backgroundColor: "#0A2540" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em]" style={{ color: "#3E8EF7" }}>
          <Zap className="h-3.5 w-3.5" /> Disponible aujourd'hui
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium" style={{ color: "#F4F8FF" }}>
          Un besoin urgent ? Ces experts ont un créneau libre maintenant
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((expert) => (
            <Link
              key={expert.id}
              href={`/experts/${expert.id}`}
              className="rounded-[10px] border p-4 transition hover:border-[#3E8EF7]"
              style={{ backgroundColor: "#123b64", borderColor: "#1c4a75" }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.08em]"
                style={{ color: PROFESSION_COLORS[expert.profession as keyof typeof PROFESSION_COLORS] }}
              >
                {PROFESSION_LABELS[expert.profession as keyof typeof PROFESSION_LABELS]}
              </p>
              <p className="mt-1 font-display text-base font-medium" style={{ color: "#F4F8FF" }}>
                {expert.profiles?.full_name}
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: "#1E8F6B" }}>
                Disponible à {expert.start_time}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
