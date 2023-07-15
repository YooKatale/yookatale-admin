"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Sidenav from "@/components/Sidenav";
import AddProduct from "@/components/modals/AddProduct";
import { Button } from "@/components/ui/button";
import { useProductsGetMutation } from "@Slices/productApiSlice";
import Image from "next/image";
import { useEffect, useState } from "react";

const Products = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [Products, setProducts] = useState([]);

  const [fetchProducts] = useProductsGetMutation();

  const handleProductFetch = async () => {
    try {
      const res = await fetchProducts().unwrap();

      if (res.status == "Success") {
        setProducts(res.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    handleProductFetch();
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
      {modalState && modal === "addProduct" ? (
        <AddProduct closeModal={setModalState} />
      ) : (
        <></>
      )}
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
                  <div>{/* <p className="text-xl">Products</p> */}</div>
                  <div className="flex justify-end">
                    <Button
                      className="mx-2 text-lg"
                      onClick={() => handleModal("addProduct")}
                    >
                      Add new product
                    </Button>
                  </div>
                </div>
                <div className="py-4 px-2">
                  <div className="grid grid-cols-5 py-4">
                    {Products?.length > 0 ? (
                      Products.map((product, index) => (
                        <ProductCard key={index} product={product} />
                      ))
                    ) : (
                      <>
                        <div className="py-8">
                          <p className="text-lg">No products currently</p>
                        </div>
                      </>
                    )}
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

export default Products;
