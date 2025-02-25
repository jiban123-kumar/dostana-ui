import { useRef, useEffect, useState } from "react";
import { ArrowRightAlt, CloudUpload } from "@mui/icons-material";
import { Avatar, Badge, Button, Divider, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentStep } from "../../reduxSlices/profileSlice";
const HiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

// eslint-disable-next-line react/prop-types
const ProfileImageStep = ({ coverImage, profileImage, updateCoverImage, updateProfileImage }) => {
  const dispatch = useDispatch();

  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleNext = () => {
    dispatch(updateCurrentStep(1));
  };

  const getPreviewUrl = (file, fallback) => (file ? URL.createObjectURL(file) : fallback);

  useEffect(() => {
    return () => {
      if (profileImage) URL.revokeObjectURL(profileImage);
      if (coverImage) URL.revokeObjectURL(coverImage);
    };
  }, [profileImage, coverImage]);

  // Show Google profile picture if available
  return (
    <Stack gap={2}>
      {/* Profile Picture Section */}
      <Stack paddingY={1} spacing={1}>
        <Typography variant="h4" className="profileHeader">
          Profile Picture
        </Typography>
        <Stack alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <IconButton
                sx={{
                  width: "2.2rem",
                  height: "2.2rem",
                  bgcolor: "#fff",
                  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
                  "&:hover": { bgcolor: "#fff" },
                }}
                onClick={() => profileImageRef.current.click()}
              >
                <AddIcon />
                <HiddenInput type="file" ref={profileImageRef} onChange={handleFileChange(updateProfileImage)} accept="image/*" />
              </IconButton>
            }
          >
            <Avatar src={getPreviewUrl(profileImage) || ""} sx={{ width: "12rem", height: "12rem" }} />
          </Badge>
        </Stack>
      </Stack>

      <Divider sx={{ paddingY: ".2rem" }} />

      {/* Cover Picture Section */}
      <Stack spacing={1} paddingY={1}>
        <Typography variant="h4" className="profileHeader">
          Cover Picture
        </Typography>
        <Stack alignItems="center">
          <Stack position="relative" width={"90%"}>
            {getPreviewUrl(coverImage, null) ? <img src={getPreviewUrl(coverImage, null)} alt="Cover Preview" style={{ width: "100%", height: "14rem", objectFit: "cover" }} /> : <Skeleton variant="rounded" width="100%" height="14rem" animation="wave" />}

            <Tooltip title="Upload">
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: ".6rem",
                  right: ".6rem",
                  fontSize: ".8rem",
                  fontWeight: 600,
                }}
                onClick={() => coverImageRef.current.click()}
              >
                <CloudUpload />
                <HiddenInput type="file" ref={coverImageRef} onChange={handleFileChange(updateCoverImage)} accept="image/*" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Stack flexDirection="row" justifyContent="center" alignItems="center" paddingY={2} gap={2}>
        <Button variant="outlined" fullWidth sx={{ fontWeight: 600 }} size="large" onClick={() => dispatch(updateCurrentStep(1))}>
          Skip for Now
        </Button>
        <Button variant="contained" endIcon={<ArrowRightAlt />} fullWidth sx={{ fontWeight: 600 }} size="large" onClick={handleNext}>
          Next
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProfileImageStep;
