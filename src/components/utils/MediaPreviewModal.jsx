/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Dialog, IconButton, Stack, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { closeMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { showDownloading } from "../../reduxSlices/downloadingSlice";

const MediaPreviewModal = () => {
  const dispatch = useDispatch();
  const { isOpen, mediaSources, mediaType, showDownload } = useSelector((state) => state.media);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleDownload = async () => {
    const currentMedia = mediaSources[currentIndex];
    const fileName = currentMedia.split("/").pop() || "downloaded_file";
    dispatch(showDownloading({ message: "Downloading in progress...", type: "downloading" }));
    try {
      await saveAs(currentMedia, fileName);
    } catch (error) {
      dispatch(showDownloading({ message: "Download failed. Please try again.", type: "error" }));
    }
  };

  const navigateMedia = (step) => {
    setDirection(step);
    setCurrentIndex((prev) => prev + step);
  };

  const isImage = mediaType === "image";
  const currentMedia = mediaSources[currentIndex];
  const hasMultipleMedia = mediaSources.length > 1;

  const motionVariants = {
    enter: (dir) => ({ x: dir === 1 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 1 ? -300 : 300, opacity: 0 }),
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => dispatch(closeMediaDialog())}
      maxWidth="md"
      fullWidth
      slotProps={{ backdrop: { style: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.4)" } } }}
      PaperProps={{ style: { backgroundColor: "rgba(255, 255, 255, 0.8)" } }}
      sx={{ zIndex: 1600 }}
    >
      <Stack sx={{ width: "100%", height: "60vh", position: "relative", overflow: "hidden" }}>
        <Tooltip title="Close">
          <IconButton onClick={() => dispatch(closeMediaDialog())} sx={iconButtonStyles.topRight}>
            <CloseIcon sx={iconIconStyles} />
          </IconButton>
        </Tooltip>

        {showDownload && (
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} sx={iconButtonStyles.topLeft}>
              <DownloadForOfflineIcon sx={iconIconStyles} />
            </IconButton>
          </Tooltip>
        )}

        {hasMultipleMedia && (
          <>
            <IconButton onClick={() => navigateMedia(-1)} disabled={currentIndex === 0} sx={iconButtonStyles.left}>
              <NavigateBeforeIcon sx={iconIconStyles} />
            </IconButton>
            <IconButton onClick={() => navigateMedia(1)} disabled={currentIndex === mediaSources.length - 1} sx={iconButtonStyles.right}>
              <NavigateNextIcon sx={iconIconStyles} />
            </IconButton>
          </>
        )}

        <AnimatePresence initial={false} custom={direction}>
          <motion.div key={currentMedia} custom={direction} variants={motionVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} style={motionContainerStyle}>
            {isImage ? <Box component="img" src={currentMedia} alt="Preview" sx={mediaStyles} /> : <Box component="video" src={currentMedia} controls sx={mediaStyles} />}
          </motion.div>
        </AnimatePresence>
      </Stack>
    </Dialog>
  );
};

const iconButtonStyles = {
  topRight: { position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 2000, bgcolor: "#00000078", "&:hover": { bgcolor: "#000000" } },
  topLeft: { position: "absolute", top: "0.5rem", left: "0.5rem", zIndex: 2000, bgcolor: "#00000078", "&:hover": { bgcolor: "#000000" } },
  left: { position: "absolute", top: "50%", left: "0.5rem", zIndex: 2000, transform: "translateY(-50%)", bgcolor: "#00000078", "&:hover": { bgcolor: "#000000" } },
  right: { position: "absolute", top: "50%", right: "0.5rem", zIndex: 2000, transform: "translateY(-50%)", bgcolor: "#00000078", "&:hover": { bgcolor: "#000000" } },
};

const iconIconStyles = { width: "2rem", height: "2rem", color: "#fff" };
const motionContainerStyle = { width: "100%", height: "100%", position: "absolute", top: 0, left: 0 };
const mediaStyles = { width: "100%", height: "100%", objectFit: "contain" };

export default MediaPreviewModal;
