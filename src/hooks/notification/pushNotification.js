import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axiosInstance";

const usePushNotifications = (shouldInit = false) => {
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);

  // Check if push notifications are supported in the browser
  const isPushSupported = () => "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

  // Check if 24 hours have passed since the last prompt
  const checkPromptInterval = () => {
    const lastPrompt = localStorage.getItem("pushNotificationPromptTimestamp");
    const now = Date.now();
    return !lastPrompt || now - parseInt(lastPrompt, 10) > 24 * 60 * 60 * 1000;
  };

  // Subscribe the user to push notifications
  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });
      await axiosInstance.post("/notification/push-subscribe", { subscription });
      setIsPushEnabled(true);
      console.log("User subscribed to push notifications");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      setIsPushEnabled(false);
    }
  };

  // Unsubscribe the user from push notifications
  const unsubscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axiosInstance.post("/notification/push-unsubscribe");
        setIsPushEnabled(false);
        console.log("User unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
    }
  };

  // Toggle push notifications manually (if needed)
  const togglePushNotifications = async () => {
    if (!isPushSupported()) {
      console.log("Push notifications are not supported in this browser.");
      return;
    }
    setIsPushLoading(true);
    try {
      if (isPushEnabled) {
        await unsubscribeUser();
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
          await subscribeUser();
        } else {
          console.log("Notification permission denied.");
        }
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error);
    } finally {
      setIsPushLoading(false);
    }
  };

  // Only run the effect if shouldInit is true (i.e. user is logged in and profile is complete)
  useEffect(() => {
    console.log(shouldInit);
    if (!shouldInit) return;
    if (isPushSupported()) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setIsPushEnabled(!!subscription);
        // If no subscription exists and 24 hours have passed since last prompt, trigger the native prompt
        if (!subscription && checkPromptInterval()) {
          localStorage.setItem("pushNotificationPromptTimestamp", Date.now());
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            await subscribeUser();
          }
        }
      });
    }
  }, [shouldInit]);

  return {
    isPushEnabled,
    isPushLoading,
    togglePushNotifications,
  };
};

export default usePushNotifications;
