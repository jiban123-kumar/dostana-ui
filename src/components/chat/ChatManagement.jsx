/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { List, ListItem, Stack, TextField, InputAdornment, IconButton, Typography, Box, Paper, Button, Skeleton } from "@mui/material";
import { SearchRounded } from "@mui/icons-material";
import ChatListView from "./ChatListView";
import Lottie from "lottie-react";
import { chatSecondaryAnimation } from "../../animation";
import ChatIcon from "@mui/icons-material/Chat";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useGetAllChats } from "../../hooks/chat/chat";

const ChatManagement = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("normal");

  // Use the infinite query hook
  const { data: chats, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAllChats();

  // Combine all pages of chats into a single array
  const allChats = chats?.pages.flatMap((page) => page.chats) || [];
  console.log(allChats);

  // Filter chats based on active tab: "normal" shows non-archived, "archived" shows archived
  const filteredChats = allChats.filter((chat) => {
    if (activeTab === "archived") {
      return chat.archived;
    }
    return !chat.archived;
  });

  // Skeleton loader for chat list items
  const ChatListSkeleton = () => (
    <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <ListItem key={item} divider>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Stack alignItems="center" spacing={2} p={2}>
      <Typography variant="h5" fontWeight="bold">
        Chats
      </Typography>
      <Box width="40rem" component={Paper} sx={{ padding: "1rem", borderRadius: "1rem" }} elevation={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchRounded />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: "1rem" }}
        />
        {/* Toggle Buttons */}
        <Stack direction="row" spacing={2} mb={2} justifyContent="flex-end">
          <Button variant={activeTab === "normal" ? "contained" : "outlined"} onClick={() => setActiveTab("normal")} startIcon={<ChatIcon />}>
            Normal Chats
          </Button>
          <Button variant={activeTab === "archived" ? "contained" : "outlined"} onClick={() => setActiveTab("archived")} startIcon={<ArchiveIcon />}>
            Archived Chats
          </Button>
        </Stack>

        {isLoading ? (
          <ChatListSkeleton />
        ) : filteredChats && filteredChats.length > 0 ? (
          <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
            {filteredChats.map((chat) => (
              <ChatListView key={chat._id} chat={chat} />
            ))}
          </List>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            height="20rem"
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "0.6rem",
            }}
          >
            <Lottie animationData={chatSecondaryAnimation} loop autoPlay style={{ height: "60%", width: "60%" }} />
            <Typography variant="body2" sx={{ color: "#000000a6", fontWeight: "bold", mt: 2 }}>
              No chats found
            </Typography>
            <Button variant="contained" color="secondary" sx={{ mt: "1rem", fontWeight: "bold" }}>
              Start messaging your friends
            </Button>
          </Stack>
        )}

        {/* Load Older Messages Button */}
        {hasNextPage && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="outlined" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} sx={{ fontWeight: "bold" }}>
              {isFetchingNextPage ? "Loading..." : "Load Older Messages"}
            </Button>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default ChatManagement;
