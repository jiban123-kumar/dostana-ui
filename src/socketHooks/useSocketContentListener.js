import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";

export const useSocketContentListener = (socket, userProfile) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Helper: Update paginated data by applying a transformation to every page.
  const updatePages = (oldData, transformPage) => {
    if (!oldData || !oldData.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map(transformPage),
    };
  };

  // Helper: Prepend an item to a given list key on the first page.
  const prependToFirstPage = (oldData, newItem, listKey) => {
    if (!oldData || !oldData.pages || !oldData.pages.length) return oldData;
    const firstPage = oldData.pages[0];
    const updatedFirstPage = {
      ...firstPage,
      [listKey]: [newItem, ...firstPage[listKey]],
    };
    return {
      ...oldData,
      pages: [updatedFirstPage, ...oldData.pages.slice(1)],
    };
  };

  // Helper: Update reaction details for a list of contents.
  const updateContentReactions = (contents, contentId, userId, isReacted, reaction) => {
    if (!contents) return contents;
    return contents.map((content) => {
      if (content._id !== contentId) return content;

      const newReactions = new Map(content.reactionDetails.reactions.map((r) => [r.user._id, r]));

      if (isReacted) {
        newReactions.set(userId, reaction);
      } else {
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

  const handleReaction = useCallback(
    async (socketData) => {
      // Skip if the reaction came from the current user.
      if (socketData.userId === userProfile?._id) return;

      const { contentId, targetUserId, data: reactionData } = socketData;
      const {
        reactionDetails: { isReacted, reaction, userId },
      } = reactionData;

      const updateDataForKey = (queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return updatePages(oldData, (page) => ({
            ...page,
            contents: updateContentReactions(page.contents, contentId, userId, isReacted, reaction),
          }));
        });
      };

      // Update all queries that might contain the content.
      [["contents"], ["contents", targetUserId], ["shared-contents"], ["saved-contents"]].forEach((queryKey) => updateDataForKey(queryKey));
    },
    [queryClient, userProfile]
  );

  const handleContentShare = useCallback(
    async (data) => {
      const { requesterProfile, sharedContent } = data;
      queryClient.setQueryData(["shared-contents"], (oldData) => prependToFirstPage(oldData, sharedContent, "contents"));

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
      const userId = newContent?.user?._id;

      // Prepend to general contents list.
      queryClient.setQueryData(["contents"], (oldData) => prependToFirstPage(oldData, newContent, "contents"));

      // Prepend to the user-specific contents list.
      queryClient.setQueryData(["contents", userId], (oldData) => prependToFirstPage(oldData, newContent, "contents"));
    },
    [queryClient]
  );

  const handleContentDeletion = useCallback(
    (data) => {
      const { contentId, contentOwnerId } = data;
      const removeContentFromPage = (page) => ({
        ...page,
        contents: page.contents.filter((c) => c._id !== contentId),
      });

      queryClient.setQueryData(["contents"], (oldData) => updatePages(oldData, removeContentFromPage));
      queryClient.setQueryData(["contents", contentOwnerId], (oldData) => updatePages(oldData, removeContentFromPage));
    },
    [queryClient]
  );

  const handleNewComment = useCallback(
    (data) => {
      const { contentId, newComment } = data;
      queryClient.setQueryData(["content-comments", contentId], (oldData) => prependToFirstPage(oldData, newComment, "comments"));
    },
    [queryClient]
  );

  const handleContentCommentDeletion = useCallback(
    (data) => {
      const { commentId } = data;
      queryClient.setQueryData(["content-comments", commentId], (oldData) => {
        if (!oldData) return oldData;
        return updatePages(oldData, (page) => ({
          ...page,
          comments: page.comments.filter((c) => c._id !== commentId),
        }));
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
