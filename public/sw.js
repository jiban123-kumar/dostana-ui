// public/sw.js

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Default Title";
  const options = {
    body: data.body || "Default body message",
    // You can add more notification options here (icon, actions, etc.)
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
