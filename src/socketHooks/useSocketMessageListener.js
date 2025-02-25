import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addMessageToChat, getLastMessageByChatId, removeMessageFromChat } from "../hooks/chat/message";
import { useDispatch } from "react-redux";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useParams } from "react-router-dom";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

export const useSocketMessageListener = (socket) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;

  const handleNewMessage = useCallback(
    async (data) => {
      const { newMessage, sender, chatId } = data;
      const { _id: senderId, name: senderName, profileImage: senderProfileImage } = sender || {};

      // Update the messages for the particular chat.
      addMessageToChat(queryClient, senderId, newMessage);

      // Dispatch a notification for the new message if the sender is not the current user and notifications are enabled.
      if (userId !== senderId && bulletNotificationEnabled) {
        dispatch(
          showNotistackAlert({
            message: "sent you a message",
            avatarSrc: senderProfileImage,
            notificationType: "message",
            senderName,
          })
        );
        queryClient.setQueryData(["totalUnreadMessages"], (oldCount) => oldCount + 1);
        queryClient.setQueryData(["unreadCount", chatId], (oldCount) => oldCount + 1);
      }

      // Update the global chats list with the last message for the chat.
      queryClient.setQueryData(["chats"], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            if (!page.chats) return page;
            return {
              ...page,
              chats: page.chats.map((chat) => (chat._id === chatId ? { ...chat, lastMessage: newMessage } : chat)),
            };
          }),
        };
      });
    },
    [dispatch, queryClient, userId, bulletNotificationEnabled]
  );

  const handleDeletedMessage = useCallback(
    async (data) => {
      const { deletedMessageId, senderId, chatId } = data;

      // Remove the deleted message from the chat messages cache.
      removeMessageFromChat(queryClient, senderId, deletedMessageId);

      // Fetch and update the last message for this chat after deletion.
      try {
        const lastMessageResponse = await getLastMessageByChatId(chatId);
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
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleDeletedMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleDeletedMessage);
    };
  }, [socket, handleNewMessage, handleDeletedMessage]);
};
