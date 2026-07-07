const SECTIONS = [
  {
    title: "Comment les experts sont sélectionnés",
    text: "Chaque candidature est vérifiée manuellement : justificatif professionnel obligatoire (N° au Barreau, Ordre, ADELI, ou RPPS + Ordre des médecins), identité contrôlée, et cohérence du profil avant toute mise en ligne.",
    color: "#3457A6",
  },
  {
    title: "Les garanties offertes",
    text: "Paiement en séquestre : l'expert n'est réglé qu'une fois la session terminée. Garantie satisfait ou remboursé sous 48h si la consultation ne correspond pas à ce qui était annoncé.",
    color: "#C14F82",
  },
  {
    title: "Politique de remboursement",
    text: "Remboursement automatique et sans démarche si la session n'a pas eu lieu du fait de l'expert. Côté client, annulation gratuite jusqu'à 48h avant le rendez-vous ; en-deçà, la session reste facturée.",
    color: "#1E8F6B",
  },
  {
    title: "Confidentialité des échanges",
    text: "Les documents et messages échangés avec un expert restent strictement privés. Aucune donnée de santé, juridique ou financière n'est partagée avec des tiers.",
    color: "#1E93A6",
  },
];

const FAQ = [
  { q: "Comment sont vérifiés les experts ?", a: "Chaque profession a ses propres justificatifs obligatoires, contrôlés manuellement avant activation." },
  { q: "Combien coûte une session ?", a: "Chaque expert fixe son tarif pour une session de 20 à 30 minutes, affiché avant réservation. Aucun abonnement, aucun prélèvement caché." },
  { q: "Comment fonctionne le paiement en séquestre ?", a: "Votre paiement est débité à la réservation mais conservé en séquestre : l'expert ne le reçoit qu'une fois la consultation terminée." },
  { q: "Puis-je être remboursé si l'expert ne se présente pas ?", a: "Oui, automatiquement." },
  { q: "Comment se déroule la consultation ?", a: "Vous choisissez le mode (vidéo, tchat ou physique) au moment de la réservation." },
];

export default function ConfiancePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Centre de confiance</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Pourquoi avoir confiance en nous ?</h1>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <div key={i} id={s.title.includes("remboursement") ? "remboursement" : undefined} className="card-soft p-6" style={{ backgroundColor: "var(--card)" }}>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-semibold"
              style={{ backgroundColor: `${s.color}15`, color: s.color }}
            >
              {i + 1}
            </div>
            <h3 className="mt-3 font-display text-lg font-medium">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
          </div>
        ))}
      </div>

      <h2 id="remboursement" className="mt-14 font-display text-2xl font-medium">Questions fréquentes</h2>
      <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {FAQ.map((item, i) => (
          <details key={i} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-medium">
              {item.q}
              <span className="font-mono text-sm text-muted group-open:rotate-180">▾</span>
            </summary>
            <p className="mt-3 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
