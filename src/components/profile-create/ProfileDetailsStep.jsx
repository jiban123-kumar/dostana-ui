import { Button, Stack, TextField, Typography } from "@mui/material";
import { ArrowRightAlt, KeyboardArrowLeft } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useCallback } from "react";
import { updateCurrentStep, updateProfileDetails } from "../../reduxSlices/profileSlice";

const ProfileDetailsStep = () => {
  const dispatch = useDispatch();
  const { firstName, lastName, mobileNumber } = useSelector((state) => state.profile.details);

  // Local state for form inputs and errors
  const [formValues, setFormValues] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    mobileNumber: mobileNumber || "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Refs for focusing inputs
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const mobileNumberRef = useRef(null);

  // Validation functions
  const validateName = useCallback((value, fieldName) => {
    if (!value) return ""; // Don't validate if empty
    if (value.length < 3) return `${fieldName} must be at least 3 characters long`;
    if (value.length > 15) return `${fieldName} must be at most 15 characters long`;
    if (!/^[a-zA-Z\s]+$/.test(value)) return `${fieldName} must contain only alphabets`;
    return "";
  }, []);

  const validateMobileNumber = useCallback((value) => {
    if (!value.trim()) return ""; // Optional field
    if (value.length !== 10) return "Mobile number must be 10 digits long";
    return "";
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle input blur (validation on blur only if value exists)
  const handleInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      let error = "";

      if (value.trim()) {
        if (name === "firstName" || name === "lastName") {
          error = validateName(value, name === "firstName" ? "First Name" : "Last Name");
        } else if (name === "mobileNumber") {
          error = validateMobileNumber(value);
        }
      }

      setFormErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateName, validateMobileNumber]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Perform final validation
      const errors = {
        firstName: validateName(formValues.firstName, "First Name"),
        lastName: validateName(formValues.lastName, "Last Name"),
        mobileNumber: validateMobileNumber(formValues.mobileNumber),
      };

      setFormErrors(errors);

      // Focus the first field with an error
      if (errors.firstName) {
        firstNameRef.current.focus();
      } else if (errors.lastName) {
        lastNameRef.current.focus();
      } else if (errors.mobileNumber) {
        mobileNumberRef.current.focus();
      } else {
        dispatch(updateProfileDetails(formValues));
        dispatch(updateCurrentStep(2)); // Proceed to the next step
      }
    },
    [dispatch, formValues, validateName, validateMobileNumber]
  );

  return (
    <Stack gap={2} component="form" onSubmit={handleSubmit}>
      {/* Profile Name Section */}
      <Stack>
        <Typography variant="body1" className="profileHeader">
          Profile Name
        </Typography>
        <Stack spacing={1}>
          <TextField label="First Name" variant="standard" fullWidth name="firstName" value={formValues.firstName} onChange={handleInputChange} onBlur={handleInputBlur} error={Boolean(formErrors.firstName)} helperText={formErrors.firstName} inputRef={firstNameRef} />
          <TextField label="Last Name" variant="standard" fullWidth name="lastName" value={formValues.lastName} onChange={handleInputChange} onBlur={handleInputBlur} error={Boolean(formErrors.lastName)} helperText={formErrors.lastName} inputRef={lastNameRef} />
        </Stack>
      </Stack>

      {/* Mobile Number Section */}
      <Stack>
        <Typography variant="body1" className="profileHeader">
          Mobile Number
        </Typography>
        <Stack flexDirection="row" gap="1rem" marginTop="0.6rem">
          <TextField
            variant="standard"
            value="+91"
            sx={{ width: "5rem" }}
            slotProps={{ input: { readOnly: true } }} // Used `slotProps` instead of `inputProps`
          />
          <TextField
            variant="standard"
            fullWidth
            placeholder="Enter your mobile number (optional)"
            type="number"
            name="mobileNumber"
            value={formValues.mobileNumber}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={Boolean(formErrors.mobileNumber)}
            helperText={formErrors.mobileNumber}
            inputRef={mobileNumberRef}
          />
        </Stack>
      </Stack>

      {/* Navigation Buttons */}
      <Stack flexDirection="row" gap={2} paddingY={1} marginTop={2}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<KeyboardArrowLeft />}
          sx={{ fontWeight: 600 }}
          size="large"
          onClick={() => dispatch(updateCurrentStep(0))} // Go back to the previous step
        >
          Back
        </Button>
        <Button variant="contained" fullWidth endIcon={<ArrowRightAlt />} size="large" sx={{ fontWeight: 600 }} type="submit">
          Next
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProfileDetailsStep;
