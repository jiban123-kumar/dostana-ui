import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";

const logoutUserApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logoutUserApi,
    onSuccess: (data) => {
      // Handle success (e.g., redirect user, clear state)
      console.log(`${data.message}`);
      // Example: Redirect to login page
      queryClient.removeQueries();
      navigate("/login");
    },
    onError: (error) => {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error occurred during logout.");
      }
    },
  });
};

export { useLogout };
