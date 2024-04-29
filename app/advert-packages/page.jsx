"use client";

import { useYoocardsFetchMutation } from "@Slices/yoocacrdApiSlice";
import { useFetchAdvertisementPackagesMutation } from "@Slices/advertisementApiSlice";
import AdvertisementCard from "@components/AdvertisementCard";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import AddAdvertisementPackage from "@components/modals/AddAdvertisementPackage";
import { Button } from "@components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const AdvertPackages = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");

  // create state to hold fetched YooCards information
  const [YooCards, setYooCards] = useState({});

  const [fetchCards] = useFetchAdvertisementPackagesMutation();

  const handleCardFetch = async () => {
    try {
      const res = await fetchCards().unwrap();
      console.log("res", res);
      if (res.success == true) {
        setYooCards(res.packages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleCardFetch();
  }, []);

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };
  return (
    <>
      {/* --------------- display modal forms
        -------------------------------------------------- */}
      {modalState && modal === "add" ? (
        <AddAdvertisementPackage closeModal={setModalState} />
      ) : (
        <></>
      )}
      <main className="max-w-full">
        <div className="flex w-full max-h-screen">
          <Sidenav marginTop={true} />
          <Navbar />
          <div className="flex flex-col lg:flex-row lg:w-full pt-12 w-[140%]">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              <div className="w-full h-screen max-h-screen overflow-x-hidden overflow-y-auto container__hide__scrollbar">
                {/* ------------------- main content here
            ---------------------------------------------------
            */}
                <div className="py-4 px-4">
                  <div className="py-2 flex justify-end border-b-2 border-slate-100">
                    <Button
                      className="text-base"
                      onClick={() => handleModal("add")}
                    >
                      <PlusIcon size={20} />
                      Add Package
                    </Button>
                  </div>
                  <div className="py-4">
                    <div className="grid grid-cols-3">
                      {YooCards.length > 0 &&
                        YooCards.map((card, index) => (
                          <AdvertisementCard card={card} key={index} />
                        ))}
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

export default AdvertPackages;
