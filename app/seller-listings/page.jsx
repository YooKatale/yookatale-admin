"use client";

import React, { useState } from "react";
import {
  useFetchListingsQueueQuery,
} from "@Slices/sellerListingsApiSlice";
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
import ListingApprovalModal from "@components/modals/ListingApprovalModal";
import { SearchIcon, ViewIcon } from "@chakra-ui/icons";

export default function SellerListingsPage() {
  const [status, setStatus] = useState("pending");
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: listings, isLoading, isError, error, refetch } = useFetchListingsQueueQuery(status);

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    onOpen();
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const filteredListings = listings?.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title?.toLowerCase().includes(query) ||
      listing.sellerId?.email?.toLowerCase().includes(query) ||
      listing.categoryId?.name?.toLowerCase().includes(query) ||
      [listing.sellerId?.firstname, listing.sellerId?.lastname]
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
        Seller Listings Queue
      </Heading>

      {/* Search and Filters */}
      <HStack mb={6} spacing={4} flexWrap="wrap">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search listings by title, seller, or category..."
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
            Loading listings...
          </Text>
        </Box>
      ) : isError ? (
        <Alert status="error">
          <AlertIcon />
          {error?.message || "Failed to load listings"}
        </Alert>
      ) : filteredListings.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500">
            {searchQuery ? "No listings match your search." : `No ${status} listings found.`}
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Seller</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredListings.map((listing) => (
                <Tr key={listing._id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{listing.title}</Td>
                  <Td>
                    {listing.sellerId
                      ? [listing.sellerId.firstname, listing.sellerId.lastname]
                          .filter(Boolean)
                          .join(" ") || listing.sellerId.email
                      : "—"}
                  </Td>
                  <Td>{listing.categoryId?.name ?? "—"}</Td>
                  <Td>UGX {(listing.price ?? 0).toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(listing.status)}>
                      {listing.status?.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(listing)}
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

      {selectedListing && (
        <ListingApprovalModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onSuccess={handleModalSuccess}
        />
      )}
    </Box>
  );
}
