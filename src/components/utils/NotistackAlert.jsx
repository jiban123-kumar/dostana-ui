import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { Alert, Avatar, Badge, Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { hideNotistackAlert } from "../../reduxSlices/notistackAlertSlice";
import { notificationSound } from "../../assets";
import { useGetNotificationSetting } from "../../hooks/notification/notificationSetting";

// StyledBadge will be used when the notification type is "friend_online".
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(0.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const NotistackAlert = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  // Grab the alert values from Redux.
  const { isVisible, message, avatarSrc, notificationType, senderName } = useSelector((state) => state.notistackAlert);

  useEffect(() => {
    if (isVisible) {
      // Play notification sound.
      const sound = new Audio(notificationSound);
      sound.play().catch((error) => console.error("Error playing sound:", error));

      // Enqueue the snackbar with a custom content.
      enqueueSnackbar("", {
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        content: (key) => (
          <Alert
            key={key}
            severity={notificationType === "friend_online" ? "info" : "success"}
            icon={
              notificationType === "friend_online" ? (
                <StyledBadge overlap="circular" variant="dot" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                  <Avatar src={avatarSrc} sx={{ boxShadow: 3 }} />
                </StyledBadge>
              ) : (
                <Avatar src={avatarSrc} sx={{ boxShadow: 3 }} />
              )
            }
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#333",
              fontSize: "1rem",
              textTransform: "none",
              borderRadius: ".4rem",
              bgcolor: "#fff",
            }}
            variant="filled"
            component={Paper}
            elevation={3}
          >
            <Box>
              {/* Primary text: Sender's name */}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {senderName}
              </Typography>
              {/* Secondary text: Action message */}
              <Typography variant="body2">{message}</Typography>
            </Box>
          </Alert>
        ),
        autoHideDuration: 7000,
      });

      // Hide the alert from Redux once it's been enqueued.
      dispatch(hideNotistackAlert());
    }
  }, [isVisible, message, avatarSrc, notificationType, senderName, enqueueSnackbar, dispatch]);

  return null;
};

export default NotistackAlert;
