"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ArrowRight, Loader2 } from "lucide-react";

// Base de connaissances locale — l'assistant répond sans dépendre d'un
// service externe, pour un fonctionnement fiable à 100% sur le site en ligne.
const CHAT_RULES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["médecin", "rpps", "ordre des médecins", "généraliste"],
    reply:
      "Les médecins généralistes doivent obligatoirement fournir leur N° RPPS et leur inscription à l'Ordre des médecins, vérifiés avant toute activation du compte.",
  },
  {
    keywords: ["avocat", "barreau"],
    reply: "Chaque avocat doit fournir son numéro d'inscription au Barreau, vérifié avant la mise en ligne de son profil.",
  },
  {
    keywords: ["notaire", "office notarial"],
    reply: "Chaque notaire doit fournir son numéro d'inscription / office notarial, vérifié avant la mise en ligne de son profil.",
  },
  {
    keywords: ["garagiste", "garage", "mécanicien", "siret"],
    reply: "Les garagistes fournissent leur numéro SIRET, vérifié avant l'activation du profil.",
  },
  {
    keywords: ["coiffeur", "barber", "coiffure", "barbier"],
    reply: "Les barbers/coiffeurs n'ont pas d'ordre professionnel officiel, mais une certification (CAP Coiffure, Brevet de maîtrise...) est recommandée et affichée si elle existe.",
  },
  {
    keywords: ["comptable", "expert-comptable", "ordre des experts"],
    reply: "Les experts-comptables doivent justifier de leur inscription à l'Ordre des experts-comptables avant activation.",
  },
  {
    keywords: ["vérifi", "sérieux", "confiance", "diplôme", "identité"],
    reply: "Chaque expert est vérifié manuellement : justificatif professionnel obligatoire selon son métier, plus un contrôle d'identité avant activation.",
  },
  {
    keywords: ["prix", "tarif", "coût", "combien", "€"],
    reply: "Chaque expert fixe son propre tarif pour une session de 20 à 30 minutes, affiché avant la réservation. Aucun abonnement, aucun prélèvement caché.",
  },
  {
    keywords: ["séquestre", "paiement sécuris", "escrow"],
    reply: "Votre paiement est débité à la réservation mais conservé en séquestre : l'expert ne le reçoit qu'une fois la consultation terminée.",
  },
  {
    keywords: ["rembours", "annul"],
    reply: "Si l'expert annule, vous êtes remboursé automatiquement. Si vous annulez plus de 48h avant le rendez-vous, vous êtes remboursé ; à moins de 48h, la session reste facturée.",
  },
  {
    keywords: ["avis", "note", "commentaire"],
    reply: "Seuls les clients ayant réellement effectué une consultation peuvent laisser un avis, ce qui les rend fiables. Ils sont visibles publiquement sur le profil de l'expert.",
  },
  {
    keywords: ["visio", "tchat", "chat", "physique", "mode de consultation", "en personne"],
    reply: "Vous choisissez le mode de consultation à la réservation : visioconférence, tchat écrit, ou rendez-vous en physique selon ce que propose l'expert.",
  },
  {
    keywords: ["devenir expert", "inscri", "candidature", "rejoindre"],
    reply: "Rendez-vous dans l'onglet « Devenir expert » : le formulaire s'adapte selon votre profession (Barreau, office notarial, RPPS, SIRET...). Votre dossier est vérifié avant activation.",
  },
  {
    keywords: ["réserv", "rendez-vous", "créneau", "book"],
    reply: "Depuis « Trouver un expert », choisissez un professionnel, un créneau disponible, le mode de consultation souhaité, puis payez en toute sécurité pour confirmer.",
  },
  {
    keywords: ["confidentiel", "sécurité", "données", "privé"],
    reply: "Vos échanges et documents avec un expert restent strictement privés. Aucune donnée n'est partagée avec des tiers.",
  },
  {
    keywords: ["blog", "article"],
    reply: "Notre blog est rédigé par les experts eux-mêmes : des conseils concrets, accessibles depuis l'onglet Blog.",
  },
  { keywords: ["bonjour", "salut", "coucou", "hello"], reply: "Bonjour ! Je peux vous renseigner sur les tarifs, la vérification des experts, le paiement, les annulations ou la réservation." },
  { keywords: ["merci"], reply: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions." },
];

function getLocalReply(userText: string): string {
  const q = userText.toLowerCase();
  for (const rule of CHAT_RULES) {
    if (rule.keywords.some((k) => q.includes(k))) return rule.reply;
  }
  return "Je n'ai pas de réponse toute prête sur ce point précis, mais je peux vous renseigner sur les tarifs, la vérification des experts, le paiement en séquestre, les annulations, les avis ou la réservation.";
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis l'assistant 1Expert. Posez-moi vos questions sur les tarifs, la vérification des experts, le paiement ou la réservation." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    const reply = getLocalReply(text);
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            className="relative flex h-[80vh] max-h-[34rem] w-full max-w-sm flex-col overflow-hidden rounded-[10px] border shadow-2xl"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#c3d7ee" }}
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3.5" style={{ backgroundColor: "#0A2540" }}>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: "#3E8EF7", color: "#FFFFFF" }} className="flex h-7 w-7 items-center justify-center rounded-full font-display text-xs">
                  1
                </div>
                <span className="font-display text-sm font-medium" style={{ color: "#F4F8FF" }}>
                  Assistant 1Expert
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10" style={{ color: "#F4F8FF" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ backgroundColor: "#FFFFFF" }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-[6px] px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      m.role === "user"
                        ? { backgroundColor: "#0A2540", color: "#F4F8FF" }
                        : { backgroundColor: "#F4F8FF", color: "#0A2540", border: "1px solid #c3d7ee" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-2 rounded-[6px] px-3.5 py-2.5 text-sm"
                    style={{ backgroundColor: "#F4F8FF", color: "#6b84a0", border: "1px solid #c3d7ee" }}
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> L'assistant écrit...
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t p-3" style={{ borderColor: "#c3d7ee", backgroundColor: "#FFFFFF" }}>
              <input
                className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: "#c3d7ee", backgroundColor: "#FFFFFF", color: "#0A2540" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Posez votre question..."
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  backgroundColor: loading || !input.trim() ? "#9fbde0" : "#3E8EF7",
                  color: "#FFFFFF",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition"
                aria-label="Envoyer le message"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: "#0A2540", color: "#F4F8FF" }}
          aria-label="Ouvrir l'assistant"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
