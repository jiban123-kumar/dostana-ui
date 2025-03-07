// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import { messaging, requestForToken, onMessage } from "../firebase";

const usePushNotifications = () => {
  useEffect(() => {
    // Function to request permission and fetch the FCM token
    const initFCM = async () => {
      try {
        const token = await requestForToken();
        if (token) {
          // Optionally, send the token to your backend server here
          console.log("Successfully obtained FCM token:", token);
        }
      } catch (error) {
        console.error("Error during FCM initialization:", error);
      }
    };

    initFCM();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // Optionally, display a notification using the browser Notification API
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/companyFaviIcon.png",
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default usePushNotifications;
