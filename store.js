"use client";

import { apiSlice } from "@/Slices/apiSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@Slices/authSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
