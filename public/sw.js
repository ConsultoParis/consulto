// Service worker minimal pour 1Expert.
// Volontairement simple : le site doit toujours afficher les données les
// plus récentes (experts, créneaux, réservations), donc pas de mise en
// cache agressive du contenu dynamique. Ce fichier sert surtout à rendre
// le site "installable" comme application (condition technique des PWA).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Passe simplement toutes les requêtes au réseau normal (pas de cache
// personnalisé) — le navigateur gère son propre cache HTTP standard.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
