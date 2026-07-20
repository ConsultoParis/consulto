"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallAppButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className={
        variant === "primary"
          ? "btn-primary flex items-center gap-1.5 rounded-[6px] px-5 py-2.5 text-sm font-medium"
          : "btn-secondary flex items-center gap-1.5 rounded-[6px] px-5 py-2.5 text-sm font-medium"
      }
    >
      <Download className="h-4 w-4" />
      Installer l'application
    </button>
  );
}
