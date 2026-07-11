"use client";

import Link from "next/link";
import { useState } from "react";

export default function LogoAnimated({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [hovered, setHovered] = useState(false);

  const dims = {
    sm: { badge: 40, one: 20, word: 22, tag: 8 },
    md: { badge: 56, one: 27, word: 30, tag: 10 },
    lg: { badge: 88, one: 42, word: 46, tag: 13 },
  }[size];

  return (
    <Link
      href="/"
      style={{ display: "inline-flex", alignItems: "center", gap: dims.badge * 0.28, cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          position: "relative",
          width: dims.badge,
          height: dims.badge,
          borderRadius: "50%",
          background: "linear-gradient(155deg, #123b64 0%, #0A2540 65%)",
          border: "1px solid rgba(62,142,247,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          animation: "logoEntranceBadge 0.9s cubic-bezier(0.22,1,0.36,1) both",
          transform: hovered ? "scale(1.08) rotate(-6deg)" : "scale(1) rotate(0deg)",
          boxShadow: hovered ? "0 0 0 6px rgba(62,142,247,0.18)" : "none",
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            fontSize: dims.one,
            lineHeight: 1,
            color: "#EAF2FF",
            position: "relative",
            zIndex: 2,
            transform: "translateY(-2px)",
          }}
        >
          1
        </span>
        <span
          key={hovered ? "shine-hover" : "shine-idle"}
          style={{
            position: "absolute",
            top: "-20%",
            left: "-60%",
            width: "40%",
            height: "140%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
            animation: hovered
              ? "shimmerSweep 0.9s ease forwards"
              : "shimmerIntro 1.1s ease 1.1s both",
          }}
        />
      </span>
      <span style={{ display: "flex", flexDirection: "column", animation: "logoEntranceText 0.8s 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: dims.word, letterSpacing: "-0.01em", color: "var(--text)", lineHeight: 1 }}>
          1expert<span style={{ color: "#3E8EF7" }}>.fr</span>
        </span>
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: dims.tag,
            letterSpacing: "0.22em",
            color: "#7FA9DE",
            textTransform: "uppercase",
            marginTop: dims.badge * 0.08,
          }}
        >
          Conseil &amp; expertise
        </span>
      </span>
    </Link>
  );
}
