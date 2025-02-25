import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

const toggleArchiveApi = async ({ chatId, recipientId }) => {
  const response = await axiosInstance.patch(`/chat/archive/${chatId}`, { recipientId });
  return response.data;
};
export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleArchiveApi,
    onSuccess: (data) => {
      const { archived, chatId, recipientId } = data;

      queryClient.setQueryData(["chats", recipientId], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, pages: oldData.pages.map((page) => ({ ...page, archived })) };
      });
      const updatePages = (data) => ({
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          chats: page.chats.map((chat) => (chat._id.toString() === chatId.toString() ? { ...chat, archived } : chat)),
        })),
      });

      // Get all queries whose key begins with "chats"
      const queries = queryClient.getQueriesData({ queryKey: ["chats"] });

      queries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, updatePages(data));
      });
    },
  });
};
