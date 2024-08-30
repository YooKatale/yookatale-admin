"use client";

import { useAccountsGetMutation } from "@Slices/userApiSlice";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import AddAccount from "@components/modals/AddAccount";
import { Button } from "@components/ui/button";
import { useToast } from "@components/ui/use-toast";
import { User2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Accounts = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [Accounts, setAccounts] = useState([]);

  const { userInfo } = useSelector((state) => state.auth);

  const [fetchAccounts] = useAccountsGetMutation();

  const { toast } = useToast();

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  // function handle fetching data
  const handleDataFetch = async () => {
    try {
      const res = await fetchAccounts().unwrap();

      if (res?.status == "Success") {
        setAccounts(res?.data);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  // fetch product categories
  useEffect(() => {
    handleDataFetch();
  }, []);

  return (
    <>
      
      {modalState && modal === "addAccount" ? (
        <AddAccount closeModal={setModalState} />
      ) : (
        <></>
      )}
      <main className="max-w-full" style={{marginTop:39, backgroundColor:"white"}}>
       
      <div className="py-4 px-4">
              <div className="py-4 flex justify-end">
                
                <Button
                  className="mx-2 text-base"
                  onClick={() => handleModal("addAccount")}
                >
                  Add User
                </Button>
              </div>
              <div className="py-2">
                {Accounts.length > 0 ? (
                  <div className="grid grid-cols-4">
                    {Accounts.map((account, index) => (
                      <div
                        className="p-4 mx-2 border border-slate-100 rounded-md"
                        key={index}
                      >
                        <div className="flex">
                          <div className="w-2/5 ">
                            <div className="p-0 max-h-20 max-w-20 rounded-full">
                              {account?.image ? (
                                <img
                                  src={account?.image}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <User2 size={40} />
                              )}
                            </div>
                          </div>
                          <div className="w-3/5">
                            <div className="">
                              <p className="text-lg">{`${account?.firstname} ${account?.lastname}`}</p>
                            </div>
                            <div className="">
                              <p className="text-md">{account?.username}</p>
                            </div>
                            <div className="py-2">
                              <p className="text-md font-bold">
                                {account?.accountType}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-center text-2xl">No accounts</p>
                  </div>
                )}
              </div>
            </div>
      </main>
    </>
  );
};

export default Accounts;
