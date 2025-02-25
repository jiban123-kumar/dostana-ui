import React from "react";
import FriendAndRequestCard from "./FriendAndRequestCard";
import { Stack } from "@mui/material";

const FriendsView = () => {
  return (
    <Stack gap={4} mt="1rem">
      <FriendAndRequestCard mode="friends" />
      <FriendAndRequestCard mode="suggestedUsers" />
    </Stack>
  );
};

export default FriendsView;
