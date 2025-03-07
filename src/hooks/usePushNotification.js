import { useEffect } from "react";
import axios from "axios";
import { messaging, requestForToken, onMessage } from "../firebase";
import axiosInstance from "../configs/axiosInstance";

const usePushNotifications = () => {
  useEffect(() => {
    const initFCM = async () => {
      try {
        const token = await requestForToken();
        if (token) {
          console.log("Successfully obtained FCM token:", token);

          // Send the token to the backend for storage
          await axiosInstance.post("notification/push-subscription", { subscription: token });
          console.log("FCM token sent to backend.");
        }
      } catch (error) {
        console.error("Error during FCM initialization:", error);
      }
    };

    initFCM();
  }, []);

  return null;
};

export default usePushNotifications;
