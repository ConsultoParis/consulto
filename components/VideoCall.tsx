"use client";

export default function VideoCall({ bookingId, displayName }: { bookingId: string; displayName: string }) {
  // Nom de salle unique et stable par réservation — personne d'autre ne peut
  // deviner ce lien sans connaître l'identifiant exact de la réservation.
  const roomName = `1expert-consultation-${bookingId}`;
  const src = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"`;

  return (
    <div className="card-soft overflow-hidden" style={{ backgroundColor: "var(--card)" }}>
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <p className="font-medium">Appel vidéo</p>
        <p className="text-xs text-muted">Propulsé par Jitsi Meet — aucune installation requise.</p>
      </div>
      <iframe
        src={src}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{ width: "100%", height: 500, border: "none" }}
        title="Appel vidéo 1Expert"
      />
    </div>
  );
}
