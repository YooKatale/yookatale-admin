"use client";

import { apiSlice } from "@/Slices/apiSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@Slices/authSlice";
import sidebarReducer from "@Slices/sidebarSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
