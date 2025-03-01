import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

const deleteChatApi = async (conversationId) => {
  const response = await axiosInstance.delete(`/chat/${conversationId}`);
  return response.data;
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChatApi,
    onSuccess: (data) => {
      // Instead of invalidating queries, update the cache to remove the deleted chat
      queryClient.setQueryData(["chats"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            chats: page.chats.filter((chat) => chat._id !== data.chatId),
          })),
        };
      });
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
export const useGetArchivedChats = (archived) => {
  console.log(archived);
  return useInfiniteQuery({
    queryKey: ["archived-chats"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get("/chat?archive=true", {
        params: { page: pageParam, limit: 10 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    enabled: archived,
  });
};
