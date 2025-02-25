import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import ProfileCreationPage from "./pages/ProfileCreationPage";
// import ProfileCreationBannerPage from "./pages/ProfileCreationBannerPage";
// import SnackbarAlert from "./components/SnackBarAlert";
// import AppLayout from "./components/layout/AppLayout";
// import ProfileViewPage from "./pages/ProfileViewPage";
// import MediaPreviewModal from "./components/MediaPreviewModal";
// import FeedViewPage from "./pages/FeedViewPage";
// import DetailsViewPage from "./pages/DetailsViewPage";
// import DownloadSnackbarAlert from "./components/DownloadSnackbarAlert";
// import FriendsViewPage from "./pages/FriendsViewPage";
// import FriendRequestsViewPage from "./pages/FriendRequestsViewPage";
// import NotistackAlert from "./components/NotistackAlert";
// import AddFriendPage from "./pages/AddFriendPage";
// import ChatsPage from "./pages/ChatsPage";
// import ChatViewPage from "./pages/ChatViewPage";
// import ErrorBoundary from "./components/common/ErrorBoundary";
// import SocketProvider from "./contextProvider/SocketProvider";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";
// import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
// import HomePage from "./pages/app/HomePage";
// import SavedFeedViewPage from "./pages/app/SavedFeedViewPage";
// import SharedFeedViewPage from "./pages/app/SharedFeedViewPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SocketProvider from "./contextProvider/SocketProvider";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SnackbarAlert from "./components/utils/SnackBarAlert";
import MediaPreviewModal from "./components/utils/MediaPreviewModal";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
import HomePage from "./pages/app/HomePage";
import DownloadSnackbarAlert from "./components/utils/DownloadSnackbarAlert";
import NotistackAlert from "./components/utils/NotistackAlert";
import UserProfileViewPage from "./pages/profile/UserProfileViewPage";
import UserProfileFeedViewPage from "./pages/profile/UserProfileFeedViewPage";
import UserProfileDetailsViewPage from "./pages/profile/UserProfileDetailsViewPage";
import UserProfileCreationPage from "./pages/profile/UserProfileCreationPage";
import UserProfileCreationBannerPage from "./pages/profile/UserProfileCreationBannerPage";
import AppLayout from "./components/layout/AppLayout";
import SharedFeedViewPage from "./pages/feed/SharedFeedViewPage";
import SavedFeedViewPage from "./pages/feed/SavedFeedViewPage";
import AddFriendPage from "./pages/friend/AddFriendPage";
import FriendsViewPage from "./pages/friend/FriendsViewPage";
import FriendRequestsViewPage from "./pages/friend/FriendRequestsViewPage";
import ChatsPage from "./pages/chat/ChatsPage";
import ChatModalPage from "./pages/chat/ChatModalPage";
const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SnackbarAlert />
        <MediaPreviewModal />
        <DownloadSnackbarAlert />
        <NotistackAlert />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="profile-setup" element={<UserProfileCreationPage />} />
          <Route path="forget-password" element={<ForgetPasswordPage />} />
          <Route path="welcome" element={<UserProfileCreationBannerPage />} />
          <Route
            path="/"
            element={
              <SocketProvider>
                <AppLayout />
              </SocketProvider>
            }
          >
            <Route path="home" element={<HomePage />} />
            <Route path="profile" element={<UserProfileViewPage />}>
              <Route index element={<Navigate to="feed" />} />
              <Route path="feed" element={<UserProfileFeedViewPage />} />
              <Route path="details" element={<UserProfileDetailsViewPage />} />
            </Route>
            <Route path="user-profile/:userId" element={<UserProfileViewPage />}>
              <Route index element={<Navigate to="feed" />} />
              <Route path="feed" element={<UserProfileFeedViewPage />} />
              <Route path="details" element={<UserProfileDetailsViewPage />} />
            </Route>
            <Route path="add-friend" element={<AddFriendPage />} />
            <Route path="chats" element={<ChatsPage />}>
              <Route path=":userId" element={<ChatModalPage />} />
            </Route>

            <Route path="friends" element={<FriendsViewPage />} />
            <Route path="friend-requests" element={<FriendRequestsViewPage />} />
            <Route path="shared-feed" element={<SharedFeedViewPage />} />
            <Route path="saved-feed" element={<SavedFeedViewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
