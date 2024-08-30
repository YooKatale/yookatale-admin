"use client";

import { useYoocardsFetchMutation } from "@Slices/yoocacrdApiSlice";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import SubscriptionCard from "@components/SubscriptionCard";
import AddYoocard from "@components/modals/AddYoocard";
import { Button } from "@components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const SubscriptionCards = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");

  // create state to hold fetched YooCards information
  const [YooCards, setYooCards] = useState({});

  const [fetchCards] = useYoocardsFetchMutation();

  const handleCardFetch = async () => {
    try {
      const res = await fetchCards().unwrap();

      if (res.status == "Success") {
        setYooCards(res.data);
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
        <AddYoocard closeModal={setModalState} />
      ) : (
        <></>
      )}
      <main className="max-w-full">
        <div className="flex w-full max-h-screen">
          
          <div className="flex w-full pt-12">
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
                      Add YooCard
                    </Button>
                  </div>
                  <div className="py-4">
                    <div className="grid grid-cols-3">
                      {YooCards.length > 0 &&
                        YooCards.map((card, index) => (
                          <SubscriptionCard card={card} key={index} />
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

export default SubscriptionCards;
