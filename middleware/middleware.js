import { isAfter } from "date-fns";

// Function to check if the user is logged in and handle redirection
export const IsLoggedIn = async () => {
  if (typeof window !== "undefined") {
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
