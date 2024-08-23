"use client";

import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   userInfo:
//     typeof window !== "undefined"
//       ? localStorage?.getItem("yookatale-app-admin")
//         ? JSON.parse(localStorage?.getItem("yookatale-app-admin"))
//         : null
//       : {},
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       state.userInfo = action.payload;
//       typeof window !== "undefined"
//         ? localStorage?.setItem(
//             "yookatale-app-admin",
//             JSON.stringify(action.payload)
//           )
//         : (localStorage = null);
//     },
//     logout: (state, action) => {
//       state.userInfo = null;
//       typeof window !== "undefined"
//         ? localStorage?.removeItem("yookatale-app-admin")
//         : (localStorage = null);
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;

// export default authSlice.reducer;

// Local storage helper functions
const getUserInfoFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem("yookatale-app-admin");
  return userInfo ? JSON.parse(userInfo) : null;
};

const saveUserInfoToLocalStorage = (userInfo) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("yookatale-app-admin", JSON.stringify(userInfo));
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
