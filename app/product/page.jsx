"use client";
import { useProductGetMutation } from "@Slices/productApiSlice";
// import React from 'react'

import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import AlertBox from "@components/modals/AlertBox";
import { AlertDialog, AlertDialogTrigger } from "@components/ui/alert-dialog";
import { Button } from "@components/ui/button";
import { useToast } from "@components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Product = () => {
  // get user information stored in the localstorage
  //   const { userInfo } = useSelector((state) => state.auth);

  // create state to hold fetched Product information
  const [Product, setProduct] = useState({});

  const { toast } = useToast();

  const router = useRouter();

  // use the useSearchParam hooks from next/navigation to get url params
  const searchParam = useSearchParams();

  const param = searchParam.get("id");

  // initialize mutation function to fetch product data from database
  const [fetchProduct] = useProductGetMutation();

  // function handle fetching data
  const handleDataFetch = async () => {
    try {
      const res = await fetchProduct(param).unwrap();

      if (res?.status == "Success") {
        setProduct({ ...res?.data });
      }
    } catch (error) {
      console.log({ error });
    }
  };

  // function to delete product

  // fetch product categories
  useEffect(() => {
    handleDataFetch();
  }, []);

  return (
    <>
      <main className="max-w-full">
        <Sidenav />
        <Navbar />
        {/* <AlertBox /> */}
        <div className="flex w-full pt-12">
          <div className="w-1/5"></div>
          <div className="w-4/5 pt-4">
            {/* ------------------- main content here
            ---------------------------------------------------
            */}
            <div className="py-4 px-4">
              <div className="py-4 flex justify-end">
                {/* <Button className="mx-2 text-base bg-red-500">
                  Delete Product
                </Button> */}
                <>
                  <AlertDialog>
                    <AlertDialogTrigger>Delete Product</AlertDialogTrigger>
                  </AlertDialog>
                </>
                <Button className="mx-2 text-base">Edit Product</Button>
              </div>
              <div className="flex">
                <div className="w-6/12">
                  <div className="flex justify-center items-center px-4">
                    <img
                      src={`${Product?.images ? Product?.images[0] : ""}`}
                      alt=""
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="py-2 grid grid-cols-4">
                    {Product?.images.length > 0 ? (
                      Product?.images.map((image, index) => (
                        <div
                          key={index}
                          className="p-2 mr-2 border border-slate-100 rounded-sm flex justify-center items-center"
                        >
                          <img
                            src={`${image}`}
                            alt=""
                            className="w-full h-auto"
                          />
                        </div>
                      ))
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div className="w-6/12 px-2 py-4">
                  <div className="my-1 py-1">
                    <h2 className="text-3xl font-extrabold">{Product?.name}</h2>
                  </div>
                  <div className="my-1 py-1">
                    <p className="text-2xl">UGX {Product?.price}</p>
                  </div>
                  <div className="my-1 py-1">
                    <p className="text-lg">{Product?.category}</p>
                  </div>
                  <div className="my-1 pt-4">
                    <p className="text-lg">{Product?.description}</p>
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

export default Product;
