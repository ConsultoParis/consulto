"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function BookingChat({
  bookingId,
  userId,
  otherPartyName,
}: {
  bookingId: string;
  userId: string;
  otherPartyName: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("booking_messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    }
    load();

    // Abonnement temps réel : tout nouveau message de cette réservation
    // s'affiche instantanément, sans recharger la page.
    const channel = supabase
      .channel(`booking-chat-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_messages", filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages((m) => [...m, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]); // eslint-disable-line

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await supabase.from("booking_messages").insert({ booking_id: bookingId, sender_id: userId, content: text });
  }

  return (
    <div className="card-soft flex h-[480px] flex-col overflow-hidden" style={{ backgroundColor: "var(--card)" }}>
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <p className="font-medium">Conversation avec {otherPartyName}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-muted">Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted">Aucun message pour le moment. Dites bonjour 👋</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-[6px] px-3.5 py-2.5 text-sm leading-relaxed"
                style={
                  m.sender_id === userId
                    ? { backgroundColor: "#0A2540", color: "#F4F8FF" }
                    : { backgroundColor: "var(--input-bg)", border: "1px solid var(--border)" }
                }
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: "var(--border)" }}>
        <input
          className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Écrire un message..."
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40"
          style={{ backgroundColor: "#3E8EF7", color: "#FFFFFF" }}
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
