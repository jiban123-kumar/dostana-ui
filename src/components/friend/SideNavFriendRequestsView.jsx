import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, Badge, Button, List, ListItemAvatar, ListItemButton, Stack, Typography, Skeleton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useGetFriendRequests, useFriendRequestCount } from "../../hooks/friends/friendRequests";

const SideNavFriendRequestsView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetFriendRequests();
  const { data: friendRequestCount } = useFriendRequestCount();

  const observerRef = useRef();

  const lastRequestRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const friendRequests = data?.pages.flatMap((page) => page.friendRequests) || [];

  return (
    <Stack ref={containerRef} alignItems="flex-start" mt={2}>
      {/* Toggle Button with Badge */}
      <Badge badgeContent={friendRequestCount} color="error" invisible={!friendRequestCount || friendRequestCount < 1} max={99}>
        <Button
          endIcon={
            <motion.div animate={{ rotate: isOpen ? 90 : 0, display: "flex", justifyContent: "center", alignItems: "center" }} transition={{ duration: 0.2 }}>
              <ArrowRight />
            </motion.div>
          }
          onClick={() => setIsOpen((prev) => !prev)}
          sx={{ textTransform: "none", fontWeight: "bold", color: "#000000a6", p: "1rem", px: "2rem" }}
        >
          Friend Requests
        </Button>
      </Badge>

      {/* Friend Requests List */}
      <motion.div animate={{ height: isOpen ? "auto" : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} style={{ overflow: "hidden", width: "100%" }}>
        {isOpen && (
          <Stack ml="1.6rem" sx={{ maxHeight: "50vh", overflowY: "auto" }}>
            <List disablePadding>
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <ListItemButton key={index}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <Skeleton variant="text" width={120} height={20} />
                  </ListItemButton>
                ))
              ) : friendRequests.length > 0 ? (
                friendRequests.map((user, index) => (
                  <ListItemButton key={user._id} sx={{ borderRadius: "8px" }} onClick={() => navigate(`/user-profile/${user._id}`)} ref={index === friendRequests.length - 1 ? lastRequestRef : null}>
                    <ListItemAvatar>
                      <Avatar src={user.profileImage} sx={{ boxShadow: 3 }} />
                    </ListItemAvatar>
                    <Typography variant="body2" fontWeight="bold" color="#000000a6">
                      {user.firstName} {user.lastName}
                    </Typography>
                  </ListItemButton>
                ))
              ) : (
                <Stack alignItems="center" py={2}>
                  <Typography variant="body2" color="textSecondary">
                    No friend requests yet.
                  </Typography>
                  <Button variant="contained" size="small" sx={{ mt: 1, textTransform: "none" }} onClick={() => navigate("/add-friend")}>
                    Start adding friends
                  </Button>
                </Stack>
              )}
            </List>

            {/* Loading Spinner for Pagination */}
            {isFetchingNextPage && (
              <Stack alignItems="center" py={2}>
                <CircularProgress size={24} />
              </Stack>
            )}

            {/* See All Button */}
            {friendRequests.length > 0 && (
              <Button sx={{ textTransform: "none", alignSelf: "flex-end", fontWeight: "bold", position: "sticky", bottom: 0, backgroundColor: "#ffffff" }} onClick={() => navigate("/friend-requests")}>
                See all
              </Button>
            )}
          </Stack>
        )}
      </motion.div>
    </Stack>
  );
};

export default SideNavFriendRequestsView;
