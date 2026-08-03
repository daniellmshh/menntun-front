self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || "Menntun · Asistencia", {
    body: payload.body || "Hay una actualización de asistencia.",
    icon: "/favicon.ico",
    data: { url: payload.url || "/attendance" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/attendance"));
});
