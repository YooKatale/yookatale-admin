import React, { useEffect, useState } from "react";
import { isAfter } from "date-fns";
import { useRouter } from 'next/navigation';

// Function to check if the user is logged in and handle redirection
export const IsLoggedIn= async() => {
  const router=useRouter()
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('yookatale-app-admin');
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (!parsedProfile) {
        alert('Not Authenticated')
       return router.push('/signin');
      }
    }
};

// Function to check if the user account is valid
export const IsAccountValid = async() => {
  const router=useRouter()
    if (typeof window !== 'undefined') {
     
      const profile = localStorage.getItem('yookatale-app-admin');
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (parsedProfile) {
        if (!isAfter(new Date(parsedProfile.expires), new Date())) {
          localStorage.removeItem('yookatale-app-admin');
          return router.push('/signin');
        }
      }
    }
};