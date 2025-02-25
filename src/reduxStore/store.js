import { configureStore } from "@reduxjs/toolkit";
import profileSlice from "../reduxSlices/profileSlice.js";
import alertSlice from "../reduxSlices/alertSlice.js";
import mediaPreviewSlice from "../reduxSlices/mediaPreviewSlice.js";
import downloadingSlice from "../reduxSlices/downloadingSlice.js";
import notistackAlertSlice from "../reduxSlices/notistackAlertSlice.js";
import { notificationModalReducer } from "../reduxSlices/componentTracker.js";
export const store = configureStore({
  reducer: {
    profile: profileSlice,
    alert: alertSlice,
    media: mediaPreviewSlice,
    downloading: downloadingSlice,
    notistackAlert: notistackAlertSlice,
    componentTracker: notificationModalReducer,
  },
});
