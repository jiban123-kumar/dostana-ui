/* eslint-disable react/prop-types */
// src/components/shared/ContentFeed.jsx
import { List, Stack, Typography } from "@mui/material";
import { useRef, useCallback } from "react";
import { useUserProfile } from "../../hooks/userProfile/userProfile.js";
import ContentCard from "./ContentCard";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import { AnimatePresence } from "motion/react";

const ContentFeed = ({ contents = [], fetchNextPage, hasNextPage, isFetchingNextPage, loading = false }) => {
  const observerRef = useRef();

  const { data: userProfile } = useUserProfile();

  // Intersection Observer logic
  const lastContentElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        requestAnimationFrame(() => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        });
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ maxWidth: "95%", width: { xs: "95%", sm: "80%", md: "38rem" } }} flex={1} overflow={"hidden"}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Stack key={index} sx={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            <ContentCardSkeleton />
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <List sx={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "95%", width: { xs: "95%", sm: "28rem", md: "38rem" } }}>
      <AnimatePresence initial={false}>
        {contents.map((content, index) => {
          if (contents.length === index + 1) {
            return (
              <div ref={lastContentElementRef} key={content._id} style={{ width: "100%" }}>
                <ContentCard content={content} userProfile={userProfile} />
              </div>
            );
          } else {
            return <ContentCard key={content._id} content={content} userProfile={userProfile} />;
          }
        })}
      </AnimatePresence>
      {isFetchingNextPage && (
        <Stack mt={2} alignItems="center">
          <Typography variant="body2">Loading more...</Typography>
        </Stack>
      )}
    </List>
  );
};

export default ContentFeed;
