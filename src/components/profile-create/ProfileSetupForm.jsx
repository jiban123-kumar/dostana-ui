import { useState /* useEffect */ } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import ProfileImageStep from "./ProfileImageStep";
import ProfileDetailsStep from "./ProfileDetailsStep";
import ProfileAdditionalDetailsStep from "./ProfileAdditionalDetailsStep";
import secondaryCompanyLogo from "../../assets/secondaryCompanyLogo.png";
// Uncomment the lines below if you wish to enable profile fetching logic
// import { updateProfileDetails } from "../../reduxSlices/profileSlice";
// import { useNavigate } from "react-router-dom";
// import { Loading } from "../common/Loading";
// import { useUserProfile } from "../../hooks/userProfile/userProfile";

const ProfileSetupForm = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.profile.currentStep);

  // Uncomment the following lines to enable profile fetching logic
  /*
  const navigate = useNavigate();
  const { data: userProfile, isLoading: isProfileFetching, isFetched: isProfileFetched } = useUserProfile();
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

  if (isProfileFetching || !isReadyToRender) {
    return <Loading />;
  }
  */

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

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
    <Dialog
      open={true}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          maxHeight: "70vh",
          borderRadius: "1rem",
        },
      }}
    >
      <DialogContent dividers>
        {/* Logo */}
        <div style={{ textAlign: "center", paddingBottom: ".6rem" }}>
          <img src={secondaryCompanyLogo} alt="Logo" style={{ width: "160px" }} />
        </div>
        {renderStepContent(currentStep)}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupForm;
