"use client";

import React, { useState } from "react";
import {
  useFetchStoresQueueQuery,
} from "@Slices/sellerStoresApiSlice";
import {
  Box,
  Heading,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  useDisclosure,
  Input,
  HStack,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import StoreApprovalModal from "@components/modals/StoreApprovalModal";
import { SearchIcon, ViewIcon } from "@chakra-ui/icons";

export default function SellerStoresPage() {
  const [status, setStatus] = useState("pending");
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: stores, isLoading, isError, error, refetch } = useFetchStoresQueueQuery(status);

  const handleViewDetails = (store) => {
    setSelectedStore(store);
    onOpen();
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const filteredStores = stores?.filter((store) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      store.name?.toLowerCase().includes(query) ||
      store.sellerId?.email?.toLowerCase().includes(query) ||
      store.locationId?.name?.toLowerCase().includes(query) ||
      [store.sellerId?.firstname, store.sellerId?.lastname]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Box marginTop={20} px={4} maxW="7xl" mx="auto">
      <Heading size="lg" mb={6} textAlign="center">
        Seller Stores Queue
      </Heading>

      {/* Search and Filters */}
      <HStack mb={6} spacing={4} flexWrap="wrap">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search stores by name, seller, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Tabs index={status === "pending" ? 0 : status === "approved" ? 1 : 2} onChange={(index) => {
          const statuses = ["pending", "approved", "rejected"];
          setStatus(statuses[index]);
        }}>
          <TabList>
            <Tab>Pending</Tab>
            <Tab>Approved</Tab>
            <Tab>Rejected</Tab>
          </TabList>
        </Tabs>
      </HStack>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading stores...
          </Text>
        </Box>
      ) : isError ? (
        <Alert status="error">
          <AlertIcon />
          {error?.message || "Failed to load stores"}
        </Alert>
      ) : filteredStores.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500">
            {searchQuery ? "No stores match your search." : `No ${status} stores found.`}
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Store Name</Th>
                <Th>Seller</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStores.map((store) => (
                <Tr key={store._id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{store.name}</Td>
                  <Td>
                    {store.sellerId
                      ? [store.sellerId.firstname, store.sellerId.lastname]
                          .filter(Boolean)
                          .join(" ") || store.sellerId.email
                      : "—"}
                  </Td>
                  <Td>{store.locationId?.name ?? store.addressLine ?? "—"}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(store.status)}>
                      {store.status?.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(store)}
                      colorScheme="blue"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {selectedStore && (
        <StoreApprovalModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedStore(null);
          }}
          store={selectedStore}
          onSuccess={handleModalSuccess}
        />
      )}
    </Box>
  );
}
