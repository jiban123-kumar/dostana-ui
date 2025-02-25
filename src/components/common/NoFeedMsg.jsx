import { Button, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import React from "react";
import { noFeedAvailable } from "../../animation";
import { useNavigate } from "react-router-dom";

const NoFeedMsg = ({ btnTitle = "Explore", textMsg }) => {
  const navigate = useNavigate();
  return (
    <Stack alignItems={"center"} justifyContent={"center"} flex={1} sx={{ transform: "translateY(-5rem)" }}>
      <Lottie animationData={noFeedAvailable} style={{ height: "20rem", width: "20rem" }} />
      <Typography variant="body2" fontWeight={"bold"}>
        {textMsg}
      </Typography>
      <Button sx={{ paddingX: "2.4rem", fontSize: ".8rem", fontWeight: "bold", borderRadius: ".4rem", minWidth: "10rem", mt: "1rem" }} variant="contained" color="secondary" onClick={() => navigate("/home")}>
        {btnTitle}
      </Button>
    </Stack>
  );
};

export default NoFeedMsg;
