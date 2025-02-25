/* eslint-disable react/prop-types */
import Lottie from "lottie-react";
import React from "react";
import { reactedAnimation } from "../animation";
import { Stack } from "@mui/material";

const Reacted = ({ onAnimationEnd }) => {
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        position: "absolute",
        zIndex: 1600,
        pointerEvents: "none",
      }}
    >
      <Lottie
        animationData={reactedAnimation}
        loop={false}
        style={{ height: "100%", width: "100%" }}
        onComplete={onAnimationEnd} // Call this function when the animation ends
      />
    </Stack>
  );
};

export default Reacted;
