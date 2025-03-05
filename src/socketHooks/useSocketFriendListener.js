import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";

export const useSocketFriendListener = (socket) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const handleReceiveFriendRequest = useCallback(
    (data) => {
      const requester = data.requesterProfile;
      console.log(data.requesterProfile);

      // Remove requester from suggestedUsers cache
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            suggestedUsers: page.suggestedUsers.filter((user) => user._id !== requester._id),
          })),
        };
      });

      // Update or insert the requester in friendRequests cache
      queryClient.setQueryData(["friendRequests"], (oldData) => {
        if (!oldData) return oldData;
        let found = false;
        const updatedPages = oldData.pages.map((page) => {
          const index = page.friendRequests.findIndex((req) => req._id === requester._id);
          if (index !== -1) {
            // Update the existing request with the new data
            const newFriendRequests = [...page.friendRequests];
            newFriendRequests[index] = requester;
            found = true;
            return { ...page, friendRequests: newFriendRequests };
          }
          return page;
        });
        // If not found in any page, prepend to the first page
        if (!found && updatedPages[0]) {
          updatedPages[0] = {
            ...updatedPages[0],
            friendRequests: [requester, ...updatedPages[0].friendRequests],
          };
        }
        return { ...oldData, pages: updatedPages };
      });

      // Update the relationship cache for the requester
      queryClient.setQueryData(["relationship", requester._id], {
        message: "Friend request received",
        relationship: "pending_received",
      });

      // Update friendRequestCount directly
      queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? oldCount + 1 : oldCount));
    },
    [queryClient]
  );

  const handleFriendRequestAccepted = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Remove from suggestedUsers
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            suggestedUsers: page.suggestedUsers.filter((user) => user._id !== requester._id),
          })),
        };
      });

      // Remove from friendRequests
      queryClient.setQueryData(["friendRequests"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friendRequests: page.friendRequests.filter((req) => req._id !== requester._id),
          })),
        };
      });

      // Add to friends cache (prepend to the first page)
      queryClient.setQueryData(["friends"], (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        return {
          ...oldData,
          pages: [{ ...firstPage, friends: [requester, ...firstPage.friends] }, ...oldData.pages.slice(1)],
        };
      });

      // Update relationship cache for the requester
      queryClient.setQueryData(["relationship", requester._id], {
        message: "Users are friends",
        relationship: "friends",
      });
    },
    [queryClient]
  );

  const handleFriendRequestCancelled = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Decrease friendRequestCount
      queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? Math.max(oldCount - 1, 0) : oldCount));

      // Remove from friendRequests cache
      queryClient.setQueryData(["friendRequests"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friendRequests: page.friendRequests.filter((req) => req._id !== requester._id),
          })),
        };
      });

      // Add back to suggestedUsers with status "none"
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              suggestedUsers: [{ ...requester, status: "none" }, ...firstPage.suggestedUsers.filter((user) => user._id !== requester._id)],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      // Update relationship to "none"
      queryClient.setQueryData(["relationship", requester._id], {
        message: "No relationship found",
        relationship: "none",
      });
    },
    [queryClient]
  );

  const handleFriendRemoved = useCallback(
    (data) => {
      const removedFriend = data.requesterProfile;

      // Remove the friend from the friends cache
      queryClient.setQueryData(["friends"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friends: page.friends.filter((friend) => friend._id !== removedFriend._id),
          })),
        };
      });

      // Add the removed friend back into suggestedUsers with status "none"
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              suggestedUsers: [{ ...removedFriend, status: "none" }, ...firstPage.suggestedUsers.filter((user) => user._id !== removedFriend._id)],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      // Update relationship cache for the removed friend
      queryClient.setQueryData(["relationship", removedFriend._id], {
        message: "No relationship found",
        relationship: "none",
      });
    },
    [queryClient]
  );

  const handleFriendRequestDeclined = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Update suggestedUsers: set status to "none" for the requester
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            suggestedUsers: page.suggestedUsers.map((user) => (user._id === requester._id ? { ...user, status: "none" } : user)),
          })),
        };
      });

      // Update relationship cache for the requester
      queryClient.setQueryData(["relationship", requester._id], {
        message: "No relationship found",
        relationship: "none",
      });
    },
    [queryClient]
  );

  // Register socket event listeners and cleanup on unmount
  useEffect(() => {
    if (!socket) return;
    socket.on("friend-request-received", handleReceiveFriendRequest);
    socket.on("friend-request-accepted", handleFriendRequestAccepted);
    socket.on("friend-request-cancelled", handleFriendRequestCancelled);
    socket.on("friend-removed", handleFriendRemoved);
    socket.on("friend-request-declined", handleFriendRequestDeclined);

    return () => {
      socket.off("friend-request-received", handleReceiveFriendRequest);
      socket.off("friend-request-accepted", handleFriendRequestAccepted);
      socket.off("friend-request-cancelled", handleFriendRequestCancelled);
      socket.off("friend-removed", handleFriendRemoved);
      socket.off("friend-request-declined", handleFriendRequestDeclined);
    };
  }, [socket, handleReceiveFriendRequest, handleFriendRequestAccepted, handleFriendRequestCancelled, handleFriendRemoved, handleFriendRequestDeclined]);
};
