/* eslint-disable react/prop-types */
import React from "react";
import { ListItem, Avatar, ListItemText, Badge, styled, SpeedDial, SpeedDialAction, Tooltip, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive"; // for unarchiving
import DoneIcon from "@mui/icons-material/Done"; // Used as the WhatsApp one-tick icon
import { useNavigate } from "react-router-dom";

import { formatDate } from "../../utilsFunction/dateFn";
import { useGetUnreadCountForChat } from "../../hooks/chat/message";
import { useDeleteChat } from "../../hooks/chat/chat";
import { useToggleArchive } from "../../hooks/chat/chatSetting";
import { useGetFriendOnlineStatus } from "../../hooks/friends/friends";

// Styled badge to show online status with a ripple effect
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

const ChatListView = ({ chat }) => {
  const navigate = useNavigate();
  const { _id: chatId, participants, archived, lastMessage } = chat;
  // Destructure text and media from lastMessage
  const { text, media } = lastMessage || {};

  // Hooks for deletion and archiving operations.
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteChat();
  const { mutate: toggleArchive, isPending: isArchiving } = useToggleArchive();

  // Hook for unread count in this chat.
  const { data: unreadCount, isLoading: isUnreadLoading } = useGetUnreadCountForChat(chatId);
  console.log(unreadCount);

  // Assuming that on the backend the logged-in user is filtered out from participants,
  // so the remaining participant is the other user in the chat.
  const participant = participants[0] || {};
  const { profileImage, firstName, lastName } = participant;

  // Fetch the online status of the chat participant.
  const { data: userStatus, isLoading: isLoadingStatus } = useGetFriendOnlineStatus({
    userId: participant._id,
    mode: "chats",
  });
  const { isOnline, lastSeen } = userStatus || {};

  const actions = [
    {
      icon: isDeleting ? <CircularProgress size={24} /> : <DeleteOutlineIcon />,
      name: "Delete Chat",
      onClick: () => deleteConversation(chatId),
    },
    {
      icon: isArchiving ? <CircularProgress size={24} /> : archived ? <UnarchiveIcon /> : <ArchiveIcon />,
      name: archived ? "Unarchive Chat" : "Archive Chat",
      onClick: () => toggleArchive(chatId),
    },
  ];

  // Determine the status text (online or last seen).
  const getStatusText = () => {
    if (isLoadingStatus) return "Loading status...";
    if (isOnline) return "Online";
    if (lastSeen) return `Last seen ${formatDate(lastSeen)}`;
    return "";
  };

  // Function to render the last message content based on text and media.
  const renderLastMessageContent = () => {
    if (!lastMessage) return null;
    const mediaArray = Array.isArray(media) ? media : [];

    // Case: No media attached.
    if (mediaArray.length === 0) {
      return text ? <span style={{ fontSize: "0.8rem", color: "#555" }}>{text}</span> : null;
    }

    // Determine which media item to consider.
    const mediaItem = mediaArray.length === 1 ? mediaArray[0] : mediaArray[mediaArray.length - 1];

    // If text is present along with media.
    if (text) {
      return mediaItem.type === "video" ? (
        <span
          style={{
            fontSize: "0.8rem",
            color: "#555",
            display: "flex",
            alignItems: "center",
          }}
        >
          <DoneIcon fontSize="small" style={{ marginRight: "0.2rem" }} />
          {text}
        </span>
      ) : (
        <span style={{ fontSize: "0.8rem", color: "#555" }}>{text}</span>
      );
    } else {
      // If no text is provided, show a default message based on media type.
      return mediaItem.type === "video" ? (
        <span
          style={{
            fontSize: "0.8rem",
            color: "#555",
            display: "flex",
            alignItems: "center",
          }}
        >
          <DoneIcon fontSize="small" style={{ marginRight: "0.2rem" }} />
          sent you a video
        </span>
      ) : (
        <span style={{ fontSize: "0.8rem", color: "#555" }}>sent you a file</span>
      );
    }
  };

  return (
    <ListItem divider>
      <motion.div
        whileHover={{ scale: 1.02 }}
        style={{
          borderRadius: "0.6rem",
          overflow: "hidden",
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0.5rem",
        }}
      >
        <Tooltip title="Open Chat">
          <div onClick={() => navigate(`/chats/${participant._id}?name=${firstName} ${lastName}&profileImage=${profileImage}`)} style={{ cursor: "pointer" }}>
            {isOnline ? (
              <StyledBadge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot">
                <Avatar src={profileImage} sx={{ height: "3rem", width: "3rem", boxShadow: 3 }} />
              </StyledBadge>
            ) : (
              <Avatar src={profileImage} sx={{ height: "3rem", width: "3rem", boxShadow: 3 }} />
            )}
          </div>
        </Tooltip>
        <ListItemText
          primary={`${firstName} ${lastName}`}
          secondary={
            <>
              {lastMessage && (
                <>
                  {renderLastMessageContent()}
                  <br />
                </>
              )}
              <span style={{ fontSize: "0.7rem", color: "#888" }}>{getStatusText()}</span>
              {/* Show unread count if available and greater than zero */}
              {!isUnreadLoading && unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#d32f2f",
                    marginTop: "0.2rem",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  {unreadCount} new {unreadCount > 1 ? "messages" : "message"}
                </span>
              )}
            </>
          }
          primaryTypographyProps={{
            sx: { fontWeight: "bold", color: "#000", fontSize: ".9rem" },
          }}
          sx={{ marginLeft: "1rem" }}
        />
        {/* SpeedDial for chat actions */}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <SpeedDial
            ariaLabel="Chat actions"
            icon={<MoreVertIcon />}
            direction="left"
            FabProps={{
              size: "small",
              sx: { boxShadow: "none" },
            }}
          >
            {actions.map((action) => (
              <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.onClick} FabProps={{ size: "small" }} />
            ))}
          </SpeedDial>
        </div>
      </motion.div>
    </ListItem>
  );
};

export default ChatListView;
