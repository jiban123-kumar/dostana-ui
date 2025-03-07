// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Requests notification permission from the user and retrieves the FCM token.
 * Make sure that the VAPID key below matches the one in your Firebase console.
 */
export const requestForToken = async () => {
  try {
    // Request permission if not already granted
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: "BFdE-e7T6Qf8Kv4tkPpdVP73UbggrlE3YfpKB22qRLyaQy9zo7saERP_vheDBf7czbQLgmlQejPJ_Iah16Bwt-Y",
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      // You can also send this token to your server for later use.
      return currentToken;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    throw error;
  }
};

export { messaging, onMessage };
