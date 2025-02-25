import { useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SocketContext } from "../contextProvider/SocketProvider";
import { useDispatch } from "react-redux";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

export const useSocketNotificationListener = () => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      const { notification } = data;

      // Dispatch a notistack alert for the new notification if notifications are enabled.
      if (bulletNotificationEnabled) {
        dispatch(
          showNotistackAlert({
            message: notification.action,
            avatarSrc: notification.sender.profileImage,
            notificationType: "notification",
            senderName: `${notification.sender.firstName} ${notification.sender.lastName}`,
          })
        );
      }

      queryClient.setQueryData(["unreadNotificationCount"], (oldCount) => {
        if (typeof oldCount === "number") {
          return oldCount + 1;
        }
        return oldCount;
      });

      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => (index === 0 ? { ...page, notifications: [notification, ...page.notifications] } : page)),
        };
      });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, queryClient, dispatch, bulletNotificationEnabled]);
};
