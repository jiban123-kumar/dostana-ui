/* eslint-disable no-undef */
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker using the same config
const firebaseConfig = {
  apiKey: "AIzaSyD8Qzm03splCGEaKFXn2rrkjbftITU6H9U",
  authDomain: "dostana-452011.firebaseapp.com",
  projectId: "dostana-452011",
  storageBucket: "dostana-452011.firebasestorage.app",
  messagingSenderId: "19932708049",
  appId: "1:19932708049:web:0325d4f2bf59f56ae259f0",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const { title, body } = payload.notification;
  // Use payload.data (which includes url) for the click action.
  const notificationOptions = {
    body,
    icon: "/companyFaviIcon.png",
    data: {
      url: payload.data?.url, // The dynamic URL from your backend
    },
  };

  self.registration.showNotification(title, notificationOptions);
});

// Listen to notification click events
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Retrieve the URL from the notification's data.
  const clickUrl = event.notification.data?.url;
  if (clickUrl) {
    event.waitUntil(clients.openWindow(clickUrl));
  }
});
