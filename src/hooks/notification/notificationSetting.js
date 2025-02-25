import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

const toggleNotificationSettingApi = async () => {
  const response = await axiosInstance.patch("/notification/setting");
  return response.data;
};

const getNotificationSettingApi = async () => {
  const response = await axiosInstance.get("/notification/setting");
  return response.data;
};

export const useToggleNotificationSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleNotificationSettingApi,
    onSuccess: (data) => {
      console.log(data);
      queryClient.setQueryData(["notificationSetting"], (oldData) => {
        if (!oldData) return oldData;
        return { ...data };
      });
    },
  });
};

export const useGetNotificationSetting = () => {
  return useQuery({
    queryKey: ["notificationSetting"],
    queryFn: getNotificationSettingApi,
  });
};
