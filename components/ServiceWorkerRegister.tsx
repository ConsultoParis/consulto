"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          try {
            if ("sync" in reg) {
              await (reg as any).sync.register("1expert-sync");
            }
            if ("periodicSync" in reg) {
              const status = await navigator.permissions.query({
                name: "periodic-background-sync" as PermissionName,
              });
              if (status.state === "granted") {
                await (reg as any).periodicSync.register("1expert-periodic-sync", {
                  minInterval: 24 * 60 * 60 * 1000,
                });
              }
            }
          } catch {
            // Non supporté par ce navigateur — aucun impact.
          }
        })
        .catch(() => {
          // Échec silencieux : le site reste utilisable normalement même
          // sans service worker (juste non-installable comme application).
        });
    }
  }, []);

  return null;
}
