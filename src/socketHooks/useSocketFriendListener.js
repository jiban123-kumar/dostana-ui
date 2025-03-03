import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useSocketFriendListener = (socket) => {
  const queryClient = useQueryClient();

  const handleReceiveFriendRequest = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Invalidate caches to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["relationship", requester._id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["friendRequestCount"], exact: true });
    },
    [queryClient]
  );

  const handleFriendRequestAccepted = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Invalidate caches to reflect accepted friend request
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["friends"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["relationship", requester._id], exact: true });
    },
    [queryClient]
  );

  const handleFriendRequestCanceled = useCallback(
    (data) => {
      const requester = data.requesterProfile;
      console.log(data.requesterProfile);

      // Invalidate caches to update friend request cancellation
      queryClient.invalidateQueries({ queryKey: ["friendRequestCount"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["relationship", requester._id], exact: true });
    },
    [queryClient]
  );

  const handleFriendRemoved = useCallback(
    (data) => {
      const removedFriend = data.requesterProfile;

      // Invalidate caches to reflect removal of a friend
      queryClient.invalidateQueries({ queryKey: ["friends"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["relationship", removedFriend._id], exact: true });
    },
    [queryClient]
  );

  const handleFriendRequestDeclined = useCallback(
    (data) => {
      const requester = data.requesterProfile;

      // Invalidate caches to update friend request decline status
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["relationship", requester._id], exact: true });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("friend-request-received", handleReceiveFriendRequest);
    socket.on("friend-request-cancelled", handleFriendRequestCanceled);
    socket.on("friend-request-accepted", handleFriendRequestAccepted);
    socket.on("friend-request-declined", handleFriendRequestDeclined);
    socket.on("friend-removed", handleFriendRemoved);

    return () => {
      socket.off("friend-request-received", handleReceiveFriendRequest);
      socket.off("friend-request-cancelled", handleFriendRequestCanceled);
      socket.off("friend-request-accepted", handleFriendRequestAccepted);
      socket.off("friend-request-declined", handleFriendRequestDeclined);
      socket.off("friend-removed", handleFriendRemoved);
    };
  }, [socket, handleReceiveFriendRequest, handleFriendRequestAccepted, handleFriendRequestDeclined, handleFriendRequestCanceled, handleFriendRemoved]);
};
