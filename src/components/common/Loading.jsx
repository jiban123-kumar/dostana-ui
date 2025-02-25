import React from "react";
import Lottie from "lottie-react";
import { Backdrop, Stack } from "@mui/material";
import { loadingHandAnimation } from "../../animation";

export const Loading = () => {
  return (
    <Stack alignItems={"center"} justifyContent={"center"} height={"100%"} width={"100%"} component={Backdrop} open={true} bgcolor={"#fff"}>
      <Lottie animationData={loadingHandAnimation} style={{ height: "50%", width: "50%" }} loop={true} autoPlay={true} />
    </Stack>
  );
};
