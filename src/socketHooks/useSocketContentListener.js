import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";

export const useSocketContentListener = (socket, userProfile) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const handleReaction = useCallback(
    async (socketData) => {
      // If the reaction comes from the current user, skip updating.
      if (socketData.userId === userProfile?._id) return;

      // Destructure the expected fields from the socket event.
      // We assume the emitted object contains: contentId, targetUserId, and data (the reaction data).
      const { contentId, targetUserId, data: reactionData } = socketData;
      const {
        reactionDetails: { isReacted, reaction, reactionDetails, userId },
      } = reactionData;

      // Define a helper that updates the reactions in an array of content objects.
      const updateContentReactions = (contents) => {
        if (!contents) return contents;
        return contents.map((content) => {
          // Only update if this is the matching content.
          if (content._id !== contentId) return content;

          // Create a Map of existing reactions, keyed by the reacting user's id.
          const newReactions = new Map(content.reactionDetails.reactions.map((r) => [r.user._id, r]));

          if (isReacted) {
            // Add or update the reaction detail.
            newReactions.set(userId, reaction);
          } else {
            // Remove the reaction detail.
            newReactions.delete(userId);
          }

          return {
            ...content,
            reactionDetails: {
              totalReactions: newReactions.size,
              reactions: Array.from(newReactions.values()),
            },
          };
        });
      };

      // Update various queries that may contain this content.
      const updateData = (queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              contents: updateContentReactions(page.contents),
            })),
          };
        });
      };

      updateData(["contents"]);
      updateData(["contents", targetUserId]);
      updateData(["shared-contents"]);
      updateData(["saved-contents"]);

      // Also update the individual content query (if it exists).

      // Optionally, if you maintain a separate "reactions" query:
      // queryClient.setQueryData(["reactions", contentId], (oldData) => { ... });

      // If this reaction is not an un-reaction, trigger notifications.
    },
    [queryClient, userProfile]
  );

  const handleContentShare = useCallback(
    async (data) => {
      const { requesterProfile, sharedContent } = data;
      queryClient.setQueryData(["shared-contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, contents: [sharedContent, ...page.contents] };
            }
            return page;
          }),
        };
      });

      dispatch(
        showNotistackAlert({
          message: "Shared a content with you",
          avatarSrc: requesterProfile.profileImage,
          notificationType: "content-share",
          senderName: `${requesterProfile.firstName} ${requesterProfile.lastName}`,
        })
      );
    },
    [dispatch, queryClient]
  );

  const handleContentCreation = useCallback(
    (data) => {
      const { newContent } = data;
      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        // Prevent duplicates by prepending to the first page.
        const firstPage = oldData.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          contents: [newContent, ...firstPage.contents],
        };
        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };
      });
    },
    [queryClient]
  );

  const handleContentDeletion = useCallback(
    (data) => {
      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          contents: firstPage.contents.filter((item) => item._id !== data.contentId),
        };
        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };
      });
    },
    [queryClient]
  );

  const handleNewComment = useCallback(
    (data) => {
      const { contentId, newComment } = data;
      queryClient.setQueryData(["content-comments", contentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, comments: [newComment, ...page.comments] };
            }
            return page;
          }),
        };
      });
    },
    [queryClient]
  );
  const handleContentCommentDeletion = useCallback(
    (data) => {
      const { commentId } = data;
      queryClient.setQueryData(["content-comments", commentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.filter((c) => c._id !== commentId),
          })),
        };
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("contentReaction", handleReaction);
    socket.on("contentShare", handleContentShare);
    socket.on("contentCreation", handleContentCreation);
    socket.on("contentDeletion", handleContentDeletion);
    socket.on("contentNewComment", handleNewComment);
    socket.on("contentCommentDeletion", handleContentCommentDeletion);

    return () => {
      socket.off("contentReaction", handleReaction);
      socket.off("contentShare", handleContentShare);
      socket.off("contentCreation", handleContentCreation);
      socket.off("contentDeletion", handleContentDeletion);
      socket.off("contentNewComment", handleNewComment);
      socket.off("contentCommentDeletion", handleContentCommentDeletion);
    };
  }, [socket, handleReaction, handleContentShare, handleContentCreation, handleContentDeletion, handleNewComment, handleContentCommentDeletion]);
};
