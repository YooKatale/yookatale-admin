"use client";

import {
  useSubscriptionsApproveMutation,
  useSubscriptionsFetchMutation,
} from "@Slices/yoocacrdApiSlice";
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
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Subscriptions = () => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [fetchSubscriptions] = useSubscriptionsFetchMutation();
  const [approveSubscription] = useSubscriptionsApproveMutation();

  const { toast } = useToast();
  const router = useRouter();

  const handleDataFetch = async () => {
    try {
      const res = await fetchSubscriptions("pending").unwrap();
      if (res?.status === "Success") {
        setSubscriptionsData(res?.data);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: err.data?.message || err.data || err.error,
      });
    }
  };

  const handleSubscriptionApprove = async (id) => {
    setLoading(true);
    try {
      const res = await approveSubscription(id).unwrap();
      setLoading(false);
      if (res?.status === "Success") {
        toast({
          title: "Success",
          description: "Subscription approved",
        });
        await handleDataFetch();
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: err.data?.message || err.data || err.error,
      });
    }
  };

  useEffect(() => {
    handleDataFetch();
  }, []);

  return (
    <main className="max-w-full">
      <div className="flex w-full max-h-screen">
        <Sidenav />
        <Navbar />
        <div className="flex w-full pt-12">
          <div className="w-1/5"></div>
          <div className="w-4/5 pt-4">
            <div className="w-full h-full">
              <div className="px-2 py-4">
                <div className="py-2 border-b-2 border-slate-100 flex">
                  <div className="mr-2">
                    <Button className="text-md" type="button">
                      YooCards
                    </Button>
                  </div>
                </div>
                <div className="py-4 px-2">
                  <div className="flex pt-4">
                    <div className="mr-2">
                      <Button className="text-md" type="button">
                        Pending
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <div>
                      <p className="text-lg font-bold">
                        Subscriptions pending approval
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 pr-4 pb-4 pl-2 max-h-96 overflow-x-hidden overflow-y-auto">
                    {subscriptionsData.length > 0 ? (
                      <div className="border border-slate-100 rounded-md">
                        <Table>
                          <TableCaption>New Orders</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client</TableHead>
                              <TableHead>Cards</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subscriptionsData.map((subscription, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {`${subscription?.user?.firstname} ${subscription?.user?.lastname}`}
                                </TableCell>
                                <TableCell>
                                  {subscription?.cards?.length > 0 ? (
                                    subscription.cards.map((card, idx) => (
                                      <div
                                        key={idx}
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
                                    ))
                                  ) : (
                                    <p>No cards available</p>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {moment(subscription?.createdAt).fromNow()}
                                </TableCell>
                                <TableCell>
                                  <AlertDialog>
                                    <AlertDialogTrigger
                                      className="text-white bg-black px-3 py-2 rounded-md flex"
                                      onClick={() => setLoading(true)}
                                    >
                                      {isLoading && <Loader2 />}
                                      Approve
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This
                                          will activate{" "}
                                          {`${subscription?.user?.firstname} ${subscription?.user?.lastname}'s`}{" "}
                                          subscription.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel
                                          onClick={() =>
                                            setLoading(false)
                                          }
                                        >
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="text-white bg-slate-400 px-3 rounded-md"
                                          onClick={() =>
                                            handleSubscriptionApprove(
                                              subscription._id
                                            )
                                          }
                                        >
                                          Continue
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p>No subscriptions pending approval</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Subscriptions;
