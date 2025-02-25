import React, { useCallback, useState } from "react";
import { Avatar, Dialog, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography, Box, InputAdornment, Button } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPickerComponent from "../common/EmojiPickerComponent";
import { useCreateContent } from "../../hooks/content/content";
import { secondaryShareIcon } from "../../assets";

const MAX_IMAGES = 6;

// eslint-disable-next-line react/prop-types
const TweetCreationModal = ({ open, handleClose }) => {
  const [images, setImages] = useState([]);
  const [tweetText, setTweetText] = useState("");
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { mutate: createContent } = useCreateContent({ handleClose, type: "tweet" });

  // Handle image file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).slice(0, MAX_IMAGES);
    setImages((prev) => [...prev, ...selectedFiles].slice(0, MAX_IMAGES));
    event.target.value = null; // Clear file input for re-selection
  };

  // Handle image deletion
  const handleDeleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle content submission
  const handleSubmitContent = async () => {
    if (!tweetText.trim()) {
      setError("Content text is required!");
      return;
    }

    const formData = new FormData();

    // Add multiple files to FormData
    if (images && images.length > 0) {
      images.forEach((image) => formData.append("media", image));
    }

    // Add other metadata fields

    formData.append("caption", tweetText);
    formData.append("type", "tweet");
    formData.append("mediaType", "image"); // Tweets are limited to images in this case

    // Send the FormData to the backend
    createContent(formData);
  };

  // Handle emoji selection
  const handleEmojiClick = useCallback((emoji) => {
    setTweetText((prev) => prev + emoji.emoji);
  }, []);

  // Toggle Emoji Picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
      <Stack px={3} py={2} minHeight="20vh">
        {/* Header */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: "bold", fontFamily: "Poppins", p: 0 }}>Create Tweet</DialogTitle>
          <Avatar src={secondaryShareIcon} />
        </Stack>

        {/* Image Previews */}
        {images.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            mt={2}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
            }}
          >
            {images.map((image, index) => (
              <Box key={index} position="relative">
                <img src={URL.createObjectURL(image)} alt="preview" style={{ width: "8rem", height: "8rem", objectFit: "cover", borderRadius: "8px", bgcolor: "#000" }} />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteImage(index)}
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: "white",
                    color: "red",
                    boxShadow: 3,
                    "&:hover": { backgroundColor: "#000", color: "white" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {/* Content Area */}
        <Stack
          maxHeight="40vh"
          overflow="auto"
          sx={{
            marginTop: "1rem",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            What's happening?
          </Typography>
          <TextField
            multiline
            placeholder="Write something..."
            variant="standard"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Attach Images">
                      <label htmlFor="image-upload">
                        <IconButton component="span">
                          <AttachFileIcon />
                        </IconButton>
                      </label>
                    </Tooltip>
                    <input type="file" id="image-upload" accept="image/*" style={{ display: "none" }} multiple onChange={handleFileChange} />
                    <Tooltip title="Emoji Picker">
                      <IconButton onClick={toggleEmojiPicker}>
                        <EmojiEmotionsIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          {showEmojiPicker && <EmojiPickerComponent onEmojiClick={handleEmojiClick} />}
        </Stack>

        {/* Post Button */}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt=".8rem">
          <Button variant="contained" color="primary" onClick={handleSubmitContent} sx={{ fontWeight: "bold" }}>
            Post Tweet
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default TweetCreationModal;
