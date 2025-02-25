/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { Avatar, Box, Button, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported"; // New icon for placeholder
import { useDispatch } from "react-redux";
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { useParams, useNavigate } from "react-router-dom";

// Import friend-related hooks and relationship hook
import { CheckCircle as CheckCircleIcon, PersonRemove as PersonRemoveIcon, PersonAdd as PersonAddIcon, CancelOutlined, Message as MessageIcon } from "@mui/icons-material";

import { SocketContext } from "../../contextProvider/SocketProvider";
import { useGetRelationshipById, useRemoveFriend } from "../../hooks/friends/friends";
import { useAcceptFriendRequest, useDeclineFriendRequest } from "../../hooks/friends/friendRequests";
import { useSendFriendRequest, useCancelFriendRequest } from "../../hooks/friends/suggestedUsers";
import { useUpdateProfile } from "../../hooks/userProfile/userProfileUpdation";

const UserProfileFrontView = ({ userProfile }) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams(); // This is the profile being viewed.

  // If no userId is provided in URL params, then this is your own profile.
  const isSelf = !routeUserId;

  const { firstName = "", lastName = "", about = "", profileImage = "", coverImage = "" } = userProfile || {};

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  // Relationship hooks for friend actions
  const { mutate: sendFriendRequest, isPending: isSendingFriend } = useSendFriendRequest(socket);
  const { mutate: cancelFriendRequest, isPending: isCancelingFriend } = useCancelFriendRequest(socket);
  const { mutate: acceptFriendRequest, isPending: isAcceptingFriend } = useAcceptFriendRequest(socket);
  const { mutate: declineFriendRequest, isPending: isDecliningFriend } = useDeclineFriendRequest(socket);
  const { mutate: removeFriend, isPending: isRemovingFriend } = useRemoveFriend(socket);

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Relationship status
  const { data: relationshipData, isLoading: isRelationshipLoading, isFetching: isFetchingRelationship } = useGetRelationshipById(routeUserId);

  // Handlers for friend actions
  const handleSendRequest = () => sendFriendRequest(routeUserId);
  const handleCancelRequest = () => cancelFriendRequest(routeUserId);
  const handleAcceptRequest = () => acceptFriendRequest(routeUserId);
  const handleDeclineRequest = () => declineFriendRequest(routeUserId);
  const handleRemove = () => removeFriend(routeUserId);

  const handleImageView = (img) => {
    if (!img) return;
    dispatch(
      openMediaDialog({
        type: "image",
        mediaSources: [img],
        showDownload: true,
      })
    );
  };

  const handleCoverImageUpdate = async () => {
    if (!coverImageFile) return;
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);
    console.log(coverImageFile);
    updateProfile(formData);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
    }
  };

  // Render friend action buttons if not self and if relationship query has finished loading
  const renderFriendActions = () => {
    if (isRelationshipLoading) return <Skeleton variant="rectangular" width={200} height={40} />;

    switch (relationshipData?.relationship) {
      case "friends":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PersonRemoveIcon />}
              onClick={handleRemove}
              disabled={isRemovingFriend}
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Remove Friend
            </Button>
            <Button
              sx={{
                paddingX: "2.4rem",
                fontSize: ".8rem",
                fontWeight: "bold",
                borderRadius: ".4rem",
                minWidth: "10rem",
                mt: "1rem",
              }}
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/chats/${routeUserId}`)}
              size="large"
              startIcon={<MessageIcon />}
            >
              Message
            </Button>
          </Stack>
        );

      case "pending_sent":
        return (
          <Tooltip title="Cancel Request">
            <Button
              variant="outlined"
              size="large"
              startIcon={<CancelOutlined />}
              onClick={handleCancelRequest}
              disabled={isCancelingFriend}
              loading={isCancelingFriend}
              loadingPosition="start"
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Request Sent
            </Button>
          </Tooltip>
        );

      case "pending_received":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleAcceptRequest}
              disabled={isAcceptingFriend}
              loading={isAcceptingFriend}
              loadingPosition="start"
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CancelOutlined />}
              onClick={handleDeclineRequest}
              disabled={isDecliningFriend}
              loading={isDecliningFriend}
              loadingPosition="start"
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Decline
            </Button>
          </Stack>
        );

      default:
        return (
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={handleSendRequest}
            disabled={isSendingFriend}
            loading={isSendingFriend}
            loadingPosition="start"
            sx={{
              fontWeight: "bold",
              minWidth: "10rem",
              textTransform: "none",
            }}
          >
            Add Friend
          </Button>
        );
    }
  };

  return (
    <Stack width={"100%"}>
      <Stack
        sx={{
          width: "100%",
          height: "30rem",
          mt: "1rem",
          position: "relative",
          borderRadius: "1rem",
          bgcolor: "#000",
        }}
      >
        {coverImage || coverImagePreview ? (
          <Tooltip title="View Cover Pic">
            <Box
              component={"img"}
              src={coverImagePreview || coverImage}
              sx={{
                objectFit: "cover",
                height: "100%",
                width: "100%",
                borderRadius: "1rem",
              }}
              onClick={() => handleImageView(coverImagePreview || coverImage)}
            />
          </Tooltip>
        ) : (
          <Stack
            sx={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageNotSupportedIcon sx={{ fontSize: "4rem", color: "white", mb: 1 }} />
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontStyle: "italic",
                fontWeight: "bold",
              }}
            >
              No Cover Image
            </Typography>
          </Stack>
        )}
        {isSelf && (
          <Stack
            sx={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
            }}
            flexDirection="row"
            gap={1}
          >
            <input type="file" accept="image/*" id="cover-image-input" style={{ display: "none" }} onChange={handleImageChange} />
            <label htmlFor="cover-image-input">
              <Button variant="contained" color={coverImage || coverImagePreview ? "primary" : "secondary"} component="span" sx={{ fontWeight: "bold", px: "1rem" }}>
                {coverImage || coverImagePreview ? "Update Cover Image" : "Add Cover Image"}
              </Button>
            </label>
            {/* Show the upload button if a new file is selected */}
            {coverImageFile && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCoverImageUpdate}
                sx={{
                  fontWeight: "bold",
                  px: "1rem",
                  // Custom disabled styling for better visibility on black
                  "&.Mui-disabled": {
                    backgroundColor: "#555 !important",
                    color: "#fff !important",
                    opacity: 1,
                  },
                  "&.MuiLoadingButton-loading": {
                    backgroundColor: (theme) => theme.palette.secondary.main,
                  },
                }}
                startIcon={<CloudUploadIcon />}
                disabled={isUpdating || !coverImageFile}
              >
                Upload
              </Button>
            )}
          </Stack>
        )}
        <Stack
          sx={{
            position: "absolute",
            bgcolor: "#ffffffe1",
            top: "1rem",
            left: "2rem",
            p: "1rem",
            borderRadius: ".8rem",
            boxShadow: 1,
          }}
          flexDirection={"row"}
          alignItems={"center"}
          gap={".6rem"}
        >
          <Tooltip title="View Profile Pic" placement="top">
            <Avatar
              src={profileImage}
              sx={{
                width: "4rem",
                height: "4rem",
                cursor: "pointer",
                boxShadow: 3,
              }}
              onClick={() => handleImageView(profileImage)}
            />
          </Tooltip>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {`${firstName} ${lastName}`}
          </Typography>
        </Stack>
      </Stack>
      <Stack alignItems={"center"} justifyContent={"center"} m="2rem">
        <Tooltip title="About Me">
          <Typography variant="body2" fontWeight={"bold"} sx={{ textAlign: "start" }}>
            {about || "Hey there, I am Dostana a social media app!"}
          </Typography>
        </Tooltip>
      </Stack>
      {/* Friend action buttons: Only display if viewing another user’s profile */}
      {!isSelf && (
        <Stack direction="row" justifyContent="flex-end" spacing={2} mb={2}>
          {renderFriendActions()}
        </Stack>
      )}
      {/* Additional buttons or content can be placed here */}
      <Stack>{/* Other buttons can go here */}</Stack>
    </Stack>
  );
};

export default UserProfileFrontView;
