import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "contact@consulto.fr";

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
    subject: "Votre réservation Consulto est confirmée",
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
      <p>Vous pouvez aussi les retrouver dans votre espace client sur Consulto.</p>
    `,
  });
}
