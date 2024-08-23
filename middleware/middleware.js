import React, { useEffect, useState } from "react";
import { isAfter } from "date-fns";
import { useRouter } from 'next/router';

// Function to check if the user is logged in and handle redirection
export const IsLoggedIn= async() => {
    if (typeof window !== 'undefined') {
      const profile =localStorage.getItem('yookatale-app-admin');
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (!parsedProfile) {
       return window.location.assign('/signin');
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