import { Backdrop, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { offlineAnimation } from "../../animation";
import { useEffect, useState } from "react";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => {
      setIsOnline(true);
    });
    window.addEventListener("offline", () => {
      setIsOnline(false);
    });
  }, []);
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: 1301, backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Adjust opacity as needed
      open={isOnline}
    >
      <Stack justifyContent={"center"} alignItems={"center"} sx={{ height: { xs: "60%", sm: "50%", md: "34%" }, width: { xs: "60%", sm: "50%", md: "30%" } }}>
        <Lottie animationData={offlineAnimation} loop autoPlay height={"100%"} width={"100%"} />
        <Typography variant="h6" sx={{ transform: "translateY(-3rem)", fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" } }}>
          No Internet Connection
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default OfflineIndicator;
