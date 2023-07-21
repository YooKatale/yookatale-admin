import React from "react";
import { Button } from "./ui/button";
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
} from "./ui/alert-dialog";

const SubscriptionCard = ({ card }) => {
  const handleDataDelete = () => {};
  return (
    <>
      <div className="div">
        <div className="px-4 py-2 border border-slate-100 rounded-md mx-2 my-2">
          <div className="py-2 border-b-2 border-slate-100">
            <h3 className="text-lg font-bold">
              YooCard{" "}
              <span className="text-lg font-bold text-teal-700 capitalize">
                {card?.type}
              </span>
            </h3>
            <h3 className="text-lg mt-1">{card?.name}</h3>
          </div>
          <div className="pt-4 pb-6 border-b-2 border-slate-100 pl-2">
            {card?.details.map((detail, index) => (
              <p key={index} className="text-md my-2">
                {detail}
              </p>
            ))}
          </div>
          <div className="py-2">
            <div className="flex">
              {card?.previousPrice !== 0 && (
                <h3 className="text-md mt-1 line-through">
                  UGX{card?.previousPrice}
                </h3>
              )}
              {card?.price !== 0 && (
                <h3 className="text-lg mx-2 font-bold">UGX{card?.price}</h3>
              )}
            </div>
            <div className="py-2 flex">
              <div className="mr-2">
                <>
                  <AlertDialog>
                    <AlertDialogTrigger className="text-white bg-red-500 px-3 py-2 rounded-md">
                      Delete Product
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete {card ? card?.name : ""} card
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="text-white bg-red-500 px-3 rounded-md"
                          onClick={handleDataDelete}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              </div>
              <div className="">
                <Button className={"text-md"}>Edit Card</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionCard;
