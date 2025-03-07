// src/hooks/usePushNotifications.js
import { useEffect, useState } from "react";

const vapidPublicKey = "BMgBtk9f9OILx1SwXbXAn6x6X7s4Jhj7HJPv72-hdC8T-j6GkHjQF6Enp5CwM7zJ5oZkw2eJ0lVa56M7f8TJULM";

const usePushNotifications = () => {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    const registerPushNotifications = async () => {
      if (!("serviceWorker" in navigator)) {
        setError("Service Workers are not supported in this browser.");
        return;
      }

      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // Request notification permission
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
        if (permissionResult !== "granted") {
          setError("Notification permission not granted.");
          return;
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        console.log("Push subscription:", JSON.stringify(subscription));
        setSubscription(subscription);
      } catch (err) {
        console.error("Error in push subscription:", err);
        setError(err.message);
      }
    };

    registerPushNotifications();
  }, []);

  // Helper function: Convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  return { subscription, error, permission };
};

export default usePushNotifications;
