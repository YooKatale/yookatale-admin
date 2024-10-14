"use client";
import {
  useProductDeleteMutation,
  useProductGetMutation,
} from "@Slices/productApiSlice";
// import React from 'react'

import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import EditProduct from "@components/modals/EditProduct";

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
import { useToast } from "@components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";

import { Box, Button, Flex, Grid, Image, Text } from "@chakra-ui/react";
import ImageZoom from "@components/ImageZoom";
import { EditIcon } from "@chakra-ui/icons";
import { FormatCurr } from "@lib/utils";
const Product = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [idparam, setIdparam]=useState()
  // create state to hold fetched Product information
  const [Product, setProduct] = useState({});

  const { toast } = useToast();

  const [fetchProduct] = useProductGetMutation();
  const [deleteProduct] = useProductDeleteMutation();
  // Fetch products
  const handleDataFetch = async (id) => {
    try {
      const res = await fetchProduct(id).unwrap();
    
      if (res?.status == "Success") {
        setProduct({ ...res?.data });
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

  
  // function to control modal
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const querysearch = new URLSearchParams(window.location.search);
      const idParam = querysearch.get('id');
      if (idParam) {
        handleDataFetch(querysearch.get('id'));
      }
    }
  }, []);


  return (
    <Suspense>
      <Box mt={20}>
      {modalState && modal === "edit" && (
        <EditProduct product={Product} closeModal={setModalState} />
      )}
     
              <Flex>
              {/* Left section (Images) */}
              <Box w="50%" height={"50%"}>
                <Flex justify="center" align="center" px={4}>
                  <Image
                    src={Product?.images ? Product?.images[0] : ""}
                    alt="Product Image"
                    w="100%"
                    h="2%"
                  />
                </Flex>
                <Grid templateColumns="repeat(4, 1fr)" gap={2} py={2} mx={4}>
                  {Product?.images && Product?.images.length > 0 ? (
                    Product?.images.map((image, index) => (
                      <Box
                        key={index}
                        p={2}
                        mr={2}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="sm"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        {/* Product pictures zoom section */}
                        <ImageZoom imgSrc={image} />
                      </Box>
                    ))
                  ) : null}
                </Grid>
              </Box>

              {/* Right section (Product Details) */}
              <Box w="50%" px={2} py={4}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="2xl" fontWeight="bold" textTransform={"capitalize"}>
                    {Product?.name}
                  </Text>
                  <Button variant={"outline"} border={"1px solid #2196F3"} _hover={{bg:"#2196F3", color:"#fff"}} onClick={() => handleModal("edit")}>
                    <EditIcon mr={1}/>
                    Edit Product
                  </Button>
                </Flex>
                <Box my={1} py={1}>
                  <Text fontSize={18}>UGX { FormatCurr(Product?.price)}</Text>
                </Box>
                <Box my={1} py={1}>
                  <Text fontSize="lg">{Product?.category}</Text>
                </Box>
                <Box my={1} pt={4}>
                  <Text fontSize="lg">{Product?.description}</Text>
                </Box>
              </Box>
            </Flex>
            </Box>
    </Suspense>
  );
};

export default Product;
