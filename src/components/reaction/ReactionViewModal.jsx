/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Avatar, Dialog, DialogContent, List, ListItemButton, Typography, Stack, Box, Button, Tooltip } from "@mui/material";
import { ThumbUpAlt } from "@mui/icons-material";
import Lottie from "lottie-react";
import ReactionViewModalSkeleton from "../skeletons/ReactionViewModalSkeleton";
import reactionAnimations from "../../constants/reactionAnimationList";
import getReactedByText from "../../utilsFunction/getReactedByText";
import ContentHeaderAndMedia from "../content/ContentHeaderAndMedia";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useGetReactionsForContent } from "../../hooks/content/contentReaction";
import { useNavigate } from "react-router-dom";

const ReactionViewModal = ({ onClose, open, content }) => {
  const { _id: contentId } = content || {};
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Fetch reactions (paginated, max 10 per page)
  const { data: reactionsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetReactionsForContent({ contentId });

  // Get the logged-in user's profile
  const { data: userProfile } = useUserProfile();

  // Flatten the paginated data
  const reactionsList = reactionsData?.pages?.flatMap((page) => page.reactionDetails.reactions) || [];
  const reactionDetails = reactionsData?.pages?.flatMap((page) => page.reactionDetails) || [];
  console.log(reactionsList);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        onScroll={(e) => setScrolled(e.target.scrollTop > 0)}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          p: 2,
          overflowY: "auto",
        }}
      >
        {/* Fixed media header */}
        <ContentHeaderAndMedia content={content} />

        {/* Scrollable reaction list area */}
        <Box sx={{ mt: 2 }}>
          {/* Sticky header for reaction summary */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            py={2}
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "inherit",
              zIndex: 1,
              borderBottom: scrolled ? "1px solid #ccc" : "none", // optional accent border
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontFamily: "poppins",
                m: 0,
                textDecoration: scrolled ? "line-through" : "none",
              }}
            >
              Reacted
            </Typography>
            {!isLoading && reactionDetails.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: ".8rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  textDecoration: scrolled ? "line-through" : "none",
                }}
              >
                {getReactedByText({
                  userProfile,
                  reactionDetails: reactionDetails[0],
                })}
              </Typography>
            )}
          </Stack>

          {isLoading ? (
            <List sx={{ my: "1rem" }}>
              {[...Array(4)].map((_, index) => (
                <ReactionViewModalSkeleton key={index} />
              ))}
            </List>
          ) : (
            <Stack sx={{ mt: ".2rem" }}>
              {reactionsList.length > 0 ? (
                <List sx={{ maxHeight: "300px" }}>
                  {reactionsList.map((reaction) => {
                    const animation = reactionAnimations.find((anim) => anim.name === reaction?.type)?.animationData;
                    return (
                      <ListItemButton
                        key={reaction?._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderRadius: 2,
                          mb: 1,
                          boxShadow: 3,
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                          padding: 2,
                        }}
                      >
                        <Tooltip title={`Visit Profile`}>
                          <Avatar
                            src={reaction?.user?.profileImage || ""}
                            alt={reaction?.user?.firstName}
                            sx={{ boxShadow: 3, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user-profile/${reaction?.user?._id}`);
                            }}
                          />
                        </Tooltip>
                        <Box flex="1">
                          <Typography variant="body1" sx={{ fontWeight: "bold", fontFamily: "poppins" }}>
                            {reaction?.user?.firstName} {reaction?.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "poppins" }}>
                            {reaction?.type || "Like"}
                          </Typography>
                        </Box>
                        {animation ? <Lottie animationData={animation} loop autoPlay style={{ height: "3rem", width: "3rem" }} /> : <ThumbUpAlt sx={{ color: "gray", fontSize: "2rem" }} />}
                      </ListItemButton>
                    );
                  })}
                </List>
              ) : (
                <Typography align="center" sx={{ mt: 2 }}>
                  No reactions yet.
                </Typography>
              )}

              {hasNextPage && (
                <Button onClick={fetchNextPage} disabled={isFetchingNextPage} sx={{ mt: 2, alignSelf: "center" }}>
                  {isFetchingNextPage ? "Loading more..." : "Load More"}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReactionViewModal;
