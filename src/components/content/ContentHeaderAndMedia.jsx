/* eslint-disable react/prop-types */
import React from "react";
import { Avatar, Box, Stack, Tooltip, Typography } from "@mui/material";

const ContentHeaderAndMedia = ({ children, content }) => {
  const { user: contentOwner = {}, mediaUrl, mediaType, caption, type } = content || {};
  return (
    <>
      {/* Header: Avatar and Name */}
      <Stack direction="row" alignItems="center" gap={1}>
        <Tooltip title="Visit Profile">
          <Avatar
            src={contentOwner?.profileImage || ""}
            sx={{
              height: "2.6rem",
              width: "2.6rem",
              cursor: "pointer",
              boxShadow: 3,
            }}
          />
        </Tooltip>
        <Typography variant="body1" fontWeight="bold" color="#000000d1">
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
            <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all" }}>
              {caption}
            </Typography>
          )}
          {mediaUrl.length > 0 && (
            <Stack
              sx={{
                height: "26rem", // Use maxHeight so the container remains fixed.
                width: "100%",
                overflow: "hidden",
                mt: "1rem",
                display: "flex",
                flexDirection: "row",
                gap: "0.5rem",
              }}
            >
              {mediaUrl.map((url, index) => (
                <Box key={index} component={mediaType === "video" ? "video" : "img"} src={url} height="100%" width={mediaUrl.length > 1 ? "calc(100% / 2)" : "100%"} sx={{ objectFit: "contain", bgcolor: "#000" }} controls={mediaType === "video"} />
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
