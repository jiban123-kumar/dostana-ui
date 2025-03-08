/* eslint-disable react/prop-types */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";

const ContentHeaderAndMedia = ({ children, content }) => {
  const { media, caption, type } = content || {};

  return (
    <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}>
      {type === "thought" ? (
        // For Tweets: media (attachment) is rendered first then caption.
        <>
          {media.length > 0 && (
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
              {media.map(({ url, type: mediaType }, index) => (
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
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                wordBreak: "break-all",
                overflowWrap: "break-word",
                whiteSpace: "nowrap",
              }}
            >
              {caption}
            </Typography>
          )}
          {media.length > 0 && (
            <Stack
              sx={{
                height: { md: "26rem", sm: "18rem", xs: "14rem" }, // fixed container height
                width: "100%",
                overflow: "hidden",
                mt: "1rem",
                display: "flex",
                flexDirection: "row",
                gap: "0.5rem",
              }}
            >
              {media.map(({ url, type: mediaType }, index) => (
                <Box
                  key={index}
                  component={mediaType === "video" ? "video" : "img"}
                  src={url}
                  height="100%"
                  width={media.length > 1 ? "calc(100% / 2)" : "100%"}
                  sx={{ objectFit: "contain", bgcolor: "#000" }}
                  controls={mediaType === "video"}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {children}
    </Box>
  );
};

export default ContentHeaderAndMedia;
