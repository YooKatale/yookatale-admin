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
} from "@chakra-ui/react";
import { useDriversByLocationQuery } from "@Slices/ordersDeliveryApiSlice";
import { useFetchPartnersQuery } from "@Slices/partnersPageApiSlice";
import { Search } from "lucide-react";
import moment from "moment";
import { useState } from "react";

export default function DriversPage() {
  const { data: partners = [], isLoading } = useFetchPartnersQuery();
  const [searchInput, setSearchInput] = useState("");

  const filteredPartners = searchInput
    ? partners.filter(
        (p) =>
          p?.fullname?.toLowerCase().includes(searchInput.toLowerCase()) ||
          p?.location?.toLowerCase().includes(searchInput.toLowerCase()) ||
          p?.phone?.includes(searchInput) ||
          p?.email?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : partners;

  if (isLoading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.600">Loading drivers...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" color="gray.800">
          Drivers
        </Heading>
        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Text fontSize="sm" color="gray.600">
                {filteredPartners.length} driver(s)
              </Text>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Search size={18} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, location, phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  borderRadius="lg"
                />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {filteredPartners.length > 0 ? (
              <Box overflowX="auto">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Transport</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner, idx) => (
                      <TableRow key={partner?._id || idx} _hover={{ bg: "gray.50" }}>
                        <TableCell fontWeight="600">{partner?.fullname || partner?.name || "—"}</TableCell>
                        <TableCell>{partner?.phone || "—"}</TableCell>
                        <TableCell>{partner?.email || "—"}</TableCell>
                        <TableCell fontSize="sm" color="gray.600">{partner?.location || "—"}</TableCell>
                        <TableCell>{partner?.transport || partner?.numberPlate || "—"}</TableCell>
                        <TableCell>{partner?.status || "—"}</TableCell>
                        <TableCell fontSize="sm" color="gray.600">
                          {partner?.createdAt ? moment(partner.createdAt).fromNow() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Center py={12}>
                <Text color="gray.500">No drivers found</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
