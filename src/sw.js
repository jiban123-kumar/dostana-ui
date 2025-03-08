// public/sw.js

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    console.log(event.data);
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
  }
  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    icon: "/companyFaviIcon.png", // adjust icon as needed
    data: {
      url: data.data?.url, // dynamic URL sent from the backend
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickUrl = event.notification.data?.url;
  if (clickUrl) {
    event.waitUntil(clients.openWindow(clickUrl));
  }
});
self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
});
