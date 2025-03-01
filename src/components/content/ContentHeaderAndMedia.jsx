/* eslint-disable react/prop-types */
import React from "react";
import { Avatar, Box, IconButton, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { AnimatePresence, motion } from "motion/react";

const ContentHeaderAndMedia = ({ children, content, onClose, mode }) => {
  const { user: contentOwner = {}, mediaUrl, mediaType, caption, type } = content || {};
  const isBelow600 = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  return (
    <>
      {/* Header: Avatar and Name */}
      <Stack direction="row" alignItems="center">
        <AnimatePresence>
          {isBelow600 && mode === "comment" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Tooltip title="Close">
                <IconButton onClick={onClose}>
                  <ArrowCircleLeftIcon sx={{ height: "2.2rem", width: "2.2rem" }} />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
        <Tooltip title="Visit Profile">
          <IconButton onClick={() => navigate(`/user-profile/${contentOwner._id}`)}>
            <Avatar
              src={contentOwner?.profileImage || ""}
              sx={{
                height: { sm: "2.8rem", xs: "2.6rem" },
                width: { sm: "2.8rem", xs: "2.6rem" },
                cursor: "pointer",
                boxShadow: 3,
              }}
            />
          </IconButton>
        </Tooltip>
        <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: { sm: "1rem", xs: ".9rem" } }}>
          {contentOwner?.firstName} {contentOwner?.lastName}
        </Typography>
      </Stack>

      {/* Layout differs based on content type */}
      {type === "tweet" ? (
        // For Tweets: media (attachment) is rendered first then caption.
        <>
          {mediaUrl.length > 0 && (
            <Stack
              direction="row"
              gap={2}
              sx={{
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                width: "95%",
                mt: 1,
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
                />
              ))}
            </Stack>
          )}
          {caption && (
            <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all" }}>
              {caption}
            </Typography>
          )}
        </>
      ) : (
        // For Posts: caption appears first then media is rendered in a grid-like layout.
        <>
          {caption && (
            <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all", overflowWrap: "break-word", whiteSpace: "nowrap" }}>
              {caption}
            </Typography>
          )}
          {mediaUrl.length > 0 && (
            <Stack
              sx={{
                height: { md: "26rem", sm: "18rem", xs: "14rem" }, // Use maxHeight so the container remains fixed.
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
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {children}
    </>
  );
};

export default ContentHeaderAndMedia;
