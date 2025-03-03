import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";

// API Calls
const toggleNotificationSettingApi = async () => {
  const response = await axiosInstance.patch("/notification/setting");
  return response.data;
};

const getNotificationSettingApi = async () => {
  const response = await axiosInstance.get("/notification/setting");
  return response.data;
};

const getPushNotificationSettingApi = async () => {
  const response = await axiosInstance.get("/notification/push-subscription");
  return response.data;
};

const togglePushNotificationSettingApi = async () => {
  const response = await axiosInstance.patch("/notification/push-subscription");
  return response.data;
};

// React Query Hooks
export const useToggleNotificationSetting = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: notificationSetting } = useGetNotificationSetting();

  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;
  return useMutation({
    mutationFn: toggleNotificationSettingApi,
    onMutate: () => {
      dispatch(showAlert({ message: `${bulletNotificationEnabled ? "Disabling" : "Enabling"} bullet notifications...`, type: "info", loading: true }));
    },
    onSuccess: (data) => {
      console.log("Notification setting toggled:", data);
      dispatch(showAlert({ message: `Bullet notifications ${data.bulletNotificationEnabled ? "enabled" : "disabled"} `, type: "success", loading: false }));
      queryClient.setQueryData(["notificationSetting"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
    onError: (error) => {
      console.error("Error toggling notification setting:", error);
      dispatch(showAlert({ message: `Failed to ${bulletNotificationEnabled ? "disable" : "enable"} bullet notifications.`, type: "error", loading: false }));
    },
  });
};

export const useGetNotificationSetting = () => {
  return useQuery({
    queryKey: ["notificationSetting"],
    queryFn: getNotificationSettingApi,
  });
};

export const useGetPushNotificationSetting = () => {
  return useQuery({
    queryKey: ["pushNotificationSetting"],
    queryFn: getPushNotificationSettingApi,
  });
};

export const useTogglePushNotificationSetting = () => {
  const { data: pushNotificationSetting } = useGetPushNotificationSetting();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: togglePushNotificationSettingApi,
    onMutate: () => {
      const pushEnabled = pushNotificationSetting.pushEnabled;
      dispatch(showAlert({ message: `${pushEnabled ? "Disabling" : "Enabling"} push notifications...`, type: "info", loading: true }));
    },

    onSuccess: (data) => {
      console.log("Push notification setting toggled:", data);
      dispatch(showAlert({ message: `Push notifications ${data.pushEnabled ? "enabled" : "disabled"}`, type: "success", loading: false }));
      queryClient.setQueryData(["pushNotificationSetting"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
    onError: (error) => {
      console.error("Error toggling push notification setting:", error);
      dispatch(showAlert({ message: `Failed to ${pushNotificationSetting.pushEnabled ? "disable" : "enable"} push notifications. Please try again.`, type: "error", loading: false }));
    },
  });
};

// Helper: Convert a Base64 public VAPID key to a Uint8Array
// Helper: Convert a Base64 public VAPID key to a Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Function to subscribe for push notifications with explicit permission check
export const subscribePush = async () => {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported by this browser.");
  }
  if (Notification.permission === "default") {
    // Ask for permission if not already granted or denied
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== "granted") {
      throw new Error("User did not grant permission for notifications.");
    }
  } else if (Notification.permission === "denied") {
    throw new Error("User has blocked notifications.");
  }

  if ("serviceWorker" in navigator && "PushManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY),
    });
    console.log("Push subscription successful:", subscription);
    return subscription;
  }
  throw new Error("Push notifications are not supported in this browser.");
};

// Function to unsubscribe from push notifications remains unchanged
export const unsubscribePush = async () => {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log("Push unsubscription successful.");
      return { unsubscribed: true };
    }
    return null;
  }
  throw new Error("Push notifications are not supported in this browser.");
};
