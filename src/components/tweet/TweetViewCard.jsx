// /* eslint-disable react/prop-types */
// import React, { useState } from "react";
// import { Avatar, AvatarGroup, Box, Chip, List, ListItemIcon, ListItemText, SpeedDial, SpeedDialAction, Stack, Typography, CircularProgress, Tooltip, IconButton } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DownloadIcon from "@mui/icons-material/Download";
// import SaveIcon from "@mui/icons-material/Save";
// import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
// import { Delete } from "@mui/icons-material";
// import FileSaver from "file-saver";

// import { formatDate } from "../../utilsFunction/dateFn";
// import ReactionSkeleton from "../skeletons/ReactionSkeleton";
// import ReactionChip from "../reaction/ReactionChip";
// import getReactedByText from "../../utilsFunction/getReactedByText";
// import ReactionViewModal from "../reaction/ReactionViewModal";
// import CommentViewModal from "../comment/CommentsViewModal";

// // Updated hook imports to match the ones used in PostViewCard
// import { useDeleteContent } from "../../hooks/content/content";
// import { useToggleSaveContent } from "../../hooks/content/contentSave";
// import { useDispatch } from "react-redux";
// import { showDownloading } from "../../reduxSlices/downloadingSlice";
// import { useGetReactionsByContentId } from "../../hooks/content/contentReaction";

// const TweetViewCard = ({ content, userProfile }) => {
//   const dispatch = useDispatch();

//   // Destructure content; note that we “rename” _id to contentId for consistency
//   const { mediaUrl = [], caption = "", user: contentOwner = {}, createdAt = "", _id: contentId, mediaType = "image", type = "tweet" } = content || {};

//   const { profileImage, firstName = "", lastName = "" } = contentOwner || {};

//   // Fetch reactions with a length of 3 (as in PostViewCard)
//   const {
//     data: reactionsData,
//     isLoading: isFetchingReactions,
//     isError: isErrorGettingReaction,
//   } = useGetReactionsByContentId({
//     contentId,
//     length: 3,
//   });
//   console.log(reactionsData);

//   // Use the delete hook (and note the rename of isPending to isDeletingContent)
//   const { isPending: isDeletingContent, mutate: deleteContent } = useDeleteContent({ type });
//   const isSelf = userProfile?._id === contentOwner?._id;
//   const userReacted = reactionsData?.reactions?.find((reaction) => reaction?.user?._id === userProfile?._id);

//   // Saved–content hooks now follow the same pattern as in PostViewCard
//   const { mutate: toggleSaveContent, isLoading: isTogglingSave } = useToggleSaveContent({ type });

//   const handleSaveOrUnsave = () => {
//     toggleSaveContent(contentId);
//   };

//   // Local state for download tooltip and modals
//   const [downloadTooltip, setDownloadTooltip] = useState("Download");
//   const [openReactionViewModal, setOpenReactionViewModal] = useState(false);
//   const [openCommentViewModal, setOpenCommentViewModal] = useState(false);

//   const isContentSaved = true;

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

//   const handleDeleteClick = () => {
//     deleteContent({ contentId });
//   };

//   return (
//     <Stack
//       sx={{
//         minHeight: "10rem",
//         width: "100%",
//         borderRadius: ".8rem",
//         boxShadow: 3,
//         bgcolor: "#fff",
//       }}
//     >
//       {/* Header Section */}
//       <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pr={0} py={".4rem"} pl={".8rem"}>
//         <List>
//           <ListItemIcon sx={{ display: "flex", alignItems: "center" }}>
//             <Avatar sx={{ height: "3.2rem", width: "3.2rem", boxShadow: 3 }} src={profileImage || ""} />
//             <ListItemText
//               primary={`${firstName} ${lastName}`}
//               secondary={`Tweeted ${formatDate(createdAt)}`}
//               sx={{ marginLeft: "1rem" }}
//               slotProps={{
//                 primary: {
//                   sx: { fontWeight: "bold", color: "#0000008d" },
//                 },
//               }}
//             />
//           </ListItemIcon>
//         </List>
//         <SpeedDial
//           ariaLabel="SpeedDial"
//           direction="left"
//           sx={{
//             "& .MuiSpeedDial-fab": {
//               boxShadow: "none",
//               backgroundColor: "transparent",
//               "&:hover": {
//                 backgroundColor: "transparent",
//               },
//             },
//           }}
//           icon={<MoreVertIcon sx={{ color: "#0000007f" }} />}
//         >
//           {isSelf && <SpeedDialAction icon={isDeletingContent ? <CircularProgress size={24} /> : <Delete />} tooltipTitle={isDeletingContent ? "Deleting..." : "Delete"} onClick={handleDeleteClick} />}
//           {mediaUrl.length > 0 && <SpeedDialAction icon={<DownloadIcon />} tooltipTitle={downloadTooltip} onClick={handleDownload} />}
//           <SpeedDialAction icon={isTogglingSave ? <CircularProgress size={24} /> : <SaveIcon sx={{ color: isContentSaved ? "#ffffff" : "#000000" }} />} tooltipTitle={isContentSaved ? "Unsave" : "Save"} sx={{ bgcolor: isContentSaved ? "#006400" : "transparent" }} onClick={handleSaveOrUnsave} />
//         </SpeedDial>
//       </Stack>

