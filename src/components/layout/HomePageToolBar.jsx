import { Avatar, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchPeople from "../common/PeopleSearch";
import PostCreator from "../post/PostCreationModal";
import TweetPost from "../tweet/TweetCreationModal";
import { galleryIcon, tweetIcon } from "../../assets";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const TOOLTIP_OFFSET = {
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -14],
        },
      },
    ],
  },
};

// eslint-disable-next-line react/prop-types
const HomePageToolBar = ({ setFirstPostOpenModal, firstPostOpenModal }) => {
  const [openPostModal, setOpenPostModal] = useState(false);
  const [openTweetModal, setOpenTweetModal] = useState(false);

  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    if (firstPostOpenModal) {
      setOpenPostModal(true);
    }
  }, [firstPostOpenModal]);

  const handleCloseTweetModal = () => {
    setOpenTweetModal(false);
  };

  const handleClosePostModal = () => {
    setOpenPostModal(false);
    setFirstPostOpenModal(false);
  };

  // Derive profile image and name

  return (
    <Stack sx={{ position: "sticky", top: 0, left: 0, pt: "1rem", zIndex: 100, bgcolor: "#fff" }}>
      <Stack
        sx={{
          bgcolor: "#fff",
          boxShadow: 3,
          width: "45rem",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingX: "1rem",
          paddingY: "0.8rem",
        }}
      >
        {/* User Profile Section */}
        <Stack flexDirection="row" alignItems="center">
          <Tooltip title="Visit Profile" slotProps={TOOLTIP_OFFSET}>
            <IconButton sx={{ height: "3.2rem", width: "3.2rem" }}>
              <Avatar src={userProfile?.profileImage || ""} sx={{ boxShadow: 3 }} />
            </IconButton>
          </Tooltip>
          {!userProfile?.firstName ? (
            <Skeleton variant="text" width={100} height={24} />
          ) : (
            <Typography
              variant="body1"
              fontWeight="bold"
              color="#000000d1"
              sx={{
                maxWidth: "10rem", // Adjust as needed
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
            >
              {`${userProfile?.firstName} ${userProfile?.lastName}`}
            </Typography>
          )}
        </Stack>

        {/* Action Buttons Section */}
        <Stack flexDirection="row" alignItems="center" gap={1}>
          <SearchPeople />
          <Tooltip title="Create Post" slotProps={TOOLTIP_OFFSET}>
            <IconButton sx={{ height: "3.2rem", width: "3.2rem" }} onClick={() => setOpenPostModal(true)}>
              <Avatar src={galleryIcon} alt="Create Post" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Tweet" slotProps={TOOLTIP_OFFSET}>
            <IconButton sx={{ height: "3.2rem", width: "3.2rem" }} onClick={() => setOpenTweetModal(true)}>
              <Avatar src={tweetIcon} alt="Create Tweet" />
            </IconButton>
          </Tooltip>
        </Stack>

        {openPostModal && <PostCreator open={openPostModal} handleClose={handleClosePostModal} />}
        {openTweetModal && <TweetPost open={openTweetModal} handleClose={handleCloseTweetModal} />}
      </Stack>
    </Stack>
  );
};

export default HomePageToolBar;
