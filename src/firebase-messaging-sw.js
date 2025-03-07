// src/firebase-messaging-sw.js
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
  const notificationOptions = {
    body,
    icon: "/companyFaviIcon.png", // Ensure this path points to your icon in production
  };

  self.registration.showNotification(title, notificationOptions);
});
