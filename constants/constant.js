const DEFAULT_BACKEND_URL = "https://yookatale-serverside.onrender.com";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
