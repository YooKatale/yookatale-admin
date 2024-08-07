import { isAfter } from "date-fns";
import { useEffect, useState } from "react";

/*
There is an issue affecting building the UI. I will 
*/
// export const IsLoggedIn = () => {
//   const Profile =
//     typeof window !== "undefined"
//       ? localStorage?.getItem("yookatale-app-admin")
//         ? JSON.parse(localStorage?.getItem("yookatale-app-admin"))
//         : null
//       : {};

//   // check if token exists
//   if (Profile) return;

//   if (typeof window !== "undefined") {
//     window.location.assign("/signin");
//   }
// };

// export const IsAccountValid = () => {
//   const Profile =
//     typeof window !== "undefined"
//       ? localStorage?.getItem("yookatale-app-admin")
//         ? JSON.parse(localStorage?.getItem("yookatale-app-admin"))
//         : null
//       : {};

//   // check if token exists and is valid
//   if (Profile) {
//     if (!isAfter(new Date(Profile?.expires), new Date())) {
//       if (typeof window !== "undefined") {
//         localStorage.setItem("yookatale-app-admin", "");
//       }
//     }
//   }
// };

// Function to check if the user is logged in and handle redirection
export const IsLoggedIn = () => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('yookatale-app-admin');
      const parsedProfile = profile ? JSON.parse(profile) : null;

      if (!parsedProfile) {
        window.location.assign('/signin');
      }
    }
};

// Function to check if the user account is valid
export const IsAccountValid = () => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('yookatale-app-admin');
      const parsedProfile = profile ? JSON.parse(profile) : null;

      if (parsedProfile) {
        if (!isAfter(new Date(parsedProfile.expires), new Date())) {
          localStorage.removeItem('yookatale-app-admin');
          window.location.assign('/signin');
        }
      }
    }
};
