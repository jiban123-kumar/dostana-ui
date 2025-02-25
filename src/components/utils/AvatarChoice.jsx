import React, { useState } from "react";
import { Dialog, DialogTitle, Box, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8 } from "../../animation";

const avatars = [
  { name: "avatar1", animationData: avatar1 },
  { name: "avatar2", animationData: avatar2 },
  { name: "avatar3", animationData: avatar3 },
  { name: "avatar4", animationData: avatar4 },
  { name: "avatar5", animationData: avatar5 },
  { name: "avatar6", animationData: avatar6 },
  { name: "avatar7", animationData: avatar7 },
  { name: "avatar8", animationData: avatar8 },
];

const AvatarChoice = ({ open, onClose, onSelect }) => {
  const handleAvatarClick = (name) => {
    onSelect(name); // Pass the selected avatar name to the parent logic
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"bold"}>Select Your Avatar</DialogTitle>
      <Box display="flex" flexWrap="wrap" justifyContent="center" padding={2}>
        {avatars.map((avatar) => (
          <Box key={avatar.name} margin={1}>
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <IconButton onClick={() => handleAvatarClick(avatar.name)}>
                <Lottie animationData={avatar.animationData} style={{ width: 100, height: 100 }} />
              </IconButton>
            </motion.div>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
};

export default AvatarChoice;
