"use client";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useOrdersAllQuery } from "@Slices/ordersDeliveryApiSlice";
import { Search } from "lucide-react";
import moment from "moment";
import { useState } from "react";

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrdersAllQuery();
  const [searchInput, setSearchInput] = useState("");

  const filteredOrders = searchInput
    ? orders.filter(
        (o) =>
          o?.deliveryAddress?.address1?.toLowerCase().includes(searchInput.toLowerCase()) ||
          o?.user?.firstname?.toLowerCase().includes(searchInput.toLowerCase()) ||
          o?.user?.lastname?.toLowerCase().includes(searchInput.toLowerCase()) ||
          o?.user?.email?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : orders;

  if (isLoading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.600">Loading orders...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" color="gray.800">
          Orders
        </Heading>
        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Text fontSize="sm" color="gray.600">
                {filteredOrders.length} order(s)
              </Text>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Search size={18} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Search by address or customer..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  borderRadius="lg"
                />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {filteredOrders.length > 0 ? (
              <Box overflowX="auto">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, idx) => (
                      <TableRow key={order?._id || idx} _hover={{ bg: "gray.50" }}>
                        <TableCell fontWeight="600">
                          {order?.user?.firstname} {order?.user?.lastname}
                        </TableCell>
                        <TableCell>{order?.productItems || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            colorScheme={
                              order?.paymentMethod === "card"
                                ? "blue"
                                : order?.paymentMethod === "mobileMoney"
                                ? "green"
                                : "orange"
                            }
                            borderRadius="full"
                          >
                            {order?.paymentMethod || order?.payment?.paymentMethod || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell fontWeight="600" color="green.600">
                          UGX {order?.total?.toLocaleString?.() || "0"}
                        </TableCell>
                        <TableCell fontSize="sm" color="gray.600">
                          {moment(order?.createdAt).fromNow()}
                        </TableCell>
                        <TableCell fontSize="sm" color="gray.600">
                          {order?.deliveryAddress?.address1 || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Center py={12}>
                <Text color="gray.500">No orders found</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
