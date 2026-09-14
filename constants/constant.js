const DEV_BACKEND_URL = "http://localhost:4400";
const PROD_BACKEND_URL = "https://yookatale-server.onrender.com";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? DEV_BACKEND_URL : PROD_BACKEND_URL);