//       {/* Media Section */}
//       <Stack
//         sx={{
//           width: "100%",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <Stack
//           flexDirection="row"
//           gap={2}
//           sx={{
//             overflowX: "auto",
//             "&::-webkit-scrollbar": { display: "none" },
//             msOverflowStyle: "none",
//             width: "95%",
//           }}
//         >
//           {mediaUrl.length > 0 &&
//             mediaUrl.map((url, index) => (
//               <Box
//                 key={index}
//                 component={mediaType === "image" ? "img" : "video"}
//                 src={url}
//                 sx={{
//                   height: "8rem",
//                   width: "8rem",
//                   cursor: "pointer",
//                   objectFit: "contain",
//                   bgcolor: "#000",
//                   borderRadius: ".4rem",
//                 }}
//                 controls={mediaType === "video"}
//               />
//             ))}
//         </Stack>
//       </Stack>

//       {/* Caption Section */}
//       {caption && (
//         <Stack sx={{ px: "1rem", my: "1rem" }}>
//           <Typography variant="body2" sx={{ color: "#000000" }}>
//             {caption || "No caption provided"}
//           </Typography>
//         </Stack>
//       )}

//       {/* Reaction and Action Buttons */}
//       <Stack p={".8rem"}>
//         {isFetchingReactions || isErrorGettingReaction ? (
//           <ReactionSkeleton />
//         ) : (
//           reactionsData?.reactions?.length > 0 && (
//             <Stack px={".8rem"} sx={{ mb: ".4rem" }} flexDirection="row" alignItems="center" gap={".2rem"} component="div">
//               <AvatarGroup max={3} onClick={() => setOpenReactionViewModal(true)} sx={{ cursor: "pointer" }}>
//                 {reactionsData.reactions.map((reaction, index) => (
//                   <Avatar key={index} sx={{ width: "1.6rem", height: "1.6rem", boxShadow: 3 }} src={reaction.user.profileImage || ""} />
//                 ))}
//               </AvatarGroup>
//               <Typography variant="body2" sx={{ ml: ".4rem", fontFamily: "poppins", fontSize: ".7rem", cursor: "pointer" }} onClick={() => setOpenReactionViewModal(true)}>
//                 {getReactedByText({ reactionsData, userReacted, userProfile })}
//               </Typography>
//             </Stack>
//           )
//         )}

//         <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
//           <ReactionChip content={content} userProfile={userProfile} />
//           <Chip icon={<CommentRoundedIcon />} label="Retweet" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
//         </Stack>
//       </Stack>

//       {openReactionViewModal && <ReactionViewModal contentOwner={contentOwner} open={openReactionViewModal} onClose={() => setOpenReactionViewModal(false)} content={content} userReacted={userReacted} />}
//       {openCommentViewModal && <CommentViewModal open={openCommentViewModal} onClose={() => setOpenCommentViewModal(false)} contentOwner={contentOwner} type="post" content={content} />}
//     </Stack>
//   );
// };

// export default TweetViewCard;
import React from "react";

const TweetViewCard = () => {
  return <div>TweetViewCard</div>;
};

export default TweetViewCard;
