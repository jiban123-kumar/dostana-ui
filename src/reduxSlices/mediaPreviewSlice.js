import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  mediaSources: [], // [{url, type}]
  showDownload: false,
};

const mediaPreviewSlice = createSlice({
  name: "mediaPreview",
  initialState,
  reducers: {
    openMediaDialog: (state, action) => {
      const { mediaSources, showDownload } = action.payload;
      state.isOpen = true;
      state.mediaSources = mediaSources || [];
      state.showDownload = showDownload || false;
    },
    closeMediaDialog: (state) => {
      state.isOpen = false;
      state.mediaSources = [];
      state.showDownload = false;
    },
  },
});

export const { openMediaDialog, closeMediaDialog } = mediaPreviewSlice.actions;
export default mediaPreviewSlice.reducer;
