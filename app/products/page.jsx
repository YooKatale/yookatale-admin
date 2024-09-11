"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Sidenav from "@/components/Sidenav";
import AddProduct from "@/components/modals/AddProduct";

import { useProductsGetMutation } from "@Slices/productApiSlice";
import { Box, Button, Flex, Grid, GridItem, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { PlusIcon } from "lucide-react";
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


  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  const closeModalFromCHild=()=>{
    setModalState()
    handleProductFetch();
  }
  return (
    <Flex minH={'100vh'} style={{ marginTop: '4em' }}>
      <Stack mx={'auto'} width={'100%'} py={4} px={1}>
    
     
      {modalState && modal === "addProduct" ? (
        <AddProduct closeModal={closeModalFromCHild} />
      ) : (
        <></>
      )}
        <div className="p-2 flex justify-between" style={{
          backgroundColor: 'white',
          padding: 8,
        }}>
          <div className="flex" style={{ padding: 10 }}>
            <Heading size={'lg'} style={{ fontSize: 20, fontWeight: '500' }}>Add new product</Heading>
          </div>
          <div className="flex justify-end" >
            <Button
              type='submit'
              size="md"
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
              onClick={() => handleModal("addProduct")}
            >
              <PlusIcon size={15} /> New product
            </Button>
          </div>
        </div>
                

        <div className="py-4 px-2">
          {Products?.length > 0 ? (
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={4}
            >
              {Products.map((product, index) => (
                <GridItem key={index}>
                  <ProductCard product={product} />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box py={14} w="full">
              <Text fontSize="2xl" textAlign="center">
                No products currently
              </Text>
            </Box>
          )}
        </div>

            
    
    </Stack>
    </Flex>
  );
};

export default Products;
