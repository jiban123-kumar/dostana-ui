import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

const deleteChatApi = async (conversationId) => {
  console.log(conversationId);
  const response = await axiosInstance.delete(`/chat/${conversationId}`);
  return response.data;
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChatApi,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries(["chats"]);
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
export const useGetChatByUserId = (userId) => {
  return useInfiniteQuery({
    queryKey: ["chats", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(`/chat/${userId}`, {
        params: { page: pageParam, limit: 20 },
      });
      return {
        ...response.data,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(userId),
  });
};

export const useGetAllChats = () => {
  return useInfiniteQuery({
    queryKey: ["chats"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get("/chat", {
        params: { page: pageParam, limit: 10 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};
