/* eslint-disable react/prop-types */
import { List, Stack, Typography } from "@mui/material";
import { useRef, useCallback } from "react";
import { useUserProfile } from "../../hooks/userProfile/userProfile.js";
import ContentCard from "./ContentCard";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import { AnimatePresence } from "motion/react";
import NoFeedMsg from "../common/NoFeedMsg";

const ContentFeed = ({ contents = [], fetchNextPage, hasNextPage, isFetchingNextPage, loading = false, showFeedLogo = true }) => {
  const observerRef = useRef();
  const { data: userProfile } = useUserProfile();

  // Intersection Observer logic for infinite scrolling
  const lastContentElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          requestAnimationFrame(fetchNextPage);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ maxWidth: "95%", width: { xs: "95%", sm: "80%", md: "38rem" } }} flex={1} overflow="hidden">
        {[...Array(5)].map((_, index) => (
          <ContentCardSkeleton key={index} />
        ))}
      </Stack>
    );
  }

  return (
    <List sx={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "95%", width: { xs: "95%", sm: "28rem", md: "38rem" } }}>
      <AnimatePresence initial={false}>
        {contents.map((content, index) => (
          <div ref={index === contents.length - 1 ? lastContentElementRef : null} key={content._id} style={{ width: "100%" }}>
            <ContentCard content={content} userProfile={userProfile} />
          </div>
        ))}
      </AnimatePresence>
      {showFeedLogo && <NoFeedMsg textMsg="No more content" />}
      {isFetchingNextPage && (
        <Stack mt={2} alignItems="center">
          <Typography variant="body2">Loading more...</Typography>
        </Stack>
      )}
    </List>
  );
};

export default ContentFeed;
