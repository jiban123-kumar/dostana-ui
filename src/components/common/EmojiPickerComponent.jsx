/* eslint-disable react/prop-types */
import React from "react";
import EmojiPicker from "emoji-picker-react";
import { Stack } from "@mui/material";

const EmojiPickerComponent = ({ onEmojiClick }) => {
  return (
    <Stack component={"div"} mt={"1rem"}>
      <EmojiPicker onEmojiClick={onEmojiClick} width={"100%"} reactionsDefaultOpen={true} height={"20rem"} />
    </Stack>
  );
};

export default React.memo(EmojiPickerComponent);
