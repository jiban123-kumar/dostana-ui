// usePushNotifications.js
import { useEffect } from "react";
import axiosInstance from "../../configs/axiosInstance";
const usePushNotifications = (vapidPublicKey) => {
  useEffect(() => {
    // Check if browser supports notifications and service workers
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Push notifications are not supported in this browser.");
      return;
    }

    // Utility function: Converts a base64 string to a Uint8Array (needed for VAPID keys)
    const urlBase64ToUint8Array = (base64String) => {
      // Add padding if necessary
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      // Convert URL-safe base64 to standard base64
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      // Decode the base64 string
      const rawData = window.atob(base64);
      // Convert to Uint8Array
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    // Function to subscribe the user for push notifications
    const subscribeUser = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (!existingSubscription) {
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
          // Use axios to send the subscription object to your backend
          await axiosInstance.post("/notification/push-subscription", { subscription: newSubscription });
          console.log("Subscribed for push notifications:", newSubscription);
        } else {
          console.log("User is already subscribed:", existingSubscription);
        }
      } catch (error) {
        console.error("Failed to subscribe the user:", error);
      }
    };

    // Function to check notification permission and request if needed (with 24h re-prompt logic)
    const checkAndRequestPushPermission = async () => {
      const currentPermission = Notification.permission;
      if (currentPermission === "default") {
        const lastPrompt = localStorage.getItem("lastNotificationPrompt");
        const now = Date.now();
        const oneDay = 86400000; // 24 hours in milliseconds
        if (!lastPrompt || now - parseInt(lastPrompt, 10) > oneDay) {
          localStorage.setItem("lastNotificationPrompt", now.toString());
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            subscribeUser();
          }
        }
      } else if (currentPermission === "granted") {
        subscribeUser();
      } else {
        console.log("User denied notifications. Will re-prompt after 24 hours.");
      }
    };

    // Execute the permission check and subscription on mount
    checkAndRequestPushPermission();
  }, [vapidPublicKey]);
};

export default usePushNotifications;
