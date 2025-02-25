import { Box, Stack } from "@mui/material";
import TopNavLogo from "./TopNavLogo";
import NotificationIconButton from "../../../features/notification/NotificationIconButton";
import AccountIconButton from "../../../features/account/AccountIconButton";
import TopNavMenu from "./TopNavMenu";

const TopNav = () => {
  return (
    <Box sx={{ boxShadow: 3, zIndex: 1000 }} component="header">
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" paddingX="2rem" paddingY=".4rem">
        <TopNavLogo />
        <TopNavMenu />
        <Stack component="nav" flexDirection="row" alignItems="center" gap={3}>
          <NotificationIconButton />
          <AccountIconButton />
        </Stack>
      </Stack>
    </Box>
  );
};

export default TopNav;
