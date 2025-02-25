import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, List, SpeedDial, SpeedDialAction, Stack, Typography, Skeleton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DeleteRounded, SettingsRounded, NotificationsActiveRounded } from "@mui/icons-material";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import Lottie from "lottie-react";
import { notificationAnimation } from "../../animation";
import { useGetNotificationSetting, useToggleNotificationSetting } from "../../hooks/notification/notificationSetting";
import { useMarkNotificationsAsReadByIds } from "../../hooks/notification/notificationReader";
import { useDeleteAllNotifications, useGetNotifications } from "../../hooks/notification/notification";
import NotificationList from "./NotificationList";
import { AnimatePresence } from "motion/react";

const CustomSpeedDial = styled(SpeedDial)(({ theme }) => ({
  "& .MuiFab-root": {
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
}));

const NotificationModal = ({ open, handleClose }) => {
  const [openSetting, setOpenSetting] = useState(false);
  const dialogContentRef = useRef(null);
  const bottomRef = useRef(null);
  const viewedNotificationIdsRef = useRef(new Set());

  const { mutate: markNotificationsAsReadByIds } = useMarkNotificationsAsReadByIds();

  useEffect(() => {
    return () => {
      const ids = Array.from(viewedNotificationIdsRef.current);
      if (ids.length > 0) {
        markNotificationsAsReadByIds(ids);
      }
    };
  }, [markNotificationsAsReadByIds]);

  const handleCloseSetting = () => setOpenSetting(false);
  const handleOpenSetting = () => setOpenSetting(true);

  // Toggle notification setting
  const { data: notificationData } = useGetNotificationSetting();
  // Now use bulletNotificationEnabled instead of notificationEnabled
  const bulletNotificationEnabled = notificationData?.bulletNotificationEnabled;
  const { mutate: toggleNotificationSetting, isPending: isTogglingSetting } = useToggleNotificationSetting();
  const handleToggleNotifications = () => {
    toggleNotificationSetting();
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications();

  const notifications = useMemo(() => (data ? data.pages.flatMap((page) => page.notifications) : []), [data]);

  const { mutate: deleteAllNotifications, isPending: isDeletingNotifications } = useDeleteAllNotifications();

  const handleDeleteAll = () => {
    deleteAllNotifications(null, {
      onSuccess: () => {
        handleCloseSetting();
      },
    });
  };

  useEffect(() => {
    const currentRef = bottomRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: dialogContentRef.current,
        threshold: 0.1,
      }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [bottomRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNotificationViewed = useCallback((notificationId) => {
    viewedNotificationIdsRef.current.add(notificationId);
  }, []);

  const hideNotificationModal = useCallback(() => {
    handleClose();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Stack sx={{ width: "100%", overflow: "hidden", paddingX: "1rem" }} flexDirection="row" justifyContent="space-between" alignItems="center">
        <DialogTitle sx={{ fontWeight: "bold" }}>Notifications</DialogTitle>
        <Stack>
          <CustomSpeedDial open={openSetting} onClose={handleCloseSetting} ariaLabel="SpeedDial openIcon example" icon={<SettingsRounded color="action" />} direction="left" onOpen={handleOpenSetting}>
            <SpeedDialAction icon={isDeletingNotifications ? <CircularProgress size={24} /> : <DeleteRounded />} key="delete" tooltipTitle={isDeletingNotifications ? "Deleting..." : "Delete All"} onClick={handleDeleteAll} tooltipPlacement="bottom" />
            <SpeedDialAction
              icon={isTogglingSetting ? <CircularProgress size={24} /> : bulletNotificationEnabled ? <NotificationsActiveRounded /> : <NotificationsOffIcon />}
              key="toggle"
              tooltipTitle={bulletNotificationEnabled ? "Turn Off Notifications" : "Turn On Notifications"}
              onClick={handleToggleNotifications}
              tooltipPlacement="bottom"
            />
          </CustomSpeedDial>
        </Stack>
      </Stack>
      <DialogContent
        ref={dialogContentRef}
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          margin: 0,
          padding: 0,
          paddingX: "1rem",
        }}
      >
        {isLoading ? (
          Array.from(new Array(5)).map((_, idx) => <Skeleton key={idx} variant="rectangular" height={60} sx={{ borderRadius: ".6rem", marginBottom: "0.5rem" }} />)
        ) : notifications && notifications.length > 0 ? (
          <List sx={{ width: "100%", px: ".4rem" }}>
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationList key={notification._id} notification={notification} onView={handleNotificationViewed} hideNotificationModal={hideNotificationModal} />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} style={{ height: "1px" }}></div>
            {isFetchingNextPage && (
              <Stack alignItems="center" justifyContent="center" sx={{ padding: "1rem" }}>
                <CircularProgress size={24} />
              </Stack>
            )}
          </List>
        ) : (
          <Stack justifyContent="center" alignItems="center" sx={{ width: "100%", padding: "1rem" }}>
            <Lottie animationData={notificationAnimation} style={{ height: "40%", width: "40%", objectFit: "cover" }} />
            <Typography variant="body1" sx={{ marginTop: "1rem", transform: "translateY(-3rem)" }}>
              No notifications yet.
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(NotificationModal);
