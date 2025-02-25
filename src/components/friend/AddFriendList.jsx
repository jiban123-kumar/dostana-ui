/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { Avatar, IconButton, List, Paper, Stack, Tooltip, Typography, CircularProgress, Button } from "@mui/material";
import { PersonAdd as PersonAddIcon, CancelOutlined } from "@mui/icons-material";
import Lottie from "lottie-react";
import AddFriendListSkeleton from "../skeletons/AddFriendListSkeleton";
import { friendAnimation } from "../../animation";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { useSendFriendRequest, useCancelFriendRequest, useGetSuggestedUsers } from "../../hooks/friends/suggestedUsers";
import { useGetFriends } from "../../hooks/friends/friends";

const AddFriendItem = ({ user }) => {
  const navigate = useNavigate();
  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutate: cancelFriendRequest, isPending: isCancelingFriendRequest } = useCancelFriendRequest();

  const handleAddFriend = (id) => {
    sendFriendRequest(id);
  };

  const handleCancelRequest = (id) => {
    cancelFriendRequest(id);
  };

  return (
    <Stack alignItems="center" sx={{ minWidth: "10rem", borderRadius: "0.6rem", padding: "1rem" }} component={Paper} elevation={3}>
      <Tooltip title="Visit Profile">
        <IconButton onClick={() => navigate(`/user-profile/${user._id}`)}>
          <Avatar src={user.profileImage} sx={{ width: 80, height: 80, mb: 1, boxShadow: 3 }} />
        </IconButton>
      </Tooltip>
      <Typography variant="body2" gutterBottom fontWeight="bold">
        {user.firstName} {user.lastName}
      </Typography>
      {user.status === "pending" ? (
        <Tooltip title="Cancel Request">
          <Button variant="outlined" size="small" startIcon={<CancelOutlined />} onClick={() => handleCancelRequest(user._id)} loading={isCancelingFriendRequest} sx={{ color: "grey", borderColor: "grey" }} loadingPosition="start">
            Request Sent
          </Button>
        </Tooltip>
      ) : (
        <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={() => handleAddFriend(user._id)} loading={isSendingFriendRequest} sx={{ fontWeight: "bold" }} loadingPosition="start">
          Add Friend
        </Button>
      )}
    </Stack>
  );
};

export const AddFriendList = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useGetSuggestedUsers();

  // Flatten all pages into one list of users
  const suggestedUsers = data ? data.pages.flatMap((page) => page.suggestedUsers) : [];

  return (
    <Stack width="100%" sx={{ position: "relative", borderRadius: "0.6rem", padding: "1rem" }} component={Paper} elevation={3}>
      {isLoading ? (
        <AddFriendListSkeleton />
      ) : suggestedUsers.length > 0 ? (
        <>
          <List
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1.5rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {suggestedUsers.map((user) => (
              <AddFriendItem key={user._id} user={user} isFetchingSuggestedUsers={isFetching} />
            ))}
          </List>
          {hasNextPage && (
            <Stack alignItems="center" mt={2}>
              {isFetchingNextPage ? (
                <CircularProgress />
              ) : (
                <Button variant="outlined" onClick={() => fetchNextPage()}>
                  Load More
                </Button>
              )}
            </Stack>
          )}
        </>
      ) : (
        <Stack justifyContent="center" alignItems="center" sx={{ p: "3rem" }}>
          <Lottie animationData={friendAnimation} style={{ height: "200px", margin: "0 auto" }} loop autoPlay />
          <Typography variant="body2" sx={{ color: "#000000a6", fontWeight: "bold", mt: 1 }}>
            No suggested users available
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default AddFriendList;
