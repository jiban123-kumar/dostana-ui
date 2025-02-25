import { Box, Button, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { welcomeBanner } from "../../animation";
import { secondaryCompanyLogo } from "../../assets";

const ProfileCreationBanner = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoizing the animation to prevent re-renders
  const animationOptions = useMemo(
    () => ({
      animationData: welcomeBanner,
      loop: true,
    }),
    []
  );

  // Preload animation
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoaded(true), 100); // Adjust delay if needed
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Stack height="100vh" width="100vw" justifyContent="center" alignItems="center">
      <Stack
        sx={{
          position: "relative",
          width: "40rem",
          height: "40rem",
          textAlign: "center",
        }}
        alignItems="center"
        justifyContent="center"
      >
        {isLoaded && <Lottie {...animationOptions} style={{ height: "50%", width: "50%" }} />}

        <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={2} mt={2}>
          <Typography variant="h4">Welcome To</Typography>
          <Box component="img" src={secondaryCompanyLogo} width="10rem" />
        </Stack>

        <Button
          sx={{
            paddingX: "2.4rem",
            fontSize: ".8rem",
            marginTop: "2rem",
            fontWeight: "bold",
            borderRadius: ".4rem",
          }}
          variant="contained"
          color="secondary"
          onClick={() => navigate("/profile-setup")}
        >
          Create Your Profile
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProfileCreationBanner;
