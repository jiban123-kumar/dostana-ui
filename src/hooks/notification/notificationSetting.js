import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

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
  return useMutation({
    mutationFn: toggleNotificationSettingApi,
    onSuccess: (data) => {
      console.log("Notification setting toggled:", data);
      queryClient.setQueryData(["notificationSetting"], (oldData) => ({
        ...oldData,
        ...data,
      }));
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePushNotificationSettingApi,
    onSuccess: (data) => {
      console.log("Push notification setting toggled:", data);
      queryClient.setQueryData(["pushNotificationSetting"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
  });
};
