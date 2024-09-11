
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
} from '@chakra-ui/react'

import numeral from "numeral"
function ProductCard({ product }) {
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
  <Box padding={2} textAlign="center">
    <Text fontSize={19} fontWeight="500">{product?.name}</Text>
    <Text pb={2}>UGX {numeral(product?.price).format(',')}</Text>
  </Box>
</Box>

  );
}

export default ProductCard;
