"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Échec silencieux : le site reste utilisable normalement même
        // sans service worker (juste non-installable comme application).
      });
    }
  }, []);

  return null;
}
