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

const Navbar = () => {
  const [isLoading, setLoading] = useState({ operation: "", status: false });
  const [logoutApiCall] = useLogoutMutation();
const  [isAuthenticated, setisAuthenticated]=useState(false)
  const { toast } = useToast();

  const router = useRouter();

  const dispatch = useDispatch();

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
    IsLoggedIn()
    IsAccountValid();
  }, []);
  const { userInfo } = useSelector((state) => state.auth);
  return (
    <>
      <nav className="p-0 border-b-slate-100 border-b-2 fixed w-full flex bg-white z-10">
        <div className="w-1/5"></div>
        <div className="w-4/5">
          <div className="flex justify-between py-2 px-2">
            <div className="p-2">
              <div className="cursor-pointer mx-2">
                <HiMenuAlt2 size={25} />
              </div>
            </div>
            <div className="flex justify-end px-4">
              <div className="pr-4 border-r-2 border-slate-100">
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
        </div>
      </nav>
    </>
  );
};

export default Navbar;
