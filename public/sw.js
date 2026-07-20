// Service worker 1Expert — stratégie volontairement équilibrée :
// - Fichiers statiques (JS, CSS, images, polices) : mis en cache, servis
//   depuis le cache en priorité, pour un fonctionnement hors-ligne réel.
// - Pages (navigation) : réseau en priorité (contenu à jour), avec repli
//   sur le cache puis sur une page hors-ligne si aucune connexion.
// - Données dynamiques (API, Supabase) : JAMAIS mises en cache — le site
//   doit toujours afficher les créneaux, réservations et experts à jour.

const CACHE_NAME = "1expert-cache-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isDynamicRequest(url) {
  return url.pathname.startsWith("/api/") || url.hostname.endsWith("supabase.co");
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET" || isDynamicRequest(url)) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
