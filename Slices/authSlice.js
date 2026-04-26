"use client";

import { createSlice } from "@reduxjs/toolkit";

// Fields safe to store in localStorage (non-sensitive display info only)
const SAFE_FIELDS = [
  "_id", "firstname", "lastname", "username", "email", "phone",
  "account", "accountType", "profileImage", "expires",
];

// Strip sensitive fields before localStorage storage
const sanitizeForStorage = (userInfo) => {
  if (!userInfo) return null;
  const safe = {};
  for (const key of SAFE_FIELDS) {
    if (userInfo[key] !== undefined) safe[key] = userInfo[key];
  }
  return safe;
};

// Local storage helper functions
const getUserInfoFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("yookatale-app-admin");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("yookatale-app-admin");
    return null;
  }
};

const saveUserInfoToLocalStorage = (userInfo) => {
  if (typeof window === "undefined") return;
  // Only persist safe display fields — auth tokens stay in HttpOnly cookies
  const safe = sanitizeForStorage(userInfo);
  localStorage.setItem("yookatale-app-admin", JSON.stringify(safe));
};

const clearUserInfoFromLocalStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("yookatale-app-admin");
};

// Initial state
const initialState = {
  userInfo: getUserInfoFromLocalStorage() || null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      saveUserInfoToLocalStorage(action.payload);
    },
    logout: (state) => {
      state.userInfo = null;
      clearUserInfoFromLocalStorage();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
