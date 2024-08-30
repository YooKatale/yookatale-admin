"use client";

import { useGetAdvertisementPostsMutation } from "@Slices/advertisementApiSlice";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { useToast } from "@components/ui/use-toast";
import { Loader2, Loader2Icon } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Advertisement = () => {
  const [AdvertisementData, setAdvertisementData] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [fetchAdvertisements] = useGetAdvertisementPostsMutation();
  //   const [approveSubscription] = useSubscriptionsApproveMutation();

  const { toast } = useToast();
  const router = useRouter();

  const handleDataFetch = async () => {
    const res = await fetchAdvertisements("pending").unwrap();
    console.log("res", res);
    if (res?.success === true) {
      setAdvertisementData(res?.data);
    }
  };

  //   const handleSubscriptionApprove = async (ID) => {
  //     try {
  //       const res = await approveSubscription(ID).unwrap();

  //       // set loading to be false
  //       setLoading((prevState) => (prevState ? false : true));

  //       if (res?.status == "Success") {
  //         toast({
  //           title: "Success",
  //           description: `Subscription approved`,
  //         });

  //         await handleDataFetch();
  //       }
  //     } catch (err) {
  //       // set loading to be false
  //       setLoading((prevState) => (prevState ? false : true));

  //       toast({
  //         variant: "destructive",
  //         title: "Error occured",
  //         description: err.data?.message
  //           ? err.data?.message
  //           : err.data || err.error,
  //       });
  //     }
  //   };

  useEffect(() => {
    handleDataFetch();
  }, []);
  return (
    <>
      <main className="max-w-full" style={{backgroundColor:"white", marginTop:20}}>
      <div className="px-2 py-4">
                  <div className="py-4 px-2">
                    <div className="flex pt-4">
                      <div className="mr-2">
                        <Button className={"text-md"} type={"button"}>
                          Pending
                        </Button>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <div>
                        <p className="text-lg font-bold">
                          Advertisements pending approval
                        </p>
                      </div>
                      <div></div>
                    </div>
                    <div className="pt-2 pr-4 pb-4 pl-2 max-h-96 overflow-x-hidden overflow-y-auto">
                      {AdvertisementData && (
                        <div className="border border-slate-100 rounded-md">
                          <Table>
                            <TableCaption>New Orders</TableCaption>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Client</TableHead>
                                {/* <TableHead>Cards</TableHead> */}
                                <TableHead>Date</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {AdvertisementData.length > 0 &&
                                [...AdvertisementData].map(
                                  (advertisement, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {`${advertisement?.user?.firstname} ${advertisement?.user?.lastname}`}
                                      </TableCell>
                                      {/* <TableCell>
                                        {advertisement?.cards.map(
                                          (card, index) => (
                                            <div
                                              key={index}
                                              className="p-1 border rounded-md border-slate-100 mb-1"
                                            >
                                              <p className="font-bold capitalize">
                                                {card.card}
                                              </p>
                                              <p className="font-bold capitalize">
                                                {`${card.cardNumber
                                                  .toString()
                                                  .slice(0, 3)}xxxxxxxxx`}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </TableCell> */}
                                      <TableCell>
                                        {moment(
                                          advertisement?.createdAt
                                        ).fromNow()}
                                      </TableCell>
                                      <TableCell>
                                        <>
                                          <AlertDialog>
                                            <AlertDialogTrigger
                                              className="text-white bg-black px-3 py-2 rounded-md flex"
                                              onClick={() =>
                                                setLoading((prevState) =>
                                                  prevState ? false : true
                                                )
                                              }
                                            >
                                              {isLoading ? <Loader2 /> : ""}
                                              Approve
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This action cannot be undone.
                                                  This will activate{" "}
                                                  {`${advertisement?.user?.firstname} ${advertisement?.user?.lastname}'s`}{" "}
                                                  advertisement plan
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel
                                                  onClick={() =>
                                                    setLoading((prevState) =>
                                                      prevState ? false : true
                                                    )
                                                  }
                                                >
                                                  Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  className="text-white bg-slate-400 px-3 rounded-md"
                                                  //   onClick={() =>
                                                  //     handleSubscriptionApprove(
                                                  //       subscription._id
                                                  //     )
                                                  //   }
                                                >
                                                  Continue
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
      </main>
    </>
  );
};

export default Advertisement;
