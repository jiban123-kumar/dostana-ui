// public/sw.js
self.addEventListener("push", (e) => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "companyFaviIcon.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close(); // Close the notification

  // Use self.clients instead of clients
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const url = e.notification.data.url;

      // Check if a matching client (tab) is already open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus(); // Focus the existing tab
        }
      }

      // If no matching client is found, open a new tab
      return self.clients.openWindow(url);
    })
  );
});
