import React, { useContext, memo, useEffect, useState } from "react";
import { Stack, useMediaQuery } from "@mui/material";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import TopNav from "./top-nav-bar/TopNav";
import SideNav from "./SideNav";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useSocketFriendListener } from "../../socketHooks/useSocketFriendListener";
import { useSocketContentListener } from "../../socketHooks/useSocketContentListener";
import { useSocketFriendStatusListener } from "../../socketHooks/useSocketFriendStatusListener";
import { useSocketMessageListener } from "../../socketHooks/useSocketMessageListener";
import Loading from "../common/Loading";
import { useSocketNotificationListener } from "../../socketHooks/useSocketNotificationListener";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import usePushNotifications from "../../hooks/notification/pushNotification";
const AppLayout = () => {
  const { isLoading: isProfileFetching, data: userProfile, isError: isProfileError, isFetched: isProfileFetched } = useUserProfile();
  const [isReady, setIsReady] = useState(false);
  const bellow1300px = useMediaQuery("(max-width: 1300px)");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socket = useContext(SocketContext);

  // Set up the various socket listeners.
  useSocketFriendListener(socket);
  useSocketContentListener(socket);
  useSocketFriendStatusListener(socket);
  useSocketMessageListener(socket);
  useSocketNotificationListener(socket);

  // Initialize push notifications only when the user profile is complete.
  // The hook's effect will run only if the passed parameter is truthy.
  usePushNotifications(isProfileFetched && userProfile?.isProfileComplete);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      return navigate("/login");
    }
    if (isProfileFetching) return;
    if (isProfileError || !userProfile) {
      dispatch(
        showAlert({
          message: "Something went wrong. Please login again.",
          type: "error",
          loading: false,
        })
      );
      navigate("/login");
    } else if (isProfileFetched) {
      if (!userProfile?.isProfileComplete) {
        navigate("/welcome");
      }

      setIsReady(true);
    }
  }, [isProfileError, isProfileFetched, userProfile, navigate, dispatch, isProfileFetching]);

  if (isProfileFetching || !isReady) {
    return <Loading />;
  }

  return (
    <Stack height="100vh" overflow="hidden">
      <TopNav />
      <Stack
        flex={1}
        sx={{
          position: "relative",
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {!bellow1300px && <SideNav />}
        <Stack
          alignItems="center"
          sx={{
            overflowY: "auto",
            flex: 1,
            width: "100%",
          }}
        >
          <Outlet />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(AppLayout);
