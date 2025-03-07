import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
export const messaging = getMessaging(app);

/**
 * Request FCM token and handle notification permission.
 */
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: "BFdE-e7T6Qf8Kv4tkPpdVP73UbggrlE3YfpKB22qRLyaQy9zo7saERP_vheDBf7czbQLgmlQejPJ_Iah16Bwt-Y",
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground messages and display notifications.
 */
export const onForegroundMessage = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    if (Notification.permission === "granted") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/companyFaviIcon.png", // Ensure this file exists in the public folder
      });
    } else {
      console.warn("Notification permission not granted.");
    }
  });
};
