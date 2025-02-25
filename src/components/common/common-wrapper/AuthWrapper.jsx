import { Box, Paper, Stack } from "@mui/material";
import { motion } from "motion/react";
import { primaryCompanyLogo } from "../../../assets";
const AuthWrapper = ({ children }) => {
  return (
    <Stack height={"100vh"} width={"100vw"} justifyContent={"center"} alignItems={"center"}>
      <motion.div initial={{ height: "auto" }} animate={{ height: "auto" }} transition={{ duration: 0.3 }}>
        <Stack width={"60rem"} flexDirection={"row"} borderRadius={1} overflow={"hidden"} bgcolor={"#fff"} component={Paper} elevation={2}>
          <Stack flex={1} justifyContent={"center"} alignItems={"center"} overflow={"hidden"} bgcolor={"#000"} sx={{ borderTopRightRadius: "6rem", borderBottomRightRadius: "3rem" }}>
            <Box component={"img"} src={primaryCompanyLogo} width={"65%"}></Box>
          </Stack>
          <Stack flex={1}>{children}</Stack>
        </Stack>
      </motion.div>
    </Stack>
  );
};
export default AuthWrapper;
