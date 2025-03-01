import React, { useMemo, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { useGetSavedContent } from "../../hooks/content/contentSave";
import { emptyFeedAnimation } from "../../animation";
import ContentFeed from "../content/ContentFeed";

const SavedFeedView = () => {
  const { isLoading: isLoadingSavedContent, fetchNextPage, hasNextPage, isFetchingNextPage, data } = useGetSavedContent();
  console.log(data);

  // Flatten the saved content from all pages
  const savedContents = useMemo(() => {
    if (!data || !data.pages) return [];
    return data.pages.flatMap((page) => page.contents || []);
  }, [data]);

  return (
    <Stack alignItems="center" pb="1rem" width={"100%"}>
      {isLoadingSavedContent ? (
        <ContentFeed loading />
      ) : savedContents.length > 0 ? (
        <ContentFeed contents={savedContents} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
      ) : (
        <Stack alignItems="center" spacing={3} sx={{ mt: "6rem", textAlign: "center" }}>
          <Lottie animationData={emptyFeedAnimation} style={{ height: "10rem", width: "100%" }} autoplay loop={false} />
          <Typography variant="h6" color="text.secondary">
            No saved content found
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            sx={{
              borderRadius: "2rem",
              textTransform: "none",
              px: 4,
              py: 1,
            }}
          >
            Explore more
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default SavedFeedView;
