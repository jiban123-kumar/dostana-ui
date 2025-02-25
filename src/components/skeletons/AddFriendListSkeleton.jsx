import { List, Skeleton, Stack } from "@mui/material";
import React from "react";

const AddFriendListSkeleton = () => {
  const skeletonCount = 3;
  return (
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
      {[...Array(skeletonCount)].map((_, index) => (
        <Stack
          key={index}
          alignItems="center"
          sx={{
            minWidth: "10rem",
            border: "1px solid #e0e0e0",
            borderRadius: "0.6rem",
            padding: "1rem",
          }}
        >
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" width="70%" height={30} sx={{ mt: 1 }} />
        </Stack>
      ))}
    </List>
  );
};
export default AddFriendListSkeleton;
