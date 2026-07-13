"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "X" },
  { icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="mt-16 text-white" style={{ backgroundColor: "#040f1a" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-6 py-6 sm:grid-cols-4">
        {socials.map((s, i) => {
          const Icon = s.icon;
          return (
            <a key={i} href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm text-white/80 transition-all hover:scale-[1.02] hover:border-[#3E8EF7] hover:text-white hover:shadow-[0_0_16px_-3px_rgba(62,142,247,0.6)]">
              <Icon className="h-4 w-4" /> {s.label}
            </a>
          );
        })}
      </div>

      <div className="divider-silver" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">Découvrir</h3>
            <ul className="mt-4 space-y-1 text-sm text-white/85">
              <li><Link href="/experts" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Trouver un expert</Link></li>
              <li><Link href="/devenir-expert" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Devenir expert</Link></li>
              <li><Link href="/blog" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Blog</Link></li>
              <li><Link href="/dashboard/client" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Espace client</Link></li>
              <li><Link href="/dashboard/expert" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Espace expert</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">Besoin d'aide</h3>
            <ul className="mt-4 space-y-1 text-sm text-white/85">
              <li><Link href="/confiance" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Questions fréquentes</Link></li>
              <li><Link href="/confiance" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Centre de confiance</Link></li>
              <li><Link href="/confiance#remboursement" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Politique de remboursement</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">À propos</h3>
            <ul className="mt-4 space-y-1 text-sm text-white/85">
              <li><Link href="/confiance" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Vérification des experts</Link></li>
              <li><Link href="/mentions-legales" className="group flex items-center gap-2 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors hover:bg-[#3E8EF7]/10 hover:text-white"><span className="h-1 w-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: "#3E8EF7" }} />Mentions légales</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="divider-silver" />
      <div>
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-white/50">
          © 1Expert {new Date().getFullYear()} — plateforme d'experts vérifiés, France
        </div>
      </div>
    </footer>
  );
}
