import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// MUI Imports
import { CssBaseline } from "@mui/material";

// React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Redux Imports
import { Provider } from "react-redux";
import { store } from "./reduxStore/store.js";

// Notifications
import { SnackbarProvider } from "notistack";

// Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh indefinitely.
      staleTime: Infinity,
      // Disable refetching when the component mounts.
      refetchOnMount: false,
      // Disable refetching when the window is focused.
      refetchOnWindowFocus: false,
      // Disable refetching when the browser reconnects.
      refetchOnReconnect: false,
    },
  },
});

// Optional: Explicit service worker registration (if not using auto registration)

// Root Rendering
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
          <App />
        </SnackbarProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
