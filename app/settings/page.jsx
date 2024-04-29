"use client";

import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import UpdateAccount from "@components/modals/UpdateAccount";
import { Button } from "@components/ui/button";
import { User2, User2Icon } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  return (
    <>
      {/* --------------- display modal forms
        -------------------------------------------------- */}
      {modalState && modal === "updateAccount" ? (
        <UpdateAccount closeModal={setModalState} />
      ) : (
        <></>
      )}
      <main className="max-w-full">
        <div className="flex w-full">
          <Sidenav marginTop={true} />
          <Navbar />
          <div className="flex flex-col lg:flex-row lg:w-full pt-12 w-[140%]">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              {/* ------------------- main content here
            ---------------------------------------------------
            */}
              <div className="px-2 py-4">
                <div className="p-1 flex border-b-2 border-slate-100">
                  <div className="flex px-3 py-1 border-r-2 border-slate-100 mr-4">
                    <User2Icon size={25} />
                    <h3 className="text-lg font-bold mx-2">General</h3>
                  </div>
                </div>
                <div className="py-4 px-2">
                  <div className="flex">
                    <div className="w-4/5 py-2">
                      <div className="py-2 flex justify-between">
                        <div className="flex">
                          <div>
                            <div className="border border-slate-100 rounded-full p-3">
                              <User2 size={60} />
                            </div>
                          </div>
                          <div className="px-4 pt-4">
                            <p className="text-lg">{`${userInfo?.firstname} ${userInfo?.lastname}`}</p>
                            <p className="text-md font-bold italic">
                              {userInfo?.account ? userInfo?.account : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          {/* <div className="mx-2">
                            <Button>Change password</Button>
                          </div> */}
                          <div className="mx-2">
                            <Button
                              onClick={() => handleModal("updateAccount")}
                            >
                              Update Details
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="py-4">
                        <div className="grid grid-cols-3">
                          <div className="mx-2 mb-4">
                            <p className="text-lg">First Name</p>
                            <p className="text-lg font-bold">
                              {userInfo?.firstname ? userInfo?.firstname : ""}
                            </p>
                          </div>
                          <div className="mx-2 mb-4">
                            <p className="text-lg">Last Name</p>
                            <p className="text-lg font-bold">
                              {userInfo?.lastname ? userInfo?.lastname : ""}
                            </p>
                          </div>
                          <div className="mx-2 mb-4">
                            <p className="text-lg">Username</p>
                            <p className="text-lg font-bold">
                              {userInfo?.username ? userInfo?.username : ""}
                            </p>
                          </div>
                          <div className="mx-2 mb-4">
                            <p className="text-lg">Email</p>
                            <p className="text-lg font-bold">
                              {userInfo?.email ? userInfo?.email : ""}
                            </p>
                          </div>
                          <div className="mx-2 mb-4">
                            <p className="text-lg">Phone Number</p>
                            <p className="text-lg font-bold">
                              {userInfo?.phone ? userInfo?.phone : ""}
                            </p>
                          </div>
                          <div className="mx-2 mb-4">
                            <p className="text-lg">Gender</p>
                            <p className="text-lg font-bold">
                              {userInfo?.gender ? userInfo?.gender : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
