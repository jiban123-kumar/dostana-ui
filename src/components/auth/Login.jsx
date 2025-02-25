import { Box, Button, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import { useLogin } from "../../hooks/auth/login";
import { googleIcon } from "../../assets";

const googleAuthLogin = (e) => {
  e.preventDefault();
  window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const { mutate: login, isPending: isLoggingIn } = useLogin({ emailRef, passwordRef });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (name === "email") {
        if (!/\S+@\S+\.\S+/.test(trimmedValue)) newErrors.email = "Enter a valid email id";
        else newErrors.email = "";
      }
      if (name === "password") {
        newErrors.password = "";
      }
      return newErrors;
    });
  }, []);

  const validate = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Provide an email id";
      emailRef.current?.focus();
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email id";
      emailRef.current?.focus();
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Provide a password";
      if (isValid) passwordRef.current?.focus();
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      login({ email: formData.email.trim(), password: formData.password.trim() });
    }
  };

  return (
    <Stack paddingX={"2rem"} paddingY={"1rem"} component="form" onSubmit={handleSubmit} minHeight={"40vh"}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Login to your account
      </Typography>
      <Stack spacing={2} marginTop={".6rem"}>
        <TextField name="email" label="Email" variant="standard" fullWidth value={formData.email} onChange={handleChange} onBlur={handleBlur} error={Boolean(errors.email)} helperText={errors.email} inputRef={emailRef} autoComplete="email" />
        <TextField
          name="password"
          label="Password"
          variant="standard"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((show) => !show)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ),
            },
          }}
          error={Boolean(errors.password)}
          helperText={errors.password}
          inputRef={passwordRef}
        />
      </Stack>
      <Stack width="100%" flexDirection="row" marginTop="2.4rem">
        <Button variant="contained" fullWidth sx={{ padding: ".6rem", fontWeight: 700 }} color="secondary" type="submit" disabled={isLoggingIn} endIcon={<LoginIcon />}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </Button>
        <Button variant="text" fullWidth sx={{ fontWeight: 600, "&:hover": { backgroundColor: "transparent" } }} disableRipple>
          <Link to="/forget-password" style={{ textDecoration: "none" }}>
            Forget Password
          </Link>
        </Button>
      </Stack>
      <Stack marginTop="1rem" flexDirection="row" justifyContent="center" alignItems="center">
        <Typography variant="body2" color={grey[700]} sx={{ fontWeight: 700 }}>
          Don&apos;t have an account?
        </Typography>
        <Button variant="text" sx={{ fontWeight: 600, "&:hover": { backgroundColor: "transparent" } }} disableRipple>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            Sign up
          </Link>
        </Button>
      </Stack>
      <Divider />
      <Button variant="outlined" color="secondary" fullWidth sx={{ padding: ".6rem", fontWeight: 500, color: "#000000b0", marginTop: ".6rem" }} startIcon={<Box component="img" src={googleIcon} sx={{ width: "1.4rem" }} />} onClick={googleAuthLogin}>
        Continue with Google
      </Button>
    </Stack>
  );
};

export default Login;
