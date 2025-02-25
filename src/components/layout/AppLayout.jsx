import React, { useContext, memo, useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import TopNav from "./top-nav-bar/TopNav";
import SideNav from "./SideNav";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useSocketFriendListener } from "../../socketHooks/useSocketFriendListener";
import { useSocketContentListener } from "../../socketHooks/useSocketContentListener";
import { useSocketFriendStatusListener } from "../../socketHooks/useSocketFriendStatusListener";
import { useSocketMessageListener } from "../../socketHooks/useSocketMessageListener";
import { Loading } from "../common/Loading";
import { useSocketNotificationListener } from "../../socketHooks/useSocketNotificationListener";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const AppLayout = () => {
  const { isLoading: isProfileFetching, data: userProfile, isError: isProfileError, isFetched: isProfileFetched } = useUserProfile();
  const [isReady, setIsReady] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socket = useContext(SocketContext);

  // Set up the various socket listeners.
  useSocketFriendListener(socket);
  useSocketContentListener(socket);
  useSocketFriendStatusListener(socket);
  useSocketMessageListener(socket);
  useSocketNotificationListener(socket);

  useEffect(() => {
    if (isProfileError) {
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
  }, [isProfileError, isProfileFetched, userProfile, navigate, dispatch]);

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
        <SideNav />
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

export default AppLayout;
