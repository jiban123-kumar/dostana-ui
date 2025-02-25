import { SearchSharp } from "@mui/icons-material";
import { Avatar, Card, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { noResultFound, searchingPeople } from "../../animation";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { useSearchUsers } from "../../hooks/userProfile/userProfile";

const PeopleSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const cardRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  const [isFocused, setIsFocused] = useState(false);

  // Fetch search results using the debounced query
  const { data: results = [], isLoading, isError } = useSearchUsers(debouncedQuery);

  // Memoized debounce function
  const updateDebouncedQuery = useMemo(
    () =>
      debounce((query) => {
        setDebouncedQuery(query);
      }, 700),
    []
  );

  // Handle input change (memoized)
  const handleInputChange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
      updateDebouncedQuery(e.target.value);
    },
    [updateDebouncedQuery]
  );

  // Focus input field
  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Select a result
  const handleListButtonClick = useCallback(
    (result) => {
      setSearchQuery(result.name);
      setIsFocused(false);
      navigate(`/user-profile/${result._id}`);
    },
    [navigate]
  );

  // Handle clicks outside the card (memoized)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && inputRef.current !== event.target) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle errors
  useEffect(() => {
    if (isError) {
      console.error("Error fetching search results");
    }
  }, [isError]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      updateDebouncedQuery.cancel();
    };
  }, [updateDebouncedQuery]);

  // Memoize search results to prevent unnecessary re-renders
  const memoizedResults = useMemo(() => results, [results]);

  return (
    <Stack width="20rem" marginRight="0.4rem" position="relative">
      {/* Search Input */}
      <TextField
        variant="standard"
        placeholder="Search for people"
        inputRef={inputRef}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        sx={{ width: "100%" }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleFocusInput}>
                  <SearchSharp />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        autoComplete="off"
      />

      {/* Search Results Card */}
      {isFocused && debouncedQuery.trim().length > 2 && (
        <Card
          ref={cardRef}
          sx={{
            width: "100%",
            position: "absolute",
            top: "2rem",
            left: 0,
            maxHeight: isLoading ? "20rem" : "none",
            overflow: isLoading ? "hidden" : "visible",
            boxShadow: 2,
          }}
        >
          <Stack height={memoizedResults.length > 0 && !isLoading ? "auto" : "20rem"} justifyContent="center" alignItems="center" position="relative">
            {/* Loading Animation */}
            {isLoading && <Lottie animationData={searchingPeople} style={{ height: "100%", width: "100%" }} />}

            {/* No Results Animation */}
            {!isLoading && memoizedResults.length === 0 && (
              <>
                <Lottie animationData={noResultFound} style={{ height: "60%", width: "60%" }} loop={false} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold", transform: "translateY(-1rem)" }}>
                    No Results Found
                  </Typography>
                </motion.div>
              </>
            )}

            {/* Search Results */}
            {!isLoading && memoizedResults.length > 0 && (
              <List
                sx={{
                  width: "100%",
                  maxHeight: "20rem",
                  overflowY: memoizedResults.length > 5 ? "auto" : "hidden",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  msOverflowStyle: "none",
                }}
                key={1}
              >
                {memoizedResults.map((result, index) => (
                  <ListItemButton key={index} sx={{ padding: "0.8rem" }} onClick={() => handleListButtonClick(result)}>
                    <ListItemIcon>
                      <Avatar src={result.profileImage || ""} alt={result.name} sx={{ boxShadow: 3 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {result.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default PeopleSearch;
