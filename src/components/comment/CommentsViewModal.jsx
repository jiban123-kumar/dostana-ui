/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { Box, Dialog, DialogContent, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography, List, ListItem, CircularProgress, Button } from "@mui/material";
import Lottie from "lottie-react";
import { chatSecondaryAnimation } from "../../animation";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import EmojiPickerComponent from "../common/EmojiPickerComponent";
import CommentViewModalSkeleton from "../skeletons/CommentViewModalSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import ContentHeaderAndMedia from "../content/ContentHeaderAndMedia";
import CommentItem from "./CommentItem";
import { useCreateNotification } from "../../hooks/notification/notification";
import { useCreateComment, useGetCommentsForContent } from "../../hooks/comment/comment";
import { Refresh as RefreshIcon, Check, ErrorOutline, Close as CloseIcon } from "@mui/icons-material";

// Pending (sending) comment component with constrained width and motion animation
const SendingComment = ({ comment, onRetry, onRemove }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
    <Box
      sx={{
        minWidth: "5rem",
        maxWidth: "40%",
        alignSelf: "flex-start",
        bgcolor: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 1,
        wordBreak: "break-word",
      }}
    >
      <Typography variant="body2" sx={{ flex: 1 }}>
        {comment.text}
      </Typography>
      {comment.status === "sending" && <CircularProgress size={20} />}
      {comment.status === "sent" && <Check fontSize="small" color="success" />}
      {comment.status === "failed" && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <ErrorOutline fontSize="small" color="error" />
          <Tooltip title="Retry">
            <IconButton onClick={() => onRetry(comment)} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton onClick={() => onRemove(comment)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  </motion.div>
);

const CommentsViewModal = ({ onClose, content }) => {
  const { _id: contentId, user: contentOwner, mediaUrl = [] } = content || {};

  // State for emoji picker, input text, and pending (sending) comments
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comment, setComment] = useState("");
  const [pendingComments, setPendingComments] = useState([]);

  const { mutate: createComment, isLoading: isCreatingComment } = useCreateComment();
  const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCommentsForContent({ contentId, limit: 10 });
  const { mutate: createNotification } = useCreateNotification();

  // Ref for the scrollable container wrapping content card and comments list
  const scrollContainerRef = useRef(null);

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + emojiObject.emoji);
  };

  // When a new pending comment is added, scroll the container to the top
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pendingComments]);

  // When sending a comment, add it as a pending comment and then call the API
  const handleAddComment = () => {
    if (comment.trim()) {
      const clientId = Date.now().toString();
      const newPendingComment = {
        clientId,
        text: comment,
        status: "sending",
        createdAt: new Date(),
      };
      setPendingComments((prev) => [...prev, newPendingComment]);

      createComment(
        { comment, contentId, targetUserId: contentOwner._id },
        {
          onSuccess: () => {
            // Mark the pending comment as sent
            setPendingComments((prev) => prev.map((pc) => (pc.clientId === clientId ? { ...pc, status: "sent" } : pc)));
            // Remove the pending comment after a short delay
            setTimeout(() => {
              setPendingComments((prev) => prev.filter((pc) => pc.clientId !== clientId));
            }, 2000);
          },
          onError: () => {
            // Mark the pending comment as failed
            setPendingComments((prev) => prev.map((pc) => (pc.clientId === clientId ? { ...pc, status: "failed" } : pc)));
          },
        }
      );
      setComment("");
    }
  };

  // Allow retrying a failed comment
  const handleRetryComment = (pendingComment) => {
    const newClientId = Date.now().toString();
    setPendingComments((prev) => prev.filter((pc) => pc.clientId !== pendingComment.clientId).concat({ ...pendingComment, clientId: newClientId, status: "sending" }));
    createComment(
      { comment: pendingComment.text, contentId },
      {
        onSuccess: () => {
          setPendingComments((prev) => prev.map((pc) => (pc.clientId === newClientId ? { ...pc, status: "sent" } : pc)));
          setTimeout(() => {
            setPendingComments((prev) => prev.filter((pc) => pc.clientId !== newClientId));
          }, 2000);
          createNotification({
            type: "content-comment",
            referenceId: contentId,
            action: "Commented on your post!",
            user: contentOwner._id,
          });
        },
        onError: () => {
          setPendingComments((prev) => prev.map((pc) => (pc.clientId === newClientId ? { ...pc, status: "failed" } : pc)));
        },
      }
    );
  };

  // Allow removal of a pending comment if desired
  const handleRemovePendingComment = (pendingComment) => {
    setPendingComments((prev) => prev.filter((pc) => pc.clientId !== pendingComment.clientId));
  };

  // Flatten pages from the infinite query into a single array of loaded comments
  const loadedComments = data ? data.pages.flatMap((page) => page.comments) : [];

  return (
    <Dialog open={true} maxWidth="md" fullWidth onClose={onClose}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          p: 2,
        }}
      >
        {/* Scrollable container for content card and comments */}
        <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
          {/* Content card - maintains its full (provided) size */}
          <Box sx={{ mb: 2 }}>
            <ContentHeaderAndMedia content={content} />
          </Box>
          <Typography
            variant="body1"
            fontWeight="bold"
            color="#000000d1"
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "inherit", // Ensures it doesn't look transparent when overlaying
              zIndex: 2,
              mb: ".4rem",
              pt: 1,
              pl: 1,
            }}
          >
            Comments
          </Typography>
          {/* This Box is referenced to scroll to the top when a new comment is added */}
          <Box ref={scrollContainerRef}>
            {/* Pending comments as a sticky header inside the scrollable area */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: "inherit",
                pt: 1,
                pl: 1,
              }}
            >
              <AnimatePresence>
                {pendingComments.map((pendingComment) => (
                  <SendingComment key={pendingComment.clientId} comment={pendingComment} onRetry={handleRetryComment} onRemove={handleRemovePendingComment} />
                ))}
              </AnimatePresence>
            </Box>
            {/* Loaded comments */}
            {isLoading ? (
              <CommentViewModalSkeleton />
            ) : isError ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <Lottie animationData={chatSecondaryAnimation} loop={false} style={{ height: "8rem", width: "8rem" }} />
                <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: ".8rem" }}>
                  Failed to load comments.
                </Typography>
              </Stack>
            ) : (
              <>
                {loadedComments.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <Lottie animationData={chatSecondaryAnimation} loop={true} style={{ height: "8rem", width: "8rem" }} />
                    <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: ".8rem" }}>
                      No comments yet
                    </Typography>
                  </Stack>
                ) : (
                  <List sx={{ p: 0 }}>
                    <AnimatePresence>
                      {loadedComments.map((commentItem) => (
                        <ListItem key={commentItem._id} sx={{ p: 0 }}>
                          <CommentItem comment={commentItem} contentOwner={contentOwner} />
                        </ListItem>
                      ))}
                    </AnimatePresence>
                  </List>
                )}
                {hasNextPage && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? <CircularProgress size={20} /> : "Load More"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
        {/* Fixed input area */}
        <Box>
          <Box
            sx={{
              width: "100%",
              py: ".6rem",
              px: "1rem",
              border: "1px solid #ccc",
              borderRadius: "1.5rem",
              bgcolor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              mb: 1,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Add a comment"
              color="secondary"
              multiline
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end" sx={{ display: "flex", alignSelf: "flex-end" }}>
                    <Tooltip title="Emoji">
                      <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                        <AddReactionIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send">
                      <IconButton onClick={handleAddComment} disabled={isCreatingComment}>
                        {isCreatingComment ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : <Box component="img" src="/send.png" sx={{ height: "2rem", width: "2rem" }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: "1.5rem",
                px: "1rem",
                py: "0.5rem",
                bgcolor: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                maxHeight: "10rem",
                overflow: "auto",
              }}
            />
          </Box>
          {showEmojiPicker && <EmojiPickerComponent show={showEmojiPicker} onClose={handleCloseEmojiPicker} onEmojiClick={handleEmojiClick} />}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsViewModal;
