"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Sidenav from "@/components/Sidenav";
import AddProduct from "@/components/modals/AddProduct";
import { Button } from "@/components/ui/button";
import { useProductsGetMutation } from "@Slices/productApiSlice";
import { Box, useColorModeValue } from "@chakra-ui/react";
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
    <Box
    bg={useColorModeValue('gray.90', 'white.900')}
          boxShadow={'lg'}
          marginTop={"10"}
    >
     
      {modalState && modal === "addProduct" ? (
        <AddProduct closeModal={setModalState} />
      ) : (
        <></>
      )}
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
                  {Products?.length > 0 ? (
                    <div className="grid grid-cols-5 py-4">
                      {Products.map((product, index) => (
                        <ProductCard key={index} product={product} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="py-14 w-full">
                        <p className="text-2xl text-center">
                          No products currently
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
    </Box>
  );
};

export default Products;
