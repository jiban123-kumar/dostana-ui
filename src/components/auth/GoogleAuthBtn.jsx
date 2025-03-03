import React from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Button, Box } from "@mui/material";
import { googleIcon } from "../../assets"; // ensure your path is correct
import axiosInstance from "../../configs/axiosInstance";

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
  const handleSuccess = (credentialResponse) => {
    // credentialResponse.credential contains the Google token.
    console.log("Google login success", credentialResponse);

    // Use Axios to send the token to your backend endpoint for verification and JWT generation.
    axiosInstance
      .post("/auth/google/token", { token: credentialResponse.credential })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          // Handle successful login (e.g., redirect, update state, etc.)
          console.log("Logged in successfully!");
        } else {
          console.error("Authentication failed:", data.message);
        }
      })
      .catch((err) => {
        console.error("Error during authentication:", err);
      });
  };

  const handleError = () => {
    console.error("Google login error");
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      // Use render prop to show your custom button design.
      render={(renderProps) => <CustomGoogleButton onClick={renderProps.onClick} disabled={renderProps.disabled} />}
    />
  );
};

export default GoogleAuthButton;
