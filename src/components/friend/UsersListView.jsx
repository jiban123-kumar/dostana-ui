/* eslint-disable react/prop-types */
import React from "react";
import { Avatar, Badge, IconButton, Paper, Stack, styled, Tooltip, Box, Typography, Button } from "@mui/material";
import { CheckCircle as CheckCircleIcon, PersonRemove as PersonRemoveIcon, PersonAdd as PersonAddIcon, CancelOutlined, Message as MessageIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utilsFunction/dateFn";
import { useCancelFriendRequest, useSendFriendRequest } from "../../hooks/friends/suggestedUsers";
import { useAcceptFriendRequest, useDeclineFriendRequest } from "../../hooks/friends/friendRequests";
import { useGetFriendOnlineStatus, useRemoveFriend } from "../../hooks/friends/friends";
import { useDispatch } from "react-redux";
import { setChatRecipientProfile } from "../../reduxSlices/chatRecipient";

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
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const UsersListView = ({ user, mode }) => {
  const { _id: userId, profileImage, firstName, lastName } = user;
  const navigate = useNavigate();

  // API hooks for friend actions (socket removed)
  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutate: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutate: declineFriendRequest, isPending: isDecliningFriendRequest } = useDeclineFriendRequest();
  const { mutate: removeFriend, isPending: isRemovingFriend } = useRemoveFriend();
  const { mutate: cancelFriendRequest, isPending: isCancelingFriendRequest } = useCancelFriendRequest();

  // Fetch real-time status of the user
  const { data: userStatus, isLoading: isLoadingUserStatus } = useGetFriendOnlineStatus({ userId, mode });
  console.log(userStatus);
  const { isOnline, lastSeen } = userStatus || {};

  // --- Event Handlers ---
  const handleSendFriendRequest = () => {
    sendFriendRequest(userId);
  };

  const handleCancelFriendRequest = () => {
    cancelFriendRequest(userId);
  };

  const handleAcceptFriendRequest = () => {
    acceptFriendRequest(userId);
  };

  const handleDeclineFriendRequest = () => {
    declineFriendRequest(userId);
  };

  const handleRemoveFriend = () => {
    removeFriend(userId);
  };

  // --- Helper Functions ---
  const getStatusText = () => {
    if (mode !== "friends") return null;
    if (isOnline) return "Online";
    if (!isLoadingUserStatus && lastSeen) return `Last seen ${formatDate(lastSeen)}`;
    return "";
  };

  const renderActionButtons = () => {
    if (mode === "pendingRequests") {
      return (
        <>
          <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={handleAcceptFriendRequest} loading={isAcceptingFriendRequest} loadingPosition="start">
            Accept
          </Button>
          <Button variant="outlined" size="small" startIcon={<CancelOutlined />} onClick={handleDeclineFriendRequest} sx={{ fontWeight: "bold", color: "grey", borderColor: "grey", ml: 1 }} loading={isDecliningFriendRequest} loadingPosition="start">
            Decline
          </Button>
        </>
      );
    }

    if (mode === "friends") {
      return (
        <>
          <Button variant="outlined" size="small" startIcon={<PersonRemoveIcon />} onClick={handleRemoveFriend} loading={isRemovingFriend} loadingPosition="start">
            Remove
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<MessageIcon />}
            onClick={() => {
              navigate(`/chats/${userId}?name=${firstName} ${lastName}&profileImage=${profileImage}`);
            }}
            sx={{ ml: 1 }}
          >
            Message
          </Button>
        </>
      );
    }

    // Default (suggested friends) mode:
    // Rely on the user's status from props.
    return user.status === "pending" ? (
      <Tooltip title="Cancel Request">
        <Button variant="outlined" size="small" startIcon={<CancelOutlined />} onClick={handleCancelFriendRequest} sx={{ color: "grey", borderColor: "grey" }} loading={isCancelingFriendRequest} loadingPosition="start">
          Request Sent
        </Button>
      </Tooltip>
    ) : (
      <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={handleSendFriendRequest} sx={{ fontWeight: "bold" }} loading={isSendingFriendRequest} loadingPosition="start">
        Add Friend
      </Button>
    );
  };

  // --- Render Component ---
  return (
    <motion.div whileHover={{ scale: 1.02 }} style={{ width: "100%" }}>
      <Paper elevation={2} sx={{ margin: "0.5rem 0", borderRadius: "0.8rem", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", padding: "0.8rem" }}>
          <Tooltip title="Visit Profile">
            <IconButton onClick={() => navigate(`/user-profile/${userId}`)}>
              {mode === "friends" && isOnline && !isLoadingUserStatus ? (
                <StyledBadge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot">
                  <Avatar src={profileImage} sx={{ height: "3rem", width: "3rem", boxShadow: 3 }} />
                </StyledBadge>
              ) : (
                <Avatar src={profileImage} sx={{ height: "3rem", width: "3rem", boxShadow: 3 }} />
              )}
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1, marginLeft: "1rem" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#000", fontSize: "1rem" }}>
              {firstName} {lastName}
            </Typography>
            {mode === "friends" && (
              <Typography variant="caption" color="text.secondary">
                {getStatusText()}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {renderActionButtons()}
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default UsersListView;
