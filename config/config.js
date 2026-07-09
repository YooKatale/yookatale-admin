const PROD_DB_URL = "https://yookatale-server.onrender.com/api";
const DEV_DB_URL = "http://localhost:8000/api";

export const APPLY_EMAIL = "info@yookatale.app";

export const DB_URL = process.env.NODE_ENV == "development" ? DEV_DB_URL : PROD_DB_URL;