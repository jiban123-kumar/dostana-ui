import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  mediaSources: [],
  mediaType: "image", // Can be 'image' or 'video'
  showDownload: false,
};

const mediaPreviewSlice = createSlice({
  name: "mediaPreview",
  initialState,
  reducers: {
    openMediaDialog: (state, action) => {
      const { mediaSources, mediaType, showDownload } = action.payload;

      // Ensure mediaSources is valid
      if (!mediaSources || !Array.isArray(mediaSources) || mediaSources.length === 0) {
        console.warn("Invalid or empty mediaSources. Dialog will not open.");
        return;
      }

      state.isOpen = true;
      state.mediaSources = mediaSources || [];
      state.mediaType = mediaType || "image";
      state.showDownload = showDownload || false;
    },
    closeMediaDialog: (state) => {
      state.isOpen = false;
      state.mediaSources = [];
      state.mediaType = "image";
      state.showDownload = false;
    },
  },
});

export const { openMediaDialog, closeMediaDialog } = mediaPreviewSlice.actions;

export default mediaPreviewSlice.reducer;
