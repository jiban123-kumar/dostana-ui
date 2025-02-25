import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";

// API call to delete the account
const requestDeleteAccountApi = async (data) => {
  console.log(data);
  const response = await axiosInstance.delete("/auth/account", { data });
  return response.data;
};
const useDeleteAccount = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: requestDeleteAccountApi,
    onSuccess: () => {
      dispatch(showAlert({ message: "Account deleted successfully!Login with new account", type: "success", loading: false }));
    },
    onMutate: () => {
      dispatch(showAlert({ message: "Deleting account...", type: "info", loading: true }));
    },
    onError: (error) => {
      let errorMessage = "Failed to delete account. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid request data.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export { useDeleteAccount };
