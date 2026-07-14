import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "contact@1expert.fr";

/** Envoie le justificatif d'achat après un paiement confirmé. */
export async function sendReceiptEmail({
  to,
  expertName,
  date,
  time,
  price,
}: {
  to: string;
  expertName: string;
  date: string;
  time: string;
  price: number;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Votre réservation 1Expert est confirmée",
    html: `
      <h2>Réservation confirmée</h2>
      <p>Votre session avec <strong>${expertName}</strong> est réservée pour le ${date} à ${time}.</p>
      <p>Montant réglé : <strong>${price} €</strong> (conservé en séquestre jusqu'à la fin de la session).</p>
    `,
  });
}

/** Envoie les documents transmis par l'expert après la consultation. */
export async function sendDocumentsEmail({
  to,
  expertName,
  documentUrls,
}: {
  to: string;
  expertName: string;
  documentUrls: { name: string; url: string }[];
}) {
  const list = documentUrls.map((d) => `<li><a href="${d.url}">${d.name}</a></li>`).join("");
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${expertName} vous a transmis des documents`,
    html: `
      <h2>Nouveaux documents disponibles</h2>
      <p>${expertName} vous a transmis les documents suivants suite à votre consultation :</p>
      <ul>${list}</ul>
      <p>Vous pouvez aussi les retrouver dans votre espace client sur 1Expert.</p>
    `,
  });
}

/** Rappel automatique envoyé environ 24h avant une consultation. */
export async function sendReminderEmail({
  to,
  otherPartyName,
  date,
  time,
  bookingId,
}: {
  to: string;
  otherPartyName: string;
  date: string;
  time: string;
  bookingId: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://1expert.fr";
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Rappel : votre consultation 1Expert a lieu bientôt",
    html: `
      <h2>Rappel de rendez-vous</h2>
      <p>Votre consultation avec <strong>${otherPartyName}</strong> a lieu le ${date} à ${time}.</p>
      <p><a href="${siteUrl}/consultation/${bookingId}">Accéder à la consultation</a></p>
    `,
  });
}

/** Notifie l'autre partie qu'une réservation vient d'être annulée. */
export async function sendCancellationEmail({
  to,
  otherPartyName,
  date,
  time,
  refunded,
}: {
  to: string;
  otherPartyName: string;
  date: string;
  time: string;
  refunded: boolean;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Une consultation 1Expert a été annulée",
    html: `
      <h2>Rendez-vous annulé</h2>
      <p>La consultation avec <strong>${otherPartyName}</strong> prévue le ${date} à ${time} a été annulée.</p>
      ${refunded ? "<p>Le paiement a été intégralement remboursé.</p>" : ""}
    `,
  });
}
