import { useEffect, useState } from "react";
import { Box, Paper, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import ProfileImageStep from "./ProfileImageStep"; // Refactored component
import ProfileDetailsStep from "./ProfileDetailsStep"; // Refactored component
import ProfileAdditionalDetailsStep from "./ProfileAdditionalDetailsStep"; // Refactored component
import { updateProfileDetails } from "../../reduxSlices/profileSlice";
import { useNavigate } from "react-router-dom";
import { Loading } from "../common/Loading";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const ProfileSetupForm = () => {
  const navigate = useNavigate();
  const currentStep = useSelector((state) => state.profile.currentStep);

  const { data: userProfile, isLoading: isProfileFetching, isFetched: isProfileFetched } = useUserProfile();

  const dispatch = useDispatch();

  // State to manage profile and cover images
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // State to control rendering readiness
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    if (isProfileFetched) {
      if (userProfile?.isProfileComplete) {
        navigate("/home");
        return;
      }
      if (userProfile?.isGoogleAccount) {
        const body = {
          firstName: userProfile?.firstName,
          lastName: userProfile?.lastName,
        };
        dispatch(updateProfileDetails(body));
      }
      // Mark the form as ready for rendering
      setIsReadyToRender(true);
    }
  }, [dispatch, isProfileFetched, navigate, userProfile]);

  // Handle loading state
  if (isProfileFetching || !isReadyToRender) {
    return <Loading />;
  }

  // Function to map current step to the appropriate form
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ProfileImageStep updateCoverImage={setCoverImage} updateProfileImage={setProfileImage} coverImage={coverImage} profileImage={profileImage} />;
      case 1:
        return <ProfileDetailsStep />;
      case 2:
        return <ProfileAdditionalDetailsStep coverImage={coverImage} profileImage={profileImage} />;
      default:
        return null;
    }
  };

  return (
    <Stack height="100vh" width="100vw" justifyContent="center" alignItems="center">
      <Stack component={Paper} width="34rem" elevation={10} borderRadius={2}>
        <Stack paddingY={2}>
          <Box component="img" src="/secondaryCompanyLogo.png" alt="Company Logo" sx={{ width: "15rem", marginX: "auto" }} />
          <Stack
            paddingX="2rem"
            overflow="auto"
            maxHeight="50vh"
            spacing={2}
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {renderStepContent(currentStep)}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfileSetupForm;
