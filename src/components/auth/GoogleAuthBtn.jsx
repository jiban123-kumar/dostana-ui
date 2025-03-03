import React from "react";
import axiosInstance from "../../configs/axiosInstance";
import { Button, Box } from "@mui/material";
import { googleIcon } from "../../assets"; // ensure your path is correct
import { useGoogleLogin } from "@react-oauth/google";

const CustomGoogleButton = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      fullWidth
      sx={{
        padding: ".6rem",
        fontWeight: 500,
        color: "#000000b0",
        marginTop: ".6rem",
      }}
      startIcon={<Box component="img" src={googleIcon} sx={{ width: "1.4rem" }} />}
      onClick={onClick}
      disabled={disabled}
    >
      Continue with Google
    </Button>
  );
};

const GoogleAuthButton = () => {
  const login = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log("Google login success", credentialResponse);
      // Send the token to your backend endpoint for verification and JWT generation.
      axiosInstance
        .post("/auth/google/token", { token: credentialResponse.credential })
        .then((res) => {
          const data = res.data;
          if (data.success) {
            console.log("Logged in successfully!");
            // Handle redirection or state update here
          } else {
            console.error("Authentication failed:", data.message);
          }
        })
        .catch((err) => {
          console.error("Error during authentication:", err);
        });
    },
    onError: () => {
      console.error("Google login error");
    },
  });

  return <CustomGoogleButton onClick={login} disabled={false} />;
};

export default GoogleAuthButton;
