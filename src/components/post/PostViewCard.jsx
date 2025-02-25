// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { Avatar, AvatarGroup, Box, Chip, List, ListItemIcon, ListItemText, SpeedDial, SpeedDialAction, Stack, Typography, CircularProgress, Tooltip, IconButton } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DownloadIcon from "@mui/icons-material/Download";
// import SaveIcon from "@mui/icons-material/Save";
// import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
// import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
// import { Delete } from "@mui/icons-material";
// import { formatDate } from "../../utilsFunction/dateFn";
// import ReactionSkeleton from "../skeletons/ReactionSkeleton";
// import { useDispatch } from "react-redux";
// import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
// import FileSaver from "file-saver";
// import { showDownloading } from "../../reduxSlices/downloadingSlice";
// import ReactionChip from "../reaction/ReactionChip";
// import ReactionViewModal from "../reaction/ReactionViewModal";
// import getReactedByText from "../../utilsFunction/getReactedByText";
// import CommentViewModal from "../comment/CommentsViewModal";
// import ShareCardModal from "../shareFeed/ShareCardModal";
// import { useNavigate } from "react-router-dom";

// // Custom hooks
// import { useIsContentSaved, useToggleSaveContent } from "../../hooks/content/contentSave";
// import { useDeleteContent } from "../../hooks/content/content";
// import { useGetIsUserReactedToContent, useGetReactionsByContentId } from "../../hooks/content/contentReaction";

// const PostViewCard = ({ content, userProfile }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Destructure content properties
//   const { mediaUrl = [], caption = "", user: contentOwner = {}, createdAt = "", _id: contentId, mediaType = "image", type } = content || {};

//   // Destructure content owner details
//   const { profileImage, firstName = "", lastName = "" } = contentOwner || {};

//   // Get reactions data (limit to 3)
//   const {
//     data: reactionsData,
//     isLoading: isFetchingReactions,
//     isError: isErrorGettingReaction,
//   } = useGetReactionsByContentId({
//     contentId,
//     length: 3,
//   });

//   // Hook for deletion
//   const { isPending: isDeletingContent, mutate: deleteContent } = useDeleteContent({ type });

//   // Get current user profile
//   const isSelf = userProfile?._id === contentOwner?._id;

//   // Check if the current user has already reacted
//   const { data: isUserReactedToContent } = useGetIsUserReactedToContent({ contentId });

//   // Saved content hooks
//   const { data: isContentSaved } = useIsContentSaved({ contentId });
//   const { mutate: toggleSaveContent, isLoading: isTogglingSave } = useToggleSaveContent({ type });

//   // Local state for tooltips and modal control
//   const [downloadTooltip, setDownloadTooltip] = useState("Download");
//   const [openReactionViewModal, setOpenReactionViewModal] = useState(false);
//   const [openCommentViewModal, setOpenCommentViewModal] = useState(false);
//   const [openShareModal, setOpenShareModal] = useState(false);

//   // Function to preview media in a dialog
//   const previewMedia = () => {
//     dispatch(openMediaDialog({ mediaSources: mediaUrl, mediaType, showDownload: true }));
//   };

//   // Navigation to the content owner's profile
//   const navigateToProfile = () => {
//     if (userProfile._id === contentOwner._id) {
//       navigate("/profile");
//     } else {
//       navigate(`/user-profile/${contentOwner?._id}`);
//     }
//   };

//   // Handler for downloading media
//   const handleDownload = async () => {
//     setDownloadTooltip("Downloading...");
//     dispatch(
//       showDownloading({
//         message: "Downloading in progress...",
//         type: "downloading",
//       })
//     );
//     try {
//       await Promise.all(
//         mediaUrl.map(async (url) => {
//           const filename = url.split("/").pop();
//           FileSaver.saveAs(url, filename);
//         })
//       );
//       setDownloadTooltip("Downloaded");
//       dispatch(
//         showDownloading({
//           message: "Download successful!",
//           type: "success",
//         })
//       );
//     } catch (error) {
//       dispatch(
//         showDownloading({
//           message: "Download failed. Please try again.",
//           type: "error",
//         })
//       );
//       setDownloadTooltip("Failed");
//     } finally {
//       setTimeout(() => setDownloadTooltip("Download"), 2000);
//     }
//   };

//   // Handler for deleting the content
//   const handleDeleteClick = () => {
//     deleteContent({ contentId });
//   };

//   // Handler for saving/unsaving the content
//   const handleSaveOrUnsave = () => {
//     toggleSaveContent(contentId);
//   };

