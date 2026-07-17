import { isAfter } from "date-fns";

// Routes that should be accessible without being logged in
const PUBLIC_ROUTES = ["/reset-password", "/signin"];

const isPublicRoute = () => {
  if (typeof window === "undefined") return false;
  return PUBLIC_ROUTES.some((route) =>
    window.location.pathname.startsWith(route)
  );
};

// Function to check if the user is logged in and handle redirection
export const IsLoggedIn = async () => {
  if (typeof window !== "undefined") {
    if (isPublicRoute()) return;

    try {
      const profile = localStorage.getItem("yookatale-app-admin");
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (!parsedProfile) {
        window.location.assign("/signin");
      }
    } catch {
      localStorage.removeItem("yookatale-app-admin");
      window.location.assign("/signin");
    }
  }
};

// Function to check if the user account is valid
export const IsAccountValid = async () => {
  if (typeof window !== "undefined") {
    if (isPublicRoute()) return;

    try {
      const profile = localStorage.getItem("yookatale-app-admin");
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (parsedProfile) {
        if (!isAfter(new Date(parsedProfile.expires), new Date())) {
          localStorage.removeItem("yookatale-app-admin");
          window.location.assign("/signin");
        }
      }
    } catch {
      localStorage.removeItem("yookatale-app-admin");
      window.location.assign("/signin");
    }
  }
};