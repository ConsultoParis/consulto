"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallAppPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("1expert-install-dismissed")) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
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
    setVisible(false);
  }

  function handleClose() {
    localStorage.setItem("1expert-install-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm sm:p-0">
      <div
        className="card-soft relative flex items-start gap-3 p-4"
        style={{ backgroundColor: "var(--card)" }}
      >
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-ink/5"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "#3E8EF715" }}
        >
          <Download className="h-5 w-5" style={{ color: "#3E8EF7" }} />
        </div>

        <div className="min-w-0 flex-1 pr-5">
          <p className="font-display font-medium">Installer 1Expert</p>
          <p className="mt-1 text-sm text-muted">
            Accédez plus vite à vos rendez-vous, directement depuis l'écran d'accueil de votre téléphone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="btn-primary rounded-[6px] px-4 py-2 text-xs font-medium"
            >
              Installer
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary rounded-[6px] px-4 py-2 text-xs font-medium"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
