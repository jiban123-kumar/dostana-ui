import { useEffect } from "react";
import { messaging, requestForToken } from "./firebase";
import { onMessage } from "firebase/messaging"; // Import onMessage
import axiosInstance from "../configs/axiosInstance";

const usePushNotifications = () => {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }

    const handleToken = async () => {
      try {
        const token = await requestForToken();
        if (token) {
          await axiosInstance.post("/notification/push-subscription", { token });
          console.log("FCM token sent to server");
        }
      } catch (error) {
        console.error("Error handling FCM token:", error);
      }
    };

    handleToken();

    // Initialize foreground message handler
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      // You can display the notification here using the Notification API
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/companyFaviIcon.png", // Change to your app's icon
      });
    });

    return () => unsubscribe();
  }, []);

  return null; // This is a hook, no need to return UI elements
};

export default usePushNotifications;
