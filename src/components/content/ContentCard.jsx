/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Avatar, AvatarGroup, Box, Chip, CircularProgress, IconButton, List, ListItemIcon, ListItemText, SpeedDial, SpeedDialAction, Stack, Tooltip, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { Delete } from "@mui/icons-material";
import FileSaver from "file-saver";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Helpers & Utils
import { formatDate } from "../../utilsFunction/dateFn.js";
import getReactedByText from "../../utilsFunction/getReactedByText";

// Redux slices and dialogs
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { showDownloading } from "../../reduxSlices/downloadingSlice";

// Custom hooks for content actions
import { useToggleSaveContent } from "../../hooks/content/contentSave";
import { useDeleteContent } from "../../hooks/content/content";
// Removed: import { useGetReactionsByContentId } from "../../../hooks/content/contentReaction";

// Components (Reaction, Comment, Share)
import ReactionChip from "../reaction/ReactionChip";
import ReactionViewModal from "../reaction/ReactionViewModal";
import CommentsViewModal from "../comment/CommentsViewModal";
import ContentShareCardModal from "./ContentShareCardModal.jsx";

const ContentCard = ({ content, userProfile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Destructure common properties from content object.
  // Note: reactionDetails is now attached directly to the content.
  const {
    mediaUrl = [],
    caption = "",
    user: contentOwner = {},
    createdAt = "",
    _id: contentId,
    mediaType = "image",
    type = "post", // defaults to "post" if not provided
    isSavedByUser,
    reactionDetails,
  } = content || {};

  // Destructure reaction details.
  const { totalReactions, reactions } = reactionDetails || { totalReactions: 0, reactions: [] };

  const { profileImage, firstName = "", lastName = "" } = contentOwner || {};

  // Determine header label based on content type.
  const actionLabel = type === "tweet" ? "Tweeted" : "Posted";
  // console.log(reactionDetails?.reactions[0]?.user?._id === userProfile._id);

  // Determine if the current user has reacted (for text details).
  const userReaction = reactionDetails?.reactions?.find((reaction) => reaction?.user?._id === userProfile?._id) || null;

  // Delete content hook – available only if the logged-in user is the owner.
  const { isPending: isDeletingContent, mutate: deleteContent } = useDeleteContent({ type });
  const isSelf = userProfile?._id === contentOwner?._id;

  // Saved content hooks (check status and toggle).
  const { mutate: toggleSaveContent, isPending: isTogglingSave } = useToggleSaveContent({ type });

  // Local state for tooltips and modal controls.
  const [downloadTooltip, setDownloadTooltip] = useState("Download");
  const [openReactionViewModal, setOpenReactionViewModal] = useState(false);
  const [openCommentViewModal, setOpenCommentViewModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  // Preview media (open media dialog).
  const previewMedia = () => {
    dispatch(openMediaDialog({ mediaSources: mediaUrl, mediaType, showDownload: true }));
  };

  // Navigate to the content owner's profile.
  const navigateToProfile = () => {
    if (userProfile._id === contentOwner._id) {
      navigate("/profile");
    } else {
      navigate(`/user-profile/${contentOwner?._id}`);
    }
  };

  // Handler for downloading media files.
  const handleDownload = async () => {
    setDownloadTooltip("Downloading...");
    dispatch(showDownloading({ message: "Downloading in progress...", type: "downloading" }));
    try {
      await Promise.all(
        mediaUrl.map(async (url) => {
          const filename = url.split("/").pop();
          FileSaver.saveAs(url, filename);
        })
      );
      setDownloadTooltip("Downloaded");
      dispatch(showDownloading({ message: "Download successful!", type: "success" }));
    } catch (error) {
      dispatch(showDownloading({ message: "Download failed. Please try again.", type: "error" }));
      setDownloadTooltip("Failed");
    } finally {
      setTimeout(() => setDownloadTooltip("Download"), 2000);
    }
  };

  // Handler for deleting content.
  const handleDeleteClick = () => {
    deleteContent({ contentId });
  };

  // Handler for toggling save/unsave status.
  const handleSaveOrUnsave = () => {
    toggleSaveContent(contentId);
  };
  const handleOpenReactionViewModal = async () => {
    setOpenReactionViewModal(true);
  };

  // Render the media section based on content type.
  const renderMediaSection = () => {
    if (mediaUrl.length === 0) {
      return <Stack sx={{ height: "100%", width: "100%", bgcolor: "#000" }} />;
    }

    if (type === "post") {
      // Post media: grid-like layout with larger container.
      return (
        <Stack
          sx={{
            height: "26rem",
            width: "100%",
            overflow: "hidden",
            mt: "1rem",
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
          }}
        >
          {mediaUrl.map((url, index) => (
            <Box
              key={index}
              component={mediaType === "video" ? "video" : "img"}
              src={url}
              height="100%"
              width={mediaUrl.length > 1 ? "calc(100% / 2)" : "100%"}
              sx={{ objectFit: "contain", bgcolor: "#000" }}
              controls={mediaType === "video"}
              onClick={(event) => {
                if (mediaType === "video") {
                  event.preventDefault();
                  event.stopPropagation();
                }
                previewMedia();
              }}
            />
          ))}
        </Stack>
      );
    } else if (type === "tweet") {
      // Tweet media: horizontally scrollable row.
      return (
        <Stack
          sx={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            flexDirection="row"
            gap={2}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              width: "95%",
            }}
          >
            {mediaUrl.map((url, index) => (
              <Box
                key={index}
                component={mediaType === "image" ? "img" : "video"}
                src={url}
                sx={{
                  height: "8rem",
                  width: "8rem",
                  cursor: "pointer",
                  objectFit: "contain",
                  bgcolor: "#000",
                  borderRadius: ".4rem",
                }}
                controls={mediaType === "video"}
                onClick={previewMedia}
              />
            ))}
          </Stack>
        </Stack>
      );
    }
  };

  // Render action buttons based on content type.
  const renderActionButtons = () => {
    if (type === "post") {
      return (
        <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
          <ReactionChip content={content} userProfile={userProfile} userReaction={userReaction} />
          <Chip icon={<CommentRoundedIcon />} label="Comment" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
          <Chip icon={<ShareRoundedIcon />} label="Share" onClick={() => setOpenShareModal(true)} variant="outlined" sx={{ width: "100%" }} />
        </Stack>
      );
    } else if (type === "tweet") {
      return (
        <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
          <ReactionChip content={content} userProfile={userProfile} userReaction={userReaction} />
          <Chip icon={<CommentRoundedIcon />} label="Retweet" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
        </Stack>
      );
    }
  };

  return (
    <Stack
      sx={{
        minHeight: type === "post" ? "20rem" : "10rem",
        width: "100%",
        borderRadius: ".8rem",
        boxShadow: 3,
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {/* Header Section */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pr={0} py={".4rem"} pl={".8rem"}>
        <List>
          <ListItemIcon sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="View Profile">
              <IconButton onClick={navigateToProfile}>
                <Avatar sx={{ height: "3.2rem", width: "3.2rem", boxShadow: 3 }} src={profileImage || ""} />
              </IconButton>
            </Tooltip>
            <ListItemText
              primary={`${firstName} ${lastName}`}
              secondary={`${actionLabel} ${formatDate(createdAt)}`}
              sx={{ marginLeft: "1rem" }}
              slotProps={{
                primary: { sx: { fontWeight: "bold", color: "#0000008d" } },
              }}
            />
          </ListItemIcon>
        </List>
        <SpeedDial
          ariaLabel="SpeedDial"
          direction="left"
          sx={{
            zIndex: 1,
            position: "relative",
            "& .MuiSpeedDial-fab": {
              boxShadow: "none",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent" },
            },
          }}
          icon={<MoreVertIcon sx={{ color: "#0000007f" }} />}
        >
          {isSelf && <SpeedDialAction icon={isDeletingContent ? <CircularProgress size={24} /> : <Delete />} tooltipTitle={isDeletingContent ? "Deleting..." : "Delete"} onClick={handleDeleteClick} />}
          {mediaUrl.length > 0 && <SpeedDialAction icon={<DownloadIcon />} tooltipTitle={downloadTooltip} onClick={handleDownload} />}
          <SpeedDialAction icon={isTogglingSave ? <CircularProgress size={24} /> : <SaveIcon sx={{ color: isSavedByUser ? "#ffffff" : "#000000" }} />} tooltipTitle={isSavedByUser ? "Unsave" : "Save"} sx={{ bgcolor: isSavedByUser ? "#006400" : "transparent" }} onClick={handleSaveOrUnsave} />
          {type === "tweet" && <SpeedDialAction icon={<ShareRoundedIcon />} tooltipTitle="Share" onClick={() => setOpenShareModal(true)} />}
        </SpeedDial>
      </Stack>

      {/* Caption Section (if any) */}
      {caption.trim().length > 0 && (
        <Stack sx={{ px: "1rem" }}>
          <Typography variant="body2" sx={{ color: "#000000" }}>
            {caption}
          </Typography>
        </Stack>
      )}

      {/* Media Section */}
      {renderMediaSection()}

      {/* Reaction and Action Buttons */}
      <Stack p={".8rem"}>
        {totalReactions > 0 && (
          <Stack px={".8rem"} sx={{ mb: ".4rem" }} flexDirection="row" alignItems="center" gap={".2rem"}>
            <AvatarGroup max={3} onClick={() => setOpenReactionViewModal(true)} sx={{ cursor: "pointer" }}>
              {reactions.map((reaction, index) => (
                <Avatar key={index} sx={{ width: "1.6rem", height: "1.6rem", boxShadow: 3 }} src={reaction.user.profileImage || ""} />
              ))}
            </AvatarGroup>
            <Typography
              variant="body2"
              sx={{
                ml: ".4rem",
                fontFamily: "poppins",
                fontSize: ".7rem",
                cursor: "pointer",
              }}
              onClick={handleOpenReactionViewModal}
            >
              {getReactedByText({
                reactionDetails, // Pass the attached reactionDetails
                userProfile,
              })}
            </Typography>
          </Stack>
        )}

        {renderActionButtons()}
      </Stack>

      {/* Modals */}
      {openReactionViewModal && <ReactionViewModal contentOwner={contentOwner} open={openReactionViewModal} onClose={() => setOpenReactionViewModal(false)} content={content} />}
      {openCommentViewModal && <CommentsViewModal open={openCommentViewModal} onClose={() => setOpenCommentViewModal(false)} contentOwner={contentOwner} type={type === "post" ? "post" : "tweet"} content={content} />}
      {openShareModal && <ContentShareCardModal open={openShareModal} onClose={() => setOpenShareModal(false)} content={content} contentOwner={contentOwner} />}
    </Stack>
  );
};

export default React.memo(ContentCard);
