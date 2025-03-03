import React from "react";
import axiosInstance from "../../configs/axiosInstance";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const GoogleAuthButton = () => {
  const navigate = useNavigate();

  const onSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    axiosInstance
      .post("/auth/google/token", { token: credentialResponse.credential })
      .then((res) => {
        if (res.data.success) {
          console.log("Logged in successfully!");
          navigate("/home");
        }
      })
      .catch((err) => console.error("Authentication error:", err));
  };

  return <GoogleLogin onSuccess={onSuccess} onError={() => console.error("Google login failed")} />;
};

export default GoogleAuthButton;
