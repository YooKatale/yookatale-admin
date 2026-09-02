// const DEV_BACKEND_URL = "http://localhost:8000";
const DEV_BACKEND_URL = "https://yookatale-server.onrender.com";
const PROD_BACKEND_URL = "https://yookatale-server.onrender.com";

export const BACKEND_URL =
  process.env.NODE_ENV === "development" ? DEV_BACKEND_URL : PROD_BACKEND_URL;
