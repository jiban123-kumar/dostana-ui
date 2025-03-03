/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Dialog, IconButton, Stack, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { closeMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { showDownloading, hideDownloading } from "../../reduxSlices/downloadingSlice";

const MediaPreviewModal = () => {
  const dispatch = useDispatch();
  const { isOpen, mediaSources, mediaType, showDownload } = useSelector((state) => state.media);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handleDownload = async () => {
    const currentMedia = mediaSources[currentIndex];
    const fileName = currentMedia.split("/").pop() || "downloaded_file";

    // Show the downloading snackbar
    dispatch(
      showDownloading({
        message: "Downloading in progress...",
        type: "downloading",
      })
    );

    try {
      await saveAs(currentMedia, fileName);

      // Update the snackbar to success
      dispatch(
      
    } catch (error) {
      // Update the snackbar to error
      dispatch(
        showDownloading({
          message: "Download failed. Please try again.",
          type: "error",
        })
      );
    } finally {
      // Hide the snackbar after a short delay

    }
  };

  const handleNext = () => {
    if (currentIndex < mediaSources.length - 1) {
      setDirection(1); // Set direction to right
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1); // Set direction to left
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const isImage = mediaType === "image";
  const currentMedia = mediaSources[currentIndex];

  // Variants for Framer Motion
  const variants = {
    enter: (direction) => ({
      x: direction === 1 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 1 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <>
      {/* Media Preview Modal */}
      <Dialog
        open={isOpen}
        onClose={() => dispatch(closeMediaDialog())}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            style: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          },
        }}
        PaperProps={{
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          },
        }}
        sx={{ zIndex: 1600 }}
      >
        <Stack
          sx={{
            width: "100%",
            height: "60vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Close Button */}
          <Tooltip title="Close">
            <IconButton
              onClick={() => dispatch(closeMediaDialog())}
              sx={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                zIndex: 2000,
                bgcolor: "#00000078",
                "&:hover": {
                  bgcolor: "#000000",
                },
              }}
            >
              <CloseIcon sx={{ width: { md: "2rem", sm: "1.8rem", xs: "1.6rem" }, height: { md: "2rem", sm: "1.8rem", xs: "1.6rem" }, color: "#fff" }} />
            </IconButton>
          </Tooltip>

          {/* Download Button */}
          {showDownload && (
            <Tooltip title="Download">
              <IconButton
                onClick={handleDownload}
                sx={{
                  position: "absolute",
                  top: "0.5rem",
                  left: "0.5rem", // Move to the left side
                  zIndex: 2000,
                  bgcolor: "#00000078",
                  "&:hover": {
                    bgcolor: "#000000",
                  },
                }}
              >
                <DownloadForOfflineIcon sx={{ width: "2rem", height: "2rem", color: "#fff" }} />
              </IconButton>
            </Tooltip>
          )}

          {mediaSources.length > 1 && (
            <>
              {/* Previous Button */}
              <IconButton
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "0.5rem",
                  zIndex: 2000,
                  transform: "translateY(-50%)",
                  bgcolor: currentIndex === 0 ? "#00000040" : "#00000078",
                  "&:hover": {
                    bgcolor: currentIndex === 0 ? "#00000040" : "#000000",
                  },
                }}
              >
                <NavigateBeforeIcon sx={{ width: "2rem", height: "2rem", color: "#fff" }} />
              </IconButton>

              {/* Next Button */}
              <IconButton
                onClick={handleNext}
                disabled={currentIndex === mediaSources.length - 1}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "0.5rem",
                  zIndex: 2000,
                  transform: "translateY(-50%)",
                  bgcolor: currentIndex === mediaSources.length - 1 ? "#00000040" : "#00000078",
                  "&:hover": {
                    bgcolor: currentIndex === mediaSources.length - 1 ? "#00000040" : "#000000",
                  },
                }}
              >
                <NavigateNextIcon sx={{ width: "2rem", height: "2rem", color: "#fff" }} />
              </IconButton>
            </>
          )}

          {/* Media Content */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentMedia}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {isImage ? (
                <Box
                  component="img"
                  src={currentMedia}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  component="video"
                  src={currentMedia}
                  controls
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Stack>
      </Dialog>

      {/* Downloading Snackbar */}
    </>
  );
};

export default MediaPreviewModal;
