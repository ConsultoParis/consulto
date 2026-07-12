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
    <footer className="mt-16 text-white" style={{ backgroundColor: "#0A2540" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 border-b border-white/10 px-6 py-6 sm:grid-cols-4">
        {socials.map((s, i) => {
          const Icon = s.icon;
          return (
            
              key={i}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Icon className="h-4 w-4" /> {s.label}
            </a>
          );
        })}
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">Découvrir</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li><Link href="/experts" className="hover:text-white">Trouver un expert</Link></li>
              <li><Link href="/devenir-expert" className="hover:text-white">Devenir expert</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/dashboard/client" className="hover:text-white">Espace client</Link></li>
              <li><Link href="/dashboard/expert" className="hover:text-white">Espace expert</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">Besoin d'aide</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li><Link href="/confiance" className="hover:text-white">Questions fréquentes</Link></li>
              <li><Link href="/confiance" className="hover:text-white">Centre de confiance</Link></li>
              <li><Link href="/confiance#remboursement" className="hover:text-white">Politique de remboursement</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-white/50">À propos</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li><Link href="/confiance" className="hover:text-white">Vérification des experts</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-white/50">
          © 1Expert {new Date().getFullYear()} — plateforme d'experts vérifiés, France
        </div>
      </div>
    </footer>
  );
}
