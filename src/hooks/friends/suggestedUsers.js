import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useUserProfile } from "../userProfile/userProfile";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import axiosInstance from "../../configs/axiosInstance";
import { useCreateNotification } from "../notification/notification";

// ✅ API Calls
const sendFriendRequestApi = async (recipientId) => {
  const response = await axiosInstance.post("/friend/send-request", { recipientId });
  return response.data;
};

const cancelFriendRequestApi = async (recipientId) => {
  const response = await axiosInstance.delete(`/friend/cancel-request/${recipientId}`);
  return response.data;
};
// apiRequests/friend.js

const getSuggestedUsersApi = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get(`/friend/suggested-users?page=${pageParam}&limit=10`);
  console.log(response.data);
  return response.data;
};

// ✅ Cancel Friend Request Hook
export const useCancelFriendRequest = () => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelFriendRequestApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Canceling friend request...", type: "info", loading: true }));
      dispatch(setLoading(true));
    },
    onSuccess: (data, recipientId) => {
      const { friendRequest } = data;
      const requester = friendRequest.requester;
      const recipient = friendRequest.recipient;
      socket.emit("friend-request-cancelled", {
        targetUserId: recipientId,
        requesterProfile: requester,
      });
      dispatch(showAlert({ message: "Friend request canceled!", type: "success", loading: false }));

      // Update "suggestedUsers": mark recipient as available (status "none")
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            suggestedUsers: page.suggestedUsers.map((user) => (user._id === recipientId ? { ...user, status: "none" } : user)),
          })),
        };
      });

      // Update relationship cache
      queryClient.setQueryData(["relationship", recipientId], {
        message: "No relationship found",
        relationship: "none",
      });
    },
    onError: (err) => {
      console.log(err);
      dispatch(showAlert({ message: "Failed to cancel friend request.", type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// ✅ Send Friend Request Hook
export const useSendFriendRequest = () => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: sendFriendRequestApi,
    onMutate: () => {},
    onSuccess: (data, recipientId) => {
      const { friendRequest } = data;
      const requester = friendRequest.requester;
      socket.emit("friend-request-sent", {
        targetUserId: recipientId,
        requesterProfile: requester,
      });

      createNotification({
        referenceId: requester._id,
        type: "friend_request_sent",
        userId: recipientId,
        action: "Sent you a friend request!",
      });

      // Update the "suggestedUsers" cache: mark the recipient as having a pending request
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            suggestedUsers: page.suggestedUsers.map((user) =>
              user._id === recipientId
                ? { ...user, status: "pending" } // should be "pending"
                : user
            ),
          })),
        };
      });

      // Update relationship cache for the recipient
      queryClient.setQueryData(["relationship", recipientId], {
        message: "Friend request sent",
        relationship: "pending_sent",
      });
    },
    onError: (err) => {},
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// ✅ Get Suggested Users Hook
export const useGetSuggestedUsers = () => {
  return useInfiniteQuery({
    queryKey: ["suggestedUsers"],
    queryFn: getSuggestedUsersApi,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
  });
};
