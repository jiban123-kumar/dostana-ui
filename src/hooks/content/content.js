import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import axiosInstance from "../../configs/axiosInstance";
import { SocketContext } from "../../contextProvider/SocketProvider";

const createContentApi = async (data) => {
  const response = await axiosInstance.post("/content/create-content", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const deleteContentApi = async ({ contentId }) => {
  const response = await axiosInstance.delete(`/content/${contentId}`);
  return response.data;
};

const fetchContentsApi = async ({ pageParam = 1, userId = null }) => {
  const response = await axiosInstance.get("/content", {
    params: { page: pageParam, limit: 10, userId },
  });
  return response.data;
};

const fetchContentByIdApi = async (contentId) => {
  const response = await axiosInstance.get(`/content/${contentId}`);
  return response.data.content;
};

// Updated to accept pageParam for infinite scrolling
export const useCreateContent = ({ handleClose, type }) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContentApi,
    onMutate: () => {
      // Immediately close modal and show posting alert
      handleClose();
      dispatch(
        showAlert({
          message: `Creating ${type}...`,
          type: "info",
          loading: true,
        })
      );
    },
    onSuccess: (response) => {
      const newContent = response.content;

      dispatch(
        showAlert({
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} created and shared on your feed!`,

          type: "success",
          loading: false,
        })
      );
      socket.emit("contentCreation", { newContent });
    },
    onError: (error) => {
      let errorMessage = `Failed to create ${type}. Please try again.`;
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid data provided.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(
        showAlert({
          message: errorMessage,
          type: "error",
          loading: false,
        })
      );
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export const useDeleteContent = ({ type = "post" }) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContentApi,
    onMutate: () => {
      dispatch(
        showAlert({
          message: `Deleting ${type}...`,
          type: "info",
          loading: true,
        })
      );
    },
    onSuccess: async (_, contentId) => {
      // Update the infinite query cache optimistically:
      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.filter((c) => c._id !== contentId),
          })),
        };
      });
      dispatch(
        showAlert({
          message: `${type} deleted`,
          type: "success",
          loading: false,
        })
      );
      socket.emit("contentDeletion", { contentId });
    },
    onError: (error) => {
      let errorMessage = `Failed to delete ${type}. Please try again.`;
      if (error.response?.status === 404) {
        errorMessage = "Content not found.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(
        showAlert({
          message: errorMessage,
          type: "error",
          loading: false,
        })
      );
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Hook to fetch all content or user-specific content
export const useGetContents = (userId) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: userId ? ["contents", userId] : ["contents"],
    queryFn: ({ pageParam = 1 }) => fetchContentsApi({ pageParam, userId }),
    getNextPageParam: (lastPage) => lastPage.nextPage || null,
  });

  return {
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
  };
};

export const useGetContentById = ({ contentId }) => {
  return useQuery({
    queryKey: ["content", contentId], // Cache key includes contentId
    queryFn: () => fetchContentByIdApi(contentId),
    enabled: !!contentId, // Ensures the query only runs if contentId is provided
  });
};
