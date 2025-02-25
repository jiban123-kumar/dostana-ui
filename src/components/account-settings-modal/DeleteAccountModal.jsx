import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, Stack, TextField, Button, Box, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useDeleteAccount } from "../../hooks/auth/accountDeletion";

const DeleteAccountModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const { mutate: checkingAccountOwnership, isPending: confirmingAccountOwnership } = useDeleteAccount();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "", // Clear error for the field on change
    }));
  };

  const handleBlur = (e) => {
    validateField(e.target.name);
  };

  const validateField = (field) => {
    let fieldError = "";
    if (field === "password" && !formData.password) {
      fieldError = "Password is required.";
    }
    if (field === "confirmPassword") {
      if (!formData.confirmPassword) {
        fieldError = "Confirm Password is required.";
      } else if (formData.confirmPassword !== formData.password) {
        fieldError = "Passwords do not match.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const validate = () => {
    validateField("password");
    validateField("confirmPassword");
    return Object.values(errors).every((error) => !error);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("formData", formData);
    checkingAccountOwnership(formData, {
      onSuccess: () => {
        setOpenDeleteConfirmation(true);
        handleClose();
      },
      onMutate: () => {
        dispatch(showAlert({ message: "Verifying password...", type: "info", loading: true }));
      },
      onError: (err) => {
        console.log(err);
        let msg = "Something went wrong. Please try again.";
        if (err.response?.status === 401) {
          setErrors((prev) => ({
            ...prev,
            password: "Unauthorized. Please check your password.",
          }));
          passwordRef.current?.focus();
          msg = "Unauthorized. Please check your password.";
        }
        dispatch(showAlert({ message: msg, type: "error" }));
      },
    });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Box sx={{ width: "30rem" }}>
          <DialogTitle textAlign="center" sx={{ fontWeight: "bold", fontFamily: "Poppins" }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Password"
                  variant="standard"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password}
                  helperText={errors.password}
                  slotProps={{
                    input: {
                      ref: passwordRef,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} onMouseDown={(e) => e.preventDefault()}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Confirm Password"
                  variant="standard"
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} onMouseDown={(e) => e.preventDefault()}>
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
              <Stack flexDirection="row" marginTop={3} gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleClose();
                    setFormData({ password: "", confirmPassword: "" });
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
                <LoadingButton type="submit" variant="contained" loading={confirmingAccountOwnership} fullWidth sx={{ fontWeight: 600 }}>
                  Verify Password
                </LoadingButton>
              </Stack>
            </form>
          </DialogContent>
        </Box>
      </Dialog>
      <DeleteConfirmationModal open={openDeleteConfirmation} handleClose={() => setOpenDeleteConfirmation(false)} formData={formData} />
    </>
  );
};

export default DeleteAccountModal;
