"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createClient } from "@/lib/supabase/client";
import CheckoutForm from "@/components/CheckoutForm";
import type { AvailabilitySlot, ConsultationMode } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BookingPage({ params }: { params: Promise<{ expertId: string }> }) {
  const { expertId } = usePromise(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [expert, setExpert] = useState<any>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [mode, setMode] = useState<ConsultationMode>("video");
  const [docs, setDocs] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [step, setStep] = useState<"creneaux" | "paiement" | "confirmation">("creneaux");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: expertData } = await supabase
        .from("experts")
        .select("*, profiles(full_name)")
        .eq("id", expertId)
        .single();
      setExpert(expertData);

      const { data: slotsData } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", expertId)
        .eq("is_booked", false)
        .order("date", { ascending: true });
      setSlots(slotsData || []);

      const preselectSlotId = searchParams.get("slot");
      if (preselectSlotId && slotsData) {
        const preselect = slotsData.find((s) => s.id === preselectSlotId);
        if (preselect) setSelectedSlot(preselect);
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email) setEmail(userData.user.email);
    }
    load();
  }, [expertId]); // eslint-disable-line

  async function handleContinueToPayment() {
    if (!selectedSlot) return setError("Choisissez un créneau");
    if (!email.trim()) return setError("Adresse email requise");
    setError("");
    setLoading(true);

    const isQuickQuote = selectedSlot.duration_min === 5;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: selectedSlot.id,
        expertId,
        mode: isQuickQuote ? "video" : mode,
        price: isQuickQuote ? 5 : expert.price,
        clientEmail: email,
        creditsUsed: 0,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Une erreur est survenue");

    setBookingId(data.bookingId);
    setClientSecret(data.clientSecret);
    setStep("paiement");
  }

  async function handlePaymentSuccess() {
    for (const file of docs) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", bookingId);
      formData.append("uploadedBy", "client");
      await fetch("/api/documents", { method: "POST", body: formData });
    }
    setStep("confirmation");
  }

  if (!expert) return null;

  const isQuickQuote = selectedSlot?.duration_min === 5;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-medium">Réserver avec {expert.profiles?.full_name}</h1>

      {step === "creneaux" && (
        <div className="mt-8">
          {isQuickQuote ? (
            <div className="rounded-[6px] border border-seal/40 bg-seal/5 p-4">
              <p className="text-sm font-medium">Devis rapide — 5 minutes en visio</p>
              <p className="mt-1 text-sm text-muted">
                Ce créneau est réservé au mode visio, pour un premier devis rapide à prix fixe.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Mode de consultation</h2>
              <div className="mt-3 flex gap-2">
                {(["video", "chat", "physique"] as ConsultationMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-[3px] border px-4 py-2 text-sm transition-all ${
                      mode === m ? "btn-primary border-transparent" : "border-app hover:border-[#3E8EF7]"
                    }`}
                  >
                    {m === "video" ? "Visio" : m === "chat" ? "Tchat" : "Physique"}
                  </button>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Créneau</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-[3px] border px-4 py-3 text-left transition-all ${
                  selectedSlot?.id === slot.id
                    ? "border-[#3E8EF7] bg-[#3E8EF7]/10 shadow-[0_0_0_1px_rgba(62,142,247,0.3),0_0_16px_-4px_rgba(62,142,247,0.4)]"
                    : "border-app hover:border-[#3E8EF7]"
                }`}
              >
                <span className="block text-sm capitalize">
                  {new Date(slot.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <span className="font-mono text-xs text-muted">
                  {slot.start_time} · {slot.duration_min} min
                  {slot.duration_min === 5 && (
                    <span className="ml-1.5 rounded-full px-1.5 py-0.5" style={{ backgroundColor: "#3E8EF71a", color: "#3E8EF7" }}>
                      Devis rapide 5€
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Pièces justificatives (optionnel)
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-full border border-app px-3.5 py-2 font-mono text-xs">
              Choisir un fichier
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setDocs((d) => [...d, ...Array.from(e.target.files || [])])}
              />
            </label>
            <label className="cursor-pointer rounded-full border border-app px-3.5 py-2 font-mono text-xs">
              Prendre une photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setDocs((d) => [...d, ...Array.from(e.target.files || [])])}
              />
            </label>
          </div>
          {docs.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {docs.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}

          <h2 className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Email</h2>
          <input
            type="email"
            className="mt-2 w-full rounded-[3px] border border-app px-3.5 py-2.5 text-[15px] outline-none focus:border-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

          <button
            onClick={handleContinueToPayment}
            disabled={loading}
            className="btn-primary mt-8 w-full rounded-[6px] py-3.5 text-sm font-medium"
          >
            {loading ? "Préparation..." : `Continuer — ${isQuickQuote ? 5 : expert.price} €`}
          </button>
        </div>
      )}

      {step === "paiement" && clientSecret && (
        <div className="mt-8">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      )}

      {step === "confirmation" && (
        <div className="mt-8 rounded-[6px] border border-verified/30 bg-verified/5 p-8 text-center">
          <h2 className="font-display text-xl font-medium">Rendez-vous confirmé</h2>
          <p className="mt-2 text-muted">
            Un email de confirmation vous a été envoyé à {email}. Retrouvez votre réservation dans
            votre espace client.
          </p>
          <button
            onClick={() => router.push("/dashboard/client")}
            className="mt-4 font-mono text-xs uppercase tracking-[0.1em] underline decoration-seal decoration-2 underline-offset-4"
          >
            Aller à mon espace client
          </button>
        </div>
      )}
    </main>
  );
}
