importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize Workbox
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Qzm03splCGEaKFXn2rrkjbftITU6H9U",
  authDomain: "dostana-452011.firebaseapp.com",
  projectId: "dostana-452011",
  storageBucket: "dostana-452011.firebasestorage.app",
  messagingSenderId: "19932708049",
  appId: "1:19932708049:web:0325d4f2bf59f56ae259f0",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/companyFaviIcon.png",
    data: { url: payload.data.url }, // Preserve URL from payload
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click handler for notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || "/home";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => client.url === urlToOpen);

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Workbox runtime caching rules
workbox.routing.registerRoute(({ request }) => request.destination === "image", new workbox.strategies.CacheFirst());
