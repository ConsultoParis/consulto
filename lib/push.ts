import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:contact@1expert.fr",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushNotification(
  sub: PushSubscriptionRecord,
  payload: { title: string; body: string; url?: string }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err) {
    console.error("Échec envoi notification push:", err);
    return false;
  }
}
