
'use client'
import Link from "next/link";
import {
  Box,
  Text,
  useColorModeValue,
  Flex,
  
  Image,
} from '@chakra-ui/react'


function ProductCard({ product }) {
  return (
    <Flex p={2} w="full" alignItems="center" justifyContent="center">
      <Box
    
        bg={useColorModeValue('white', 'gray.800')}
        maxW="sm"
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative">
        <Box 
            bg={useColorModeValue('gray.100', 'gray.700')}
            alignItems="center"
            justifyContent="center"
          >
            <Link href={`/product?id=${product._id}`} passHref>
              <Image
              roundedTop="lg"
                src={product?.images[0]}
                alt={`Picture of ${product?.name}`}                
                style={{height:'130px', width:"180px"}}
                objectFit="cover"
                borderRadius="md"
              />
            </Link>
          </Box>
        <Box p="6" >        
          <Flex mt="1" justifyContent="space-between" alignContent="center">
            <Text>{product?.name}</Text>
          </Flex>
          <Flex justifyContent="space-between" alignContent="center">
          <Text> UGX {product?.price}</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

export default ProductCard;
