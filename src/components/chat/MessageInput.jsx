import React, { useState, useRef } from "react";
import { Box, Stack, TextField, IconButton, InputAdornment, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import EmojiPickerComponent from "../common/EmojiPickerComponent";

const MAX_IMAGES = 6;

const MessageInput = ({ onSend }) => {
  // Local state and ref for the message input area
  const [messageText, setMessageText] = useState("");
  const [attachedImages, setAttachedImages] = useState([]);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, MAX_IMAGES);
    setAttachedImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    event.target.value = null;
  };

  const handleDeleteImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji) => {
    setMessageText((prev) => prev + emoji.emoji);
  };

  const handleSend = () => {
    if (!messageText.trim() && attachedImages.length === 0) {
      return setError("Message or image is required");
    }
    setError("");
    // Call the parent's onSend callback with the current text and attachments
    onSend(messageText, attachedImages);
    // Reset local state after sending
    setMessageText("");
    setAttachedImages([]);
    setShowEmojiPicker(false);
  };

  return (
    <Box sx={{ maxHeight: "35vh", overflowY: "auto" }}>
      {attachedImages.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 1, overflowX: "auto" }}>
          {attachedImages.map((file, index) => (
            <Box key={index} position="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="Attachment preview"
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleDeleteImage(index)}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  bgcolor: "white",
                  boxShadow: 3,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <Box sx={{ border: 1, borderColor: "divider", borderRadius: "1.5rem", p: 1, mb: 1 }}>
        <TextField
          variant="outlined"
          placeholder="Write a message..."
          fullWidth
          multiline
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          error={!!error}
          helperText={error}
          inputRef={messageInputRef}
          InputProps={{
            sx: { border: "none", "& .MuiOutlinedInput-notchedOutline": { border: "none" } },
            endAdornment: (
              <InputAdornment position="end">
                <input type="file" id="image-upload" hidden accept="image/*,video/*" multiple onChange={handleFileChange} />
                <Tooltip title="Attach images/videos">
                  <label htmlFor="image-upload">
                    <IconButton component="span">
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                </Tooltip>
                <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                  <AddReactionIcon />
                </IconButton>
                <IconButton onClick={handleSend}>
                  <Box component="img" src="/send.png" sx={{ width: 32, height: 32 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ px: 1.5, py: 1, maxHeight: 160, overflowY: "auto" }}
        />
      </Box>

      {showEmojiPicker && <EmojiPickerComponent show={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} onEmojiClick={handleEmojiSelect} />}
    </Box>
  );
};

export default MessageInput;
