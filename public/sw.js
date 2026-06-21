// PWA Service-Worker-Scaffold (Phase 1).
// Reicht fuer Installierbarkeit. Push-Logik ist als Stub angelegt und
// in Phase 1 NICHT scharf geschaltet (siehe lib/push/* — Phase-2-ready).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// --- Phase-2-Hook: Push fuer ausgefallene Einheit (No-Show frisch erfassen). ---
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = (() => {
    try {
      return event.data.json();
    } catch {
      return { title: "Bewegungs-Coach", body: event.data.text() };
    }
  })();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Bewegungs-Coach", {
      body: data.body ?? "",
      data: data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url ?? "/"));
});
