/* eslint-disable react/prop-types */
import React, { useCallback, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Stack, Tooltip, IconButton, Avatar, Box, Skeleton, Button, TextField, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import styled from "styled-components";
import EmojiPickerComponent from "../common/EmojiPickerComponent";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useCreateContent } from "../../hooks/content/content";

const HiddenFileInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const PostCreator = ({ open, handleClose }) => {
  const [fileData, setFileData] = useState({
    file: null,
    previewURL: "",
    type: "",
  });
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { mutate: createContent } = useCreateContent({ handleClose, type: "post" });

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "unsupported";

      if (type === "unsupported") {
        setError("Please upload a valid image or video file.");
        return;
      }

      setFileData({
        file,
        previewURL: URL.createObjectURL(file),
        type,
      });
      setError("");
    }
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!fileData.file) {
      setError("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("media", fileData.file);
    formData.append("caption", description);
    formData.append("type", "post");
    formData.append("mediaType", fileData.type); // "image" or "video"

    createContent(formData);
  };

  // Render media preview
  const renderMediaPreview = () => {
    if (!fileData.file) return null;

    const { previewURL, type } = fileData;

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          cursor: "pointer",
          borderRadius: "8px",
          backgroundColor: "#000000a2",
          objectFit: "contain",
        }}
      >
        {type === "image" ? (
          <img
            src={previewURL}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        ) : (
          <video
            controls
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
            }}
          >
            <source src={previewURL} type={fileData.file.type} />
            Your browser does not support the video tag.
          </video>
        )}
      </Box>
    );
  };

  const uploadButtonStyles = {
    position: "absolute",
    top: fileData.file ? undefined : "50%",
    left: fileData.file ? undefined : "50%",
    bottom: fileData.file ? "1rem" : undefined,
    right: fileData.file ? "1rem" : undefined,
    transform: fileData.file ? undefined : "translate(-50%, -50%)",
  };

  // Handle emoji picker visibility and selection
  const handleEmojiClick = useCallback((emoji) => {
    setDescription((prev) => prev + emoji.emoji); // Append emoji to description
  }, []);

  return (
    <>
      <Dialog open={open} fullWidth maxWidth="sm" onClose={handleClose}>
        <Stack sx={{ maxHeight: "30rem", paddingX: "1rem", pb: "1.4rem" }}>
          {/* Header */}
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <DialogTitle sx={{ fontWeight: "bold", fontFamily: "Poppins" }}>Share Post</DialogTitle>
            <Tooltip title="Share">
              <IconButton sx={{ height: "3.2rem", width: "3.2rem" }} onClick={handleCreatePost}>
                <Avatar src="/next.png" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Content */}
          <DialogContent
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
            }}
          >
            <Stack sx={{ height: "16rem", position: "relative" }}>
              {!fileData.file && <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />}
              {renderMediaPreview()}
              <Button variant="contained" startIcon={<CloudUpload />} color="primary" sx={{ ...uploadButtonStyles, fontWeight: "bold", paddingX: "2rem" }} component="label">
                Upload files
                <HiddenFileInput type="file" onChange={handleFileChange} accept="image/*,video/*" />
              </Button>
              {error && <Typography color="error">{error}</Typography>}
            </Stack>

            {/* Description Input */}
            <Stack marginTop="1rem" gap={1}>
              <Typography variant="body1" sx={{ fontFamily: "Poppins", fontWeight: "600" }}>
                About Post (Optional)
              </Typography>
              <TextField
                placeholder="Write something about the post"
                multiline
                variant="standard"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Emoji Picker">
                      <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <EmojiEmotionsIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Stack>

            {/* Emoji Picker */}
            {showEmojiPicker && <EmojiPickerComponent onEmojiClick={handleEmojiClick} />}
          </DialogContent>
          <Stack mt={"1rem"} alignItems={"flex-end"} px={"1rem"}>
            <Button variant="contained" onClick={handleCreatePost} sx={{ minWidth: "10rem", fontWeight: "bold" }}>
              Share Post
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
};

export default PostCreator;
