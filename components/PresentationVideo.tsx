export default function PresentationVideo() {
  return (
    <div className="card-soft overflow-hidden" style={{ backgroundColor: "var(--card)" }}>
      <video
        controls
        preload="none"
        poster="/presentation-1expert-poster.jpg"
        className="block w-full"
        style={{ aspectRatio: "1280 / 622", backgroundColor: "#0A2540" }}
      >
        <source src="/presentation-1expert.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
