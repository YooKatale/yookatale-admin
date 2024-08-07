"use client";

import {
  useNewsblogDeleteMutation,
  useNewsblogFetchMutation,
} from "@Slices/newsblogApiSlice";
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
import { useToast } from "@components/ui/use-toast";
import moment from "moment";
//import { useRouter, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";

const NewsblogPage = () => {
  const [deleteNewsblog] = useNewsblogDeleteMutation();
  const [fetchNewsblog] = useNewsblogFetchMutation();
const [queryParameters, setqueryParameters]=useState()
  // create state to hold fetched Newsblog information
  const [Newsblog, setNewsblog] = useState({});
  const [idparam, setIdparam]=useState()

  const { toast } = useToast();

  const router = useRouter();

  // use the useSearchParam hooks from next/navigation to get url params
  //const searchParam = useSearchParams();

 // const param = searchParam.get("id");

// const param =queryParameters.get("id")

  const handleDataFetch = async () => {
    try {
      const res = await fetchNewsblog(idparam).unwrap();

      if (res.status == "Success") {
        setNewsblog(res.data);
      }
    } catch (error) {}
  };

  // function handle fetching data
  const handleDataDelete = async () => {
    try {
      const res = await deleteNewsblog(idparam).unwrap();

      if (res?.status == "Success") {
        toast({
          variant: "teal",
          title: "Success",
          description: "Newsblog deleted successfully",
        });

        router.push("/newsblogs");
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const querysearch = new URLSearchParams(window.location.search);
      const idParam = querysearch.get('id');
      
      if (idParam) {
        setIdparam(idParam);
        handleDataFetch();
      }
    }
  }, [setIdparam, handleDataFetch]);

  return (
    <Suspense>
      <main className="max-w-full">
        <div className="flex w-full">
          <Sidenav />
          <Navbar />
          <div className="flex w-full pt-12">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              {/* ------------------- main content here
            ---------------------------------------------------
            */}
              <div className="px-2 py-4">
                <div className="p-2 flex justify-between">
                  <div>{/* <p className="text-xl">Newsblogs</p> */}</div>
                  <div className="flex justify-end">
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger className="text-white bg-red-500 px-3 py-2 rounded-md">
                          Delete Newsblog
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the newsblog
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
                </div>
                <div className="py-6 px-2">
                  <div className="flex">
                    <div className="m-auto w-4/5">
                      <div className="py-2">
                        <div className="w-2/5">
                          <img
                            src={`${
                              Newsblog
                                ? Newsblog?.image
                                  ? Newsblog?.image
                                  : ""
                                : ""
                            }`}
                            alt="Newsblog image"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="py-2">
                        <h1 className="text-3xl font-bold">
                          {Newsblog
                            ? Newsblog?.title
                              ? Newsblog?.title
                              : "__"
                            : "__"}
                        </h1>
                      </div>
                      <div className="flex">
                        <div className="mr-2">
                          <p className="text-lg">
                            {moment(
                              Newsblog
                                ? Newsblog?.createdAt
                                  ? Newsblog?.createdAt
                                  : new Date()
                                : new Date()
                            ).fromNow()}
                          </p>
                        </div>
                        <div className="mr-2">
                          <p className="text-lg text-gray-500 font-bold">
                            -
                            {Newsblog
                              ? Newsblog?.author
                                ? Newsblog?.author
                                : "__"
                              : "__"}
                          </p>
                        </div>
                      </div>
                      <div
                        className="py-4"
                        dangerouslySetInnerHTML={{
                          __html: Newsblog
                            ? Newsblog?.blog
                              ? Newsblog?.blog
                              : "__"
                            : "__",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
};

export default NewsblogPage;
