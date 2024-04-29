// import React from 'react'
"use client";
import { IsAccountValid, IsLoggedIn } from "@middleware/middleware";
import { useEffect, useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useLogoutMutation } from "@Slices/userApiSlice";
import { logout } from "@Slices/authSlice";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { toggleSidebar, openSidebar, closeSidebar } from "@Slices/sidebarSlice";

const Navbar = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isLoading, setLoading] = useState({ operation: "", status: false });
  const [logoutApiCall] = useLogoutMutation();

  const { toast } = useToast();

  const router = useRouter();

  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.sidebar);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const logoutHandler = async () => {
    // set loading to be true
    setLoading({ ...isLoading, operation: "logout", status: true });

    try {
      const res = await logoutApiCall().unwrap();

      // set loading to be false
      setLoading({ ...isLoading, operation: "", status: false });

      dispatch(logout());

      router.push("/signin");
    } catch (err) {
      console.log({ err });
      // set loading to be false
      setLoading({ ...isLoading, operation: "", status: false });

      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  useEffect(() => {
    IsLoggedIn();
    IsAccountValid();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        dispatch(openSidebar()); // Open sidebar for larger screens
      } else {
        dispatch(closeSidebar()); // Close sidebar for smaller screens
      }
    };

    handleResize(); // Check on mount

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { userInfo } = useSelector((state) => state.auth);
  return (
    <>
      <nav className="p-0  border-slate-100 border-b-2 fixed top-0 w-full bg-white z-10 flex justify-center items-center">
        <div className="flex justify-between items-center w-full py-2 px-2">
          <div
            className={
              isLargeScreen ? "cursor-not-allowed mx-2" : "cursor-pointer mx-2"
            }
            onClick={!isLargeScreen ? handleToggleSidebar : null}
          >
            <HiMenuAlt2 size={25} />
          </div>
          <div className="flex justify-end px-4">
            <div className="pr-4 border-r border-slate-100">
              <p className="text-sm font-thin m-0 p-0">Admin</p>
              <p className="text-lg font-semibold m-0 p-0">
                {userInfo?.username}
              </p>
            </div>
            <div className="pl-2 pr-1 pt-1">
              <Button onClick={logoutHandler}>
                {isLoading && isLoading.operation == "logout" ? (
                  <Loader2 />
                ) : (
                  <LogOut />
                )}{" "}
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
