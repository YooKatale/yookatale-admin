"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo:
    typeof window !== "undefined"
      ? localStorage?.getItem("yookatale-app-admin")
        ? JSON.parse(localStorage?.getItem("yookatale-app-admin"))
        : null
      : {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      typeof window !== "undefined"
        ? localStorage?.setItem(
            "yookatale-app-admin",
            JSON.stringify(action.payload)
          )
        : (localStorage = null);
    },
    logout: (state, action) => {
      state.userInfo = null;
      typeof window !== "undefined"
        ? localStorage?.removeItem("yookatale-app-admin")
        : (localStorage = null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
