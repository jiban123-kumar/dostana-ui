import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useUserProfile } from "../userProfile/userProfile";

const sendMessageApi = async (data) => {
  const response = await axiosInstance.post(`/chat/send`, data, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
};
const deleteMessageApi = async (body) => {
  const response = await axiosInstance.post(`/chat/message`, body);
  return response.data;
};

const markMessagesAsReadApi = async ({ chatId }) => {
  const response = await axiosInstance.post(`/chat/markMessagesAsRead`, { chatId });
  return response.data;
};

// 2. Get the total unread messages count for the logged-in user.
const getTotalUnreadMessagesApi = async () => {
  const response = await axiosInstance.get(`/chat/unread/total`);
  return response.data.totalUnreadMessages;
};

const getUnreadCountForChatApi = async (chatId) => {
  const response = await axiosInstance.get(`/chat/unread/${chatId}`);
  return response.data.unreadCount;
};

export const getLastMessageByChatId = async (chatId) => {
  const response = await axiosInstance.get(`/chat/lastMessage/${chatId}`);
  return response.data;
};
const markMessageAsReadByIdsApi = async ({ messageIds }) => {
  const response = await axiosInstance.post(`/chat/message/read`, { messageIds });
  return response.data;
};

export const removeMessageFromChat = (queryClient, recipientId, deletedMessageId) => {
  queryClient.setQueryData(["chats", recipientId], (oldData) => {
    if (!oldData || !oldData.pages) {
      return oldData;
    }

    const updatedPages = oldData.pages.map((page) => ({
      ...page,
      messages: (page.messages || []).filter((msg) => msg._id !== deletedMessageId),
    }));

    return { ...oldData, pages: updatedPages };
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();

  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: (data) => {
      const sender = {
        profileImage: userProfile?.profileImage,
        name: userProfile?.firstName + " " + userProfile?.lastName,
        _id: userProfile?._id,
      };
      const { recipientId, newMessage, chatId } = data;
      socket.emit("newMessage", { targetUserId: recipientId, newMessage, sender, chatId });

      // Instead of manually updating the chat cache, invalidate the "chats" query:
      queryClient.invalidateQueries({ queryKey: ["chats"], exact: true });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();

  return useMutation({
    mutationFn: deleteMessageApi,
    onSuccess: async (data, variables) => {
      const { recipientId, messageId, deleteFor, chatId } = variables;
      if (deleteFor === "Everyone") {
        socket.emit("messageDeleted", { targetUserId: recipientId, deletedMessageId: messageId, senderId: userProfile?._id, chatId: data.chatId });
      }

      removeMessageFromChat(queryClient, recipientId, messageId);
      try {
        const lastMessageResponse = await getLastMessageByChatId(chatId);

        // Update the global "chats" query cache with the new last message.
        queryClient.setQueryData(["chats"], (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              if (!page.chats) return page;
              return {
                ...page,
                chats: page.chats.map((chat) => (chat._id === chatId ? { ...chat, lastMessage: lastMessageResponse.lastMessage } : chat)),
              };
            }),
          };
        });
      } catch (error) {
        console.error("Error updating last message after deletion:", error);
      }
    },
  });
};

export const useMarkMessagesAsRead = () => {
  return useMutation({
    mutationFn: markMessagesAsReadApi,
    onSuccess: () => {},
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    },
  });
};

// Hook to fetch the total unread messages count for the logged-in user.
export const useGetTotalUnreadMessages = () => {
  return useQuery({
    queryKey: ["totalUnreadMessages"],
    queryFn: getTotalUnreadMessagesApi,
  });
};

// Hook to fetch the unread message count for a specific chat.
export const useGetUnreadCountForChat = (chatId) => {
  return useQuery({
    queryKey: ["unreadCount", chatId],
    queryFn: () => getUnreadCountForChatApi(chatId),
    enabled: Boolean(chatId), // only run if chatId is provided
  });
};
export const useGetLastMessageByChatId = (chatId) => {
  return useQuery({
    queryKey: ["lastMessage", chatId],
    queryFn: () => getLastMessageByChatId(chatId),
    enabled: Boolean(chatId), // only run if chatId is provided
  });
};
export const useMarkMessageAsReadByIds = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsReadByIdsApi,
    onSuccess: (data, { chatId }) => {
      console.log(chatId);
      // Invalidate the cache for unreadCount for this specific chat
      queryClient.invalidateQueries({ queryKey: ["unreadCount", chatId], exact: true });
      // Invalidate the total unread messages cache
      queryClient.invalidateQueries({ queryKey: ["totalUnreadMessages"], exact: true });
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    },
  });
};
