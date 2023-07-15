// import React from 'react'
"use client";
import { IsAccountValid, IsLoggedIn } from "@middleware/middleware";
import { useEffect } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { useSelector } from "react-redux";

const Navbar = () => {
  useEffect(() => {
    IsLoggedIn();
    IsAccountValid();
  }, []);
  const { userInfo } = useSelector((state) => state.auth);
  return (
    <>
      <nav className="p-0 border-b-slate-100 border-b-2">
        <div className="flex justify-between py-2 px-2">
          <div className="p-2">
            <div className="cursor-pointer mx-2">
              <HiMenuAlt2 size={25} />
            </div>
          </div>
          <div className="flex justify-end px-4">
            <div>
              <p className="text-sm font-thin m-0 p-0">Admin</p>
              <p className="text-lg font-semibold m-0 p-0">
                {userInfo?.username}
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
