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
          textAlign: "center",
          height: "100%",
          width: "100%",
        }}
        alignItems="center"
        justifyContent="center"
      >
        {isLoaded && <Lottie {...animationOptions} style={{ height: "60%", width: "60%" }} />}
        <Stack sx={{ transform: "translateY(-5rem)" }}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={2}>
            <Typography variant="h4" sx={{ fontSize: { md: "2rem", xs: "1.2rem", sm: "1.5rem" } }}>
              Welcome To
            </Typography>
            <Box component="img" src={secondaryCompanyLogo} sx={{ width: { md: "10rem", xs: "6rem", sm: "8rem", transform: "translateX(-.7rem)" } }} />
          </Stack>

          <Button
            sx={{
              fontSize: ".8rem",
              marginTop: "2rem",
              fontWeight: "bold",
              borderRadius: ".4rem",
              alignSelf: "center",
              wordBreak: "keep-all",
              whiteSpace: "nowrap",
              minWidth: { md: "15rem", xs: "12rem" },
            }}
            variant="contained"
            color="secondary"
            onClick={() => navigate("/profile-setup")}
          >
            Create Your Profile
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfileCreationBanner;
