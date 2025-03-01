/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Avatar, Box, Dialog, DialogContent, Stack, Typography, CircularProgress, SpeedDial, SpeedDialAction, styled, Badge, Button, useMediaQuery, IconButton } from "@mui/material";
import { Archive as ArchiveIcon, Unarchive as UnarchiveIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon } from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import { formatDate } from "../../utilsFunction/dateFn";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Message from "./Message";
import SendingMessages from "./SendingMessages";
import Lottie from "lottie-react";
import groupedMessagesByDate from "../../utilsFunction/groupedMessagesByDate";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useDeleteChat, useGetChatByUserId } from "../../hooks/chat/chat";
import { useGetFriendOnlineStatus } from "../../hooks/friends/friends";
import { useMarkMessageAsReadByIds, useSendMessage } from "../../hooks/chat/message";
import { useToggleArchive } from "../../hooks/chat/chatSetting";
import { chatSecondaryAnimation, chatPrimaryAnimation } from "../../animation";
import MessageInput from "./MessageInput"; // New input component
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

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
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

const ChatDialog = ({ open, handleClose }) => {
  // ─── ROUTER, CONTEXT AND USER DATA ─────────────────────────────
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();

  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name");
  const profileImage = searchParams.get("profileImage");

  // ─── FETCH DATA (CONVERSATION & USER STATUS) ───────────────────────────
  const { data: chatData, isLoading: isLoadingConversation, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetChatByUserId(userId);
  const { mutate: markMessagesAsReadByIds } = useMarkMessageAsReadByIds();

  const isBelow600 = useMediaQuery("(max-width:600px)");

  const isArchived = useMemo(() => {
    return chatData?.pages[0]?.archived;
  }, [chatData]);

  const viewedMessageIdsRef = useRef(new Set());

  const handleMessageViewed = useCallback((messageId) => {
    viewedMessageIdsRef.current.add(messageId);
  }, []);

  // Optionally, capture the chatId at mount time
  const chatIdRef = useRef(chatData?.pages[0]?.chatId);

  useEffect(() => {
    // The empty dependency array ensures this effect only runs once (on mount)
    return () => {
      // This cleanup function will only run on unmount
      const viewedIds = Array.from(viewedMessageIdsRef.current);
      if (viewedIds.length > 0) {
        markMessagesAsReadByIds({ messageIds: viewedIds, chatId: chatIdRef.current });
      }
    };
  }, []);

  // Flatten messages from infinite query (oldest messages at the top)
  const allPages = chatData?.pages || [];
  const recipient = allPages?.length !== 0 && allPages[0]?.participants[0];

  const chatId = allPages[0]?.chatId;
  const messages = useMemo(() => {
    const allPages = chatData?.pages || [];
    return allPages
      .slice()
      .reverse()
      .flatMap((page) => page.messages);
  }, [chatData]);

  const { data: statusData } = useGetFriendOnlineStatus({ userId, mode: "chats" });

  // ─── LOCAL STATE ──────────────────────────────────────────────────────
  const [pendingMessages, setPendingMessages] = useState([]);

  // ─── REFS ──────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // ─── INFINITE SCROLL HANDLER ──────────────────────────────────────────────
  const handleScroll = () => {
    if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  // ─── MUTATION HOOKS ─────────────────────────────────────────────────────
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: toggleArchive, isPending: isTogglingArchive } = useToggleArchive();
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteChat();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const id = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(id);
  }, [messages]);

  // Initial scroll after mount
  useEffect(() => {
    const id = setTimeout(() => {
      if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(id);
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────────────────

  const performSendMessage = (formData, clientId, pendingMsgUpdater) => {
    sendMessage(formData, {
      onSuccess: (data) => {
        pendingMsgUpdater("sent");
        setTimeout(() => {
          setPendingMessages((prev) => prev.filter((msg) => msg.clientId !== clientId));
        }, 2000);
      },
      onError: () => {
        pendingMsgUpdater("failed");
      },
    });
  };

  // This function is passed to MessageInput to trigger sending
  const handleSendMessage = (messageText, attachedImages) => {
    const clientId = Date.now().toString();
    const mediaPreviews = attachedImages.map((file) => URL.createObjectURL(file));
    const newPendingMessage = {
      clientId,
      text: messageText,
      mediaFiles: attachedImages,
      mediaPreviews,
      status: "sending",
      sentAt: new Date(),
    };

    setPendingMessages((prev) => [...prev, newPendingMessage]);

    const formData = new FormData();
    formData.append("text", messageText);
    formData.append("recipientId", userId);
    attachedImages.forEach((file) => formData.append("media", file));

    performSendMessage(
      formData,
      clientId,
      (newStatus) => {
        setPendingMessages((prev) => prev.map((msg) => (msg.clientId === clientId ? { ...msg, status: newStatus } : msg)));
      },
      mediaPreviews
    );
  };

  const handleRetry = (message) => {
    const formData = new FormData();
    formData.append("text", message.text);
    formData.append("recipientId", userId);
    message.mediaFiles.forEach((file) => formData.append("media", file));

    // Update the existing pending message to "sending"
    setPendingMessages((prev) => prev.map((msg) => (msg.clientId === message.clientId ? { ...msg, status: "sending" } : msg)));

    // Use the same clientId for retrying
    performSendMessage(formData, message.clientId, (newStatus) => {
      setPendingMessages((prev) => prev.map((msg) => (msg.clientId === message.clientId ? { ...msg, status: newStatus } : msg)));
    });
  };

  const handleRemovePending = (message) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.clientId !== message.clientId));
  };

  const handleArchiveToggle = () => {
    if (!chatId) return;
    toggleArchive(
      { chatId, recipientId: userId },
      {
        onSuccess: () => {},
      }
    );
  };

  const handleConversationDelete = () => {
    if (!chatId) return;
    deleteConversation(chatId, {
      onSuccess: () => navigate("/chats"),
      onError: (error) => console.error("Delete failed:", error),
    });
  };

  const getStatusText = () => {
    if (statusData?.isOnline) return "Online";
    if (statusData?.lastSeen) return `Last seen ${formatDate(statusData.lastSeen)}`;
    return "";
  };

  const handleInputFocus = () => {
    console.log("Input focused");
    if (inputRef?.current) inputRef.current.focus();
  };

  return (
    <Dialog open={Boolean(userId)} maxWidth="sm" fullWidth onClose={() => navigate(-1)} fullScreen={isBelow600}>
      {/* Pending messages with animation */}
      <Box sx={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 1400, maxHeight: "70vh", overflowY: "auto", overflowX: "hidden", width: "80%" }}>
        <AnimatePresence>
          {pendingMessages.map((message) => (
            <SendingMessages key={message.clientId} message={message} onRetry={handleRetry} onRemove={handleRemovePending} />
          ))}
        </AnimatePresence>
      </Box>

      <DialogContent sx={{ display: "flex", flexDirection: "column", height: { md: "70vh", xs: "80vh" }, p: { xs: ".4rem", sm: "1rem" } }}>
        {/* Header with user info and actions */}
        <Stack direction="row" alignItems="center" spacing={2} p={isBelow600 ? 0.6 : 2} sx={{ position: "relative", borderRadius: "1rem", boxShadow: 3, mb: 2 }} justifyContent="space-between">
          <Stack direction="row" spacing={isBelow600 ? 0 : 2} alignItems="center">
            {isBelow600 && (
              <IconButton onClick={() => navigate(-1)}>
                <ArrowCircleLeftIcon sx={{ height: "2rem", width: "2rem" }} />
              </IconButton>
            )}
            <Stack flexDirection={"row"} alignItems={"center"} ml="-.8rem">
              <IconButton onClick={() => navigate(`/user-profile/${userId}`)}>
                {statusData?.isOnline ? (
                  <StyledBadge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot">
                    <Avatar src={profileImage || recipient?.profileImage} sx={{ height: "3rem", width: "3rem", boxShadow: 3 }} />
                  </StyledBadge>
                ) : (
                  <Avatar src={recipient?.profileImage} sx={{ height: { xs: "2.5rem", sm: "3rem" }, width: { xs: "2.5rem", sm: "3rem" }, boxShadow: 3 }} />
                )}
              </IconButton>
              <Stack>
                {(name || recipient?.firstName || recipient?.lastName) && (
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}>
                    {name || `${recipient?.firstName} ${recipient?.lastName}`}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" } }}>
                  {getStatusText()}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <SpeedDial
            ariaLabel="Chat actions"
            icon={<MoreVertIcon />}
            direction="left"
            FabProps={{ size: "small" }}
            sx={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <SpeedDialAction
              icon={isTogglingArchive ? <CircularProgress size={24} color="inherit" /> : isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
              tooltipTitle={isArchived ? "Unarchive" : "Archive"}
              onClick={handleArchiveToggle}
              FabProps={{
                sx: {
                  bgcolor: isArchived ? "green" : "inherit", // Green if archived
                  "&:hover": {
                    bgcolor: isArchived ? "darkgreen" : "gray", // Dark green on hover if archived
                  },
                },
              }}
            />
            <SpeedDialAction
              icon={isDeleting ? <CircularProgress size={24} color="inherit" /> : <DeleteIcon fontSize="small" />}
              tooltipTitle="Delete Conversation"
              onClick={handleConversationDelete}
            />
          </SpeedDial>
        </Stack>

        {/* Chat messages */}
        <Box ref={messagesContainerRef} onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto", mb: 2, p: 1, overflowX: "hidden" }}>
          {isLoadingConversation ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Lottie animationData={chatPrimaryAnimation} style={{ height: "60%", width: "60%" }} />
              <Typography variant="caption">getting messages</Typography>
            </Box>
          ) : Object.keys(groupedMessagesByDate(messages) || {}).length === 0 ? (
            <Stack alignItems="center" justifyContent="center" height="100%" spacing={2} sx={{ textAlign: "center" }}>
              <Stack sx={{ width: { md: "15rem", xs: "10rem" }, height: { md: "15rem", xs: "10rem" } }}>
                <Lottie animationData={chatSecondaryAnimation} style={{ height: "100%", width: "100%" }} />
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { md: ".9rem", xs: ".8rem" }, transform: "translateY(-2rem)" }}>
                No conversation yet
              </Typography>
              <Button
                variant="contained"
                onClick={handleInputFocus}
                sx={{
                  fontSize: { transform: "translateY(-2rem)", fontWeight: "bold" },
                }}
                size={"small"}
              >
                Start Messaging
              </Button>
            </Stack>
          ) : (
            <>
              {isFetchingNextPage && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    my: 2,
                  }}
                >
                  <Typography variant="caption">getting messages</Typography>
                </Box>
              )}
              {Object.entries(groupedMessagesByDate(messages) || {}).map(([dateKey, messagesForDate]) => (
                <React.Fragment key={dateKey}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textAlign: "center",
                      my: 2,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      py: 1,
                    }}
                  >
                    {dateKey}
                  </Typography>
                  <AnimatePresence>
                    {messagesForDate.map((message, index) => (
                      <Message key={message._id + index} message={message} chatId={chatId} userProfile={userProfile} recipient={recipient} onView={handleMessageViewed} />
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Message input area using the new MessageInput component */}
        <MessageInput onSend={handleSendMessage} inputRef={inputRef} />
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
