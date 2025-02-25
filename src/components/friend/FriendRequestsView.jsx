import React from "react";
import FriendAndRequestCard from "./FriendAndRequestCard";
import { Stack } from "@mui/material";

const FriendRequestsView = () => {
  return (
    <Stack gap={4} mt={"1rem"}>
      <FriendAndRequestCard mode="pendingRequests" />
      <FriendAndRequestCard mode="suggestedUsers" />
    </Stack>
  );
};

export default FriendRequestsView;
