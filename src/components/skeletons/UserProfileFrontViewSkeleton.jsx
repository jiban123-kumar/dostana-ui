import React from "react";
import { Skeleton, Stack, Box } from "@mui/material";

const UserProfileFrontViewSkeleton = ({ isSelf }) => {
  return (
    <Stack flex={1} width={"100%"} alignItems={"center"} overflow={"auto"} pb={2}>
      <Stack width={"60rem"}>
        {/* Cover Image Skeleton */}
        <Stack
          sx={{
            width: "100%",
            height: "30rem",
            bgcolor: "#e0e0e0",
            mt: "1rem",
            position: "relative",
            borderRadius: "1rem",
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "1rem",
            }}
          />
          {/* Profile Image and Name Skeleton */}
          <Stack
            sx={{
              position: "absolute",
              bgcolor: "#ffffffe1",
              top: "1rem",
              left: "2rem",
              p: "1rem",
              borderRadius: ".8rem",
            }}
            flexDirection={"row"}
            alignItems={"center"}
            gap=".6rem"
          >
            <Skeleton variant="circular" width={64} height={64} />
            <Skeleton variant="text" width={120} height={24} />
          </Stack>
        </Stack>

        {/* About Section Skeleton */}
        <Stack alignItems={"center"} justifyContent={"center"} m="3rem">
          <Skeleton variant="text" width="80%" height={24} />
        </Stack>

        {/* Buttons Skeleton */}
        {!isSelf && (
          <Stack flexDirection={"row"} justifyContent={"flex-end"} gap={"1rem"} mb="1rem">
            <Skeleton variant="rectangular" width={160} height={40} />
            <Skeleton variant="rectangular" width={160} height={40} />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default UserProfileFrontViewSkeleton;
