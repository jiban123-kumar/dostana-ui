/* eslint-disable react/prop-types */
import { Dialog } from "@mui/material";

import { useGetContentById } from "../../hooks/content/content";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import ContentCard from "./ContentCard";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const SingleContentModal = ({ contentId, open, handleClose }) => {
  const { data: content, isLoading: isFetchingContent } = useGetContentById({ contentId });
  console.log(content);
  const { data: userProfile } = useUserProfile();
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      {isFetchingContent ? <ContentCardSkeleton /> : content && <ContentCard content={content} userProfile={userProfile} />}
    </Dialog>
  );
};

export default SingleContentModal;