//   return (
//     <Stack
//       sx={{
//         minHeight: "20rem",
//         width: "100%",
//         borderRadius: ".8rem",
//         boxShadow: 3,
//         bgcolor: "#fff",
//         position: "relative",
//       }}
//     >
//       {/* Header Section */}
//       <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pr={0} py={".4rem"} pl={".8rem"}>
//         <List>
//           <ListItemIcon sx={{ display: "flex", alignItems: "center" }}>
//             <Tooltip title="View Profile">
//               <IconButton onClick={navigateToProfile}>
//                 <Avatar sx={{ height: "3.2rem", width: "3.2rem", boxShadow: 3 }} src={profileImage || ""} />
//               </IconButton>
//             </Tooltip>
//             <ListItemText
//               primary={`${firstName} ${lastName}`}
//               secondary={`Posted ${formatDate(createdAt)}`}
//               sx={{ marginLeft: "1rem" }}
//               slotProps={{
//                 primary: { sx: { fontWeight: "bold", color: "#0000008d" } },
//               }}
//             />
//           </ListItemIcon>
//         </List>
//         <SpeedDial
//           ariaLabel="SpeedDial"
//           direction="left"
//           sx={{
//             zIndex: 1,
//             position: "relative",
//             "& .MuiSpeedDial-fab": {
//               boxShadow: "none",
//               backgroundColor: "transparent",
//               "&:hover": { backgroundColor: "transparent" },
//             },
//           }}
//           icon={<MoreVertIcon sx={{ color: "#0000007f" }} />}
//         >
//           {isSelf && <SpeedDialAction icon={isDeletingContent ? <CircularProgress size={24} /> : <Delete />} tooltipTitle={isDeletingContent ? "Deleting..." : "Delete"} onClick={handleDeleteClick} />}
//           <SpeedDialAction icon={<DownloadIcon />} tooltipTitle={downloadTooltip} onClick={handleDownload} />
//           <SpeedDialAction icon={isTogglingSave ? <CircularProgress size={24} /> : <SaveIcon sx={{ color: isContentSaved ? "#ffffff" : "#000000" }} />} tooltipTitle={isContentSaved ? "Unsave" : "Save"} sx={{ bgcolor: isContentSaved ? "#006400" : "transparent" }} onClick={handleSaveOrUnsave} />
//         </SpeedDial>
//       </Stack>

//       {/* Post Content */}
//       {caption.trim().length > 0 && (
//         <Stack sx={{ px: "1rem" }}>
//           <Typography variant="body2" sx={{ color: "#000000" }}>
//             {caption}
//           </Typography>
//         </Stack>
//       )}

//       {/* Media Section */}
//       <Stack
//         sx={{
//           height: "26rem",
//           width: "100%",
//           overflow: "hidden",
//           mt: "1rem",
//           display: "flex",
//           flexDirection: "row",
//           gap: "0.5rem",
//         }}
//       >
//         {mediaUrl.length > 0 ? (
//           mediaUrl.map((url, index) => (
//             <Box
//               key={index}
//               component={mediaType === "video" ? "video" : "img"}
//               src={url}
//               height="100%"
//               width={mediaUrl.length > 1 ? "calc(100% / 2)" : "100%"}
//               sx={{ objectFit: "contain", bgcolor: "#000" }}
//               controls={mediaType === "video"}
//               onClick={(event) => {
//                 if (mediaType === "video") {
//                   event.preventDefault();
//                   event.stopPropagation();
//                 }
//                 previewMedia();
//               }}
//             />
//           ))
//         ) : (
//           <Stack sx={{ height: "100%", width: "100%", bgcolor: "#000" }} />
//         )}
//       </Stack>

//       {/* Action Buttons */}
//       <Stack p={".8rem"}>
//         {isFetchingReactions || isErrorGettingReaction ? (
//           <ReactionSkeleton />
//         ) : (
//           reactionsData?.reactions?.length > 0 && (
//             <Stack px={".8rem"} sx={{ mb: ".4rem" }} flexDirection="row" alignItems="center" gap={".2rem"}>
//               <AvatarGroup max={3} onClick={() => setOpenReactionViewModal(true)} sx={{ cursor: "pointer" }}>
//                 {reactionsData.reactions.map((reaction, index) => (
//                   <Avatar key={index} sx={{ width: "1.6rem", height: "1.6rem", boxShadow: 3 }} src={reaction.user.profileImage || ""} />
//                 ))}
//               </AvatarGroup>
//               <Typography
//                 variant="body2"
//                 sx={{
//                   ml: ".4rem",
//                   fontFamily: "poppins",
//                   fontSize: ".7rem",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => setOpenReactionViewModal(true)}
//               >
//                 {getReactedByText({ reactionsData, isUserReactedToContent, userProfile })}
//               </Typography>
//             </Stack>
//           )
//         )}

//         <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
//           <ReactionChip content={content} userProfile={userProfile} />
//           <Chip icon={<CommentRoundedIcon />} label="Comment" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
//           <Chip icon={<ShareRoundedIcon />} label="Share" onClick={() => setOpenShareModal(true)} variant="outlined" sx={{ width: "100%" }} />
//         </Stack>
//       </Stack>

//       {/* Modals */}
//       {openReactionViewModal && <ReactionViewModal contentOwner={contentOwner} open={openReactionViewModal} onClose={() => setOpenReactionViewModal(false)} content={content} userReacted={userReacted} />}
//       {openCommentViewModal && <CommentViewModal open={openCommentViewModal} onClose={() => setOpenCommentViewModal(false)} contentOwner={contentOwner} type="post" content={content} />}
//       {openShareModal && <ShareCardModal open={openShareModal} onClose={() => setOpenShareModal(false)} content={content} contentOwner={contentOwner} />}
//     </Stack>
//   );
// };

// export default PostViewCard;
import React from "react";

const PostViewCard = () => {
  return <div>PostViewCard</div>;
};

export default PostViewCard;
