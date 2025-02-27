/* eslint-disable react/prop-types */
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, Stack, Button, Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAccount } from "../../hooks/auth/accountDeletion";

const DeleteConfirmationModal = ({ open, handleClose, formData }) => {
  const queryClient = useQueryClient();
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null); // Ref for the ReCAPTCHA
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  const handleCaptchaChange = (value) => {
    setIsCaptchaVerified(!!value);
  };

  const resetCaptcha = () => {
    setIsCaptchaVerified(false); // Reset local state
    if (recaptchaRef.current) {
      recaptchaRef.current.reset(); // Reset the reCAPTCHA
    }
  };

  const onDeleteAccount = () => {
    deleteAccount(
      { ...formData, isAccountDelete: true },
      {
        onSuccess: () => {
          dispatch(showAlert({ message: "Account deleted successfully!", type: "success", loading: false }));
          navigate("/login"); // Navigate to login on success
          queryClient.removeQueries();
        },
        onMutate: () => {
          dispatch(showAlert({ message: "Deleting account...", type: "info", loading: true }));
        },
        onError: (error) => {
          console.error(error);
          const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
          dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
          resetCaptcha(); // Reset the reCAPTCHA on error
        },
        onSettled: () => {
          setIsCaptchaVerified(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Box sx={{ width: "30rem" }}>
        <DialogTitle textAlign="center" sx={{ fontWeight: "bold" }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete your account? This action cannot be undone, and your profile will be permanently deleted.
          </Typography>

          {/* Google reCAPTCHA */}
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} // Replace with your actual reCAPTCHA site key
            onChange={handleCaptchaChange}
            ref={recaptchaRef} // Assigning ref to access reset method
          />

          {/* Buttons */}
          <Stack flexDirection="row" marginTop={3} gap={2}>
            <Button variant="outlined" onClick={handleClose} fullWidth>
              Cancel
            </Button>
            <LoadingButton variant="contained" loading={isDeletingAccount} fullWidth color="warning" disabled={!isCaptchaVerified || isDeletingAccount} onClick={onDeleteAccount} sx={{ fontWeight: 600 }}>
              Delete Account
            </LoadingButton>
          </Stack>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
