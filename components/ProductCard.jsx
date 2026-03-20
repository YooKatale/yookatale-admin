"use client";

import { useState } from "react";
import {
  Box, Text, Badge, Flex, Image, Button, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
} from "@chakra-ui/react";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@components/ui/use-toast";
import { useProductDeleteMutation } from "@Slices/productApiSlice";
import EditProduct from "@components/modals/EditProduct";
import numeral from "numeral";

function ProductCard({ product, handleProductFetch }) {
  const { toast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showEdit, setShowEdit] = useState(false);
  const [deleteProduct] = useProductDeleteMutation();

  const handleDelete = async () => {
    onClose();
    try {
      const res = await deleteProduct(product._id).unwrap();
      if (res?.status === "Success") {
        toast({ title: "Product deleted" });
        handleProductFetch();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Delete failed", description: err?.data?.message || "Could not delete product" });
    }
  };

  const discount = Number(product?.discountPercentage || 0);
  const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : null;

  return (
    <>
      <Box
        bg="white" borderRadius="xl" overflow="hidden"
        border="1px solid" borderColor="gray.100"
        boxShadow="0 2px 8px rgba(0,0,0,0.06)"
        transition="all 0.2s"
        _hover={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)", borderColor: "green.200", transform: "translateY(-2px)" }}
      >
        <Box position="relative" h="160px" overflow="hidden" bg="gray.50">
          <Image src={product?.images?.[0]} alt={product?.name} w="100%" h="100%" objectFit="cover"
            fallbackSrc="https://via.placeholder.com/300x200?text=No+Image" />
          {discount > 0 && (
            <Badge position="absolute" top={2} right={2} colorScheme="red" borderRadius="full" px={2} fontSize="10px" fontWeight="700">
              -{discount}%
            </Badge>
          )}
          {product?.category && (
            <Badge position="absolute" top={2} left={2} colorScheme="green" borderRadius="full" px={2} fontSize="10px" fontWeight="700">
              {product.category}
            </Badge>
          )}
        </Box>

        <Box p={3}>
          <Text fontWeight="700" fontSize="sm" color="gray.800" noOfLines={2} mb={1} lineHeight="1.3">{product?.name}</Text>
          <Flex align="center" gap={2} mb={3}>
            {discountedPrice ? (
              <>
                <Text fontSize="sm" fontWeight="800" color="green.600">UGX {numeral(discountedPrice).format(",")}</Text>
                <Text fontSize="xs" color="gray.400" textDecoration="line-through">UGX {numeral(product.price).format(",")}</Text>
              </>
            ) : (
              <Text fontSize="sm" fontWeight="700" color="gray.700">UGX {numeral(product?.price).format(",")}</Text>
            )}
          </Flex>
          <HStack spacing={2}>
            <Button flex={1} size="xs" leftIcon={<Pencil size={12} />} variant="outline" borderRadius="lg" fontWeight="600"
              borderColor="gray.200" color="gray.600" _hover={{ borderColor: "#185f2d", color: "#185f2d" }}
              onClick={() => setShowEdit(true)}>
              Edit
            </Button>
            <Button flex={1} size="xs" leftIcon={<Trash2 size={12} />} colorScheme="red" variant="ghost" borderRadius="lg" fontWeight="600"
              onClick={onOpen}>
              Delete
            </Button>
          </HStack>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader fontSize="md" fontWeight="700">Delete Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody fontSize="sm" color="gray.600">
            Are you sure you want to delete <strong>{product?.name}</strong>? This cannot be undone.
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="outline" size="sm" borderRadius="lg" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" size="sm" borderRadius="lg" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {showEdit && (
        <EditProduct product={product} closeModal={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); handleProductFetch(); }} />
      )}
    </>
  );
}

export default ProductCard;
