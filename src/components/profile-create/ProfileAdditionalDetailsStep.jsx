/* eslint-disable react/prop-types */
import { Button, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentStep } from "../../reduxSlices/profileSlice";
import { useProfileCreation } from "../../hooks/userProfile/userProfileCreation";

const ProfileAdditionalDetailsStep = ({ coverImage, profileImage }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile.details);
  const isGoogleAccount = useSelector((state) => state.profile.isGoogleAccount);

  const { mutate: createProfile, isPending: isCreatingProfile } = useProfileCreation();

  const [formValues, setFormValues] = useState({
    gender: profile.gender || "male",
    dob: profile.dob || "",
    aboutMe: profile.aboutMe || "",
  });

  const [formErrors, setFormErrors] = useState({});

  const dateOfBirthRef = useRef(null);
  const aboutMeRef = useRef(null);

  const validateDateOfBirth = useCallback((value) => {
    if (!value) return "Date of birth is required";
    const date = new Date(value);
    if (date > new Date() || date < new Date("1900-01-01")) return "Invalid date of birth";
    if (new Date().getFullYear() - date.getFullYear() < 16) return "Age must be above 16";
    return "";
  }, []);

  const validateAboutMe = useCallback((value) => (value.length > 200 ? "Maximum 200 characters allowed" : ""), []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormErrors((prev) => ({
        ...prev,
        [name]: name === "dob" ? validateDateOfBirth(value) : name === "aboutMe" ? validateAboutMe(value) : "",
      }));
    },
    [validateDateOfBirth, validateAboutMe]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      dob: validateDateOfBirth(formValues.dob),
      aboutMe: validateAboutMe(formValues.aboutMe),
    };
    setFormErrors(errors);

    if (errors.dob) {
      dateOfBirthRef.current.focus();
      return;
    }
    if (errors.aboutMe) {
      aboutMeRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", profileImage || "");
    formData.append("coverImage", coverImage || "");
    formData.append("gender", formValues.gender);
    formData.append("dob", formValues.dob);
    formData.append("aboutMe", formValues.aboutMe);
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("mobileNum", profile.mobileNumber || "");
    formData.append("isGoogleAccount", isGoogleAccount);

    createProfile(formData);
  };

  return (
    <Stack gap={2} component="form" onSubmit={handleSubmit}>
      {/* Gender Selection */}
      <Stack>
        <Typography variant="body1" className="profileHeader">
          Gender
        </Typography>
        <Select value={formValues.gender} onChange={(e) => setFormValues((prev) => ({ ...prev, gender: e.target.value }))} variant="standard" displayEmpty sx={{ marginTop: ".6rem" }} inputProps={{ "aria-label": "Gender selection" }}>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Prefer not to say</MenuItem>
        </Select>
      </Stack>

      {/* Date of Birth Input */}
      <Stack>
        <Typography variant="body1" className="profileHeader">
          Date of Birth
        </Typography>
        <TextField variant="standard" fullWidth type="date" sx={{ marginTop: ".6rem" }} name="dob" value={formValues.dob} onChange={handleInputChange} onBlur={handleInputBlur} error={Boolean(formErrors.dob)} helperText={formErrors.dob} inputRef={dateOfBirthRef} />
      </Stack>

      {/* About Me Input */}
      <Stack>
        <Typography variant="body1" className="profileHeader">
          About Me
        </Typography>
        <TextField
          variant="standard"
          fullWidth
          multiline
          rows={4}
          placeholder="Describe yourself (max 200 characters)"
          sx={{ marginTop: ".6rem" }}
          name="aboutMe"
          value={formValues.aboutMe}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={Boolean(formErrors.aboutMe)}
          helperText={formErrors.aboutMe}
          inputRef={aboutMeRef}
        />
      </Stack>

      {/* Navigation Buttons */}
      <Stack flexDirection="row" gap={2} paddingY={2}>
        <Button variant="outlined" fullWidth startIcon={<KeyboardArrowLeft />} sx={{ fontWeight: 600 }} onClick={() => dispatch(updateCurrentStep(1))}>
          Back
        </Button>
        <Button variant="contained" fullWidth color="secondary" sx={{ fontWeight: 600 }} type="submit" loading={isCreatingProfile} loadingPosition="center">
          {isCreatingProfile ? "Creating Profile..." : "Create Profile"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProfileAdditionalDetailsStep;
