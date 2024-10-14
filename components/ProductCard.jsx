
'use client'
import Link from "next/link";
import {
  Box,
  Text,
  useColorModeValue,
  Flex,
  
  Image,
  HStack,
  Stack,
  Grid,
  GridItem,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'

import numeral from "numeral"
import { DeleteIcon, Trash2 } from "lucide-react";
import { useToast } from "@components/ui/use-toast";
import { useEffect, useState } from "react";
import { useProductDeleteMutation } from "@Slices/productApiSlice";
function ProductCard({ product, handleProductFetch }) {
const {toast}=useToast()
  const { isOpen: isSubmitReviewConfirmOpen, onOpen: openSubmitReviewConfirm, onClose: closeSubmitReviewConfirm } = useDisclosure();
  const [productToDelete, setProductToDelete]=useState("")
  const [Product, setProduct]=useState({})
  const[deleteProduct]=useProductDeleteMutation()
  const handleOpenDeleteConfirm=()=>{
    openSubmitReviewConfirm()
  }

  
  const deleteUserProduct = async (e) => {
    e.preventDefault();
    closeSubmitReviewConfirm()
    try {
      const res = await deleteProduct(productToDelete).unwrap()
      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Product Deleted Successfully`,
        });
        handleProductFetch();
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
  }

  useEffect(() => {
    product?._id !== undefined && setProduct(product)
  }, [product])
  
  return (
   
    <Box
  bg={useColorModeValue('white', 'gray.800')}
  width="100%" 
  borderWidth="1px"
  rounded="lg"
  shadow="lg"
  position="relative"
>
      

  <Box
    bg={useColorModeValue('gray.100', 'gray.700')}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Link href={`/product?id=${product._id}`} passHref>
      <Image
        roundedTop="lg"
        src={product?.images[0]}
        alt={`Picture of ${product?.name}`}
        width="100%" 
         height="100%"
        objectFit="cover"
        borderRadius="md"
      />
    </Link>
  </Box>
      <Button
        style={{
          position: 'relative',
          backgroundColor: useColorModeValue('transparent', 'gray.900')
        }}
        onClick={()=>{handleOpenDeleteConfirm(); setProductToDelete(product?._id)}}
      >
        <Trash2 color="red" />
      </Button>
  <Box padding={2} textAlign="center">
    <Text fontSize={19} fontWeight="500">{product?.name}</Text>
    <Text pb={2}>UGX {numeral(product?.price).format(',')}</Text>
  </Box>



  <Modal isOpen={isSubmitReviewConfirmOpen} onClose={closeSubmitReviewConfirm}>
        <ModalOverlay />
        <ModalContent textAlign={'center'}>
          <ModalHeader >Confirm Delete Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this product?</Text>
          </ModalBody>
          <ModalFooter display="flex" justifyContent="space-between" mx={6} pb={6}>
            <Button variant={'outline'} size={'sm'} colorScheme="blue" onClick={closeSubmitReviewConfirm}>Cancel</Button>
            <Button variant={'outline'} size={'sm'} colorScheme="red"  ml={3} onClick={(e)=>deleteUserProduct(e)}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
</Box>

  );
}

export default ProductCard;
