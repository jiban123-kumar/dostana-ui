import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Badge from "@mui/material/Badge";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import Person2Icon from "@mui/icons-material/Person2";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import { useGetTotalUnreadMessages } from "../../../hooks/chat/message";

// Import the custom hook that fetches the total unread messages count.

const menuItems = [
  { label: "Home", icon: <HomeRoundedIcon />, path: "/home" },
  { label: "Profile", icon: <Person2Icon />, path: "/profile" },
  { label: "Friends", icon: <GroupRoundedIcon />, path: "/friends" },
  { label: "Chats", icon: <ChatRoundedIcon />, path: "/chats" },
  { label: "Shared Post", icon: <ShareIcon />, path: "/shared-feed" },
  { label: "Saved Feed", icon: <BookmarkRoundedIcon />, path: "/saved-feed" },
];

const TopNavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the unread messages count.
  const { data: totalUnreadMessages } = useGetTotalUnreadMessages();

  const handleChange = (event, newValue) => {
    navigate(menuItems[newValue].path);
  };

  const activeIndex = menuItems.findIndex((item) => location.pathname.startsWith(item.path));

  return (
    <Box sx={{ width: 500, margin: 0 }}>
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={handleChange}
        sx={{ overflow: "hidden" }} // Ensure the menu fits in the container
      >
        {menuItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            // For the "Chats" menu item, wrap the icon in a Badge
            icon={
              item.label === "Chats" ? (
                <Badge badgeContent={totalUnreadMessages > 0 ? totalUnreadMessages : null} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              width: 80, // Set a consistent width for each menu item
              whiteSpace: "nowrap", // Prevent text wrapping
              overflow: "hidden", // Prevent text overflow
              textOverflow: "ellipsis", // Show ellipsis for overflow text
              color: activeIndex === index ? "primary.main" : "text.secondary",
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default TopNavMenu;
