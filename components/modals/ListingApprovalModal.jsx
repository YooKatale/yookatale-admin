"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Heading,
  SimpleGrid,
  Image,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  useApproveListingMutation,
  useRejectListingMutation,
} from "@Slices/sellerListingsApiSlice";
import { Package, MapPin, User, DollarSign, Tag, Image as ImageIcon } from "lucide-react";

const ListingApprovalModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [approveListing, { isLoading: isApproving }] = useApproveListingMutation();
  const [rejectListing, { isLoading: isRejecting }] = useRejectListingMutation();
  const toast = useToast();

  const handleApprove = async () => {
    try {
      await approveListing(listing._id).unwrap();
      toast({
        title: "Listing Approved",
        description: `${listing.title} has been approved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to approve listing",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await rejectListing({ listingId: listing._id, reason: rejectReason }).unwrap();
      toast({
        title: "Listing Rejected",
        description: `${listing.title} has been rejected.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setRejectReason("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to reject listing",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!listing) return null;

  const sellerName = listing.sellerId
    ? [listing.sellerId.firstname, listing.sellerId.lastname]
        .filter(Boolean)
        .join(" ") || listing.sellerId.email
    : "—";

  const statusColor =
    listing.status === "approved"
      ? "green"
      : listing.status === "rejected"
      ? "red"
      : "yellow";

  const images = listing.images || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack>
            <Package size={24} />
            <Text>Listing Details</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Listing Title & Status */}
            <Box>
              <Heading size="md" mb={2}>
                {listing.title}
              </Heading>
              <Badge colorScheme={statusColor} fontSize="sm">
                {listing.status?.toUpperCase()}
              </Badge>
            </Box>

            <Divider />

            {/* Images Gallery */}
            {images.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                  <ImageIcon size={18} />
                  Images ({images.length})
                </Text>
                <Wrap spacing={2}>
                  {images.map((img, idx) => (
                    <WrapItem key={idx}>
                      <Image
                        src={img}
                        alt={`${listing.title} - Image ${idx + 1}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/100"
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Description */}
            {listing.description && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Description
                </Text>
                <Text color="gray.600">{listing.description}</Text>
              </Box>
            )}

            <Divider />

            {/* Seller Information */}
            <Box>
              <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                <User size={18} />
                Seller Information
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>Name:</strong> {sellerName}
                </Text>
                {listing.sellerId?.email && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Email:</strong> {listing.sellerId.email}
                  </Text>
                )}
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Listing Details */}
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                  <DollarSign size={18} />
                  Price
                </Text>
                <Text fontSize="lg" color="green.600" fontWeight="bold">
                  UGX {(listing.price ?? 0).toLocaleString()}
                </Text>
              </Box>

              {listing.categoryId && (
                <Box>
                  <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                    <Tag size={18} />
                    Category
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {listing.categoryId.name || listing.categoryId}
                  </Text>
                </Box>
              )}
            </SimpleGrid>

            {/* Location */}
            {listing.locationId && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                    <MapPin size={18} />
                    Location
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {listing.locationId.name || listing.locationId}
                  </Text>
                </Box>
              </>
            )}

            {/* Additional Details */}
            {listing.quantity && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="semibold" mb={1}>Quantity Available</Text>
                  <Text fontSize="sm" color="gray.600">{listing.quantity}</Text>
                </Box>
              </>
            )}

            {/* Rejection Reason Input (only for pending listings) */}
            {listing.status === "pending" && (
              <>
                <Divider />
                <FormControl>
                  <FormLabel>Rejection Reason (if rejecting)</FormLabel>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                  />
                </FormControl>
              </>
            )}

            {/* Rejection Reason Display (if rejected) */}
            {listing.status === "rejected" && listing.rejectionReason && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="semibold" mb={1} color="red.600">
                    Rejection Reason
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {listing.rejectionReason}
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {listing.status === "pending" && (
              <>
                <Button
                  colorScheme="red"
                  onClick={handleReject}
                  isLoading={isRejecting}
                  loadingText="Rejecting..."
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={isApproving}
                  loadingText="Approving..."
                >
                  Approve
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ListingApprovalModal;
