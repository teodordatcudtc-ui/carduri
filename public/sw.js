// Minimal service worker for StampIO PWA
// Currently just enables the "installable" experience.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", () => {
  // Passthrough – no offline cache yet
});

