import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addMessageToChat, getLastMessageByChatId, removeMessageFromChat } from "../hooks/chat/message";
import { useDispatch } from "react-redux";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useParams } from "react-router-dom";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

export const useSocketMessageListener = (socket) => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    async (data) => {
      const { sender, chatId, newMessage } = data;
      const { _id: senderId, name: senderName, profileImage: senderProfileImage } = sender || {};

      addMessageToChat(queryClient, senderId, newMessage);

      // Instead of manually updating the messages in the chat, invalidate the query for messages of this chat.

      // Dispatch a notification for the new message if the sender is not the current user and notifications are enabled.
      if (userId !== senderId && bulletNotificationEnabled) {
        console.log("called");
        dispatch(
          showNotistackAlert({
            message: "sent you a message",
            avatarSrc: senderProfileImage,
            notificationType: "message",
            senderName,
          })
        );
        // Invalidate queries to update unread counts
        queryClient.setQueryData(["totalUnreadMessages"], (oldCount) => Math.max(oldCount + 1, 0));
        queryClient.setQueryData(["unreadCount", chatId], (oldCount) => Math.max(oldCount + 1, 0));
      }

      // Invalidate the global chats query to update the chat list with the latest last message.
      queryClient.invalidateQueries({ queryKey: ["chats"], exact: true });
    },
    [dispatch, queryClient, userId, bulletNotificationEnabled]
  );

  const handleDeletedMessage = useCallback(
    async (data) => {
      const { senderId, deletedMessageId, chatId } = data;

      // Remove the deleted message from the chat messages cache
      removeMessageFromChat(queryClient, senderId, deletedMessageId);

      // Fetch and update the last message for this chat after deletion
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
